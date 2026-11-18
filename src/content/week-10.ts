import type { WeekContent } from "./types";

/** Code block from a raw template: keeps backslashes, drops the first and last newline. */
const code = (s: TemplateStringsArray) =>
  String.raw(s).replace(/\r/g, "").replace(/^\n/, "").replace(/\n$/, "");

const NUMBERS = "[1, 3, 5, 7, 9, 11, 13]";

const content: WeekContent = {
  unitId: "week-10",
  parts: {
    "week-10-lecture-p1": {
      hook: "Ten weeks ago a program was a stack of Scratch blocks. Since then you have written C, Python, SQL, HTML, CSS and JavaScript. The languages will keep changing; what lasts is the habit of turning input into output with a clear algorithm. Use this part to check that the ideas, not just the syntax, stayed with you, then aim them at your final project.",
      after: {
        recap: [
          {
            kind: "predict",
            id: "week-10-lecture-p1-draw-arms",
            prompt:
              "In the drawing game, one instruction was simply draw arms, with no detail about how. Which idea from the course is that most like?",
            options: [
              "Calling a function whose details are written somewhere else",
              "A loop that repeats forever",
              "A syntax error",
              "A pointer to memory",
            ],
            answer: 0,
            explanation:
              "draw arms hides the steps behind a name, which is abstraction. You did the same with functions like get_int or draw(n): call them by name and trust the details inside.",
          },
          {
            kind: "predict",
            id: "week-10-lecture-p1-tool-data",
            prompt:
              "You need to store a million names and phone numbers, and many people will search and update them at the same time. Which tool fits best?",
            options: [
              "A SQL database",
              "A Python list held in memory",
              "An array written into a C program",
              "A CSS file",
            ],
            answer: 0,
            explanation:
              "A database keeps the data on disk, survives restarts and answers queries quickly. A list in memory disappears when the program stops, as froshims showed in Week 9.",
          },
          {
            kind: "predict",
            id: "week-10-lecture-p1-tool-browser",
            prompt:
              "You want a search box to show matches while the user types, without reloading the page. Which language runs that part?",
            options: ["JavaScript, in the browser", "SQL, in the browser", "C, on the server", "HTML on its own"],
            answer: 0,
            explanation:
              "Only JavaScript runs in the browser and can listen for keystrokes. It may still fetch results from a Flask route that queries SQL, as the shows example did.",
          },
          {
            kind: "trace",
            id: "week-10-lecture-p1-binary-search",
            caption:
              "Week 0's phone book idea, written in Week 6's language: binary search for 9 in a sorted list.",
            code: code`
numbers = [1, 3, 5, 7, 9, 11, 13]
target = 9
low, high = 0, len(numbers) - 1
while low <= high:
    middle = (low + high) // 2
    if numbers[middle] == target:
        print(f"found at {middle}")
        break
    elif numbers[middle] < target:
        low = middle + 1
    else:
        high = middle - 1
`,
            language: "python",
            steps: [
              {
                line: 3,
                vars: { numbers: NUMBERS, target: "9", low: "0", high: "6" },
                note: "Lines 1 and 2 set up the list and the target.",
              },
              {
                line: 5,
                vars: { numbers: NUMBERS, target: "9", low: "0", high: "6", middle: "3" },
                note: "numbers[3] is 7.",
              },
              {
                line: 9,
                vars: { numbers: NUMBERS, target: "9", low: "0", high: "6", middle: "3" },
                note: "7 is not 9, but 7 < 9, so the target must be to the right.",
              },
              { line: 10, vars: { numbers: NUMBERS, target: "9", low: "4", high: "6", middle: "3" } },
              {
                line: 5,
                vars: { numbers: NUMBERS, target: "9", low: "4", high: "6", middle: "5" },
                note: "numbers[5] is 11.",
              },
              {
                line: 9,
                vars: { numbers: NUMBERS, target: "9", low: "4", high: "6", middle: "5" },
                note: "11 is not less than 9, so go to the else.",
              },
              { line: 12, vars: { numbers: NUMBERS, target: "9", low: "4", high: "4", middle: "5" } },
              {
                line: 5,
                vars: { numbers: NUMBERS, target: "9", low: "4", high: "4", middle: "4" },
                note: "low and high meet. numbers[4] is 9.",
              },
              { line: 6, vars: { numbers: NUMBERS, target: "9", low: "4", high: "4", middle: "4" } },
              {
                line: 7,
                vars: { numbers: NUMBERS, target: "9", low: "4", high: "4", middle: "4" },
                output: "found at 4\n",
              },
              {
                line: 8,
                vars: { numbers: NUMBERS, target: "9", low: "4", high: "4", middle: "4" },
                output: "found at 4\n",
                note: "Three looks instead of up to seven: each step halves what is left.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-10-lecture-p1-off-by-one",
            prompt: "This Week 2 style program compiles. What is wrong with it?",
            code: code`
int scores[3] = {72, 73, 33};
for (int i = 0; i <= 3; i++)
{
    printf("%i\n", scores[i]);
}
`,
            language: "c",
            options: [
              "On the last pass i is 3, which reads past the end of the array",
              "Nothing; it prints the three scores",
              "It skips the first score",
            ],
            answer: 0,
            explanation:
              "An array of 3 has indexes 0, 1 and 2. <= 3 runs one time too many, and C does not stop you from touching memory that is not yours. Use i < 3.",
          },
        ],
        "final-project": [
          {
            kind: "predict",
            id: "week-10-lecture-p1-plan",
            prompt: "Which final project plan is most likely to end in something that works?",
            options: [
              "A small core that works end to end first, with extra features listed for later if time allows",
              "Every feature you can think of, all built at once",
              "Pick the most impressive framework first, decide the idea later",
            ],
            answer: 0,
            explanation:
              "A working core gives you something to submit and test early, and each extra feature is then a small step. Starting wide means many half-built pieces and nothing that runs.",
          },
          {
            kind: "predict",
            id: "week-10-lecture-p1-ai-tools",
            prompt: "According to the notes, what does the final project allow that the other problem sets did not?",
            options: [
              "Using AI-based tools beyond the course's own",
              "Submitting a project that someone else wrote",
              "Skipping the specification",
            ],
            answer: 0,
            explanation:
              "The final project specification permits AI-based tools outside CS50's own, which no other problem set does. The project still has to be your own design.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-10-lecture-p1-recap-two-languages",
        prompt: "You type David into each program. Do they print the same thing?",
        code: code`
// C
string name = get_string("What's your name? ");
printf("hello, %s\n", name);

# Python
name = input("What's your name? ")
print(f"hello, {name}")
`,
        language: "text",
        options: [
          "Yes: both print hello, David and end the line",
          "No: the Python version forgets the newline",
          "No: the C version prints hello, %s",
        ],
        answer: 0,
        explanation:
          "print adds a newline for you, while printf needs \\n, and %s is replaced by name. Same input, same algorithm, same output: the idea outlives the syntax.",
      },
      exercise: {
        prompt:
          "Write plan.md for your final project with five headings: Problem, Input and output, Tools, Features, and First step. Under Features, list good, better and best tiers. The plan is done when a friend can read it and say what the program takes in, what it gives back, and what you will build first.",
        language: "markdown",
        starter: code`
# Problem

# Input and output

# Tools

# Features
- Good:
- Better:
- Best:

# First step
`,
        hints: [
          "Describe the problem for a real person, maybe you, before naming any language.",
          "For each tool, say why it fits: SQL for data that must last, JavaScript for things that react in the browser, and so on.",
          "Make the first step small enough to finish in one sitting, like one route that shows one page.",
        ],
        solution: code`
# Problem
I forget which days I practised guitar, so I cannot tell if I am improving.

# Input and output
Input: the date, minutes practised and a short note, typed into a form.
Output: a table of past sessions and the total minutes this week.

# Tools
- Flask and Python for the routes, because each page depends on stored data.
- SQLite, because sessions must survive restarts.
- HTML, CSS and Bootstrap for the pages; a little JavaScript to show a live minute count.

# Features
- Good: add a session and list all sessions.
- Better: weekly totals, and log in so each person sees only their own sessions.
- Best: a chart of minutes per week.

# First step
A / route that shows a form, and a POST that inserts one row into a sessions table.

(Why: the good tier works end to end on its own, so every later tier is an improvement, not a rescue.)
`,
      },
      recall: [
        {
          id: "week-10-lecture-p1-r1",
          prompt: "Almost every program in the course fits one pattern. Which?",
          options: [
            "Input goes through an algorithm and becomes output",
            "Output comes first, then input",
            "Code compiles into HTML",
          ],
          answer: 0,
          explanation:
            "From Scratch to Flask, a program takes input, processes it step by step and produces output. The language only changes how you write the steps.",
        },
        {
          id: "week-10-lecture-p1-r2",
          prompt: "You need a quick script that counts the words in a large text file. Which course language fits best?",
          options: ["Python", "SQL", "HTML", "CSS"],
          answer: 0,
          explanation:
            "Python reads files and splits strings in a few lines. SQL is for querying tables, and HTML and CSS only describe and style pages.",
        },
        {
          id: "week-10-lecture-p1-r3",
          prompt: "The drawing game had higher-level and lower-level instructions. How is Python higher-level than C?",
          options: [
            "One line of Python does work that takes many lines and manual memory management in C",
            "Python runs on faster computers",
            "Python programs cannot have bugs",
          ],
          answer: 0,
          explanation:
            "Higher-level instructions say more at once and hide details, like draw arms. C gives you more control, such as over memory, at the cost of more code.",
        },
      ],
    },

    "week-10-lecture-p2": {
      hook: "CS50 ends, but your programming does not. The tools you leaned on, like cs50.dev and the cs50 library, were training wheels chosen on purpose. What replaces them: an editor on your own computer, a terminal, Git to track your work, and somewhere to host what you build so other people can actually use it.",
      after: {
        "looking-ahead": [
          {
            kind: "predict",
            id: "week-10-lecture-p2-git",
            prompt: "What is Git for?",
            options: [
              "Recording versions of your code so you can see what changed and go back",
              "Running your Python code faster",
              "Hosting a website for you",
            ],
            answer: 0,
            explanation:
              "Git keeps a history of snapshots called commits. GitHub is a separate service that stores Git repositories online and can also host websites.",
          },
          {
            kind: "blank",
            id: "week-10-lecture-p2-commit",
            prompt: "Fill the gap to save a snapshot of your staged changes with a message.",
            code: code`
git add app.py
git ____ -m "Add login route"
`,
            language: "bash",
            options: ["commit", "push", "save"],
            answer: 0,
            explanation:
              "commit records the snapshot in your local history. push is a later step that uploads commits to a remote like GitHub, and git has no save command.",
          },
          {
            kind: "predict",
            id: "week-10-lecture-p2-hosting",
            prompt:
              "Your final project is a Flask app with a SQLite database. Can you host it exactly like a site made only of HTML, CSS and JavaScript files?",
            options: [
              "No: it needs a server that runs Python for each request, such as a cloud platform",
              "Yes: any site can be served as plain files",
              "No: Flask apps can only ever run on cs50.dev",
            ],
            answer: 0,
            explanation:
              "Static files can be served as they are, which is what hosting a website on GitHub does. A Flask app is dynamic, so it needs a host that runs your Python, like the cloud platforms in the notes.",
          },
        ],
        "summing-up": [
          {
            kind: "trace",
            id: "week-10-lecture-p2-draw-recursion",
            caption:
              "One last trace from Week 3: the recursive draw(n). Follow draw(2) as it calls itself and then prints on the way back.",
            code: code`
void draw(int n)
{
    if (n <= 0)
    {
        return;
    }
    draw(n - 1);
    for (int i = 0; i < n; i++)
    {
        printf("#");
    }
    printf("\n");
}
`,
            language: "c",
            steps: [
              { line: 3, vars: { calls: "draw(2)", n: "2" }, note: "2 is not <= 0, so keep going." },
              { line: 7, vars: { calls: "draw(2)", n: "2" }, note: "draw(2) pauses here and calls draw(1)." },
              { line: 7, vars: { calls: "draw(2) > draw(1)", n: "1" }, note: "draw(1) pauses here and calls draw(0)." },
              { line: 5, vars: { calls: "draw(2) > draw(1) > draw(0)", n: "0" }, note: "Base case: return without drawing." },
              {
                line: 10,
                vars: { calls: "draw(2) > draw(1)", n: "1", i: "0" },
                output: "#",
                note: "Back in draw(1), right after line 7.",
              },
              { line: 12, vars: { calls: "draw(2) > draw(1)", n: "1" }, output: "#\n", note: "i reached 1, so the loop ended." },
              {
                line: 10,
                vars: { calls: "draw(2)", n: "2", i: "0" },
                output: "#\n#",
                note: "draw(1) returned. draw(2) resumes after line 7.",
              },
              { line: 10, vars: { calls: "draw(2)", n: "2", i: "1" }, output: "#\n##" },
              { line: 12, vars: { calls: "draw(2)", n: "2" }, output: "#\n##\n" },
            ],
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-10-lecture-p2-recap-unknown-library",
        prompt:
          "After CS50 you use a library you have never seen, and it raises an error you do not understand. What is the best first move?",
        options: [
          "Read the library's documentation, then ask a community or an AI tool with the exact error",
          "Switch to a different library straight away",
          "Rewrite the library yourself in C",
        ],
        answer: 0,
        explanation:
          "Above all, the course aimed to teach you how to teach yourself. Documentation, communities and AI tools are the resources the notes point you to next.",
      },
      exercise: {
        prompt:
          "Put your final project folder under Git. In that folder, run git init, add your files and make a first commit with a clear message. Then change one file and commit again. It worked when git log shows two commits, newest first, each with your message.",
        language: "bash",
        starter: code`
cd project
# TODO
`,
        hints: [
          "git init creates the repository once; you never need to run it again in that folder.",
          "git add . stages every changed file, and git commit -m \"message\" records them.",
          "git status shows what has changed since your last commit.",
        ],
        solution: code`
# First time only: tell Git who you are.
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

cd project
git init
git add .
git commit -m "Start final project"

# ...edit app.py...
git add app.py
git commit -m "Add index route"

git log --oneline

# Each commit is a snapshot you can return to, so you can experiment without fear.
`,
      },
      recall: [
        {
          id: "week-10-lecture-p2-r1",
          prompt: "What is the difference between git commit and git push?",
          options: [
            "commit records a snapshot locally; push uploads your commits to a remote such as GitHub",
            "They are two names for the same command",
            "push records a snapshot; commit deletes old ones",
          ],
          answer: 0,
          explanation:
            "You can commit many times with no internet connection. push shares those commits with a copy hosted elsewhere.",
        },
        {
          id: "week-10-lecture-p2-r2",
          prompt: "Why install command-line tools on your own Mac or PC after CS50?",
          options: [
            "So you can run commands in a terminal yourself, as you did on cs50.dev",
            "So your computer can browse the web",
            "So you no longer need a text editor",
          ],
          answer: 0,
          explanation:
            "cs50.dev gave you a terminal with everything installed. On your own machine you set up those tools, alongside an editor such as VS Code.",
        },
        {
          id: "week-10-lecture-p2-r3",
          prompt: "Why does draw(n) check if (n <= 0) before calling draw(n - 1)?",
          options: [
            "It is the base case that stops the recursion; without it draw would call itself forever",
            "To print the top row of the pyramid",
            "To make n smaller",
          ],
          answer: 0,
          explanation:
            "Each call shrinks n by one, and the base case is where the shrinking stops. Without it the calls would go below zero until the program crashed.",
        },
      ],
    },
  },

  shorts: {},

  glossary: [
    { term: "Abstraction", meaning: "Hiding details behind a simple name, like draw arms or a function call." },
    { term: "Algorithm", meaning: "Step-by-step instructions that turn input into output." },
    { term: "Final project", meaning: "The program of your own design that ends CS50, built with the skills from the course." },
    { term: "Text editor", meaning: "A program for writing code, such as VS Code, that you can install on your own computer." },
    { term: "Command-line tools", meaning: "Programs you run by typing in a terminal, as you did on cs50.dev." },
    { term: "Git", meaning: "A tool that records versions of your code so you can see changes and go back." },
    { term: "Commit", meaning: "One saved snapshot of your project in Git, with a message describing it." },
    { term: "Hosting", meaning: "Running your site or web app on a server that other people can reach over the internet." },
  ],
};

export default content;
