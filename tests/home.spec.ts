import { expect, test } from "@playwright/test";
import { courseUnits } from "../src/lib/course";
import { unitSteps } from "../src/lib/flow";
import {
  clearLoginRequests,
  finishedBefore,
  flow,
  freshState,
  noOverflow,
  steps,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const first = steps[0]!;
const unitFirstStep = (unitId: string) =>
  unitSteps(
    flow,
    courseUnits.find((unit) => unit.id === unitId)!,
  )[0]!;

const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("Home leads with the week, the pace and a Start button for the first step", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  const now = page.locator(".home-now");
  await expect(now.getByText("Week 0 · Scratch")).toBeVisible();
  await expect(now.getByRole("heading", { level: 1 })).toHaveText(
    /On pace|ahead|behind/,
  );
  await expect(
    now.getByRole("button", {
      name: `Start · ${first.title} · ${first.minutes} min`,
    }),
  ).toBeVisible();
  await expect(now.getByText(/\d+ days? to .* \d{4}\./)).toBeVisible();
});

test("the course grid lists the twelve units in course order", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  const cards = page.locator(".course-card");
  await expect(cards).toHaveCount(12);
  await expect(cards.locator(".card-title")).toHaveText(
    courseUnits.map((unit) => unit.topic),
  );
  await expect(cards.locator(".card-caption")).toHaveText([
    ...Array.from({ length: 11 }, (_, index) => `Week ${index}`),
    "Final project",
  ]);
  await expect(cards.locator(".card-steps").first()).toHaveText(
    `0 of ${unitSteps(flow, courseUnits[0]!).length} steps`,
  );
  await expect(
    page.locator('.course-card[data-unit="week-1"] .card-status'),
  ).toHaveText("This week");
  await expect(
    page.locator('.course-card[data-unit="week-3"] .card-status'),
  ).toHaveText("Upcoming");
  await expect(
    page.locator('.course-card[data-unit="week-10"] .card-status'),
  ).toHaveCount(0);
});

test("a unit card opens that unit's week sheet instead of leaving the page", async ({
  page,
}) => {
  await freshState(page, finishedBefore("week-1-lecture-p1"));
  await page.goto("/#home");
  await page.locator('.course-card[data-unit="week-3"]').click();
  await expect(page).toHaveURL(/#home\/unit\/week-3$/);
  await expect(
    page.getByRole("dialog", { name: "Week 3 · Algorithms" }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByRole("button", {
      name: `Start · ${unitFirstStep("week-3").title} · ${unitFirstStep("week-3").minutes} min`,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.locator('.course-card[data-unit="week-0"]').click();
  await expect(
    page.getByRole("dialog").getByText("Week complete"),
  ).toBeVisible();
});

test("the unit of the next step is marked in the grid", async ({ page }) => {
  await freshState(page, finishedBefore("week-1-lecture-p1"));
  await page.goto("/#home");
  const marked = page.locator('.course-card[aria-current="true"]');
  await expect(marked).toHaveCount(1);
  await expect(marked).toHaveAttribute("data-unit", "week-1");
  await expect(marked.getByText("Up next")).toBeVisible();
  await expect(page.locator(".now-card")).toContainText("Up next");
});

test("a missing thumbnail leaves the sticker tile and a loaded one covers it", async ({
  page,
}) => {
  await page.route("**/thumbs/week-2.png", (route) =>
    route.fulfill({ status: 404, contentType: "text/html", body: "" }),
  );
  await page.route("**/thumbs/week-3.png", (route) =>
    route.fulfill({ contentType: "image/png", body: pixel }),
  );
  await freshState(page);
  await page.goto("/#home");
  const tile = (unit: string) =>
    page.locator(`.course-card[data-unit="${unit}"] .thumb`);
  await expect(tile("week-3").locator("img")).toBeVisible();
  await expect(tile("week-2").locator("img")).toHaveCount(0);
  await expect(tile("week-2").locator(".thumb-glyph")).toHaveText("2");
  const look = await tile("week-2").evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      background: style.backgroundColor,
      ratio: box.width / box.height,
    };
  });
  expect(look.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(look.ratio).toBeCloseTo(1.6, 1);
  await expect(tile("project").locator("svg")).toBeVisible();
  const image = tile("week-3").locator("img");
  await expect(image).toHaveAttribute("alt", "");
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("width", "640");
  await expect(image).toHaveAttribute("height", "400");
});

test("Home uses the Allo font", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    const heading = document.querySelector("h1")!;
    return {
      body: getComputedStyle(document.body).fontFamily,
      heading: getComputedStyle(heading).fontFamily,
      loaded: document.fonts.check('420 16px "Allo"'),
      face: [...document.fonts].some(
        (face) =>
          face.family.replace(/"/g, "") === "Allo" && face.status === "loaded",
      ),
      weight: getComputedStyle(document.body).fontWeight,
    };
  });
  expect(font.body).toMatch(/^"?Allo"?/);
  expect(font.heading).toMatch(/^"?Allo"?/);
  expect(font.loaded).toBe(true);
  expect(font.face).toBe(true);
  expect(font.weight).toBe("420");
});

test("Home fits a 390px screen with one column of cards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto("/#home");
  await expect(page.locator(".course-card")).toHaveCount(12);
  await noOverflow(page, "Home");
  const lefts = await page
    .locator(".course-card")
    .evaluateAll((cards) =>
      cards.map((card) => Math.round(card.getBoundingClientRect().left)),
    );
  expect(new Set(lefts).size).toBe(1);
});
