import { expect, test, type Locator, type Page } from "@playwright/test";
import { chaptersInRange } from "../src/ui/chapters";
import { chapterTime, chapterTitle, mediaTime } from "../src/ui/format";
import { clearLoginRequests, flow, freshState, noOverflow } from "./helpers";

test.beforeAll(clearLoginRequests);

const lecture = flow.units["week-0"]!.lecture;
const part1 = lecture.parts[0]!;
const part2 = lecture.parts[1]!;
const approximate = part1.headings.find((heading) => !heading.exact)!;
const exact = part1.headings.find((heading) => heading.exact)!;
const diagramSection = "computer-science-and-problem-solving";

const timeOf = (video: Locator) =>
  video.evaluate((v: HTMLVideoElement) => v.currentTime);
const paused = (video: Locator) =>
  video.evaluate((v: HTMLVideoElement) => v.paused);

async function openPart(page: Page, id = part1.id) {
  await freshState(page);
  await page.goto(`/#session/${id}`);
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), {
      timeout: 60_000,
    })
    .toBeGreaterThanOrEqual(1);
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = true;
  });
  return video;
}

test("a section's time chip plays the lecture from that heading", async ({
  page,
}) => {
  const video = await openPart(page);
  const head = page.locator(`#sec-${exact.id} .part-head`);
  await expect(head.locator("h2")).toContainText(exact.title);
  const chip = head.getByRole("button", {
    name: `Play the lecture from ${mediaTime(exact.start)}, ${exact.title}`,
  });
  await expect(chip).toHaveText(mediaTime(exact.start));

  await chip.click();
  await expect.poll(() => timeOf(video)).toBeGreaterThanOrEqual(exact.start);
  expect(await timeOf(video)).toBeLessThan(exact.start + 15);
  await expect.poll(() => paused(video)).toBe(false);
  const box = (await video.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
});

test("a time matched from subtitles shows as approximate", async ({ page }) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const time = mediaTime(approximate.start);
  const chip = page
    .locator(`#sec-${approximate.id} .part-head`)
    .getByRole("button", {
      name: `Play the lecture from about ${time}, ${approximate.title}`,
    });
  await expect(chip).toHaveText(`≈ ${time}`);
  const sure = page
    .locator(`#sec-${exact.id} .part-head`)
    .getByRole("button", { name: /^Play the lecture from \d/ });
  await expect(sure).not.toContainText("≈");
});

test("the chip sits on the heading's row and does not crowd it at 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const head = page.locator(`#sec-${exact.id} .part-head`);
  const chip = head.getByRole("button");
  await expect(chip).toBeVisible();
  const heading = (await head.locator("h2").boundingBox())!;
  const pill = (await chip.boundingBox())!;
  expect(pill.x).toBeGreaterThanOrEqual(heading.x + heading.width - 1);
  expect(pill.y).toBeLessThan(heading.y + 32);
  expect(pill.x + pill.width).toBeLessThanOrEqual(390 - 12);
  await noOverflow(page, "lecture page at 390px");
});

test("Chapters lists this part's chapters, marks the current one and seeks", async ({
  page,
}) => {
  const video = await openPart(page);
  const inPart = chaptersInRange(
    lecture.chapters,
    part1.start,
    part1.end,
    lecture.durationSeconds,
  );
  expect(inPart.length).toBeLessThan(lecture.chapters.length);

  await page.getByRole("button", { name: "Chapters" }).click();
  const panel = page.getByRole("group", { name: "Chapters" });
  const rows = panel.locator(".chapter-row");
  await expect(rows).toHaveCount(inPart.length);
  await expect(rows.first()).toContainText(
    chapterTime(inPart[0]!.start, lecture.durationSeconds),
  );
  await expect(rows.first()).toContainText(chapterTitle(inPart[0]!.title));
  await expect(panel.locator('[aria-current="true"]')).toHaveCount(1);
  await expect(rows.first()).toHaveAttribute("aria-current", "true");
  await expect(rows.first()).toContainText("Now");
  await expect(
    panel.getByRole("button", { name: /^\d+:\d\d:\d\d ASCII/ }),
  ).toHaveCount(0);

  const target = inPart[4]!;
  await rows.nth(4).click();
  await expect(panel).toHaveCount(0);
  await expect.poll(() => timeOf(video)).toBeGreaterThanOrEqual(target.start);
  expect(await timeOf(video)).toBeLessThan(target.start + 15);
  await expect.poll(() => paused(video)).toBe(false);
  await expect(page.getByRole("button", { name: "Chapters" })).toBeFocused();

  await video.evaluate((v: HTMLVideoElement) => v.pause());
  await page.getByRole("button", { name: "Chapters" }).click();
  await expect(
    page
      .getByRole("group", { name: "Chapters" })
      .locator('[aria-current="true"]'),
  ).toContainText(chapterTitle(target.title));
});

