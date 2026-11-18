import { test, expect, type APIRequestContext } from "@playwright/test";
import { emptyStudy } from "../src/lib/flow";
import { targetDate } from "../src/lib/pace";
import { createInitialState, dateInZone } from "../src/lib/schedule";

const origin = "http://127.0.0.1:5173";

function publicState(enabled: boolean) {
  const state = createInitialState();
  state.settings.startDate = dateInZone(new Date(), state.settings.timezone);
  const study = emptyStudy();
  study.publicPage = { enabled, name: "Ada Lovelace" };
  study.reflections = [
    {
      id: "r1",
      date: state.settings.startDate,
      stepId: "week-0-lecture",
      learned: "PRIVATE-REFLECTION",
      unclear: "PRIVATE-UNCLEAR",
    },
  ];
  study.exercises = { "week-0-exercise": "PRIVATE-EXERCISE" };
  return { ...state, study };
}

async function save(request: APIRequestContext, state: unknown) {
  const current = await (await request.get("/api/state")).json();
  const response = await request.put("/api/state", {
    headers: { Origin: origin },
    data: {
      revision: current.revision,
      state,
      operationId: crypto.randomUUID(),
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
}

test("the public page shows the record signed out, and goes private when switched off", async ({
  browser,
  request,
}) => {
  const previous = (await (await request.get("/api/state")).json()).state;
  try {
    const state = publicState(true);
    await save(request, state);

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    expect(await context.cookies()).toEqual([]);
    const page = await context.newPage();
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto("/p");

    await expect(page).toHaveTitle(/CS50x progress record/);
    await expect(
      page.getByRole("heading", { name: "Ada Lovelace" }),
    ).toBeVisible();
    const target = new Date(
      `${targetDate(state.settings.startDate)}T00:00:00Z`,
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    await expect(page.locator(".pub-countdown")).toHaveText(
      `Finishing by ${target} · 69 days left`,
    );

    const api = await context.request.get("/api/public");
    expect(api.status()).toBe(200);
    const body = await api.json();
    const rows = page.locator(".pub-weeks > li");
    await expect(rows).toHaveCount(body.weeks.length);
    expect(body.weeks.length).toBeGreaterThanOrEqual(10);
    await expect(rows.first()).toContainText("Week 0");
    await expect(rows.first()).toContainText("This week");
    await expect(rows.last()).toContainText("Upcoming");
    await expect(page.locator(".pub-totals")).toHaveText(
      "0 steps done · 0 days active · 0 hours studied",
    );
    await expect(page.getByRole("link", { name: "CS50Track" })).toHaveAttribute(
      "href",
      "/",
    );
    const text = await page.locator("body").innerText();
    expect(text).not.toContain("PRIVATE-");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const badge = await context.request.get("/api/public/badge.svg");
    expect(badge.status()).toBe(200);
    expect(badge.headers()["content-type"]).toContain("image/svg+xml");
    const svg = await badge.text();
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("week 1 of 10 · on track");
    expect(svg).not.toContain("PRIVATE-");

    await save(request, publicState(false));
    expect((await context.request.get("/api/public")).status()).toBe(404);
    await page.goto("/p");
    await expect(
      page.getByRole("heading", { name: "This progress page is private." }),
    ).toBeVisible();
    const hidden = await context.request.get("/api/public/badge.svg");
    expect(hidden.status()).toBe(200);
    expect(await hidden.text()).toContain(">private<");
    expect(failures).toEqual([]);
    await context.close();
  } finally {
    if (previous) await save(request, previous);
  }
});
