import type { WeekContent } from "./types";

// String.raw keeps C escapes such as \n as typed, so code shows exactly as it would in a .c file.
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
  unitId: "week-3",
  parts: {
    "week-3-lecture-p1": {
      hook: "Is the number 50 behind one of seven locker doors? A computer cannot glance at all of them at once. It has to open doors one at a time, so the order in which it opens them decides how long the search takes. Linear search opens every door in turn. Binary search, if the numbers are sorted, throws away half of the doors with each look.",
      after: {
        welcome: [
          {
            kind: "predict",
            id: "week-3-lecture-p1-halvings",
            prompt:
              "You have a sorted list of 1,024 numbers and each step throws away half of what is left. About how many halvings until only one number remains?",
            options: ["10", "32", "512", "1,024"],
            answer: 0,
            explanation:
              "1,024 halves to 512, 256, 128, 64, 32, 16, 8, 4, 2 and 1: ten steps, because 2 to the 10th is 1,024. That is the log2 n curve on the graph. Opening every door is the n line, 1,024 steps.",
          },
        ],
        "linear-search": [
          {
            kind: "trace",
            id: "week-3-lecture-p1-linear-trace",
            caption:
              "Run linear search for 50 behind doors holding 8, 42, 50, 15, 4, 23, 16.",
            language: "pseudocode",
            code: c`For i from 0 to n-1
    If 50 is behind doors[i]
        Return true
Return false`,
            steps: carry([
              { line: 1, vars: { n: "7", i: "0" } },
              {
                line: 2,
                vars: { n: "7", i: "0" },
                note: "doors[0] holds 8. Not 50, so keep going.",
              },
              { line: 1, vars: { n: "7", i: "1" } },
              {
                line: 2,
                vars: { n: "7", i: "1" },
                note: "doors[1] holds 42. Not 50.",
              },
              { line: 1, vars: { n: "7", i: "2" } },
              {
                line: 2,
                vars: { n: "7", i: "2" },
                note: "doors[2] holds 50. Found it.",
              },
              {
                line: 3,
                vars: { n: "7", i: "2" },
                note: "Return true. The other four doors are never opened.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-3-lecture-p1-linear-worst",
            prompt:
              "Seven lockers, in no particular order. In the worst case, how many doors does linear search open to answer whether 50 is there?",
            options: ["1", "4", "7"],
            answer: 2,
            explanation:
              "If 50 is behind the last door, or behind none, every door has to be opened before the search can answer. That is n steps, where n is the number of doors. 4 is the average guess, not the worst case.",
          },
        ],
        "binary-search": [
          {
            kind: "demo",
            id: "week-3-lecture-p1-search-demo",
            demo: "search",
            caption:
              "Pick a target and step through binary search. Before each step, guess which half gets thrown away.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p1-binary-doors",
            prompt:
              "The lockers are sorted: 1, 5, 10, 20, 50, 100, 500 at doors[0] to doors[6]. Binary search looks for 50. Which values does it see, in order?",
            options: ["20, 100, 50", "1, 5, 10, 20, 50", "20, 50", "100, 50"],
            answer: 0,
            explanation:
              "The middle of doors[0] to doors[6] is doors[3], 20. 50 is bigger, so search doors[4] to doors[6], whose middle doors[5] is 100. 50 is smaller, so search doors[4] alone, which is 50. Three doors instead of five.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p1-binary-unsorted",
            prompt:
              "Someone runs binary search on the unsorted lockers 20, 500, 10, 5, 100, 1, 50, looking for 10. What happens?",
            options: [
              "It finds 10 at doors[2]",
              "It reports that 10 is not there, even though it is",
              "It sorts the doors first, then finds 10",
            ],
            answer: 1,
            explanation:
              "The middle is doors[3], 5. 10 is bigger, so it searches only doors[4] to doors[6], then sees 1 and 50 and runs out of doors. Throwing away half is only safe when the numbers are sorted.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-3-lecture-p1-recap",
        prompt:
          "Same sorted lockers: 1, 5, 10, 20, 50, 100, 500. How many doors does binary search open to find 5?",
        options: ["1", "2", "3"],
        answer: 1,
        explanation:
          "It opens the middle door, doors[3], which holds 20. 5 is smaller, so it searches doors[0] to doors[2], whose middle doors[1] holds 5. Linear search would also take two doors here; the gap only grows with bigger lists.",
      },
      exercise: {
        prompt:
          "Turn the binary search pseudocode into C. Search the sorted array for the user's number, printing Checking index X for each middle you look at, then Found at index X or Not found. For 50 it should check indexes 3, 5 and 4, then print Found at index 4. For 7 it should check 3, 1 and 2, then print Not found.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int numbers[] = {1, 5, 10, 20, 50, 100, 500};
    int target = get_int("Number: ");

    // TODO: binary search for target among these 7 sorted numbers
}`,
        hints: [
          "Keep two ints, start and end, for the first and last index still worth searching.",
          "The middle is (start + end) / 2. If the target is smaller, the new end is middle - 1; if bigger, the new start is middle + 1.",
          "\"No doors left\" means start has passed end, so loop while start <= end.",
        ],
        solution: c`#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int numbers[] = {1, 5, 10, 20, 50, 100, 500};
    int target = get_int("Number: ");

    int start = 0;
    int end = 6;
    while (start <= end)
    {
        int middle = (start + end) / 2;
        printf("Checking index %i\n", middle);
        if (numbers[middle] == target)
        {
            printf("Found at index %i\n", middle);
            return 0;
        }
        else if (target < numbers[middle])
        {
            end = middle - 1;
        }
        else
        {
            start = middle + 1;
        }
    }
    printf("Not found\n");
    return 1;
}

// Each pass rules out the middle and one half, so the range shrinks until
// the target is found or start passes end, meaning no doors are left.`,
      },
      recall: [
        {
          id: "week-3-lecture-p1-r1",
          prompt: "What must be true of the data before binary search can be used?",
          options: [
            "It must be sorted",
            "It must have an odd number of elements",
            "It must contain no duplicates",
          ],
          answer: 0,
          explanation:
            "Binary search throws away half the data after one comparison. That is only safe if everything on one side of the middle is known to be smaller and everything on the other side larger.",
        },
        {
          id: "week-3-lecture-p1-r2",
          prompt:
            "In the binary search pseudocode, what happens when 50 < doors[middle]?",
          options: [
            "Search doors[0] through doors[middle - 1]",
            "Search doors[middle + 1] through doors[n - 1]",
            "Return false",
          ],
          answer: 0,
          explanation:
            "If 50 is smaller than the middle value of a sorted list, it can only be to the left. The middle door itself has already been checked, so the range ends at middle - 1.",
        },
        {
          id: "week-3-lecture-p1-r3",
          prompt:
            "When does linear search answer false?",
          options: [
            "Only after it has looked behind every door",
            "As soon as it finds a number bigger than 50",
            "After it looks behind the middle door",
          ],
          answer: 0,
          explanation:
            "Linear search makes no assumption about order, so a bigger number tells it nothing. Only after checking all n doors can it be sure 50 is not there.",
        },
        {
          id: "week-3-lecture-p1-r4",
          prompt:
            "Doubling the number of sorted doors from 1,000 to 2,000 adds about how many steps to binary search's worst case?",
          options: ["About 1", "About 1,000", "About 2,000"],
          answer: 0,
          explanation:
            "One extra halving turns 2,000 doors back into 1,000. That is the log2 n shape: doubling the problem adds one step, while linear search's worst case doubles.",
        },
      ],
    },

    "week-3-lecture-p2": {
      hook: "Two searches can both be correct while one takes a million steps and the other twenty. Big O notation gives you words for that difference without timing anything. Then linear search becomes real C in search.c, you learn why strings need strcmp instead of ==, and you build a small phone book whose design has a weakness waiting to bite.",
      after: {
        "running-time": [
          {
            kind: "predict",
            id: "week-3-lecture-p2-drop-constants",
            prompt:
              "An algorithm looks at two pages at a time, so it takes about n/2 steps. How do computer scientists write its running time?",
            options: ["O(n/2)", "O(n)", "O(log n)", "O(2)"],
            answer: 1,
            explanation:
              "Big O drops constant factors because the shape of the curve is what matters as n grows. n/2 is still a straight line, so it is O(n). Only halving the problem each step gives O(log n).",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p2-linear-best",
            prompt:
              "What is linear search's best case, written with the Omega symbol for a lower bound?",
            options: ["Ω(1)", "Ω(n)", "Ω(log n)"],
            answer: 0,
            explanation:
              "If the target is behind the very first door, linear search stops after one step, no matter how many doors there are. Its worst case is still O(n).",
          },
        ],
        searchc: [
          {
            kind: "trace",
            id: "week-3-lecture-p2-search-trace",
            caption:
              "Inside search.c's main: the user types 10 and linear search runs.",
            language: "c",
            code: c`int numbers[] = {20, 500, 10, 5, 100, 1, 50};
int n = get_int("Number: ");
for (int i = 0; i < 7; i++)
{
    if (numbers[i] == n)
    {
        printf("Found\n");
        return 0;
    }
}
printf("Not found\n");
return 1;`,
            steps: carry([
              { line: 1, vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}" } },
              {
                line: 2,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10" },
                output: "Number: 10\n",
                note: "You type 10.",
              },
              { line: 3, vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "0" } },
              {
                line: 5,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "0" },
                note: "numbers[0] is 20. 20 == 10 is false.",
              },
              { line: 3, vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "1" } },
              {
                line: 5,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "1" },
                note: "numbers[1] is 500. False.",
              },
              { line: 3, vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "2" } },
              {
                line: 5,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "2" },
                note: "numbers[2] is 10. True.",
              },
              {
                line: 7,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "2" },
                output: "Number: 10\nFound\n",
              },
              {
                line: 8,
                vars: { numbers: "{20, 500, 10, 5, 100, 1, 50}", n: "10", i: "2" },
                note: "main returns 0, success. Lines 11 and 12 never run.",
              },
            ]),
          },
          {
            kind: "blank",
            id: "week-3-lecture-p2-strcmp-blank",
            prompt:
              "In the string version of search.c, fill the gap so the comparison checks the characters of the two strings.",
            language: "c",
            code: c`if (____(strings[i], s) == 0)
{
    printf("Found\n");
    return 0;
}`,
            options: ["strcmp", "strlen", "string"],
            answer: 0,
            explanation:
              "strcmp from string.h compares two strings character by character and returns 0 when they are the same. == cannot do that for strings, and strlen only compares lengths.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p2-off-the-end",
            prompt:
              "The strings array holds 6 words, but the loop says i < 7. You type a word that is not in the list. What can happen?",
            options: [
              "It prints Not found safely, because C checks array bounds",
              "It reads past the end of the array, which can crash with a segmentation fault",
              "The compiler refuses to build it",
            ],
            answer: 1,
            explanation:
              "C does not check bounds. On the last pass the loop touches strings[6], memory that is not part of the array, and strcmp may crash on it. The notes warn about exactly this; hard-coding the length invites it.",
          },
        ],
        phonebookc: [
          {
            kind: "predict",
            id: "week-3-lecture-p2-phonebook-case",
            prompt: "In phonebook.c, you type david at the Name: prompt. What is printed?",
            language: "c",
            code: c`string names[] = {"Kelly", "David", "John"};
string numbers[] = {"+1-617-495-1000", "+1-617-495-1000", "+1-949-468-2750"};`,
            options: ["Found +1-617-495-1000", "Not found", "Found +1-949-468-2750"],
            answer: 1,
            explanation:
              "strcmp compares exact characters, and 'd' and 'D' have different ASCII codes. \"david\" matches none of the names, so the loop ends and the program prints Not found and returns 1.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p2-phonebook-drift",
            prompt:
              "A teammate adds Ana at the front of names but her number at the end of numbers, and changes the loop to i < 4. You search for David. What is printed?",
            language: "c",
            code: c`string names[] = {"Ana", "Kelly", "David", "John"};
string numbers[] = {"+1-617-495-1000", "+1-617-495-1000", "+1-949-468-2750", "+1-617-555-0100"};`,
            options: [
              "Found +1-617-495-1000",
              "Found +1-949-468-2750",
              "Not found",
            ],
            answer: 1,
            explanation:
              "David is now names[2], and the program prints numbers[2], which is John's number. The two arrays are linked only by position, so one misplaced entry pairs every later name with the wrong number, and nothing warns you.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-3-lecture-p2-recap",
        prompt:
          "search.c again, with numbers 20, 500, 10, 5, 100, 1, 50. You type 7. How many times does numbers[i] == n run before Not found is printed?",
        options: ["1", "6", "7", "8"],
        answer: 2,
        explanation:
          "7 is not in the array, so every one of the 7 elements is compared: i goes from 0 to 6. When i becomes 7 the loop condition fails and no comparison happens. That is linear search's worst case.",
      },
      exercise: {
        prompt:
          "Complete count.c so it prints how many times the typed name appears in names. Typing David should print 3, Kelly should print 1, and Brian should print 0. Exit with status 0 if the name appeared at least once and 1 if not, and check that with echo $?.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>
#include <string.h>

const int N = 6;

int main(void)
{
    string names[] = {"Kelly", "David", "John", "David", "Carter", "David"};
    string name = get_string("Name: ");

    // TODO: count the matches, print the count, then return 0 or 1
}`,
        hints: [
          "This is linear search that does not stop at the first match.",
          "Compare with strcmp(names[i], name) == 0, never ==.",
          "Decide the exit status after the loop, once you know the count.",
        ],
        solution: c`#include <cs50.h>
#include <stdio.h>
#include <string.h>

const int N = 6;

int main(void)
{
    string names[] = {"Kelly", "David", "John", "David", "Carter", "David"};
    string name = get_string("Name: ");

    int count = 0;
    for (int i = 0; i < N; i++)
    {
        if (strcmp(names[i], name) == 0)
        {
            count++;
        }
    }
    printf("%i\n", count);

    if (count == 0)
    {
        return 1;
    }
    return 0;
}

// Unlike search.c, the loop never returns early, so it visits all N names.`,
      },
      recall: [
        {
          id: "week-3-lecture-p2-r1",
          prompt: "Why does search.c use strcmp instead of == to compare strings?",
          options: [
            "== does not compare strings character by character in C",
            "== only works on numbers bigger than 0",
            "strcmp is faster than == for ints",
          ],
          answer: 0,
          explanation:
            "To check whether two strings hold the same characters you need strcmp, which returns 0 when they match. Using == on strings gives wrong answers even when the words look identical.",
        },
        {
          id: "week-3-lecture-p2-r2",
          prompt: "Which running time grows most slowly as n gets large?",
          options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
          answer: 3,
          explanation:
            "Of these, O(log n) grows slowest: doubling n adds about one step. O(n²) grows fastest. O(1), constant time, would beat all of them.",
        },
        {
          id: "week-3-lecture-p2-r3",
          prompt: "What does it mean when an algorithm is Θ(n)?",
          options: [
            "Its best case and worst case are both on the order of n",
            "It always takes exactly n steps",
            "It is faster than O(n)",
          ],
          answer: 0,
          explanation:
            "Θ is used when the upper bound (O) and lower bound (Ω) are the same. It describes the shape of the growth, not an exact count of steps.",
        },
        {
          id: "week-3-lecture-p2-r4",
          prompt:
            "search.c ends with return 1 after printing Not found. Why?",
          options: [
            "A non-zero exit status signals that the search failed",
            "It tells main to try the search once more",
            "It returns the index where the number was found",
          ],
          answer: 0,
          explanation:
            "main's return value is the exit status: 0 for success and non-zero for failure. Other programs, or you with echo $?, can check it.",
        },
      ],
    },

    "week-3-lecture-p3": {
      hook: "Keeping names in one array and numbers in another works until the two lists drift out of step. A struct bundles a name and a number into one new type called person. Then the question shifts: binary search needs sorted data, so how do you sort? Selection sort and bubble sort are two answers, and you will step through every pass of each.",
      after: {
        structs: [
          {
            kind: "predict",
            id: "week-3-lecture-p3-struct-access",
            prompt:
              "After phonebook.c fills in people as in the notes, what does this print?",
            language: "c",
            code: c`people[0].name = "Kelly";
people[0].number = "+1-617-495-1000";
people[1].name = "David";
people[1].number = "+1-617-495-1000";
people[2].name = "John";
people[2].number = "+1-949-468-2750";

printf("%s\n", people[2].number);`,
            options: ["+1-949-468-2750", "John", "+1-617-495-1000"],
            answer: 0,
            explanation:
              "people[2] is the third person, John, and .number picks that person's number field. .name would have printed John.",
          },
          {
            kind: "blank",
            id: "week-3-lecture-p3-dot-blank",
            prompt:
              "Fill the gap so a successful search prints the person's phone number.",
            language: "c",
            code: c`if (strcmp(people[i].name, name) == 0)
{
    printf("Found %s\n", people[i]____);
    return 0;
}`,
            options: [".number", "[number]", ".name"],
            answer: 0,
            explanation:
              "Dot notation reaches a field inside a struct, so people[i].number is that person's number. Square brackets index arrays, not fields, and .name would print the name you just typed.",
          },
          {
            kind: "compare",
            id: "week-3-lecture-p3-struct-compare",
            prompt: "Both store the same phone book. Which is better designed?",
            language: "c",
            a: {
              label: "Two parallel arrays",
              code: c`string names[] = {"Kelly", "David", "John"};
string numbers[] = {"+1-617-495-1000", "+1-617-495-1000", "+1-949-468-2750"};`,
            },
            b: {
              label: "One array of person",
              code: c`person people[3];
people[0].name = "Kelly";
people[0].number = "+1-617-495-1000";
// ...and the same for people[1] and people[2]`,
            },
            answer: "b",
            explanation:
              "With parallel arrays, a name and its number are linked only by sharing an index, so one edit to one array can pair every later name with the wrong number. A person keeps each name and number together, even if it takes more lines.",
          },
        ],
        "sorting-and-selection-sort": [
          {
            kind: "trace",
            id: "week-3-lecture-p3-selection-trace",
            caption:
              "Selection sort on 4, 6, 1, 3: find the smallest, swap it to the front, repeat.",
            language: "pseudocode",
            code: c`For i from 0 to n-1
    Find smallest number between numbers[i] and numbers[n-1]
    Swap smallest number with numbers[i]`,
            steps: carry([
              { line: 1, vars: { numbers: "[4, 6, 1, 3]", n: "4", i: "0" } },
              {
                line: 2,
                vars: { numbers: "[4, 6, 1, 3]", n: "4", i: "0", smallest: "1 at [2]" },
                note: "Looks at 4, 6, 1 and 3.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 6, 4, 3]", n: "4", i: "0", smallest: "1 at [2]" },
                note: "1 and 4 trade places. numbers[0] is now final.",
              },
              { line: 1, vars: { numbers: "[1, 6, 4, 3]", n: "4", i: "1" } },
              {
                line: 2,
                vars: { numbers: "[1, 6, 4, 3]", n: "4", i: "1", smallest: "3 at [3]" },
                note: "Looks only at 6, 4 and 3.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "1", smallest: "3 at [3]" },
                note: "3 and 6 trade places.",
              },
              { line: 1, vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "2" } },
              {
                line: 2,
                vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "2", smallest: "4 at [2]" },
                note: "Looks at 4 and 6. The list is sorted now, but the algorithm cannot know that.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "2", smallest: "4 at [2]" },
                note: "4 is already at numbers[2], so it swaps with itself.",
              },
              { line: 1, vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "3" } },
              {
                line: 2,
                vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "3", smallest: "6 at [3]" },
                note: "Only one number is left.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 3, 4, 6]", n: "4", i: "3", smallest: "6 at [3]" },
                note: "Done. Each pass looked at one fewer number: 4, then 3, 2, 1.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-3-lecture-p3-selection-sorted",
            prompt:
              "Selection sort is handed 1, 2, 3, 4, which is already sorted. Does it finish with less work than on 4, 6, 1, 3?",
            options: [
              "Yes, it notices after one pass and stops",
              "No, it still searches for the smallest number on every pass",
              "Yes, it skips straight to the end",
            ],
            answer: 1,
            explanation:
              "Selection sort can only know a number is the smallest by looking at every remaining number, and nothing in it checks whether the list is already sorted. Its best case is the same as its worst: Ω(n²) and O(n²).",
          },
        ],
        "bubble-sort": [
          {
            kind: "trace",
            id: "week-3-lecture-p3-bubble-trace",
            caption:
              "Bubble sort on 3, 1, 2: swap neighbours that are out of order, and stop after a pass with no swaps.",
            language: "pseudocode",
            code: c`Repeat n-1 times
    For i from 0 to n-2
        If numbers[i] and numbers[i+1] out of order
            Swap them
    If no swaps
        Quit`,
            steps: carry([
              {
                line: 1,
                vars: { numbers: "[3, 1, 2]", n: "3", pass: "1", swaps: "0" },
                note: "n-1 is 2, so at most two passes. i will run from 0 to n-2, which is 1.",
              },
              {
                line: 3,
                vars: { numbers: "[3, 1, 2]", n: "3", pass: "1", swaps: "0", i: "0" },
                note: "Line 2 set i to 0. Compare 3 and 1: out of order.",
              },
              {
                line: 4,
                vars: { numbers: "[1, 3, 2]", n: "3", pass: "1", swaps: "1", i: "0" },
              },
              {
                line: 3,
                vars: { numbers: "[1, 3, 2]", n: "3", pass: "1", swaps: "1", i: "1" },
                note: "Line 2 set i to 1. Compare 3 and 2: out of order.",
              },
              {
                line: 4,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "1", swaps: "2", i: "1" },
                note: "The largest number, 3, has bubbled to the end.",
              },
              {
                line: 5,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "1", swaps: "2" },
                note: "There were swaps, so no quitting yet.",
              },
              {
                line: 1,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "2", swaps: "0" },
                note: "The list happens to be sorted, but the algorithm has not proved it yet.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "2", swaps: "0", i: "0" },
                note: "1 and 2 are in order.",
              },
              {
                line: 3,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "2", swaps: "0", i: "1" },
                note: "2 and 3 are in order.",
              },
              {
                line: 5,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "2", swaps: "0" },
                note: "A whole pass with no swaps proves every neighbour is in order.",
              },
              {
                line: 6,
                vars: { numbers: "[1, 2, 3]", n: "3", pass: "2", swaps: "0" },
                note: "Quit. Sorted.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-3-lecture-p3-bubble-first-pass",
            prompt:
              "Bubble sort makes its first pass over 5, 2, 1, 3, 6, 4. What does the list look like after that one pass?",
            options: [
              "2, 1, 3, 5, 4, 6",
              "1, 2, 3, 4, 5, 6",
              "1, 2, 5, 3, 6, 4",
            ],
            answer: 0,
            explanation:
              "5 swaps past 2, 1 and 3, stops at 6, and then 6 swaps past 4: 2, 1, 3, 5, 4, 6. One pass only guarantees the largest number reaches the end. 1, 2, 5, 3, 6, 4 is what one pass of selection sort would give.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p3-bubble-sorted",
            prompt:
              "The notes' bubble sort quits after a pass that makes no swaps. It is handed 1, 2, 3, 4, 5, which is already sorted. How many passes does it make?",
            options: ["1", "4", "5"],
            answer: 0,
            explanation:
              "The first pass compares each neighbouring pair, makes no swaps, and quits. That is about n steps, which is why bubble sort's best case is Ω(n) while selection sort's is Ω(n²).",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-3-lecture-p3-recap",
        prompt:
          "Both sorts are given a list that is already sorted. Which one does less work?",
        options: ["Selection sort", "Bubble sort", "They do the same work"],
        answer: 1,
        explanation:
          "Bubble sort's \"if no swaps, quit\" lets it stop after one pass. Selection sort has no such check and always makes all its passes. On unsorted data both are O(n²).",
      },
      exercise: {
        prompt:
          "Turn the selection sort pseudocode into C. Sort numbers from smallest to largest, calling print_array after each pass so you can watch it work. The first line printed should be 1 2 7 4 5 6 and the last should be 1 2 4 5 6 7.",
        language: "c",
        starter: c`#include <stdio.h>

const int N = 6;

void print_array(int length, int array[]);

int main(void)
{
    int numbers[] = {5, 2, 7, 4, 1, 6};

    // TODO: selection sort, calling print_array(N, numbers) after each pass
}

void print_array(int length, int array[])
{
    for (int i = 0; i < length; i++)
    {
        printf("%i ", array[i]);
    }
    printf("\n");
}`,
        hints: [
          "You need two loops: an outer one for each position i, and an inner one that looks for the smallest number from i to the end.",
          "Remember the smallest number's index, not just its value, so you know where to swap from.",
          "A swap needs a third variable to hold one value while the other is copied over it.",
        ],
        solution: c`int main(void)
{
    int numbers[] = {5, 2, 7, 4, 1, 6};

    for (int i = 0; i < N - 1; i++)
    {
        int smallest = i;
        for (int j = i + 1; j < N; j++)
        {
            if (numbers[j] < numbers[smallest])
            {
                smallest = j;
            }
        }
        int temp = numbers[i];
        numbers[i] = numbers[smallest];
        numbers[smallest] = temp;
        print_array(N, numbers);
    }
}

// The outer loop stops at N - 2 because the last number is in place once the rest are.
// That prints five lines: 1 2 7 4 5 6, 1 2 7 4 5 6, 1 2 4 7 5 6, 1 2 4 5 7 6, 1 2 4 5 6 7.`,
      },
      recall: [
        {
          id: "week-3-lecture-p3-r1",
          prompt: "What does typedef struct { string name; string number; } person; do?",
          options: [
            "Creates a new type called person that holds a name and a number together",
            "Creates one variable called person",
            "Creates an array of names and numbers",
          ],
          answer: 0,
          explanation:
            "It defines a type, like int or string. You then declare variables of that type, such as person people[3], and reach the fields with dot notation.",
        },
        {
          id: "week-3-lecture-p3-r2",
          prompt: "What are selection sort's worst and best cases?",
          options: [
            "O(n²) and Ω(n²)",
            "O(n²) and Ω(n)",
            "O(n log n) and Ω(n log n)",
          ],
          answer: 0,
          explanation:
            "Selection sort does (n - 1) + (n - 2) + ... + 1 comparisons whatever the input, which is about n²/2. Sorted input saves nothing.",
        },
        {
          id: "week-3-lecture-p3-r3",
          prompt:
            "After the first pass of bubble sort, what is guaranteed?",
          options: [
            "The largest number is at the end",
            "The smallest number is at the front",
            "The whole list is sorted",
          ],
          answer: 0,
          explanation:
            "Each swap carries the larger value right, so the largest number bubbles all the way to the end. Selection sort is the one that fixes the front first.",
        },
        {
          id: "week-3-lecture-p3-r4",
          prompt: "Why is bubble sort's best case Ω(n) rather than Ω(n²)?",
          options: [
            "On sorted input, one pass with no swaps lets it quit",
            "It skips every second pair",
            "It uses binary search to find where numbers go",
          ],
          answer: 0,
          explanation:
            "One pass compares n - 1 pairs. If none are swapped the list must be sorted, so it can stop after about n steps.",
        },
      ],
    },

    "week-3-lecture-p4": {
      hook: "Selection sort and bubble sort both slow down to about n squared steps on big lists. Doing better takes a new idea: a function that calls itself on a smaller version of the same problem. That is recursion. You will watch it draw a pyramid, then drive merge sort, which splits a list in half again and again until every piece is already sorted.",
      after: {
        recursion: [
          {
            kind: "trace",
            id: "week-3-lecture-p4-draw-trace",
            caption:
              "Follow draw(2) from recursion.c as it calls itself, then builds the pyramid on the way back.",
            language: "c",
            code: c`void draw(int n)
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
}`,
            steps: carry([
              {
                line: 3,
                vars: { n: "2" },
                note: "draw(2) starts. 2 <= 0 is false.",
              },
              {
                line: 7,
                vars: { n: "2" },
                note: "draw(2) pauses here and calls draw(1).",
              },
              {
                line: 3,
                vars: { n: "1" },
                note: "Inside draw(1), with its own n. draw(2) is still waiting at line 7.",
              },
              {
                line: 7,
                vars: { n: "1" },
                note: "draw(1) pauses and calls draw(0).",
              },
              {
                line: 3,
                vars: { n: "0" },
                note: "Inside draw(0). 0 <= 0 is true: the base case.",
              },
              {
                line: 5,
                vars: { n: "0" },
                note: "draw(0) returns without printing. draw(1) resumes after line 7.",
              },
              {
                line: 10,
                vars: { n: "1", i: "0" },
                output: "#",
                note: "draw(1) prints its row of width 1.",
              },
              {
                line: 12,
                vars: { n: "1" },
                output: "#\n",
                note: "draw(1) is done and returns. draw(2) resumes after line 7.",
              },
              { line: 10, vars: { n: "2", i: "0" }, output: "#\n#" },
              { line: 10, vars: { n: "2", i: "1" }, output: "#\n##" },
              {
                line: 12,
                vars: { n: "2" },
                output: "#\n##\n",
                note: "draw(2) finishes. The smaller pyramid was drawn first, then one more row.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-3-lecture-p4-draw-three",
            prompt: "In the notes' recursive draw, the function calls draw(n - 1) first and then prints its own row of n hashes. What does draw(3) print?",
            options: [
              "#, then ##, then ###, one row per line",
              "###, then ##, then #, one row per line",
              "### on a single line",
            ],
            answer: 0,
            explanation:
              "draw(3) first calls draw(2), which prints the two-row pyramid, and only then prints its own row of 3. Because the recursive call comes before the loop, the short rows come out first.",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p4-bad-base",
            prompt:
              "Someone changes the base case to if (n == 0) and calls draw(-1). What happens?",
            options: [
              "It returns at once and prints nothing",
              "It keeps calling draw(-2), draw(-3) and so on, until the program crashes",
              "It prints one #",
            ],
            answer: 1,
            explanation:
              "Subtracting 1 from -1 moves away from 0, so n == 0 never becomes true and the calls pile up until memory runs out. The notes' n <= 0 catches negative numbers too.",
          },
          {
            kind: "blank",
            id: "week-3-lecture-p4-factorial-blank",
            prompt:
              "Factorial: 4! is 4 × 3 × 2 × 1, and 0! is 1. Fill the gap to make the recursive case.",
            language: "c",
            code: c`int factorial(int n)
{
    if (n == 0)
    {
        return 1;
    }
    return n * ____;
}`,
            options: ["factorial(n - 1)", "factorial(n)", "(n - 1)"],
            answer: 0,
            explanation:
              "n! is n times (n - 1)!, a smaller version of the same problem that moves toward the base case. factorial(n) would call itself with the same n forever, and (n - 1) alone only multiplies two numbers.",
          },
        ],
        "merge-sort": [
          {
            kind: "trace",
            id: "week-3-lecture-p4-merge-trace",
            caption:
              "Merge sort on 6 3 4 1, the notes' example, one recursive call at a time.",
            language: "pseudocode",
            code: c`If only one number
    Quit
Else
    Sort left half of numbers
    Sort right half of numbers
    Merge sorted halves`,
            steps: carry([
              {
                line: 1,
                vars: { numbers: "6 3 | 4 1", sorting: "6 3 4 1" },
                note: "Four numbers, not one, so go to Else.",
              },
              {
                line: 4,
                vars: { numbers: "6 3 | 4 1", sorting: "6 3" },
                note: "Sort the left half. This is a new call of merge sort on 6 3.",
              },
              {
                line: 4,
                vars: { numbers: "6 | 3 | 4 1", sorting: "6" },
                note: "6 3 is not one number either, so sort its left half, 6.",
              },
              {
                line: 2,
                vars: { numbers: "6 | 3 | 4 1", sorting: "6" },
                note: "One number is already sorted. Quit and return to sorting 6 3.",
              },
              {
                line: 5,
                vars: { numbers: "6 | 3 | 4 1", sorting: "3" },
                note: "Sort the right half, 3. One number, so it quits at once.",
              },
              {
                line: 6,
                vars: { numbers: "3 6 | 4 1", sorting: "6 3" },
                note: "Merge 6 and 3: 3 is smaller, so it goes first.",
              },
              {
                line: 5,
                vars: { numbers: "3 6 | 4 1", sorting: "4 1" },
                note: "Back in the first call. Its left half is done, so sort the right half, 4 1.",
              },
              {
                line: 4,
                vars: { numbers: "3 6 | 4 | 1", sorting: "4" },
                note: "Left half 4 is one number: quit.",
              },
              {
                line: 5,
                vars: { numbers: "3 6 | 4 | 1", sorting: "1" },
                note: "Right half 1 is one number: quit.",
              },
              {
                line: 6,
                vars: { numbers: "3 6 | 1 4", sorting: "4 1" },
                note: "Merge 4 and 1 into 1 4.",
              },
              {
                line: 6,
                vars: { numbers: "1 3 4 6", sorting: "6 3 4 1" },
                note: "Merge 3 6 with 1 4 by comparing fronts: 1 vs 3 takes 1, 3 vs 4 takes 3, 6 vs 4 takes 4, then 6.",
              },
            ]),
          },
          {
            kind: "predict",
            id: "week-3-lecture-p4-merge-sorted",
            prompt:
              "Merge sort is handed a list that is already sorted. What is its running time?",
            options: [
              "Still about n log n: it splits and merges everything anyway",
              "About n: it notices the order and stops early",
              "Constant: it returns the list unchanged",
            ],
            answer: 0,
            explanation:
              "Merge sort has no early exit like bubble sort's. It always halves down to single numbers and merges every level, so its best and worst cases match: Θ(n log n).",
          },
          {
            kind: "predict",
            id: "week-3-lecture-p4-merge-levels",
            prompt:
              "Merge sort splits 8 numbers in half, then in half again, until each piece is one number. How many levels of halving is that?",
            options: ["3", "4", "8"],
            answer: 0,
            explanation:
              "8 becomes 4, then 2, then 1: three levels, which is log2 of 8. Each level merges all 8 numbers, so the work is about 8 × 3 = 24 steps, against about 64 for n².",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-3-lecture-p4-recap",
        prompt: "Back to the notes' draw, with if (n <= 0). What does draw(-5) print?",
        options: ["Nothing", "#####", "It never stops calling itself"],
        answer: 0,
        explanation:
          "-5 <= 0 is true, so the base case returns at once. A base case that covers every value that should stop is what keeps recursion from running forever.",
      },
      exercise: {
        prompt:
          "Change draw in recursion.c so the pyramid comes out upside down: Height 3 should print ###, then ##, then #. Keep draw recursive with the same base case, and do not add any new loops. You know it works when Height 1 prints a single # and Height 0 prints nothing.",
        language: "c",
        starter: c`#include <cs50.h>
#include <stdio.h>

void draw(int n);

int main(void)
{
    int height = get_int("Height: ");
    draw(height);
}

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
}`,
        hints: [
          "Trace draw(2) by hand. Which row is printed first, and why?",
          "The row of width n is printed after the smaller pyramid because of where the recursive call sits.",
          "You do not need new code, only a different order.",
        ],
        solution: c`void draw(int n)
{
    if (n <= 0)
    {
        return;
    }

    for (int i = 0; i < n; i++)
    {
        printf("#");
    }
    printf("\n");

    draw(n - 1);
}

// Printing the widest row before the recursive call means each call prints its
// row first, then hands the smaller pyramid to the next call.`,
      },
      recall: [
        {
          id: "week-3-lecture-p4-r1",
          prompt: "What is a base case for?",
          options: [
            "It stops the recursion, so the function does not call itself forever",
            "It is the first call made from main",
            "It makes the problem bigger on each call",
          ],
          answer: 0,
          explanation:
            "Each recursive call should move closer to the base case, and the base case returns without calling again. Without it the calls never end.",
        },
        {
          id: "week-3-lecture-p4-r2",
          prompt: "What is merge sort's running time in the worst and best case?",
          options: [
            "O(n log n) and Ω(n log n)",
            "O(n²) and Ω(n)",
            "O(log n) and Ω(1)",
          ],
          answer: 0,
          explanation:
            "Merge sort always halves down to single numbers and merges every level, whatever the input, so it is Θ(n log n).",
        },
        {
          id: "week-3-lecture-p4-r3",
          prompt: "Merge sort merges the sorted halves 3, 6 and 1, 4. Which number is placed first?",
          options: ["1", "3", "6"],
          answer: 0,
          explanation:
            "Merging compares the front of each half and takes the smaller, so 1 beats 3. Because both halves are sorted, the front is always each half's smallest.",
        },
        {
          id: "week-3-lecture-p4-r4",
          prompt:
            "For a million numbers, why is merge sort so much faster than bubble sort's worst case?",
          options: [
            "n log n is about 20 million steps, while n² is about a trillion",
            "Merge sort skips half the numbers",
            "Bubble sort uses recursion, which is slow",
          ],
          answer: 0,
          explanation:
            "log2 of a million is about 20, so n log n is about 20 million. n² is a million times a million. The difference grows as n does.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-3-section-r1",
        prompt: "Which line prints Alice?",
        code: c`typedef struct
{
    string name;
    int votes;
} candidate;

candidate president;
president.name = "Alice";
president.votes = 10;`,
        options: [
          "printf(\"%s\\n\", president.name);",
          "printf(\"%s\\n\", candidate.name);",
          "printf(\"%s\\n\", president);",
        ],
        answer: 0,
        explanation:
          "candidate is the type and president is the variable, so the field belongs to president. Printing president alone tries to print a whole struct as a string.",
      },
      {
        id: "week-3-section-r2",
        prompt:
          "factorial(n) returns 1 when n is 0, and n * factorial(n - 1) otherwise. Which calls does factorial(3) make before the base case is reached?",
        options: [
          "factorial(2), factorial(1), factorial(0)",
          "factorial(2), factorial(1)",
          "factorial(4), factorial(5), and so on",
        ],
        answer: 0,
        explanation:
          "Each call subtracts 1 until n is 0, which returns 1. The answers then multiply back up: 1, 1, 2, and finally 3 × 2 = 6.",
      },
      {
        id: "week-3-section-r3",
        prompt:
          "fib(0) is 0, fib(1) is 1, and fib(n) is fib(n - 1) + fib(n - 2). What is fib(5)?",
        options: ["3", "5", "8"],
        answer: 1,
        explanation:
          "The sequence goes 0, 1, 1, 2, 3, 5 for n = 0 to 5. This recursive case makes two smaller calls, so it needs two base cases.",
      },
      {
        id: "week-3-section-r4",
        prompt: "Which sort has the best lower bound when the input is already sorted?",
        options: ["Bubble sort, Ω(n)", "Selection sort, Ω(n²)", "Merge sort, Ω(n log n)"],
        answer: 0,
        explanation:
          "Bubble sort can quit after one pass with no swaps. Selection and merge sort do the same amount of work whatever the order of the input.",
      },
    ],
    exercise: {
      prompt:
        "Write a recursive function power that returns base raised to exponent, for any exponent of 0 or more, without using a loop. Base 2 and exponent 10 should print 1024, base 3 and exponent 0 should print 1, and base 5 and exponent 3 should print 125.",
      language: "c",
      starter: c`#include <cs50.h>
#include <stdio.h>

int power(int base, int exponent);

int main(void)
{
    int base = get_int("Base: ");
    int exponent = get_int("Exponent: ");
    printf("%i\n", power(base, exponent));
}

int power(int base, int exponent)
{
    // TODO: a base case and a recursive case
}`,
      hints: [
        "What is any number to the power 0? That is your base case.",
        "2 to the 10th is 2 times (2 to the 9th). Which call is the smaller problem?",
        "Each recursive call should lower exponent by 1.",
      ],
      solution: c`int power(int base, int exponent)
{
    if (exponent == 0)
    {
        return 1;
    }
    return base * power(base, exponent - 1);
}

// Each call peels off one factor of base until exponent reaches 0, which returns 1.`,
    },
  },

  shorts: {
    "week-3-short-linear-search": {
      recall: [
        {
          id: "week-3-short-linear-search-r1",
          prompt: "What are linear search's worst and best cases?",
          options: ["O(n) and Ω(1)", "O(log n) and Ω(1)", "O(n) and Ω(n)"],
          answer: 0,
          explanation:
            "In the worst case the target is last or missing, so all n elements are checked. In the best case it is first, so the search stops after one check.",
        },
        {
          id: "week-3-short-linear-search-r2",
          prompt:
            "Linear search looks for 50 and it is not in the array. Did the algorithm fail?",
          options: [
            "No: it checked every element and correctly concluded 50 is absent",
            "Yes: linear search only works when the target is present",
            "Yes: it should have stopped halfway",
          ],
          answer: 0,
          explanation:
            "Answering \"not there\" after an exhaustive check is a correct result. It just costs the full n steps.",
        },
      ],
    },
    "week-3-short-binary-search": {
      recall: [
        {
          id: "week-3-short-binary-search-r1",
          prompt:
            "Searching a sorted 15-element array for 19: start is 0, end is 14, and the middle element, at index 7, is 15. What happens next?",
          options: [
            "start becomes 8 and end stays 14",
            "end becomes 6 and start stays 0",
            "start becomes 7",
          ],
          answer: 0,
          explanation:
            "19 is greater than 15, so it can only be to the right of the middle. The middle itself is ruled out, so the new start is 7 + 1 = 8.",
        },
        {
          id: "week-3-short-binary-search-r2",
          prompt: "When can binary search conclude that the target is not in the array?",
          options: [
            "When start becomes greater than end",
            "When start equals end",
            "When the middle element is bigger than the target",
          ],
          answer: 0,
          explanation:
            "start equal to end still leaves one element to check. Only when they cross is the remaining sub-array empty.",
        },
        {
          id: "week-3-short-binary-search-r3",
          prompt: "What are binary search's worst and best cases?",
          options: ["O(log n) and Ω(1)", "O(n) and Ω(log n)", "O(log n) and Ω(log n)"],
          answer: 0,
          explanation:
            "In the worst case it halves the array about log n times. In the best case the very first middle is the target.",
        },
      ],
    },
    "week-3-short-bubble-sort": {
      recall: [
        {
          id: "week-3-short-bubble-sort-r1",
          prompt: "What is the swap counter in bubble sort for?",
          options: [
            "If a full pass ends with it at 0, the array must be sorted and the algorithm stops",
            "It counts how many passes are left",
            "It holds the largest value seen so far",
          ],
          answer: 0,
          explanation:
            "A pass with no swaps means every adjacent pair was already in order, so the whole array is sorted. That early exit gives the Ω(n) best case.",
        },
        {
          id: "week-3-short-bubble-sort-r2",
          prompt: "What input gives bubble sort its worst case?",
          options: [
            "An array in completely reverse order",
            "An array that is already sorted",
            "An array where every value is the same",
          ],
          answer: 0,
          explanation:
            "In reverse order every large element must bubble across the whole array, so about n passes of about n comparisons each: O(n²).",
        },
      ],
    },
    "week-3-short-selection-sort": {
      recall: [
        {
          id: "week-3-short-selection-sort-r1",
          prompt:
            "Selection sort makes one pass over 5, 2, 1, 3, 6, 4. What is the array afterwards?",
          options: ["1, 2, 5, 3, 6, 4", "2, 1, 3, 5, 4, 6", "1, 2, 3, 4, 5, 6"],
          answer: 0,
          explanation:
            "It finds the smallest value, 1, and swaps it with the first unsorted element, 5. Nothing else moves. 2, 1, 3, 5, 4, 6 is bubble sort's first pass.",
        },
        {
          id: "week-3-short-selection-sort-r2",
          prompt: "Why is selection sort's best case still Ω(n²)?",
          options: [
            "It must scan every unsorted element to be sure it has the smallest, even if the array is sorted",
            "It always makes n² swaps",
            "It sorts each element twice",
          ],
          answer: 0,
          explanation:
            "There is no way to confirm a value is the smallest without looking at the rest, and nothing in the algorithm detects a sorted array early.",
        },
      ],
    },
    "week-3-short-call-stacks": {
      recall: [
        {
          id: "week-3-short-call-stacks-r1",
          prompt:
            "main calls move, and move calls direction. Which function's frame is active?",
          options: ["direction", "move", "main"],
          answer: 0,
          explanation:
            "The most recently called function's frame sits on top of the stack and is the only one running. move and main are paused, waiting.",
        },
        {
          id: "week-3-short-call-stacks-r2",
          prompt: "What happens to a function's frame when the function returns?",
          options: [
            "It is popped off the stack, and the frame below resumes where it left off",
            "It moves to the bottom of the stack",
            "It stays on the stack until the program ends",
          ],
          answer: 0,
          explanation:
            "Returning destroys the frame. The caller underneath becomes active again, picking up with the returned value.",
        },
        {
          id: "week-3-short-call-stacks-r3",
          prompt:
            "fact(n) returns 1 when n is 1, else n * fact(n - 1). When fact(1) is running after a call to fact(5), how many fact frames are on the stack?",
          options: ["1", "5", "120"],
          answer: 1,
          explanation:
            "fact(5), fact(4), fact(3) and fact(2) are each paused waiting on the next call, and fact(1) is on top: five frames. 120 is the final answer, not a frame count.",
        },
      ],
    },
    "week-3-short-recursion": {
      recall: [
        {
          id: "week-3-short-recursion-r1",
          prompt: "What two parts does every recursive function need?",
          options: [
            "A base case that stops, and a recursive case that calls itself on a smaller problem",
            "A loop and a return statement",
            "A prototype and a global variable",
          ],
          answer: 0,
          explanation:
            "Without a base case the calls never end. Without a recursive case that shrinks the problem, the calls never reach the base case.",
        },
        {
          id: "week-3-short-recursion-r2",
          prompt:
            "fact(n) returns 1 when n is 1, else n * fact(n - 1). What does fact(4) return?",
          options: ["24", "10", "4"],
          answer: 0,
          explanation:
            "fact(4) is 4 × fact(3) = 4 × 3 × fact(2) = 4 × 3 × 2 × fact(1) = 4 × 3 × 2 × 1 = 24. 10 would be adding instead of multiplying.",
        },
      ],
    },
    "week-3-short-merge-sort": {
      recall: [
        {
          id: "week-3-short-merge-sort-r1",
          prompt: "Why can merge sort stop splitting once a piece has one element?",
          options: [
            "A single element is already sorted",
            "Single elements are thrown away",
            "The merge step cannot handle more than one element",
          ],
          answer: 0,
          explanation:
            "There is nothing to put in order in a one-element array. That is merge sort's base case.",
        },
        {
          id: "week-3-short-merge-sort-r2",
          prompt: "How does the merge step decide which number goes next?",
          options: [
            "It compares the first remaining number of each sorted half and takes the smaller",
            "It takes all of the left half, then all of the right half",
            "It runs selection sort on the combined list",
          ],
          answer: 0,
          explanation:
            "Because each half is sorted, its front is its smallest remaining number. Comparing just the two fronts is enough.",
        },
        {
          id: "week-3-short-merge-sort-r3",
          prompt: "Bubble, selection and insertion sort are O(n²) in the worst case. What is merge sort?",
          options: ["O(n log n)", "O(n²)", "O(log n)"],
          answer: 0,
          explanation:
            "There are about log n levels of splitting, and each level does about n work to merge, giving n log n.",
        },
      ],
    },
  },

  glossary: [
    { term: "algorithm", meaning: "A step-by-step set of instructions for solving a problem." },
    { term: "pseudocode", meaning: "Instructions written in plain, precise English that read like code but are not in any programming language." },
    { term: "linear search", meaning: "Searching by checking each element in turn, from one end to the other." },
    { term: "binary search", meaning: "Searching a sorted list by checking the middle and throwing away the half that cannot hold the target." },
    { term: "running time", meaning: "How many steps an algorithm takes as a function of the size of its input, n." },
    { term: "big O", meaning: "Notation, such as O(n), for the upper bound on an algorithm's running time, usually its worst case." },
    { term: "Omega (Ω)", meaning: "Notation for the lower bound on an algorithm's running time, usually its best case." },
    { term: "Theta (Θ)", meaning: "Notation used when an algorithm's upper and lower bounds are the same." },
    { term: "strcmp", meaning: "A function from string.h that compares two strings character by character and returns 0 if they are the same." },
    { term: "segmentation fault", meaning: "A crash that happens when a program touches memory it should not, such as an element past the end of an array." },
    { term: "struct", meaning: "A type you define yourself that groups several related values, such as a name and a number, under one name." },
    { term: "dot notation", meaning: "The . used to reach a field inside a struct, as in people[0].name." },
    { term: "selection sort", meaning: "A sort that repeatedly finds the smallest unsorted number and swaps it to the front of the unsorted part." },
    { term: "bubble sort", meaning: "A sort that repeatedly swaps adjacent numbers that are out of order, stopping after a pass with no swaps." },
    { term: "recursion", meaning: "A technique in which a function calls itself to solve a smaller version of the same problem." },
    { term: "base case", meaning: "The condition in a recursive function that returns without calling itself again, which stops the recursion." },
    { term: "recursive case", meaning: "The part of a recursive function that calls itself with an input closer to the base case." },
    { term: "merge sort", meaning: "A recursive sort that sorts each half of a list and then merges the two sorted halves, in O(n log n) time." },
    { term: "call stack", meaning: "The pile of frames in memory for functions that have been called and not yet returned, with the running one on top." },
  ],
};

export default content;