test("Chapters can show the whole lecture, and badges use h:mm:ss", async ({
  page,
}) => {
  await openPart(page);
  await page.getByRole("button", { name: "Chapters" }).click();
  const panel = page.getByRole("group", { name: "Chapters" });
  await panel.getByRole("button", { name: "Show the whole lecture" }).click();
  await expect(panel.locator(".chapter-row")).toHaveCount(
    lecture.chapters.length,
  );
  const last = lecture.chapters[lecture.chapters.length - 1]!;
  await expect(panel.locator(".chapter-row").last()).toContainText(
    chapterTime(last.start, lecture.durationSeconds),
  );
  await panel.getByRole("button", { name: "Show this part only" }).click();
  await expect(panel.locator(".chapter-row")).toHaveCount(
    chaptersInRange(
      lecture.chapters,
      part1.start,
      part1.end,
      lecture.durationSeconds,
    ).length,
  );
});

test("a chapter outside the part plays on without pausing at the part's end", async ({
  page,
}) => {
  const video = await openPart(page);
  const next = lecture.chapters.find((chapter) => chapter.start === part1.end)!;
  await page.getByRole("button", { name: "Chapters" }).click();
  const panel = page.getByRole("group", { name: "Chapters" });
  await panel.getByRole("button", { name: "Show the whole lecture" }).click();
  await panel
    .getByRole("button", { name: new RegExp(chapterTitle(next.title)) })
    .click();
  await expect.poll(() => timeOf(video)).toBeGreaterThanOrEqual(next.start);
  await expect.poll(() => paused(video)).toBe(false);
  await page.waitForTimeout(2500);
  await expect(page.getByText("End of this part")).toHaveCount(0);
  expect(await paused(video)).toBe(false);
});

test("chapter titles that start with a dash lose it", async ({ page }) => {
  await freshState(page);
  const unit = flow.units["week-1"]!;
  const dashed = unit.lecture.chapters.find((chapter) =>
    /^[–-] /.test(chapter.title),
  )!;
  const part = unit.lecture.parts.find(
    (item) => dashed.start >= item.start && dashed.start < item.end,
  )!;
  await page.goto(`/#session/${part.id}`);
  await page.getByRole("button", { name: "Chapters" }).click();
  const row = page
    .getByRole("group", { name: "Chapters" })
    .locator(".chapter-row")
    .filter({ hasText: chapterTitle(dashed.title) });
  await expect(row.locator(".chapter-title")).toHaveText(
    chapterTitle(dashed.title),
  );
});

