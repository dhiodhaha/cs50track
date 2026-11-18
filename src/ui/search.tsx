import { useMemo, useState } from "react";
import { courseUnits } from "../lib/course";
import type { CourseMaterial } from "../lib/materials";
import { useManifest } from "./data";
import { Modal } from "./forms";
import { MaterialViewer } from "./materials";

export const RESULT_LIMIT = 20;
const HIDDEN_KINDS = new Set<CourseMaterial["kind"]>(["video", "subtitles"]);

/** Title search over the manifest. Titles that start with the query come first. */
export function searchMaterials(
  materials: CourseMaterial[],
  query: string,
  limit = RESULT_LIMIT,
): CourseMaterial[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const phrase = words.join(" ");
  return materials
    .filter((item) => !HIDDEN_KINDS.has(item.kind))
    .flatMap((item) => {
      const title = item.title.toLowerCase();
      if (!words.every((word) => title.includes(word))) return [];
      return [{ item, rank: title.startsWith(phrase) ? 0 : 1 }];
    })
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((entry) => entry.item);
}

const unitLabel = (item: CourseMaterial) =>
  item.unitIds
    .map((id) => courseUnits.find((unit) => unit.id === id))
    .filter((unit) => unit !== undefined)
    .map((unit) => `${unit.title} · ${unit.topic}`)
    .join(", ");

export function SearchModal({ onClose }: { onClose: () => void }) {
  const manifest = useManifest();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<CourseMaterial | null>(null);
  const results = useMemo(
    () => searchMaterials(manifest.data?.materials ?? [], query),
    [manifest.data, query],
  );
  return (
    <Modal title="Search the course" onClose={onClose} wide>
      {manifest.isPending && (
        <p className="muted">Loading the course library…</p>
      )}
      {manifest.isError && (
        <p className="notice danger" role="alert">
          The course library could not be loaded.
        </p>
      )}
      {manifest.data && open && (
        <MaterialViewer
          key={open.id}
          material={open}
          section={null}
          manifest={manifest.data}
          onBack={() => setOpen(null)}
        />
      )}
      {manifest.data && !open && (
        <>
          <label className="search-box">
            <span className="sr-only">Search the course</span>
            <input
              name="course-search"
              type="text"
              role="searchbox"
              autoFocus
              autoComplete="off"
              placeholder="A lecture, a problem, a topic"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {query.trim() === "" ? (
            <p className="muted">
              Type a few words from a title, such as "mario" or "arrays".
            </p>
          ) : results.length === 0 ? (
            <p className="muted">Nothing matches "{query.trim()}".</p>
          ) : (
            <ul className="search-results" aria-label="Results">
              {results.map((item) => (
                <li key={item.id}>
                  {item.delivery === "external" ? (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                      {item.title}
                      <small>
                        {item.kind} · opens on its own site · {unitLabel(item)}
                      </small>
                    </a>
                  ) : (
                    <button type="button" onClick={() => setOpen(item)}>
                      {item.title}
                      <small>
                        {item.kind} · {item.format} · {unitLabel(item)}
                      </small>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
