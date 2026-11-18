import { expect, test } from "@playwright/test";
import { clearLoginRequests, freshState, noOverflow, steps } from "./helpers";

test.beforeAll(clearLoginRequests);

test("the header opens a title search with at most 20 results and a reader", async ({
  page,
}) => {
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Search the course" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Search the course" }),
  ).toBeVisible();

  const box = dialog.getByRole("searchbox", { name: "Search the course" });
  await expect(box).toBeFocused();
  await box.fill("week");
  const results = dialog
    .getByRole("list", { name: "Results" })
    .getByRole("listitem");
  await expect(results.first()).toBeVisible();
  expect(await results.count()).toBeLessThanOrEqual(20);

  await box.fill("mario");
  await expect(results.first()).toContainText("Mario");
  await results.first().getByRole("button").click();
  await expect(dialog.getByRole("heading", { name: /Mario/ })).toBeVisible();
  await expect(dialog.locator(".imported-prose")).toBeVisible();
  await expect(dialog.getByText(/CC BY-NC-SA/).first()).toBeVisible();
  await dialog.getByRole("button", { name: "Back to results" }).click();
  await expect(box).toHaveValue("mario");

  await box.fill("zzzzqqq");
  await expect(dialog.getByText(/Nothing matches/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("a session has its own Search button and keeps its place when it closes", async ({
  page,
}) => {
  await freshState(page);
  await page.goto(`/#session/${steps[0]!.id}`);
  await page.getByRole("button", { name: "Search the course" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("searchbox").fill("arrays");
  await expect(
    dialog.getByRole("list", { name: "Results" }).getByRole("listitem").first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: steps[0]!.title }),
  ).toBeVisible();
});

test("Terms lists the week's glossary in a popover", async ({ page }) => {
  await freshState(page);
  await page.goto(`/#session/${steps[0]!.id}`);
  await page.getByRole("button", { name: "Terms" }).click();
  const terms = page.getByRole("group", { name: "Terms" });
  await expect(terms.locator("dt").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(terms).toHaveCount(0);
});

test("search fits a 390px screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Search the course" }).click();
  await page.getByRole("searchbox").fill("mario");
  await expect(
    page.getByRole("list", { name: "Results" }).getByRole("listitem").first(),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: ".audit/search-mobile.png" });
});
