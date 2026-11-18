import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import { courseUnits } from "../src/lib/course";
import { allSteps, emptyStudy, flowSchema, type Step } from "../src/lib/flow";
import type { AppState } from "../src/lib/model";
import { createInitialState, dateInZone } from "../src/lib/schedule";

export const flow = flowSchema.parse(
  JSON.parse(readFileSync("public/course/2026/flow.json", "utf8")),
);
export const steps: Step[] = allSteps(flow);
export const stepById = (id: string) => steps.find((step) => step.id === id)!;
export const ORIGIN = "http://127.0.0.1:5173";

export function clearLoginRequests() {
  execFileSync(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "cs50track",
      "--local",
      "--command",
      "DELETE FROM login_requests",
    ],
    { stdio: "pipe" },
  );
}

export async function signIn(page: Page) {
  await page.goto("/");
  const bypass = (await (await page.request.get("/api/auth/session")).json())
    .authenticated;
  if (bypass) return;
  await page.getByLabel("Email address").fill("student@localhost.test");
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith("/api/auth/request")),
    page.getByRole("button", { name: "Send me a login link" }).click(),
  ]);
  await page
    .getByRole("link", { name: "Open captured local login link" })
    .click();
  await page
    .getByRole("button", { name: "Continue to CS50 Track", exact: true })
    .click();
}

export async function readState(
  page: Page,
): Promise<{ revision: number; state: AppState }> {
  const response = await page.request.get("/api/state");
  expect(response.ok()).toBe(true);
  return response.json();
}

export async function writeState(page: Page, state: AppState) {
  const current = await readState(page);
  const response = await page.request.put("/api/state", {
    headers: { Origin: ORIGIN },
    data: {
      revision: current.revision,
      state,
      operationId: crypto.randomUUID(),
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
}

/**
 * Signs in, then replaces the saved state with a fresh one, optionally changed.
 * The page is left blank so the next goto loads the new state instead of
 * reusing what the app cached while signing in.
 */
export async function freshState(
  page: Page,
  change: (state: AppState) => AppState = (state) => state,
) {
  await signIn(page);
  await writeState(page, change(createInitialState()));
  await page.goto("about:blank");
}

/** Marks every step before `stepId` as finished, so it becomes the next one. */
export function finishedBefore(stepId: string) {
  return (state: AppState): AppState => {
    const resources: Record<string, boolean> = {};
    const attempts: AppState["attempts"] = [];
    for (const step of steps) {
      if (step.id === stepId) break;
      if (step.stage === "problems") {
        const group = courseUnits
          .find((unit) => unit.id === step.unitId)!
          .groups.find((item) => item.id === step.groupId)!;
        attempts.push({
          id: crypto.randomUUID(),
          assignmentId: group.assignments[0]!.id,
          submittedAt: "2026-11-18T03:00:00.000Z",
          kind: "passed",
          score: 100,
          url: "",
          note: "",
        });
      } else resources[step.id] = true;
    }
    return { ...state, resources, attempts };
  };
}

export async function noOverflow(page: Page, label = "page") {
  const result = await page.evaluate(() => {
    const width = window.innerWidth;
    const wide = [...document.querySelectorAll<HTMLElement>("body *")].find(
      (element) => element.getBoundingClientRect().right > width + 1,
    );
    return {
      excess: document.documentElement.scrollWidth - width,
      culprit: wide
        ? `${wide.tagName.toLowerCase()}.${wide.className} in ${wide.parentElement?.className} "${(wide.textContent ?? "").slice(0, 60)}"`
        : "",
    };
  });
  expect(
    result.excess,
    `${label} overflows by ${result.culprit}`,
  ).toBeLessThanOrEqual(0);
}

/** Recall questions already answered, so no warm-up is due. */
export function recallAnswered(ids: string[]) {
  return (state: AppState): AppState => ({
    ...state,
    study: {
      ...(state.study ?? emptyStudy()),
      recall: Object.fromEntries(
        ids.map((id) => [id, { level: 1, due: "2099-01-01" }]),
      ),
    },
  });
}

/** Deadlines move with the start date, so tests that need an open week start today. */
export function startedToday(state: AppState): AppState {
  return {
    ...state,
    settings: {
      ...state.settings,
      startDate: dateInZone(new Date(), state.settings.timezone),
    },
  };
}

/** The week sheet or the outline sheet, whichever is open. */
export const sheetOf = (page: Page) => page.locator("dialog.sheet");

/** Waits until the sheet has finished sliding in. */
export async function sheetSettled(page: Page) {
  await expect(sheetOf(page)).toHaveAttribute("data-state", "open");
  await page.waitForFunction(() => {
    const element = document.querySelector("dialog.sheet");
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.transform === "none" && style.opacity === "1";
  });
}

/** A passing result for an assignment, recorded at a given moment. */
export const passed =
  (assignmentId: string, submittedAt: string, score = 100) =>
  (state: AppState): AppState => ({
    ...state,
    attempts: [
      ...state.attempts,
      {
        id: crypto.randomUUID(),
        assignmentId,
        submittedAt,
        kind: "passed",
        score,
        url: "",
        note: "",
      },
    ],
  });

export const startedOn =
  (startDate: string) =>
  (state: AppState): AppState => ({
    ...state,
    settings: { ...state.settings, startDate },
  });

export const compose =
  (...changes: ((state: AppState) => AppState)[]) =>
  (state: AppState): AppState =>
    changes.reduce((current, change) => change(current), state);
