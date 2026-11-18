import { expect, test, type Page } from "@playwright/test";
import week0 from "../src/content/week-0";
import type { Interaction } from "../src/content/types";
import {
  clearLoginRequests,
  finishedBefore,
  flow,
  freshState,
  noOverflow,
  readState,
  recallAnswered,
  steps,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const first = steps[0]!;
const second = steps[1]!;
const lecture = flow.units["week-0"]!.lecture;
const part1 = lecture.parts[0]!;
const part2 = lecture.parts[1]!;
const content1 = week0.parts[part1.id]!;

async function answerEverything(page: Page) {
  const questions = page.locator(".ix:has(.ix-options)");
  const count = await questions.count();
  for (let i = 0; i < count; i++) {
    await questions.nth(i).scrollIntoViewIfNeeded();
    await questions.nth(i).locator(".ix-option").first().click();
  }
  return count;
}

test("Home names the week, the pace, the stages and the first step", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await expect(page.getByText("Week 0 · Scratch")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /On pace|ahead|behind/,
  );
  await expect(page.getByText(/left this week, about .* a day/)).toBeVisible();
  const stages = page.getByRole("list", { name: "Week 0 stages" });
  await expect(stages.getByRole("listitem")).toHaveText([
    "Lecture 0/4",
    "Problem set",
  ]);
  await expect(stages.locator('[aria-current="step"]')).toHaveText(
    "Lecture 0/4",
  );
  await expect(
    page.getByRole("button", {
      name: `Start · ${first.title} · ${first.minutes} min`,
    }),
  ).toBeVisible();
  await expect(page.getByText(/\d+ days? to .* \d{4}\./)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Short on time/ }),
  ).toHaveCount(0);
});

test("Home shows the unit of the next step and warns when its week has passed", async ({
  page,
}) => {
  await freshState(page, (state) => ({
    ...finishedBefore("week-1-lecture-p1")(state),
    settings: { ...state.settings, startDate: "2026-09-01" },
  }));
  await page.goto("/#home");
  await expect(page.getByText("Week 1 · C")).toBeVisible();
  await expect(page.getByText(/Week 1 was due on 7 September/)).toBeVisible();
  await expect(page.getByText(/Problem set due/)).toHaveCount(0);
});

test("starting opens the lecture part with video, notes and interactions", async ({
  page,
}) => {
  await freshState(page, (state) =>
    recallAnswered(content1.recall.map((q) => q.id))(
      finishedBefore(part2.id)(state),
    ),
  );
  await page.goto("/#home");
  await page.getByRole("button", { name: /^Start · / }).click();
  await expect(page).toHaveURL(new RegExp(`#session/${part2.id}$`));
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
  await expect(page.getByText("Lecture 2 of 4")).toBeVisible();

  const video = page.locator("video");
  await expect(video).toHaveAttribute("src", lecture.mp4!);
  await expect(video.locator('track[kind="captions"]')).toHaveAttribute(
    "src",
    lecture.captions!,
  );
  await expect(page.getByText(`0:00`, { exact: false }).first()).toBeVisible();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), {
      timeout: 45_000,
    })
    .toBeGreaterThanOrEqual(part2.start - 1);
  for (const speed of ["1x", "1.25x", "1.5x", "2x"])
    await expect(page.getByRole("button", { name: speed })).toBeVisible();

  const content = week0.parts[part2.id]!;
  await expect(page.locator(".lead").first()).toHaveText(content.hook);
  for (const heading of part2.headings) {
    const section = page.locator(`#sec-${heading.id}`);
    await expect(section.locator("h2").first()).toContainText(heading.title);
    const after: Interaction[] = content.after[heading.id] ?? [];
    await expect(section.locator(".ix")).toHaveCount(after.length);
  }
  await expect(page.locator("#part-recap .ix")).toHaveCount(1);
  await expect(page.locator(".editor")).toHaveValue(content.exercise.starter);
  await expect(
    page.getByRole("link", { name: /Notes by CS50, Harvard University/ }),
  ).toHaveAttribute(
    "href",
    `${lecture.notesSourceUrl}#${part2.headings[0]!.id}`,
  );
});

