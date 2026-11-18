import type { WeekContent } from "./types";

const content: WeekContent = {
  unitId: "week-6",
  parts: {
    "week-6-lecture-p1": {
      hook: "In C, saying hello took an include, a main function, a format string and a compile step. In Python it takes one line. That is not just less typing: it changes what you spend your attention on. As you read, keep asking two questions about each Python line: what C would this replace, and what is Python now doing for you that you used to do yourself?",
      after: {
        "hello-python": [
          {
            kind: "predict",
            id: "week-6-lecture-p1-run-hello",
            prompt: "You saved this one line as hello.py. What do you type in the terminal to run it?",
            code: `print("hello, world")`,
            language: "python",
            options: ["make hello, then ./hello", "python hello.py", "clang hello.py"],
            answer: 1,
            explanation: "Python is interpreted: the python program reads your file and runs it line by line, so there is no separate compile step. make and clang are C tools and cannot read Python.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p1-print-newline",
            prompt: "What does this program print?",
            code: `print("hello")
print("world")`,
            language: "python",
            options: [
              "helloworld on one line",
              "hello and world on two separate lines",
              "hello world on one line, with a space",
            ],
            answer: 1,
            explanation: "print ends every call with a newline by default, so you no longer write \\n yourself as you did with printf. Each print starts on a fresh line.",
          },
        ],
        speller: [
          {
            kind: "trace",
            id: "week-6-lecture-p1-set-trace",
            caption: "Watch a set ignore a duplicate, the way words does in dictionary.py.",
            code: `words = set()
words.update(["cat", "dog", "cat"])
print(len(words))
print("Cat".lower() in words)
print("cow" in words)`,
            language: "python",
            steps: [
              { line: 1, vars: { words: "set()" }, note: "An empty set, like the global words in dictionary.py." },
              { line: 2, vars: { words: "{'cat', 'dog'}" }, note: "update adds each item. The second 'cat' is ignored because a set holds unique values." },
              { line: 3, vars: { words: "{'cat', 'dog'}" }, output: "2\n" },
              { line: 4, vars: { words: "{'cat', 'dog'}" }, output: "2\nTrue\n", note: "'Cat'.lower() is 'cat', which is in the set." },
              { line: 5, vars: { words: "{'cat', 'dog'}" }, output: "2\nTrue\nFalse\n" },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p1-check-case",
            prompt: "Using check from dictionary.py with a two-word dictionary, what are the two lines printed?",
            code: `words = {"cat", "dog"}

def check(word):
    return word.lower() in words

print(check("DOG"))
print(check("Dogs"))`,
            language: "python",
            options: ["True, then False", "False, then False", "True, then True"],
            answer: 0,
            explanation: "check lowercases first, so \"DOG\" becomes \"dog\", which is in the set. \"dogs\" is a different string: in looks for an exact match, not a prefix.",
          },
        ],
        filter: [
          {
            kind: "blank",
            id: "week-6-lecture-p1-filter-blank",
            prompt: "Fill the gap so this line of edges.py applies the edge-finding filter to the image.",
            code: `after = before.____(ImageFilter.FIND_EDGES)`,
            language: "python",
            options: ["filter", "open", "save"],
            answer: 0,
            explanation: "filter is a method of the image object that returns a new, filtered image. blur.py and edges.py differ only in what you pass to filter.",
          },
        ],
        functions: [
          {
            kind: "predict",
            id: "week-6-lecture-p1-printf-habit",
            prompt: "Out of habit from printf, you add \\n inside print. What appears?",
            code: `print("hello, world\\n")
print("next")`,
            language: "python",
            options: [
              "hello, world, then next on the following line",
              "hello, world, then a blank line, then next",
              "hello, world\\n printed literally, then next",
            ],
            answer: 1,
            explanation: "Your \\n ends the first line, and then print adds its own newline, which leaves an empty line. In Python you usually leave the \\n out.",
          },
        ],
        "libraries-modules-and-packages": [
          {
            kind: "predict",
            id: "week-6-lecture-p1-import-call",
            prompt: "Your file starts with import cs50 (not from cs50 import ...). Which call gets an integer?",
            code: `import cs50

x = ???`,
            language: "python",
            options: ['get_int("x: ")', 'cs50.get_int("x: ")', 'cs50->get_int("x: ")'],
            answer: 1,
            explanation: "import cs50 brings in only the name cs50, so you reach its functions with a dot. A bare get_int would raise a NameError unless you wrote from cs50 import get_int.",
          },
        ],
        strings: [
          {
            kind: "predict",
            id: "week-6-lecture-p1-comma-vs-plus",
            prompt: "answer is \"David\". What does this line print?",
            code: `answer = "David"
print("hello," + answer)`,
            language: "python",
            options: ["hello, David", "hello,David", "hello,+David"],
            answer: 1,
            explanation: "+ glues two strings together exactly as they are, so no space is added. It is print(\"hello,\", answer), with a comma, that puts a space between its arguments.",
          },
          {
            kind: "blank",
            id: "week-6-lecture-p1-fstring-blank",
            prompt: "Fill the gap so the value of answer appears inside the greeting.",
            code: `answer = input("What's your name? ")
print(____"hello, {answer}")`,
            language: "python",
            options: ["f", "%", "s"],
            answer: 0,
            explanation: "The f before the quote makes it a format string, so {answer} is replaced by the variable's value. Without the f, Python prints hello, {answer} literally.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-6-lecture-p1-recap-fstring",
        prompt: "Back to hello: one line has the f, one does not. What are the two lines printed?",
        code: `answer = "Kelly"
print("hello, {answer}")
print(f"hello, {answer}")`,
        language: "python",
        options: [
          "hello, Kelly and hello, Kelly",
          "hello, {answer} and hello, Kelly",
          "hello, {answer} and hello, {answer}",
        ],
        answer: 1,
        explanation: "Only an f-string fills in {answer}. A plain string is printed exactly as written, braces included.",
      },
      exercise: {
        prompt: "Write spell.py. Keep the words cat, dog and fish in a set called words, finish check(word) so it returns whether the lowercased word is in words, then print check of whatever the user types. Typing DOG should print True and typing cow should print False.",
        language: "python",
        starter: `# Checks one word against a tiny dictionary

words = {"cat", "dog", "fish"}


def check(word):
    # TODO: return True if word is in words, ignoring case
    ...


word = input("Word: ")
print(check(word))`,
        hints: [
          "in works on a set just as it does on a list, and gives back True or False.",
          "Look at how check in dictionary.py deals with capital letters.",
          "The whole body of check can be one return line.",
        ],
        solution: `# Checks one word against a tiny dictionary

words = {"cat", "dog", "fish"}


def check(word):
    return word.lower() in words


word = input("Word: ")
print(check(word))

# word.lower() in words is already True or False, so you can return it
# directly. Lowercasing first makes DOG, Dog and dog all match "dog".`,
      },
      recall: [
        {
          id: "week-6-lecture-p1-r1",
          prompt: "Why can you run python hello.py without compiling hello.py first?",
          options: [
            "Python is interpreted: the python program reads and runs your source code directly",
            "make compiles .py files automatically in the background",
            "Python programs are saved as machine code",
          ],
          answer: 0,
          explanation: "The interpreter executes your source as it reads it. C needs clang to translate source into machine code before anything can run.",
        },
        {
          id: "week-6-lecture-p1-r2",
          prompt: "What does this print?",
          code: `print("hello,", "world")`,
          options: ["hello,world", "hello, world", "hello,, world"],
          answer: 1,
          explanation: "When you give print several arguments separated by commas, it puts one space between them.",
        },
        {
          id: "week-6-lecture-p1-r3",
          prompt: "In dictionary.py, why does unload just return True?",
          options: [
            "Python manages memory for you, so there is nothing to free by hand",
            "The set is already empty when unload runs",
            "Python has no way to remove items from a set",
          ],
          answer: 0,
          explanation: "In C you had to free every node you allocated. Python frees memory itself once values are no longer used.",
        },
        {
          id: "week-6-lecture-p1-r4",
          prompt: "Which statement about C and Python matches this part?",
          options: [
            "Python code is usually shorter to write, but it can run slower than C",
            "Python always runs faster than C because it is newer",
            "Python and C run equally fast because they share syntax",
          ],
          answer: 0,
          explanation: "Python's built-in functions do a lot of work under the hood for you, which saves your time but can cost some speed compared with tight C code.",
        },
      ],
    },
    "week-6-lecture-p2": {
      hook: "Type 1 and 2 into a Python calculator and it can answer 12. Nothing crashed, nothing warned you, and the answer is wrong. This part shows why: Python decides types for you, and input always hands you text. Once you can see the type of every value in your head, bugs like this become easy to spot before you run anything.",
      after: {
        "positional-parameters-and-named-parameters": [
          {
            kind: "predict",
            id: "week-6-lecture-p2-sep",
            prompt: "sep is a named parameter of print. What does this print?",
            code: `print("a", "b", "c", sep="-")`,
            language: "python",
            options: ["a b c", "a-b-c", "-a-b-c-"],
            answer: 1,
            explanation: "sep replaces the single space that print normally puts between arguments. It goes only between them, never before the first or after the last.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p2-end",
            prompt: "end is another named parameter, with a default of \"\\n\". What appears?",
            code: `print("x", end="")
print("y")`,
            language: "python",
            options: ["x and y on separate lines", "xy on one line", "x y on one line"],
            answer: 1,
            explanation: "end=\"\" replaces the usual newline with nothing, so the next print continues on the same line. Because end is named, you can pass it without counting positions.",
          },
        ],
        variables: [
          {
            kind: "predict",
            id: "week-6-lecture-p2-plusplus",
            prompt: "You bring a C habit to Python. What happens?",
            code: `counter = 0
counter++
print(counter)`,
            language: "python",
            options: ["It prints 1", "It prints 0", "SyntaxError: Python has no ++ operator"],
            answer: 2,
            explanation: "Python does not have ++, so the program fails before it runs anything. Write counter += 1 instead.",
          },
          {
            kind: "blank",
            id: "week-6-lecture-p2-increment-blank",
            prompt: "Fill the gap to add one to counter.",
            code: `counter = 5
counter ____ 1`,
            language: "python",
            options: ["+=", "++", "=+"],
            answer: 0,
            explanation: "+= adds to the existing value, so counter becomes 6. The swapped =+ is legal but means counter = +1, which quietly sets counter to 1.",
          },
        ],
        types: [
          {
            kind: "predict",
            id: "week-6-lecture-p2-type-str",
            prompt: "type tells you the type Python picked for a value. What does this print?",
            code: `print(type("50"))`,
            language: "python",
            options: ["<class 'int'>", "<class 'str'>", "<class 'float'>"],
            answer: 1,
            explanation: "The quotes make \"50\" a str, even though its characters are digits. The value 50 without quotes would be an int.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p2-which-type",
            prompt: "You want to hold every word of a dictionary exactly once and quickly ask whether a word is there. Which type from the notes fits best?",
            options: ["list", "tuple", "set", "range"],
            answer: 2,
            explanation: "A set is a collection of unique values, so duplicates disappear and in checks are fast. That is why dictionary.py uses words = set().",
          },
        ],
        calculator: [
          {
            kind: "trace",
            id: "week-6-lecture-p2-concat-trace",
            caption: "Watch the same + glue strings, then add numbers after int converts them.",
            code: `x = "1"
y = "2"
print(x + y)
x = int(x)
y = int(y)
print(x + y)`,
            language: "python",
            steps: [
              { line: 1, vars: { x: "'1'" }, note: "This is what input gives you: text, even if it looks like a number." },
              { line: 2, vars: { x: "'1'", y: "'2'" } },
              { line: 3, vars: { x: "'1'", y: "'2'" }, output: "12\n", note: "+ on two strings concatenates them." },
              { line: 4, vars: { x: "1", y: "'2'" }, output: "12\n", note: "int turns the text '1' into the number 1." },
              { line: 5, vars: { x: "1", y: "2" }, output: "12\n" },
              { line: 6, vars: { x: "1", y: "2" }, output: "12\n3\n", note: "+ on two ints adds them." },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p2-input-12",
            prompt: "You run this calculator and type 1, then 2. What is printed after the prompts?",
            code: `x = input("x: ")
y = input("y: ")
print(x + y)`,
            language: "python",
            options: ["3", "12", "An error"],
            answer: 1,
            explanation: "input always returns a str, so x is \"1\" and y is \"2\", and + joins them into \"12\". There is no error because joining two strings is perfectly legal.",
          },
          {
            kind: "compare",
            id: "week-6-lecture-p2-int-input",
            prompt: "Both run without errors on 1 and 2. Which calculator is correct?",
            language: "python",
            a: {
              label: "input only",
              code: `x = input("x: ")
y = input("y: ")
print(x + y)`,
            },
            b: {
              label: "input wrapped in int",
              code: `x = int(input("x: "))
y = int(input("y: "))
print(x + y)`,
            },
            answer: "b",
            explanation: "B converts each answer to an int before adding, so 1 and 2 give 3. A adds text and prints 12, which shows that running without a crash is not the same as being correct.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-6-lecture-p2-recap-mixed",
        prompt: "Only x was converted this time. You type 1, then 2. What happens?",
        code: `x = int(input("x: "))
y = input("y: ")
print(x + y)`,
        language: "python",
        options: [
          "It prints 3",
          "It prints 12",
          "TypeError: Python will not add an int and a str",
        ],
        answer: 2,
        explanation: "x is the int 1 but y is still the str \"2\". Python refuses to guess whether you meant adding or joining, so it raises a TypeError instead of quietly picking one.",
      },
      exercise: {
        prompt: "Write minutes.py. Ask for a number of hours and then a number of minutes with input, convert both to integers, and print the total as Total: N minutes using an f-string. Entering 2 and then 30 should print Total: 150 minutes.",
        language: "python",
        starter: `# Converts hours and minutes to minutes

hours = input("Hours: ")
minutes = input("Minutes: ")

# TODO: print the total number of minutes`,
        hints: [
          "Check the type of hours: input always gives you a str.",
          "Wrap each input(...) call in int(...) before doing arithmetic.",
          "An hour is 60 minutes, and an f-string can hold an expression inside its braces.",
        ],
        solution: `# Converts hours and minutes to minutes

hours = int(input("Hours: "))
minutes = int(input("Minutes: "))

print(f"Total: {hours * 60 + minutes} minutes")

# input returns text, so int converts each answer before the arithmetic.
# Without int, hours * 60 would repeat the string "2" sixty times.`,
      },
      recall: [
        {
          id: "week-6-lecture-p2-r1",
          prompt: "What type does input return, whatever the user types?",
          options: ["int if they type digits, str otherwise", "Always str", "Always int"],
          answer: 1,
          explanation: "input always returns text. You convert it yourself with int or float when you need a number.",
        },
        {
          id: "week-6-lecture-p2-r2",
          prompt: "What does this print?",
          code: `print("a", "b", sep="")`,
          options: ["a b", "ab", "a\"\"b"],
          answer: 1,
          explanation: "sep sets what goes between arguments. An empty separator puts them right next to each other.",
        },
        {
          id: "week-6-lecture-p2-r3",
          prompt: "Which line is the Python version of int counter = 0;?",
          options: ["int counter = 0", "counter = 0", "var counter = 0;"],
          answer: 1,
          explanation: "Python works out the type from the value, so you write only the name and the value. No type, no semicolon.",
        },
        {
          id: "week-6-lecture-p2-r4",
          prompt: "Why are named parameters such as end= and sep= easier to use than positional ones?",
          options: [
            "You say which parameter you mean by name, so you need not remember its position",
            "They make print run faster",
            "They are required for every Python function",
          ],
          answer: 0,
          explanation: "With positional arguments, as in printf or fread, the order carries the meaning. A name says what each value is for, and you can skip the ones you do not need.",
        },
      ],
    },
    "week-6-lecture-p3": {
      hook: "The ideas in this part are ones you already own: if, else, loops, functions. Only the spelling changes, and some of the new spelling is easy to get almost right. or behaves differently from what English suggests, indentation now matters to the program, and a function must exist before you call it. Predicting each snippet before you read the answer is how you find which of your C habits need adjusting.",
      after: {
        conditionals: [
          {
            kind: "predict",
            id: "week-6-lecture-p3-or-pitfall",
            prompt: "The user typed n. This looks like the agree program from the notes, but one comparison is missing. What is printed?",
            code: `s = "n"
if s == "Y" or "y":
    print("Agreed.")
else:
    print("Not agreed.")`,
            language: "python",
            options: ["Agreed.", "Not agreed.", "SyntaxError"],
            answer: 0,
            explanation: "or joins two separate conditions: s == \"Y\", which is False, and the bare string \"y\". A non-empty string counts as true, so the if always runs. Write s == \"Y\" or s == \"y\".",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p3-in-case",
            prompt: "The user typed Yes. What is printed?",
            code: `s = "Yes"
if s in ["y", "yes"]:
    print("Agreed.")
else:
    print("Not agreed.")`,
            language: "python",
            options: ["Agreed.", "Not agreed."],
            answer: 1,
            explanation: "in compares exactly, and \"Yes\" with a capital Y is not equal to \"yes\". The next section fixes this by lowercasing the input first.",
          },
          {
            kind: "compare",
            id: "week-6-lecture-p3-or-vs-in",
            prompt: "Both accept y and yes. Which is the better design?",
            language: "python",
            a: {
              label: "chained or",
              code: `if s == "y" or s == "yes":
    print("Agreed.")`,
            },
            b: {
              label: "in a list",
              code: `if s in ["y", "yes"]:
    print("Agreed.")`,
            },
            answer: "b",
            explanation: "B states the accepted answers once, as data. Adding \"yeah\" means adding one item to the list rather than another comparison, and there is no chance of a half-written or.",
          },
        ],
        "object-oriented-programming": [
          {
            kind: "predict",
            id: "week-6-lecture-p3-capitalize",
            prompt: "The user typed david malan. What do the two print lines show?",
            code: `s = "david malan"
t = s.capitalize()
print(f"s: {s}")
print(f"t: {t}")`,
            language: "python",
            options: [
              "s: david malan, t: David malan",
              "s: David malan, t: David malan",
              "s: david malan, t: David Malan",
            ],
            answer: 0,
            explanation: "capitalize returns a new string with only the very first character uppercased, so t is \"David malan\". s itself never changes, which is why this needs no malloc or strcpy as in C.",
          },
          {
            kind: "blank",
            id: "week-6-lecture-p3-lower-blank",
            prompt: "Fill the gap so Y, YES and yes are all accepted.",
            code: `s = input("Do you agree? ").____()
if s in ["y", "yes"]:
    print("Agreed.")`,
            language: "python",
            options: ["lower", "upper", "capitalize"],
            answer: 0,
            explanation: "The list holds lowercase answers, so you lowercase the input to match. upper would turn yes into YES, which is not in the list.",
          },
        ],
        loops: [
          {
            kind: "trace",
            id: "week-6-lecture-p3-while-trace",
            caption: "Step through the while version of meow and watch i decide when to stop.",
            code: `i = 0
while i < 3:
    print("meow")
    i += 1`,
            language: "python",
            steps: [
              { line: 1, vars: { i: "0" } },
              { line: 2, vars: { i: "0" }, note: "0 < 3 is True, so the body runs." },
              { line: 3, vars: { i: "0" }, output: "meow\n" },
              { line: 4, vars: { i: "1" }, output: "meow\n" },
              { line: 2, vars: { i: "1" }, output: "meow\n", note: "1 < 3 is True." },
              { line: 3, vars: { i: "1" }, output: "meow\nmeow\n" },
              { line: 4, vars: { i: "2" }, output: "meow\nmeow\n" },
              { line: 2, vars: { i: "2" }, output: "meow\nmeow\n", note: "2 < 3 is True." },
              { line: 3, vars: { i: "2" }, output: "meow\nmeow\nmeow\n" },
              { line: 4, vars: { i: "3" }, output: "meow\nmeow\nmeow\n" },
              { line: 2, vars: { i: "3" }, output: "meow\nmeow\nmeow\n", note: "3 < 3 is False, so the loop ends after three meows." },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p3-uppercase",
            prompt: "In uppercase.py the user types hi!. What does the program print after the prompt?",
            code: `before = input("Before: ")
print("After:  ", end="")
for c in before:
    print(c.upper(), end="")
print()`,
            language: "python",
            options: ["After:  HI!", "After:  then H, I and ! on separate lines", "After:  hi!"],
            answer: 0,
            explanation: "for c in before visits one character at a time, and end=\"\" keeps every print on the same line. The final print() ends the line. Without end=\"\", each letter would get its own line.",
          },
        ],
        abstraction: [
          {
            kind: "trace",
            id: "week-6-lecture-p3-meow-n-trace",
            caption: "Follow main calling meow with an argument, and see when each def actually runs.",
            code: `def main():
    meow(2)


def meow(n):
    for i in range(n):
        print("meow")


main()`,
            language: "python",
            steps: [
              { line: 1, vars: {}, note: "def only defines main. Nothing inside it runs yet." },
              { line: 5, vars: {}, note: "meow is defined too." },
              { line: 10, vars: {}, note: "Now main is actually called." },
              { line: 2, vars: {}, note: "main calls meow and passes 2." },
              { line: 6, vars: { n: "2", i: "0" } },
              { line: 7, vars: { n: "2", i: "0" }, output: "meow\n" },
              { line: 6, vars: { n: "2", i: "1" }, output: "meow\n" },
              { line: 7, vars: { n: "2", i: "1" }, output: "meow\nmeow\n", note: "range(2) is used up, so meow returns to main, and main ends." },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p3-call-before-def",
            prompt: "You moved the call to main() to the top of meow.py. What happens?",
            code: `main()


def main():
    for i in range(3):
        meow()


def meow():
    print("meow")`,
            language: "python",
            options: [
              "meow is printed three times",
              "NameError: name 'main' is not defined",
              "Nothing is printed and there is no error",
            ],
            answer: 1,
            explanation: "Python runs the file top to bottom, and on line 1 main has not been defined yet. That is why the convention puts main() at the very bottom, after every def.",
          },
        ],
      },
      recap: {
        kind: "compare",
        id: "week-6-lecture-p3-recap-loop",
        prompt: "Both print meow three times. Which is the better design?",
        language: "python",
        a: {
          label: "copy and paste",
          code: `print("meow")
print("meow")
print("meow")`,
        },
        b: {
          label: "loop",
          code: `for i in range(3):
    print("meow")`,
        },
        answer: "b",
        explanation: "B says once what to repeat and how many times, so changing 3 to 30 is a one-character edit. A grows a line per meow and invites copy mistakes, exactly as it did in C.",
      },
      exercise: {
        prompt: "Write yell.py with a main function and a function yell(phrase, n) that prints phrase in uppercase n times, one per line. main should ask for a phrase with input and call yell(phrase, 3). Typing hi should print HI on three lines.",
        language: "python",
        starter: `def main():
    phrase = input("Phrase: ")
    # TODO: call yell


# TODO: define yell(phrase, n)


main()`,
        hints: [
          "Model yell on meow(n) from the notes: a for loop over range(n).",
          "Strings have a method that returns an uppercase copy.",
          "Keep main() as the last line so both functions exist before it runs.",
        ],
        solution: `def main():
    phrase = input("Phrase: ")
    yell(phrase, 3)


def yell(phrase, n):
    for i in range(n):
        print(phrase.upper())


main()

# yell takes the text and the count as parameters, just as meow took n.
# Calling main() last means yell is already defined when main uses it.`,
      },
      recall: [
        {
          id: "week-6-lecture-p3-r1",
          prompt: "What is Python's spelling of C's else if?",
          options: ["else if", "elif", "elseif"],
          answer: 1,
          explanation: "Python uses the single keyword elif, followed by a condition and a colon.",
        },
        {
          id: "week-6-lecture-p3-r2",
          prompt: "Why does if s == \"y\" or \"Y\": run its body even when s is \"n\"?",
          options: [
            "\"Y\" on its own is a non-empty string, which counts as true",
            "or compares s to both strings automatically",
            "Python ignores case in comparisons",
          ],
          answer: 0,
          explanation: "Each side of or is its own condition. Write the comparison twice: s == \"y\" or s == \"Y\".",
        },
        {
          id: "week-6-lecture-p3-r3",
          prompt: "What is a method?",
          options: [
            "A function that belongs to a value, such as s.lower() on a str",
            "Any function you define with def",
            "A variable inside a struct",
          ],
          answer: 0,
          explanation: "Objects bundle data with functions. You call those functions, called methods, with a dot after the value.",
        },
        {
          id: "week-6-lecture-p3-r4",
          prompt: "In Python, what tells the interpreter which lines are inside an if or a loop?",
          options: ["Curly braces", "Indentation", "Semicolons"],
          answer: 1,
          explanation: "Python has no braces for blocks. The lines indented under the line ending with a colon form the block.",
        },
      ],
    },
    "week-6-lecture-p4": {
      hook: "In C, 1 / 3 gave you 0, and a user typing cat where you wanted a number caused trouble you had to guard against yourself. Python changes both: division gives a float, and bad input raises an exception you can catch. It also has no do while loop, so you will learn the while True pattern. Watch for what Python fixed and what it did not.",
      after: {
        "truncation-and-floating-point-imprecision": [
          {
            kind: "predict",
            id: "week-6-lecture-p4-div",
            prompt: "You run the division calculator and type 1, then 3. What is printed?",
            code: `x = int(input("x: "))
y = int(input("y: "))
z = x / y
print(z)`,
            language: "python",
            options: ["0", "0.3333333333333333", "0.33"],
            answer: 1,
            explanation: "In Python, / always produces a float, even when both values are ints, so nothing is truncated. In C, int divided by int threw away the fraction and gave 0.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p4-exact-div",
            prompt: "The division comes out even this time. What does this print?",
            code: `print(4 / 2)`,
            language: "python",
            options: ["2", "2.0", "2.00"],
            answer: 1,
            explanation: "/ returns a float whatever the result, and Python prints a float with at least one decimal place.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p4-imprecision",
            prompt: "You ask for 20 decimal places of one tenth. What is printed?",
            code: `print(f"{1 / 10:.20f}")`,
            language: "python",
            options: [
              "0.10000000000000000000",
              "0.10000000000000000555",
              "0.1",
            ],
            answer: 1,
            explanation: "A float has a finite number of bits, so 0.1 is stored as the nearest value it can represent. Python avoids truncation but still has floating-point imprecision, just as C does.",
          },
        ],
        exceptions: [
          {
            kind: "trace",
            id: "week-6-lecture-p4-try-trace",
            caption: "Watch a ValueError jump from the try block straight to except.",
            code: `s = "cat"
try:
    n = int(s)
    print("Integer.")
except ValueError:
    print("Not integer.")`,
            language: "python",
            steps: [
              { line: 1, vars: { s: "'cat'" }, note: "Stands in for whatever the user typed." },
              { line: 3, vars: { s: "'cat'" }, note: "int('cat') raises a ValueError. n is never assigned and line 4 is skipped." },
              { line: 5, vars: { s: "'cat'" }, note: "The exception matches ValueError, so this block handles it." },
              { line: 6, vars: { s: "'cat'" }, output: "Not integer.\n" },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p4-int-decimal",
            prompt: "Using the version with no try, the user types 3.5. What happens?",
            code: `n = int(input("Input: "))
print("Integer")`,
            language: "python",
            options: [
              "n becomes 3",
              "n becomes 3.5",
              "A ValueError stops the program with an error message",
            ],
            answer: 2,
            explanation: "int can turn the text \"3\" into 3, but the text \"3.5\" is not a valid integer, so it raises ValueError. With no try and except, the program stops there.",
          },
        ],
        mario: [
          {
            kind: "predict",
            id: "week-6-lecture-p4-while-true",
            prompt: "The user types -1, then 0, then 3. How many times is Height: shown, and how many bricks are printed?",
            code: `from cs50 import get_int

while True:
    n = get_int("Height: ")
    if n > 0:
        break

for i in range(n):
    print("#")`,
            language: "python",
            options: [
              "1 prompt, 0 bricks",
              "3 prompts, 3 bricks",
              "2 prompts, 3 bricks",
              "3 prompts, 0 bricks",
            ],
            answer: 1,
            explanation: "-1 and 0 fail n > 0, so the loop asks again. 3 passes and break leaves the loop, with n still 3 for the for loop. This while True and break pattern replaces C's do while.",
          },
          {
            kind: "blank",
            id: "week-6-lecture-p4-while-true-blank",
            prompt: "Python has no do while. Fill the gap so the loop always runs at least once.",
            code: `while ____:
    n = get_int("Height: ")
    if n > 0:
        break`,
            language: "python",
            options: ["True", "true", "n > 0"],
            answer: 0,
            explanation: "True with a capital T is Python's boolean. Lowercase true is a NameError, and n > 0 fails too because n does not exist before the first prompt.",
          },
          {
            kind: "trace",
            id: "week-6-lecture-p4-grid-trace",
            caption: "Trace a 2-by-3 grid of bricks and see where each newline comes from.",
            code: `for i in range(2):
    for j in range(3):
        print("#", end="")
    print()`,
            language: "python",
            steps: [
              { line: 1, vars: { i: "0" }, note: "Row 0 starts." },
              { line: 3, vars: { i: "0", j: "0" }, output: "#" },
              { line: 3, vars: { i: "0", j: "1" }, output: "##" },
              { line: 3, vars: { i: "0", j: "2" }, output: "###" },
              { line: 4, vars: { i: "0", j: "2" }, output: "###\n", note: "The inner loop is done, so print() ends the row." },
              { line: 1, vars: { i: "1", j: "2" }, output: "###\n", note: "Row 1 starts. j keeps its last value until the inner loop sets it again." },
              { line: 3, vars: { i: "1", j: "0" }, output: "###\n#" },
              { line: 3, vars: { i: "1", j: "1" }, output: "###\n##" },
              { line: 3, vars: { i: "1", j: "2" }, output: "###\n###" },
              { line: 4, vars: { i: "1", j: "2" }, output: "###\n###\n" },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p4-repeat",
            prompt: "What does this one line print?",
            code: `print("?" * 4)`,
            language: "python",
            options: ["????", "?4", "TypeError"],
            answer: 0,
            explanation: "Multiplying a str by an int repeats the string that many times. That replaces the loop with end=\"\" from the notes.",
          },
        ],
        lists: [
          {
            kind: "trace",
            id: "week-6-lecture-p4-append-trace",
            caption: "Watch a list grow with append, then get averaged with sum and len.",
            code: `scores = []
for score in [90, 80]:
    scores.append(score)
print(sum(scores) / len(scores))`,
            language: "python",
            steps: [
              { line: 1, vars: { scores: "[]" }, note: "An empty list. Unlike a C array, it can grow." },
              { line: 2, vars: { scores: "[]", score: "90" } },
              { line: 3, vars: { scores: "[90]", score: "90" } },
              { line: 2, vars: { scores: "[90]", score: "80" } },
              { line: 3, vars: { scores: "[90, 80]", score: "80" } },
              { line: 4, vars: { scores: "[90, 80]", score: "80" }, output: "85.0\n", note: "170 / 2 uses /, so the result is a float." },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p4-average",
            prompt: "What does the scores program from the notes print?",
            code: `scores = [72, 73, 33]
average = sum(scores) / len(scores)
print(f"Average: {average}")`,
            language: "python",
            options: ["Average: 59", "Average: 59.333333333333336", "Average: 59.33"],
            answer: 1,
            explanation: "178 / 3 is a float and Python prints all the digits it needs, including the imprecise last one. To show two places, write {average:.2f}.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-6-lecture-p4-recap-steps",
        prompt: "A variation on the column of bricks. What does this print?",
        code: `for i in range(3):
    print("#" * (i + 1))`,
        language: "python",
        options: [
          "#, then ##, then ###, on three lines",
          "### on each of three lines",
          "# on each of three lines",
        ],
        answer: 0,
        explanation: "i takes the values 0, 1 and 2, so the row widths are 1, 2 and 3. Each print adds its own newline, so every row starts on a new line.",
      },
      exercise: {
        prompt: "Write scores.py that asks for 3 integer scores with input. If the user types something that is not an integer, print Not an integer. and ask again. Keep the scores in a list, then print the average and the highest. Typing 90, cat, 80, 71 should print one Not an integer. followed by Average: 80.33333333333333 and Highest: 90.",
        language: "python",
        starter: `def get_score():
    # TODO: keep asking until int(input("Score: ")) works
    ...


def main():
    scores = []
    # TODO: get 3 scores and append them
    # TODO: print the average and the highest


main()`,
        hints: [
          "Put the int(input(...)) inside try, and catch ValueError.",
          "A while True loop lets you keep asking. return leaves the loop as soon as a value works.",
          "sum, len and max all work on a list.",
        ],
        solution: `def get_score():
    while True:
        try:
            return int(input("Score: "))
        except ValueError:
            print("Not an integer.")


def main():
    scores = []
    for i in range(3):
        scores.append(get_score())
    print(f"Average: {sum(scores) / len(scores)}")
    print(f"Highest: {max(scores)}")


main()

# The while True loop plays the role of C's do while, and return exits it
# as soon as int succeeds. A ValueError skips the return and asks again.`,
      },
      recall: [
        {
          id: "week-6-lecture-p4-r1",
          prompt: "What does print(7 / 2) show in Python?",
          options: ["3", "3.5", "4"],
          answer: 1,
          explanation: "In Python, / never truncates: dividing two ints still gives a float.",
        },
        {
          id: "week-6-lecture-p4-r2",
          prompt: "Python avoids integer truncation. Does it also avoid floating-point imprecision?",
          options: [
            "No: floats still have a finite number of bits, as in C",
            "Yes: Python stores decimals exactly",
            "Yes, but only when you use f-strings",
          ],
          answer: 0,
          explanation: "Printing 1 / 3 with 50 decimal places shows digits that are not 3, just as in C.",
        },
        {
          id: "week-6-lecture-p4-r3",
          prompt: "In a try block, int(\"cat\") raises ValueError. What happens to the lines after it inside try?",
          options: [
            "They are skipped and the matching except block runs",
            "They run anyway, then except runs",
            "The program always stops",
          ],
          answer: 0,
          explanation: "An exception jumps straight out of try to the except that matches it.",
        },
        {
          id: "week-6-lecture-p4-r4",
          prompt: "Python has no do while loop. What is the usual replacement for prompting until the input is valid?",
          options: [
            "while True: with a break once the input is valid",
            "for i in range(1):",
            "A recursive call to main",
          ],
          answer: 0,
          explanation: "while True always runs the body at least once, and break leaves as soon as the condition you want holds.",
        },
      ],
    },
    "week-6-lecture-p5": {
      hook: "Your phone book in C needed a loop to search, a struct per person, and careful checks on argc. Python gives you in, dictionaries, sys.argv and the csv module, so whole programs shrink to a few lines. The risk is that short code hides what it does. Here you will predict exactly which line runs, which key is found, and what lands in the file.",
      after: {
        "searching-and-dictionaries": [
          {
            kind: "trace",
            id: "week-6-lecture-p5-for-else-trace",
            caption: "Trace linear search and see why the else after a for is skipped.",
            code: `names = ["Kelly", "David", "John"]
name = "David"
for n in names:
    if name == n:
        print("Found")
        break
else:
    print("Not found")`,
            language: "python",
            steps: [
              { line: 1, vars: { names: "['Kelly', 'David', 'John']" } },
              { line: 2, vars: { names: "['Kelly', 'David', 'John']", name: "'David'" }, note: "Stands in for what the user typed." },
              { line: 3, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'Kelly'" } },
              { line: 4, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'Kelly'" }, note: "'David' == 'Kelly' is False." },
              { line: 3, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'David'" } },
              { line: 4, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'David'" }, note: "True this time." },
              { line: 5, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'David'" }, output: "Found\n" },
              { line: 6, vars: { names: "['Kelly', 'David', 'John']", name: "'David'", n: "'David'" }, output: "Found\n", note: "break leaves the loop early, so the else block does not run." },
            ],
          },
          {
            kind: "predict",
            id: "week-6-lecture-p5-no-break",
            prompt: "Same search for David, but someone deleted the break. What is printed?",
            code: `names = ["Kelly", "David", "John"]
name = "David"
for n in names:
    if name == n:
        print("Found")
else:
    print("Not found")`,
            language: "python",
            options: ["Found", "Found, then Not found", "Not found"],
            answer: 1,
            explanation: "The else of a for runs whenever the loop finishes without a break. Without break, the loop checks John too, finishes normally, and the else prints Not found as well.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p5-keyerror",
            prompt: "What happens when you index a dictionary with a key it does not have?",
            code: `people = {
    "Kelly": "+1-617-495-1000",
    "David": "+1-617-495-1000",
}
print(people["Carter"])`,
            language: "python",
            options: ["It prints None", "It prints Not found", "A KeyError stops the program"],
            answer: 2,
            explanation: "Square brackets demand that the key exists. That is why phonebook.py checks if name in people before it reads people[name].",
          },
          {
            kind: "compare",
            id: "week-6-lecture-p5-list-vs-dict",
            prompt: "Both look up a number by name. Which is the better design?",
            language: "python",
            a: {
              label: "list of dictionaries",
              code: `for person in people:
    if person["name"] == name:
        print(f"Found {person['number']}")
        break
else:
    print("Not found")`,
            },
            b: {
              label: "one dictionary",
              code: `if name in people:
    print(f"Number: {people[name]}")
else:
    print("Not found")`,
            },
            answer: "b",
            explanation: "When each name maps to one number, a single dict keyed by name lets in jump to the entry, close to constant time, instead of checking every person in turn. It is also shorter and easier to read.",
          },
        ],
        "command-line-arguments": [
          {
            kind: "predict",
            id: "week-6-lecture-p5-argv",
            prompt: "You run python greet.py David Malan. What is printed?",
            code: `from sys import argv

if len(argv) == 2:
    print(f"hello, {argv[1]}")
else:
    print("hello, world")`,
            language: "python",
            options: ["hello, David Malan", "hello, David", "hello, world"],
            answer: 2,
            explanation: "argv is [\"greet.py\", \"David\", \"Malan\"], so its length is 3, not 2, and the else runs. Quoting \"David Malan\" would make it one argument.",
          },
        ],
        "exit-status": [
          {
            kind: "predict",
            id: "week-6-lecture-p5-exit-status",
            prompt: "You run python exit.py with no argument, then echo $?. What does echo print?",
            code: `import sys

if len(sys.argv) != 2:
    print("Missing command-line argument")
    sys.exit(1)

print(f"hello, {sys.argv[1]}")
sys.exit(0)`,
            language: "python",
            options: ["0", "1", "2"],
            answer: 1,
            explanation: "Only the program name is in argv, so the program prints its message and exits with status 1. As in C, 0 means success and anything else signals an error.",
          },
        ],
        "csv-files": [
          {
            kind: "predict",
            id: "week-6-lecture-p5-csv-row",
            prompt: "You type David and +1-617-495-1000. Which line is added to phonebook.csv?",
            code: `import csv

name = input("Name: ")
number = input("Number: ")

with open("phonebook.csv", "a") as file:
    writer = csv.writer(file)
    writer.writerow([name, number])`,
            language: "python",
            options: [
              "David,+1-617-495-1000",
              "David, +1-617-495-1000",
              "['David', '+1-617-495-1000']",
            ],
            answer: 0,
            explanation: "writerow joins the list's items with commas, with no extra spaces, and ends the line. You never write the commas yourself.",
          },
          {
            kind: "predict",
            id: "week-6-lecture-p5-append-vs-write",
            prompt: "You change \"a\" to \"w\" and run the program twice, adding A and then B. What is in phonebook.csv afterwards?",
            options: ["Only the B line", "The A line, then the B line", "Nothing"],
            answer: 0,
            explanation: "\"w\" empties the file each time it is opened, so the second run wipes A. \"a\" appends to the end, which is what a phone book needs.",
          },
          {
            kind: "compare",
            id: "week-6-lecture-p5-with",
            prompt: "Both write a row. Which is the better design?",
            language: "python",
            a: {
              label: "open and close",
              code: `file = open("phonebook.csv", "a")
writer = csv.writer(file)
writer.writerow([name, number])
file.close()`,
            },
            b: {
              label: "with",
              code: `with open("phonebook.csv", "a") as file:
    writer = csv.writer(file)
    writer.writerow([name, number])`,
            },
            answer: "b",
            explanation: "with closes the file automatically when the indented block ends, even if an error happens inside it. With A, a forgotten or skipped close can leave data unwritten.",
          },
        ],
        "third-party-libraries": [
          {
            kind: "predict",
            id: "week-6-lecture-p5-pip",
            prompt: "On a fresh computer with Python installed, your first line is import qrcode. What happens?",
            options: [
              "ModuleNotFoundError, until you run pip install qrcode",
              "It works, because every library ships with Python",
              "SyntaxError",
            ],
            answer: 0,
            explanation: "Third-party libraries are written by other people and installed separately with pip. Built-in modules such as csv and sys come with Python itself.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-6-lecture-p5-recap-in-dict",
        prompt: "Back to the phone book dictionary. What are the two lines printed?",
        code: `people = {
    "Kelly": "+1-617-495-1000",
    "David": "+1-617-495-1000",
}
print("David" in people)
print("+1-617-495-1000" in people)`,
        language: "python",
        options: ["True, then True", "True, then False", "False, then True"],
        answer: 1,
        explanation: "in on a dictionary looks only at the keys. The number is a value, not a key, so the second check is False.",
      },
      exercise: {
        prompt: "Write lookup.py that takes exactly one command-line argument, a name. With any other number of arguments, print Usage: python lookup.py NAME and exit with status 1. Otherwise print Number: followed by the person's number from a dictionary, or Not found. Test with python lookup.py David, python lookup.py Carter, and python lookup.py followed by echo $?, which should show 1.",
        language: "python",
        starter: `import sys

people = {
    "Kelly": "+1-617-495-1000",
    "David": "+1-617-495-1000",
    "John": "+1-949-468-2750",
}

# TODO: check the number of arguments
# TODO: look the name up and print the result`,
        hints: [
          "sys.argv[0] is the program's name, so one argument means a length of 2.",
          "sys.exit(1) ends the program with exit status 1.",
          "Check name in people before you read people[name], or you risk a KeyError.",
        ],
        solution: `import sys

people = {
    "Kelly": "+1-617-495-1000",
    "David": "+1-617-495-1000",
    "John": "+1-949-468-2750",
}

if len(sys.argv) != 2:
    print("Usage: python lookup.py NAME")
    sys.exit(1)

name = sys.argv[1]
if name in people:
    print(f"Number: {people[name]}")
else:
    print("Not found")
sys.exit(0)

# Checking argv first means sys.argv[1] always exists below it, and
# checking in people first means people[name] can never raise a KeyError.`,
      },
      recall: [
        {
          id: "week-6-lecture-p5-r1",
          prompt: "When does the else block attached to a for loop run?",
          options: [
            "When the loop finishes without hitting break",
            "When the loop body never runs at all, and only then",
            "After every iteration",
          ],
          answer: 0,
          explanation: "break skips the else. That is why the search prints Not found only when no name matched.",
        },
        {
          id: "week-6-lecture-p5-r2",
          prompt: "With people = {\"David\": \"+1-617-495-1000\"}, what does people[\"David\"] give you?",
          options: ["\"+1-617-495-1000\"", "\"David\"", "True"],
          answer: 0,
          explanation: "Indexing a dictionary with a key returns the value stored under that key.",
        },
        {
          id: "week-6-lecture-p5-r3",
          prompt: "For python greet.py David, what is argv[0]?",
          options: ["\"greet.py\"", "\"David\"", "\"python\""],
          answer: 0,
          explanation: "As in C, the first element is the program's own name, so the first real argument is argv[1].",
        },
        {
          id: "week-6-lecture-p5-r4",
          prompt: "Why does the notes' CSV code use with open(...) as file?",
          options: [
            "The file is closed automatically when the indented block ends",
            "It opens the file faster",
            "It is the only way to append to a file",
          ],
          answer: 0,
          explanation: "with takes care of file.close() for you, so you cannot forget it.",
        },
      ],
    },
  },
  section: {
    recall: [
      {
        id: "week-6-section-r1",
        prompt: "Which numbers does range(1, 3, 2) produce?",
        options: ["1", "1 and 3", "1, 2 and 3"],
        answer: 0,
        explanation: "The start is included, the end is excluded, and the step is 2. After 1 comes 3, which is not below 3, so only 1 is produced.",
      },
      {
        id: "week-6-section-r2",
        prompt: "Which numbers does range(5, 0, -1) produce?",
        options: ["5 4 3 2 1", "5 4 3 2 1 0", "Nothing, because 5 is larger than 0"],
        answer: 0,
        explanation: "A negative step counts down. The end, 0, is still excluded.",
      },
      {
        id: "week-6-section-r3",
        prompt: "In C you needed strcmp to compare strings. What do you use in Python?",
        options: ["name == \"Alice\"", "strcmp(name, \"Alice\") == 0", "name.compare(\"Alice\")"],
        answer: 0,
        explanation: "In Python, == compares the characters of two strings, not their addresses, so it does what you would expect.",
      },
      {
        id: "week-6-section-r4",
        prompt: "A CSV of songs has a tempo column. Why might row[\"tempo\"] >= 90 give wrong or failing results?",
        options: [
          "csv gives every value as a str, so you need int(row[\"tempo\"]) first",
          "DictReader turns numbers into floats",
          "Column names must be written in capitals",
        ],
        answer: 0,
        explanation: "Everything read from a CSV is text. Comparing a str with an int raises a TypeError, and comparing two strings goes letter by letter, so \"95\" < \"100\" is False.",
      },
      {
        id: "week-6-section-r5",
        prompt: "What does this print?",
        code: `phrase = "elephant"
for i in range(1, len(phrase) - 1):
    print(phrase[i], end="")
print()`,
        options: ["lephan", "elephan", "lephant"],
        answer: 0,
        explanation: "range starts at index 1, skipping the first letter, and stops before len - 1, which skips the last letter.",
      },
    ],
    exercise: {
      prompt: "Write playlist.py for a songs.csv whose header is name,tempo. Ask for a minimum and a maximum tempo with input, read the file with csv.DictReader, and print the name of every song whose tempo is between them, inclusive. With the starter's four songs, 90 and 110 should print Mid Song and Dance Song.",
      language: "python",
      starter: `# songs.csv contains:
# name,tempo
# Slow Song,72
# Mid Song,100
# Fast Song,128
# Dance Song,95

import csv

minimum = int(input("Minimum tempo: "))
maximum = int(input("Maximum tempo: "))

# TODO: open songs.csv, read each row, print matching names`,
      hints: [
        "Use with open(\"songs.csv\") as file: and then csv.DictReader(file).",
        "row[\"tempo\"] is a str. Convert it before comparing.",
        "Python lets you chain comparisons: minimum <= tempo <= maximum.",
      ],
      solution: `import csv

minimum = int(input("Minimum tempo: "))
maximum = int(input("Maximum tempo: "))

with open("songs.csv") as file:
    reader = csv.DictReader(file)
    for row in reader:
        tempo = int(row["tempo"])
        if minimum <= tempo <= maximum:
            print(row["name"])

# DictReader uses the header row as keys, and int converts each tempo so
# the comparison is numeric rather than alphabetical.`,
    },
  },
  shorts: {
    "week-6-short-python": {
      recall: [
        {
          id: "week-6-short-python-r1",
          prompt: "What is the last number produced by range(0, 100, 2)?",
          options: ["98", "100", "99"],
          answer: 0,
          explanation: "It counts 0, 2, 4 and so on by twos, and the end value 100 is excluded, so it stops at 98.",
        },
        {
          id: "week-6-short-python-r2",
          prompt: "What happens here?",
          code: `president = ("George Washington", 1789)
president[1] = 1790`,
          options: [
            "TypeError: a tuple cannot be changed",
            "The year becomes 1790",
            "A new tuple is appended",
          ],
          answer: 0,
          explanation: "A tuple is an ordered, immutable collection. Use a list if you need to change items.",
        },
        {
          id: "week-6-short-python-r3",
          prompt: "Which loop gives you both the key and the value of each entry in the dictionary pizzas?",
          options: [
            "for pie, price in pizzas.items():",
            "for pie, price in pizzas:",
            "for pie in range(pizzas):",
          ],
          answer: 0,
          explanation: "Looping over a dict directly gives only its keys. .items() gives key and value pairs that you can unpack into two variables.",
        },
        {
          id: "week-6-short-python-r4",
          prompt: "How do you start a function definition in Python?",
          options: ["def square(x):", "int square(int x)", "function square(x) {"],
          answer: 0,
          explanation: "def introduces a function. There are no return or parameter types, and the colon starts the indented body.",
        },
      ],
    },
  },
  glossary: [
    { term: "interpreter", meaning: "A program that reads your source code and runs it line by line, with no separate compile step." },
    { term: "module", meaning: "A file of Python code, such as csv or sys, that you can import into your own program." },
    { term: "library", meaning: "A collection of code written by others, like the CS50 Library or PIL, that you can reuse." },
    { term: "pip", meaning: "The command that downloads and installs third-party Python libraries, as in pip install cs50." },
    { term: "str", meaning: "Python's type for text, which replaces C's char * and has built-in methods like lower and upper." },
    { term: "f-string", meaning: "A string with an f before the quote, in which {name} is replaced by the value of name." },
    { term: "named parameter", meaning: "An argument passed by name, such as end=\"\", so its position does not matter." },
    { term: "method", meaning: "A function that belongs to a value and is called with a dot, such as s.upper()." },
    { term: "object", meaning: "A value that bundles data together with the methods that work on it." },
    { term: "list", meaning: "An ordered, changeable sequence of values that can grow with append." },
    { term: "tuple", meaning: "An ordered sequence of values that cannot be changed after it is created." },
    { term: "dict", meaning: "A dictionary: a collection of key and value pairs where you look a value up by its key." },
    { term: "set", meaning: "A collection of unique values, good for fast checks with in." },
    { term: "range", meaning: "A sequence of numbers from a start up to, but not including, an end." },
    { term: "exception", meaning: "An error raised while a program runs, such as ValueError, which you can catch with try and except." },
    { term: "sys.argv", meaning: "The list of command-line arguments, where argv[0] is the program's name." },
    { term: "exit status", meaning: "The number a program returns when it ends, where 0 means success; set it with sys.exit." },
    { term: "CSV", meaning: "Comma-separated values: a text file where each line is a row and commas separate the columns." },
  ],
};

export default content;
