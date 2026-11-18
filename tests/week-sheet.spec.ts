import { expect, test, type Page } from "@playwright/test";
import week0 from "../src/content/week-0";
import { courseUnits } from "../src/lib/course";
import { unitSteps } from "../src/lib/flow";
import { calendarWeek, unitDeadline } from "../src/lib/pace";
import { friendlyDate, longDate } from "../src/ui/format";
import {
  clearLoginRequests,
  compose,
  finishedBefore,
  flow,
  freshState,
  noOverflow,
  passed,
  readState,
  recallAnswered,
  sheetOf,
  sheetSettled,
  startedOn,
  startedToday,
  steps,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const week0Problem = steps.find((step) => step.id === "week-0-scratch")!;
const week0Recall = Object.values(week0.parts).flatMap((part) =>
  part.recall.map((question) => question.id),
);
const firstAfterWeek0 = steps[steps.indexOf(week0Problem) + 1]!;
const unit = (id: string) => courseUnits.find((item) => item.id === id)!;
const card = (page: Page, id: string) =>
  page.locator(`.course-card[data-unit="${id}"]`);
const recordDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Record your result" });

test("the sheet shows each unit with its deadline, status and every step", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  for (const item of courseUnits) {
    await card(page, item.id).click();
    const sheet = sheetOf(page);
    await sheetSettled(page);
    await expect(page).toHaveURL(new RegExp(`#home/unit/${item.id}$`));
    await expect(sheet).toHaveAttribute(
      "aria-label",
      `${item.title} · ${item.topic}`,
    );
    await expect(
      sheet.getByRole("heading", { level: 2, name: item.topic }),
    ).toBeVisible();
    await expect(sheet).toContainText(
      `${item.groups.length === 0 ? "Week ends" : "Due"} ${longDate(unitDeadline(item.id, "2026-11-17"))}`,
    );
    await expect(sheet).toContainText(`Plan week ${calendarWeek(item.id)}`);
    await expect(sheet.locator(".step-row[data-done]")).toHaveCount(
      unitSteps(flow, item).length,
    );
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
  }
  await card(page, "week-1").click();
  await expect(sheetOf(page).locator(".chip")).toHaveText("This week");
  await page.keyboard.press("Escape");
  await card(page, "week-3").click();
  await expect(sheetOf(page).locator(".chip")).toHaveText("Upcoming");
  await page.keyboard.press("Escape");
  await card(page, "week-10").click();
  await expect(sheetOf(page).locator(".chip")).toHaveCount(0);
});

test("a step row in the sheet opens its session", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home");
  await card(page, "week-3").click();
  const third = steps.find((step) => step.unitId === "week-3")!;
  await sheetOf(page)
    .getByRole("link", { name: third.title, exact: false })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`#session/${third.id}$`));
  await expect(page.getByRole("heading", { name: third.title })).toBeVisible();
  await expect(sheetOf(page)).toHaveCount(0);
  await page.goBack();
  await expect(sheetOf(page)).toHaveAttribute(
    "aria-label",
    "Week 3 · Algorithms",
  );
});

test("the sheet's Start button opens the unit's next unfinished step, or it says the week is complete", async ({
  page,
}) => {
  const second = steps.find((step) => step.id === "week-1-lecture-p2")!;
  await freshState(page, finishedBefore(second.id));
  await page.goto("/#home/unit/week-1");
  await expect(
    sheetOf(page).getByRole("button", {
      name: `Start · ${second.title} · ${second.minutes} min`,
    }),
  ).toBeVisible();
  await expect(
    sheetOf(page).getByRole("button", { name: /^Start · / }),
  ).toHaveCount(1);
  await sheetOf(page)
    .getByRole("button", { name: /^Start · / })
    .click();
  await expect(page).toHaveURL(new RegExp(`#session/${second.id}$`));

  await page.goto("/#home/unit/week-0");
  await expect(sheetOf(page).getByText("Week complete")).toBeVisible();
  await expect(
    sheetOf(page).getByRole("button", { name: /^Start · / }),
  ).toHaveCount(0);
  await expect(
    sheetOf(page).locator('.step-row[data-done="true"]'),
  ).toHaveCount(unitSteps(flow, unit("week-0")).length);
});

test("the sheet says how a week closed, or that it was missed", async ({
  page,
}) => {
  const closed = "2026-11-18T12:00:00.000Z";
  await freshState(page, passed("week-0-scratch", closed));
  await page.goto("/#home/unit/week-0");
  await expect(sheetOf(page).locator(".chip")).toHaveText(
    `On time · closed ${friendlyDate("2026-11-18")}`,
  );

  await freshState(
    page,
    compose(startedOn("2026-10-01"), passed("week-0-scratch", closed)),
  );
  await page.goto("/#home/unit/week-0");
  await expect(sheetOf(page).locator(".chip")).toHaveText(
    `Late · closed ${friendlyDate("2026-11-18")}`,
  );

  await freshState(page, startedOn("2026-10-01"));
  await page.goto("/#home/unit/week-0");
  await expect(sheetOf(page).locator(".chip")).toHaveText("Missed");
});

