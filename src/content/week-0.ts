import type { WeekContent } from "./types";

/** Code block from a raw template: keeps backslashes, drops the first and last newline. */
const code = (s: TemplateStringsArray) =>
  String.raw(s).replace(/\r/g, "").replace(/^\n/, "").replace(/\n$/, "");

const content: WeekContent = {
  unitId: "week-0",
  parts: {
    "week-0-lecture-p1": {
      hook: "A computer is billions of tiny switches that are either on or off. So how does a machine that only knows on and off count to 255, or answer a question you type? This part shows how a row of switches becomes a number. Once you can read binary yourself, the rest of the course stops feeling like magic.",
      after: {
        "visual-studio-code-and-chatpy": [
          {
            kind: "predict",
            id: "week-0-lecture-p1-chat-input",
            prompt:
              "The second version of chat.py replaced the fixed question with this line. What changed for the person running it?",
            code: code`
prompt = input("Prompt: ")
`,
            language: "python",
            options: [
              "They type their own question each time the program runs",
              "The program now picks a different AI model",
              "The answer is saved to a file instead of printed",
            ],
            answer: 0,
            explanation:
              "input shows the text Prompt: and waits for you to type. Whatever you type is stored in prompt and sent to the chatbot, so the question is no longer fixed in the code.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p1-system-prompt",
            prompt:
              "In the third version, what job does system_prompt do that user_prompt does not?",
            code: code`
user_prompt = input("Prompt: ")
system_prompt = "Limit your answer to one sentence. Pretend you're a cat."
`,
            language: "python",
            options: [
              "It tells the chatbot how to answer, separately from the question",
              "It is the question the user typed",
              "It prints the answer to the screen",
            ],
            answer: 0,
            explanation:
              "user_prompt holds the question. system_prompt is passed as instructions, so it shapes every answer (one sentence, like a cat) without the user typing it.",
          },
        ],
        "computer-science-and-problem-solving": [
          {
            kind: "predict",
            id: "week-0-lecture-p1-three-bulbs",
            prompt:
              "Three light bulbs stand for the 4s, 2s and 1s places. The first two are on and the last is off. What number is that?",
            code: code`
4 2 1
1 1 0
`,
            language: "text",
            options: ["6", "3", "110", "5"],
            answer: 0,
            explanation:
              "Add the places whose bulb is on: 4 + 2 = 6. Reading 110 as a decimal number is the common slip; in binary each place is worth double the one to its right.",
          },
          {
            kind: "trace",
            id: "week-0-lecture-p1-read-binary",
            caption:
              "Turn the bits 101 into a decimal number, one place at a time.",
            code: code`
set total to 0
look at the 4s place: it is 1, so add 4 to total
look at the 2s place: it is 0, so add nothing
look at the 1s place: it is 1, so add 1 to total
say total
`,
            language: "pseudocode",
            steps: [
              { line: 1, vars: { total: "0" } },
              { line: 2, vars: { total: "4" } },
              {
                line: 3,
                vars: { total: "4" },
                note: "A 0 bit means that place is off and adds nothing.",
              },
              { line: 4, vars: { total: "5" } },
              { line: 5, vars: { total: "5" }, output: "5" },
            ],
          },
          {
            kind: "demo",
            id: "week-0-lecture-p1-binary-demo",
            demo: "binary",
            caption:
              "Make 5, then 10, then turn every switch on. Is the all-on number one less than the next place value?",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p1-bits-for-eight",
            prompt:
              "Three bits can count from 0 up to 7. How many bits do you need to write the number 8?",
            options: ["3", "4", "8"],
            answer: 1,
            explanation:
              "8 needs an 8s place, so it is 1000 in binary: four bits. Three bits top out at 111, which is 4 + 2 + 1 = 7.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p1-byte",
            prompt: "What decimal number is the byte 00001010?",
            code: code`
128 64 32 16 8 4 2 1
  0  0  0  0 1 0 1 0
`,
            language: "text",
            options: ["10", "5", "2", "1010"],
            answer: 0,
            explanation:
              "The 8s and 2s places are on, and 8 + 2 = 10. The notes' example 00000101 is 5; shifting every bit one place left doubles the value.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-0-lecture-p1-recap-patterns",
        prompt:
          "With three light bulbs you can count from 0 to 7. How many different patterns can the three bulbs show?",
        options: ["7", "8", "3", "6"],
        answer: 1,
        explanation:
          "The patterns run from 000 to 111, which is the numbers 0 through 7. Counting 0 as well gives 8 patterns, not 7; forgetting zero is the classic off-by-one slip.",
      },
      exercise: {
        prompt:
          "In Scratch, make the cat count from 0 to 7 in binary. When the green flag is clicked, it should say each three-bit pattern with its decimal value, such as 011 = 3, for one second each. It works if you see eight messages and the last one is 111 = 7.",
        language: "scratch",
        starter: "",
        hints: [
          "Start with a when green flag clicked block, then stack say blocks under it.",
          "Use the say [ ] for (1) seconds block so each message stays up before the next one.",
          "Each pattern adds one to the last. When the 1s place is already 1, it goes back to 0 and you carry into the 2s place.",
        ],
        solution: code`
when green flag clicked
say [000 = 0] for (1) seconds
say [001 = 1] for (1) seconds
say [010 = 2] for (1) seconds
say [011 = 3] for (1) seconds
say [100 = 4] for (1) seconds
say [101 = 5] for (1) seconds
say [110 = 6] for (1) seconds
say [111 = 7] for (1) seconds

Three bits give 2 x 2 x 2 = 8 patterns. Writing all eight out by hand also sets up the next idea: a loop could do this repetition for you.
`,
      },
      recall: [
        {
          id: "week-0-lecture-p1-r1",
          prompt: "In an 8-bit byte, what is the leftmost place worth?",
          options: ["128", "256", "8", "255"],
          answer: 0,
          explanation:
            "The places double from the right: 1, 2, 4, 8, 16, 32, 64, 128. 255 is what you get with every bit on, not the value of one place.",
        },
        {
          id: "week-0-lecture-p1-r2",
          prompt: "What decimal number is the binary 0110?",
          options: ["6", "110", "3", "12"],
          answer: 0,
          explanation:
            "The 4s and 2s places are on, so 4 + 2 = 6. Read binary by adding the place values of the 1 bits.",
        },
        {
          id: "week-0-lecture-p1-r3",
          prompt: "Why do computers count in binary rather than in decimal?",
          options: [
            "They are built from transistors that are either on or off",
            "Binary numbers take less space to write on paper",
            "Decimal was invented after computers",
          ],
          answer: 0,
          explanation:
            "Each transistor is a switch with two states, so two digits, 0 and 1, map directly onto the hardware.",
        },
        {
          id: "week-0-lecture-p1-r4",
          prompt:
            "Programming is described as input, then a black box, then output. What is inside the black box?",
          options: [
            "The steps that turn the input into the output",
            "The screen that shows the output",
            "The keyboard that collects the input",
          ],
          answer: 0,
          explanation:
            "The black box is the process, the algorithm, that solves the problem. Writing that process well is what the course is about.",
        },
      ],
    },

    "week-0-lecture-p2": {
      hook: "When a friend texts you HI!, your phone receives nothing but bits. How does it know those bits are letters and not a number or a color? And if you had to find one name in a phone book of a thousand pages, how few pages could you get away with opening? This part answers both.",
      after: {
        ascii: [
          {
            kind: "predict",
            id: "week-0-lecture-p2-ascii-letter",
            prompt:
              "In ASCII, A is 65. Which character does this byte stand for?",
            code: code`
128 64 32 16 8 4 2 1
  0  1  0  0 0 0 1 0
`,
            language: "text",
            options: ["B", "A", "C", "b"],
            answer: 0,
            explanation:
              "64 + 2 = 66, and ASCII puts the capitals in order, so 66 is B. Lowercase b is 98, much further along the table.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p2-ascii-message",
            prompt:
              "A message arrives as 72 105 33. Using the ASCII table in the notes, what does it say?",
            options: ["Hi!", "HI!", "hi!", "H1!"],
            answer: 0,
            explanation:
              "72 is H and 33 is !, as in the notes. 105 is lowercase i; capital I is 73. Capitals and lowercase letters are different numbers.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p2-byte-values",
            prompt:
              "If each character is stored in one 8-bit byte, how many different character codes are possible?",
            options: ["256", "255", "128", "8"],
            answer: 0,
            explanation:
              "Eight bits run from 0 to 255, and counting 0 that is 256 values. ASCII only uses 128 of them, the codes 0 to 127.",
          },
        ],
        unicode: [
          {
            kind: "predict",
            id: "week-0-lecture-p2-emoji-look",
            prompt:
              "You send the same emoji to a friend with a different brand of phone, and it looks slightly different on their screen. Why?",
            options: [
              "Unicode fixes the bits, but each manufacturer draws the picture its own way",
              "The emoji's bits were changed while it was being sent",
              "Their phone is using ASCII instead of Unicode",
            ],
            answer: 0,
            explanation:
              "Both phones agree on the same pattern of bits, which is what the standard guarantees. How that character is drawn is up to each device maker.",
          },
        ],
        rgb: [
          {
            kind: "predict",
            id: "week-0-lecture-p2-same-bytes",
            prompt:
              "The bytes 72 73 33 spell HI! in a text message, but in an image they make one light yellow pixel. What decides which one you see?",
            options: [
              "The program reading the bytes and what it expects them to be",
              "The bytes themselves, which carry a hidden label",
              "Whether the numbers are bigger than 64",
            ],
            answer: 0,
            explanation:
              "The bits are identical in both cases. A text app reads them as ASCII characters; an image viewer reads three bytes as the red, green and blue amounts of one pixel.",
          },
        ],
        algorithms: [
          {
            kind: "predict",
            id: "week-0-lecture-p2-two-pages",
            prompt:
              "A phone book has 100 pages. If you search two pages at a time, about how many steps does it take in the worst case?",
            options: ["About 50", "About 100", "About 7", "About 2"],
            answer: 0,
            explanation:
              "Two pages per step halves the work once, so it is about n/2 = 50. Only cutting the remaining book in half each time gets you down to about 7.",
          },
          {
            kind: "demo",
            id: "week-0-lecture-p2-search-demo",
            demo: "search",
            caption:
              "Pick a target and count the steps as the search keeps halving. Then imagine the list twice as long: how many more steps would it need?",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p2-double-book",
            prompt:
              "The halving algorithm needs about 10 steps for a 1,000-page book. The book grows to 2,000 pages. About how many steps now?",
            options: ["About 11", "About 20", "About 1,000", "About 2,000"],
            answer: 0,
            explanation:
              "One extra tear cuts 2,000 pages back to 1,000, and from there it is the same 10 steps. That is what log2 n means: doubling the problem adds one step.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-0-lecture-p2-recap-cat",
        prompt:
          "A text message arrives as the numbers 67 65 84. A is 65. What does it say?",
        options: ["CAT", "cat", "BAT", "CAR"],
        answer: 0,
        explanation:
          "65 is A, so 67 is two letters later, C, and 84 is T. These are capital letters; the lowercase ones start at 97.",
      },
      exercise: {
        prompt:
          "In Scratch, make the cat send a coded word. When the green flag is clicked, it says three ASCII numbers for two seconds, then says the word they spell. Pick your own three-letter word in capitals. It works if a friend can decode the numbers with the ASCII table and get your word.",
        language: "scratch",
        starter: "",
        hints: [
          "Use one say [ ] for (2) seconds block for the numbers and a plain say [ ] block for the word.",
          "A is 65 and the capitals go in order, so count forward from 65 to find each letter.",
          "Check every number against the table in the notes before you click the flag.",
        ],
        solution: code`
when green flag clicked
say [68 79 71] for (2) seconds
say [DOG]

D is 65 + 3 = 68, O is 65 + 14 = 79 and G is 65 + 6 = 71. The cat shows the same information twice, once as numbers and once as text, which is exactly what ASCII maps between.
`,
      },
      recall: [
        {
          id: "week-0-lecture-p2-r1",
          prompt: "In ASCII, A is 65. What number is C?",
          options: ["67", "66", "99", "3"],
          answer: 0,
          explanation:
            "Capital letters are numbered in order, so C is two after A: 67. 99 is lowercase c.",
        },
        {
          id: "week-0-lecture-p2-r2",
          prompt: "Why do standards like ASCII and Unicode exist?",
          options: [
            "So every device agrees which number stands for which character",
            "So text takes up less memory than numbers",
            "So computers can store more than two digits",
          ],
          answer: 0,
          explanation:
            "Bits alone mean nothing. A shared table lets your phone and your friend's phone turn the same bits into the same letters.",
        },
        {
          id: "week-0-lecture-p2-r3",
          prompt: "How many bytes does one RGB pixel use?",
          options: ["3", "1", "8", "24"],
          answer: 0,
          explanation:
            "One byte each for red, green and blue. That is 24 bits, but 3 bytes.",
        },
        {
          id: "week-0-lecture-p2-r4",
          prompt:
            "An algorithm cuts the problem in half at every step. The problem doubles in size. What happens to the number of steps?",
          options: [
            "It goes up by about one",
            "It doubles",
            "It stays exactly the same",
          ],
          answer: 0,
          explanation:
            "The first halving turns the bigger problem back into the old size, so you need one extra step. That is the log2 n curve.",
        },
        {
          id: "week-0-lecture-p2-r5",
          prompt: "What could Unicode do that ASCII could not?",
          options: [
            "Represent many more characters, including emoji",
            "Represent numbers in binary",
            "Store colors for images",
          ],
          answer: 0,
          explanation:
            "ASCII uses only 128 codes, enough for English letters, digits and punctuation. Unicode uses more bits, so it covers other alphabets and emoji too.",
        },
      ],
    },

    "week-0-lecture-p3": {
      hook: "Before you write code, you need instructions so precise that someone who does exactly what you say gets it right. That is pseudocode. Then you meet Scratch, where the same ideas become blocks you can click: functions, variables, conditionals and loops. Watch for the moment a program stops saying the same thing and starts responding to you.",
      after: {
        pseudocode: [
          {
            kind: "trace",
            id: "week-0-lecture-p3-phone-book",
            caption:
              "Follow the phone book algorithm as it looks for Mike. The middle page shows John, then Pat, then Mike.",
            code: code`
Pick up phone book
Open to middle of phone book
Look at page
If person is on page
    Call person
Else if person is earlier in book
    Open to middle of left half of book
    Go back to line 3
Else if person is later in book
    Open to middle of right half of book
    Go back to line 3
Else
    Quit
`,
            language: "pseudocode",
            steps: [
              { line: 1, vars: { "pages left": "1000", "page shows": "" } },
              { line: 2, vars: { "pages left": "1000", "page shows": "" } },
              { line: 3, vars: { "pages left": "1000", "page shows": "John" } },
              {
                line: 9,
                vars: { "pages left": "1000", "page shows": "John" },
                note: "Mike is not on this page and is not earlier. M comes after J, so this branch is true.",
              },
              {
                line: 10,
                vars: { "pages left": "500", "page shows": "John" },
                note: "The left half is torn away.",
              },
              { line: 11, vars: { "pages left": "500", "page shows": "John" } },
              { line: 3, vars: { "pages left": "500", "page shows": "Pat" } },
              {
                line: 6,
                vars: { "pages left": "500", "page shows": "Pat" },
                note: "M comes before P, so Mike is earlier in what is left.",
              },
              { line: 7, vars: { "pages left": "250", "page shows": "Pat" } },
              { line: 8, vars: { "pages left": "250", "page shows": "Pat" } },
              { line: 3, vars: { "pages left": "250", "page shows": "Mike" } },
              { line: 4, vars: { "pages left": "250", "page shows": "Mike" } },
              {
                line: 5,
                vars: { "pages left": "250", "page shows": "Mike" },
                output: "Calling Mike",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-0-lecture-p3-block-loop",
            prompt:
              "Which building block of programming is the line Go back to line 3?",
            options: ["A loop", "A conditional", "A function", "A boolean expression"],
            answer: 0,
            explanation:
              "Going back to an earlier line repeats steps, which is a loop. If and else if lines are the conditionals that decide whether to loop.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p3-block-boolean",
            prompt:
              "In Else if person is earlier in book, what do you call the part person is earlier in book?",
            options: ["A boolean expression", "A function", "A loop", "A variable"],
            answer: 0,
            explanation:
              "It is a question whose answer is only true or false, which is a boolean expression. The conditional uses that answer to pick a branch.",
          },
        ],
        "whats-ahead": [
          {
            kind: "predict",
            id: "week-0-lecture-p3-why-languages",
            prompt:
              "Computers only understand 0s and 1s. Why do programmers write in languages like C and Python instead?",
            options: [
              "Languages abstract away the binary, so people can build on others' work",
              "Computers run text faster than binary",
              "Binary can only describe numbers, not programs",
            ],
            answer: 0,
            explanation:
              "Writing everything in 0s and 1s is possible but very hard. Each language hides that layer so you can think about the problem instead.",
          },
        ],
        scratch: [
          {
            kind: "predict",
            id: "week-0-lecture-p3-coordinates",
            prompt:
              "The cat starts at (0, 0). You run go to x: (100) y: (-50). Where on the stage does it end up?",
            options: [
              "Right of the center and below it",
              "Left of the center and above it",
              "Right of the center and above it",
              "In the top-left corner",
            ],
            answer: 0,
            explanation:
              "(0, 0) is the center. Positive x moves right and negative y moves down, so the cat lands right and below.",
          },
        ],
        "hello-world": [
          {
            kind: "predict",
            id: "week-0-lecture-p3-say-parts",
            prompt:
              "In say [hello, world], what is the input, and what is the side effect?",
            options: [
              "Input: the text hello, world. Side effect: the cat shows it in a speech bubble",
              "Input: the green flag. Side effect: the text hello, world",
              "Input: the cat. Side effect: the say block runs",
            ],
            answer: 0,
            explanation:
              "The text in the slot is the input passed to the say function. What you can see happen, the speech bubble, is its side effect.",
          },
        ],
        "hello-you": [
          {
            kind: "trace",
            id: "week-0-lecture-p3-answer-overwrite",
            caption:
              "Watch the answer variable as the cat asks two questions. You type David, then Carter.",
            code: code`
when green flag clicked
ask [What's your name?] and wait
say (join [hello, ] (answer)) for (2) seconds
ask [And your friend's name?] and wait
say (join [hello, ] (answer))
`,
            language: "scratch",
            steps: [
              { line: 1, vars: { answer: "" } },
              {
                line: 2,
                vars: { answer: "David" },
                note: "Scratch stores what you typed in answer.",
              },
              {
                line: 3,
                vars: { answer: "David" },
                output: "hello, David",
                note: "join returns hello, David, and say shows it.",
              },
              {
                line: 4,
                vars: { answer: "Carter" },
                output: "hello, David",
                note: "The new reply replaces the old one. David is gone from answer.",
              },
              {
                line: 5,
                vars: { answer: "Carter" },
                output: "hello, David\nhello, Carter",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-0-lecture-p3-join-space",
            prompt:
              "You type David. The first slot of join holds hello, with no space after the comma. What does the cat say?",
            code: code`
say (join [hello,] (answer))
`,
            language: "scratch",
            options: ["hello,David", "hello, David", "hello, answer"],
            answer: 0,
            explanation:
              "join glues its two inputs together exactly as they are and adds nothing between them. To get a space, put it inside the first slot: hello, followed by a space.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-0-lecture-p3-recap-variable",
        prompt: "In this block, which part is a variable?",
        code: code`
say (join [hello, ] (answer))
`,
        language: "scratch",
        options: ["answer", "say", "join", "hello,"],
        answer: 0,
        explanation:
          "answer holds a value that changes each time someone replies, so it is a variable. say and join are functions, and hello, is fixed text.",
      },
      exercise: {
        prompt:
          "In Scratch, ask for the user's name and then their favorite food, and have the cat say one sentence using both. If you type Ada and then pizza, the cat must say exactly: hello, Ada! I like pizza too.",
        language: "scratch",
        starter: "",
        hints: [
          "Each ask block replaces answer, so the name is lost when you ask the second question.",
          "Make a variable (Variables, Make a Variable) called name and set it to answer right after the first ask.",
          "join only takes two inputs, so put a join inside another join to glue more pieces together.",
        ],
        solution: code`
when green flag clicked
ask [What's your name?] and wait
set [name v] to (answer)
ask [What's your favorite food?] and wait
say (join (join (join [hello, ] (name)) [! I like ]) (join (answer) [ too.]))

Saving the first reply in name keeps it safe when the second ask overwrites answer. The nested joins build hello, Ada, then hello, Ada! I like, then add pizza too.
`,
      },
      recall: [
        {
          id: "week-0-lecture-p3-r1",
          prompt: "Why write pseudocode before writing real code?",
          options: [
            "To think through the logic first and explain it to others",
            "Because computers can run pseudocode directly",
            "Because it makes the final program faster",
          ],
          answer: 0,
          explanation:
            "Pseudocode lets you get the steps right in plain words, and it later shows others how your code is meant to work. No computer runs it.",
        },
        {
          id: "week-0-lecture-p3-r2",
          prompt:
            "In the phone book pseudocode, what kind of line is Else if person is later in book?",
          options: ["A conditional", "A loop", "A function", "A variable"],
          answer: 0,
          explanation:
            "If and else if lines choose which steps to run based on a true or false question. That is a conditional.",
        },
        {
          id: "week-0-lecture-p3-r3",
          prompt: "Where is the point (0, 0) on the Scratch stage?",
          options: ["The center", "The top-left corner", "The bottom-left corner"],
          answer: 0,
          explanation:
            "Scratch puts the origin in the middle of the stage, so x can be negative (left) and y can be negative (down).",
        },
        {
          id: "week-0-lecture-p3-r4",
          prompt:
            "A program asks two questions in a row. After both, what does answer hold?",
          options: [
            "Only the reply to the second question",
            "Both replies joined together",
            "Only the reply to the first question",
          ],
          answer: 0,
          explanation:
            "answer is one variable. Each ask stores the new reply in it and the old one is replaced.",
        },
        {
          id: "week-0-lecture-p3-r5",
          prompt:
            "In say (join [hello, ] (answer)), which block returns a value that another block uses?",
          options: ["join", "say", "Neither one"],
          answer: 0,
          explanation:
            "join returns the combined text, and that return value becomes the input to say. say returns nothing; it has a side effect instead.",
        },
      ],
    },

    "week-0-lecture-p4": {
      hook: "Copying the same block three times works, until you need it thirty times, or need to change it everywhere. This part is about writing it once: loops repeat it, custom blocks give it a name, and conditionals let a program react to the mouse or the keyboard. These are the habits that turn a script into a game.",
      after: {
        "meow-loops-and-abstraction": [
          {
            kind: "trace",
            id: "week-0-lecture-p4-repeat-meow",
            caption:
              "Step through repeat (3) and count how many times each block inside it runs.",
            code: code`
when green flag clicked
repeat (3)
  play sound (Meow v) until done
  wait (1) seconds
`,
            language: "scratch",
            steps: [
              { line: 1, vars: { "meows so far": "0" } },
              {
                line: 2,
                vars: { "meows so far": "0" },
                note: "The loop will run its body 3 times.",
              },
              { line: 3, vars: { "meows so far": "1" }, output: "meow" },
              { line: 4, vars: { "meows so far": "1" }, output: "meow" },
              { line: 3, vars: { "meows so far": "2" }, output: "meow\nmeow" },
              { line: 4, vars: { "meows so far": "2" }, output: "meow\nmeow" },
              {
                line: 3,
                vars: { "meows so far": "3" },
                output: "meow\nmeow\nmeow",
              },
              {
                line: 4,
                vars: { "meows so far": "3" },
                output: "meow\nmeow\nmeow",
                note: "Three passes are done, so the loop ends. The wait also ran three times.",
              },
            ],
          },
          {
            kind: "compare",
            id: "week-0-lecture-p4-compare-repeat",
            prompt:
              "Both scripts meow three times with a pause between. Which is better designed?",
            language: "scratch",
            a: {
              label: "Copied blocks",
              code: code`
when green flag clicked
play sound (Meow v) until done
wait (1) seconds
play sound (Meow v) until done
wait (1) seconds
play sound (Meow v) until done
`,
            },
            b: {
              label: "Loop",
              code: code`
when green flag clicked
repeat (3)
  play sound (Meow v) until done
  wait (1) seconds
`,
            },
            answer: "b",
            explanation:
              "The loop says each step once, so changing the sound or the count is one edit. Copied blocks repeat themselves and are easy to get out of sync.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p4-meow-n-times",
            prompt:
              "Using the notes' define meow n times block, this script runs. How many times does the cat meow?",
            code: code`
define meow (n) times
repeat (n)
  play sound (Meow v) until done
  wait (1) seconds

when green flag clicked
meow (2) times
meow (3) times
`,
            language: "scratch",
            options: ["5", "3", "2", "6"],
            answer: 0,
            explanation:
              "Each call passes its own n: the first call meows 2 times and the second 3 times, so 5 in total.",
          },
          {
            kind: "compare",
            id: "week-0-lecture-p4-compare-input",
            prompt:
              "You need 3 meows when the game starts and 5 when the player wins. Which custom block suits that better?",
            language: "scratch",
            a: {
              label: "No input",
              code: code`
define meow
play sound (Meow v) until done
wait (1) seconds
`,
            },
            b: {
              label: "With an input",
              code: code`
define meow (n) times
repeat (n)
  play sound (Meow v) until done
  wait (1) seconds
`,
            },
            answer: "b",
            explanation:
              "With n as an input, the caller decides how many meows, so one block serves both places. The block without an input needs its own repeat around it every time.",
          },
        ],
        conditionals: [
          {
            kind: "predict",
            id: "week-0-lecture-p4-no-forever",
            prompt:
              "You remove the forever block, so the if sits directly under the green flag. The mouse is not on the cat when you click the flag, and you hover over the cat later. What happens?",
            code: code`
when green flag clicked
if <touching (mouse-pointer v)?> then
  play sound (Meow v) until done
`,
            language: "scratch",
            options: [
              "Nothing: the question was asked once, at the start, and the answer was no",
              "The cat meows whenever you touch it",
              "The cat meows nonstop",
            ],
            answer: 0,
            explanation:
              "Without forever, the condition is checked one time and the script ends. forever is what keeps asking the question over and over.",
          },
        ],
        oscartime: [
          {
            kind: "trace",
            id: "week-0-lecture-p4-oscar-costume",
            caption:
              "Watch Oscar's costume as the mouse moves onto him and then away again.",
            code: code`
when green flag clicked
switch costume to (oscar1 v)
forever
  if <touching (mouse-pointer v)?> then
    switch costume to (oscar2 v)
  else
    switch costume to (oscar1 v)
`,
            language: "scratch",
            steps: [
              { line: 2, vars: { costume: "oscar1", "mouse on Oscar": "no" } },
              {
                line: 4,
                vars: { costume: "oscar1", "mouse on Oscar": "no" },
                note: "The condition is false, so the else branch runs.",
              },
              { line: 7, vars: { costume: "oscar1", "mouse on Oscar": "no" } },
              {
                line: 4,
                vars: { costume: "oscar1", "mouse on Oscar": "yes" },
                note: "You moved the mouse onto Oscar. Now the condition is true.",
              },
              { line: 5, vars: { costume: "oscar2", "mouse on Oscar": "yes" } },
              {
                line: 4,
                vars: { costume: "oscar2", "mouse on Oscar": "no" },
                note: "The mouse moved away.",
              },
              {
                line: 7,
                vars: { costume: "oscar1", "mouse on Oscar": "no" },
                note: "Without the else, Oscar would keep the oscar2 costume forever.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-0-lecture-p4-trash-start",
            prompt: "Where does this piece of trash appear, and which way does it go?",
            code: code`
when green flag clicked
go to x: (pick random (0) to (240)) y: (180)
forever
  change y by (-1)
end
`,
            language: "scratch",
            options: [
              "At the top, at a random spot on the right half, then it falls",
              "At the center, then it rises",
              "At a random height on the left edge, then it moves right",
            ],
            answer: 0,
            explanation:
              "y of 180 is the top of the stage and x from 0 to 240 is the right half. Changing y by -1 again and again moves it down.",
          },
          {
            kind: "compare",
            id: "week-0-lecture-p4-compare-go-to-top",
            prompt:
              "The trash is sent to the top in two scripts: at the start and whenever it touches Oscar. Which version is better designed?",
            language: "scratch",
            a: {
              label: "Same blocks in both scripts",
              code: code`
when green flag clicked
go to x: (pick random (0) to (240)) y: (180)

if <touching [Oscar v] ?> then
  go to x: (pick random (0) to (240)) y: (180)
end
`,
            },
            b: {
              label: "A custom block",
              code: code`
define go to top
  go to x: (pick random (0) to (240)) y: (180)

when green flag clicked
go to top

if <touching [Oscar v] ?> then
  go to top
end
`,
            },
            answer: "b",
            explanation:
              "go to top names the idea and keeps the numbers in one place. To change where trash appears, you edit one block instead of hunting for every copy.",
          },
        ],
        "ivys-hardest-game": [
          {
            kind: "predict",
            id: "week-0-lecture-p4-two-keys",
            prompt:
              "The sprite is at (0, 0). You hold the up arrow and the right arrow together for one pass of listen for keyboard. Where is it now?",
            code: code`
define listen for keyboard
if <key (up arrow v) pressed?> then
change y by (1)
end
if <key (down arrow v) pressed?> then
change y by (-1)
end
if <key (right arrow v) pressed?> then
change x by (1)
end
if <key (left arrow v) pressed?> then
change x by (-1)
end
`,
            language: "scratch",
            options: ["(1, 1)", "(0, 1)", "(1, 0)", "(0, 0)"],
            answer: 0,
            explanation:
              "These are four separate if blocks, not one if-else chain, so every one is checked. Up and right are both true, so y and x each go up by 1.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p4-wall",
            prompt:
              "The sprite is touching the right wall and you hold the right arrow. In one pass of the forever loop, what happens to x?",
            code: code`
forever
listen for keyboard
feel for walls

define feel for walls
if <touching (left wall v) ?> then
change x by (1)
end
if <touching (right wall v) ?> then
change x by (-1)
end
`,
            language: "scratch",
            options: [
              "It goes up by 1, then back down by 1, so the sprite stays put",
              "It goes up by 1 and the sprite walks through the wall",
              "It goes down by 2",
            ],
            answer: 0,
            explanation:
              "listen for keyboard moves it right by 1, then feel for walls sees the right wall and moves it left by 1. The two cancel, which is how the wall stops you.",
          },
          {
            kind: "predict",
            id: "week-0-lecture-p4-follow",
            prompt:
              "You move point towards (Harvard v) out of the forever loop so it runs once, before forever. What does the MIT sprite do now?",
            code: code`
when green flag clicked
go to (random position v)
point towards (Harvard v)
forever
move (1) steps
`,
            language: "scratch",
            options: [
              "It heads in a straight line toward where Harvard was at the start",
              "It still follows Harvard wherever Harvard goes",
              "It does not move at all",
            ],
            answer: 0,
            explanation:
              "The direction is now set once. Inside forever, it was updated every step, which is what made the sprite chase Harvard.",
          },
        ],
      },
      recap: {
        kind: "compare",
        id: "week-0-lecture-p4-recap-abstraction",
        prompt:
          "Both main scripts do the same thing in Ivy's Hardest Game. Which is easier to read and change?",
        language: "scratch",
        a: {
          label: "Named custom blocks",
          code: code`
when green flag clicked
go to x: (0) y: (0)
forever
listen for keyboard
feel for walls
`,
        },
        b: {
          label: "Everything inline",
          code: code`
when green flag clicked
go to x: (0) y: (0)
forever
if <key (up arrow v) pressed?> then
change y by (1)
end
if <key (down arrow v) pressed?> then
change y by (-1)
end
if <touching (left wall v) ?> then
change x by (1)
end
`,
        },
        answer: "a",
        explanation:
          "The named blocks say what happens, listen and then check walls, and hide how. That is abstraction: you read the main script in two lines and open a block only when you need its details.",
      },
      exercise: {
        prompt:
          "In Scratch, make a sprite pace back and forth across the stage and meow each time it turns around. Put the turning logic in a custom block called bounce. It works if the sprite crosses the stage, turns at each side wall, and meows once per turn.",
        language: "scratch",
        starter: "",
        hints: [
          "Start like the Yale sprite: go to (0, 0), point in direction (90), then a forever loop that moves 1 step.",
          "Make a block with My Blocks, Make a Block, name it bounce, and call it inside the forever loop.",
          "Inside bounce, use one if with an or of touching the left wall and touching the right wall. Turn 180 degrees and play the meow there.",
        ],
        solution: code`
define bounce
if <<touching (left wall v)?> or <touching (right wall v)?>> then
  turn right (180) degrees
  start sound (Meow v)
end

when green flag clicked
go to x: (0) y: (0)
point in direction (90)
forever
  bounce
  move (1) steps
end

The main script now reads as move and bounce. start sound lets the sprite keep moving while it meows; play sound until done would freeze it for the length of the meow.
`,
      },
      recall: [
        {
          id: "week-0-lecture-p4-r1",
          prompt: "What is abstraction in programming?",
          options: [
            "Breaking a problem into smaller named pieces so you can ignore their details",
            "Making a program run faster",
            "Removing all the loops from a program",
          ],
          answer: 0,
          explanation:
            "A custom block like meow or go to top is abstraction: you use it by name and only look inside when you need to.",
        },
        {
          id: "week-0-lecture-p4-r2",
          prompt:
            "Why is the if touching mouse-pointer block placed inside forever?",
          options: [
            "So the condition is checked again and again, not just once",
            "So the cat meows forever",
            "Because if blocks only work inside loops",
          ],
          answer: 0,
          explanation:
            "An if on its own asks its question once. Inside forever, it keeps checking, so the cat reacts whenever the mouse arrives.",
        },
        {
          id: "week-0-lecture-p4-r3",
          prompt:
            "A custom block is defined as meow (n) times. What does n let the caller do?",
          options: [
            "Choose how many times to meow each time the block is used",
            "Change the meow sound",
            "Make the block run forever",
          ],
          answer: 0,
          explanation:
            "n is an input to the block. Each call passes its own number, and the repeat (n) inside uses it.",
        },
        {
          id: "week-0-lecture-p4-r4",
          prompt:
            "Two separate if blocks check the up arrow and the right arrow. Both keys are held. How many of the two ifs run their inside?",
          options: ["Both", "Only the first", "Only the second", "Neither"],
          answer: 0,
          explanation:
            "Separate if blocks are each checked on their own. Only an if-else chain stops after the first true branch.",
        },
      ],
    },
  },
  shorts: {},
  glossary: [
    { term: "bit", meaning: "A binary digit, a single 0 or 1, like a switch that is off or on." },
    { term: "byte", meaning: "A group of 8 bits, which can hold 256 different values, 0 to 255." },
    { term: "binary", meaning: "Counting with only two digits, 0 and 1, where each place is worth double the place to its right." },
    { term: "ASCII", meaning: "A standard that maps the numbers 0 to 127 to characters, so that, for example, 65 means A." },
    { term: "Unicode", meaning: "A larger standard than ASCII that uses more bits to cover the world's alphabets and emoji." },
    { term: "RGB", meaning: "A way to describe a color as three amounts, red, green and blue, usually one byte each." },
    { term: "pixel", meaning: "One dot of color in an image, stored as its RGB values." },
    { term: "algorithm", meaning: "A step-by-step set of instructions for solving a problem." },
    { term: "pseudocode", meaning: "An algorithm written in plain, precise human language instead of a programming language." },
    { term: "function", meaning: "A named action, like say or join, that does one job; in Scratch it is a block." },
    { term: "argument", meaning: "An input you give a function, such as the text in a say block's slot." },
    { term: "return value", meaning: "A value a function hands back for another block to use, as join hands back joined text." },
    { term: "side effect", meaning: "Something a function makes happen that you can see or hear, such as a speech bubble or a sound." },
    { term: "variable", meaning: "A named place that holds a value that can change, like answer in Scratch." },
    { term: "conditional", meaning: "A block or line that runs some steps only if a question is true, like if or else." },
    { term: "boolean expression", meaning: "A question whose answer is only true or false, such as touching mouse-pointer?" },
    { term: "loop", meaning: "A block or line that repeats steps, like repeat or forever." },
    { term: "abstraction", meaning: "Hiding details behind a simple name, such as a custom block, so you can think about the bigger problem." },
  ],
};

export default content;
