import { describe, expect, it } from "vitest";
import {
  allAssignments,
  allResources,
  CATALOG_VERIFIED_AT,
  COURSE_EDITION,
  courseUnits,
  getAssignment,
  getUnit,
  projectMilestones,
  SELF_REPORTED_RESULT_SOURCE,
} from "./course";

describe("CS50x 2026 course catalog", () => {
  it("pins the verified edition and expresses 27 problem-set groups plus the final project", () => {
    expect(COURSE_EDITION).toBe(2026);
    expect(CATALOG_VERIFIED_AT).toBe("2026-11-16");
    expect(courseUnits.map((unit) => [unit.id, unit.groups.length])).toEqual([
      ["week-0", 1],
      ["week-1", 3],
      ["week-2", 3],
      ["week-3", 3],
      ["week-4", 3],
      ["week-5", 2],
      ["week-6", 5],
      ["week-7", 3],
      ["week-8", 2],
      ["week-9", 2],
      ["week-10", 0],
      ["project", 1],
    ]);
    expect(allAssignments).toHaveLength(35);
    expect(
      new Set(allAssignments.map((assignment) => assignment.id)).size,
    ).toBe(35);
    expect(SELF_REPORTED_RESULT_SOURCE).toBe("self-reported");
  });

  it("distinguishes C preparation, submitted C Hello, and Python Hello", () => {
    expect(getAssignment("week-1-world")).toBeUndefined();
    expect(getAssignment("week-1-hello")?.url).toBe(
      "https://cs50.harvard.edu/x/2026/psets/1/me/",
    );
    expect(getAssignment("week-6-hello")?.url).toBe(
      "https://cs50.harvard.edu/x/2026/psets/6/hello/",
    );
    expect(getAssignment("week-1-mario-less")?.groupId).toBe("week-1-mario");
    expect(getAssignment("week-6-mario-more")?.groupId).toBe("week-6-mario");
  });

  it("offers the standard alternative first while retaining both", () => {
    const choices = courseUnits
      .flatMap((unit) => unit.groups)
      .filter((group) => group.assignments.length > 1);
    expect(
      choices.map((group) =>
        group.assignments.map((assignment) => assignment.id),
      ),
    ).toEqual([
      ["week-1-mario-less", "week-1-mario-more"],
      ["week-1-cash", "week-1-credit"],
      ["week-2-caesar", "week-2-substitution"],
      ["week-3-runoff", "week-3-tideman"],
      ["week-4-filter-less", "week-4-filter-more"],
      ["week-6-mario-less", "week-6-mario-more"],
      ["week-6-cash", "week-6-credit"],
    ]);
    for (const group of choices)
      expect(group.assignments.map((item) => item.difficulty)).toEqual([
        "standard",
        "challenge",
      ]);
  });

  it("inventories real lectures, available sections, and shorts separately", () => {
    expect(allResources).toHaveLength(65);
    expect(
      allResources.filter((resource) => resource.kind === "lecture"),
    ).toHaveLength(11);
    expect(
      allResources.filter((resource) => resource.kind === "short"),
    ).toHaveLength(45);
    expect(
      allResources
        .filter((resource) => resource.kind === "section")
        .map((resource) => resource.unitId),
    ).toEqual([
      "week-1",
      "week-2",
      "week-3",
      "week-4",
      "week-5",
      "week-6",
      "week-7",
      "week-8",
      "week-9",
    ]);
    expect(new Set(allResources.map((resource) => resource.id)).size).toBe(65);
    expect(
      allResources.find(
        (resource) => resource.id === "week-8-short-internet-primer",
      ),
    ).toMatchObject({
      title: "Internet Primer",
      url: "https://cs50.harvard.edu/x/2026/shorts/internet_primer/",
      minutes: 20,
    });
    expect(
      allResources.find((resource) => resource.id === "week-9-section")?.url,
    ).toBe("https://cs50.harvard.edu/x/2026/sections/9/");
    expect(
      getUnit("week-10")?.resources.map((resource) => resource.kind),
    ).toEqual(["lecture"]);
    for (const task of [...allResources, ...allAssignments])
      expect(task.url.startsWith("https://cs50.harvard.edu/x/2026/")).toBe(
        true,
      );
  });

  it("keeps project planning milestones outside its single graded group", () => {
    expect(projectMilestones.map((milestone) => milestone.id)).toEqual([
      "scope",
      "prototype",
      "build",
      "documentation",
      "demo",
      "submit",
      "gradebook",
    ]);
    expect(getUnit("project")?.groups.map((group) => group.id)).toEqual([
      "project",
    ]);
    expect(getAssignment("project")?.url).toBe(
      "https://cs50.harvard.edu/x/2026/project/",
    );
    expect(getUnit("unknown")).toBeUndefined();
    expect(getAssignment("unknown")).toBeUndefined();
  });
});
