import { expect, test, type Page } from "@playwright/test";
import { courseUnits } from "../src/lib/course";
import { stepDone, unitSteps, type Step } from "../src/lib/flow";
import { formatMinutes, getPace } from "../src/lib/pace";
import { createInitialState, dateInZone } from "../src/lib/schedule";
import { friendlyDate, plural } from "../src/ui/format";
import {
  clearLoginRequests,
  compose,
  finishedBefore,
  flow,
  freshState,
  noOverflow,
  passed,
  readState,
  sheetOf,
  sheetSettled,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const week1 = courseUnits.find((unit) => unit.id === "week-1")!;
const week1Steps = unitSteps(flow, week1);
const secondLecture = week1Steps[1]!;

async function columns(page: Page, selector: string) {
  const lefts = await page
    .locator(selector)
    .evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().left)),
    );
  return new Set(lefts).size;
}

test("#track and old links land on the course page, which has no Home or Track tabs", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#track");
  await expect(page).toHaveURL(/#home$/);
  await expect(page.locator(".course-card")).toHaveCount(12);
  await expect(page.getByRole("heading", { name: "Track" })).toHaveCount(0);

  await page.goto("/#home/unit/week-99");
  await expect(page).toHaveURL(/#home$/);
  await expect(sheetOf(page)).toHaveCount(0);

  const header = page.locator("header.shell-header");
  await expect(
    header.getByRole("button", { name: "Home", exact: true }),
  ).toHaveCount(0);
  await expect(
    header.getByRole("button", { name: "Track", exact: true }),
  ).toHaveCount(0);
  await expect(header.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(header.getByRole("button")).toHaveText([
    "Search",
    "Public page",
    "",
  ]);
  await expect(
    header.getByRole("button", { name: "Search the course" }),
  ).toBeVisible();
  await expect(header.getByRole("button", { name: "Menu" })).toBeVisible();
  const brand = (await header.getByRole("link").boundingBox())!;
  expect(brand.x).toBeLessThan(40);
  const bar = (await header.boundingBox())!;
  expect(Math.round(bar.height)).toBe(72);
});

test("the menu keeps Settings and Sign out, and Search opens the search dialog", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Search the course" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("searchbox", { name: "Search the course" }),
  ).toBeFocused();
});

test("the stat row carries the finish date, study time and steps done, and no pace", async ({
  page,
}) => {
  const manual = {
    id: crypto.randomUUID(),
    taskId: "week-0-scratch",
    unitId: "week-0",
    label: "Study",
    startedAt: "2026-11-16T09:00:00.000Z",
    endedAt: "2026-11-16T10:30:00.000Z",
    elapsedSeconds: 5400,
    status: "finished" as const,
    segmentStartedAt: null,
    lastHeartbeatAt: "2026-11-16T10:30:00.000Z",
    manual: true,
  };
  const change = compose(finishedBefore(secondLecture.id), (state) => ({
    ...state,
    sessions: [manual],
  }));
  const expected = change(createInitialState());
  const today = dateInZone(new Date(), expected.settings.timezone);
  const pace = getPace(flow, expected, today);
  await freshState(page, change);
  await page.goto("/#home");

  const row = page.locator(".stat-row");
  await expect(row.locator("dt")).toHaveText([
    "Finish by",
    "Study time",
    "Steps done",
  ]);
  await expect(row.locator("dd").nth(0)).toHaveText(
    `${friendlyDate(pace.targetDate, { day: "numeric", month: "long", year: "numeric" })} · ${plural(pace.daysLeftInPlan, "day")} left`,
  );
  await expect(row.locator("dd").nth(1)).toHaveText(formatMinutes(90));
  const everyStep = courseUnits.flatMap((unit) => unitSteps(flow, unit));
  const done = everyStep.filter((step) => stepDone(step, expected)).length;
  await expect(row.locator("dd").nth(2)).toHaveText(
    `${done} of ${everyStep.length}`,
  );
  await expect(row).not.toContainText(/pace|ahead|behind/i);
});