test("a problem step shows the specification and a passing result closes the step and the week", async ({
  page,
}) => {
  await freshState(page, (state) =>
    recallAnswered(week0Recall)(
      startedToday(finishedBefore(week0Problem.id)(state)),
    ),
  );
  await page.goto("/#home");
  await page.getByRole("button", { name: /^Start · / }).click();
  await expect(page).toHaveURL(/#session\/week-0-scratch$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Starting from Scratch" }),
  ).toBeVisible();
  await expect(page.locator(".spec h2").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open cs50.dev/ })).toBeVisible();
  await expect(
    page.getByText("This week closes only when CS50's checker passes"),
  ).toBeVisible();

  await page
    .locator(".record")
    .getByRole("button", { name: "Record result" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: /Passed/ }).check();
  await dialog.getByLabel("Score, optional").fill("92");
  await dialog.getByRole("button", { name: "Save result" }).click();
  await expect(
    page.getByRole("heading", {
      name: `Next: ${firstAfterWeek0.title} · ${firstAfterWeek0.minutes} min`,
    }),
  ).toBeVisible();
  const state = (await readState(page)).state;
  expect(state.attempts).toHaveLength(1);
  expect(state.attempts[0]).toMatchObject({
    assignmentId: "week-0-scratch",
    kind: "passed",
    score: 92,
  });
  expect(state.sessions.at(-1)?.status).toBe("finished");

  await page.getByRole("button", { name: "Done for today" }).click();
  await expect(page).toHaveURL(/#home$/);
  await card(page, "week-0").click();
  const sheet = sheetOf(page);
  await expect(sheet.locator(".chip")).toContainText("On time");
  await expect(
    sheet.locator(".step-row", { hasText: "Starting from Scratch" }),
  ).toContainText("Passed with 92");
  await expect(sheet.locator('.step-row[data-done="true"]')).toHaveCount(
    steps.filter((step) => step.unitId === "week-0").length,
  );
});

