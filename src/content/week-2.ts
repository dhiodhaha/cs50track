import type { WeekContent } from "./types";

// String.raw keeps C escapes such as \n and '\0' as typed, so code shows exactly as it would in a .c file.
const c = String.raw;

type Step = { line: number; vars: Record<string, string>; output?: string; note?: string };

// Each step's output is the full text printed so far, so it is carried forward from the last step that printed.
function carry(steps: Step[]): Step[] {
  let printed: string | undefined;
  return steps.map((step) => {
    if (step.output !== undefined) printed = step.output;
    return printed === undefined ? step : { ...step, output: printed };
  });
}

const content: WeekContent = {
  unitId: "week-2",
  parts: {
    "week-2-lecture-p1": {
      hook: "How would a computer decide whether a book suits a seven-year-old or a college student? It cannot feel that a text is hard. It can only count things, such as letters, words and sentences, and then do arithmetic on those counts. That arithmetic is where the first bug of the week hides: in C, dividing one whole number by another throws the fraction away.",
      after: {
        "reading-levels": [
          {
            kind: "predict",
            id: "week-2-lecture-p1-harder-text",
            prompt:
              "A program can only count things in a text. Which of these two texts would a count-based reading level most likely rate as harder?",
            options: [
              "Text A: \"The cat sat. The dog ran. We had fun.\"",
              "Text B: \"Photosynthesis converts luminous energy into chemical sustenance for vegetation.\"",
              "Both get the same level, because each is one line long",
            ],
            answer: 1,
            explanation:
              "Text B has longer words and more words per sentence, and those are exactly the kinds of counts a program can measure. Line length means nothing to the program; it sees characters, not how the text looks on screen.",
          },
          {
            kind: "trace",
            id: "week-2-lecture-p1-average-trace",
            caption:
              "Watch an average lose its fraction, then get it back with a cast.",
            language: "c",
            code: c`int letters = 7;
int words = 2;
float average = letters / words;
printf("%f\n", average);
average = letters / (float) words;
printf("%f\n", average);`,
            steps: carry([
              { line: 1, vars: { letters: "7" } },
              { line: 2, vars: { letters: "7", words: "2" } },
              {
                line: 3,
                vars: { letters: "7", words: "2", average: "3.000000" },
                note: "Both sides are int, so 7 / 2 is 3. The .5 is gone before the value ever reaches the float.",
              },
              {
                line: 4,
                vars: { letters: "7", words: "2", average: "3.000000" },
                output: "3.000000\n",
              },
              {
                line: 5,
                vars: { letters: "7", words: "2", average: "3.500000" },
                note: "(float) words turns 2 into 2.0, so C does floating-point division and keeps the .5.",
              },
              {
                line: 6,
                vars: { letters: "7", words: "2", average: "3.500000" },
                output: "3.000000\n3.500000\n",
              },
            ]),
          },
          {
            kind: "blank",
            id: "week-2-lecture-p1-cast-blank",
            prompt:
              "Fill the gap so that 7 letters over 2 words gives 3.5, not 3.",
            language: "c",
            code: "float average = letters / ____ words;",
            options: ["(float)", "(int)", "float"],
            answer: 0,
            explanation:
              "Writing (float) before words is a cast: it treats words as a float for this one division, so the result keeps its fraction. (int) changes nothing, and a bare float there is a syntax error.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-2-lecture-p1-recap",
        prompt: "What does this print?",
        language: "c",
        code: c`int sentences = 4;
int words = 10;
float per_sentence = words / sentences;
printf("%f\n", per_sentence);`,
        options: ["2.500000", "2.000000", "2"],
        answer: 1,
        explanation:
          "10 / 4 is integer division because both are int, so the result is 2 before it is stored in the float. %f then prints it with six decimal places as 2.000000. Casting one side to float would give 2.500000.",
      },
      exercise: {
        prompt:
          "This program should print the average word length of a text. For 7 letters and 2 words it prints 3.00, but the right answer is 3.50. Fix the division, and make the program ask again for words until the user types a number greater than 0, so it can never divide by zero. You know it works when 7 and 2 give 3.50 and typing 0 for words prompts again.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int letters = get_int("Letters: ");
    int words = get_int("Words: ");
    float average = letters / words;
    printf("Average word length: %.2f\n", average);
}`,
        hints: [
          "Print letters / words on its own with %i. What type is the result before it is stored in average?",
          "Only one side of the division needs to be a float for C to keep the fraction.",
          "Last week's do-while loop is the usual way to keep prompting until an input is valid.",
        ],
        solution: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int letters = get_int("Letters: ");
    int words;
    do
    {
        words = get_int("Words: ");
    }
    while (words < 1);
    float average = letters / (float) words;
    printf("Average word length: %.2f\n", average);
}

// Casting words to float makes the division keep its fraction.
// The do-while loop runs at least once and repeats until words is positive.`,
      },
      recall: [
        {
          id: "week-2-lecture-p1-r1",
          prompt: "In C, what is the value of 9 / 2 when both numbers are int?",
          options: ["4.5", "4", "5"],
          answer: 1,
          explanation:
            "Integer division throws away the fraction rather than rounding, so 9 / 2 is 4. You need a float on one side to get 4.5.",
        },
        {
          id: "week-2-lecture-p1-r2",
          prompt:
            "letters and words are both int. Which line stores the true average, with its fraction?",
          options: [
            "float avg = letters / words;",
            "float avg = letters / (float) words;",
            "float avg = (int) letters / words;",
          ],
          answer: 1,
          explanation:
            "Casting words to float makes the whole division floating point. In the first line the division happens as int before the result reaches the float.",
        },
        {
          id: "week-2-lecture-p1-r3",
          prompt:
            "Why can a program estimate a text's reading level at all, given that it cannot understand the words?",
          options: [
            "Because harder texts tend to have measurable features, like longer words and longer sentences",
            "Because C has a built-in function that grades text",
            "Because it compares the text with a dictionary of hard words",
          ],
          answer: 0,
          explanation:
            "A program can count letters, words and sentences and do arithmetic on them. Those counts track difficulty well enough to estimate a level without any understanding.",
        },
      ],
    },

    "week-2-lecture-p2": {
      hook: "Your code will have bugs. Everyone's does, and the question is how fast you find them. You get three tools here: printf to show what a variable holds, debug50 to pause the program and step through it line by line, and a rubber duck to explain your code to, out loud. Then you open up make to see the four steps that turn hello.c into a program.",
      after: {
        debugging: [
          {
            kind: "predict",
            id: "week-2-lecture-p2-buggy-rows",
            prompt:
              "This is meant to print a column of three bricks. How many rows of # does it print?",
            language: "c",
            code: c`#include <stdio.h>

int main(void)
{
    for (int i = 0; i <= 3; i++)
    {
        printf("#\n");
    }
}`,
            options: ["3", "4", "2", "It never stops"],
            answer: 1,
            explanation:
              "i takes the values 0, 1, 2 and 3, and 3 <= 3 is still true, so the loop runs four times. Starting at 0 and using <= is the classic off-by-one mistake; < 3 gives three rows.",
          },
          {
            kind: "trace",
            id: "week-2-lecture-p2-printf-debug",
            caption:
              "Step through the buggy loop with a printf that reveals i on each pass.",
            language: "c",
            code: c`#include <stdio.h>

int main(void)
{
    for (int i = 0; i <= 3; i++)
    {
        printf("i is %i\n", i);
        printf("#\n");
    }
}`,
            steps: carry([
              { line: 5, vars: { i: "0" }, note: "0 <= 3 is true, so the body runs." },
              { line: 7, vars: { i: "0" }, output: "i is 0\n" },
              { line: 8, vars: { i: "0" }, output: "i is 0\n#\n" },
              { line: 5, vars: { i: "1" }, note: "i++ makes i 1. 1 <= 3 is true." },
              { line: 7, vars: { i: "1" }, output: "i is 0\n#\ni is 1\n" },
              { line: 8, vars: { i: "1" }, output: "i is 0\n#\ni is 1\n#\n" },
              { line: 5, vars: { i: "2" }, note: "2 <= 3 is true." },
              { line: 7, vars: { i: "2" }, output: "i is 0\n#\ni is 1\n#\ni is 2\n" },
              { line: 8, vars: { i: "2" }, output: "i is 0\n#\ni is 1\n#\ni is 2\n#\n" },
              {
                line: 5,
                vars: { i: "3" },
                note: "3 <= 3 is still true. This is the extra pass that the printf exposes.",
              },
              {
                line: 7,
                vars: { i: "3" },
                output: "i is 0\n#\ni is 1\n#\ni is 2\n#\ni is 3\n",
              },
              {
                line: 8,
                vars: { i: "3" },
                output: "i is 0\n#\ni is 1\n#\ni is 2\n#\ni is 3\n#\n",
              },
              {
                line: 5,
                vars: { i: "4" },
                note: "4 <= 3 is false, so the loop ends. Four bricks, and the printout shows i reached 3.",
                output: "i is 0\n#\ni is 1\n#\ni is 2\n#\ni is 3\n#\n",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-2-lecture-p2-print-column",
            prompt:
              "You run this version and type 3 at the Height: prompt. How many rows of # appear?",
            language: "c",
            code: c`void print_column(int height)
{
    for (int i = 0; i <= height; i++)
    {
        printf("#\n");
    }
}`,
            options: ["3", "4", "2"],
            answer: 1,
            explanation:
              "Moving the loop into a function did not move the bug out of it. With height 3, i runs 0, 1, 2, 3, which is four rows. Setting a breakpoint and watching i in debug50 shows the same thing without adding printf lines.",
          },
          {
            kind: "predict",
            id: "week-2-lecture-p2-studio",
            prompt: "What happens when you run make on this file?",
            language: "c",
            code: c`#include <studio.h>

int main(void)
{
    printf("hello, world\n");
}`,
            options: [
              "It compiles and prints hello, world",
              "Compiling fails, because there is no file called studio.h",
              "It compiles, but printf prints nothing",
            ],
            answer: 1,
            explanation:
              "The header is stdio.h, short for standard input/output. The compiler cannot find studio.h, so it stops with an error before any program exists to run.",
          },
        ],
        compiling: [
          {
            kind: "predict",
            id: "week-2-lecture-p2-four-steps",
            prompt:
              "make hides four steps behind one command. In what order do they happen?",
            options: [
              "preprocessing, compiling, assembling, linking",
              "compiling, preprocessing, linking, assembling",
              "preprocessing, assembling, compiling, linking",
              "linking, preprocessing, compiling, assembling",
            ],
            answer: 0,
            explanation:
              "Preprocessing pastes in the headers, compiling turns C into assembly code, assembling turns assembly into machine code, and linking joins your machine code with the libraries' machine code. Assembling has to come after compiling because it needs the assembly code as input.",
          },
          {
            kind: "predict",
            id: "week-2-lecture-p2-preprocess",
            prompt:
              "After preprocessing, what has taken the place of the line #include <cs50.h>?",
            options: [
              "Declarations such as string get_string(string prompt);",
              "The machine code that makes get_string work",
              "Nothing; the line is simply deleted",
            ],
            answer: 0,
            explanation:
              "The preprocessor copies in the header's contents, which are prototypes that tell the compiler get_string exists. The actual machine code for get_string arrives later, at the linking step.",
          },
          {
            kind: "blank",
            id: "week-2-lecture-p2-lcs50",
            prompt:
              "hello.c calls get_string. Complete the clang command so that linking succeeds.",
            language: "bash",
            code: "clang -o hello hello.c ____",
            options: ["-lcs50", "-o cs50", "cs50.h"],
            answer: 0,
            explanation:
              "-lcs50 tells clang to link in the CS50 library, which holds the machine code for get_string. -o names the output file, so -o cs50 would just rename your program.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-2-lecture-p2-recap",
        prompt: "Same column of bricks, one change. How many rows now?",
        language: "c",
        code: c`for (int i = 1; i <= 3; i++)
{
    printf("#\n");
}`,
        options: ["3", "4", "2"],
        answer: 0,
        explanation:
          "Starting at 1 with <= 3 gives i the values 1, 2 and 3, so three rows. Starting at 0 with < 3 is the more common style, but both run three times.",
      },
      exercise: {
        prompt:
          "This countdown should print the numbers from the user's input down to 1, then Liftoff!. Typed 3, it should print 3, 2, 1 and Liftoff! on four lines, but it prints a 0 and never says Liftoff!. Find the bug with a printf or with debug50 and a breakpoint inside countdown, then fix both problems.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

void countdown(int n);

int main(void)
{
    int n = get_int("Start: ");
    countdown(n);
}

void countdown(int n)
{
    for (int i = n; i >= 0; i--)
    {
        printf("%i\n", i);
    }
}`,
        hints: [
          "Set a breakpoint on the for line and step over it. Watch i in the variables panel on the last pass.",
          "Which value of i makes the condition true one more time than you want?",
          "Liftoff! should print once, so it belongs after the loop, not inside it.",
        ],
        solution: c`#include <cs50.h>
#include <stdio.h>

void countdown(int n);

int main(void)
{
    int n = get_int("Start: ");
    countdown(n);
}

void countdown(int n)
{
    for (int i = n; i > 0; i--)
    {
        printf("%i\n", i);
    }
    printf("Liftoff!\n");
}

// i >= 0 lets i reach 0, one pass too many; i > 0 stops after 1.
// The Liftoff! line goes after the loop so it prints exactly once.`,
      },
      recall: [
        {
          id: "week-2-lecture-p2-r1",
          prompt:
            "A program compiles without any error but prints four rows instead of three. What kind of bug is this?",
          options: [
            "A logical error: the code is valid C but does the wrong thing",
            "A syntax error the compiler failed to notice",
            "A linking error",
          ],
          answer: 0,
          explanation:
            "Logical errors produce no message at all. The compiler only checks that the code is valid, not that it does what you meant, so you need printf, debug50 or a duck to find them.",
        },
        {
          id: "week-2-lecture-p2-r2",
          prompt: "In debug50, what does a breakpoint do?",
          options: [
            "Pauses the program at that line so you can inspect variables and step forward",
            "Deletes that line while debugging",
            "Makes the program crash at that line on purpose",
          ],
          answer: 0,
          explanation:
            "A breakpoint is a stop sign. The program runs until it reaches that line, then waits while you look at variables and step over or into the code.",
        },
        {
          id: "week-2-lecture-p2-r3",
          prompt:
            "Which compiling step combines your code with pre-compiled machine code from libraries like cs50 and stdio?",
          options: ["Preprocessing", "Assembling", "Linking"],
          answer: 2,
          explanation:
            "Linking is the last step and joins your machine code with the libraries' machine code into one executable. Preprocessing only pastes in header declarations.",
        },
        {
          id: "week-2-lecture-p2-r4",
          prompt: "What does make hello actually do?",
          options: [
            "Runs clang with the right arguments to compile hello.c into a program called hello",
            "Runs the hello program",
            "Checks hello.c for style problems",
          ],
          answer: 0,
          explanation:
            "make is a convenience that calls clang for you with arguments such as -o hello and the libraries to link. You still run the result with ./hello.",
        },
      ],
    },

    "week-2-lecture-p3": {
      hook: "Storing three scores in score1, score2 and score3 works until someone asks for thirty. An array gives you many values of one type, back to back in memory, under one name. You reach each value by its index, starting at 0. Arrays also travel: you can hand a whole array to a function like average and let it do the adding up.",
      after: {
        arrays: [
          {
            kind: "predict",
            id: "week-2-lecture-p3-scores-output",
            prompt: "What does scores.c print?",
            language: "c",
            code: c`int score1 = 72;
int score2 = 73;
int score3 = 33;

printf("Average: %f\n", (score1 + score2 + score3) / 3.0);`,
            options: [
              "Average: 59.333333",
              "Average: 59.000000",
              "Average: 59",
              "Average: 59.33",
            ],
            answer: 0,
            explanation:
              "The sum is 178, and dividing by 3.0 (a floating-point number) keeps the fraction: 59.333... %f prints six decimal places. Dividing by 3 instead would do integer division and lose the .333.",
          },
          {
            kind: "predict",
            id: "week-2-lecture-p3-third-index",
            prompt:
              "After int scores[3];, which line stores the third score?",
            options: ["scores[3] = 33;", "scores[2] = 33;", "scores[1] = 33;"],
            answer: 1,
            explanation:
              "Indexes start at 0, so three ints live at scores[0], scores[1] and scores[2]. scores[3] is one past the end of the array and is not yours to write to.",
          },
          {
            kind: "compare",
            id: "week-2-lecture-p3-constant",
            prompt:
              "Both versions read three scores. Which is better designed?",
            language: "c",
            a: {
              label: "Number typed twice",
              code: c`int scores[3];
for (int i = 0; i < 3; i++)
{
    scores[i] = get_int("Score: ");
}`,
            },
            b: {
              label: "A constant N",
              code: c`const int N = 3;

int scores[N];
for (int i = 0; i < N; i++)
{
    scores[i] = get_int("Score: ");
}`,
            },
            answer: "b",
            explanation:
              "With N, the size lives in one place. To handle five scores you change one line, and the loop cannot fall out of step with the array's size the way two separate 3s can.",
          },
          {
            kind: "trace",
            id: "week-2-lecture-p3-average-trace",
            caption:
              "Follow average(3, scores) as it adds up the array 72, 73, 33.",
            language: "c",
            code: c`float average(int length, int array[])
{
    int sum = 0;
    for (int i = 0; i < length; i++)
    {
        sum += array[i];
    }
    return sum / (float) length;
}`,
            steps: carry([
              {
                line: 3,
                vars: { length: "3", array: "{72, 73, 33}", sum: "0" },
              },
              {
                line: 4,
                vars: { length: "3", array: "{72, 73, 33}", sum: "0", i: "0" },
                note: "0 < 3, so the body runs.",
              },
              {
                line: 6,
                vars: { length: "3", array: "{72, 73, 33}", sum: "72", i: "0" },
                note: "array[0] is 72.",
              },
              {
                line: 4,
                vars: { length: "3", array: "{72, 73, 33}", sum: "72", i: "1" },
              },
              {
                line: 6,
                vars: { length: "3", array: "{72, 73, 33}", sum: "145", i: "1" },
                note: "72 + array[1], which is 73.",
              },
              {
                line: 4,
                vars: { length: "3", array: "{72, 73, 33}", sum: "145", i: "2" },
              },
              {
                line: 6,
                vars: { length: "3", array: "{72, 73, 33}", sum: "178", i: "2" },
                note: "145 + array[2], which is 33.",
              },
              {
                line: 4,
                vars: { length: "3", array: "{72, 73, 33}", sum: "178", i: "3" },
                note: "3 < 3 is false, so the loop ends. i never reaches array[3].",
              },
              {
                line: 8,
                vars: { length: "3", array: "{72, 73, 33}", sum: "178" },
                note: "(float) length makes this 178 / 3.0, so average returns about 59.33 instead of 59.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-2-lecture-p3-drop-cast",
            prompt:
              "Someone deletes the cast, so the last line of average becomes return sum / length;. With scores 72, 73 and 33, what does main print now?",
            options: [
              "Average: 59.333333",
              "Average: 59.000000",
              "Average: 59",
            ],
            answer: 1,
            explanation:
              "sum and length are both int, so 178 / 3 is 59. average then returns 59 as a float, and %f prints it as 59.000000. The cast is what keeps the fraction.",
          },
          {
            kind: "blank",
            id: "week-2-lecture-p3-param-blank",
            prompt:
              "Complete the prototype so that average can receive a whole array of ints.",
            language: "c",
            code: "float average(int length, int ____);",
            options: ["array[]", "array", "[]"],
            answer: 0,
            explanation:
              "The square brackets after the name mark the parameter as an array. int array alone would mean one single int, and a parameter needs a name, so [] by itself does not compile.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-2-lecture-p3-recap",
        prompt: "What does this print?",
        language: "c",
        code: c`int scores[3];
scores[0] = 72;
scores[1] = 73;
scores[2] = 33;
printf("%i\n", scores[1]);`,
        options: ["72", "73", "33"],
        answer: 1,
        explanation:
          "scores[1] is the second element, because counting starts at scores[0]. Reading 72 here means counting from 1 out of habit.",
      },
      exercise: {
        prompt:
          "Complete max so that the program prints the highest of five scores the user types. Typing 72, 73, 33, 95 and 60 should print Highest: 95, and it should still work if the highest score is the first one typed or if every score is negative.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

const int N = 5;

int max(int length, int array[]);

int main(void)
{
    int scores[N];
    for (int i = 0; i < N; i++)
    {
        scores[i] = get_int("Score: ");
    }
    printf("Highest: %i\n", max(N, scores));
}

int max(int length, int array[])
{
    // TODO
}`,
        hints: [
          "Keep a variable holding the highest value seen so far, and look at each element once.",
          "What should that variable start as? Starting at 0 breaks when every score is negative.",
          "Start with array[0] and loop from index 1.",
        ],
        solution: c`int max(int length, int array[])
{
    int highest = array[0];
    for (int i = 1; i < length; i++)
    {
        if (array[i] > highest)
        {
            highest = array[i];
        }
    }
    return highest;
}

// Starting from array[0] means the answer is always one of the real scores,
// so negative scores work too. main stays exactly as given.`,
      },
      recall: [
        {
          id: "week-2-lecture-p3-r1",
          prompt:
            "Why do the notes divide by 3.0 rather than 3 when averaging three int scores?",
          options: [
            "So the division is done in floating point and keeps the fraction",
            "Because printf cannot print the number 3",
            "Because 3.0 is faster to divide by",
          ],
          answer: 0,
          explanation:
            "An int divided by an int throws away the fraction. Making one side 3.0 turns the whole calculation into floating-point division.",
        },
        {
          id: "week-2-lecture-p3-r2",
          prompt:
            "In the CS50 environment an int takes 4 bytes. How many bytes does int scores[3] take?",
          options: ["3", "4", "12"],
          answer: 2,
          explanation:
            "An array is its elements stored back to back, so three 4-byte ints take 12 bytes in a row.",
        },
        {
          id: "week-2-lecture-p3-r3",
          prompt: "Which indexes are valid for int scores[N] when N is 3?",
          options: ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3"],
          answer: 0,
          explanation:
            "An array of N elements runs from index 0 to index N - 1. Index 3 would be past the end.",
        },
        {
          id: "week-2-lecture-p3-r4",
          prompt:
            "Why does average take int length as well as int array[]?",
          options: [
            "Because the function cannot tell on its own how many elements the array has",
            "Because C requires every function to take two arguments",
            "Because length is the value returned",
          ],
          answer: 0,
          explanation:
            "Passing an array does not pass its size along with it. The caller has to say how many elements there are so the loop knows where to stop.",
        },
      ],
    },

    "week-2-lecture-p4": {
      hook: "You have used string since week 1 without asking what it is. It turns out to be an array of char: one byte per character, with a hidden zero byte at the end. Once you see that, you can pull out any single letter with s[i], print its ASCII code, and even index into an array of strings twice.",
      after: {
        strings: [
          {
            kind: "predict",
            id: "week-2-lecture-p4-ascii-codes",
            prompt: "hi.c switches %c to %i. What does it print?",
            language: "c",
            code: c`char c1 = 'H';
char c2 = 'I';
char c3 = '!';

printf("%i %i %i\n", c1, c2, c3);`,
            options: ["H I !", "72 73 33", "72 73 33 0"],
            answer: 1,
            explanation:
              "A char is stored as a number, its ASCII code. %i shows that number: H is 72, I is 73 and ! is 33. There is no fourth value because only three chars are printed.",
          },
          {
            kind: "predict",
            id: "week-2-lecture-p4-nul",
            prompt: "Now s is a string. What does this print?",
            language: "c",
            code: c`string s = "HI!";
printf("%i %i %i %i\n", s[0], s[1], s[2], s[3]);`,
            options: [
              "72 73 33 0",
              "72 73 33 33",
              "It will not compile, because s has only 3 characters",
            ],
            answer: 0,
            explanation:
              "Every string ends with the NUL character, '\\0', whose value is 0. So \"HI!\" takes four bytes and s[3] is that terminating 0.",
          },
          {
            kind: "predict",
            id: "week-2-lecture-p4-bytes",
            prompt: "How many bytes of memory does the string \"HI!\" use?",
            options: ["3", "4", "8"],
            answer: 1,
            explanation:
              "Three bytes for H, I and !, plus one byte for the NUL that marks where the string ends. Forgetting that hidden byte is a common miscount.",
          },
          {
            kind: "blank",
            id: "week-2-lecture-p4-third-char",
            prompt: "Fill the gap so that this prints HI! one char at a time.",
            language: "c",
            code: c`string s = "HI!";
printf("%c%c%c\n", s[0], s[1], ____);`,
            options: ["s[2]", "s[3]", "s(2)"],
            answer: 0,
            explanation:
              "The third character is at index 2. s[3] is the NUL character, and parentheses are for calling functions, not indexing.",
          },
          {
            kind: "trace",
            id: "week-2-lecture-p4-words-trace",
            caption:
              "Index twice into an array of strings: first the word, then the letter.",
            language: "c",
            code: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    string words[2];
    words[0] = "HI!";
    words[1] = "BYE!";
    printf("%c", words[0][0]);
    printf("%c", words[1][2]);
    printf("%c\n", words[1][1]);
}`,
            steps: carry([
              {
                line: 6,
                vars: { words: "{?, ?}" },
                note: "Room for two strings, not yet set.",
              },
              { line: 7, vars: { words: "{\"HI!\", ?}" } },
              { line: 8, vars: { words: "{\"HI!\", \"BYE!\"}" } },
              {
                line: 9,
                vars: { words: "{\"HI!\", \"BYE!\"}" },
                output: "H",
                note: "words[0] is \"HI!\", and its [0] is 'H'.",
              },
              {
                line: 10,
                vars: { words: "{\"HI!\", \"BYE!\"}" },
                output: "HE",
                note: "words[1] is \"BYE!\": B is 0, Y is 1, E is 2.",
              },
              {
                line: 11,
                vars: { words: "{\"HI!\", \"BYE!\"}" },
                output: "HEY\n",
                note: "words[1][1] is 'Y'.",
              },
            ]),
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-2-lecture-p4-recap",
        prompt: "What does this print?",
        language: "c",
        code: c`string t = "BYE!";
printf("%i\n", t[4]);`,
        options: ["0", "33", "It will not compile"],
        answer: 0,
        explanation:
          "\"BYE!\" has B, Y, E and ! at indexes 0 to 3, so index 4 is the NUL terminator, which is 0. 33 is the code for !, which sits at index 3.",
      },
      exercise: {
        prompt:
          "Finish this program so it prints the first letter of each word in words, followed by a newline. It should print CPU. Use a loop over the array rather than three separate printf calls, so it would still work if you added a fourth word and changed the size.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

const int N = 3;

int main(void)
{
    string words[N];
    words[0] = "Central";
    words[1] = "Processing";
    words[2] = "Unit";

    // TODO: print the first letter of each word, then a newline
}`,
        hints: [
          "words[i] is a whole string. How do you get one char out of a string?",
          "You need two indexes: which word, then which letter of that word.",
          "Print the letters with %c inside the loop and the \\n once after it.",
        ],
        solution: c`#include <cs50.h>
#include <stdio.h>

const int N = 3;

int main(void)
{
    string words[N];
    words[0] = "Central";
    words[1] = "Processing";
    words[2] = "Unit";

    for (int i = 0; i < N; i++)
    {
        printf("%c", words[i][0]);
    }
    printf("\n");
}

// words[i] picks the word and [0] picks its first char.`,
      },
      recall: [
        {
          id: "week-2-lecture-p4-r1",
          prompt: "How does C know where a string ends in memory?",
          options: [
            "A NUL character, '\\0', follows the last character",
            "The length is stored in front of the first character",
            "Strings always end at a space",
          ],
          answer: 0,
          explanation:
            "A string is just chars back to back, and the byte with value 0 marks the end. That is why \"HI!\" takes four bytes.",
        },
        {
          id: "week-2-lecture-p4-r2",
          prompt:
            "words[0] is \"HI!\" and words[1] is \"BYE!\". What is words[1][0]?",
          options: ["'H'", "'B'", "'I'"],
          answer: 1,
          explanation:
            "The first index picks the string, \"BYE!\", and the second picks a character within it. Index 0 is its first character, B.",
        },
        {
          id: "week-2-lecture-p4-r3",
          prompt:
            "char c = 'A';. What changes if you print c with %i instead of %c?",
          options: [
            "It prints 65, the number that represents A",
            "It prints A in a different font",
            "It does not compile",
          ],
          answer: 0,
          explanation:
            "Chars are stored as numbers. %c shows the character and %i shows its ASCII code, which is 65 for A.",
        },
        {
          id: "week-2-lecture-p4-r4",
          prompt:
            "A string shows 5 visible characters. How many bytes does it use?",
          options: ["5", "6", "10"],
          answer: 1,
          explanation:
            "Every string has one extra byte at the end for the NUL terminator, so n visible characters take n + 1 bytes.",
        },
      ],
    },

    "week-2-lecture-p5": {
      hook: "How long is a string? C does not store the answer anywhere. A program has to walk the characters until it reaches the NUL byte at the end, which is exactly what strlen does for you. With that loop in hand you can change every letter of a string, read the words typed after a program's name through argv, and report success or failure with an exit status.",
      after: {
        "string-length": [
          {
            kind: "trace",
            id: "week-2-lecture-p5-length-trace",
            caption:
              "Count the characters of Ada by walking until the NUL character.",
            language: "c",
            code: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    string name = get_string("Name: ");
    int n = 0;
    while (name[n] != '\0')
    {
        n++;
    }
    printf("%i\n", n);
}`,
            steps: carry([
              {
                line: 6,
                vars: { name: "\"Ada\"" },
                output: "Name: Ada\n",
                note: "You type Ada and press Enter.",
              },
              { line: 7, vars: { name: "\"Ada\"", n: "0" } },
              {
                line: 8,
                vars: { name: "\"Ada\"", n: "0" },
                output: "Name: Ada\n",
                note: "name[0] is 'A', not '\\0', so the loop body runs.",
              },
              { line: 10, vars: { name: "\"Ada\"", n: "1" } },
              {
                line: 8,
                vars: { name: "\"Ada\"", n: "1" },
                note: "name[1] is 'd'.",
              },
              { line: 10, vars: { name: "\"Ada\"", n: "2" } },
              {
                line: 8,
                vars: { name: "\"Ada\"", n: "2" },
                note: "name[2] is 'a'.",
              },
              { line: 10, vars: { name: "\"Ada\"", n: "3" } },
              {
                line: 8,
                vars: { name: "\"Ada\"", n: "3" },
                note: "name[3] is '\\0', so the condition is false and the loop stops.",
              },
              {
                line: 12,
                vars: { name: "\"Ada\"", n: "3" },
                output: "Name: Ada\n3\n",
                note: "n counted the characters before the NUL, which is the length.",
              },
            ]),
          },
          {
            kind: "trace",
            id: "week-2-lecture-p5-uppercase-trace",
            caption:
              "Watch uppercase.c handle Hi! one character at a time.",
            language: "c",
            code: c`string s = "Hi!";
for (int i = 0, n = strlen(s); i < n; i++)
{
    if (s[i] >= 'a' && s[i] <= 'z')
    {
        printf("%c", s[i] - 32);
    }
    else
    {
        printf("%c", s[i]);
    }
}
printf("\n");`,
            steps: carry([
              { line: 1, vars: { s: "\"Hi!\"" } },
              {
                line: 2,
                vars: { s: "\"Hi!\"", i: "0", n: "3" },
                note: "strlen runs once, here, and n keeps the answer.",
              },
              {
                line: 4,
                vars: { s: "\"Hi!\"", i: "0", n: "3" },
                note: "s[0] is 'H' (72). It is not between 'a' and 'z', so the condition is false.",
              },
              { line: 10, vars: { s: "\"Hi!\"", i: "0", n: "3" }, output: "H" },
              { line: 2, vars: { s: "\"Hi!\"", i: "1", n: "3" } },
              {
                line: 4,
                vars: { s: "\"Hi!\"", i: "1", n: "3" },
                note: "s[1] is 'i' (105), a lowercase letter.",
              },
              {
                line: 6,
                vars: { s: "\"Hi!\"", i: "1", n: "3" },
                output: "HI",
                note: "105 - 32 is 73, the code for 'I'.",
              },
              { line: 2, vars: { s: "\"Hi!\"", i: "2", n: "3" } },
              {
                line: 4,
                vars: { s: "\"Hi!\"", i: "2", n: "3" },
                note: "s[2] is '!' (33), not lowercase.",
              },
              { line: 10, vars: { s: "\"Hi!\"", i: "2", n: "3" }, output: "HI!" },
              {
                line: 2,
                vars: { s: "\"Hi!\"", i: "3", n: "3" },
                note: "3 < 3 is false, so the loop ends.",
                output: "HI!",
              },
              { line: 13, vars: { s: "\"Hi!\"" }, output: "HI!\n" },
            ]),
          },
          {
            kind: "predict",
            id: "week-2-lecture-p5-toupper-bang",
            prompt: "toupper comes from ctype.h. What does this print?",
            language: "c",
            code: c`printf("%c%c\n", toupper('a'), toupper('!'));`,
            options: [
              "A!",
              "A followed by an unprintable character",
              "a!",
            ],
            answer: 0,
            explanation:
              "toupper converts lowercase letters and returns any other character unchanged, so '!' stays '!'. Subtracting 32 from '!' yourself would give the unprintable code 1, which is why the hand-written version needs its if.",
          },
          {
            kind: "compare",
            id: "week-2-lecture-p5-islower-compare",
            prompt: "Both loops uppercase s. Which is better designed?",
            language: "c",
            a: {
              label: "Check with islower first",
              code: c`for (int i = 0, n = strlen(s); i < n; i++)
{
    if (islower(s[i]))
    {
        printf("%c", toupper(s[i]));
    }
    else
    {
        printf("%c", s[i]);
    }
}`,
            },
            b: {
              label: "Just call toupper",
              code: c`for (int i = 0, n = strlen(s); i < n; i++)
{
    printf("%c", toupper(s[i]));
}`,
            },
            answer: "b",
            explanation:
              "toupper already leaves anything that is not a lowercase letter alone, so the islower check repeats work the function does for you. Same output, fewer lines, fewer places for a bug.",
          },
        ],
        "command-line-arguments": [
          {
            kind: "predict",
            id: "week-2-lecture-p5-greet-two-words",
            prompt: "You run ./greet David Malan. What does greet.c print?",
            language: "c",
            code: c`int main(int argc, string argv[])
{
    if (argc == 2)
    {
        printf("hello, %s\n", argv[1]);
    }
    else
    {
        printf("hello, world\n");
    }
}`,
            options: ["hello, David", "hello, David Malan", "hello, world"],
            answer: 2,
            explanation:
              "Spaces separate arguments, and the program's name counts too: ./greet, David and Malan make argc 3. Since 3 is not 2, the else branch runs.",
          },
          {
            kind: "trace",
            id: "week-2-lecture-p5-argv-trace",
            caption:
              "Run ./args hi there and watch the loop walk through argv.",
            language: "c",
            code: c`#include <cs50.h>
#include <stdio.h>

int main(int argc, string argv[])
{
    for (int i = 0; i < argc; i++)
    {
        printf("%s\n", argv[i]);
    }
}`,
            steps: carry([
              {
                line: 4,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}" },
                note: "Before main runs, the words you typed are split at the spaces.",
              },
              {
                line: 6,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "0" },
              },
              {
                line: 8,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "0" },
                output: "./args\n",
                note: "argv[0] is always the program's own name.",
              },
              {
                line: 6,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "1" },
              },
              {
                line: 8,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "1" },
                output: "./args\nhi\n",
              },
              {
                line: 6,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "2" },
              },
              {
                line: 8,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "2" },
                output: "./args\nhi\nthere\n",
              },
              {
                line: 6,
                vars: { argc: "3", argv: "{\"./args\", \"hi\", \"there\"}", i: "3" },
                note: "3 < 3 is false. The loop stops before argv[3], which does not exist.",
                output: "./args\nhi\nthere\n",
              },
            ]),
          },
          {
            kind: "blank",
            id: "week-2-lecture-p5-argv-blank",
            prompt:
              "Fill the gap so that ./greet David prints hello, David.",
            language: "c",
            code: c`printf("hello, %s\n", argv[____]);`,
            options: ["0", "1", "argc"],
            answer: 1,
            explanation:
              "argv[0] holds ./greet, the program's name, so the first word after it is argv[1]. argv[argc] is one past the last argument.",
          },
        ],
        "exit-status": [
          {
            kind: "predict",
            id: "week-2-lecture-p5-echo-status",
            prompt:
              "You run ./status with no arguments, then type echo $?. What does echo print?",
            language: "c",
            code: c`int main(int argc, string argv[])
{
    if (argc != 2)
    {
        printf("Missing command-line argument\n");
        return 1;
    }
    printf("hello, %s\n", argv[1]);
    return 0;
}`,
            options: ["0", "1", "2", "Nothing"],
            answer: 1,
            explanation:
              "With no arguments argc is 1, so main prints the message and returns 1. echo $? shows the exit status of the last command, and 1 signals an error. 0 is what you would see after ./status David.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-2-lecture-p5-recap",
        prompt: "What does strlen(\"HI!\") return?",
        options: ["3", "4", "2"],
        answer: 0,
        explanation:
          "strlen counts the characters before the NUL, just like the while loop in length.c. The string uses 4 bytes, but its length is 3.",
      },
      exercise: {
        prompt:
          "Write vowels.c, which takes exactly one word at the command line and prints how many vowels (a, e, i, o, u, upper or lower case) it contains. ./vowels Banana should print 3. If the user gives no word or more than one, print Usage: ./vowels word and exit with status 1, which you can check with echo $?.",
        language: "c",
        starter: c`#include <cs50.h>
#include <ctype.h>
#include <stdio.h>
#include <string.h>

int main(int argc, string argv[])
{
    // TODO
}`,
        hints: [
          "Check argc first, before you touch argv[1]. How many arguments does ./vowels Banana have?",
          "Loop over argv[1] with strlen, storing the length once in n.",
          "tolower lets you test each character against lowercase vowels only.",
        ],
        solution: c`#include <cs50.h>
#include <ctype.h>
#include <stdio.h>
#include <string.h>

int main(int argc, string argv[])
{
    if (argc != 2)
    {
        printf("Usage: ./vowels word\n");
        return 1;
    }

    int count = 0;
    for (int i = 0, n = strlen(argv[1]); i < n; i++)
    {
        char c = tolower(argv[1][i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
        {
            count++;
        }
    }
    printf("%i\n", count);
    return 0;
}

// argc counts the program name, so one word means argc is 2.
// argv[1][i] is one character of that word.`,
      },
      recall: [
        {
          id: "week-2-lecture-p5-r1",
          prompt: "You run ./greet David. What is argc?",
          options: ["1", "2", "3"],
          answer: 1,
          explanation:
            "argc counts every word on the command line, including the program's name. ./greet and David make 2.",
        },
        {
          id: "week-2-lecture-p5-r2",
          prompt: "What is always stored in argv[0]?",
          options: [
            "The name of the program, such as ./greet",
            "The first word typed after the program's name",
            "The number of arguments",
          ],
          answer: 0,
          explanation:
            "argv[0] holds the program's name, so the user's first argument is argv[1]. The count lives in argc, not argv.",
        },
        {
          id: "week-2-lecture-p5-r3",
          prompt:
            "Why does uppercase.c write for (int i = 0, n = strlen(s); i < n; i++) instead of i < strlen(s)?",
          options: [
            "So strlen runs once instead of on every pass of the loop",
            "Because strlen cannot be used in a loop condition",
            "So that n includes the NUL character",
          ],
          answer: 0,
          explanation:
            "strlen walks the whole string each time it is called. The string does not change inside the loop, so asking once and keeping the answer in n saves that repeated work.",
        },
        {
          id: "week-2-lecture-p5-r4",
          prompt: "What does return 1; at the end of main communicate?",
          options: [
            "That the program ended with an error",
            "That the program printed one line",
            "That the program should run once more",
          ],
          answer: 0,
          explanation:
            "main's return value is the exit status. By convention 0 means success and a non-zero value such as 1 means something went wrong; echo $? shows it.",
        },
        {
          id: "week-2-lecture-p5-r5",
          prompt:
            "The while loop in length.c stops at name[n] == '\\0'. What has n counted when it stops?",
          options: [
            "The characters before the NUL, which is the length",
            "The characters including the NUL",
            "The number of words",
          ],
          answer: 0,
          explanation:
            "n is the index of the NUL, and since indexes start at 0 it equals the number of characters before it. That is the same number strlen returns.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-2-section-r1",
        prompt:
          "reverse.c prints a string backwards. What should the loop's i start at?",
        code: c`for (int i = ____; i >= 0; i--)
{
    printf("%c", text[i]);
}`,
        options: ["strlen(text)", "strlen(text) - 1", "0"],
        answer: 1,
        explanation:
          "The last real character is at index strlen(text) - 1. Starting at strlen(text) begins on the NUL character, one past the end of the visible text.",
      },
      {
        id: "week-2-section-r2",
        prompt:
          "alphabetical.c compares text[i] with text[i + 1]. Why must the loop stop at i < n - 1 rather than i < n?",
        options: [
          "Otherwise the last pass compares the final letter with the NUL character",
          "Because the first letter never needs checking",
          "Because strlen counts one character too many",
        ],
        answer: 0,
        explanation:
          "When i is n - 1, text[i + 1] is text[n], the NUL. Since every letter's code is greater than 0, a correct word would be reported as not in order.",
      },
      {
        id: "week-2-section-r3",
        prompt: "You run ./initials Kelly Ding. What are argc and argv[2][0]?",
        options: ["2 and 'K'", "3 and 'D'", "3 and 'K'"],
        answer: 1,
        explanation:
          "The program's name counts, so argc is 3. argv[2] is \"Ding\", and its character at index 0 is 'D'.",
      },
      {
        id: "week-2-section-r4",
        prompt:
          "Which is better design in a program that works with the alphabet?",
        options: [
          "const int LETTERS = 26; and then LETTERS wherever the count is needed",
          "Typing 26 directly everywhere it is needed",
          "Asking the user how many letters the alphabet has",
        ],
        answer: 0,
        explanation:
          "A bare 26 is a magic number: a reader has to guess what it means. A named constant explains itself and lives in one place.",
      },
    ],
    exercise: {
      prompt:
        "Write palindrome.c, which takes one word at the command line and prints yes if it reads the same forwards and backwards and no if it does not. ./palindrome racecar prints yes, ./palindrome hello prints no, and running it without exactly one word prints Usage: ./palindrome word and exits with status 1.",
      language: "c",
      starter: c`#include <cs50.h>
#include <stdio.h>
#include <string.h>

int main(int argc, string argv[])
{
    // TODO
}`,
      hints: [
        "Compare the first character with the last, the second with the second-to-last, and so on.",
        "If the word has length n, the partner of index i is index n - 1 - i.",
        "You only need to walk halfway, and you can stop at the first mismatch.",
      ],
      solution: c`#include <cs50.h>
#include <stdio.h>
#include <string.h>

int main(int argc, string argv[])
{
    if (argc != 2)
    {
        printf("Usage: ./palindrome word\n");
        return 1;
    }

    string word = argv[1];
    int n = strlen(word);
    for (int i = 0; i < n / 2; i++)
    {
        if (word[i] != word[n - 1 - i])
        {
            printf("no\n");
            return 0;
        }
    }
    printf("yes\n");
    return 0;
}

// n - 1 - i pairs each character with its mirror; checking half the word covers every pair.`,
    },
  },

  shorts: {
    "week-2-short-functions": {
      recall: [
        {
          id: "week-2-short-functions-r1",
          prompt:
            "A function declaration such as int add_two_ints(int a, int b); has three parts. What are they?",
          options: [
            "Return type, name, and argument list",
            "Name, body, and return statement",
            "Header file, name, and semicolon",
          ],
          answer: 0,
          explanation:
            "int is the return type, add_two_ints is the name, and (int a, int b) is the comma-separated list of inputs, each with a type and a name.",
        },
        {
          id: "week-2-short-functions-r2",
          prompt:
            "Why do we usually put function declarations at the top of the file, above main?",
          options: [
            "So the compiler knows the function exists before main calls it",
            "So the function runs before main",
            "Because functions defined below main cannot be called",
          ],
          answer: 0,
          explanation:
            "The compiler reads from top to bottom. A prototype at the top tells it what the function looks like, so the full definition can come later.",
        },
        {
          id: "week-2-short-functions-r3",
          prompt: "What does it mean to treat a function as a black box?",
          options: [
            "You can use it by knowing its inputs and output, without knowing how it works inside",
            "Its code is hidden and cannot be read",
            "It takes no inputs",
          ],
          answer: 0,
          explanation:
            "You call printf without reading its code. As long as the output is what the name and documentation promise, the implementation does not matter to the caller.",
        },
      ],
    },
    "week-2-short-variables-and-scope": {
      recall: [
        {
          id: "week-2-short-variables-and-scope-r1",
          prompt: "What does this program print?",
          code: c`int triple(int x)
{
    return x * 3;
}

int main(void)
{
    int foo = 4;
    triple(foo);
    printf("%i\n", foo);
}`,
          options: ["4", "12", "0"],
          answer: 0,
          explanation:
            "triple gets its own copy of foo, and its return value is thrown away. foo in main is never changed, so it is still 4.",
        },
        {
          id: "week-2-short-variables-and-scope-r2",
          prompt:
            "Same triple function. Which line in main makes foo become 12?",
          options: ["triple(foo);", "foo = triple(foo);", "triple(&foo);"],
          answer: 1,
          explanation:
            "Arguments are passed by value, so the function cannot change the caller's variable. Assigning the return value back to foo is how the caller takes the result.",
        },
        {
          id: "week-2-short-variables-and-scope-r3",
          prompt: "Where can a local variable declared inside triple be used?",
          options: [
            "Only inside triple",
            "Anywhere in the file",
            "Only inside main",
          ],
          answer: 0,
          explanation:
            "A local variable's scope is the function where it is created. Only a global variable, declared outside every function, can be used everywhere.",
        },
      ],
    },
    "week-2-short-debugging-step-through": {
      recall: [
        {
          id: "week-2-short-debugging-step-through-r1",
          prompt:
            "A guessing game prints Wrong guess! over and over after one wrong guess. Stepping through shows the highlighted line jumping back to the same check. What is the likely bug?",
          options: [
            "A while loop was used where an if, which checks only once, was meant",
            "printf is missing a \\n",
            "The program forgot to include stdio.h",
          ],
          answer: 0,
          explanation:
            "Nothing inside the loop changes the guess, so the while condition stays true forever. An if checks the condition once, which is what the game needed.",
        },
        {
          id: "week-2-short-debugging-step-through-r2",
          prompt: "In debug50, what does Step Over do?",
          options: [
            "Runs the current line and pauses on the next one",
            "Skips the current line without running it",
            "Runs the program to the end",
          ],
          answer: 0,
          explanation:
            "Step Over executes the highlighted line, including any function it calls, then stops at the next line so you can see how the variables changed.",
        },
      ],
    },
    "week-2-short-debugging-step-into": {
      recall: [
        {
          id: "week-2-short-debugging-step-into-r1",
          prompt:
            "Stepping over check_phrase shows it returns false, but not why. What should you do in debug50?",
          options: [
            "Use Step Into on that line to go inside check_phrase and step through its lines",
            "Add more breakpoints in main",
            "Use Step Over again, faster",
          ],
          answer: 0,
          explanation:
            "Step Over treats the call as one step. Step Into enters the function so you can watch its own variables and find the line that goes wrong.",
        },
        {
          id: "week-2-short-debugging-step-into-r2",
          prompt:
            "phrase and password both hold \"please\", yet phrase == password is false. What should the code use instead?",
          options: [
            "strcmp(phrase, password) == 0",
            "phrase = password",
            "strlen(phrase) == strlen(password)",
          ],
          answer: 0,
          explanation:
            "== does not compare strings character by character in C. strcmp does, and returns 0 when they match. Equal lengths would also accept different words.",
        },
      ],
    },
    "week-2-short-arrays": {
      recall: [
        {
          id: "week-2-short-arrays-r1",
          prompt: "An array has 50 elements. What is the index of the last one?",
          options: ["50", "49", "51"],
          answer: 1,
          explanation:
            "Indexes run from 0 to n - 1. C will not stop you from using index 50, but that memory is outside the array and may cause a segmentation fault.",
        },
        {
          id: "week-2-short-arrays-r2",
          prompt:
            "int foo[5] = {1, 2, 3, 4, 5}; int bar[5];. How do you copy foo into bar?",
          options: [
            "bar = foo;",
            "A loop that copies bar[i] = foo[i] for each i",
            "bar[5] = foo[5];",
          ],
          answer: 1,
          explanation:
            "C does not let you assign one whole array to another. You copy element by element, and bar[5] is past the end anyway.",
        },
        {
          id: "week-2-short-arrays-r3",
          prompt: "What does this program print?",
          code: c`void set_int(int x)
{
    x = 22;
}

void set_array(int array[])
{
    array[0] = 22;
}

int main(void)
{
    int a = 10;
    int b[] = {0, 1, 2, 3};
    set_int(a);
    set_array(b);
    printf("%i %i\n", a, b[0]);
}`,
          options: ["10 0", "22 22", "10 22"],
          answer: 2,
          explanation:
            "set_int changes its own copy of a, so a stays 10. An array is not copied when passed; set_array works on the caller's array itself, so b[0] becomes 22.",
        },
      ],
    },
    "week-2-short-command-line-arguments": {
      recall: [
        {
          id: "week-2-short-command-line-arguments-r1",
          prompt: "A user types ./greedy 1024 cs50. What is argc?",
          options: ["2", "3", "4"],
          answer: 1,
          explanation:
            "The program's name counts as the first argument, and whitespace separates the rest: ./greedy, 1024 and cs50.",
        },
        {
          id: "week-2-short-command-line-arguments-r2",
          prompt: "In that same run, what is argv[1]?",
          options: [
            "The string \"1024\"",
            "The int 1024",
            "The string \"./greedy\"",
          ],
          answer: 0,
          explanation:
            "Everything in argv is a string, even if it looks like a number. You would need a conversion function to get the int 1024.",
        },
        {
          id: "week-2-short-command-line-arguments-r3",
          prompt: "Where is the last argument always found?",
          options: ["argv[argc]", "argv[argc - 1]", "argv[1]"],
          answer: 1,
          explanation:
            "argv has argc elements, indexed from 0, so the last is at argc - 1. argv[argc] is past the end of the array.",
        },
      ],
    },
  },

  glossary: [
    { term: "bug", meaning: "A mistake in code that makes a program fail to compile or behave differently from what you intended." },
    { term: "debugger", meaning: "A tool, such as debug50, that pauses your program so you can run it one line at a time and watch its variables." },
    { term: "breakpoint", meaning: "A marker on a line of code where the debugger pauses the program." },
    { term: "rubber duck debugging", meaning: "Explaining your code out loud, line by line, to an object or a person, which often reveals the mistake." },
    { term: "clang", meaning: "The C compiler that make runs for you in VS Code." },
    { term: "preprocessing", meaning: "The first compiling step, which copies the contents of header files like stdio.h into your code in place of each #include line." },
    { term: "assembly code", meaning: "Low-level, human-readable instructions that the compiling step produces from C and the assembler turns into machine code." },
    { term: "linking", meaning: "The last compiling step, which combines your machine code with the pre-compiled machine code of the libraries you use." },
    { term: "array", meaning: "A fixed number of values of the same type stored back to back in memory under one name." },
    { term: "index", meaning: "The position of an element in an array, counted from 0, written in square brackets as in scores[0]." },
    { term: "constant", meaning: "A variable declared with const, such as const int N = 3;, whose value cannot change after it is set." },
    { term: "char", meaning: "A one-byte type that holds a single character, stored as its ASCII number." },
    { term: "string", meaning: "An array of chars that ends with a NUL character." },
    { term: "NUL", meaning: "The character '\\0', whose value is 0, which marks the end of every string." },
    { term: "strlen", meaning: "A function from string.h that returns how many characters a string has, not counting the NUL." },
    { term: "toupper", meaning: "A function from ctype.h that returns the uppercase version of a lowercase letter and leaves any other character unchanged." },
    { term: "command-line argument", meaning: "A word typed after a program's name when you run it, such as David in ./greet David." },
    { term: "argc and argv", meaning: "The parameters of main that hold how many command-line arguments there are and the arguments themselves as an array of strings." },
    { term: "exit status", meaning: "The number main returns when the program ends: 0 for success, non-zero, such as 1, for an error; echo $? shows it." },
  ],
};

export default content;
