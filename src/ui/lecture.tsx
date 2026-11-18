import { Download, Play } from "lucide-react";
import { useMemo } from "react";
import { mediaTime } from "./format";
import type { ClipContent, PartContent } from "../content/types";
import { unitSteps, type Clip, type Step } from "../lib/flow";
import { courseUnits } from "../lib/course";
import { documentUrl, useCourseDocument, useManifest } from "./data";
import { ExerciseView } from "./exercise";
import {
  InteractionView,
  PredictView,
  isGraded,
  useAnswers,
} from "./interactions";
import { ProseHtml } from "./prose";
import { StepVideo, rangeLabel, seekVideo } from "./player";
import { splitAtH2 } from "./notes";
import type { OutlineItem } from "./session-bar";
import { useStudy } from "./context";

type LectureStep = Extract<Step, { stage: "lecture" }>;
type ClipStep = Extract<Step, { stage: "section" | "shorts" }>;

/** A time chip that plays the lecture from where a notes section begins. A time matched from subtitles rather than a CS50 chapter shows as approximate. */
function SeekChip({
  title,
  start,
  exact,
}: {
  title: string;
  start: number;
  exact: boolean;
}) {
  const time = mediaTime(start);
  return (
    <button
      type="button"
      className="seek-chip"
      aria-label={`Play the lecture from ${exact ? "" : "about "}${time}, ${title}`}
      title={
        exact
          ? undefined
          : "Matched from the subtitles, so the time is approximate"
      }
      onClick={() => seekVideo(start)}
    >
      <Play
        size={12}
        strokeWidth={2}
        absoluteStrokeWidth
        fill="currentColor"
        aria-hidden
      />
      <span className="seek-chip-time">
        {exact ? "" : "≈ "}
        {time}
      </span>
    </button>
  );
}

export const sectionAnchor = (headingId: string) => `sec-${headingId}`;
export const RECAP_ANCHOR = "part-recap";
export const EXERCISE_ANCHOR = "part-exercise";

export function lectureOutline(
  step: LectureStep,
  content: PartContent | undefined,
): OutlineItem[] {
  return [
    ...step.part.headings.map((heading) => ({
      id: sectionAnchor(heading.id),
      label: heading.title,
    })),
    ...(content
      ? [
          { id: RECAP_ANCHOR, label: "Recap" },
          { id: EXERCISE_ANCHOR, label: "Exercise" },
        ]
      : []),
  ];
}

function Finish({
  answered,
  total,
  label,
  onFinish,
}: {
  answered: number;
  total: number;
  label: string;
  onFinish: () => void;
}) {
  const ready = answered >= total;
  return (
    <div className="finish">
      <button
        type="button"
        className="button primary large"
        disabled={!ready}
        onClick={onFinish}
      >
        {label}
      </button>
      {!ready && (
        <span className="finish-note" role="status">
          {answered} of {total} answered
        </span>
      )}
    </div>
  );
}

function SourceLine({ href, children }: { href: string; children: string }) {
  return (
    <p className="source-line">
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </p>
  );
}

