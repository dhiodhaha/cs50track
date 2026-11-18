import { expect, test } from "@playwright/test";
import type { WeekContent } from "../src/content/types";
import { clearLoginRequests, flow, freshState, noOverflow } from "./helpers";

test.beforeAll(clearLoginRequests);

async function weekContent(unitId: string): Promise<WeekContent | null> {
  try {
    return (await import(`../src/content/${unitId}.ts`)).default;
  } catch {
    return null;
  }
}

test("every lecture part renders its notes and interactions on a phone", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto("/#home");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (const [unitId, unit] of Object.entries(flow.units)) {
    const content = await weekContent(unitId);
    for (const part of unit.lecture.parts) {
      await page.evaluate((id) => {
        window.location.hash = `#session/${id}`;
      }, part.id);
      await expect(
        page.getByRole("heading", { level: 1, name: part.title }),
        part.id,
      ).toBeVisible();
      for (const heading of part.headings) {
        const section = page.locator(`#sec-${heading.id}`);
        await expect(
          section.locator("h2").first(),
          `${part.id} ${heading.id}`,
        ).toBeVisible();
        const expected =
          content?.parts[part.id]?.after[heading.id]?.length ?? 0;
        await expect(
          section.locator(".ix"),
          `${part.id} ${heading.id} interactions`,
        ).toHaveCount(expected);
      }
      if (content) {
        await expect(page.locator("#part-recap .ix"), part.id).toHaveCount(1);
        await expect(page.locator(".editor"), part.id).toHaveValue(
          content.parts[part.id]!.exercise.starter,
        );
      }
      await noOverflow(page, part.id);
    }
  }
  expect(failures).toEqual([]);
});