test("answers unlock Finish, the close-out saves, and everything survives a reload", async ({
  page,
}) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const finish = page.getByRole("button", { name: "Finish this part" });
  await expect(finish).toBeDisabled();
  await expect(page.getByText(/^0 of \d+ answered$/)).toBeVisible();

  const answered = await answerEverything(page);
  expect(answered).toBeGreaterThan(0);
  await expect(finish).toBeEnabled();
  await expect(page.getByText(/of \d+ answered/)).toHaveCount(0);
  await expect
    .poll(
      async () =>
        Object.keys((await readState(page)).state.study?.answers ?? {}).length,
    )
    .toBe(answered);

  await finish.click();
  await expect(
    page.getByRole("heading", { name: "Before you go" }),
  ).toBeVisible();
  await page.getByLabel("What did you learn?").fill("A byte is eight bits.");
  await page.getByLabel("What is still unclear?").fill("Why base 2");
  await page.getByRole("button", { name: "Save and finish" }).click();
  await expect(
    page.getByRole("heading", {
      name: `Next: ${second.title} · ${second.minutes} min`,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Done for today" }),
  ).toBeVisible();

  const saved = (await readState(page)).state;
  expect(saved.resources[part1.id]).toBe(true);
  expect(saved.study?.reflections.at(-1)).toMatchObject({
    stepId: part1.id,
    learned: "A byte is eight bits.",
    unclear: "Why base 2",
  });
  expect(saved.sessions.at(-1)).toMatchObject({
    taskId: part1.id,
    unitId: "week-0",
    status: "finished",
  });

  await page.reload();
  const firstQuestion = page.locator(".ix:has(.ix-options)").first();
  await expect(
    firstQuestion.locator('.ix-option[aria-pressed="true"]'),
  ).toHaveCount(1);
  await expect(firstQuestion.locator(".ix-reveal p")).toBeVisible();
  expect((await readState(page)).state.study?.reflections.at(-1)?.learned).toBe(
    "A byte is eight bits.",
  );
});

test("a question shows no answer or explanation until a choice is made", async ({
  page,
}) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const item = Object.values(content1.after)
    .flat()
    .find((entry) => entry.kind === "predict");
  if (item?.kind !== "predict") throw new Error("week 0 part 1 has no predict");
  const figure = page.locator(".ix", { hasText: item.prompt });
  await expect(figure.locator(".ix-reveal p")).toHaveCount(0);
  await expect(figure).not.toContainText(item.explanation.slice(0, 30));
  await expect(figure.locator("[data-verdict]")).toHaveCount(0);
  const wrong = item.answer === 0 ? 1 : 0;
  await figure.locator(".ix-option").nth(wrong).click();
  await expect(figure.locator(".ix-reveal")).toContainText("Not quite.");
  await expect(figure.locator(".ix-reveal")).toContainText(
    item.explanation.slice(0, 30),
  );
  await expect(
    figure.locator('.ix-option[data-verdict="answer"]'),
  ).toContainText(item.options[item.answer]!);
  await figure.locator(".ix-option").nth(item.answer).click({ force: true });
  await expect(figure.locator(".ix-option").nth(wrong)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(figure.locator(".ix-option").nth(item.answer)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("a trace steps forward and back and flags the variables that changed", async ({
  page,
}) => {
  await freshState(page);
  let found: {
    partId: string;
    trace: Extract<Interaction, { kind: "trace" }>;
  } | null = null;
  for (const [partId, part] of Object.entries(week0.parts)) {
    const trace = Object.values(part.after)
      .flat()
      .find((entry) => entry.kind === "trace");
    if (trace?.kind === "trace") {
      found = { partId, trace };
      break;
    }
  }
  if (!found) throw new Error("week 0 has no trace");
  const { trace } = found;
  await page.goto(`/#session/${found.partId}`);
  const figure = page.locator(".trace", { hasText: trace.caption });
  await figure.scrollIntoViewIfNeeded();
  const total = trace.steps.length;
  await expect(figure.getByText(`Step 0 of ${total}`)).toBeVisible();
  await expect(figure.locator('[data-current="true"]')).toHaveCount(0);
  await expect(figure.getByRole("button", { name: "Back" })).toBeDisabled();

  await figure.getByRole("button", { name: "Next" }).click();
  await expect(figure.getByText(`Step 1 of ${total}`)).toBeVisible();
  await expect(
    figure.locator(".trace-code li").nth(trace.steps[0]!.line - 1),
  ).toHaveAttribute("data-current", "true");

  const changedAt = trace.steps.findIndex(
    (step, i) =>
      i > 0 &&
      Object.entries(step.vars).some(
        ([name, value]) => trace.steps[i - 1]!.vars[name] !== value,
      ),
  );
  expect(changedAt).toBeGreaterThan(0);
  for (let i = 1; i <= changedAt; i++)
    await figure.getByRole("button", { name: "Next" }).click();
  await expect(
    figure.getByText(`Step ${changedAt + 1} of ${total}`),
  ).toBeVisible();
  await expect(figure.locator('tr[data-changed="true"]').first()).toBeVisible();
  const before = trace.steps[changedAt - 1]!;
  const changedName = Object.keys(trace.steps[changedAt]!.vars).find(
    (name) => before.vars[name] !== trace.steps[changedAt]!.vars[name],
  )!;
  await expect(
    figure
      .locator("tr", {
        has: page.getByRole("rowheader", { name: changedName }),
      })
      .first(),
  ).toHaveAttribute("data-changed", "true");

  await figure.getByRole("button", { name: "Back" }).click();
  await expect(figure.getByText(`Step ${changedAt} of ${total}`)).toBeVisible();
  await figure.getByRole("button", { name: "Reset" }).click();
  await expect(figure.getByText(`Step 0 of ${total}`)).toBeVisible();
  await expect(figure.locator('[data-current="true"]')).toHaveCount(0);
});

test("the exercise saves while typing and keeps hints and the solution behind buttons", async ({
  page,
}) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const exercise = content1.exercise;
  const editor = page.locator(".editor");
  await editor.scrollIntoViewIfNeeded();
  await expect(editor).toHaveValue(exercise.starter);
  await editor.fill("my attempt");
  await expect
    .poll(
      async () => (await readState(page)).state.study?.exercises[part1.id],
      { timeout: 10_000 },
    )
    .toBe("my attempt");
  await page.reload();
  await expect(page.locator(".editor")).toHaveValue("my attempt");

  await expect(page.getByRole("list", { name: "Hints" })).toHaveCount(0);
  await page.getByRole("button", { name: /^Show hint/ }).click();
  await expect(
    page.getByRole("list", { name: "Hints" }).getByRole("listitem"),
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Hide solution" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "View solution" }).click();
  await expect(page.getByLabel("Solution")).toBeVisible();
  await page.getByRole("button", { name: "Reset code" }).click();
  await expect(page.locator(".editor")).toHaveValue(exercise.starter);
});

test("the timer follows the session and Exit finishes it", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: /^Start · / }).click();
  await expect
    .poll(async () => (await readState(page)).state.sessions.at(-1)?.status)
    .toBe("running");
  expect((await readState(page)).state.sessions.at(-1)).toMatchObject({
    taskId: first.id,
    unitId: first.unitId,
  });
  await page.getByRole("button", { name: "Pause timer" }).click();
  await expect
    .poll(async () => (await readState(page)).state.sessions.at(-1)?.status)
    .toBe("paused");
  await page.getByRole("button", { name: "Resume timer" }).click();
  await expect
    .poll(async () => (await readState(page)).state.sessions.at(-1)?.status)
    .toBe("running");
  await page.getByRole("button", { name: "Exit" }).click();
  await expect(page).toHaveURL(/#home$/);
  await expect
    .poll(async () => (await readState(page)).state.sessions.at(-1)?.status)
    .toBe("finished");
  expect((await readState(page)).state.sessions).toHaveLength(1);
});

test("recall warms up a session with questions from finished steps", async ({
  page,
}) => {
  await freshState(page, (state) => ({
    ...finishedBefore(part2.id)(state),
    study: {
      answers: {},
      recall: {},
      reflections: [
        {
          id: "r0",
          date: "2026-11-17",
          stepId: part1.id,
          learned: "x",
          unclear: "how carrying works",
        },
      ],
      exercises: {},
      activeDays: {},
      publicPage: { enabled: false, name: "" },
    },
  }));
  await page.goto("/#home");
  await expect(
    page.getByRole("button", { name: "Short on time? 10-minute recall" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Start · / }).click();
  await expect(
    page.getByRole("heading", { name: "Before you start" }),
  ).toBeVisible();
  await expect(
    page.getByText("Last time you were unsure about: how carrying works"),
  ).toBeVisible();
  const asked = Math.min(3, content1.recall.length);
  for (let i = 1; i <= asked; i++) {
    await expect(page.getByText(`Question ${i} of ${asked}`)).toBeVisible();
    await page.locator(".ix-option").first().click();
    await expect(page.locator(".ix-reveal p")).toBeVisible();
    await page
      .getByRole("button", {
        name: i === asked ? "Start the lesson" : "Next question",
      })
      .click();
  }
  await expect(page.getByRole("heading", { name: part2.title })).toBeVisible();
  const recall = (await readState(page)).state.study!.recall;
  expect(Object.keys(recall)).toHaveLength(asked);
  for (const entry of Object.values(recall))
    expect(entry.due >= "2026-11-17").toBe(true);

  await page.reload();
  await expect(page.getByRole("heading", { name: part2.title })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Before you start" }),
  ).toHaveCount(0);
});

test("#recall runs a short recall and ends with the day counted", async ({
  page,
}) => {
  await freshState(page, finishedBefore(part2.id));
  await page.goto("/#recall");
  const questions = Math.min(10, content1.recall.length);
  for (let i = 1; i <= questions; i++) {
    await expect(page.getByText(`Question ${i} of ${questions}`)).toBeVisible();
    await page.locator(".ix-option").first().click();
    await page
      .getByRole("button", {
        name: i === questions ? "Finish" : "Next question",
      })
      .click();
  }
  await expect(page.getByText("That counts for today.")).toBeVisible();
  const state = (await readState(page)).state;
  expect(Object.keys(state.study!.recall).length).toBeGreaterThanOrEqual(
    questions,
  );
  expect(Object.keys(state.study!.activeDays).length).toBe(1);
  await page.getByRole("button", { name: "Back to Home" }).click();
  await expect(page).toHaveURL(/#home$/);
});

test("section and short sessions show the video, check-yourself questions and the same close-out", async ({
  page,
}) => {
  const short = steps.find((step) => step.stage === "shorts")!;
  const clip = flow.units[short.unitId]!.shorts[0]!;
  await freshState(page);
  await page.goto(`/#session/${short.id}`);
  await expect(page.locator("video")).toHaveAttribute("src", clip.mp4!);
  await expect(page.getByText(/^Short 1 of \d+$/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Video and notes by CS50/ }),
  ).toHaveAttribute("href", clip.sourceUrl);
  await answerEverything(page);
  await page.getByRole("button", { name: /^Finish this short/ }).click();
  await expect(
    page.getByRole("heading", { name: "Before you go" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save and finish" }).click();
  await expect(page.getByRole("heading", { name: /^Next: / })).toBeVisible();
  expect((await readState(page)).state.resources[short.id]).toBe(true);
});

test("a step id that does not exist says so", async ({ page }) => {
  await freshState(page);
  await page.goto("/#session/not-a-step");
  await expect(
    page.getByRole("heading", { name: "This step does not exist" }),
  ).toBeVisible();
});

test("Home and a session fit a 390px screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto("/#home");
  await expect(page.getByRole("button", { name: /^Start · / })).toBeVisible();
  await noOverflow(page);
  await page.goto(`/#session/${part1.id}`);
  await expect(page.getByRole("heading", { name: part1.title })).toBeVisible();
  await page.locator(".ix").first().scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page.getByRole("button", { name: "On this page" }).click();
  await expect(
    page.getByRole("group", { name: "On this page" }).getByRole("link").first(),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: ".audit/session-mobile.png" });
});

test("the video pauses once at the end of the part, and speed and place are remembered", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), {
      timeout: 60_000,
    })
    .toBeGreaterThanOrEqual(1);
  await page.getByRole("button", { name: "1.5x" }).click();
  await expect(page.getByRole("button", { name: "1.5x" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.playbackRate))
    .toBe(1.5);

  await video.evaluate(async (v: HTMLVideoElement, end: number) => {
    v.muted = true;
    v.currentTime = end - 3;
    await v.play();
  }, part1.end);
  await expect(page.getByText("End of this part")).toBeVisible({
    timeout: 30_000,
  });
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole("button", { name: "Keep watching" }).click();
  await expect(page.getByText("End of this part")).toHaveCount(0);
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(false);
  await page.waitForTimeout(2500);
  await expect(page.getByText("End of this part")).toHaveCount(0);

  await video.evaluate((v: HTMLVideoElement) => {
    v.pause();
    v.currentTime = 600;
  });
  await page.getByRole("button", { name: "Exit" }).click();
  await expect(page).toHaveURL(/#home$/);
  await page.goto(`/#session/${part1.id}`);
  await page.reload();
  await expect(page.getByRole("button", { name: "1.5x" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect
    .poll(
      () =>
        page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
      { timeout: 60_000 },
    )
    .toBeGreaterThanOrEqual(599);
});

test("a section links its slides and source code", async ({ page }) => {
  const section = steps.find((step) => step.stage === "section")!;
  await freshState(page);
  await page.goto(`/#session/${section.id}`);
  const files = page.getByRole("list", { name: "Section files" });
  await expect(files.getByRole("link", { name: /Slides/ })).toHaveAttribute(
    "href",
    /\/course\/2026\/files\/.*\.pdf$/,
  );
  await expect(
    files.getByRole("link", { name: /Source code/ }).first(),
  ).toBeVisible();
});

test("a week without content still teaches from the video and CS50 notes", async ({
  page,
}) => {
  await page.route("**/src/content/week-0.ts*", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  await expect(page.locator("video")).toHaveAttribute("src", lecture.mp4!);
  for (const heading of part1.headings)
    await expect(page.locator(`#sec-${heading.id} h2`).first()).toContainText(
      heading.title,
    );
  await expect(page.locator(".ix")).toHaveCount(0);
  await expect(page.locator(".editor")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Terms" })).toHaveCount(0);
  await page.getByRole("button", { name: "Finish this part" }).click();
  await page.getByRole("button", { name: "Save and finish" }).click();
  await expect(page.getByRole("heading", { name: /^Next: / })).toBeVisible();
  expect((await readState(page)).state.resources[part1.id]).toBe(true);
});
