import { expect, test } from "@playwright/test";
import { courseUnits } from "../src/lib/course";
import { unitSteps } from "../src/lib/flow";
import {
  clearLoginRequests,
  finishedBefore,
  flow,
  freshState,
  noOverflow,
  readState,
  sheetOf,
  sheetSettled,
  steps,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const week1 = courseUnits.find((unit) => unit.id === "week-1")!;
const week1Steps = unitSteps(flow, week1);
const current = week1Steps[1]!;
const other = week1Steps[3]!;
const sidebar = (page: import("@playwright/test").Page) =>
  page.locator(".outline-side");

test("a wide session has a sidebar with the unit's steps, the current one marked", async ({
  page,
}) => {
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: current.title }),
  ).toBeVisible();
  const outline = sidebar(page).getByRole("navigation", {
    name: "Course outline",
  });
  await expect(outline).toBeVisible();
  await expect(outline.locator(".outline-title")).toHaveText("C");
  await expect(outline.locator(".card-caption")).toHaveText("Week 1");
  await expect(outline.locator(".outline-row")).toHaveCount(week1Steps.length);
  await expect(outline.locator('[aria-current="page"]')).toHaveText(
    current.title,
  );
  await expect(outline.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(outline.getByRole("heading")).toHaveText([
    "Lecture",
    "Section",
    "Shorts",
    "Problem set",
  ]);
  const first = outline.getByRole("link", { name: week1Steps[0]!.title });
  await expect(first).toHaveAttribute("href", `#session/${week1Steps[0]!.id}`);
  await expect(first.getByLabel("Done")).toBeVisible();
  await expect(
    outline.locator('[aria-current="page"]').getByLabel("Done"),
  ).toHaveCount(0);

  await expect(
    page.getByRole("button", { name: "Outline", exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole("complementary", { name: "On this page" }),
  ).toBeVisible();
  const side = (await sidebar(page).boundingBox())!;
  const reading = (await page.locator("main.reading").boundingBox())!;
  const rail = (await page.locator(".rail").boundingBox())!;
  expect(Math.round(side.width)).toBeLessThanOrEqual(268);
  expect(side.x + side.width).toBeLessThan(reading.x);
  expect(reading.x + reading.width).toBeLessThan(rail.x);
  expect(Math.abs(side.x - (1440 - (rail.x + rail.width)))).toBeLessThanOrEqual(
    16,
  );
  await noOverflow(page, "session at 1440");
});

test("choosing another step in the sidebar moves on like leaving a step", async ({
  page,
}) => {
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();
  await expect
    .poll(async () => (await readState(page)).state.sessions.at(-1)?.status)
    .toBe("running");

  await sidebar(page).getByRole("link", { name: other.title }).click();
  await expect(page).toHaveURL(new RegExp(`#session/${other.id}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: other.title }),
  ).toBeVisible();
  await expect(sidebar(page).locator('[aria-current="page"]')).toHaveText(
    other.title,
  );
  await expect
    .poll(async () => {
      const { sessions } = (await readState(page)).state;
      return sessions.map((session) => [session.taskId, session.status]);
    })
    .toEqual([
      [current.id, "finished"],
      [other.id, "running"],
    ]);
});

test("the unit control browses other units without leaving the session", async ({
  page,
}) => {
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  const outline = sidebar(page);
  await expect(
    outline.getByRole("button", { name: "Previous unit" }),
  ).toBeEnabled();
  await outline.getByRole("button", { name: "Next unit" }).click();
  await expect(outline.locator(".outline-title")).toHaveText("Arrays");
  await expect(outline.locator(".card-caption")).toHaveText("Week 2");
  await expect(outline.locator('[aria-current="page"]')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`#session/${current.id}$`));
  const later = steps.find((step) => step.unitId === "week-2")!;
  await outline.getByRole("link", { name: later.title }).first().click();
  await expect(page).toHaveURL(new RegExp(`#session/${later.id}$`));
  await expect(outline.locator(".outline-title")).toHaveText("Arrays");
});

test("the sidebar can be hidden and the choice survives a reload", async ({
  page,
}) => {
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  await expect(sidebar(page)).toBeVisible();
  const before = (await page.locator("main.reading").boundingBox())!;
  await sidebar(page).getByRole("button", { name: "Hide outline" }).click();
  await expect(sidebar(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Show outline" }),
  ).toBeVisible();
  const after = (await page.locator("main.reading").boundingBox())!;
  expect(after.x).toBeLessThan(before.x);
  expect(
    await page.evaluate(() =>
      window.localStorage.getItem("cs50track.outline.hidden"),
    ),
  ).toBe("1");

  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: current.title }),
  ).toBeVisible();
  await expect(sidebar(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Show outline" }).click();
  await expect(sidebar(page)).toBeVisible();
  await page.reload();
  await expect(sidebar(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Show outline" })).toHaveCount(
    0,
  );
});

test("below 1240px the sidebar gives way to an Outline button that opens a sheet from the left", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: current.title }),
  ).toBeVisible();
  await expect(sidebar(page)).toBeHidden();
  await expect(page.getByRole("button", { name: "Show outline" })).toBeHidden();
  await noOverflow(page, "session at 1024");

  const button = page.getByRole("button", { name: "Outline", exact: true });
  await button.click();
  await sheetSettled(page);
  const sheet = sheetOf(page);
  await expect(sheet).toHaveAttribute("data-side", "start");
  const box = (await sheet.boundingBox())!;
  expect(Math.round(box.x)).toBe(0);
  await expect(
    sheet.getByRole("navigation", { name: "Course outline" }),
  ).toBeVisible();
  await expect(sheet.locator('[aria-current="page"]')).toHaveText(
    current.title,
  );
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(button).toBeFocused();

  await button.click();
  await sheetOf(page).getByRole("link", { name: other.title }).click();
  await expect(page).toHaveURL(new RegExp(`#session/${other.id}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: other.title }),
  ).toBeVisible();
});

test("the outline sheet fits a 320px phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await freshState(page, finishedBefore(current.id));
  await page.goto(`/#session/${current.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: current.title }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Outline", exact: true }).click();
  await sheetSettled(page);
  await noOverflow(page, "outline sheet at 320");
  const box = (await sheetOf(page).boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});
