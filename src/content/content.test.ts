import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { flowSchema } from "../lib/flow";
import { displayOrder } from "../lib/shuffle";
import type {
  Exercise,
  Interaction,
  RecallQuestion,
  WeekContent,
} from "./types";

const flow = flowSchema.parse(
  JSON.parse(readFileSync("public/course/2026/flow.json", "utf8")),
);
const modules = import.meta.glob<{ default: WeekContent }>("./week-*.ts", {
  eager: true,
});
const weeks = Object.values(modules).map((module) => module.default);
const words = (text: string) => text.trim().split(/\s+/).length;
const demos = ["binary", "loops", "search", "memory", "stack", "sql", "http"];

function checkChoice(item: {
  options: string[];
  answer: number;
  explanation: string;
}) {
  expect(item.options.length).toBeGreaterThanOrEqual(2);
  expect(item.options.length).toBeLessThanOrEqual(4);
  expect(new Set(item.options).size).toBe(item.options.length);
  expect(item.answer).toBeGreaterThanOrEqual(0);
  expect(item.answer).toBeLessThan(item.options.length);
  expect(words(item.explanation)).toBeGreaterThanOrEqual(6);
}

function checkInteraction(item: Interaction) {
  if (item.kind === "predict") checkChoice(item);
  if (item.kind === "blank") {
    checkChoice(item);
    expect(item.code.split("____").length).toBe(2);
  }
  if (item.kind === "compare") {
    expect(item.a.code).not.toBe(item.b.code);
    expect(words(item.explanation)).toBeGreaterThanOrEqual(6);
  }
  if (item.kind === "trace") {
    const lines = item.code.split("\n").length;
    expect(item.steps.length).toBeGreaterThanOrEqual(3);
    for (const step of item.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(lines);
    }
    expect(words(item.caption)).toBeGreaterThanOrEqual(4);
  }
  if (item.kind === "demo") expect(demos).toContain(item.demo);
}

function checkExercise(exercise: Exercise) {
  expect(words(exercise.prompt)).toBeGreaterThanOrEqual(12);
  expect(exercise.hints.length).toBeGreaterThanOrEqual(1);
  expect(exercise.solution.trim().length).toBeGreaterThan(0);
}

function checkRecall(
  questions: RecallQuestion[],
  prefix: string,
  minimum: number,
) {
  expect(questions.length).toBeGreaterThanOrEqual(minimum);
  for (const question of questions) {
    expect(question.id.startsWith(prefix)).toBe(true);
    checkChoice(question);
  }
}

describe("week content", () => {
  it("covers every week that has a lecture", () => {
    expect(weeks.map((week) => week.unitId).sort()).toEqual(
      Object.keys(flow.units).sort(),
    );
  });

  it("uses each identifier once", () => {
    const ids = weeks
      .flatMap((week) => [
        ...Object.values(week.parts).flatMap((part) => [
          ...Object.values(part.after).flat(),
          part.recap,
          ...part.recall,
        ]),
        ...Object.values(week.shorts).flatMap((clip) => clip.recall),
        ...(week.section?.recall ?? []),
      ])
      .map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shows the right answer in varied positions, so the first option is not a safe guess", () => {
    const questions = weeks.flatMap((week) => [
      ...Object.values(week.parts).flatMap((part) => [
        ...Object.values(part.after).flat(),
        part.recap,
        ...part.recall,
      ]),
      ...Object.values(week.shorts).flatMap((clip) => clip.recall),
      ...(week.section?.recall ?? []),
    ]);
    const positions = [0, 0, 0, 0];
    let total = 0;
    for (const question of questions) {
      if (!("options" in question)) continue;
      const order = displayOrder(question.prompt, question.options.length);
      expect([...order].sort()).toEqual(question.options.map((_, i) => i));
      expect(displayOrder(question.prompt, question.options.length)).toEqual(
        order,
      );
      positions[order.indexOf(question.answer)]!++;
      total++;
    }
    expect(total).toBeGreaterThan(600);
    expect(Math.max(...positions) / total).toBeLessThan(0.45);
  });

  for (const week of weeks) {
    const unit = flow.units[week.unitId]!;
    describe(week.unitId, () => {
      it("has content for every lecture part and nothing else", () => {
        expect(Object.keys(week.parts).sort()).toEqual(
          unit.lecture.parts.map((part) => part.id).sort(),
        );
      });

      for (const part of unit.lecture.parts) {
        it(`${part.id} teaches with interactions tied to its own notes`, () => {
          const content = week.parts[part.id]!;
          expect(words(content.hook)).toBeGreaterThanOrEqual(30);
          expect(words(content.hook)).toBeLessThanOrEqual(80);
          const headingIds = part.headings.map((heading) => heading.id);
          for (const id of Object.keys(content.after))
            expect(headingIds).toContain(id);
          const interactions = Object.values(content.after).flat();
          expect(interactions.length).toBeGreaterThanOrEqual(
            Math.min(6, Math.max(3, part.headings.length)),
          );
          for (const item of [...interactions, content.recap]) {
            expect(item.id.startsWith(`${part.id}-`)).toBe(true);
            checkInteraction(item);
          }
          checkExercise(content.exercise);
          checkRecall(content.recall, `${part.id}-`, 3);
        });
      }

      it("has recall for every short and practice for the section", () => {
        expect(Object.keys(week.shorts).sort()).toEqual(
          unit.shorts.map((clip) => clip.id).sort(),
        );
        for (const [id, clip] of Object.entries(week.shorts))
          checkRecall(clip.recall, `${id}-`, 2);
        if (unit.section) {
          expect(week.section).toBeDefined();
          checkRecall(week.section!.recall, `${week.unitId}-section-`, 3);
        }
      });

      it("defines the terms it uses", () => {
        expect(week.glossary.length).toBeGreaterThanOrEqual(5);
      });
    });
  }
});
