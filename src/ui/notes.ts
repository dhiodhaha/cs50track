export type HtmlSection = {
  id: string;
  title: string;
  /** The heading's inner HTML, so a caller can render the heading itself. */
  heading: string;
  /** Everything after the heading. */
  body: string;
  /** The whole section, heading included. */
  html: string;
};

const H2 = /<h2\b[^>]*>/g;
const stripTags = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

/**
 * Splits imported course HTML at each top-level `<h2>`. The importer emits
 * sanitised, flat markup, and code samples escape `<`, so a literal `<h2`
 * always starts a section. `intro` is whatever precedes the first one.
 */
export function splitAtH2(html: string): {
  intro: string;
  sections: HtmlSection[];
} {
  const starts = [...html.matchAll(H2)].map((match) => match.index);
  if (starts.length === 0) return { intro: html, sections: [] };
  const sections = starts.map((start, index) => {
    const chunk = html.slice(start, starts[index + 1] ?? html.length);
    const open = chunk.match(/^<h2\b[^>]*>/)![0];
    const id = open.match(/\bid="([^"]*)"/)?.[1] ?? "";
    const closed = chunk.match(/^<h2\b[^>]*>([\s\S]*?)<\/h2>/);
    const heading = closed?.[1] ?? "";
    return {
      id,
      title: stripTags(heading),
      heading,
      body: closed ? chunk.slice(closed[0].length) : chunk.slice(open.length),
      html: chunk,
    };
  });
  return { intro: html.slice(0, starts[0]), sections };
}

/** Drops the document title and the generated table of contents from an intro. */
export function cleanIntro(intro: string): string {
  return intro
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, "")
    .replace(/<ul id="markdown-toc">[\s\S]*?<\/ul>/, "")
    .trim();
}