test("keys l and k move and toggle the video, with no clash in the exercise editor", async ({
  page,
}) => {
  const video = await openPart(page);
  const before = await timeOf(video);

  await page.keyboard.press("l");
  await expect
    .poll(() => timeOf(video))
    .toBeGreaterThanOrEqual(before + 10 - 0.5);
  await page.keyboard.press("j");
  await expect.poll(() => timeOf(video)).toBeLessThan(before + 5);

  await page.keyboard.press("k");
  await expect.poll(() => paused(video)).toBe(false);
  await page.keyboard.press("k");
  await expect.poll(() => paused(video)).toBe(true);

  const stopped = await timeOf(video);
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Alt+l");
  expect(await paused(video)).toBe(true);
  expect(await timeOf(video)).toBeCloseTo(stopped, 1);

  const editor = page.locator("textarea.editor");
  await editor.scrollIntoViewIfNeeded();
  await editor.click();
  const typed = await editor.inputValue();
  await page.keyboard.type("k l m c , . < >  ");
  await expect(editor).toHaveValue(`${typed}k l m c , . < >  `);
  expect(await paused(video)).toBe(true);
  expect(await timeOf(video)).toBeCloseTo(stopped, 1);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await expect(page.getByRole("button", { name: "1x" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("space still presses a focused button, and keys on the focused video act once", async ({
  page,
}) => {
  const video = await openPart(page);
  const faster = page.getByRole("button", { name: "1.5x" });
  await faster.focus();
  await page.keyboard.press("Space");
  await expect(faster).toHaveAttribute("aria-pressed", "true");
  expect(await paused(video)).toBe(true);

  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Space");
  await expect.poll(() => paused(video)).toBe(false);

  await video.focus();
  const at = await timeOf(video);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  expect((await timeOf(video)) - at).toBeGreaterThanOrEqual(9.5);
  expect((await timeOf(video)) - at).toBeLessThan(11.5);
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  expect(await paused(video)).toBe(true);
  await page.keyboard.press("Space");
  await expect.poll(() => paused(video)).toBe(false);
});

test("period and comma step one frame while paused, and < and > change speed", async ({
  page,
}) => {
  const video = await openPart(page);
  await page.keyboard.press("l");
  const base = await timeOf(video);
  await page.keyboard.press(".");
  await expect.poll(() => timeOf(video)).toBeGreaterThan(base);
  expect((await timeOf(video)) - base).toBeLessThan(0.1);
  await page.keyboard.press(",");
  await expect.poll(() => timeOf(video)).toBeCloseTo(base, 2);

  await page.keyboard.press(">");
  await expect(page.getByRole("button", { name: "1.25x" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.playbackRate))
    .toBe(1.25);
  await page.keyboard.press("<");
  await page.keyboard.press("<");
  await expect(page.getByRole("button", { name: "1x" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("m mutes and c turns captions on and off", async ({ page }) => {
  const video = await openPart(page);
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = false;
  });
  await page.keyboard.press("m");
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  await page.keyboard.press("m");
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);

  const mode = () =>
    video.evaluate((v: HTMLVideoElement) => v.textTracks[0]?.mode);
  await expect.poll(mode).not.toBe("showing");
  await page.keyboard.press("c");
  await expect.poll(mode).toBe("showing");
  await page.keyboard.press("c");
  await expect.poll(mode).not.toBe("showing");
});

test("the Shortcuts list opens from the keyboard and shows each key", async ({
  page,
}) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const button = page.getByRole("button", { name: "Shortcuts" });
  await button.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("group", { name: "Shortcuts" });
  await expect(panel).toBeVisible();
  await expect(panel.locator("kbd")).toHaveCount(13);
  await expect(panel.getByText("Play or pause")).toBeVisible();
  await expect(panel.locator("kbd").first()).toHaveText(/Space/);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("the Chapters popover stays inside the screen at 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  await page.getByRole("button", { name: "Chapters" }).click();
  const panel = page.getByRole("group", { name: "Chapters" });
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await expect(panel).toHaveCSS("overscroll-behavior-y", "contain");
  await noOverflow(page, "lecture page with Chapters open");
});

test("a part without chapters hides the Chapters button", async ({ page }) => {
  await page.route("**/course/2026/flow.json", async (route) => {
    const body = await (await route.fetch()).json();
    body.units["week-0"].lecture.chapters = [];
    await route.fulfill({ json: body });
  });
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  await expect(page.getByRole("button", { name: "Shortcuts" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chapters" })).toHaveCount(0);
});

test("a mermaid block in the notes becomes a diagram", async ({ page }) => {
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const section = page.locator(`#sec-${diagramSection}`);
  const diagram = section.locator("figure.diagram");
  await expect(diagram.locator("svg")).toBeVisible({ timeout: 30_000 });
  await expect(diagram).toHaveAttribute("role", "img");
  await expect(diagram).toHaveAttribute(
    "aria-label",
    /^Flowchart: input, \?\?\?, output$/,
  );
  await expect(page.getByText("flowchart LR")).toHaveCount(0);
  await expect(section.locator("pre code.language-mermaid")).toHaveCount(0);
  const svg = (await diagram.locator("svg").boundingBox())!;
  expect(svg.width).toBeGreaterThan(150);
  expect(svg.height).toBeGreaterThan(30);
});

test("the diagram fits a 390px screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const diagram = page.locator(`#sec-${diagramSection} figure.diagram`);
  await expect(diagram.locator("svg")).toBeVisible({ timeout: 30_000 });
  const box = (await diagram.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await noOverflow(page, "lecture page with a diagram at 390px");
});

test("mermaid only loads for a page that has a diagram", async ({ page }) => {
  const loaded: string[] = [];
  page.on("request", (request) => {
    if (/mermaid/i.test(request.url())) loaded.push(request.url());
  });
  await freshState(page);
  await page.goto(`/#session/${part2.id}`);
  await expect(page.locator(".part-head").first()).toBeVisible();
  await page.waitForTimeout(1000);
  expect(loaded).toEqual([]);

  await page.goto(`/#session/${part1.id}`);
  await expect(page.locator("figure.diagram svg")).toBeVisible({
    timeout: 30_000,
  });
  expect(loaded.length).toBeGreaterThan(0);
});

test("a mermaid block that cannot be drawn stays as code", async ({ page }) => {
  await page.route("**/course/2026/documents/*.json", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    if (typeof body.html === "string")
      body.html = body.html.replace(
        /<pre><code class="language-mermaid">[\s\S]*?<\/code><\/pre>/,
        '<pre><code class="language-mermaid">flowchart LR\n  a --&gt;&gt;&gt; ((((</code></pre>',
      );
    await route.fulfill({ response, json: body });
  });
  await freshState(page);
  await page.goto(`/#session/${part1.id}`);
  const section = page.locator(`#sec-${diagramSection}`);
  await expect(section.locator("pre code.language-mermaid")).toContainText(
    "flowchart LR",
  );
  await page.waitForTimeout(1500);
  await expect(section.locator("figure.diagram")).toHaveCount(0);
  await expect(section.locator("pre code.language-mermaid")).toBeVisible();
});