test("a group with two versions asks which first and remembers the last attempt", async ({
  page,
}) => {
  await freshState(page, startedToday);
  await page.goto("/#session/week-1-mario");
  await expect(
    page.getByRole("button", { name: /Mario \(less comfortable\)/ }),
  ).toBeVisible();
  await expect(page.locator(".spec")).toHaveCount(0);
  await page
    .getByRole("button", { name: /Mario \(more comfortable\)/ })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Mario (more comfortable)" }),
  ).toBeVisible();
  await expect(page.locator(".spec")).toBeVisible();
  await page
    .locator(".record")
    .getByRole("button", { name: "Record result" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: /Submitted/ }).check();
  await dialog.getByRole("button", { name: "Save result" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Mario (more comfortable)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Choose the other version" }).click();
  await expect(
    page.getByRole("button", { name: /Mario \(less comfortable\)/ }),
  ).toBeVisible();
});

test("the sheet shows both versions of a problem and records a result on either", async ({
  page,
}) => {
  await freshState(page, startedToday);
  await page.goto("/#home/unit/week-1");
  const sheet = sheetOf(page);
  await expect(
    sheet.locator(".step-row", { hasText: "choose one" }).first(),
  ).toContainText("choose one");
  await sheet
    .getByRole("button", { name: "Record result for Cash", exact: true })
    .click();
  const dialog = recordDialog(page);
  await dialog.getByLabel("Score, optional").fill("88");
  await dialog.getByRole("button", { name: "Save result" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    sheet.locator(".attempt-row", { hasText: "Cash" }).first(),
  ).toContainText("Passed with 88");
  await expect(sheet).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record result for Cash", exact: true }),
  ).toBeFocused();
});

test("the project unit lists its milestones and records the project result", async ({
  page,
}) => {
  await freshState(page, startedToday);
  await page.goto("/#home/unit/project");
  const sheet = sheetOf(page);
  await expect(sheet.locator(".step-row").first()).toContainText(
    "Define the scope",
  );
  await expect(sheet.locator(".step-row[data-done]")).toHaveCount(
    unitSteps(flow, unit("project")).length,
  );
  await expect(sheet).toContainText("Not recorded yet");
  await sheet
    .getByRole("button", { name: "Record result", exact: true })
    .click();
  const dialog = recordDialog(page);
  await dialog.getByLabel("Score, optional").fill("90");
  await dialog.getByRole("button", { name: "Save result" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(sheet).toContainText("Passed with 90");

  await sheet.getByRole("link", { name: /^Define the scope/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Define the scope" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark this milestone done" }).click();
  await page.getByRole("button", { name: "Save and finish" }).click();
  await expect(
    page.getByRole("heading", {
      name: new RegExp(`^Next: ${steps[0]!.title}`),
    }),
  ).toBeVisible();
  expect((await readState(page)).state.milestones.scope).toBe(true);
});

test("a unit card opens the sheet at its own address and Escape closes it and returns focus to the card", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  const opener = card(page, "week-2");
  await opener.click();
  await sheetSettled(page);
  await expect(page).toHaveURL(/#home\/unit\/week-2$/);
  await page.keyboard.press("Escape");
  await expect(sheetOf(page)).toHaveCount(0);
  await expect(page).toHaveURL(/#home$/);
  await expect(opener).toBeFocused();
});

test("a click on the dimmed page and the close button both close the sheet", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await card(page, "week-4").click();
  await sheetSettled(page);
  await page.mouse.click(60, 450);
  await expect(sheetOf(page)).toHaveCount(0);
  await expect(card(page, "week-4")).toBeFocused();

  await card(page, "week-4").click();
  await sheetSettled(page);
  await sheetOf(page).getByRole("button", { name: "Close" }).click();
  await expect(sheetOf(page)).toHaveCount(0);
  await expect(page).toHaveURL(/#home$/);
});

test("Back closes the sheet and a reload reopens it", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home");
  await card(page, "week-2").click();
  await sheetSettled(page);
  await page.goBack();
  await expect(sheetOf(page)).toHaveCount(0);
  await expect(page).toHaveURL(/#home$/);

  await page.goForward();
  await expect(sheetOf(page)).toHaveAttribute("aria-label", "Week 2 · Arrays");
  await page.reload();
  await expect(sheetOf(page)).toHaveAttribute("aria-label", "Week 2 · Arrays");
  await sheetSettled(page);
  await expect(page).toHaveURL(/#home\/unit\/week-2$/);
  await page.keyboard.press("Escape");
  await expect(sheetOf(page)).toHaveCount(0);
  await expect(page).toHaveURL(/#home$/);
  await expect(card(page, "week-2")).toBeFocused();
});

test("focus stays inside the open sheet, and the page behind does not scroll", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await expect(page.locator(".course-card")).toHaveCount(12);
  await card(page, "week-4").scrollIntoViewIfNeeded();
  await card(page, "week-4").click();
  await sheetSettled(page);
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(300);
  const inside = () =>
    page.evaluate(
      () => document.activeElement?.closest("dialog.sheet") !== null,
    );
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press("Tab");
    expect(await inside(), `Tab ${index + 1}`).toBe(true);
  }
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Shift+Tab");
    expect(await inside(), `Shift+Tab ${index + 1}`).toBe(true);
  }

  await page.mouse.move(80, 450);
  await page.mouse.wheel(0, 900);
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");

  const scroll = sheetOf(page).locator(".sheet-scroll");
  expect(
    await scroll.evaluate(
      (element) => getComputedStyle(element).overscrollBehaviorY,
    ),
  ).toBe("contain");
  await page.mouse.move(1200, 450);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => scroll.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);

  await page.keyboard.press("Escape");
  await expect(sheetOf(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).not.toBe("hidden");
});

test("the sheet is a 520px panel on the right at 1440px", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home/unit/week-1");
  await sheetSettled(page);
  const box = (await sheetOf(page).boundingBox())!;
  expect(Math.round(box.width)).toBe(520);
  expect(Math.round(box.x + box.width)).toBe(1440);
  expect(Math.round(box.height)).toBe(1000);
  await expect(sheetOf(page).locator(".sheet-grab")).toBeHidden();
});

test("on a phone the sheet is a bottom sheet with a grab bar, and it fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto("/#home");
  await card(page, "week-1").click();
  await sheetSettled(page);
  const box = (await sheetOf(page).boundingBox())!;
  expect(Math.round(box.width)).toBe(390);
  expect(Math.round(box.y + box.height)).toBe(844);
  expect(box.height).toBeLessThanOrEqual(844 * 0.88 + 1);
  expect(box.y).toBeGreaterThan(80);
  await expect(sheetOf(page).locator(".sheet-grab")).toBeVisible();
  await noOverflow(page, "sheet at 390");
  await page.mouse.click(195, 30);
  await expect(sheetOf(page)).toHaveCount(0);
});

test("the sheet cross-fades under reduced motion and slides otherwise", async ({
  browser,
}) => {
  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  const calm = await reduced.newPage();
  await freshState(calm);
  await calm.goto("/#home/unit/week-1");
  await sheetSettled(calm);
  const fade = await sheetOf(calm).evaluate((element) => {
    const css = getComputedStyle(element);
    return { transform: css.transform, property: css.transitionProperty };
  });
  expect(fade).toEqual({ transform: "none", property: "opacity" });
  await reduced.close();

  const full = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await full.newPage();
  await freshState(page);
  await page.goto("/#home/unit/week-1");
  await sheetSettled(page);
  const timing = await sheetOf(page).evaluate((element) => {
    const read = () => {
      const css = getComputedStyle(element);
      return {
        property: css.transitionProperty,
        duration: css.transitionDuration,
        easing: css.transitionTimingFunction,
      };
    };
    const open = read();
    element.setAttribute("data-state", "closed");
    return {
      open,
      closed: read(),
      hidden: getComputedStyle(element).transform,
    };
  });
  expect(timing.open).toEqual({
    property: "transform, opacity",
    duration: "0.3s",
    easing: "cubic-bezier(0.2, 0, 0, 1)",
  });
  expect(timing.closed).toEqual({
    property: "transform, opacity",
    duration: "0.15s",
    easing: "ease-out",
  });
  await full.close();
});