test("This week lists the current unit's steps in order, with the next marked and finished ones chipped", async ({
  page,
}) => {
  const change = compose(
    finishedBefore(secondLecture.id),
    passed("week-1-cash", "2026-11-18T12:00:00.000Z", 88),
  );
  const state = change(createInitialState());
  await freshState(page, change);
  await page.goto("/#home");

  const section = page.locator(".this-week");
  await expect(
    section.getByRole("heading", { name: "This week · Week 1, C" }),
  ).toBeVisible();
  const cards = section.locator(".step-card");
  await expect(cards).toHaveCount(week1Steps.length);
  await expect(cards.locator(".step-title")).toHaveText(
    week1Steps.map((step) => step.title),
  );

  const seen = new Map<Step["stage"], number>();
  const words = {
    lecture: "Lecture",
    section: "Section",
    shorts: "Short",
    problems: "Problem",
    project: "Milestone",
  };
  for (const [index, step] of week1Steps.entries()) {
    const item = cards.nth(index);
    const ordinal = (seen.get(step.stage) ?? 0) + 1;
    seen.set(step.stage, ordinal);
    await expect(item).toHaveAttribute("href", `#session/${step.id}`);
    await expect(item.locator(".tile-caption")).toHaveText(words[step.stage]);
    await expect(item.locator(".tile-ordinal")).toHaveText(String(ordinal));
    const isDone = stepDone(step, state);
    await expect(item).toHaveAttribute("data-done", String(isDone));
    await expect(item.locator(".tile-chip", { hasText: "Done" })).toHaveCount(
      isDone ? 1 : 0,
    );
    const isNext = step.id === secondLecture.id;
    await expect(item).toHaveAttribute("data-next", String(isNext));
    await expect(item.getByText("Up next")).toHaveCount(isNext ? 1 : 0);
    await expect(item.locator(".step-meta")).toContainText(
      `${step.minutes} min`,
    );
  }
  await expect(section.locator('[data-next="true"]')).toHaveCount(1);
  const cash = cards.filter({ hasText: "Cash or Credit" });
  await expect(cash.locator(".step-meta")).toContainText("Passed with 88");
  await expect(
    cards
      .nth(week1Steps.findIndex((step) => step.id === "week-1-mario"))
      .locator(".step-meta"),
  ).toContainText("No result yet");
  await expect(cash.locator(".tile-caption")).toHaveText("Problem");
  await expect(cash.locator(".tile-ordinal")).toHaveText("3");

  await cards.nth(1).click();
  await expect(page).toHaveURL(new RegExp(`#session/${secondLecture.id}$`));
});

test("the public page switch and name persist in a dialog from the header", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await expect(page.getByLabel("Name on the page")).toHaveCount(0);
  await page.getByRole("button", { name: "Public page" }).click();
  const dialog = page.getByRole("dialog", { name: "Public page" });
  const toggle = dialog.getByRole("switch", { name: "Share a public page" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(dialog).toContainText(
    "The page shows only your week results and dates. It never shows notes, answers or study time.",
  );
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await dialog.getByLabel("Name on the page").fill("Ada");
  await dialog.getByLabel("Name on the page").blur();
  await expect
    .poll(async () => (await readState(page)).state.study?.publicPage)
    .toEqual({ enabled: true, name: "Ada" });
  await expect(dialog.getByRole("link", { name: "/p" })).toHaveAttribute(
    "href",
    "/p",
  );
  await expect(
    dialog.getByText(
      "![CS50 progress](http://127.0.0.1:5173/api/public/badge.svg)",
    ),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Public page" })).toBeFocused();

  await page.reload();
  await page.getByRole("button", { name: "Public page" }).click();
  await expect(
    page.getByRole("switch", { name: "Share a public page" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(page.getByLabel("Name on the page")).toHaveValue("Ada");
});

test("a name typed in the public page dialog is saved when the dialog closes", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Public page" }).click();
  await page.getByLabel("Name on the page").fill("Grace");
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => (await readState(page)).state.study?.publicPage.name)
    .toBe("Grace");
});

const widths = [
  { width: 1440, columns: 3 },
  { width: 1024, columns: 3 },
  { width: 768, columns: 2 },
  { width: 390, columns: 1 },
  { width: 320, columns: 1 },
];

test("three columns at 1440px down to one at 390px, with no horizontal scroll at any width", async ({
  page,
}) => {
  await freshState(page, finishedBefore(secondLecture.id));
  for (const { width, columns: expected } of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#home");
    await expect(page.locator(".step-card").first()).toBeVisible();
    await expect(page.locator(".course-card")).toHaveCount(12);
    await noOverflow(page, `course page at ${width}`);
    expect(await columns(page, ".step-card"), `step cards at ${width}`).toBe(
      expected,
    );
    expect(await columns(page, ".course-card"), `unit cards at ${width}`).toBe(
      expected,
    );
    await page.locator('.course-card[data-unit="week-4"]').click();
    await sheetSettled(page);
    await noOverflow(page, `sheet at ${width}`);
    await page.keyboard.press("Escape");
    await expect(sheetOf(page)).toHaveCount(0);
  }
});

test("at 1440px the unit cards form four rows of three, and Now sits beside its sticker card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await freshState(page);
  await page.goto("/#home");
  await expect(page.locator(".course-card")).toHaveCount(12);
  const tops = await page
    .locator(".course-card")
    .evaluateAll((cards) =>
      cards.map((item) => Math.round(item.getBoundingClientRect().top)),
    );
  expect(new Set(tops).size).toBe(4);
  const now = await page.locator(".home-now").boundingBox();
  const card = await page.locator(".now-card").boundingBox();
  expect(card!.x).toBeGreaterThan(now!.x + now!.width - 1);
  const grid = (await page.locator(".course-grid").boundingBox())!;
  const first = (await page.locator(".course-card").first().boundingBox())!;
  expect(Math.round(first.x)).toBe(Math.round(now!.x));
  expect(Math.round(grid.width)).toBeLessThanOrEqual(1144);
});