export function LectureStage({
  step,
  content,
  onFinish,
}: {
  step: LectureStep;
  content: PartContent | undefined;
  onFinish: () => void;
}) {
  const { flow } = useStudy();
  const { answers } = useAnswers();
  const lecture = flow.units[step.unitId]!.lecture;
  const notes = useCourseDocument(documentUrl(lecture.notesDocumentId));
  const sections = useMemo(
    () =>
      new Map(
        splitAtH2(notes.data?.html ?? "").sections.map((item) => [
          item.id,
          item,
        ]),
      ),
    [notes.data],
  );
  const { part } = step;
  const graded = [
    ...part.headings.flatMap((heading) => content?.after[heading.id] ?? []),
    ...(content ? [content.recap] : []),
  ].filter(isGraded);
  const answered = graded.filter((item) => answers[item.id] !== undefined);

  return (
    <article className="part">
      <h1>{step.title}</h1>
      <StepVideo
        key={step.id}
        media={lecture}
        title={`${lecture.title}, ${step.title}`}
        stepId={step.id}
        start={part.start}
        end={part.end}
        range={rangeLabel(part.start, part.end)}
      />
      {content && <p className="lead">{content.hook}</p>}

      {notes.isPending && <p className="loading-text">Loading CS50's notes…</p>}
      {notes.isError && (
        <p className="notice danger" role="alert">
          CS50's notes could not be loaded.{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => void notes.refetch()}
          >
            Try again
          </button>
        </p>
      )}
      {part.headings.map((heading) => (
        <section
          key={heading.id}
          id={sectionAnchor(heading.id)}
          className="part-section"
        >
          <div className="part-head">
            {sections.has(heading.id) ? (
              <h2
                id={heading.id}
                dangerouslySetInnerHTML={{
                  __html: sections.get(heading.id)!.heading,
                }}
              />
            ) : (
              <h2 id={heading.id}>{heading.title}</h2>
            )}
            <SeekChip
              title={heading.title}
              start={heading.start}
              exact={heading.exact}
            />
          </div>
          {sections.has(heading.id) && (
            <ProseHtml html={sections.get(heading.id)!.body} />
          )}
          {(content?.after[heading.id] ?? []).map((item) => (
            <InteractionView key={item.id} item={item} />
          ))}
        </section>
      ))}

      {content && (
        <>
          <section id={RECAP_ANCHOR} className="part-section">
            <h2>Recap</h2>
            <InteractionView item={content.recap} />
          </section>
          <div id={EXERCISE_ANCHOR} className="part-section">
            <ExerciseView id={step.id} exercise={content.exercise} />
          </div>
        </>
      )}

      <SourceLine
        href={`${lecture.notesSourceUrl}#${part.headings[0]?.id ?? ""}`}
      >
        Notes by CS50, Harvard University, CC BY-NC-SA 4.0
      </SourceLine>
      <Finish
        answered={answered.length}
        total={graded.length}
        label="Finish this part"
        onFinish={onFinish}
      />
    </article>
  );
}

/** Slides and source code for a section, from the imported manifest. */
function SectionFiles({ clip }: { clip: Clip }) {
  const manifest = useManifest();
  const files = (manifest.data?.materials ?? []).filter(
    (item) =>
      item.title.startsWith(`${clip.title} · `) &&
      (item.kind === "slides" || item.kind === "source") &&
      item.delivery === "file" &&
      item.localUrl,
  );
  if (files.length === 0) return null;
  return (
    <ul className="file-links" aria-label="Section files">
      {files.map((item) => (
        <li key={item.id}>
          <a href={item.localUrl!} target="_blank" rel="noreferrer">
            <Download size={14} aria-hidden />{" "}
            {item.title.slice(clip.title.length + 3)}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ClipStage({
  step,
  content,
  onFinish,
}: {
  step: ClipStep;
  content: ClipContent | undefined;
  onFinish: () => void;
}) {
  const { answers } = useAnswers();
  const questions = content?.recall ?? [];
  const answered = questions.filter((item) => answers[item.id] !== undefined);
  const { clip } = step;
  return (
    <article className="part">
      <h1>{step.title}</h1>
      <StepVideo
        key={step.id}
        media={clip}
        title={step.title}
        stepId={step.id}
      />
      {step.stage === "section" && <SectionFiles clip={clip} />}
      {questions.length > 0 && (
        <section className="part-section">
          <h2>Check yourself</h2>
          {questions.map((question) => (
            <PredictView key={question.id} item={question} />
          ))}
        </section>
      )}
      {content?.exercise && (
        <div className="part-section">
          <ExerciseView id={step.id} exercise={content.exercise} />
        </div>
      )}
      <SourceLine href={clip.sourceUrl}>
        Video and notes by CS50, Harvard University, CC BY-NC-SA 4.0
      </SourceLine>
      <Finish
        answered={answered.length}
        total={questions.length}
        label={
          step.stage === "section" ? "Finish this section" : "Finish this short"
        }
        onFinish={onFinish}
      />
    </article>
  );
}

export function stagePosition(
  flow: Parameters<typeof unitSteps>[0],
  step: Step,
): string {
  const noun = {
    lecture: "Lecture",
    section: "Section",
    shorts: "Short",
    problems: "Problem",
    project: "Milestone",
  }[step.stage];
  const unit = courseUnits.find((item) => item.id === step.unitId);
  const same = unit
    ? unitSteps(flow, unit).filter((item) => item.stage === step.stage)
    : [];
  const index = same.findIndex((item) => item.id === step.id);
  return same.length > 1 && index >= 0
    ? `${noun} ${index + 1} of ${same.length}`
    : noun;
}
