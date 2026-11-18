import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
  FileText,
  Search,
} from "lucide-react";
import {
  courseDocumentSchema,
  type CourseDocument,
  type CourseMaterial,
  type MaterialManifest,
} from "../lib/materials";
import "./materials.css";

const friendlyDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
async function readJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error("This imported material could not be loaded.");
  return response.json();
}
function MaterialFailure({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return (
    <div className="material-status" role="alert">
      <h3>Couldn’t open this material</h3>
      <p>{error}</p>
      <button type="button" className="button secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function MaterialViewer({
  material,
  section,
  manifest,
  onBack,
}: {
  material: CourseMaterial;
  section: string | null;
  manifest: MaterialManifest;
  onBack: () => void;
}) {
  const url = material.localUrl ?? material.sourceUrl;
  const isPdf =
    material.format.toLowerCase() === "pdf" || /\.pdf(?:$|[?#])/.test(url);
  return (
    <div className="material-viewer">
      <button
        type="button"
        className="text-link material-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to results
      </button>
      <header className="material-document-heading">
        <p>
          {material.kind} · {material.format}
        </p>
        <h2>{material.title}</h2>
        <div>
          <span>
            {material.delivery === "document" || material.localUrl
              ? `Imported ${friendlyDate(material.fetchedAt)}`
              : "Hosted by the official provider"}
          </span>
          <a href={material.sourceUrl} target="_blank" rel="noreferrer">
            Original source <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      {material.delivery === "document" && material.localUrl ? (
        <DocumentReader
          key={material.id}
          material={material}
          section={section}
        />
      ) : material.kind === "audio" ? (
        <MediaPlayer material={material} audio />
      ) : material.kind === "video" ? (
        <MediaPlayer material={material} />
      ) : isPdf ? (
        <div className="native-pdf">
          <iframe src={url} title={`${material.title} PDF`} />
          <a
            className="text-link"
            href={url}
            target="_blank"
            rel="noreferrer"
            download
          >
            <Download size={16} />
            Open or download this PDF
          </a>
        </div>
      ) : (
        <div className="native-download">
          <FileText size={24} />
          <h3>{material.title}</h3>
          <p>
            {material.localUrl
              ? "This file is stored with your course library."
              : "This file is available from the original course source."}
            {material.bytes ? ` ${fileSize(material.bytes)}.` : ""}
          </p>
          <a className="button secondary" href={url} download>
            <Download size={16} />
            Download {material.format}
          </a>
        </div>
      )}
      <Attribution manifest={manifest} material={material} />
    </div>
  );
}

function DocumentReader({
  material,
  section,
}: {
  material: CourseMaterial;
  section: string | null;
}) {
  const body = useRef<HTMLDivElement>(null);
  const [sectionQuery, setSectionQuery] = useState("");
  const document = useQuery({
    queryKey: ["course-document", material.id, material.sha256],
    queryFn: async ({ signal }) =>
      courseDocumentSchema.parse(await readJson(material.localUrl!, signal)),
    staleTime: Infinity,
  });
  function scrollTo(id: string) {
    const target = Array.from(
      body.current?.querySelectorAll<HTMLElement>("[id]") ?? [],
    ).find((element) => element.id === id);
    if (target) {
      target.scrollIntoView({ block: "start" });
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  useEffect(() => {
    if (section && document.data)
      requestAnimationFrame(() => scrollTo(section));
  }, [section, document.data]);
  function followAnchor(event: MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as Element).closest("a");
    const href = anchor?.getAttribute("href");
    if (href?.startsWith("#") && !href.startsWith("#learn/")) {
      event.preventDefault();
      try {
        scrollTo(decodeURIComponent(href.slice(1)));
      } catch {
        scrollTo(href.slice(1));
      }
    }
  }
  if (document.isPending)
    return (
      <p className="material-status" role="status">
        Loading the full document…
      </p>
    );
  if (document.isError)
    return (
      <MaterialFailure
        error={document.error.message}
        retry={() => void document.refetch()}
      />
    );
  const content: CourseDocument = document.data;
  const headings = content.headings.filter(
    (heading) =>
      heading.level > 1 &&
      heading.title.toLowerCase().includes(sectionQuery.trim().toLowerCase()),
  );
  return (
    <div className="native-document">
      {content.headings.some((heading) => heading.level > 1) && (
        <details className="document-toc" open>
          <summary>
            In this document <ChevronDown size={16} />
          </summary>
          {content.headings.length > 12 && (
            <label className="material-search">
              <Search size={16} />
              <input
                name="section-search"
                aria-label="Find a section in this document"
                placeholder="Find a section…"
                value={sectionQuery}
                onChange={(event) => setSectionQuery(event.target.value)}
              />
            </label>
          )}
          <nav aria-label="Document contents">
            <ol role="list">
              {headings.map((heading, index) => (
                <li key={`${heading.id}-${index}`} data-level={heading.level}>
                  <button type="button" onClick={() => scrollTo(heading.id)}>
                    {heading.title}
                  </button>
                </li>
              ))}
            </ol>
            {!headings.length && <p>No matching sections.</p>}
          </nav>
        </details>
      )}
      <div
        className="imported-prose prose"
        ref={body}
        onClick={followAnchor}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    </div>
  );
}

function MediaPlayer({
  material,
  audio = false,
}: {
  material: CourseMaterial;
  audio?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [player, setPlayer] = useState<"youtube" | "cs50">("youtube");
  const url = material.localUrl ?? material.sourceUrl;
  const isCs50Player = /^https:\/\/video\.cs50\.io\//.test(url);
  const youtubeId = isCs50Player
    ? new URL(url).pathname.split("/").filter(Boolean)[0]
    : null;
  const isMp4 =
    /\.mp4(?:\.download)?(?:$|[?#])/.test(url) ||
    material.format.toLowerCase() === "mp4";
  return (
    <div className="native-media">
      {youtubeId && (
        <div
          className="material-player-choice"
          role="group"
          aria-label="Video player"
        >
          <button
            type="button"
            aria-pressed={player === "youtube"}
            onClick={() => setPlayer("youtube")}
          >
            YouTube player
          </button>
          <button
            type="button"
            aria-pressed={player === "cs50"}
            onClick={() => setPlayer("cs50")}
          >
            CS50 player
          </button>
        </div>
      )}
      {audio ? (
        <audio
          controls
          preload="none"
          src={url}
          aria-label={material.title}
          onError={() => setFailed(true)}
        />
      ) : isCs50Player ? (
        <iframe
          src={
            player === "youtube" && youtubeId
              ? `https://www.youtube.com/embed/${youtubeId}?rel=0`
              : url
          }
          title={`${material.title} · ${player === "youtube" ? "YouTube" : "CS50"} player`}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isMp4 ? (
        <video
          controls
          preload="none"
          aria-label={material.title}
          onError={() => setFailed(true)}
        >
          <source src={url} type="video/mp4" />
          <p>Your browser does not support this video format.</p>
        </video>
      ) : (
        <p>This video format opens in the official player.</p>
      )}
      {failed && (
        <p role="alert">
          The media could not play in this browser. Try the official source
          below.
        </p>
      )}
      <p>
        {youtubeId
          ? "Choose YouTube or CS50’s player. If one does not load, try the other or open the source below."
          : "Audio and video stream from the official provider."}{" "}
        Your progress changes only when you record it.
      </p>
      <a className="text-link" href={url} target="_blank" rel="noreferrer">
        Open media separately <ArrowUpRight size={16} />
      </a>
    </div>
  );
}

function Attribution({
  manifest,
  material,
}: {
  manifest: MaterialManifest;
  material?: CourseMaterial;
}) {
  return (
    <footer className="material-attribution">
      <p>{manifest.attribution}</p>
      <p>
        This copy has been reformatted for CS50Track. Content and examples
        remain credited to their original authors.
      </p>
      <div>
        <a href={manifest.licenseUrl} target="_blank" rel="noreferrer">
          {manifest.license} <ArrowUpRight size={16} />
        </a>
        <span>
          Imported {friendlyDate(material?.fetchedAt ?? manifest.fetchedAt)}
        </span>
      </div>
    </footer>
  );
}
