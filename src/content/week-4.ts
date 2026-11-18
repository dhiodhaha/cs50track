import type { WeekContent } from "./types";

const content: WeekContent = {
  unitId: "week-4",
  parts: {
    "week-4-lecture-p1": {
      hook: "Your computer has billions of bytes of memory, and every one of them has an address. How do you write those addresses down without drowning in zeros and ones? This part introduces hexadecimal, the base-16 way programmers write colors and memory addresses, and gives you a first picture of where a variable like n actually lives.",
      after: {
        "pixel-art": [
          {
            kind: "predict",
            id: "week-4-lecture-p1-bitmap",
            prompt:
              "In a black-and-white bitmap, 0 means a black pixel and 1 means a white pixel. What does the row 1 0 0 1 look like?",
            options: [
              "white, black, black, white",
              "black, white, white, black",
              "four white pixels",
            ],
            answer: 0,
            explanation:
              "Each bit is one pixel, read left to right. A 1 is white and a 0 is black, so the two middle pixels are black and the ends are white.",
          },
        ],
        hexadecimal: [
          {
            kind: "predict",
            id: "week-4-lecture-p1-hex-10",
            prompt: "In hexadecimal, what decimal number is written as 10?",
            options: ["10", "16", "2"],
            answer: 1,
            explanation:
              "In base 16 the left column counts 16s, not 10s. So 10 means one 16 and zero 1s, which is 16. Decimal ten is written 0A.",
          },
          {
            kind: "trace",
            id: "week-4-lecture-p1-hex-trace",
            caption: "Convert the hexadecimal number 2F to decimal, one column at a time.",
            language: "pseudocode",
            code: `hex = "2F"
left = value of "2", which is 2
right = value of "F", which is 15
total = left * 16 + right
print total`,
            steps: [
              { line: 1, vars: { hex: "2F" } },
              {
                line: 2,
                vars: { hex: "2F", left: "2" },
                note: "The left digit sits in the 16s column.",
              },
              {
                line: 3,
                vars: { hex: "2F", left: "2", right: "15" },
                note: "F is the largest hex digit, worth 15.",
              },
              {
                line: 4,
                vars: { hex: "2F", left: "2", right: "15", total: "47" },
                note: "2 sixteens are 32, plus 15 ones is 47.",
              },
              {
                line: 5,
                vars: { hex: "2F", left: "2", right: "15", total: "47" },
                output: "47",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-4-lecture-p1-hex-color",
            prompt:
              "Photoshop shows a color as FF0000: two hex digits each for red, green and blue. What color is it?",
            options: ["Red", "Green", "Black"],
            answer: 0,
            explanation:
              "FF is 255, the most red there can be, and 00 means no green and no blue. Black would be 000000.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p1-hex-bits",
            prompt: "How many bits does one hexadecimal digit stand for?",
            options: ["4", "8", "16"],
            answer: 0,
            explanation:
              "A hex digit has 16 possible values, and 4 bits also have 16 combinations. So two hex digits are exactly one 8-bit byte, which is why a byte runs from 00 to FF.",
          },
        ],
        memory: [
          {
            kind: "predict",
            id: "week-4-lecture-p1-0x-prefix",
            prompt: "Why do programmers write an address as 0x10 instead of just 10?",
            options: [
              "The 0x says the number is hexadecimal, so it is not mistaken for decimal ten",
              "The 0x makes the number bigger",
              "Every address must start with a zero",
            ],
            answer: 0,
            explanation:
              "The prefix is only a label for humans and compilers. 0x10 is sixteen, while 10 on its own would read as ten.",
          },
          {
            kind: "demo",
            id: "week-4-lecture-p1-memory-demo",
            demo: "memory",
            caption:
              "Click each cell and read its address: 0x64, 0x68, 0x6c. Each int takes 4 bytes, so the addresses go up by 4 in hexadecimal.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-4-lecture-p1-recap",
        prompt: "One more conversion: what is 0xFE in decimal?",
        options: ["254", "255", "240", "14"],
        answer: 0,
        explanation:
          "F in the 16s column is 15 times 16, which is 240. E in the 1s column is 14. 240 plus 14 is 254, one less than FF.",
      },
      exercise: {
        prompt:
          "Write hex.c that asks for an integer from 0 to 255 and prints it as two hexadecimal digits, working out each digit yourself with / and %. It works if 255 prints FF, 16 prints 10, and 10 prints 0A.",
        language: "c",
        starter: `#include <cs50.h>
#include <stdio.h>

int main(void)
{
    char digits[] = "0123456789ABCDEF";
    int n;
    do
    {
        n = get_int("Number: ");
    }
    while (n < 0 || n > 255);

    // TODO: print n as two hexadecimal digits
}`,
        hints: [
          "The left digit counts how many 16s fit in n. The right digit is what is left over.",
          "n / 16 gives the left digit's value and n % 16 gives the right digit's value.",
          "digits[11] is 'B', so you can use a digit's value as an index into digits.",
        ],
        solution: `// Integer division by 16 gives the 16s column, and % 16 gives the 1s column.
// Each value from 0 to 15 picks its symbol out of digits.
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    char digits[] = "0123456789ABCDEF";
    int n;
    do
    {
        n = get_int("Number: ");
    }
    while (n < 0 || n > 255);

    printf("%c%c\\n", digits[n / 16], digits[n % 16]);
}`,
      },
      recall: [
        {
          id: "week-4-lecture-p1-r1",
          prompt: "What is 0x1A in decimal?",
          options: ["26", "110", "20", "11"],
          answer: 0,
          explanation:
            "1 in the 16s column is 16, and A is 10. 16 plus 10 is 26.",
        },
        {
          id: "week-4-lecture-p1-r2",
          prompt: "Why is hexadecimal a handy way to write bytes?",
          options: [
            "Two hex digits cover exactly one byte, from 00 to FF",
            "Hexadecimal numbers take less memory inside the computer",
            "Computers store everything in base 16",
          ],
          answer: 0,
          explanation:
            "Computers still store bits. Hex is just a shorter way for people to write them, with each digit standing for 4 bits.",
        },
        {
          id: "week-4-lecture-p1-r3",
          prompt: "In a hexadecimal number, what is each column worth, from the right?",
          options: ["1, 16, 256, and so on", "1, 10, 100, and so on", "1, 2, 4, and so on"],
          answer: 0,
          explanation:
            "Each column is a power of 16. Powers of 10 are decimal and powers of 2 are binary.",
        },
        {
          id: "week-4-lecture-p1-r4",
          prompt:
            "An int starts at address 0x10 and takes 4 bytes. At what address does the next byte after it start?",
          options: ["0x14", "0x11", "0x20"],
          answer: 0,
          explanation:
            "The int fills 0x10, 0x11, 0x12 and 0x13, so the next free byte is 0x10 plus 4, which is 0x14.",
        },
      ],
    },

    "week-4-lecture-p2": {
      hook: "When you write int n = 50;, the 50 sits at some address in memory. What if a variable could hold that address instead of a number? That one idea, the pointer, explains what a string has been all along and lets you walk through memory one byte at a time. The rest of C in this course builds on it.",
      after: {
        pointers: [
          {
            kind: "trace",
            id: "week-4-lecture-p2-pointer-trace",
            caption: "Watch a pointer change n without the line ever naming n.",
            language: "c",
            code: `#include <stdio.h>

int main(void)
{
    int n = 50;
    int *p = &n;
    *p = 51;
    printf("%i\\n", n);
}`,
            steps: [
              {
                line: 5,
                vars: { n: "50" },
                note: "Say n lives at address 0x123. The exact address does not matter.",
              },
              {
                line: 6,
                vars: { n: "50", p: "0x123", "*p": "50" },
                note: "&n is the address of n, so p stores 0x123.",
              },
              {
                line: 7,
                vars: { n: "51", p: "0x123", "*p": "51" },
                note: "*p means go to address 0x123. Writing 51 there changes n.",
              },
              {
                line: 8,
                vars: { n: "51", p: "0x123", "*p": "51" },
                output: "51\n",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-4-lecture-p2-percent-p",
            prompt: "What does this print?",
            code: `int n = 50;
printf("%p\\n", &n);`,
            language: "c",
            options: ["50", "An address such as 0x7ffc3a1c", "&n"],
            answer: 1,
            explanation:
              "%p prints an address, and &n means the address of n. To print the 50 you would use %i with n.",
          },
          {
            kind: "blank",
            id: "week-4-lecture-p2-declare-pointer",
            prompt: "Declare p as a pointer that stores the address of n.",
            code: `int n = 50;
int ____ = &n;`,
            language: "c",
            options: ["*p", "p", "&p"],
            answer: 0,
            explanation:
              "int *p declares a pointer to an int. A plain int p is meant for numbers, not addresses, and &p is not something you can declare.",
          },
          {
            kind: "demo",
            id: "week-4-lecture-p2-memory-demo",
            demo: "memory",
            caption:
              "Select items[1], then press Increment *p. p holds the address 0x68, and *p reaches through it to turn 20 into 21.",
          },
        ],
        strings: [
          {
            kind: "predict",
            id: "week-4-lecture-p2-s-is-address",
            prompt: "What do these two lines print?",
            code: `char *s = "HI!";
printf("%p\\n", s);
printf("%p\\n", &s[0]);`,
            language: "c",
            options: [
              "The same address twice",
              "Two addresses one byte apart",
              "HI! and then H",
            ],
            answer: 0,
            explanation:
              "s holds the address of the string's first character, and &s[0] is the address of that same character. %p prints addresses, not text.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p2-bytes",
            prompt: "How many bytes does the string \"HI!\" take in memory, counting everything stored for it except the pointer s?",
            options: ["3", "4", "8"],
            answer: 1,
            explanation:
              "H, I and ! take three bytes, and the \\0 that marks the end takes a fourth. The pointer s is a separate 8-byte variable that holds the address of H.",
          },
          {
            kind: "blank",
            id: "week-4-lecture-p2-typedef",
            prompt: "Fill in how the CS50 Library defines string.",
            code: "typedef ____ string;",
            language: "c",
            options: ["char *", "char", "int *"],
            answer: 0,
            explanation:
              "A string is the address of its first char, so string is another name for char *. A plain char holds only one character.",
          },
        ],
        "pointer-arithmetic": [
          {
            kind: "trace",
            id: "week-4-lecture-p2-arith-trace",
            caption: "Step through pointer arithmetic on a string and watch the addresses.",
            language: "c",
            code: `#include <stdio.h>

int main(void)
{
    char *s = "HI!";
    printf("%c\\n", *s);
    printf("%c\\n", *(s + 1));
    printf("%s\\n", s + 1);
}`,
            steps: [
              {
                line: 5,
                vars: { s: "0x123", "*s": "'H'" },
                note: "Say H is at 0x123, I at 0x124, ! at 0x125 and \\0 at 0x126.",
              },
              {
                line: 6,
                vars: { s: "0x123", "*s": "'H'" },
                output: "H\n",
              },
              {
                line: 7,
                vars: { s: "0x123", "s + 1": "0x124", "*(s + 1)": "'I'" },
                output: "H\nI\n",
                note: "s + 1 is the next byte's address. s itself does not change.",
              },
              {
                line: 8,
                vars: { s: "0x123", "s + 1": "0x124" },
                output: "H\nI\nI!\n",
                note: "%s starts at 0x124 and prints until it reaches \\0.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-4-lecture-p2-s-plus-2",
            prompt: "What does this print?",
            code: `char *s = "HI!";
printf("%s\\n", s + 2);`,
            language: "c",
            options: ["!", "I!", "HI!"],
            answer: 0,
            explanation:
              "s + 2 is the address of the !, and %s prints from there up to the \\0. I! would be s + 1.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p2-int-arith",
            prompt: "What does this print?",
            code: `int numbers[] = {4, 6, 8};
int *p = numbers;
printf("%i\\n", *(p + 1));`,
            language: "c",
            options: ["5", "6", "An address"],
            answer: 1,
            explanation:
              "p + 1 moves to the next int, 4 bytes later, and * reads the 6 stored there. You would get 5 from *p + 1, which adds 1 to the value instead.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-4-lecture-p2-recap",
        prompt: "Back to n and p. What does this print?",
        code: `int n = 50;
int *p = &n;
n = 7;
printf("%i\\n", *p);`,
        language: "c",
        options: ["50", "7", "An address"],
        answer: 1,
        explanation:
          "p still holds the address of n. *p reads whatever is in n right now, which is 7, not the 50 that was there when p was set.",
      },
      exercise: {
        prompt:
          "Write chars.c that gets a string and prints each character on its own line next to its address, using a char * that you move forward with pointer arithmetic and no square brackets. For HI! you should see three lines whose addresses go up by exactly one each time.",
        language: "c",
        starter: `#include <cs50.h>
#include <stdio.h>

int main(void)
{
    char *s = get_string("s: ");

    // TODO: print each character and its address, without using s[i]
}`,
        hints: [
          "Start a second pointer, char *p, at the same address as s.",
          "The string ends where *p is '\\0'.",
          "p++ moves p to the next byte, just like s + 1 does.",
        ],
        solution: `// Each char is one byte, so p++ moves exactly one address forward.
// The loop stops at the \\0 that ends every string.
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    char *s = get_string("s: ");

    for (char *p = s; *p != '\\0'; p++)
    {
        printf("%c %p\\n", *p, p);
    }
}`,
      },
      recall: [
        {
          id: "week-4-lecture-p2-r1",
          prompt: "After int n = 50; int *p = &n;, what is *p?",
          options: ["50", "The address of n", "The address of p"],
          answer: 0,
          explanation:
            "p holds the address of n. *p goes to that address and gives the int stored there, 50.",
        },
        {
          id: "week-4-lecture-p2-r2",
          prompt: "In CS50's library, what is a string really?",
          options: [
            "A char * holding the address of the first character",
            "A type built into C that stores text",
            "An int that counts characters",
          ],
          answer: 0,
          explanation:
            "cs50.h says typedef char *string. C itself has no string type, only addresses of chars ending in \\0.",
        },
        {
          id: "week-4-lecture-p2-r3",
          prompt: "What does this print?",
          code: `char *s = "CS50";
printf("%c\\n", *(s + 2));`,
          options: ["5", "S", "C50"],
          answer: 0,
          explanation:
            "s points at C, s + 1 at S, and s + 2 at 5. %c prints one character, so it prints 5.",
        },
        {
          id: "week-4-lecture-p2-r4",
          prompt: "Outside a declaration, what do & and * do?",
          options: [
            "& gives an address, and * goes to an address",
            "& goes to an address, and * gives an address",
            "Both multiply numbers",
          ],
          answer: 0,
          explanation:
            "&n is the address of n. *p follows the address in p to the value there.",
        },
      ],
    },

    "week-4-lecture-p3": {
      hook: "Type HI! twice and C says the two strings are different. Copy a string, change the copy, and the original changes too. Both surprises have one cause: a string variable holds an address. This part shows how to compare and copy what is at the address, and how to borrow memory with malloc and give it back with free.",
      after: {
        "string-comparison": [
          {
            kind: "predict",
            id: "week-4-lecture-p3-equals-strings",
            prompt: "You type HI! for both prompts. What prints?",
            code: `char *s = get_string("s: ");
char *t = get_string("t: ");
if (s == t)
{
    printf("Same\\n");
}
else
{
    printf("Different\\n");
}`,
            language: "c",
            options: ["Same", "Different"],
            answer: 1,
            explanation:
              "== compares the two addresses, not the letters. Each call to get_string stores its string in a different place, so the addresses differ.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p3-strcmp-truthy",
            prompt: "Someone switched to strcmp but wrote the test like this. You type HI! twice. What prints?",
            code: `if (strcmp(s, t))
{
    printf("Same\\n");
}
else
{
    printf("Different\\n");
}`,
            language: "c",
            options: ["Same", "Different"],
            answer: 1,
            explanation:
              "strcmp returns 0 when the strings match, and 0 counts as false. So the else runs. The test should be strcmp(s, t) == 0.",
          },
          {
            kind: "compare",
            id: "week-4-lecture-p3-compare-fix",
            prompt: "Which version correctly checks whether the user typed the same text twice?",
            language: "c",
            a: {
              label: "Compare with ==",
              code: `if (s == t)
{
    printf("Same\\n");
}`,
            },
            b: {
              label: "Compare with strcmp",
              code: `if (strcmp(s, t) == 0)
{
    printf("Same\\n");
}`,
            },
            answer: "b",
            explanation:
              "s == t asks whether both pointers hold the same address. strcmp walks both strings character by character and returns 0 only when they match.",
          },
        ],
        "copying-and-malloc": [
          {
            kind: "trace",
            id: "week-4-lecture-p3-shallow-copy",
            caption: "See why string t = s copies an address, not the string.",
            language: "c",
            code: `int main(void)
{
    string s = get_string("s: ");
    string t = s;
    t[0] = toupper(t[0]);
    printf("s: %s\\n", s);
    printf("t: %s\\n", t);
}`,
            steps: [
              {
                line: 3,
                vars: { s: "0x123", "chars at 0x123": "h i ! \\0" },
                note: "You type hi!. get_string stores it at 0x123 and returns that address.",
              },
              {
                line: 4,
                vars: { s: "0x123", t: "0x123", "chars at 0x123": "h i ! \\0" },
                note: "Only the address is copied. s and t point at the same characters.",
              },
              {
                line: 5,
                vars: { s: "0x123", t: "0x123", "chars at 0x123": "H i ! \\0" },
                note: "t[0] is the byte at 0x123, which is also s[0].",
              },
              {
                line: 6,
                vars: { s: "0x123", t: "0x123", "chars at 0x123": "H i ! \\0" },
                output: "s: Hi!\n",
              },
              {
                line: 7,
                vars: { s: "0x123", t: "0x123", "chars at 0x123": "H i ! \\0" },
                output: "s: Hi!\nt: Hi!\n",
              },
            ],
          },
          {
            kind: "trace",
            id: "week-4-lecture-p3-malloc-copy",
            caption: "Make a real copy with malloc and watch each byte arrive.",
            language: "c",
            code: `int main(void)
{
    char *s = get_string("s: ");
    char *t = malloc(strlen(s) + 1);
    for (int i = 0, n = strlen(s); i <= n; i++)
    {
        t[i] = s[i];
    }
    t[0] = toupper(t[0]);
    printf("s: %s\\n", s);
    printf("t: %s\\n", t);
    free(t);
}`,
            steps: [
              {
                line: 3,
                vars: { s: "0x123", "at 0x123": "h i \\0" },
                note: "You type hi.",
              },
              {
                line: 4,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "? ? ?" },
                note: "strlen(s) is 2, so malloc gives 3 bytes. They hold garbage until you fill them.",
              },
              {
                line: 5,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "? ? ?", i: "0", n: "2" },
              },
              {
                line: 7,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h ? ?", i: "0", n: "2" },
              },
              {
                line: 5,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h ? ?", i: "1", n: "2" },
              },
              {
                line: 7,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h i ?", i: "1", n: "2" },
              },
              {
                line: 5,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h i ?", i: "2", n: "2" },
                note: "2 <= 2 is still true, so the \\0 gets copied too.",
              },
              {
                line: 7,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h i \\0", i: "2", n: "2" },
              },
              {
                line: 5,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "h i \\0", i: "3", n: "2" },
                note: "3 <= 2 is false, so the loop ends.",
              },
              {
                line: 9,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "H i \\0" },
                note: "Only the copy at 0x456 changes.",
              },
              {
                line: 10,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "H i \\0" },
                output: "s: hi\n",
              },
              {
                line: 11,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "H i \\0" },
                output: "s: hi\nt: Hi\n",
              },
              {
                line: 12,
                vars: { s: "0x123", "at 0x123": "h i \\0", t: "0x456", "at 0x456": "freed" },
                output: "s: hi\nt: Hi\n",
                note: "free hands the 3 bytes back. t still holds 0x456, but you must not use it now.",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-4-lecture-p3-plus-one",
            prompt: "Ask for exactly enough memory to copy s, including its terminator.",
            code: "char *t = malloc(strlen(s) ____);",
            language: "c",
            options: ["+ 1", "- 1", "+ 0"],
            answer: 0,
            explanation:
              "strlen counts the characters but not the \\0 at the end. Without the extra byte, copying the \\0 writes past the memory you were given.",
          },
          {
            kind: "compare",
            id: "week-4-lecture-p3-strlen-loop",
            prompt: "Both loops copy s into t. Which is better designed?",
            language: "c",
            a: {
              label: "strlen in the condition",
              code: `for (int i = 0; i <= strlen(s); i++)
{
    t[i] = s[i];
}`,
            },
            b: {
              label: "strlen once, stored in n",
              code: `for (int i = 0, n = strlen(s); i <= n; i++)
{
    t[i] = s[i];
}`,
            },
            answer: "b",
            explanation:
              "The condition runs before every pass, so version a calls strlen again and again on a string that never changes. Version b calls it once.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p3-null-check",
            prompt: "What does malloc return if it cannot give you the memory you asked for?",
            options: [
              "NULL",
              "A pointer to a smaller block",
              "Nothing, because it ends the program for you",
            ],
            answer: 0,
            explanation:
              "malloc returns NULL when it fails, and so does get_string. That is why the notes check if (t == NULL) and return 1 before using t.",
          },
        ],
        valgrind: [
          {
            kind: "predict",
            id: "week-4-lecture-p3-valgrind-errors",
            prompt: "valgrind ./memory reports two problems with this program. Which two?",
            code: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *x = malloc(3 * sizeof(int));
    x[1] = 72;
    x[2] = 73;
    x[3] = 33;
}`,
            language: "c",
            options: [
              "Writing x[3], past the 3 ints you asked for, and never freeing x",
              "Setting x[1] before x[0], and including stdio.h without using it",
              "Using sizeof(int), and not printing anything",
            ],
            answer: 0,
            explanation:
              "3 ints means x[0], x[1] and x[2] only, so x[3] is an invalid write. The block from malloc is never passed to free, so it leaks.",
          },
          {
            kind: "blank",
            id: "week-4-lecture-p3-sizeof",
            prompt: "Ask for room for 3 ints.",
            code: "int *x = malloc(3 * ____);",
            language: "c",
            options: ["sizeof(int)", "int", "3"],
            answer: 0,
            explanation:
              "malloc counts bytes. sizeof(int) is the size of one int, usually 4, so this asks for 12 bytes. A bare type name is not a number.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-4-lecture-p3-recap",
        prompt: "This time t is set from s instead of from a second get_string. You type HI!. What prints?",
        code: `char *s = get_string("s: ");
char *t = s;
if (s == t)
{
    printf("Same\\n");
}
else
{
    printf("Different\\n");
}`,
        language: "c",
        options: ["Same", "Different"],
        answer: 0,
        explanation:
          "t = s copies the address, so both pointers hold the same address and == is true. That is the same reason changing t[0] changes s[0].",
      },
      exercise: {
        prompt:
          "Write reverse.c that gets a string s, allocates exactly enough memory for a copy, fills the copy with s's characters in reverse order, prints both strings, and frees the copy. Typing hello should print olleh as the copy, and valgrind ./reverse should report no leaks.",
        language: "c",
        starter: `#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *s = get_string("s: ");
    if (s == NULL)
    {
        return 1;
    }

    // TODO: allocate memory for a copy of s
    // TODO: fill it with s's characters in reverse, then end it with '\\0'
    // TODO: print both strings and free the copy
}`,
        hints: [
          "You need strlen(s) + 1 bytes, the same as for a normal copy.",
          "If n is strlen(s), index i of the copy gets the character at index n - 1 - i of s.",
          "Set t[n] = '\\0' yourself, or printf will keep reading past the end.",
        ],
        solution: `// The copy needs n + 1 bytes for n characters plus '\\0'.
// Index i of t takes s[n - 1 - i], so the last character comes first.
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *s = get_string("s: ");
    if (s == NULL)
    {
        return 1;
    }

    int n = strlen(s);
    char *t = malloc(n + 1);
    if (t == NULL)
    {
        return 1;
    }

    for (int i = 0; i < n; i++)
    {
        t[i] = s[n - 1 - i];
    }
    t[n] = '\\0';

    printf("s: %s\\n", s);
    printf("t: %s\\n", t);
    free(t);
    return 0;
}`,
      },
      recall: [
        {
          id: "week-4-lecture-p3-r1",
          prompt: "Why does s == t print Different for two strings you typed identically?",
          options: [
            "== compares the two addresses, and each string lives at its own address",
            "== is case-sensitive",
            "get_string adds a hidden character to each string",
          ],
          answer: 0,
          explanation:
            "s and t are char * values, which are addresses. To compare the characters, use strcmp(s, t) == 0.",
        },
        {
          id: "week-4-lecture-p3-r2",
          prompt: "After string t = s; and then t[0] = 'X';, what is s[0]?",
          options: ["'X'", "Whatever it was before", "It depends on the length of s"],
          answer: 0,
          explanation:
            "t = s copied only the address. s and t point to the same bytes, so changing t[0] changes s[0].",
        },
        {
          id: "week-4-lecture-p3-r3",
          prompt: "Why does a string copy need malloc(strlen(s) + 1)?",
          options: [
            "The extra byte holds the \\0 that ends the string",
            "malloc always needs one byte for itself",
            "strlen counts from 1, not 0",
          ],
          answer: 0,
          explanation:
            "strlen does not count the \\0, but the copy must end with one or printf will not know where it stops.",
        },
        {
          id: "week-4-lecture-p3-r4",
          prompt: "What does valgrind check for?",
          options: [
            "Memory errors, such as leaks and reading or writing memory you did not allocate",
            "Style problems in your code",
            "Whether your program prints the right output",
          ],
          answer: 0,
          explanation:
            "valgrind watches your program's memory use. It reports blocks you never freed and accesses outside what malloc gave you.",
        },
      ],
    },

    "week-4-lecture-p4": {
      hook: "You write a swap function, call it, and nothing swaps. No error, no warning, the same values as before. To see why, you need a picture of where each function keeps its variables. This part shows what is in memory before you set it, and how passing an address lets one function change another function's variables.",
      after: {
        "garbage-values": [
          {
            kind: "predict",
            id: "week-4-lecture-p4-garbage",
            prompt: "What does this print?",
            code: `int scores[3];
printf("%i\\n", scores[0]);`,
            language: "c",
            options: [
              "0",
              "Whatever value was left in that memory",
              "Nothing, because it does not compile",
            ],
            answer: 1,
            explanation:
              "Declaring the array reserves memory but does not clear it. Until you assign a value, you read a garbage value left over from earlier use. It might happen to be 0, but nothing promises that.",
          },
          {
            kind: "compare",
            id: "week-4-lecture-p4-init",
            prompt: "Both loops add up three scores. Which can you trust?",
            language: "c",
            a: {
              label: "total declared without a value",
              code: `int total;
for (int i = 0; i < 3; i++)
{
    total += scores[i];
}`,
            },
            b: {
              label: "total starts at 0",
              code: `int total = 0;
for (int i = 0; i < 3; i++)
{
    total += scores[i];
}`,
            },
            answer: "b",
            explanation:
              "In version a, total begins as a garbage value, so the sum is garbage plus the scores. Setting it to 0 first makes the result depend only on the scores.",
          },
        ],
        "pointer-fun-with-binky": [
          {
            kind: "predict",
            id: "week-4-lecture-p4-binky",
            prompt: "Binky's trouble in code: x is never given anything to point at. What happens?",
            code: `int *x;
*x = 42;`,
            language: "c",
            options: [
              "42 is stored safely somewhere",
              "x holds a garbage address, so writing there may crash the program",
              "C sets x to NULL and skips the line",
            ],
            answer: 1,
            explanation:
              "Declaring a pointer makes the pointer, not the thing it points to. Give it an address with & or malloc before you use *x.",
          },
        ],
        swapping: [
          {
            kind: "trace",
            id: "week-4-lecture-p4-swap-value",
            caption: "Trace the swap that fails and watch which frame changes.",
            language: "c",
            code: `void swap(int a, int b)
{
    int tmp = a;
    a = b;
    b = tmp;
}

int main(void)
{
    int x = 1;
    int y = 2;
    swap(x, y);
    printf("x is %i, y is %i\\n", x, y);
}`,
            steps: [
              { line: 10, vars: { "x (main)": "1" }, note: "main's frame on the stack holds x." },
              { line: 11, vars: { "x (main)": "1", "y (main)": "2" } },
              {
                line: 1,
                vars: { "x (main)": "1", "y (main)": "2", "a (swap)": "1", "b (swap)": "2" },
                note: "swap(x, y) runs. swap gets its own frame above main's, holding copies: a is 1, b is 2.",
              },
              {
                line: 3,
                vars: { "x (main)": "1", "y (main)": "2", "a (swap)": "1", "b (swap)": "2", "tmp (swap)": "1" },
              },
              {
                line: 4,
                vars: { "x (main)": "1", "y (main)": "2", "a (swap)": "2", "b (swap)": "2", "tmp (swap)": "1" },
              },
              {
                line: 5,
                vars: { "x (main)": "1", "y (main)": "2", "a (swap)": "2", "b (swap)": "1", "tmp (swap)": "1" },
                note: "a and b are swapped, but they are copies. x and y never changed.",
              },
              {
                line: 12,
                vars: { "x (main)": "1", "y (main)": "2" },
                note: "swap returns and its frame is gone, along with a, b and tmp.",
              },
              {
                line: 13,
                vars: { "x (main)": "1", "y (main)": "2" },
                output: "x is 1, y is 2\n",
              },
            ],
          },
          {
            kind: "trace",
            id: "week-4-lecture-p4-swap-pointer",
            caption: "Now pass addresses and watch swap reach into main's frame.",
            language: "c",
            code: `void swap(int *a, int *b)
{
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void)
{
    int x = 1;
    int y = 2;
    swap(&x, &y);
    printf("x is %i, y is %i\\n", x, y);
}`,
            steps: [
              { line: 10, vars: { "x (main, at 0x123)": "1" } },
              { line: 11, vars: { "x (main, at 0x123)": "1", "y (main, at 0x127)": "2" } },
              {
                line: 1,
                vars: {
                  "x (main, at 0x123)": "1",
                  "y (main, at 0x127)": "2",
                  "a (swap)": "0x123",
                  "b (swap)": "0x127",
                },
                note: "swap still gets copies, but they are copies of the addresses.",
              },
              {
                line: 3,
                vars: {
                  "x (main, at 0x123)": "1",
                  "y (main, at 0x127)": "2",
                  "a (swap)": "0x123",
                  "b (swap)": "0x127",
                  "tmp (swap)": "1",
                },
                note: "*a goes to 0x123 and reads 1.",
              },
              {
                line: 4,
                vars: {
                  "x (main, at 0x123)": "2",
                  "y (main, at 0x127)": "2",
                  "a (swap)": "0x123",
                  "b (swap)": "0x127",
                  "tmp (swap)": "1",
                },
                note: "*a = *b reads 2 from 0x127 and writes it into 0x123, which is x itself.",
              },
              {
                line: 5,
                vars: {
                  "x (main, at 0x123)": "2",
                  "y (main, at 0x127)": "1",
                  "a (swap)": "0x123",
                  "b (swap)": "0x127",
                  "tmp (swap)": "1",
                },
              },
              {
                line: 12,
                vars: { "x (main, at 0x123)": "2", "y (main, at 0x127)": "1" },
                note: "swap's frame is gone, but the changes were made in main's frame, so they stay.",
              },
              {
                line: 13,
                vars: { "x (main, at 0x123)": "2", "y (main, at 0x127)": "1" },
                output: "x is 2, y is 1\n",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-4-lecture-p4-swap-call",
            prompt: "Call the pointer version of swap so it can change x and y.",
            code: "swap(____, &y);",
            language: "c",
            options: ["&x", "x", "*x"],
            answer: 0,
            explanation:
              "swap(int *a, int *b) needs addresses. &x is the address of x. Passing x would hand over the value 1, and *x makes no sense because x is not a pointer.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p4-frames",
            prompt: "While swap runs, where are its a, b and tmp stored?",
            options: [
              "In swap's own frame on the stack, above main's frame",
              "On the heap, next to memory from malloc",
              "Inside main's frame, next to x and y",
            ],
            answer: 0,
            explanation:
              "Each function call gets a frame on the stack, and the newest call sits on top. Only memory you ask for with malloc comes from the heap.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-4-lecture-p4-recap",
        prompt: "This swap takes pointers but never uses *. main calls swap(&x, &y) with x = 1 and y = 2. What are x and y afterwards?",
        code: `void swap(int *a, int *b)
{
    int *tmp = a;
    a = b;
    b = tmp;
}`,
        language: "c",
        options: ["x is 2, y is 1", "x is 1, y is 2", "The program crashes"],
        answer: 1,
        explanation:
          "It swaps swap's own copies of the two addresses, which vanish when it returns. Nothing is ever written at those addresses, so x and y stay the same.",
      },
      exercise: {
        prompt:
          "Write a function void order(int *a, int *b) that swaps the two values only when *a is bigger than *b, so that afterwards *a is never bigger than *b. In main, get two ints, call order(&x, &y), and print them. Entering 5 then 3 should print 3 5, and 2 then 9 should print 2 9.",
        language: "c",
        starter: `#include <cs50.h>
#include <stdio.h>

void order(int *a, int *b);

int main(void)
{
    int x = get_int("x: ");
    int y = get_int("y: ");
    order(&x, &y);
    printf("%i %i\\n", x, y);
}

void order(int *a, int *b)
{
    // TODO
}`,
        hints: [
          "Compare the values, not the addresses: *a and *b, not a and b.",
          "Inside the if, do the same three steps as the working swap.",
        ],
        solution: `// order receives addresses, so writing through *a and *b changes x and y in main.
#include <cs50.h>
#include <stdio.h>

void order(int *a, int *b);

int main(void)
{
    int x = get_int("x: ");
    int y = get_int("y: ");
    order(&x, &y);
    printf("%i %i\\n", x, y);
}

void order(int *a, int *b)
{
    if (*a > *b)
    {
        int tmp = *a;
        *a = *b;
        *b = tmp;
    }
}`,
      },
      recall: [
        {
          id: "week-4-lecture-p4-r1",
          prompt: "Why does void swap(int a, int b) fail to swap x and y in main?",
          options: [
            "It receives copies of x and y and swaps only the copies",
            "It needs a return value",
            "tmp is never initialized",
          ],
          answer: 0,
          explanation:
            "Passing by value copies 1 and 2 into swap's own frame. Changing a and b does nothing to x and y.",
        },
        {
          id: "week-4-lecture-p4-r2",
          prompt: "What is a garbage value?",
          options: [
            "Whatever was left in memory you have not set yet",
            "A value that valgrind deleted",
            "The 0 that C puts in every new variable",
          ],
          answer: 0,
          explanation:
            "New memory is not cleared for you. Until you assign something, it holds leftovers from earlier use.",
        },
        {
          id: "week-4-lecture-p4-r3",
          prompt: "To let a function change your variable x, what do you pass it?",
          options: ["&x, the address of x", "x itself", "A copy of x made with malloc"],
          answer: 0,
          explanation:
            "With the address, the function can go to x's memory with * and write there. This is passing by reference.",
        },
        {
          id: "week-4-lecture-p4-r4",
          prompt: "What happens to a function's frame on the stack when the function returns?",
          options: [
            "It is removed, so its local variables are gone",
            "It stays until the program ends",
            "It moves to the heap",
          ],
          answer: 0,
          explanation:
            "Frames come and go with calls. The next call can reuse that memory, which is one source of garbage values.",
        },
      ],
    },

    "week-4-lecture-p5": {
      hook: "get_int and get_string have been doing careful work for you. This part shows what they hide: scanf needs an address to write into, a string needs memory reserved before anyone types, and a file is reached through a pointer too. You will also see what goes wrong when a program writes past the memory it owns.",
      after: {
        overflow: [
          {
            kind: "predict",
            id: "week-4-lecture-p5-stack-overflow",
            prompt: "main calls count(1). What eventually happens?",
            code: `void count(int n)
{
    printf("%i\\n", n);
    count(n + 1);
}`,
            language: "c",
            options: [
              "It prints forever without trouble",
              "Every call adds a frame to the stack until memory runs out and the program crashes",
              "It stops when n reaches the largest int",
            ],
            answer: 1,
            explanation:
              "No call ever returns, so frames pile up on the stack. When there is no room left, that is a stack overflow.",
          },
        ],
        scanf: [
          {
            kind: "trace",
            id: "week-4-lecture-p5-scanf-trace",
            caption: "Watch scanf write into n through n's address.",
            language: "c",
            code: `#include <stdio.h>

int main(void)
{
    int n;
    printf("n: ");
    scanf("%i", &n);
    printf("n: %i\\n", n);
}`,
            steps: [
              {
                line: 5,
                vars: { n: "garbage", "&n": "0x123" },
                note: "n has a place in memory but no value yet.",
              },
              { line: 6, vars: { n: "garbage", "&n": "0x123" }, output: "n: " },
              {
                line: 7,
                vars: { n: "50", "&n": "0x123" },
                output: "n: 50\n",
                note: "You type 50 and press Enter, which the terminal shows. scanf writes 50 at 0x123, which is n.",
              },
              { line: 8, vars: { n: "50", "&n": "0x123" }, output: "n: 50\nn: 50\n" },
            ],
          },
          {
            kind: "blank",
            id: "week-4-lecture-p5-scanf-amp",
            prompt: "Read an int from the user into n.",
            code: `int n;
scanf("%i", ____);`,
            language: "c",
            options: ["&n", "n", "*n"],
            answer: 0,
            explanation:
              "scanf has to put the number somewhere, so it needs n's address. Passing n would hand it a garbage value to treat as an address.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p5-scanf-fit",
            prompt: "With char s[4]; and scanf(\"%s\", s);, what is the longest word that is guaranteed to fit?",
            options: [
              "3 letters, like cat",
              "4 letters, like cats",
              "Any length, because scanf makes room",
            ],
            answer: 0,
            explanation:
              "Four bytes hold three letters plus the \\0. A longer word writes past the array into memory you do not own, and scanf never checks.",
          },
          {
            kind: "predict",
            id: "week-4-lecture-p5-array-name",
            prompt: "Why does scanf(\"%s\", s) need no & when s is declared as char s[4]?",
            options: [
              "An array's name already acts as the address of its first byte",
              "%s ignores the address it is given",
              "Strings are always passed by value",
            ],
            answer: 0,
            explanation:
              "s used on its own gives the address where the array starts, which is what scanf needs. An int like n is a value, so it needs &n.",
          },
        ],
        "file-io": [
          {
            kind: "predict",
            id: "week-4-lecture-p5-append",
            prompt:
              "phonebook.c opens phonebook.csv with \"a\". The file starts empty and you run the program twice, entering a different person each time. How many lines does the file have?",
            options: ["2", "1", "0"],
            answer: 0,
            explanation:
              "\"a\" means append, so each run adds a line at the end. With \"w\" each run would erase the file first, leaving only 1 line.",
          },
          {
            kind: "compare",
            id: "week-4-lecture-p5-fopen-null",
            prompt: "Which version is safer?",
            language: "c",
            a: {
              label: "Use the file right away",
              code: `FILE *file = fopen("phonebook.csv", "a");
fprintf(file, "%s,%s\\n", name, number);
fclose(file);`,
            },
            b: {
              label: "Check for NULL first",
              code: `FILE *file = fopen("phonebook.csv", "a");
if (file == NULL)
{
    return 1;
}
fprintf(file, "%s,%s\\n", name, number);
fclose(file);`,
            },
            answer: "b",
            explanation:
              "fopen returns NULL when it cannot open the file. Version a would then hand NULL to fprintf, which can crash. Version b stops cleanly.",
          },
          {
            kind: "trace",
            id: "week-4-lecture-p5-cp-trace",
            caption: "Copy a two-byte file with fread and fwrite, one byte per loop.",
            language: "c",
            code: `typedef unsigned char BYTE;

int main(int argc, char *argv[])
{
    FILE *src = fopen(argv[1], "rb");
    FILE *dst = fopen(argv[2], "wb");
    BYTE b;
    while (fread(&b, sizeof(b), 1, src) != 0)
    {
        fwrite(&b, sizeof(b), 1, dst);
    }
    fclose(dst);
    fclose(src);
}`,
            steps: [
              {
                line: 5,
                vars: { src: "0x5a0" },
                note: "You run ./cp hi.txt copy.txt, and hi.txt holds the two bytes H and i. fopen returns a FILE * for hi.txt.",
              },
              {
                line: 6,
                vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "(empty)" },
                note: "\"wb\" creates copy.txt, or empties it if it already exists.",
              },
              { line: 7, vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "(empty)", b: "garbage" } },
              {
                line: 8,
                vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "(empty)", b: "'H' (0x48)" },
                note: "fread copies 1 byte into the memory at &b and returns 1, so the loop body runs.",
              },
              { line: 10, vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "H", b: "'H' (0x48)" } },
              { line: 8, vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "H", b: "'i' (0x69)" } },
              { line: 10, vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "Hi", b: "'i' (0x69)" } },
              {
                line: 8,
                vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "Hi", b: "'i' (0x69)" },
                note: "No bytes are left. fread returns 0 and the loop ends.",
              },
              {
                line: 12,
                vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "Hi", b: "'i' (0x69)" },
                note: "Closing dst makes sure every byte is saved to copy.txt.",
              },
              { line: 13, vars: { src: "0x5a0", dst: "0x7b0", "copy.txt": "Hi", b: "'i' (0x69)" } },
            ],
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-4-lecture-p5-recap",
        prompt: "Which line reads an int into n correctly?",
        options: [
          "scanf(\"%i\", &n);",
          "scanf(\"%i\", n);",
          "scanf(\"%i\", *n);",
        ],
        answer: 0,
        explanation:
          "scanf writes the number into memory, so it needs the address of n. Like swap, it can only change your variable if you hand it &n.",
      },
      exercise: {
        prompt:
          "Write size.c that takes a file name at the command line, counts how many bytes the file holds by reading it one BYTE at a time with fread, and prints the count. After printf \"hello\" > test.txt, running ./size test.txt should print 5 bytes, and a file that does not exist should make it return 1.",
        language: "c",
        starter: `#include <stdio.h>

typedef unsigned char BYTE;

int main(int argc, char *argv[])
{
    if (argc != 2)
    {
        printf("Usage: ./size FILE\\n");
        return 1;
    }

    // TODO: open argv[1] for reading, and return 1 if that fails
    // TODO: count the bytes with fread, one BYTE at a time
    // TODO: print the count, then close the file
}`,
        hints: [
          "Open with fopen(argv[1], \"rb\") and compare the result to NULL.",
          "The cp.c loop from the notes reads one byte per pass. Count passes instead of writing.",
          "fread returns 0 once there is nothing left to read.",
        ],
        solution: `// Each pass of the loop reads exactly one byte, so the number of passes is the file's size.
#include <stdio.h>

typedef unsigned char BYTE;

int main(int argc, char *argv[])
{
    if (argc != 2)
    {
        printf("Usage: ./size FILE\\n");
        return 1;
    }

    FILE *file = fopen(argv[1], "rb");
    if (file == NULL)
    {
        return 1;
    }

    int count = 0;
    BYTE b;
    while (fread(&b, sizeof(b), 1, file) != 0)
    {
        count++;
    }

    printf("%i bytes\\n", count);
    fclose(file);
    return 0;
}`,
      },
      recall: [
        {
          id: "week-4-lecture-p5-r1",
          prompt: "What is a stack overflow?",
          options: [
            "Too many function calls fill up the memory set aside for the stack",
            "Writing past the end of a block you got from malloc",
            "Storing a number too big for an int",
          ],
          answer: 0,
          explanation:
            "Each call adds a frame. Endless recursion keeps adding frames until the stack runs out. Writing past a malloc block is a heap overflow.",
        },
        {
          id: "week-4-lecture-p5-r2",
          prompt: "Why is char s[4]; scanf(\"%s\", s); unsafe?",
          options: [
            "The user can type more than 3 characters, and scanf will write past the array",
            "scanf cannot read into arrays",
            "s needs an & in front of it",
          ],
          answer: 0,
          explanation:
            "You do not know in advance how long the input will be, so any fixed size can be overrun. That is the problem get_string solves for you.",
        },
        {
          id: "week-4-lecture-p5-r3",
          prompt: "What does fopen return if it cannot open the file?",
          options: ["NULL", "An empty file", "0 bytes"],
          answer: 0,
          explanation:
            "fopen returns a FILE * pointer, and NULL means it failed. Check for it before calling fprintf, fread or fwrite.",
        },
        {
          id: "week-4-lecture-p5-r4",
          prompt: "In while (fread(&b, sizeof(b), 1, src) != 0), when does the loop stop?",
          options: [
            "When fread returns 0 because no bytes are left",
            "When b is 0",
            "After one byte",
          ],
          answer: 0,
          explanation:
            "fread returns how many items it read. At the end of the file it reads none and returns 0.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-4-section-r1",
        prompt: "What is a after these lines run?",
        code: `int a = 3;
int *b = &a;
*b = 25;`,
        options: ["25", "3", "The address of a"],
        answer: 0,
        explanation:
          "b holds a's address, so *b = 25 writes 25 into a. b itself still holds the address.",
      },
      {
        id: "week-4-section-r2",
        prompt: "A concatenate function joins \"hi\" and \"there\" into new memory from malloc. How many bytes should it ask for?",
        options: ["8", "7", "6"],
        answer: 0,
        explanation:
          "2 letters plus 5 letters is 7, and one more byte holds the \\0 that ends the joined string.",
      },
      {
        id: "week-4-section-r3",
        prompt:
          "A program mallocs strlen(name) bytes for a file name, copies the name in, opens the file, and returns. valgrind complains. Which three fixes does it need?",
        options: [
          "Add 1 byte for the \\0, free the name, and fclose the file",
          "Use sizeof(char *), add a NULL check on argv, and print the name",
          "Use calloc, open the file with \"r\", and remove return",
        ],
        answer: 0,
        explanation:
          "The copy writes one byte past the block because of the missing \\0 space, the malloc block leaks, and the open file is never closed.",
      },
      {
        id: "week-4-section-r4",
        prompt: "What does fwrite(&c, sizeof(char), 1, output) do?",
        options: [
          "Writes one char, taken from the memory at &c, to the file output",
          "Reads one char from output into c",
          "Writes the address of c to the file as text",
        ],
        answer: 0,
        explanation:
          "fwrite takes the address of the data, the size of one item, how many items, and the file. It copies those bytes into the file.",
      },
    ],
    exercise: {
      prompt:
        "Write char *concatenate(char *s1, char *s2) that allocates exactly enough memory for both strings joined together, copies both in, and returns the new string. main should print the result and free it. hi and there should print hithere, and valgrind should report no leaks.",
      language: "c",
      starter: `#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *concatenate(char *s1, char *s2);

int main(void)
{
    char *s1 = get_string("s1: ");
    char *s2 = get_string("s2: ");
    char *s3 = concatenate(s1, s2);
    if (s3 == NULL)
    {
        return 1;
    }
    printf("%s\\n", s3);
    // TODO: free what concatenate allocated
}

char *concatenate(char *s1, char *s2)
{
    // TODO
}`,
      hints: [
        "The result needs strlen(s1) + strlen(s2) + 1 bytes.",
        "Copy s1 to the start of the new block, then copy s2 starting at index strlen(s1).",
        "If malloc returns NULL, return NULL so main can stop.",
      ],
      solution: `// strcpy copies s1 with its \\0, then copying s2 at the end overwrites that \\0
// and adds s2's own. The caller owns the block, so main frees it.
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *concatenate(char *s1, char *s2);

int main(void)
{
    char *s1 = get_string("s1: ");
    char *s2 = get_string("s2: ");
    char *s3 = concatenate(s1, s2);
    if (s3 == NULL)
    {
        return 1;
    }
    printf("%s\\n", s3);
    free(s3);
    return 0;
}

char *concatenate(char *s1, char *s2)
{
    int n1 = strlen(s1);
    char *s3 = malloc(n1 + strlen(s2) + 1);
    if (s3 == NULL)
    {
        return NULL;
    }
    strcpy(s3, s1);
    strcpy(s3 + n1, s2);
    return s3;
}`,
    },
  },

  shorts: {
    "week-4-short-magic-numbers": {
      recall: [
        {
          id: "week-4-short-magic-numbers-r1",
          prompt: "Why write #define DECKSIZE 52 instead of typing 52 throughout the program?",
          options: [
            "The name explains what 52 means, and you change it in one place",
            "It makes the program run faster",
            "C does not allow plain numbers in loops",
          ],
          answer: 0,
          explanation:
            "A bare 52 is a magic number: a reader has to guess its meaning. A named constant documents itself and is easy to update.",
        },
        {
          id: "week-4-short-magic-numbers-r2",
          prompt: "What does #define NAME REPLACEMENT do?",
          options: [
            "Before compiling, the preprocessor replaces every NAME with REPLACEMENT",
            "It creates a variable called NAME in memory",
            "It defines a function called NAME",
          ],
          answer: 0,
          explanation:
            "#define works like find and replace on your code. That is also why it takes no semicolon: a semicolon would be pasted in too.",
        },
      ],
    },
    "week-4-short-call-stacks": {
      recall: [
        {
          id: "week-4-short-call-stacks-r1",
          prompt: "fact(3) calls fact(2), which calls fact(1). Which frame is active while fact(1) runs?",
          options: ["fact(1), the one on top", "fact(3), the first one", "main's frame"],
          answer: 0,
          explanation:
            "Only the frame on top of the stack is active. The ones below wait for the calls above them to return.",
        },
        {
          id: "week-4-short-call-stacks-r2",
          prompt: "When fact(1) returns, what happens next?",
          options: [
            "Its frame is popped and fact(2) continues with the returned value",
            "The program goes straight back to main",
            "fact(1) is pushed again",
          ],
          answer: 0,
          explanation:
            "Returning removes the top frame. The frame beneath it becomes active again and picks up where it left off.",
        },
      ],
    },
    "week-4-short-hexadecimal": {
      recall: [
        {
          id: "week-4-short-hexadecimal-r1",
          prompt: "Convert the binary 1010 1111 to hexadecimal.",
          options: ["0xAF", "0xFA", "0x1015"],
          answer: 0,
          explanation:
            "Group the bits in fours from the right. 1010 is 10, which is A, and 1111 is 15, which is F.",
        },
        {
          id: "week-4-short-hexadecimal-r2",
          prompt: "In 0x397, what is the 3 worth?",
          options: ["3 times 256", "3 times 16", "3 times 100"],
          answer: 0,
          explanation:
            "The columns from the right are 1, 16 and 256. The 3 sits in the third column, the 256s.",
        },
        {
          id: "week-4-short-hexadecimal-r3",
          prompt: "What does the 0x in front of a number change about its value?",
          options: [
            "Nothing. It only tells readers the number is hexadecimal",
            "It multiplies the value by 16",
            "It makes the number negative",
          ],
          answer: 0,
          explanation:
            "0x is a label for humans and compilers, not part of the value.",
        },
      ],
    },
    "week-4-short-pointers": {
      recall: [
        {
          id: "week-4-short-pointers-r1",
          prompt: "What happens when you dereference a NULL pointer?",
          options: ["A segmentation fault", "You get 0", "Nothing happens"],
          answer: 0,
          explanation:
            "NULL points to nothing, so there is no memory to go to. The system stops the program.",
        },
        {
          id: "week-4-short-pointers-r2",
          prompt: "After int* px, py, pz;, which of the three is a pointer?",
          options: ["Only px", "All three", "None of them"],
          answer: 0,
          explanation:
            "The * belongs to each name, not to the type. You would need int *px, *py, *pz; to make all three pointers.",
        },
        {
          id: "week-4-short-pointers-r3",
          prompt: "Why pass a pointer to a function instead of a value?",
          options: [
            "So the function can change the caller's actual data",
            "Pointers make functions return faster",
            "Functions cannot take ints",
          ],
          answer: 0,
          explanation:
            "A value is copied into the function's frame. An address lets the function reach the original.",
        },
      ],
    },
    "week-4-short-defining-custom-types": {
      recall: [
        {
          id: "week-4-short-defining-custom-types-r1",
          prompt: "What does typedef unsigned char byte; do?",
          options: [
            "Makes byte another name for unsigned char",
            "Creates a variable called byte",
            "Makes a new type that is 1 bit wide",
          ],
          answer: 0,
          explanation:
            "typedef gives an existing type a new name. After this line, byte b; means the same as unsigned char b;.",
        },
        {
          id: "week-4-short-defining-custom-types-r2",
          prompt: "Why is typedef so often used with structs?",
          options: [
            "It lets you write car_t instead of struct car every time",
            "Structs do not work without typedef",
            "It makes the struct smaller",
          ],
          answer: 0,
          explanation:
            "A struct's type name is two words, struct car. typedef gives it a one-word alias, which keeps declarations short.",
        },
      ],
    },
    "week-4-short-dynamic-memory-allocation": {
      recall: [
        {
          id: "week-4-short-dynamic-memory-allocation-r1",
          prompt: "Here b came from malloc and was then freed. What happens on the last line?",
          code: `int *a;
int *b = malloc(sizeof(int));
a = b;
*b = 12;
free(b);
*a = 11;`,
          options: [
            "Undefined behavior: a points to memory that was freed",
            "The value becomes 11 safely",
            "a is set to NULL automatically",
          ],
          answer: 0,
          explanation:
            "a and b point to the same block. After free(b), neither may touch it. The write might crash or might seem to work.",
        },
        {
          id: "week-4-short-dynamic-memory-allocation-r2",
          prompt: "Which rule about free is right?",
          options: [
            "Free every block you malloc, exactly once",
            "Free every variable before main ends",
            "Freeing a block twice is a safe way to be sure",
          ],
          answer: 0,
          explanation:
            "Only memory from malloc is freed, and only once. Freeing something twice, or freeing a normal variable, is an error.",
        },
        {
          id: "week-4-short-dynamic-memory-allocation-r3",
          prompt: "Where does memory from malloc come from?",
          options: ["The heap", "The stack", "The file system"],
          answer: 0,
          explanation:
            "Variables you declare normally live on the stack. Dynamically allocated memory comes from the heap and stays until you free it.",
        },
      ],
    },
    "week-4-short-file-pointers": {
      recall: [
        {
          id: "week-4-short-file-pointers-r1",
          prompt: "What does this loop do with a file opened for reading?",
          code: `char ch;
while ((ch = fgetc(ptr)) != EOF)
{
    printf("%c", ch);
}`,
          options: [
            "Prints the file's characters one at a time until the end of the file",
            "Prints only the first character",
            "Writes the letter ch into the file",
          ],
          answer: 0,
          explanation:
            "fgetc reads the next character each time. When it returns EOF there is nothing left and the loop stops.",
        },
        {
          id: "week-4-short-file-pointers-r2",
          prompt: "You opened a file with \"r\". Which call will fail?",
          options: ["fputc('A', ptr);", "fgetc(ptr);", "fclose(ptr);"],
          answer: 0,
          explanation:
            "fputc writes, and a file opened with \"r\" is only for reading. Open with \"w\" or \"a\" to write.",
        },
        {
          id: "week-4-short-file-pointers-r3",
          prompt: "In fread(buffer, 4, 10, ptr), what are 4 and 10?",
          options: [
            "Each item is 4 bytes, and it reads 10 items",
            "It reads from byte 4 to byte 10",
            "It reads 4 items of 10 bytes each",
          ],
          answer: 0,
          explanation:
            "fread takes where to put the data, the size of one item, how many items, and the file.",
        },
      ],
    },
  },

  glossary: [
    { term: "hexadecimal", meaning: "Base 16, counting with 0 to 9 and then A to F, so each digit stands for 4 bits." },
    { term: "address", meaning: "The number that says where a byte lives in memory, usually written in hexadecimal like 0x123." },
    { term: "pointer", meaning: "A variable that stores an address, such as int *p = &n;." },
    { term: "& (address-of)", meaning: "The operator that gives the address of a variable, so &n means the address of n." },
    { term: "* (dereference)", meaning: "The operator that goes to the address stored in a pointer, so *p is the value p points at." },
    { term: "NULL", meaning: "A special address that points to nothing, returned by malloc, fopen and get_string when they fail." },
    { term: "char *", meaning: "The real type of a string: the address of its first character, with a \\0 marking the end." },
    { term: "pointer arithmetic", meaning: "Adding to an address to reach later items, so s + 1 is the address of the next char." },
    { term: "malloc", meaning: "A function that reserves a number of bytes on the heap and returns the address of the first one." },
    { term: "free", meaning: "A function that gives memory from malloc back to the system when you are done with it." },
    { term: "memory leak", meaning: "Memory you got from malloc and never freed." },
    { term: "valgrind", meaning: "A tool that runs your program and reports leaks and reads or writes outside your memory." },
    { term: "garbage value", meaning: "Whatever was left in memory you have not set yet." },
    { term: "stack", meaning: "The region of memory where each function call gets a frame for its local variables." },
    { term: "heap", meaning: "The region of memory that malloc hands out and free takes back." },
    { term: "passing by reference", meaning: "Giving a function the address of a variable so it can change the original." },
    { term: "buffer overflow", meaning: "Writing past the end of the memory set aside for something, on the stack or the heap." },
    { term: "segmentation fault", meaning: "A crash caused by touching memory your program is not allowed to use." },
    { term: "FILE *", meaning: "A pointer to an open file, returned by fopen and passed to fprintf, fread, fwrite and fclose." },
    { term: "typedef", meaning: "A way to give a type a new name, like typedef char *string;." },
  ],
};

export default content;
