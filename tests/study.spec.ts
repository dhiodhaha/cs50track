import { expect, test, type Page } from "@playwright/test";
import { unitDeadline } from "../src/lib/pace";
import { addDays, createInitialState, dateInZone } from "../src/lib/schedule";
import { heartbeatSession, startSession } from "../src/lib/sessions";
import { longDate } from "../src/ui/format";
import {
  clearLoginRequests,
  freshState,
  readState,
  signIn,
  startedToday,
  steps,
  writeState,
} from "./helpers";

test.beforeAll(clearLoginRequests);

const first = steps[0]!;

async function saveClick(page: Page, name: string) {
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/state") &&
        r.request().method() === "PUT" &&
        r.ok(),
    ),
    page.getByRole("button", { name, exact: true }).click(),
  ]);
}

test("a session left running is paused at its last heartbeat and its time can be corrected", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await signIn(page);
  const now = Date.now();
  let state = startSession(
    createInitialState(),
    first,
    new Date(now - 600_000),
  );
  state = heartbeatSession(state, new Date(now - 540_000));
  const recoveryId = state.activeSessionId;
  await writeState(page, state);
  await page.goto("about:blank");
  await page.goto("/#home");
  await expect(page.locator(".recovery")).toContainText(
    "paused it at the last saved moment",
  );
  state = (await readState(page)).state;
  expect(state.sessions.find((s) => s.id === recoveryId)).toMatchObject({
    status: "paused",
    elapsedSeconds: 60,
  });

  await page.getByRole("button", { name: "Correct time", exact: true }).click();
  await expect(page.getByLabel("Course task")).toHaveValue(first.id);
  await page.getByLabel("Study minutes").fill("30");
  await page.getByLabel("Date", { exact: true }).fill("2026-11-16");
  await page.getByLabel("Notes, optional").fill("Corrected after reopening");
  await saveClick(page, "Save study time");
  state = (await readState(page)).state;
  expect(state.sessions.filter((s) => s.id === recoveryId)).toHaveLength(1);
  expect(state.sessions.find((s) => s.id === recoveryId)).toMatchObject({
    elapsedSeconds: 1800,
    manual: true,
    note: "Corrected after reopening",
    taskId: first.id,
    startedAt: "2026-11-15T17:00:00.000Z",
  });
  expect(state.sessionRecoveryId).toBeNull();
  await expect(page.locator(".recovery")).toHaveCount(0);
  expect(failures).toEqual([]);
});

test("keeping the recorded time clears the notice without changing the session", async ({
  page,
}) => {
  await signIn(page);
  const now = Date.now();
  let state = startSession(
    createInitialState(),
    first,
    new Date(now - 600_000),
  );
  state = heartbeatSession(state, new Date(now - 540_000));
  await writeState(page, state);
  await page.goto("about:blank");
  await page.goto("/#home");
  await expect(page.locator(".recovery")).toBeVisible();
  await saveClick(page, "Keep recorded time");
  const saved = (await readState(page)).state;
  expect(saved.sessionRecoveryId).toBeNull();
  expect(saved.sessions[0]).toMatchObject({
    status: "paused",
    elapsedSeconds: 60,
  });
});

test("a stale save keeps what was typed, and a retried save is applied once", async ({
  page,
}) => {
  await freshState(page, startedToday);
  await page.goto("/#home/unit/week-1");
  const record = page.getByRole("button", {
    name: "Record result for Cash",
    exact: true,
  });
  const dialog = page.getByRole("dialog", { name: "Record your result" });
  await record.click();
  await dialog.getByLabel("Score, optional").fill("40");
  const conflict = (await readState(page)).revision;
  await page.route("**/api/state", async (route) => {
    if (route.request().method() === "PUT")
      await route.fulfill({
        status: 409,
        json: {
          error: "Your plan changed on another device. Reload before saving.",
          revision: conflict,
        },
      });
    else await route.continue();
  });
  await dialog.getByRole("button", { name: "Save result" }).click();
  await expect(dialog.getByRole("alert")).toContainText("another device");
  await expect(dialog.getByLabel("Score, optional")).toHaveValue("40");
  await page.unroute("**/api/state");
  await saveClick(page, "Save result");
  expect((await readState(page)).state.attempts).toHaveLength(1);

  await page
    .getByRole("button", { name: "Record result for Credit", exact: true })
    .click();
  await dialog.getByLabel("Score, optional").fill("75");
  const operations: string[] = [];
  await page.route("**/api/state", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }
    operations.push(route.request().postDataJSON().operationId);
    if (operations.length === 1) {
      const response = await route.fetch();
      expect(response.ok()).toBe(true);
      await route.abort("failed");
    } else await route.continue();
  });
  await saveClick(page, "Save result");
  await page.unroute("**/api/state");
  expect(operations).toHaveLength(2);
  expect(operations[0]).toBe(operations[1]);
  expect((await readState(page)).state.attempts).toHaveLength(2);
});

test("settings move every deadline with the start date", async ({ page }) => {
  await freshState(page);
  const timezone = (await readState(page)).state.settings.timezone;
  const start = addDays(dateInZone(new Date(), timezone), 3);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(/Changing the start date moves every weekly deadline/),
  ).toBeVisible();
  await dialog.getByLabel(/Start date/).fill(start);
  await saveClick(page, "Save settings");
  const saved = (await readState(page)).state;
  expect(saved.settings.startDate).toBe(start);
  expect(saved.plan.startDate).toBe(start);
  await expect(
    page.getByText(
      `Problem set due ${longDate(unitDeadline("week-0", start))}`,
    ),
  ).toBeVisible();
  await page.locator('.course-card[data-unit="week-5"]').click();
  await expect(page.locator("dialog.sheet")).toContainText(
    `Due ${longDate(unitDeadline("week-5", start))}`,
  );
});

test("sign out leaves the study space", async ({ page }) => {
  await freshState(page);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Menu" }).click();
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/auth/logout")),
    page.getByRole("button", { name: "Sign out" }).click(),
  ]);
  const bypass = (await (await page.request.get("/api/auth/session")).json())
    .authenticated;
  if (bypass)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  else await expect(page.getByLabel("Email address")).toBeVisible();
});
