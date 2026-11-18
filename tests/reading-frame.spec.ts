import { expect, test, type Page } from "@playwright/test";
import {
  clearLoginRequests,
  finishedBefore,
  freshState,
  stepById,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const lecture = stepById("week-0-lecture-p2");
const clip = stepById("week-1-short-data-types");
const rail = (page: Page) =>
  page.getByRole("complementary", { name: "On this page" });
const current = (page: Page) => rail(page).locator('[aria-current="location"]');

async function reading(page: Page) {
  return page.locator("main.reading").evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { x: Math.round(box.x), width: Math.round(box.width) };
  });
}

test("the On this page marker follows the section being read, not the one above it", async ({
  page,
}) => {
  await freshState(page, finishedBefore(lecture.id));
  await page.goto(`#session/${lecture.id}`);
  await expect(rail(page)).toBeVisible();
  await expect(current(page)).toHaveCount(1);
  const labels = await rail(page).locator("a").allInnerTexts();
  expect(labels.slice(-2)).toEqual(["Recap", "Exercise"]);

  // Scroll so each section's heading sits just below the sticky bar, then ask what is marked.
  for (const label of labels) {
    await rail(page).getByRole("link", { name: label, exact: true }).click();
    await expect(current(page)).toHaveText(label);
  }

  // The last questions of one section share the screen with the next heading.
  // The next heading has crossed the reading line, so it must win.
  const recap = page.locator("#part-recap");
  await recap.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.2);
  });
  await expect(current(page)).toHaveText("Recap");
  // Just below the line the earlier section is still the one being read.
  await recap.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.6);
  });
  await expect(current(page)).not.toHaveText("Recap");

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(current(page)).toHaveText("Exercise");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(current(page)).toHaveText(labels[0]!);
});

test("the reading column stays put between pages with and without an On this page list", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await freshState(page, finishedBefore(clip.id));
  await page.goto(`#session/${lecture.id}`);
  await expect(rail(page)).toBeVisible();
  const withRail = await reading(page);

  await page.goto(`#session/${clip.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: clip.title }),
  ).toBeVisible();
  await expect(rail(page)).toHaveCount(0);
  expect(await reading(page)).toEqual(withRail);

  // The close-out and warm-up screens use the same column.
  await page.goto(`#session/${lecture.id}`);
  await expect(rail(page)).toBeVisible();
  await page.getByRole("button", { name: "Exit" }).click();
  expect(withRail.width).toBe(680);
});

test("a lesson page keeps its column when the page grows a scrollbar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await freshState(page, finishedBefore(clip.id));
  await page.goto(`#session/${clip.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: clip.title }),
  ).toBeVisible();
  const gutter = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollbarGutter,
  );
  expect(gutter).toContain("stable");
});

test("the brand is text only, with no logo icon", async ({ page }) => {
  await freshState(page);
  await page.goto("#home");
  const brand = page.getByRole("link", { name: "CS50 Track home" });
  await expect(brand).toBeVisible();
  await expect(brand).toHaveText("cs50track");
  await expect(brand.locator("svg, img, .brand-symbol")).toHaveCount(0);
});
