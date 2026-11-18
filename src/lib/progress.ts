import {
  allAssignments,
  allResources,
  courseUnits,
  getAssignment,
  getUnit,
  projectMilestones,
} from "./course";
import type {
  AppState,
  Attempt,
  CompletionGroup,
  CourseUnit,
  Resource,
} from "./model";

export function latestAttempt(
  assignmentId: string,
  attempts: Attempt[],
): Attempt | undefined {
  if (!getAssignment(assignmentId)) return undefined;
  return attempts.reduce<Attempt | undefined>((latest, attempt) => {
    if (attempt.assignmentId !== assignmentId) return latest;
    return !latest ||
      Date.parse(attempt.submittedAt) >= Date.parse(latest.submittedAt)
      ? attempt
      : latest;
  }, undefined);
}

export function groupPassed(
  group: CompletionGroup,
  attempts: Attempt[],
): boolean {
  return group.assignments.some((assignment) => {
    const latest = latestAttempt(assignment.id, attempts);
    if (!latest) return false;
    return latest.score === null
      ? latest.kind === "passed"
      : latest.score >= 70;
  });
}

export function unitProgress(
  unit: CourseUnit,
  attempts: Attempt[],
): { passed: number; total: number } {
  return {
    passed: unit.groups.filter((group) => groupPassed(group, attempts)).length,
    total: unit.groups.length,
  };
}

export function getProgress(state: AppState) {
  const groups = courseUnits.flatMap((unit) => unit.groups);
  const passed = groups.filter((group) =>
    groupPassed(group, state.attempts),
  ).length;
  const submitted = groups.filter((group) =>
    group.assignments.some((assignment) =>
      latestAttempt(assignment.id, state.attempts),
    ),
  ).length;
  const taskUnits = new Map<string, string>(
    [...allResources, ...allAssignments].map((task) => [task.id, task.unitId]),
  );
  for (const milestone of projectMilestones)
    taskUnits.set(milestone.id, "project");
  const studySeconds = state.sessions.reduce((seconds, session) => {
    if (
      !getUnit(session.unitId) ||
      taskUnits.get(session.taskId) !== session.unitId
    )
      return seconds;
    return seconds + session.elapsedSeconds;
  }, 0);
  return {
    passed,
    total: groups.length,
    percent: (passed / groups.length) * 100,
    submitted,
    resourcesCompleted: allResources.filter(
      (resource) => state.resources[resource.id] === true,
    ).length,
    resourcesTotal: allResources.length,
    studySeconds,
  };
}

export type SuggestedTask = {
  id: string;
  unitId: string;
  title: string;
  url: string;
  kind: Resource["kind"] | "assignment" | "project";
};

export function nextTask(state: AppState): SuggestedTask | null {
  for (const unit of courseUnits) {
    const incomplete = unit.groups.filter(
      (group) => !groupPassed(group, state.attempts),
    );
    if (unit.groups.length > 0 && incomplete.length === 0) continue;
    const resource = unit.resources.find(
      (item) => item.kind === "lecture" && !state.resources[item.id],
    );
    if (resource)
      return {
        id: resource.id,
        unitId: unit.id,
        title: resource.title,
        url: resource.url,
        kind: resource.kind,
      };
    const group = incomplete[0];
    if (group) {
      // Preserve both histories. Continue a recorded challenge attempt; otherwise offer standard.
      const attempted = group.assignments.filter((assignment) =>
        latestAttempt(assignment.id, state.attempts),
      );
      const assignment =
        attempted.sort(
          (a, b) =>
            Date.parse(latestAttempt(b.id, state.attempts)!.submittedAt) -
            Date.parse(latestAttempt(a.id, state.attempts)!.submittedAt),
        )[0] ??
        group.assignments.find((item) => item.difficulty === "standard") ??
        group.assignments[0]!;
      return {
        id: assignment.id,
        unitId: unit.id,
        title: assignment.title,
        url: assignment.url,
        kind: unit.id === "project" ? "project" : "assignment",
      };
    }
  }
  return null;
}
