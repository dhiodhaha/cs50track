import { useEffect, useRef, type MouseEvent } from "react";

const MERMAID_BLOCK = "pre > code.language-mermaid";
/** Padding and border around a diagram, which the drawing cannot use. */
const DIAGRAM_CHROME = 34;
/** A left-to-right flowchart too wide for a phone is redrawn top-down so its text stays readable. */
const LEFT_TO_RIGHT = /^(\s*(?:flowchart|graph))\s+(?:LR|RL)\b/i;
const naturalWidth = (figure: HTMLElement) =>
  figure.querySelector("svg")?.viewBox.baseVal.width ?? 0;
let diagramCount = 0;
let mermaidLoad: Promise<typeof import("mermaid").default> | null = null;

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

/** Loads mermaid on first use, so pages without a diagram never download it. */
function loadMermaid() {
  mermaidLoad ??= import("mermaid")
    .then(({ default: mermaid }) => {
      const ink = cssVar("--ink", "#111111");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: getComputedStyle(document.body).fontFamily,
        themeVariables: {
          background: cssVar("--paper", "#fcfcfc"),
          primaryColor: cssVar("--paper", "#fcfcfc"),
          primaryTextColor: ink,
          primaryBorderColor: ink,
          lineColor: ink,
          textColor: ink,
          edgeLabelBackground: cssVar("--wash", "#eeeeee"),
          fontSize: "16px",
          dropShadow: "none",
        },
        flowchart: { useMaxWidth: true, padding: 12, rankSpacing: 40 },
      });
      return mermaid;
    })
    .catch((error: unknown) => {
      mermaidLoad = null;
      throw error;
    });
  return mermaidLoad;
}

/** What a screen reader hears for a diagram: its kind and the text in its boxes. */
export function diagramLabel(source: string, parts: string[]): string {
  const first = source.trim().split(/\s+/)[0] ?? "";
  const kind = /^(flowchart|graph)/i.test(first)
    ? "Flowchart"
    : /^sequenceDiagram/i.test(first)
      ? "Sequence diagram"
      : "Diagram";
  const named = parts.map((part) => part.trim()).filter(Boolean);
  return named.length > 0 ? `${kind}: ${named.join(", ")}` : kind;
}

/** Swaps each mermaid code block for its diagram. A block that fails to render stays as code. */
async function renderDiagrams(root: HTMLElement, cancelled: () => boolean) {
  const blocks = [...root.querySelectorAll<HTMLElement>(MERMAID_BLOCK)];
  if (blocks.length === 0) return;
  const mermaid = await loadMermaid();
  await document.fonts?.ready;
  for (const code of blocks) {
    const pre = code.parentElement;
    const source = code.textContent ?? "";
    const id = `diagram-${++diagramCount}`;
    try {
      if (!pre || !(await mermaid.parse(source, { suppressErrors: true })))
        continue;
      let { svg } = await mermaid.render(id, source);
      if (cancelled() || !pre.isConnected) return;
      const figure = document.createElement("figure");
      figure.className = "diagram";
      figure.setAttribute("role", "img");
      figure.innerHTML = svg;
      const room = root.clientWidth - DIAGRAM_CHROME;
      if (LEFT_TO_RIGHT.test(source) && naturalWidth(figure) > room * 1.25) {
        ({ svg } = await mermaid.render(
          `${id}-down`,
          source.replace(LEFT_TO_RIGHT, "$1 TD"),
        ));
        if (cancelled() || !pre.isConnected) return;
        figure.innerHTML = svg;
      }
      const parts = [...figure.querySelectorAll(".nodeLabel")].map(
        (node) => node.textContent ?? "",
      );
      figure.setAttribute("aria-label", diagramLabel(source, parts));
      pre.replaceWith(figure);
    } catch {
      document.getElementById(`d${id}`)?.remove();
      document.getElementById(id)?.remove();
    }
  }
}

/**
 * CS50's imported HTML, already sanitised by the importer. Links inside the
 * page scroll to their target when it is on screen; everything else keeps the
 * importer's `target="_blank"`. Mermaid code blocks become diagrams.
 */
export function ProseHtml({ html }: { html: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stale = false;
    if (root.current) void renderDiagrams(root.current, () => stale);
    return () => {
      stale = true;
    };
  }, [html]);

  function followAnchor(event: MouseEvent<HTMLDivElement>) {
    const href = (event.target as Element).closest("a")?.getAttribute("href");
    if (!href?.startsWith("#")) return;
    event.preventDefault();
    let id = href.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // keep the raw id
    }
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: "start" });
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  return (
    <div
      ref={root}
      className="imported-prose prose"
      onClick={followAnchor}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
