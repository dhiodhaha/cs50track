import type { WeekContent } from "./types";

/** Code block from a raw template: keeps backslashes, drops the first and last newline. */
const code = (s: TemplateStringsArray) =>
  String.raw(s).replace(/\r/g, "").replace(/^\n/, "").replace(/\n$/, "");

const content: WeekContent = {
  unitId: "week-1",
  parts: {
    "week-1-lecture-p1": {
      hook: "Scratch let you snap blocks together. C makes you type every character, and one missing semicolon or quote stops the whole program. Why put up with that? Because the same ideas now run as real machine code. This part takes you from a blank file to a program that prints, and shows why each character in hello.c is there.",
      after: {
        "source-code": [
          {
            kind: "predict",
            id: "week-1-lecture-p1-compiler-job",
            prompt: "What does a compiler do?",
            options: [
              "Turns source code people can read into machine code the computer can run",
              "Runs your program and shows its output",
              "Checks whether your code is well designed",
            ],
            answer: 0,
            explanation:
              "The computer only runs 0s and 1s. The compiler translates your C into that machine code; running it is a separate step.",
          },
        ],
        "visual-studio-code-for-cs50": [
          {
            kind: "predict",
            id: "week-1-lecture-p1-where-make",
            prompt: "In VS Code at cs50.dev, where do you type make hello?",
            options: [
              "The terminal window, the command line",
              "The text editor, under your code",
              "The file explorer on the left",
            ],
            answer: 0,
            explanation:
              "Commands such as make and ./hello go to the computer through the terminal. The text editor is only for writing the code itself.",
          },
        ],
        "hello-world": [
          {
            kind: "blank",
            id: "week-1-lecture-p1-semicolon",
            prompt: "Every statement in C must end with a particular character. Fill it in.",
            code: code`
#include <stdio.h>

int main(void)
{
    printf("hello, world\n")____
}
`,
            language: "c",
            options: [";", ".", ":"],
            answer: 0,
            explanation:
              "A semicolon ends a statement in C. Without it, make stops with an error and no program is built.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p1-recompile",
            prompt:
              "hello.c has been compiled and works. You change it to print goodbye, world, save, and run ./hello without running make. What prints?",
            options: ["hello, world", "goodbye, world", "An error saying the file changed"],
            answer: 0,
            explanation:
              "./hello runs the machine code made the last time you ran make. Your edit only lives in hello.c until you compile again.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p1-which-file",
            prompt:
              "After make hello, the file explorer shows hello.c and hello. Which one holds machine code?",
            options: ["hello", "hello.c", "Both of them"],
            answer: 0,
            explanation:
              "hello.c is your source code for people and the compiler to read. hello is the executable that make produced and the computer runs.",
          },
        ],
        "from-scratch-to-c": [
          {
            kind: "trace",
            id: "week-1-lecture-p1-newline-trace",
            caption:
              "Watch where the text lands when one printf has no \\n and the next ones do.",
            code: code`
#include <stdio.h>

int main(void)
{
    printf("hello, ");
    printf("world\n");
    printf("bye\n");
}
`,
            language: "c",
            steps: [
              { line: 3, vars: {}, note: "The program starts at main." },
              {
                line: 5,
                vars: {},
                output: "hello, ",
                note: "No \\n, so the cursor stays at the end of this line.",
              },
              {
                line: 6,
                vars: {},
                output: "hello, world\n",
                note: "world continues the same line, then \\n moves to a new one.",
              },
              { line: 7, vars: {}, output: "hello, world\nbye\n" },
            ],
          },
          {
            kind: "predict",
            id: "week-1-lecture-p1-missing-newline",
            prompt:
              "You remove the \\n and run the program. What does the terminal look like right after it finishes?",
            code: code`
printf("hello, world");
`,
            language: "c",
            options: [
              "hello, world$ with the prompt on the same line",
              "hello, world, then the prompt on the next line",
              "hello, world\\n printed as text",
            ],
            answer: 0,
            explanation:
              "Nothing moves the cursor down, so the terminal's $ prompt appears right after your text. The newline was what ended the line.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p1-escape-quote",
            prompt: "What does this line print?",
            code: code`
printf("She said \"hi\"\n");
`,
            language: "c",
            options: [
              "She said \"hi\"",
              "She said \\\"hi\\\"",
              "Nothing: the compiler stops at the second quote",
            ],
            answer: 0,
            explanation:
              "\\\" is an escape sequence for one double quote, so the string does not end there. The backslashes themselves are not printed.",
          },
          {
            kind: "blank",
            id: "week-1-lecture-p1-escape-backslash",
            prompt: "Fill the gap so the program prints a single backslash between C: and cs50.",
            code: code`
printf("C:____cs50\n");
`,
            language: "c",
            options: ["\\\\", "\\", "/"],
            answer: 0,
            explanation:
              "A lone backslash starts an escape sequence, so \\c would be read as an escape, not as text. \\\\ is the escape that prints one backslash.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-1-lecture-p1-recap-two-lines",
        prompt: "What does this program print?",
        code: code`
#include <stdio.h>

int main(void)
{
    printf("hello,\nworld\n");
}
`,
        language: "c",
        options: [
          "hello, on one line and world on the next",
          "hello, world on one line",
          "hello,\\nworld on one line",
        ],
        answer: 0,
        explanation:
          "Each \\n ends the current line wherever it appears in the string, even in the middle. So one printf can print two lines.",
      },
      exercise: {
        prompt:
          "Write quote.c so that ./quote prints exactly two lines: David said \"hello, world\" on the first, and C:\\cs50 on the second. It works if the output matches character for character and your $ prompt starts on its own line afterwards.",
        language: "c",
        starter: code`
#include <stdio.h>

int main(void)
{
    // Print the two lines here
}
`,
        hints: [
          "Use one printf per line, and end each string with \\n.",
          "A double quote inside the string would end it early. Look at the escape characters in the notes.",
          "One backslash starts an escape sequence, so to print a backslash you need its own escape.",
        ],
        solution: code`
#include <stdio.h>

int main(void)
{
    printf("David said \"hello, world\"\n");
    printf("C:\\cs50\n");
}

// \" puts a double quote inside the string without ending it.
// \\ prints one backslash, and \n ends each line so the prompt starts fresh.
`,
      },
      recall: [
        {
          id: "week-1-lecture-p1-r1",
          prompt: "What does make hello do?",
          options: [
            "Compiles hello.c into a program called hello",
            "Runs the program called hello",
            "Creates an empty file called hello.c",
          ],
          answer: 0,
          explanation:
            "make is a build tool that runs the compiler. code hello.c creates the file and ./hello runs the result.",
        },
        {
          id: "week-1-lecture-p1-r2",
          prompt: "You edit hello.c. What must you do before ./hello shows the change?",
          options: ["Run make hello again", "Nothing, it updates itself", "Rename the file"],
          answer: 0,
          explanation:
            "The executable is only rebuilt when you compile. Until then ./hello runs the old machine code.",
        },
        {
          id: "week-1-lecture-p1-r3",
          prompt: "What does \\n do inside a printf string?",
          options: [
            "Moves output to a new line",
            "Prints the letter n",
            "Ends the program",
          ],
          answer: 0,
          explanation:
            "The backslash is an escape character: together with n it means a line break, not the letter n.",
        },
        {
          id: "week-1-lecture-p1-r4",
          prompt: "How do you print a double quote inside a C string?",
          options: ["\\\"", "\"\"", "'\"'"],
          answer: 0,
          explanation:
            "A plain double quote would end the string. The escape sequence \\\" stands for one quote character.",
        },
      ],
    },

    "week-1-lecture-p2": {
      hook: "Your program can talk, but it cannot listen yet, and it cannot decide anything. This part fixes both. You will borrow get_string from CS50's library, slot the answer into printf with %s, and use if and else to take different paths. You will also meet the terminal commands you will type every day this term.",
      after: {
        "header-files-and-cs50-manual-pages": [
          {
            kind: "blank",
            id: "week-1-lecture-p2-stdio",
            prompt: "printf comes from a standard library. Fill in the header file.",
            code: code`
#include <____>

int main(void)
{
    printf("hello, world\n");
}
`,
            language: "c",
            options: ["stdio.h", "studio.h", "cs50.h"],
            answer: 0,
            explanation:
              "stdio.h, standard input and output, declares printf. It is not studio, and cs50.h provides get_string and friends, not printf.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p2-missing-cs50",
            prompt:
              "This file has only #include <stdio.h>. What happens when you run make hello?",
            code: code`
#include <stdio.h>

int main(void)
{
    string answer = get_string("What's your name? ");
    printf("hello, %s\n", answer);
}
`,
            language: "c",
            options: [
              "Errors: the compiler does not know string or get_string",
              "It compiles, then crashes when you type a name",
              "It compiles and works, since get_string is built into C",
            ],
            answer: 0,
            explanation:
              "string and get_string come from cs50.h. Without that include, the compiler has never heard of them and refuses to build the program.",
          },
        ],
        "hello-you": [
          {
            kind: "predict",
            id: "week-1-lecture-p2-literal-answer",
            prompt: "You type David. What does the notes' first version print?",
            code: code`
string answer = get_string("What's your name? ");
printf("hello, answer\n");
`,
            language: "c",
            options: ["hello, answer", "hello, David", "hello, %s"],
            answer: 0,
            explanation:
              "Text inside quotes is printed exactly as written. The word answer in the string has nothing to do with the variable named answer.",
          },
          {
            kind: "trace",
            id: "week-1-lecture-p2-hello-trace",
            caption:
              "Follow the variable answer as it is filled, printed, and filled again. You type David, then Carter.",
            code: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    string answer = get_string("What's your name? ");
    printf("hello, %s\n", answer);
    answer = get_string("And your friend's? ");
    printf("hello, %s\n", answer);
}
`,
            language: "c",
            steps: [
              {
                line: 6,
                vars: { answer: '"David"' },
                output: "What's your name? David\n",
                note: "get_string shows the prompt, waits for you, and returns what you typed.",
              },
              {
                line: 7,
                vars: { answer: '"David"' },
                output: "What's your name? David\nhello, David\n",
                note: "%s is replaced by the value of answer.",
              },
              {
                line: 8,
                vars: { answer: '"Carter"' },
                output: "What's your name? David\nhello, David\nAnd your friend's? Carter\n",
                note: "No type this time: answer already exists, so it is only given a new value.",
              },
              {
                line: 9,
                vars: { answer: '"Carter"' },
                output:
                  "What's your name? David\nhello, David\nAnd your friend's? Carter\nhello, Carter\n",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-1-lecture-p2-format-s",
            prompt: "Fill in the format code that tells printf a string is coming.",
            code: code`
printf("hello, ____\n", answer);
`,
            language: "c",
            options: ["%s", "%i", "answer"],
            answer: 0,
            explanation:
              "%s is the placeholder for a string, and printf fills it with the next argument, answer. %i is for integers.",
          },
        ],
        linux: [
          {
            kind: "predict",
            id: "week-1-lecture-p2-ls",
            prompt:
              "You want to see whether make hello produced a file called hello. Which command lists the files in your current folder?",
            options: ["ls", "cd", "mkdir", "rm"],
            answer: 0,
            explanation:
              "ls lists the contents of the current directory. cd changes directory, mkdir makes one, and rm deletes a file.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p2-mv",
            prompt: "What does mv hello.c goodbye.c do?",
            options: [
              "Renames hello.c to goodbye.c",
              "Makes a copy called goodbye.c and keeps hello.c",
              "Deletes both files",
            ],
            answer: 0,
            explanation:
              "mv moves a file, and moving it to a new name in the same folder renames it. cp is the command that copies.",
          },
        ],
        conditionals: [
          {
            kind: "predict",
            id: "week-1-lecture-p2-three-questions",
            prompt:
              "x is 5 and y is 5. How many comparisons does this code make before it prints?",
            code: code`
if (x < y)
{
    printf("x is less than y\n");
}
else if (x > y)
{
    printf("x is greater than y\n");
}
else if (x == y)
{
    printf("x is equal to y\n");
}
`,
            language: "c",
            options: ["3", "1", "2"],
            answer: 0,
            explanation:
              "x < y is false, x > y is false, and then x == y is asked as well. That third question can only be true by then, which is why the notes call it unnecessary.",
          },
          {
            kind: "compare",
            id: "week-1-lecture-p2-compare-else",
            prompt: "Both print the right message for any x and y. Which is better designed?",
            language: "c",
            a: {
              label: "Asks x == y",
              code: code`
if (x < y)
{
    printf("x is less than y\n");
}
else if (x > y)
{
    printf("x is greater than y\n");
}
else if (x == y)
{
    printf("x is equal to y\n");
}
`,
            },
            b: {
              label: "Uses else",
              code: code`
if (x < y)
{
    printf("x is less than y\n");
}
else if (x > y)
{
    printf("x is greater than y\n");
}
else
{
    printf("x is equal to y\n");
}
`,
            },
            answer: "b",
            explanation:
              "If x is neither less than nor greater than y, it must be equal, so the last question is wasted work. else covers what is left without asking.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p2-not-less",
            prompt: "x is 3 and y is 3. What prints?",
            code: code`
if (x < y)
{
    printf("x is less than y\n");
}
else
{
    printf("x is not less than y\n");
}
`,
            language: "c",
            options: ["x is not less than y", "x is less than y", "Nothing"],
            answer: 0,
            explanation:
              "3 < 3 is false, because 3 is not less than itself. With if and else, exactly one branch always runs, so the else prints.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-1-lecture-p2-recap-fix",
        prompt:
          "This prints hello, answer no matter what you type. Which change makes it greet you by name?",
        code: code`
string answer = get_string("What's your name? ");
printf("hello, answer\n");
`,
        language: "c",
        options: [
          "printf(\"hello, %s\\n\", answer);",
          "printf(\"hello, %s\\n\");",
          "printf(\"hello, \" answer \"\\n\");",
        ],
        answer: 0,
        explanation:
          "The string needs a %s placeholder and printf needs answer as a second argument to fill it. Without that second argument, %s has nothing to fill it and the compiler complains.",
      },
      exercise: {
        prompt:
          "Write ages.c. Ask for your age and a friend's age with get_int, then print exactly one of: You are older., Your friend is older., or You are the same age. Test it with 20 and 18, 18 and 20, and 19 and 19; each should print a different line.",
        language: "c",
        starter: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    // Ask for both ages

    // Print who is older
}
`,
        hints: [
          "get_int works like get_string but returns an int, so store it in an int variable.",
          "There are three possible outcomes, so think if, else if, else.",
          "Once you have checked older and younger, the only case left is the same age. It does not need its own question.",
        ],
        solution: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int mine = get_int("Your age: ");
    int theirs = get_int("Friend's age: ");

    if (mine > theirs)
    {
        printf("You are older.\n");
    }
    else if (mine < theirs)
    {
        printf("Your friend is older.\n");
    }
    else
    {
        printf("You are the same age.\n");
    }
}

// The three branches are mutually exclusive, so exactly one prints.
// The final else needs no comparison: equal is all that is left.
`,
      },
      recall: [
        {
          id: "week-1-lecture-p2-r1",
          prompt: "What do you get by adding #include <cs50.h>?",
          options: [
            "Functions like get_string and get_int, and the type string",
            "The printf function",
            "Faster programs",
          ],
          answer: 0,
          explanation:
            "cs50.h is CS50's own library of training wheels. printf comes from stdio.h instead.",
        },
        {
          id: "week-1-lecture-p2-r2",
          prompt: "In printf(\"hello, %s\\n\", answer), what is %s?",
          options: [
            "A format code that is replaced by the string answer",
            "A variable that holds the user's name",
            "A command that ends the line",
          ],
          answer: 0,
          explanation:
            "%s is a placeholder. printf swaps in the next argument, answer, when it prints.",
        },
        {
          id: "week-1-lecture-p2-r3",
          prompt: "Which terminal command changes your current directory?",
          options: ["cd", "ls", "mv", "cp"],
          answer: 0,
          explanation:
            "cd means change directory. ls lists files, mv moves or renames, and cp copies.",
        },
        {
          id: "week-1-lecture-p2-r4",
          prompt:
            "After checking x < y and x > y, why is else better than else if (x == y)?",
          options: [
            "Equal is the only case left, so asking again wastes a comparison",
            "else if cannot use ==",
            "else runs faster because it is shorter to type",
          ],
          answer: 0,
          explanation:
            "Numbers are either less, greater or equal. Once two are ruled out, the third is certain, and else handles it without asking.",
        },
      ],
    },

    "week-1-lecture-p3": {
      hook: "The same byte can be the number 65 or the letter A. C makes you say which one you mean, every time you create a variable and every time you print it. Get the type or the format code wrong and the program misbehaves. This part has you choose types on purpose, update variables, and write compare.c and agree.c.",
      after: {
        "format-codes": [
          {
            kind: "blank",
            id: "week-1-lecture-p3-format-c",
            prompt: "c is a char. Fill in the format code that prints it as a character.",
            code: code`
char c = get_char("Do you agree? ");
printf("You typed ____\n", c);
`,
            language: "c",
            options: ["%c", "%s", "%i"],
            answer: 0,
            explanation:
              "%c is for a single char. %s expects a whole string, and %i would print the character's number instead.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p3-char-as-int",
            prompt: "What do these two lines print?",
            code: code`
char c = 'A';
printf("%c\n", c);
printf("%i\n", c);
`,
            language: "c",
            options: ["A, then 65", "A, then A", "65, then 65", "A compile error"],
            answer: 0,
            explanation:
              "A char is stored as a number, and in ASCII A is 65. %c shows it as a character and %i shows the same value as an integer.",
          },
        ],
        variables: [
          {
            kind: "trace",
            id: "week-1-lecture-p3-counter-trace",
            caption: "Watch counter change as each line of the notes' examples runs.",
            code: code`
int counter = 0;
counter = counter + 1;
counter += 1;
counter++;
counter--;
`,
            language: "c",
            steps: [
              { line: 1, vars: { counter: "0" } },
              {
                line: 2,
                vars: { counter: "1" },
                note: "The right side is worked out first, 0 + 1, then stored back in counter.",
              },
              { line: 3, vars: { counter: "2" }, note: "+= 1 is shorthand for the line above." },
              { line: 4, vars: { counter: "3" }, note: "++ adds one." },
              { line: 5, vars: { counter: "2" }, note: "-- subtracts one." },
            ],
          },
          {
            kind: "blank",
            id: "week-1-lecture-p3-decrement",
            prompt: "Fill the gap so this line subtracts 1 from counter.",
            code: code`
counter____;
`,
            language: "c",
            options: ["--", "++", "-1"],
            answer: 0,
            explanation:
              "counter-- takes one away and stores the result. counter-1 on its own computes a value but never stores it anywhere.",
          },
        ],
        comparec: [
          {
            kind: "predict",
            id: "week-1-lecture-p3-compare-first",
            prompt: "This is the first compare.c. You enter 3 for x and 2 for y. What prints after the prompts?",
            code: code`
int x = get_int("What's x? ");
int y = get_int("What's y? ");

if (x < y)
{
    printf("x is less than y\n");
}
`,
            language: "c",
            options: ["Nothing", "x is less than y", "x is not less than y"],
            answer: 0,
            explanation:
              "3 < 2 is false, so the only printf is skipped. With no else, nothing handles the other cases, which is why the notes add else if and else.",
          },
          {
            kind: "trace",
            id: "week-1-lecture-p3-compare-trace",
            caption:
              "Step through the final compare.c with x = 7 and y = 3, and see which questions get asked.",
            code: code`
int x = get_int("What's x? ");
int y = get_int("What's y? ");
if (x < y)
{
    printf("x is less than y\n");
}
else if (x > y)
{
    printf("x is greater than y\n");
}
else
{
    printf("x is equal to y\n");
}
`,
            language: "c",
            steps: [
              { line: 1, vars: { x: "7" }, output: "What's x? 7\n" },
              { line: 2, vars: { x: "7", y: "3" }, output: "What's x? 7\nWhat's y? 3\n" },
              {
                line: 3,
                vars: { x: "7", y: "3" },
                output: "What's x? 7\nWhat's y? 3\n",
                note: "7 < 3 is false, so the first block is skipped.",
              },
              {
                line: 7,
                vars: { x: "7", y: "3" },
                output: "What's x? 7\nWhat's y? 3\n",
                note: "7 > 3 is true.",
              },
              {
                line: 9,
                vars: { x: "7", y: "3" },
                output: "What's x? 7\nWhat's y? 3\nx is greater than y\n",
                note: "One branch has run, so the else is skipped and the chain is done.",
              },
            ],
          },
        ],
        agreec: [
          {
            kind: "predict",
            id: "week-1-lecture-p3-agree-capital",
            prompt: "This is the first agree.c. You type a capital Y. What prints?",
            code: code`
char c = get_char("Do you agree? ");

if (c == 'y')
{
    printf("Agreed.\n");
}
else if (c == 'n')
{
    printf("Not agreed.\n");
}
`,
            language: "c",
            options: ["Nothing", "Agreed.", "Not agreed."],
            answer: 0,
            explanation:
              "'Y' and 'y' are different characters with different ASCII numbers, so both tests are false. That is why the next version checks for 'Y' too.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p3-char-test",
            prompt: "Which condition correctly checks whether c holds the letter y?",
            options: ["c == 'y'", "c = 'y'", "c == \"y\""],
            answer: 0,
            explanation:
              "== compares, while a single = would assign 'y' to c. Single quotes make a char; double quotes make a string, which is a different type.",
          },
          {
            kind: "compare",
            id: "week-1-lecture-p3-compare-or",
            prompt: "Both accept y or Y as agreement. Which is better designed?",
            language: "c",
            a: {
              label: "Two branches",
              code: code`
if (c == 'y')
{
    printf("Agreed.\n");
}
else if (c == 'Y')
{
    printf("Agreed.\n");
}
else
{
    printf("Not agreed.\n");
}
`,
            },
            b: {
              label: "Logical or",
              code: code`
if (c == 'Y' || c == 'y')
{
    printf("Agreed.\n");
}
else
{
    printf("Not agreed.\n");
}
`,
            },
            answer: "b",
            explanation:
              "|| means or, so one branch handles both letters. The first version repeats the same printf, and a change to the message would have to be made twice.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p3-agree-other",
            prompt: "With the final agree.c, you type q. What prints?",
            code: code`
if (c == 'Y' || c == 'y')
{
    printf("Agreed.\n");
}
else
{
    printf("Not agreed.\n");
}
`,
            language: "c",
            options: ["Not agreed.", "Nothing", "Agreed."],
            answer: 0,
            explanation:
              "else catches every character that is not Y or y, including q, n and even a digit. Whether that is what you want is a design choice.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-1-lecture-p3-recap-less-equal",
        prompt: "Someone changed compare.c's first test to <=. You enter 4 and 4. What prints?",
        code: code`
if (x <= y)
{
    printf("x is less than y\n");
}
else if (x > y)
{
    printf("x is greater than y\n");
}
else
{
    printf("x is equal to y\n");
}
`,
        language: "c",
        options: ["x is less than y", "x is equal to y", "Both messages"],
        answer: 0,
        explanation:
          "4 <= 4 is true, so the first branch runs and the rest of the chain is skipped. The else can now never run, and the message is wrong for equal numbers.",
      },
      exercise: {
        prompt:
          "Write yesno.c. Ask Continue? (y/n) with get_char. Print Yes! for y or Y, No! for n or N, and Please type y or n. for anything else. Test all five cases: y, Y, n, N and q.",
        language: "c",
        starter: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    // Ask for one character

    // Print Yes!, No!, or a reminder
}
`,
        hints: [
          "get_char returns a char, so store it in a char variable and compare against characters in single quotes.",
          "Use || to accept both the lowercase and uppercase letter in one condition.",
          "You need three outcomes, so the reminder belongs in a final else.",
        ],
        solution: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    char c = get_char("Continue? (y/n) ");

    if (c == 'y' || c == 'Y')
    {
        printf("Yes!\n");
    }
    else if (c == 'n' || c == 'N')
    {
        printf("No!\n");
    }
    else
    {
        printf("Please type y or n.\n");
    }
}

// Unlike agree.c, n has its own branch, so else is left for answers that are neither.
`,
      },
      recall: [
        {
          id: "week-1-lecture-p3-r1",
          prompt: "Which format code prints a long?",
          options: ["%li", "%i", "%l", "%f"],
          answer: 0,
          explanation:
            "%li is for long integers. %i is for int and %f is for float.",
        },
        {
          id: "week-1-lecture-p3-r2",
          prompt: "counter is 5. After counter += 1; and then counter--;, what is it?",
          options: ["5", "6", "4", "7"],
          answer: 0,
          explanation:
            "+= 1 makes it 6 and -- takes it back to 5. Both are shorthand for counter = counter plus or minus 1.",
        },
        {
          id: "week-1-lecture-p3-r3",
          prompt: "In C, what is the difference between 'y' and \"y\"?",
          options: [
            "'y' is a single char; \"y\" is a string",
            "There is no difference",
            "'y' is a string; \"y\" is a char",
          ],
          answer: 0,
          explanation:
            "Single quotes are for one character and double quotes are for strings. get_char returns a char, so compare it with 'y'.",
        },
        {
          id: "week-1-lecture-p3-r4",
          prompt: "What does || mean in a condition?",
          options: [
            "Or: true if at least one side is true",
            "And: true only if both sides are true",
            "Not: flips true and false",
          ],
          answer: 0,
          explanation:
            "c == 'Y' || c == 'y' is true when either test is true, so it accepts both letters.",
        },
        {
          id: "week-1-lecture-p3-r5",
          prompt: "What is the difference between = and == in C?",
          options: [
            "= stores a value; == asks whether two values are equal",
            "They are interchangeable",
            "== stores a value; = compares",
          ],
          answer: 0,
          explanation:
            "counter = 0 puts 0 into counter. c == 'y' is a question that is true or false.",
        },
      ],
    },

    "week-1-lecture-p4": {
      hook: "Printing meow three times by copying a line is easy. Printing it as many times as the user asks, and refusing a negative number no matter how often they type one, needs loops. Then you will package the meowing into your own function. Count the passes carefully: most loop bugs are a loop that runs once too often or once too few.",
      after: {
        "loops-and-meowc": [
          {
            kind: "trace",
            id: "week-1-lecture-p4-while-trace",
            caption:
              "Step through the while loop from the notes and watch i count down to 0.",
            code: code`
int i = 3;
while (i > 0)
{
    printf("meow\n");
    i--;
}
`,
            language: "c",
            steps: [
              { line: 1, vars: { i: "3" } },
              { line: 2, vars: { i: "3" }, note: "3 > 0 is true, so the body runs." },
              { line: 4, vars: { i: "3" }, output: "meow\n" },
              { line: 5, vars: { i: "2" } , output: "meow\n" },
              { line: 2, vars: { i: "2" }, output: "meow\n", note: "2 > 0 is true." },
              { line: 4, vars: { i: "2" }, output: "meow\nmeow\n" },
              { line: 5, vars: { i: "1" }, output: "meow\nmeow\n" },
              { line: 2, vars: { i: "1" }, output: "meow\nmeow\n", note: "1 > 0 is true." },
              { line: 4, vars: { i: "1" }, output: "meow\nmeow\nmeow\n" },
              { line: 5, vars: { i: "0" }, output: "meow\nmeow\nmeow\n" },
              {
                line: 2,
                vars: { i: "0" },
                output: "meow\nmeow\nmeow\n",
                note: "0 > 0 is false, so the loop ends after three meows.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-1-lecture-p4-off-by-one",
            prompt: "This tries to count from zero like the notes, but uses <=. How many times does it meow?",
            code: code`
int i = 0;
while (i <= 3)
{
    printf("meow\n");
    i++;
}
`,
            language: "c",
            options: ["4", "3", "It never stops"],
            answer: 0,
            explanation:
              "i takes the values 0, 1, 2 and 3, and all four pass i <= 3. Counting from 0 pairs with <, as in i < 3; counting from 1 pairs with <=.",
          },
          {
            kind: "trace",
            id: "week-1-lecture-p4-for-trace",
            caption:
              "See the three parts of a for loop take turns: start once, then check, body, update.",
            code: code`
for (int i = 0; i < 3; i++)
{
    printf("meow\n");
}
`,
            language: "c",
            steps: [
              {
                line: 1,
                vars: { i: "0" },
                note: "int i = 0 runs once. Then 0 < 3 is checked: true.",
              },
              { line: 3, vars: { i: "0" }, output: "meow\n" },
              {
                line: 1,
                vars: { i: "1" },
                output: "meow\n",
                note: "After the body, i++ runs, then 1 < 3 is checked.",
              },
              { line: 3, vars: { i: "1" }, output: "meow\nmeow\n" },
              { line: 1, vars: { i: "2" }, output: "meow\nmeow\n" },
              { line: 3, vars: { i: "2" }, output: "meow\nmeow\nmeow\n" },
              {
                line: 1,
                vars: { i: "3" },
                output: "meow\nmeow\nmeow\n",
                note: "3 < 3 is false, so the loop ends and i no longer exists.",
              },
            ],
          },
          {
            kind: "demo",
            id: "week-1-lecture-p4-loops-demo",
            demo: "loops",
            caption:
              "Set the start to 0 and the condition to i < 3, then change it to i <= 3. Count how many times the body runs each time.",
          },
          {
            kind: "compare",
            id: "week-1-lecture-p4-compare-reprompt",
            prompt:
              "Both try to stop the user from giving a negative n. Which one actually guarantees it?",
            language: "c",
            a: {
              label: "if",
              code: code`
int n = get_int("What's n? ");
if (n < 0)
{
    n = get_int("What's n? ");
}
`,
            },
            b: {
              label: "do-while",
              code: code`
int n;
do
{
    n = get_int("What's n? ");
}
while (n < 0);
`,
            },
            answer: "b",
            explanation:
              "The if asks a second time only once, so typing -1 twice gets a negative n through. The do-while keeps asking until n is not negative.",
          },
          {
            kind: "trace",
            id: "week-1-lecture-p4-do-while-trace",
            caption:
              "A stubborn user types -2, then -5, then 3. Watch the do-while keep asking.",
            code: code`
int n;
do
{
    n = get_int("What's n? ");
}
while (n < 0);
`,
            language: "c",
            steps: [
              { line: 1, vars: { n: "?" }, note: "n exists but has no value yet." },
              {
                line: 4,
                vars: { n: "-2" },
                output: "What's n? -2\n",
                note: "The body runs before any check: that is what do adds.",
              },
              { line: 6, vars: { n: "-2" }, output: "What's n? -2\n", note: "-2 < 0 is true, so go back." },
              { line: 4, vars: { n: "-5" }, output: "What's n? -2\nWhat's n? -5\n" },
              {
                line: 6,
                vars: { n: "-5" },
                output: "What's n? -2\nWhat's n? -5\n",
                note: "-5 < 0 is true, so go back again.",
              },
              { line: 4, vars: { n: "3" }, output: "What's n? -2\nWhat's n? -5\nWhat's n? 3\n" },
              {
                line: 6,
                vars: { n: "3" },
                output: "What's n? -2\nWhat's n? -5\nWhat's n? 3\n",
                note: "3 < 0 is false, so the loop ends with n = 3.",
              },
            ],
          },
        ],
        functions: [
          {
            kind: "trace",
            id: "week-1-lecture-p4-meow-call-trace",
            caption:
              "Follow main as it calls meow(2): the program jumps into meow, loops, and comes back.",
            code: code`
void meow(int n);

int main(void)
{
    meow(2);
}

void meow(int n)
{
    for (int i = 0; i < n; i++)
    {
        printf("meow\n");
    }
}
`,
            language: "c",
            steps: [
              { line: 5, vars: {}, note: "main calls meow and passes it 2." },
              { line: 8, vars: { n: "2" }, note: "Inside meow, n is a new variable holding 2." },
              { line: 10, vars: { n: "2", i: "0" }, note: "0 < 2 is true." },
              { line: 12, vars: { n: "2", i: "0" }, output: "meow\n" },
              { line: 10, vars: { n: "2", i: "1" }, output: "meow\n", note: "1 < 2 is true." },
              { line: 12, vars: { n: "2", i: "1" }, output: "meow\nmeow\n" },
              {
                line: 10,
                vars: { n: "2", i: "2" },
                output: "meow\nmeow\n",
                note: "2 < 2 is false, so the loop ends.",
              },
              {
                line: 14,
                vars: { n: "2" },
                output: "meow\nmeow\n",
                note: "meow is finished and returns nothing, since it is void.",
              },
              {
                line: 6,
                vars: {},
                output: "meow\nmeow\n",
                note: "Back in main, which has no variables of its own, and the program ends.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-1-lecture-p4-scope-copy",
            prompt: "halve changes its n. What does this program print?",
            code: code`
#include <stdio.h>

void halve(int n);

int main(void)
{
    int n = 10;
    halve(n);
    printf("in main: %i\n", n);
}

void halve(int n)
{
    n = n / 2;
    printf("in halve: %i\n", n);
}
`,
            language: "c",
            options: [
              "in halve: 5, then in main: 10",
              "in halve: 5, then in main: 5",
              "in halve: 10, then in main: 10",
            ],
            answer: 0,
            explanation:
              "halve gets a copy of main's n, as the notes' scope example says. Changing the copy to 5 leaves main's own n at 10.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p4-no-prototype",
            prompt:
              "You delete the line void meow(int n); from the top, but keep meow defined below main. What happens at make?",
            code: code`
#include <stdio.h>

int main(void)
{
    meow(3);
}

void meow(int n)
{
    for (int i = 0; i < n; i++)
    {
        printf("meow\n");
    }
}
`,
            language: "c",
            options: [
              "A compile error: meow is used before the compiler has seen it",
              "It compiles and meows three times",
              "It compiles but prints nothing",
            ],
            answer: 0,
            explanation:
              "The compiler reads top to bottom, so at meow(3) it has never heard of meow. The prototype at the top is the promise that meow exists further down.",
          },
        ],
        "correctness-design-style": [
          {
            kind: "predict",
            id: "week-1-lecture-p4-axes",
            prompt:
              "Your meow.c prints three meows correctly, but with three copied printf lines. Which axis would a reviewer criticise?",
            options: ["Design", "Correctness", "Style"],
            answer: 0,
            explanation:
              "It runs as intended, so it is correct. Repeating code when a loop would do is a design problem, which design50 helps you spot.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-1-lecture-p4-recap-start-one",
        prompt: "The for loop from meow.c now starts i at 1. How many times does it meow?",
        code: code`
for (int i = 1; i < 3; i++)
{
    printf("meow\n");
}
`,
        language: "c",
        options: ["2", "3", "4"],
        answer: 0,
        explanation:
          "i takes only the values 1 and 2 before 3 < 3 fails. Changing the start without changing the condition loses a pass.",
      },
      exercise: {
        prompt:
          "Write countdown.c. Ask for a number with get_int and keep asking until it is at least 1. Then call your own function void countdown(int n), which prints n down to 1, one per line, then Liftoff!. Typing 3 should print 3, 2, 1 and Liftoff! on four lines; typing 0 or -4 should ask again.",
        language: "c",
        starter: code`
#include <cs50.h>
#include <stdio.h>

void countdown(int n);

int main(void)
{
    // Ask for n until it is at least 1

    // Count down from n
}

void countdown(int n)
{
    // Print n, n - 1, ..., 1, then Liftoff!
}
`,
        hints: [
          "Asking at least once and then maybe again is the job of a do-while loop.",
          "A for loop can count down: start at n, keep going while the counter is above 0, and subtract one each time.",
          "Liftoff! is printed once, so it goes after the loop, not inside it.",
        ],
        solution: code`
#include <cs50.h>
#include <stdio.h>

void countdown(int n);

int main(void)
{
    int n;
    do
    {
        n = get_int("Start from: ");
    }
    while (n < 1);

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

// The do-while asks once and repeats only while n < 1.
// countdown gets its own copy of n and counts i down from it to 1.
`,
      },
      recall: [
        {
          id: "week-1-lecture-p4-r1",
          prompt: "What makes a do-while loop different from a while loop?",
          options: [
            "Its body always runs at least once before the condition is checked",
            "It can only count down",
            "It never needs a condition",
          ],
          answer: 0,
          explanation:
            "A while loop checks first and might never run. A do-while runs first, which suits asking the user for input.",
        },
        {
          id: "week-1-lecture-p4-r2",
          prompt: "In for (int i = 0; i < 3; i++), when does i++ run?",
          options: [
            "After each pass through the body, before the next check",
            "Before the body, every pass",
            "Only once, at the start",
          ],
          answer: 0,
          explanation:
            "int i = 0 runs once, then the check, the body, and i++ repeat in that order until the check fails.",
        },
        {
          id: "week-1-lecture-p4-r3",
          prompt: "What does the first void in void meow(int n) mean?",
          options: [
            "meow does not return a value",
            "meow takes no input",
            "meow is empty",
          ],
          answer: 0,
          explanation:
            "The word before the name is the return type, and void means nothing comes back. (int n) says it does take an input.",
        },
        {
          id: "week-1-lecture-p4-r4",
          prompt:
            "main has int n = 3 and calls meow(n). Inside meow, the parameter is also called n. What is it?",
          options: [
            "Its own copy of the value 3",
            "The same variable as main's n",
            "Undefined, because the names clash",
          ],
          answer: 0,
          explanation:
            "Each function has its own scope. meow receives a copy of the value, so nothing it does to its n changes main's.",
        },
        {
          id: "week-1-lecture-p4-r5",
          prompt: "Why put a prototype like void meow(int n); above main?",
          options: [
            "So the compiler knows meow exists when main calls it",
            "So meow runs before main",
            "So meow can change main's variables",
          ],
          answer: 0,
          explanation:
            "The compiler reads from the top. The prototype lets you keep main first and define helper functions below it.",
        },
      ],
    },

    "week-1-lecture-p5": {
      hook: "A wall of bricks is rows of bricks, and each row is bricks side by side: a loop inside a loop. Then the numbers themselves: why does 7 / 2 give 3 in C, and why does doubling a dollar enough times give a negative amount? Types have limits, and this part shows you where they are before they surprise you.",
      after: {
        mario: [
          {
            kind: "trace",
            id: "week-1-lecture-p5-nested-trace",
            caption:
              "A 2-by-2 grid with nested loops. Watch j restart at 0 for every new value of i.",
            code: code`
int main(void)
{
    const int n = 2;
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            printf("#");
        }
        printf("\n");
    }
}
`,
            language: "c",
            steps: [
              { line: 3, vars: { n: "2" } },
              { line: 4, vars: { n: "2", i: "0" }, note: "0 < 2: start row 0." },
              { line: 6, vars: { n: "2", i: "0", j: "0" } },
              { line: 8, vars: { n: "2", i: "0", j: "0" }, output: "#" },
              { line: 6, vars: { n: "2", i: "0", j: "1" }, output: "#", note: "j++ makes 1, and 1 < 2." },
              { line: 8, vars: { n: "2", i: "0", j: "1" }, output: "##" },
              {
                line: 10,
                vars: { n: "2", i: "0" },
                output: "##\n",
                note: "j reached 2 and 2 < 2 failed, so the inner loop ended. The row is finished with a newline.",
              },
              { line: 4, vars: { n: "2", i: "1" }, output: "##\n", note: "i++ makes 1: start row 1." },
              { line: 6, vars: { n: "2", i: "1", j: "0" }, output: "##\n", note: "A fresh j starts at 0 again." },
              { line: 8, vars: { n: "2", i: "1", j: "0" }, output: "##\n#" },
              { line: 6, vars: { n: "2", i: "1", j: "1" }, output: "##\n#" },
              { line: 8, vars: { n: "2", i: "1", j: "1" }, output: "##\n##" },
              { line: 10, vars: { n: "2", i: "1" }, output: "##\n##\n" },
              {
                line: 4,
                vars: { n: "2", i: "2" },
                output: "##\n##\n",
                note: "2 < 2 is false. Two rows of two: four bricks.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-1-lecture-p5-row-or-column",
            prompt: "This is meant to print the row ????. What does it print instead?",
            code: code`
for (int i = 0; i < 4; i++)
{
    printf("?\n");
}
`,
            language: "c",
            options: [
              "Four question marks in a column, one per line",
              "???? on one line",
              "One question mark",
            ],
            answer: 0,
            explanation:
              "The \\n is inside the loop, so every ? ends its own line. The notes' row version prints ? in the loop and one \\n after it.",
          },
          {
            kind: "compare",
            id: "week-1-lecture-p5-compare-const",
            prompt: "Both print a 3-by-3 grid. Which is better designed?",
            language: "c",
            a: {
              label: "Magic numbers",
              code: code`
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        printf("#");
    }
    printf("\n");
}
`,
            },
            b: {
              label: "A constant",
              code: code`
const int n = 3;
for (int i = 0; i < n; i++)
{
    for (int j = 0; j < n; j++)
    {
        printf("#");
    }
    printf("\n");
}
`,
            },
            answer: "b",
            explanation:
              "With n, the size lives in one place, so a 5-by-5 grid is one edit and the two loops cannot disagree. const also stops any later line from changing it by accident.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p5-const-change",
            prompt: "What happens when you compile this?",
            code: code`
const int n = 3;
n = 4;
`,
            language: "c",
            options: [
              "A compile error: n is constant and cannot be assigned",
              "n becomes 4",
              "n stays 3 and the line is silently ignored",
            ],
            answer: 0,
            explanation:
              "const tells the compiler this value must never change, so it rejects any assignment to it. That turns a bug into an error you see right away.",
          },
          {
            kind: "blank",
            id: "week-1-lecture-p5-print-row",
            prompt: "main should print n rows, each n bricks wide. Fill in the argument.",
            code: code`
int main(void)
{
    const int n = 3;
    for (int i = 0; i < n; i++)
    {
        print_row(____);
    }
}
`,
            language: "c",
            options: ["n", "i", "width"],
            answer: 0,
            explanation:
              "Each row should be n bricks wide. i would make rows of 0, 1 and 2 bricks, and width only exists inside print_row.",
          },
        ],
        operators: [
          {
            kind: "predict",
            id: "week-1-lecture-p5-int-division",
            prompt: "x and y are ints. You enter 7 and 2. What prints?",
            code: code`
printf("%i\n", x / y);
`,
            language: "c",
            options: ["3", "3.5", "4"],
            answer: 0,
            explanation:
              "Dividing two ints gives an int, and C throws away the fraction rather than rounding. So 7 / 2 is 3, not 3.5 and not 4.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p5-cast",
            prompt: "Same inputs, 7 and 2, but x is cast first. What prints?",
            code: code`
printf("%f\n", (float) x / y);
`,
            language: "c",
            options: ["3.500000", "3.5", "3.000000"],
            answer: 0,
            explanation:
              "(float) x makes 7.0, so the division keeps the fraction. %f prints six digits after the point by default, so you see 3.500000.",
          },
          {
            kind: "predict",
            id: "week-1-lecture-p5-cast-late",
            prompt: "Now the parentheses move. With 7 and 2 again, what prints?",
            code: code`
printf("%f\n", (float) (x / y));
`,
            language: "c",
            options: ["3.000000", "3.500000", "3"],
            answer: 0,
            explanation:
              "x / y runs first as int division and gives 3. Casting 3 to a float afterwards cannot bring back the lost half.",
          },
          {
            kind: "trace",
            id: "week-1-lecture-p5-dollars-trace",
            caption:
              "The doubling program with an int. You answer y, y, then n.",
            code: code`
int dollars = 1;
while (true)
{
    char c = get_char("Double it? ");
    if (c == 'y')
    {
        dollars *= 2;
    }
    else
    {
        break;
    }
}
printf("Here's $%i.\n", dollars);
`,
            language: "c",
            steps: [
              { line: 1, vars: { dollars: "1" } },
              { line: 4, vars: { dollars: "1", c: "'y'" }, output: "Double it? y\n" },
              {
                line: 7,
                vars: { dollars: "2", c: "'y'" },
                output: "Double it? y\n",
                note: "*= 2 is shorthand for dollars = dollars * 2.",
              },
              { line: 4, vars: { dollars: "2", c: "'y'" }, output: "Double it? y\nDouble it? y\n" },
              { line: 7, vars: { dollars: "4", c: "'y'" }, output: "Double it? y\nDouble it? y\n" },
              {
                line: 4,
                vars: { dollars: "4", c: "'n'" },
                output: "Double it? y\nDouble it? y\nDouble it? n\n",
              },
              {
                line: 11,
                vars: { dollars: "4", c: "'n'" },
                output: "Double it? y\nDouble it? y\nDouble it? n\n",
                note: "break leaves the while (true) loop immediately.",
              },
              {
                line: 14,
                vars: { dollars: "4" },
                output: "Double it? y\nDouble it? y\nDouble it? n\nHere's $4.\n",
                note: "c belonged to the loop's block, so it is gone now.",
              },
            ],
          },
          {
            kind: "compare",
            id: "week-1-lecture-p5-compare-long",
            prompt:
              "Someone keeps typing y for a very long time. Which version shows a correct amount for longer?",
            language: "c",
            a: {
              label: "int",
              code: code`
int dollars = 1;
dollars *= 2;
printf("Here's $%i.\n", dollars);
`,
            },
            b: {
              label: "long",
              code: code`
long dollars = 1;
dollars *= 2;
printf("Here's $%li.\n", dollars);
`,
            },
            answer: "b",
            explanation:
              "An int tops out around 2147483647 and then overflows. A long has more bits, so it lasts far longer, though it can still overflow eventually. Note %li to match the long.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-1-lecture-p5-recap-grid",
        prompt: "The outer loop runs 2 times and the inner loop 4 times. What prints?",
        code: code`
for (int i = 0; i < 2; i++)
{
    for (int j = 0; j < 4; j++)
    {
        printf("#");
    }
    printf("\n");
}
`,
        language: "c",
        options: [
          "Two rows of four: #### and ####",
          "Four rows of two",
          "One row of eight",
        ],
        answer: 0,
        explanation:
          "The outer loop decides how many rows, and the inner loop how many bricks per row. The \\n after the inner loop ends each row.",
      },
      exercise: {
        prompt:
          "Write rectangle.c. Ask for a width and a height, each at least 1, re-asking as needed. Print a solid rectangle of # that size using a helper function void print_row(int width). Then print its area, and the ratio width / height as a decimal. A width of 4 and height of 3 should print three rows of ####, then Area: 12 and Ratio: 1.333333.",
        language: "c",
        starter: code`
#include <cs50.h>
#include <stdio.h>

void print_row(int width);

int main(void)
{
    // Ask for width and height, each at least 1

    // Print height rows

    // Print the area and the ratio
}

void print_row(int width)
{
    // Print width bricks, then end the line
}
`,
        hints: [
          "Use one do-while loop for each input, the same shape as the notes' get_positive_int.",
          "main loops once per row and calls print_row(width) each time; print_row has its own loop for the bricks.",
          "width / height with two ints gives 1, not 1.333333. Cast one of them to float first.",
        ],
        solution: code`
#include <cs50.h>
#include <stdio.h>

void print_row(int width);

int main(void)
{
    int width;
    do
    {
        width = get_int("Width: ");
    }
    while (width < 1);

    int height;
    do
    {
        height = get_int("Height: ");
    }
    while (height < 1);

    for (int i = 0; i < height; i++)
    {
        print_row(width);
    }

    printf("Area: %i\n", width * height);
    printf("Ratio: %f\n", (float) width / height);
}

void print_row(int width)
{
    for (int i = 0; i < width; i++)
    {
        printf("#");
    }
    printf("\n");
}

// print_row hides the inner loop, so main reads as one row per pass.
// The cast makes the division happen in floating point, keeping the .333333.
`,
      },
      recall: [
        {
          id: "week-1-lecture-p5-r1",
          prompt:
            "An outer loop runs 3 times and an inner loop runs 3 times on each pass. How many times does the inner body run in total?",
          options: ["9", "6", "3"],
          answer: 0,
          explanation:
            "The inner loop runs all 3 of its passes for each of the 3 outer passes: 3 x 3 = 9 bricks.",
        },
        {
          id: "week-1-lecture-p5-r2",
          prompt: "In C, what is 7 / 2 when both are ints?",
          options: ["3", "3.5", "4"],
          answer: 0,
          explanation:
            "Integer division truncates: the fraction is discarded, not rounded.",
        },
        {
          id: "week-1-lecture-p5-r3",
          prompt: "What does % compute in C?",
          options: ["The remainder of a division", "A percentage", "The quotient"],
          answer: 0,
          explanation:
            "% is the remainder operator, so 7 % 2 is 1. In printf, % also starts a format code, which is a different use.",
        },
        {
          id: "week-1-lecture-p5-r4",
          prompt: "What is integer overflow?",
          options: [
            "A value goes past the largest number its type can hold and wraps to a wrong value",
            "A program prints too many lines",
            "Dividing by zero",
          ],
          answer: 0,
          explanation:
            "Each type has a fixed number of bits. Doubling an int past about 2 billion leaves no room, and the stored value comes out wrong.",
        },
        {
          id: "week-1-lecture-p5-r5",
          prompt:
            "Printing a float division with %.50f shows long, odd digits at the end. Why?",
          options: [
            "A float has a limited number of bits, so most decimals can only be approximated",
            "%.50f adds random digits",
            "The division was done with ints",
          ],
          answer: 0,
          explanation:
            "That is floating-point imprecision. With finite bits, a float stores the closest value it can, and 50 places reveal the difference.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-1-section-r1",
        prompt: "In section, balance is an int set to 20. What is balance after this line?",
        code: "balance = balance / 3;",
        options: ["6", "7", "6.67"],
        answer: 0,
        explanation:
          "20 / 3 with ints truncates to 6. It does not round up to 7, and an int cannot hold 6.67.",
      },
      {
        id: "week-1-section-r2",
        prompt: "balance is 20. What is balance % 6?",
        options: ["2", "3", "0"],
        answer: 0,
        explanation:
          "6 goes into 20 three times, making 18, with 2 left over. % gives that remainder.",
      },
      {
        id: "week-1-section-r3",
        prompt:
          "The contacts program first stored a phone number with get_int, and it kept re-prompting. Why is string the better type?",
        options: [
          "Phone numbers have characters like - and ( ) and are never used for arithmetic",
          "Strings are always faster than ints",
          "get_int cannot read numbers longer than three digits",
        ],
        answer: 0,
        explanation:
          "get_int only accepts a whole integer, so input with dashes or brackets is rejected. A phone number is really a label made of characters.",
      },
      {
        id: "week-1-section-r4",
        prompt:
          "Kelly first wrote printf(\"hello, Kelly\\n\"). Why was that wrong, even though it printed hello, Kelly?",
        options: [
          "The name was hard-coded, so every user would be greeted as Kelly",
          "printf cannot print names",
          "It was missing a semicolon",
        ],
        answer: 0,
        explanation:
          "Hard-coding fixes the value in the code. Using %s with the name variable makes the output follow whatever the user typed.",
      },
      {
        id: "week-1-section-r5",
        prompt:
          "In section, the height prompt for the pyramid was wrapped in a do-while. What did that achieve?",
        options: [
          "It re-asked until the user gave a usable height",
          "It printed the pyramid twice",
          "It made height a constant",
        ],
        answer: 0,
        explanation:
          "do-while asks at least once and repeats while the height is invalid, so typing -5 just brings the prompt back.",
      },
    ],
    exercise: {
      prompt:
        "Write profile.c in the style of section's contacts program. Ask for a name, an age, and a city. Keep asking for the age until it is 0 or more. Then print one line like: Ada, 36, lives in London. It works if typing -3 for the age asks again and the final line uses exactly what you typed.",
      language: "c",
      starter: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    // name

    // age, at least 0

    // city

    // print the profile
}
`,
      hints: [
        "Pick each type by what you will do with it: words are strings, and an age is an int.",
        "Re-asking until the input is valid is a do-while loop.",
        "printf fills its placeholders in order, so list name, age and city in the same order as %s, %i and %s.",
      ],
      solution: code`
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    string name = get_string("Name: ");

    int age;
    do
    {
        age = get_int("Age: ");
    }
    while (age < 0);

    string city = get_string("City: ");

    printf("%s, %i, lives in %s.\n", name, age, city);
}

// Each placeholder matches its variable's type, and they are filled in order.
`,
    },
  },

  shorts: {
    "week-1-short-data-types": {
      recall: [
        {
          id: "week-1-short-data-types-r1",
          prompt: "How many bytes does an int use, and roughly how high can it count?",
          options: [
            "4 bytes, about 2 billion",
            "1 byte, up to 255",
            "8 bytes, with no limit",
          ],
          answer: 0,
          explanation:
            "An int is 32 bits, split between negative and positive values, so it reaches about 2 billion either way.",
        },
        {
          id: "week-1-short-data-types-r2",
          prompt: "When would you choose a double over a float?",
          options: [
            "When you need more digits of precision after the decimal point",
            "When the number has no decimal point",
            "When you want to store a single character",
          ],
          answer: 0,
          explanation:
            "A double uses 64 bits instead of 32, so it can hold many more correct decimal digits.",
        },
        {
          id: "week-1-short-data-types-r3",
          prompt: "Which line both declares and initializes a variable?",
          options: ["int number = 17;", "int number;", "number = 17;"],
          answer: 0,
          explanation:
            "int number; only declares and number = 17; only assigns. Doing both in one line is initialization.",
        },
        {
          id: "week-1-short-data-types-r4",
          prompt: "Which two types come from cs50.h rather than C itself?",
          options: ["bool and string", "int and char", "float and double"],
          answer: 0,
          explanation:
            "The short explains that CS50's library provides bool and string, so you need #include <cs50.h> to use them.",
        },
      ],
    },
    "week-1-short-operators": {
      recall: [
        {
          id: "week-1-short-operators-r1",
          prompt: "y is 10. After these two lines, what is x?",
          code: "int x = y + 1;\nx = x * 5;",
          options: ["55", "11", "51"],
          answer: 0,
          explanation:
            "x starts as 11. Then the right side, 11 * 5, is computed first and stored back in x, giving 55.",
        },
        {
          id: "week-1-short-operators-r2",
          prompt: "What is 13 % 4?",
          options: ["1", "3", "3.25"],
          answer: 0,
          explanation:
            "4 goes into 13 three times, which is 12, leaving a remainder of 1. % gives the remainder, not the quotient.",
        },
        {
          id: "week-1-short-operators-r3",
          prompt: "x is true and y is false. What is x && y?",
          options: ["false", "true"],
          answer: 0,
          explanation:
            "&& is only true when both sides are true. x || y would be true here.",
        },
        {
          id: "week-1-short-operators-r4",
          prompt: "In C, which values count as true?",
          options: ["Every value except 0", "Only 1", "Only positive numbers"],
          answer: 0,
          explanation:
            "C treats 0 as false and any non-zero value, even negative, as true.",
        },
      ],
    },
    "week-1-short-conditional-statements": {
      recall: [
        {
          id: "week-1-short-conditional-statements-r1",
          prompt: "This switch has no break after case 1 or case 2. The user enters 2. What prints?",
          code: "switch (x)\n{\n    case 1:\n        printf(\"one\\n\");\n    case 2:\n        printf(\"two\\n\");\n    case 3:\n        printf(\"three\\n\");\n        break;\n}",
          options: ["two, then three", "two", "one, two, three"],
          answer: 0,
          explanation:
            "switch jumps to case 2, and without a break it falls through into case 3. It never goes back to case 1.",
        },
        {
          id: "week-1-short-conditional-statements-r2",
          prompt: "y is 3. What is x after this line?",
          code: "int x = (y > 10) ? 5 : 6;",
          options: ["6", "5", "3"],
          answer: 0,
          explanation:
            "The ternary operator picks the value after ? when the test is true and after : when false. 3 > 10 is false, so x is 6.",
        },
        {
          id: "week-1-short-conditional-statements-r3",
          prompt: "In an if, else if, else chain, how many branches can run?",
          options: ["Exactly one", "All whose conditions are true", "At most two"],
          answer: 0,
          explanation:
            "The branches are mutually exclusive: the first true one runs and the rest are skipped, or the else runs if none is true.",
        },
      ],
    },
    "week-1-short-loops": {
      recall: [
        {
          id: "week-1-short-loops-r1",
          prompt: "How many times does this body run?",
          code: "for (int i = 15; i < 10; i++)\n{\n    printf(\"hi\\n\");\n}",
          options: ["0", "1", "5"],
          answer: 0,
          explanation:
            "The condition is checked before the first pass, and 15 < 10 is false, so the body never runs.",
        },
        {
          id: "week-1-short-loops-r2",
          prompt: "Which loop fits asking the user for a positive number?",
          options: ["do-while", "for", "while (true) with no break"],
          answer: 0,
          explanation:
            "You must ask at least once and may need to ask again, which is exactly a do-while.",
        },
        {
          id: "week-1-short-loops-r3",
          prompt: "Scratch's repeat until and C's while differ how?",
          options: [
            "repeat until stops when its condition becomes true; while stops when its condition becomes false",
            "They are exactly the same",
            "while always runs forever",
          ],
          answer: 0,
          explanation:
            "Their conditions are reversed. A while loop keeps going as long as the condition is true.",
        },
        {
          id: "week-1-short-loops-r4",
          prompt: "This loop forgets i++. What happens?",
          code: "int i = 0;\nwhile (i < 3)\n{\n    printf(\"meow\\n\");\n}",
          options: [
            "It meows forever, until you press control-C",
            "It meows three times",
            "It does not compile",
          ],
          answer: 0,
          explanation:
            "i stays 0, so i < 3 is always true. Nothing in the body moves the loop toward its end.",
        },
      ],
    },
    "week-1-short-command-line": {
      recall: [
        {
          id: "week-1-short-command-line-r1",
          prompt: "You are in ~/workspace/pset1. Which command takes you up to ~/workspace?",
          options: ["cd ..", "cd .", "cd workspace"],
          answer: 0,
          explanation:
            ".. is the name of the parent directory. . is the current one, and there is no workspace folder inside pset1.",
        },
        {
          id: "week-1-short-command-line-r2",
          prompt: "You are lost deep in folders. Which command prints where you are?",
          options: ["pwd", "ls", "cd"],
          answer: 0,
          explanation:
            "pwd prints the present working directory. ls lists what is inside it, and cd on its own jumps home.",
        },
        {
          id: "week-1-short-command-line-r3",
          prompt: "What does rm hello.c do?",
          options: ["Deletes hello.c", "Renames hello.c", "Opens hello.c"],
          answer: 0,
          explanation:
            "rm removes a file. There is no recycle bin at the command line, so use it carefully.",
        },
      ],
    },
    "week-1-short-magic-numbers": {
      recall: [
        {
          id: "week-1-short-magic-numbers-r1",
          prompt: "Which line correctly defines a symbolic constant?",
          options: [
            "#define DECKSIZE 52",
            "#define DECKSIZE 52;",
            "#define DECKSIZE = 52",
          ],
          answer: 0,
          explanation:
            "The form is #define NAME replacement, with no equals sign and no semicolon. The compiler replaces NAME with exactly what follows it.",
        },
        {
          id: "week-1-short-magic-numbers-r2",
          prompt: "Why is a for loop with i < 52 considered a magic number?",
          options: [
            "52 appears with no name explaining what it means",
            "52 is too large for an int",
            "Loops cannot use literal numbers",
          ],
          answer: 0,
          explanation:
            "A reader has to guess that 52 is a deck size, and if it changes you must find every 52 in the code.",
        },
        {
          id: "week-1-short-magic-numbers-r3",
          prompt: "Why are #define names usually written in capitals?",
          options: [
            "So they are easy to tell apart from variables",
            "Because the compiler requires it",
            "Because lowercase names cannot be replaced",
          ],
          answer: 0,
          explanation:
            "It is a convention, not a rule. Capitals signal that this is a constant and should not be treated like a variable.",
        },
      ],
    },
  },

  glossary: [
    { term: "source code", meaning: "The instructions you write in a language like C, readable by people." },
    { term: "machine code", meaning: "The 0s and 1s a computer actually runs." },
    { term: "compiler", meaning: "A program that translates source code into machine code." },
    { term: "make", meaning: "A command that runs the compiler for you, so make hello turns hello.c into a program called hello." },
    { term: "terminal", meaning: "The command line window where you type commands such as make, ls and ./hello." },
    { term: "header file", meaning: "A file such as stdio.h or cs50.h that you #include to use a library's functions." },
    { term: "library", meaning: "A collection of code someone else wrote that your program can use." },
    { term: "string", meaning: "A piece of text, a sequence of characters, written in double quotes." },
    { term: "char", meaning: "A single character, written in single quotes, such as 'y'." },
    { term: "int", meaning: "A whole number type that can hold values up to about 2 billion, positive or negative." },
    { term: "long", meaning: "A whole number type with more bits than int, so it can hold much larger values." },
    { term: "float", meaning: "A number type that can hold a fractional part, such as 3.5, with limited precision." },
    { term: "format code", meaning: "A placeholder in printf, such as %s or %i, that is replaced by a value of the matching type." },
    { term: "escape sequence", meaning: "A backslash plus a character, such as \\n or \\\", that stands for something hard to type in a string." },
    { term: "prototype", meaning: "A function's first line with a semicolon, placed at the top so the compiler knows the function exists." },
    { term: "return value", meaning: "The value a function hands back to whoever called it, such as the number get_int returns." },
    { term: "scope", meaning: "The part of a program where a variable exists; a variable made in main cannot be seen in another function." },
    { term: "constant", meaning: "A value that cannot change once set, made with const or #define." },
    { term: "integer overflow", meaning: "When a number grows past the largest value its type can hold and the stored value becomes wrong." },
    { term: "casting", meaning: "Converting a value to another type, such as (float) x, so that division keeps the fraction." },
  ],
};

export default content;
