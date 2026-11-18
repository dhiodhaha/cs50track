import type {
  Assignment,
  CompletionGroup,
  CourseUnit,
  Resource,
} from "./model";

export const COURSE_EDITION = 2026;
export const CATALOG_VERIFIED_AT = "2026-11-16";
export const SELF_REPORTED_RESULT_SOURCE = "self-reported" as const;
const official = "https://cs50.harvard.edu/x/2026/";

// Nested groups express the required choice once; flat exports below are derived views.
// Assignment paths were checked against each official 2026 problem-set page.
function group(
  week: number,
  id: string,
  title: string,
  alternatives: [string, string, string][],
): CompletionGroup {
  const unitId = `week-${week}`;
  const groupId = `${unitId}-${id}`;
  return {
    id: groupId,
    title,
    assignments: alternatives.map(([slug, name, path], index) => ({
      id: `${unitId}-${slug}`,
      groupId,
      unitId,
      title: name,
      url: `${official}psets/${week}/${path}/`,
      difficulty: index === 0 ? "standard" : "challenge",
    })),
  };
}

function single(week: number, id: string, title: string, path = id) {
  return group(week, id, title, [[id, title, path]]);
}

function mario(week: number) {
  return group(week, "mario", "Mario", [
    ["mario-less", "Mario (less comfortable)", "mario/less"],
    ["mario-more", "Mario (more comfortable)", "mario/more"],
  ]);
}

function money(week: number) {
  return group(week, "cash-credit", "Cash or Credit", [
    ["cash", "Cash", "cash"],
    ["credit", "Credit", "credit"],
  ]);
}

const groups: CompletionGroup[][] = [
  [single(0, "scratch", "Starting from Scratch")],
  [single(1, "hello", "Hello, It’s Me", "me"), mario(1), money(1)],
  [
    single(2, "scrabble", "Scrabble"),
    single(2, "readability", "Readability"),
    group(2, "cipher", "Caesar or Substitution", [
      ["caesar", "Caesar", "caesar"],
      ["substitution", "Substitution", "substitution"],
    ]),
  ],
  [
    single(3, "sort", "Sort"),
    single(3, "plurality", "Plurality"),
    group(3, "election", "Runoff or Tideman", [
      ["runoff", "Runoff", "runoff"],
      ["tideman", "Tideman", "tideman"],
    ]),
  ],
  [
    single(4, "volume", "Volume"),
    group(4, "filter", "Filter", [
      ["filter-less", "Filter (less comfortable)", "filter/less"],
      ["filter-more", "Filter (more comfortable)", "filter/more"],
    ]),
    single(4, "recover", "Recover"),
  ],
  [single(5, "inheritance", "Inheritance"), single(5, "speller", "Speller")],
  [
    single(6, "hello", "Hello"),
    mario(6),
    money(6),
    single(6, "readability", "Readability"),
    single(6, "dna", "DNA"),
  ],
  [
    single(7, "songs", "Songs"),
    single(7, "movies", "Movies"),
    single(7, "fiftyville", "Fiftyville"),
  ],
  [single(8, "trivia", "Trivia"), single(8, "homepage", "Homepage")],
  [single(9, "birthdays", "Birthdays"), single(9, "finance", "Finance")],
  [],
];

