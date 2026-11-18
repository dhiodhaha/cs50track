export type DemoId =
  | "binary"
  | "loops"
  | "search"
  | "memory"
  | "stack"
  | "sql"
  | "http";

/** Guess before the answer is shown. */
export type Predict = {
  kind: "predict";
  id: string;
  prompt: string;
  code?: string;
  language?: string;
  options: string[];
  answer: number;
  explanation: string;
};

/** Step through code one line at a time and watch the variables. */
export type Trace = {
  kind: "trace";
  id: string;
  caption: string;
  code: string;
  language: string;
  steps: {
    /** 1-based line of `code` that just ran. */
    line: number;
    vars: Record<string, string>;
    output?: string;
    note?: string;
  }[];
};

/** Two versions that differ in one thing. Pick the better one, then read why. */
export type Compare = {
  kind: "compare";
  id: string;
  prompt: string;
  language: string;
  a: { label: string; code: string };
  b: { label: string; code: string };
  answer: "a" | "b";
  explanation: string;
};

/** Code with one gap, written as ____ in `code`. */
export type Blank = {
  kind: "blank";
  id: string;
  prompt: string;
  code: string;
  language: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Demo = {
  kind: "demo";
  id: string;
  demo: DemoId;
  caption: string;
};

export type Interaction = Predict | Trace | Compare | Blank | Demo;

export type RecallQuestion = {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Exercise = {
  prompt: string;
  language: string;
  starter: string;
  hints: string[];
  solution: string;
};

export type PartContent = {
  /** Why this part matters, in the learner's terms. 30 to 80 words. */
  hook: string;
  /** Interactions shown right after the notes section with this heading id. */
  after: Record<string, Interaction[]>;
  /** Closes the part by returning to its main idea. */
  recap: Interaction;
  exercise: Exercise;
  recall: RecallQuestion[];
};

export type ClipContent = {
  recall: RecallQuestion[];
  exercise?: Exercise;
};

export type WeekContent = {
  unitId: string;
  /** Keyed by lecture part id from flow.json, such as "week-1-lecture-p1". */
  parts: Record<string, PartContent>;
  /** Practice for the section step. */
  section?: ClipContent;
  /** Keyed by short id from flow.json, such as "week-1-short-loops". */
  shorts: Record<string, ClipContent>;
  /** Terms used this week, in plain words. */
  glossary: { term: string; meaning: string }[];
};