// The inventory follows each pinned week page. Runtimes are estimates rounded up
// from its linked English subtitles, not study-time budgets.
const resourceInventory: [number, Resource["kind"], string, string, number][] =
  [
    [0, "lecture", "0", "Scratch lecture", 121],
    [1, "lecture", "1", "C lecture", 150],
    [1, "section", "1", "C section", 54],
    [1, "short", "data_types", "Data Types", 15],
    [1, "short", "operators", "Operators", 13],
    [1, "short", "conditional_statements", "Conditional Statements", 10],
    [1, "short", "loops", "Loops", 10],
    [1, "short", "command_line", "Command Line", 18],
    [1, "short", "magic_numbers", "Magic Numbers", 8],
    [2, "lecture", "2", "Arrays lecture", 145],
    [2, "section", "2", "Arrays section", 52],
    [2, "short", "functions", "Functions", 21],
    [2, "short", "variables_and_scope", "Variables and Scope", 8],
    [2, "short", "debugging_step_through", "Debugging (Step through)", 3],
    [2, "short", "debugging_step_into", "Debugging (Step into)", 4],
    [2, "short", "arrays", "Arrays", 15],
    [2, "short", "command_line_arguments", "Command Line Arguments", 8],
    [3, "lecture", "3", "Algorithms lecture", 120],
    [3, "section", "3", "Algorithms section", 72],
    [3, "short", "linear_search", "Linear Search", 3],
    [3, "short", "binary_search", "Binary Search", 10],
    [3, "short", "bubble_sort", "Bubble Sort", 6],
    [3, "short", "selection_sort", "Selection Sort", 5],
    [3, "short", "call_stacks", "Call Stacks", 8],
    [3, "short", "recursion", "Recursion", 14],
    [3, "short", "merge_sort", "Merge Sort", 11],
    [4, "lecture", "4", "Memory lecture", 140],
    [4, "section", "4", "Memory section", 68],
    [4, "short", "hexadecimal", "Hexadecimal", 10],
    [4, "short", "pointers", "Pointers", 30],
    [4, "short", "defining_custom_types", "Defining Custom Types", 4],
    [4, "short", "dynamic_memory_allocation", "Dynamic Memory Allocation", 15],
    [4, "short", "call_stacks", "Call Stacks", 8],
    [4, "short", "file_pointers", "File Pointers", 19],
    [5, "lecture", "5", "Data structures lecture", 124],
    [5, "section", "5", "Data structures section", 58],
    [5, "short", "structures", "Structures", 9],
    [5, "short", "singly_linked_lists", "Singly-Linked Lists", 24],
    [5, "short", "doubly_linked_lists", "Doubly-Linked Lists", 10],
    [5, "short", "stacks", "Stacks", 15],
    [5, "short", "queues", "Queues", 16],
    [5, "short", "hash_tables", "Hash Tables", 19],
    [5, "short", "tries", "Tries", 17],
    [5, "short", "data_structures", "Data Structures", 9],
    [6, "lecture", "6", "Python lecture", 149],
    [6, "section", "6", "Python section", 60],
    [6, "short", "python", "Python", 39],
    [7, "lecture", "7", "SQL lecture", 135],
    [7, "section", "7", "SQL section", 65],
    [7, "short", "sql", "SQL", 24],
    [8, "lecture", "8", "HTML, CSS, JavaScript lecture", 142],
    [8, "section", "8", "HTML, CSS, JavaScript section", 36],
    [8, "short", "internet_primer", "Internet Primer", 20],
    [8, "short", "ip", "IP", 16],
    [8, "short", "tcp", "TCP", 10],
    [8, "short", "http", "HTTP", 16],
    [8, "short", "html", "HTML", 22],
    [8, "short", "css", "CSS", 14],
    [8, "short", "javascript", "JavaScript", 19],
    [8, "short", "dom", "DOM", 21],
    [9, "lecture", "9", "Flask lecture", 147],
    [9, "section", "9", "Flask section", 57],
    [9, "short", "flask", "Flask", 18],
    [9, "short", "ajax", "AJAX", 14],
    [10, "lecture", "10", "The End lecture", 52],
  ];

const topics = [
  "Scratch",
  "C",
  "Arrays",
  "Algorithms",
  "Memory",
  "Data structures",
  "Python",
  "SQL",
  "HTML, CSS, JavaScript",
  "Flask",
  "The End",
];

const descriptions = [
  "Start with computational thinking and a Scratch project.",
  "Write, compile, and test your first C programs.",
  "Work with arrays, strings, and command-line arguments.",
  "Compare searching, sorting, and recursive algorithms.",
  "Understand pointers, allocation, and file operations.",
  "Build linked structures, hash tables, and tries.",
  "Apply your programming foundations in Python.",
  "Query relational data with SQL.",
  "Build interactive pages for the web.",
  "Build web applications with Flask.",
  "Reflect on the course and the next steps.",
];

export const courseUnits: CourseUnit[] = topics.map((topic, index) => {
  const id = `week-${index}`;
  return {
    id,
    index,
    title: `Week ${index}`,
    topic,
    description: descriptions[index]!,
    color: "#e17055",
    url: `${official}weeks/${index}/`,
    groups: groups[index]!,
    resources: resourceInventory
      .filter(([week]) => week === index)
      .map(([, kind, slug, title, minutes]) => ({
        id:
          kind === "short"
            ? `${id}-short-${slug.replaceAll("_", "-")}`
            : `${id}-${kind}`,
        unitId: id,
        title,
        kind,
        minutes,
        url:
          kind === "lecture"
            ? `${official}weeks/${index}/`
            : kind === "section"
              ? `${official}sections/${index}/`
              : `${official}shorts/${slug}/`,
      })),
  };
});

courseUnits.push({
  id: "project",
  index: 11,
  title: "Final project",
  topic: "Your own project",
  color: "#e17055",
  description: "Scope, build, document, demonstrate, and submit your own work.",
  url: `${official}project/`,
  resources: [],
  groups: [
    {
      id: "project",
      title: "Final project",
      assignments: [
        {
          id: "project",
          groupId: "project",
          unitId: "project",
          title: "Final project",
          url: `${official}project/`,
          difficulty: "standard",
        },
      ],
    },
  ],
});

export const allAssignments: Assignment[] = courseUnits.flatMap((unit) =>
  unit.groups.flatMap((group) => group.assignments),
);
export const allResources: Resource[] = courseUnits.flatMap(
  (unit) => unit.resources,
);

export function getUnit(id: string): CourseUnit | undefined {
  return courseUnits.find((unit) => unit.id === id);
}

export function getAssignment(id: string): Assignment | undefined {
  return allAssignments.find((assignment) => assignment.id === id);
}

export const projectMilestones = [
  { id: "scope", title: "Define the scope" },
  { id: "prototype", title: "Build a prototype" },
  { id: "build", title: "Build the project" },
  { id: "documentation", title: "Write the README" },
  { id: "demo", title: "Record the demonstration" },
  { id: "submit", title: "Submit the project" },
  { id: "gradebook", title: "Check the CS50 gradebook" },
];
