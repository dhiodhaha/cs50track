import type { WeekContent } from "./types";

const content: WeekContent = {
  unitId: "week-5",
  parts: {
    "week-5-lecture-p1": {
      hook: "An array is fast, but you must pick its size before you know how much data is coming. Pick too small and you run out; pick too big and you waste memory. This part names two ways of organizing data, queues and stacks, and then shows what it really costs to make an array grow.",
      after: {
        "data-structures": [
          {
            kind: "predict",
            id: "week-5-lecture-p1-adt",
            prompt: "What makes something an abstract data type, like a queue or a stack?",
            options: [
              "It is defined by how it behaves, not by how the memory is laid out",
              "It can only be written in a language other than C",
              "It has no size limit",
            ],
            answer: 0,
            explanation:
              "A queue is any structure where the first item in is the first out. You could build one with an array or with pointers. The idea comes first and the implementation second.",
          },
        ],
        queues: [
          {
            kind: "predict",
            id: "week-5-lecture-p1-queue-front",
            prompt:
              "Alice, Bob and Carol are enqueued, in that order. Then two people are dequeued. Who is now at the front?",
            options: ["Carol", "Alice", "Bob"],
            answer: 0,
            explanation:
              "A queue is first in, first out. Alice leaves first, then Bob, so Carol is next. If you picked Alice, you were thinking of a stack, where the newest item leaves first.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p1-queue-size",
            prompt:
              "A queue from the notes has CAPACITY 50 and its size field is 3. How many more people can be enqueued?",
            options: ["47", "50", "3"],
            answer: 0,
            explanation:
              "CAPACITY is how many the array can hold. size is how many it holds now. 50 minus 3 leaves room for 47.",
          },
        ],
        stacks: [
          {
            kind: "demo",
            id: "week-5-lecture-p1-stack-demo",
            demo: "stack",
            caption:
              "Push 3, push 4, then pop once. The 4 leaves first: last in, first out, like the top tray on a stack.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p1-stack-pops",
            prompt: "Push 1, push 2, push 3, pop, push 4, pop, pop. Which values come out, in order?",
            options: ["3, 4, 2", "1, 2, 3", "3, 2, 1"],
            answer: 0,
            explanation:
              "The first pop takes 3, the top. Then 4 goes on top and the next pop takes it. The last pop takes 2, leaving only 1.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p1-stack-limit",
            prompt: "The stack in the notes is an array of size CAPACITY inside a struct. What is the weakness of that design?",
            options: [
              "Its size is fixed up front, so it is either too small or wastes space",
              "It can only hold ints",
              "Popping has to shift every item down",
            ],
            answer: 0,
            explanation:
              "The array is created at full size even if you use one slot, and it cannot grow past CAPACITY. Pushing and popping only touch the top, so nothing shifts.",
          },
        ],
        arrays: [
          {
            kind: "trace",
            id: "week-5-lecture-p1-resize-trace",
            caption: "Grow a 3-int list to 4 ints by hand and watch both blocks of memory.",
            language: "c",
            code: `int *list = malloc(3 * sizeof(int));
list[0] = 1;
list[1] = 2;
list[2] = 3;
int *tmp = malloc(4 * sizeof(int));
for (int i = 0; i < 3; i++)
{
    tmp[i] = list[i];
}
tmp[3] = 4;
free(list);
list = tmp;`,
            steps: [
              {
                line: 1,
                vars: { list: "0x123", "at 0x123": "? ? ?" },
                note: "malloc gives 3 ints' worth of bytes, still holding garbage.",
              },
              { line: 2, vars: { list: "0x123", "at 0x123": "1 ? ?" } },
              { line: 3, vars: { list: "0x123", "at 0x123": "1 2 ?" } },
              { line: 4, vars: { list: "0x123", "at 0x123": "1 2 3" } },
              {
                line: 5,
                vars: { list: "0x123", "at 0x123": "1 2 3", tmp: "0x456", "at 0x456": "? ? ? ?" },
                note: "A new, bigger block somewhere else in memory.",
              },
              {
                line: 8,
                vars: { list: "0x123", "at 0x123": "1 2 3", tmp: "0x456", "at 0x456": "1 ? ? ?", i: "0" },
              },
              {
                line: 8,
                vars: { list: "0x123", "at 0x123": "1 2 3", tmp: "0x456", "at 0x456": "1 2 ? ?", i: "1" },
              },
              {
                line: 8,
                vars: { list: "0x123", "at 0x123": "1 2 3", tmp: "0x456", "at 0x456": "1 2 3 ?", i: "2" },
                note: "Every old item had to be copied one by one.",
              },
              {
                line: 10,
                vars: { list: "0x123", "at 0x123": "1 2 3", tmp: "0x456", "at 0x456": "1 2 3 4" },
              },
              {
                line: 11,
                vars: { list: "0x123", "at 0x123": "freed", tmp: "0x456", "at 0x456": "1 2 3 4" },
                note: "The old block goes back to the system. list still holds 0x123 for a moment.",
              },
              {
                line: 12,
                vars: { list: "0x456", tmp: "0x456", "at 0x456": "1 2 3 4" },
                note: "list and tmp now point at the same 4-int block.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-5-lecture-p1-copy-cost",
            prompt:
              "Your list holds 1,000 numbers and you add one more the same way: new block, copy, free the old one. How many numbers get copied?",
            options: ["1,000", "1", "1,001"],
            answer: 0,
            explanation:
              "All 1,000 old numbers move to the new block, then the new one is written directly. Each such insert costs time in proportion to n, which is why the notes call it bad design.",
          },
          {
            kind: "blank",
            id: "week-5-lecture-p1-realloc",
            prompt: "Resize the existing list to hold 4 ints with realloc.",
            code: "int *tmp = realloc(____, 4 * sizeof(int));",
            language: "c",
            options: ["list", "tmp", "&list"],
            answer: 0,
            explanation:
              "realloc takes the block you already have and the new size. It copies the old values for you and returns the address of the resized block.",
          },
          {
            kind: "compare",
            id: "week-5-lecture-p1-realloc-tmp",
            prompt: "Both lines try to grow list. Which is safer?",
            language: "c",
            a: {
              label: "Assign straight back to list",
              code: `list = realloc(list, 4 * sizeof(int));
if (list == NULL)
{
    return 1;
}`,
            },
            b: {
              label: "Use tmp first",
              code: `int *tmp = realloc(list, 4 * sizeof(int));
if (tmp == NULL)
{
    free(list);
    return 1;
}
list = tmp;`,
            },
            answer: "b",
            explanation:
              "If realloc fails it returns NULL and the old block is still allocated. Version a overwrites list with NULL, so the old block can never be freed and leaks.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-5-lecture-p1-recap",
        prompt: "You enqueue 1, 2, 3 into a queue and push 1, 2, 3 onto a stack. What do one dequeue and one pop return?",
        options: [
          "dequeue returns 1, pop returns 3",
          "dequeue returns 3, pop returns 1",
          "Both return 1",
        ],
        answer: 0,
        explanation:
          "The two structs in the notes look identical. The difference is only in the rules: a queue removes the oldest item, a stack removes the newest.",
      },
      exercise: {
        prompt:
          "Complete push and pop for a stack of ints stored in a fixed array. push adds a number on top and ignores it if the stack is full; pop removes and returns the top number. main pushes 1, 2 and 3 and pops three times, so it should print 3, 2 and 1 on separate lines.",
        language: "c",
        starter: `#include <stdio.h>

#define CAPACITY 5

typedef struct
{
    int numbers[CAPACITY];
    int size;
} stack;

stack s;

void push(int number);
int pop(void);

int main(void)
{
    s.size = 0;
    push(1);
    push(2);
    push(3);
    printf("%i\\n", pop());
    printf("%i\\n", pop());
    printf("%i\\n", pop());
}

void push(int number)
{
    // TODO
}

int pop(void)
{
    // TODO
}`,
        hints: [
          "size tells you how many numbers are in the stack, and also the index of the next free slot.",
          "push writes at numbers[size] and then increases size, unless size is already CAPACITY.",
          "pop does the reverse: decrease size first, then return the number at that index.",
        ],
        solution: `// The top of the stack is always at index size - 1, so both
// operations touch only the end of the array and never shift anything.
#include <stdio.h>

#define CAPACITY 5

typedef struct
{
    int numbers[CAPACITY];
    int size;
} stack;

stack s;

void push(int number);
int pop(void);

int main(void)
{
    s.size = 0;
    push(1);
    push(2);
    push(3);
    printf("%i\\n", pop());
    printf("%i\\n", pop());
    printf("%i\\n", pop());
}

void push(int number)
{
    if (s.size < CAPACITY)
    {
        s.numbers[s.size] = number;
        s.size++;
    }
}

int pop(void)
{
    s.size--;
    return s.numbers[s.size];
}`,
      },
      recall: [
        {
          id: "week-5-lecture-p1-r1",
          prompt: "Which structure is last in, first out?",
          options: ["A stack", "A queue", "An array"],
          answer: 0,
          explanation:
            "A stack, like trays in a dining hall, gives back the most recent item first. A queue is first in, first out.",
        },
        {
          id: "week-5-lecture-p1-r2",
          prompt: "Why is adding one item to a full array slow?",
          options: [
            "You must allocate a new, bigger block and copy every old item into it",
            "Arrays have to be sorted after every insert",
            "malloc takes longer for each item already in the array",
          ],
          answer: 0,
          explanation:
            "An array must be contiguous. If the memory right after it is taken, the whole array has to move.",
        },
        {
          id: "week-5-lecture-p1-r3",
          prompt: "What does realloc do for you?",
          options: [
            "Gives you a block of the new size with the old values copied in",
            "Frees a block and sets the pointer to NULL",
            "Sorts the values in a block",
          ],
          answer: 0,
          explanation:
            "realloc replaces the malloc, copy loop and free steps with one call. You still check its result for NULL.",
        },
        {
          id: "week-5-lecture-p1-r4",
          prompt: "In the notes' queue struct, what does size mean?",
          options: [
            "How many people are in the queue right now",
            "The most the queue can ever hold",
            "How many bytes each person takes",
          ],
          answer: 0,
          explanation:
            "CAPACITY is the most it can hold. size counts how full it actually is.",
        },
      ],
    },

    "week-5-lecture-p2": {
      hook: "What if your numbers did not have to sit side by side? Each one could live anywhere in memory and carry a pointer to the next. That is a linked list: it grows one node at a time with no copying. The price is that you must manage every pointer yourself, and one wrong assignment loses the rest of the list.",
      after: {
        "linked-lists": [
          {
            kind: "blank",
            id: "week-5-lecture-p2-arrow",
            prompt: "n is a node *. Set the number inside the node it points to.",
            code: "n____number = 1;",
            language: "c",
            options: ["->", ".", "*"],
            answer: 0,
            explanation:
              "-> goes to the address in n and then looks inside the struct there. It is shorthand for (*n).number. A plain dot works on a struct, not on a pointer to one.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p2-struct-name",
            prompt: "Why does the node definition say struct node *next instead of node *next?",
            code: `typedef struct node
{
    int number;
    struct node *next;
} node;`,
            language: "c",
            options: [
              "The short name node does not exist until the last line, so inside the struct you must say struct node",
              "struct node *next takes less memory",
              "Both work the same here, it is only style",
            ],
            answer: 0,
            explanation:
              "C reads top to bottom. The alias node is created at the very end of the typedef, so the field in the middle has to use the full name struct node.",
          },
          {
            kind: "trace",
            id: "week-5-lecture-p2-prepend-trace",
            caption: "Build a list by prepending, with two nodes instead of three to keep it short.",
            language: "c",
            code: `node *list = NULL;
for (int i = 0; i < 2; i++)
{
    node *n = malloc(sizeof(node));
    n->number = get_int("Number: ");
    n->next = NULL;
    n->next = list;
    list = n;
}`,
            steps: [
              { line: 1, vars: { list: "NULL" }, note: "An empty list. NULL means no nodes yet." },
              {
                line: 4,
                vars: { list: "NULL", i: "0", n: "0x123", "node at 0x123": "number ?, next ?" },
                note: "malloc returns the address of a fresh node full of garbage.",
              },
              {
                line: 5,
                vars: { list: "NULL", i: "0", n: "0x123", "node at 0x123": "number 1, next ?" },
                note: "You type 1.",
              },
              {
                line: 6,
                vars: { list: "NULL", i: "0", n: "0x123", "node at 0x123": "number 1, next NULL" },
              },
              {
                line: 7,
                vars: { list: "NULL", i: "0", n: "0x123", "node at 0x123": "number 1, next NULL" },
                note: "list is NULL, so next stays NULL. This node will be the end of the list.",
              },
              {
                line: 8,
                vars: { list: "0x123", i: "0", n: "0x123", "node at 0x123": "number 1, next NULL" },
                note: "list and n now point at the same node.",
              },
              {
                line: 4,
                vars: {
                  list: "0x123",
                  i: "1",
                  n: "0x456",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number ?, next ?",
                },
              },
              {
                line: 5,
                vars: {
                  list: "0x123",
                  i: "1",
                  n: "0x456",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number 2, next ?",
                },
                note: "You type 2.",
              },
              {
                line: 6,
                vars: {
                  list: "0x123",
                  i: "1",
                  n: "0x456",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number 2, next NULL",
                },
              },
              {
                line: 7,
                vars: {
                  list: "0x123",
                  i: "1",
                  n: "0x456",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number 2, next 0x123",
                },
                note: "The new node points at the old first node before list moves, so nothing is lost.",
              },
              {
                line: 8,
                vars: {
                  list: "0x456",
                  i: "1",
                  n: "0x456",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number 2, next 0x123",
                },
              },
              {
                line: 2,
                vars: {
                  list: "0x456",
                  i: "2",
                  "node at 0x123": "number 1, next NULL",
                  "node at 0x456": "number 2, next 0x123",
                },
                note: "2 < 2 is false, so the loop ends. list leads to 2, then 1, then NULL.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-5-lecture-p2-print-order",
            prompt: "The notes' program prepends three numbers, then prints from list onward. You type 1, 2, 3. What prints?",
            options: ["3 2 1, one per line", "1 2 3, one per line", "Only 3"],
            answer: 0,
            explanation:
              "Each new node goes in front, so the last number typed is first in the list. That is why the notes say a prepended list comes out in reverse.",
          },
          {
            kind: "compare",
            id: "week-5-lecture-p2-prepend-order",
            prompt: "Both pairs of lines try to put node n at the front of a list that already has nodes. Which one works?",
            language: "c",
            a: {
              label: "Link n, then move list",
              code: `n->next = list;
list = n;`,
            },
            b: {
              label: "Move list, then link n",
              code: `list = n;
n->next = list;`,
            },
            answer: "a",
            explanation:
              "In version b, list already equals n when the second line runs, so n->next points at n itself. No pointer leads to the old nodes anymore, so they are lost and leak.",
          },
          {
            kind: "trace",
            id: "week-5-lecture-p2-print-trace",
            caption: "Walk ptr down a three-node list and watch it hop from address to address.",
            language: "c",
            code: `node *ptr = list;
while (ptr != NULL)
{
    printf("%i\\n", ptr->number);
    ptr = ptr->next;
}`,
            steps: [
              {
                line: 1,
                vars: { list: "0x300", ptr: "0x300" },
                note: "The list is 0x300 (3) then 0x200 (2) then 0x100 (1) then NULL.",
              },
              { line: 4, vars: { list: "0x300", ptr: "0x300", "ptr->number": "3" }, output: "3\n" },
              {
                line: 5,
                vars: { list: "0x300", ptr: "0x200", "ptr->number": "2" },
                output: "3\n",
                note: "ptr->next of the node at 0x300 is 0x200.",
              },
              { line: 4, vars: { list: "0x300", ptr: "0x200", "ptr->number": "2" }, output: "3\n2\n" },
              { line: 5, vars: { list: "0x300", ptr: "0x100", "ptr->number": "1" }, output: "3\n2\n" },
              { line: 4, vars: { list: "0x300", ptr: "0x100", "ptr->number": "1" }, output: "3\n2\n1\n" },
              {
                line: 5,
                vars: { list: "0x300", ptr: "NULL" },
                output: "3\n2\n1\n",
                note: "The last node's next is NULL.",
              },
              {
                line: 2,
                vars: { list: "0x300", ptr: "NULL" },
                output: "3\n2\n1\n",
                note: "ptr != NULL is false, so the loop ends. list never moved.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-5-lecture-p2-big-o",
            prompt: "For a linked list built by prepending, what are the running times of inserting a number and of searching for one?",
            options: [
              "Insert is O(1), search is O(n)",
              "Insert is O(n), search is O(log n)",
              "Both are O(1)",
            ],
            answer: 0,
            explanation:
              "Prepending takes the same two pointer steps no matter how long the list is. Searching may have to visit every node, and you cannot binary search because you cannot jump to the middle.",
          },
          {
            kind: "trace",
            id: "week-5-lecture-p2-free-trace",
            caption: "Free a two-node list and see why next is saved first.",
            language: "c",
            code: `node *ptr = list;
while (ptr != NULL)
{
    node *next = ptr->next;
    free(ptr);
    ptr = next;
}`,
            steps: [
              {
                line: 1,
                vars: {
                  ptr: "0x200",
                  "node at 0x200": "number 2, next 0x100",
                  "node at 0x100": "number 1, next NULL",
                },
              },
              {
                line: 4,
                vars: {
                  ptr: "0x200",
                  next: "0x100",
                  "node at 0x200": "number 2, next 0x100",
                  "node at 0x100": "number 1, next NULL",
                },
                note: "Save the way forward before it disappears.",
              },
              {
                line: 5,
                vars: { ptr: "0x200", next: "0x100", "node at 0x200": "freed", "node at 0x100": "number 1, next NULL" },
                note: "ptr->next can no longer be read safely, but next still holds 0x100.",
              },
              {
                line: 6,
                vars: { ptr: "0x100", next: "0x100", "node at 0x200": "freed", "node at 0x100": "number 1, next NULL" },
              },
              {
                line: 4,
                vars: { ptr: "0x100", next: "NULL", "node at 0x200": "freed", "node at 0x100": "number 1, next NULL" },
              },
              {
                line: 5,
                vars: { ptr: "0x100", next: "NULL", "node at 0x200": "freed", "node at 0x100": "freed" },
              },
              {
                line: 6,
                vars: { ptr: "NULL", next: "NULL", "node at 0x200": "freed", "node at 0x100": "freed" },
              },
              {
                line: 2,
                vars: { ptr: "NULL", "node at 0x200": "freed", "node at 0x100": "freed" },
                note: "ptr is NULL, so the loop ends with every node freed.",
              },
            ],
          },
          {
            kind: "compare",
            id: "week-5-lecture-p2-free-order",
            prompt: "Which loop frees a linked list correctly?",
            language: "c",
            a: {
              label: "Free, then follow next",
              code: `node *ptr = list;
while (ptr != NULL)
{
    free(ptr);
    ptr = ptr->next;
}`,
            },
            b: {
              label: "Save next, then free",
              code: `node *ptr = list;
while (ptr != NULL)
{
    node *next = ptr->next;
    free(ptr);
    ptr = next;
}`,
            },
            answer: "b",
            explanation:
              "Version a reads ptr->next from a node it has just freed, which is using memory you gave away. valgrind reports it as an invalid read, and it can crash.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p2-sorted-branch",
            prompt:
              "The sorted-list program already holds 1 then 3. You type 2. Which branch of the code inserts it?",
            options: [
              "If in middle of list: n < ptr->next->number",
              "If number belongs at beginning of list",
              "If at end of list: ptr->next == NULL",
            ],
            answer: 0,
            explanation:
              "2 is not less than 1, so it does not go first. ptr starts at the 1, whose next is the 3, not NULL. 2 < 3, so n is linked in between 1 and 3.",
          },
        ],
      },
      recap: {
        kind: "blank",
        id: "week-5-lecture-p2-recap",
        prompt: "Back to the first program: finish the line that links a new node n in front of the list.",
        code: `n->next = ____;
list = n;`,
        language: "c",
        options: ["list", "NULL", "n"],
        answer: 0,
        explanation:
          "n must point at the old first node before list moves to n. NULL would cut off the rest of the list, and n would point the node at itself.",
      },
      exercise: {
        prompt:
          "Complete int sum(node *list) so it walks the linked list and returns the total of its numbers without changing the list. Typing 1, 2 and 3 should print Sum: 6, and valgrind ./sum should still report no leaks.",
        language: "c",
        starter: `#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int sum(node *list);

int main(void)
{
    node *list = NULL;
    for (int i = 0; i < 3; i++)
    {
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            return 1;
        }
        n->number = get_int("Number: ");
        n->next = list;
        list = n;
    }

    printf("Sum: %i\\n", sum(list));

    node *ptr = list;
    while (ptr != NULL)
    {
        node *next = ptr->next;
        free(ptr);
        ptr = next;
    }
    return 0;
}

int sum(node *list)
{
    // TODO
}`,
        hints: [
          "Use your own pointer, starting at list, so main's list is untouched.",
          "The print loop from the notes visits every node. Add instead of print.",
          "Start the total at 0, or an empty list gives a garbage value.",
        ],
        solution: `// ptr visits every node from the head until NULL, adding each number.
// list itself is never changed, so main can still free every node.
int sum(node *list)
{
    int total = 0;
    for (node *ptr = list; ptr != NULL; ptr = ptr->next)
    {
        total += ptr->number;
    }
    return total;
}`,
      },
      recall: [
        {
          id: "week-5-lecture-p2-r1",
          prompt: "What does a node in the notes' linked list contain?",
          options: [
            "A number and a pointer to the next node",
            "A number and its index in the list",
            "Only a pointer",
          ],
          answer: 0,
          explanation:
            "Each node stores its item and the address of the next node, or NULL if it is the last.",
        },
        {
          id: "week-5-lecture-p2-r2",
          prompt: "n is a node *. Which expression means the same as n->number?",
          options: ["(*n).number", "*n.number", "&n.number"],
          answer: 0,
          explanation:
            "-> follows the pointer, then picks the field. *n.number would try to take .number of n first, which does not work on a pointer.",
        },
        {
          id: "week-5-lecture-p2-r3",
          prompt: "Why can't you binary search a linked list?",
          options: [
            "You cannot jump to the middle node; you have to walk to it from the head",
            "Linked lists cannot be sorted",
            "Binary search only works on strings",
          ],
          answer: 0,
          explanation:
            "Binary search needs to reach the middle in one step, as an array index allows. A list only gives you the next pointer.",
        },
        {
          id: "week-5-lecture-p2-r4",
          prompt: "Why is appending to the end of the notes' list O(n), while prepending is O(1)?",
          options: [
            "To append, you must walk past every node to find the last one",
            "Appending has to copy the list",
            "malloc is slower for the last node",
          ],
          answer: 0,
          explanation:
            "The program only keeps a pointer to the head. Reaching the tail means following every next pointer.",
        },
        {
          id: "week-5-lecture-p2-r5",
          prompt: "What is the main memory cost of a linked list compared with an array?",
          options: [
            "Every node needs extra space for a pointer",
            "Linked lists must reserve space for all future nodes",
            "Every node is twice the size of the whole array",
          ],
          answer: 0,
          explanation:
            "An array stores only the values. A list stores each value plus an 8-byte pointer, in exchange for growing without copying.",
        },
      ],
    },

    "week-5-lecture-p3": {
      hook: "Arrays let you binary search but cannot grow. Linked lists grow easily but force you to search one node at a time. Can you have both? A binary search tree keeps nodes linked by pointers, like a list, yet arranges them so that each step of a search throws away half of what is left.",
      after: {
        trees: [
          {
            kind: "predict",
            id: "week-5-lecture-p3-root",
            prompt: "You build a binary search tree from 1, 2, 3, 4, 5, 6, 7 the way the notes describe, starting with the center value. What is at the top?",
            options: ["4", "1", "7"],
            answer: 0,
            explanation:
              "The middle value becomes the root. Smaller values go to its left and larger ones to its right, so 2 and 6 sit just below 4.",
          },
          {
            kind: "trace",
            id: "week-5-lecture-p3-search-trace",
            caption: "Search the tree with 4 at the root for 3, one recursive call at a time.",
            language: "c",
            code: `bool search(node *tree, int number)
{
    if (tree == NULL)
        return false;
    else if (number < tree->number)
        return search(tree->left, number);
    else if (number > tree->number)
        return search(tree->right, number);
    else
        return true;
}`,
            steps: [
              {
                line: 3,
                vars: { call: "search #1", tree: "0x400", "tree->number": "4", number: "3" },
                note: "The tree is 4 at 0x400, with 2 at 0x200 on its left and 3 at 0x300 to the right of 2. Braces are left out to keep it short. tree is not NULL.",
              },
              {
                line: 5,
                vars: { call: "search #1", tree: "0x400", "tree->number": "4", number: "3" },
                note: "3 < 4 is true.",
              },
              {
                line: 6,
                vars: { call: "search #1", tree: "0x400", "tree->left": "0x200", number: "3" },
                note: "search #1 calls search(0x200, 3) and waits for its answer.",
              },
              {
                line: 3,
                vars: { call: "search #2", tree: "0x200", "tree->number": "2", number: "3" },
              },
              {
                line: 5,
                vars: { call: "search #2", tree: "0x200", "tree->number": "2", number: "3" },
                note: "3 < 2 is false.",
              },
              {
                line: 7,
                vars: { call: "search #2", tree: "0x200", "tree->number": "2", number: "3" },
                note: "3 > 2 is true.",
              },
              {
                line: 8,
                vars: { call: "search #2", tree: "0x200", "tree->right": "0x300", number: "3" },
                note: "search #2 calls search(0x300, 3) and waits.",
              },
              {
                line: 3,
                vars: { call: "search #3", tree: "0x300", "tree->number": "3", number: "3" },
              },
              {
                line: 5,
                vars: { call: "search #3", tree: "0x300", "tree->number": "3", number: "3" },
                note: "3 < 3 is false.",
              },
              {
                line: 7,
                vars: { call: "search #3", tree: "0x300", "tree->number": "3", number: "3" },
                note: "3 > 3 is false.",
              },
              {
                line: 10,
                vars: { call: "search #3", tree: "0x300", "tree->number": "3", number: "3" },
                note: "Found. true goes back to search #2, which returns it to search #1, which returns it to the caller.",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-5-lecture-p3-left",
            prompt: "Fill in where search goes when the number is smaller than the current node's.",
            code: `else if (number < tree->number)
{
    return search(tree->____, number);
}`,
            language: "c",
            options: ["left", "right", "next"],
            answer: 0,
            explanation:
              "Smaller values are stored in the left subtree. A tree node has left and right pointers; next belongs to a linked list node.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p3-unbalanced",
            prompt:
              "You insert 1, 2, 3, 4, 5 in that order, each new number going left or right as in the notes. How long does a search take in the worst case now?",
            options: [
              "O(n), because every node hangs to the right of the one before, like a linked list",
              "O(log n), as for every binary search tree",
              "O(1), because the numbers are already sorted",
            ],
            answer: 0,
            explanation:
              "Each number is bigger than all before it, so each becomes a right child. The tree is one long chain. The notes promise O(log n) only when the tree is balanced.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-5-lecture-p3-recap",
        prompt: "Same balanced tree of 1 to 7 with 4 at the root. You search for 8. Which numbers does search compare 8 with before returning false?",
        options: ["4, 6, 7", "4, 6, 7, 8", "1, 2, 3, 4, 5, 6, 7"],
        answer: 0,
        explanation:
          "8 > 4 goes right to 6, 8 > 6 goes right to 7, and 8 > 7 goes right to NULL, where search returns false. Three comparisons for seven numbers.",
      },
      exercise: {
        prompt:
          "Complete print_tree so it prints every number in the binary search tree from smallest to largest, one per line, using recursion like the notes' search. With the tree built in main it should print 1, 2 and 3. Then add root->right->right = make(4); in main and check that 4 prints last.",
        language: "c",
        starter: `#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *left;
    struct node *right;
} node;

node *make(int number);
void print_tree(node *root);
void free_tree(node *root);

int main(void)
{
    node *root = make(2);
    root->left = make(1);
    root->right = make(3);
    print_tree(root);
    free_tree(root);
}

node *make(int number)
{
    node *n = malloc(sizeof(node));
    if (n != NULL)
    {
        n->number = number;
        n->left = NULL;
        n->right = NULL;
    }
    return n;
}

void print_tree(node *root)
{
    // TODO
}

void free_tree(node *root)
{
    if (root == NULL)
    {
        return;
    }
    free_tree(root->left);
    free_tree(root->right);
    free(root);
}`,
        hints: [
          "An empty tree, root == NULL, prints nothing. That is your base case.",
          "Every number in the left subtree is smaller than root->number, and every number on the right is bigger.",
          "Print the left subtree, then this node, then the right subtree.",
        ],
        solution: `// Everything on the left is smaller and everything on the right is bigger,
// so left, then this node, then right prints in sorted order.
void print_tree(node *root)
{
    if (root == NULL)
    {
        return;
    }
    print_tree(root->left);
    printf("%i\\n", root->number);
    print_tree(root->right);
}`,
      },
      recall: [
        {
          id: "week-5-lecture-p3-r1",
          prompt: "In a binary search tree, where are values smaller than a node stored?",
          options: ["In its left subtree", "In its right subtree", "In the node's next pointer"],
          answer: 0,
          explanation:
            "Smaller values go left and larger values go right, at every node. That rule is what lets search skip half the tree.",
        },
        {
          id: "week-5-lecture-p3-r2",
          prompt: "When does searching a binary search tree take O(log n)?",
          options: ["When the tree is balanced", "Always", "Only when it holds fewer than 100 nodes"],
          answer: 0,
          explanation:
            "Each step halves what is left only if both sides are about the same size. A lopsided tree can be as slow as a list.",
        },
        {
          id: "week-5-lecture-p3-r3",
          prompt: "What does a tree give you that an array does not?",
          options: [
            "It can grow and shrink without copying everything",
            "Faster access by index",
            "Less memory per value",
          ],
          answer: 0,
          explanation:
            "Nodes are allocated one at a time and linked by pointers. The cost is two pointers per node.",
        },
        {
          id: "week-5-lecture-p3-r4",
          prompt: "In the notes' search, what is the base case that stops a failed search?",
          options: ["tree == NULL, which returns false", "number == 0", "tree->left == tree->right"],
          answer: 0,
          explanation:
            "If the search walks off the bottom of the tree, the number is not there. Without that check, tree->number would dereference NULL.",
        },
      ],
    },

    "week-5-lecture-p4": {
      hook: "Searching a list is O(n) and a balanced tree is O(log n). Could you jump straight to the right spot, in O(1)? A hash function turns a word into an array index, so you know where to look before you start. This part shows how that works, what happens when two words want the same spot, and what tries trade for their speed.",
      after: {
        "hashing-and-hash-tables": [
          {
            kind: "predict",
            id: "week-5-lecture-p4-hash-value",
            prompt: "With the notes' hash function, what does hash(\"Berry\") return?",
            code: `unsigned int hash(const char *word)
{
    return toupper(word[0]) - 'A';
}`,
            language: "c",
            options: ["1", "2", "66"],
            answer: 0,
            explanation:
              "toupper('B') is 'B', which is 66 in ASCII, and 'A' is 65. 66 minus 65 is 1, so B words go in bucket 1 and A words in bucket 0.",
          },
          {
            kind: "trace",
            id: "week-5-lecture-p4-hash-trace",
            caption: "The notes' hash function split into steps, called as hash(\"cat\").",
            language: "c",
            code: `unsigned int hash(const char *word)
{
    char first = toupper(word[0]);
    int index = first - 'A';
    return index;
}`,
            steps: [
              {
                line: 1,
                vars: { word: "0x123", "word[0]": "'c'" },
                note: "word holds the address of \"cat\".",
              },
              {
                line: 3,
                vars: { word: "0x123", first: "'C' (67)" },
                note: "toupper makes the case not matter.",
              },
              {
                line: 4,
                vars: { word: "0x123", first: "'C' (67)", index: "2" },
                note: "67 minus 65 is 2.",
              },
              {
                line: 5,
                vars: { word: "0x123", first: "'C' (67)", index: "2" },
                note: "cat belongs in bucket 2.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-5-lecture-p4-collision",
            prompt: "cat is already in the table. Now you add Cow. What happens in the notes' hash table?",
            options: [
              "Cow also hashes to 2, a collision, so it joins the linked list at bucket 2",
              "Cow replaces cat in bucket 2",
              "Cow goes to bucket 3 because 2 is taken",
            ],
            answer: 0,
            explanation:
              "Both start with C. Each bucket holds a linked list, so colliding words share the bucket instead of overwriting each other.",
          },
          {
            kind: "blank",
            id: "week-5-lecture-p4-table-size",
            prompt: "Declare the table for the first-letter hash: an array of pointers to nodes, one per bucket.",
            code: "node *table[____];",
            language: "c",
            options: ["26", "25", "1"],
            answer: 0,
            explanation:
              "The hash returns 0 for A up to 25 for Z, which is 26 different indexes. With 25 buckets, Z words would land past the end of the array.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p4-worst-case",
            prompt: "Every word you add starts with S. How long does a lookup take now?",
            options: [
              "O(n), since all words sit in one bucket's linked list",
              "O(1), since hashing is always instant",
              "O(log n), since the bucket is sorted",
            ],
            answer: 0,
            explanation:
              "The hash sends every word to bucket 18, so a lookup walks one long list. That is why the notes give hash tables a search time of O(n), and why a better hash spreads words out.",
          },
        ],
        tries: [
          {
            kind: "predict",
            id: "week-5-lecture-p4-trie-memory",
            prompt: "Each trie node is an array of 26 pointers, one per letter. Counting one node for each of its four letters, as the notes draw it, how many pointers does it take to store TOAD on its own?",
            options: ["104", "26", "4"],
            answer: 0,
            explanation:
              "Each of the 4 letters needs its own node of 26 pointers, and 26 times 4 is 104. Most of those pointers are NULL, which is the memory cost of a trie.",
          },
          {
            kind: "predict",
            id: "week-5-lecture-p4-trie-time",
            prompt: "A trie holds a million names. Looking up TOM takes how many steps?",
            options: [
              "About 3, one per letter, however many names are stored",
              "About a million",
              "About 20, like binary search",
            ],
            answer: 0,
            explanation:
              "You follow one pointer per letter of the word. The number of stored names never enters into it, so lookup is constant time with respect to n.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-5-lecture-p4-recap",
        prompt: "Back to the first-letter hash. Which two words collide?",
        options: ["apple and Avocado", "apple and berry", "Berry and cherry"],
        answer: 0,
        explanation:
          "toupper makes both start with A, so both hash to 0 and share a bucket. Different first letters give different buckets.",
      },
      exercise: {
        prompt:
          "Write buckets.c that takes words as command-line arguments, hashes each with the notes' first-letter hash, and prints how many words landed in each bucket that is not empty. ./buckets apple Avocado berry cherry should print A: 2, B: 1 and C: 1 on separate lines. Skip any word that does not start with a letter.",
        language: "c",
        starter: `#include <ctype.h>
#include <stdio.h>

unsigned int hash(const char *word)
{
    return toupper(word[0]) - 'A';
}

int main(int argc, char *argv[])
{
    int counts[26] = {0};

    // TODO: hash each word in argv and count it in its bucket
    // TODO: print each bucket that has at least one word
}`,
        hints: [
          "The words are argv[1] up to argv[argc - 1]. argv[0] is the program's name.",
          "Check isalpha(argv[i][0]) before hashing, so the index stays between 0 and 25.",
          "Bucket j belongs to the letter 'A' + j, which you can print with %c.",
        ],
        solution: `// The hash turns each word into a bucket number from 0 to 25.
// Counting per bucket shows how words cluster, which is what collisions are.
#include <ctype.h>
#include <stdio.h>

unsigned int hash(const char *word)
{
    return toupper(word[0]) - 'A';
}

int main(int argc, char *argv[])
{
    int counts[26] = {0};

    for (int i = 1; i < argc; i++)
    {
        if (isalpha(argv[i][0]))
        {
            counts[hash(argv[i])]++;
        }
    }

    for (int j = 0; j < 26; j++)
    {
        if (counts[j] > 0)
        {
            printf("%c: %i\\n", 'A' + j, counts[j]);
        }
    }
}`,
      },
      recall: [
        {
          id: "week-5-lecture-p4-r1",
          prompt: "What does a hash function do?",
          options: [
            "Turns a value, such as a word, into an index for where to store or find it",
            "Sorts the values in a table",
            "Encrypts a word so nobody can read it",
          ],
          answer: 0,
          explanation:
            "A hash function reduces a larger value to a small, predictable number, the bucket to use.",
        },
        {
          id: "week-5-lecture-p4-r2",
          prompt: "In the notes, how is a hash table built in C?",
          options: [
            "An array of pointers to nodes, each starting a linked list",
            "One long linked list",
            "A tree of arrays",
          ],
          answer: 0,
          explanation:
            "The array gives a quick jump to a bucket, and each bucket's linked list holds every value that hashed there. A tree of arrays is a trie.",
        },
        {
          id: "week-5-lecture-p4-r3",
          prompt: "What is a collision?",
          options: [
            "Two different values hash to the same bucket",
            "Two pointers point at the same node",
            "The table runs out of memory",
          ],
          answer: 0,
          explanation:
            "With a first-letter hash, cat and cow collide. Chaining puts both in that bucket's list.",
        },
        {
          id: "week-5-lecture-p4-r4",
          prompt: "What is the main downside of a trie?",
          options: [
            "It uses a lot of memory, mostly NULL pointers",
            "Lookups get slower as you add more words",
            "Two words can collide",
          ],
          answer: 0,
          explanation:
            "Every node holds a full array of pointers whether or not they are used. In exchange, lookup depends only on the word's length.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-5-section-r1",
        prompt: "When you prepend a new node n to a list, why must n->next = list; come before list = n;?",
        options: [
          "Otherwise list already points to n and the old nodes are lost",
          "C requires assignments to fields before assignments to variables",
          "It makes the list sorted",
        ],
        answer: 0,
        explanation:
          "n->next has to grab the old head while list still holds it. Moving list first leaves nothing pointing to the old nodes.",
      },
      {
        id: "week-5-section-r2",
        prompt: "In the loop that frees a list, why is ptr->next saved in a variable before free(ptr)?",
        options: [
          "After free, reading ptr->next means touching memory you no longer own",
          "free sets ptr to NULL",
          "It makes the loop run faster",
        ],
        answer: 0,
        explanation:
          "Once a node is freed, its fields may be gone. The saved next pointer is the only safe way forward.",
      },
      {
        id: "week-5-section-r3",
        prompt: "A first-letter hash function returns toupper(word[0]) - 'A'. What does it return for cat?",
        options: ["2", "3", "67"],
        answer: 0,
        explanation:
          "toupper('c') is 'C', 67 in ASCII. 67 minus 65 is 2. The section also returned -1 for words that do not start with a letter, so they cannot land outside the table.",
      },
      {
        id: "week-5-section-r4",
        prompt: "On speller's big board, the fastest programs also tended to use the most memory. Why?",
        options: [
          "More buckets mean shorter lists and faster lookups, but more memory",
          "Fast code always leaks memory",
          "Memory use is measured in time",
        ],
        answer: 0,
        explanation:
          "Time and space trade off. A bigger table spreads words out so each list is short, at the cost of the extra array space.",
      },
    ],
    exercise: {
      prompt:
        "Write list.c that asks for 3 numbers, prepends each one to a linked list of nodes, prints the list from the head, and then frees every node. Typing 1, 2 and 3 should print 3, 2 and 1, and valgrind ./list should report no leaks.",
      language: "c",
      starter: `#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = NULL;

    // TODO: get 3 numbers and prepend each one as a new node
    // TODO: print every number, starting at list
    // TODO: free every node
}`,
      hints: [
        "For each number: malloc a node, check for NULL, fill in number, then link it in front of list.",
        "To print, walk a separate pointer from list until it is NULL.",
        "To free, save ptr->next before you free ptr.",
      ],
      solution: `// Prepending links the new node to the old head before moving list.
// Freeing saves next first, because a freed node can no longer be read.
#include <cs50.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = NULL;

    for (int i = 0; i < 3; i++)
    {
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            return 1;
        }
        n->number = get_int("Number: ");
        n->next = list;
        list = n;
    }

    for (node *ptr = list; ptr != NULL; ptr = ptr->next)
    {
        printf("%i\\n", ptr->number);
    }

    node *ptr = list;
    while (ptr != NULL)
    {
        node *next = ptr->next;
        free(ptr);
        ptr = next;
    }
    return 0;
}`,
    },
  },

  shorts: {
    "week-5-short-structures": {
      recall: [
        {
          id: "week-5-short-structures-r1",
          prompt: "mycar is a struct car. How do you set its year?",
          options: ["mycar.year = 2011;", "mycar->year = 2011;", "*mycar.year = 2011;"],
          answer: 0,
          explanation:
            "Use a dot on a struct itself. The arrow is for a pointer to a struct.",
        },
        {
          id: "week-5-short-structures-r2",
          prompt: "mycar is a struct car *. Which line sets the year?",
          options: ["mycar->year = 2011;", "mycar.year = 2011;", "&mycar.year = 2011;"],
          answer: 0,
          explanation:
            "mycar->year is shorthand for (*mycar).year: go to the struct the pointer points at, then pick the field.",
        },
      ],
    },
    "week-5-short-singly-linked-lists": {
      recall: [
        {
          id: "week-5-short-singly-linked-lists-r1",
          prompt: "Where is the fastest place to insert a new node in a singly-linked list?",
          options: ["At the head", "At the tail", "In the middle"],
          answer: 0,
          explanation:
            "Inserting at the head takes the same few steps however long the list is. The tail has to be found by walking the list.",
        },
        {
          id: "week-5-short-singly-linked-lists-r2",
          prompt: "When inserting at the head, what goes wrong if you move the head pointer to the new node first?",
          options: [
            "You lose the only pointer to the rest of the list",
            "The new node's value is erased",
            "Nothing, the order does not matter",
          ],
          answer: 0,
          explanation:
            "Point the new node at the old head first. Then move the head. The other order orphans every old node.",
        },
        {
          id: "week-5-short-singly-linked-lists-r3",
          prompt: "To delete an entire list recursively, what must happen before a node is freed?",
          options: [
            "The rest of the list after it is freed first",
            "Its value is set to 0",
            "The head pointer is set to NULL",
          ],
          answer: 0,
          explanation:
            "If you free a node first, you lose its next pointer and the rest of the list leaks. Free the rest, then the node.",
        },
      ],
    },
    "week-5-short-doubly-linked-lists": {
      recall: [
        {
          id: "week-5-short-doubly-linked-lists-r1",
          prompt: "What does a doubly-linked list node have that a singly-linked node does not?",
          options: ["A pointer to the previous node", "A second value", "An index"],
          answer: 0,
          explanation:
            "Each node has next and previous pointers, so you can move both forward and backward.",
        },
        {
          id: "week-5-short-doubly-linked-lists-r2",
          prompt: "Why is deleting one node easier in a doubly-linked list?",
          options: [
            "The node can reach both neighbors and connect them to each other before it is freed",
            "Doubly-linked nodes do not need to be freed",
            "The list is always sorted",
          ],
          answer: 0,
          explanation:
            "With a previous pointer you do not have to walk from the head to find the node before. You rewire the two neighbors, then free the node.",
        },
      ],
    },
    "week-5-short-stacks": {
      recall: [
        {
          id: "week-5-short-stacks-r1",
          prompt: "In an array-based stack, top is the index where the next push will go. After pushing 28, 33 and 19 onto an empty stack, what is top?",
          options: ["3", "2", "19"],
          answer: 0,
          explanation:
            "The pushes fill indexes 0, 1 and 2, moving top up each time. top is now 3, the next free slot.",
        },
        {
          id: "week-5-short-stacks-r2",
          prompt: "In a stack built as a linked list, where do push and pop happen?",
          options: ["Both at the head of the list", "Push at the tail, pop at the head", "Both at the tail"],
          answer: 0,
          explanation:
            "The head is the top of the stack. Adding and removing there is fast and keeps last in, first out.",
        },
      ],
    },
    "week-5-short-queues": {
      recall: [
        {
          id: "week-5-short-queues-r1",
          prompt: "An array-based queue has front 0 and size 2. At which index does the next enqueue go?",
          options: ["2", "0", "1"],
          answer: 0,
          explanation:
            "The next element goes at front plus size. Here that is 0 plus 2.",
        },
        {
          id: "week-5-short-queues-r2",
          prompt: "What changes when you dequeue from an array-based queue?",
          options: [
            "front moves to the next index and size goes down by one",
            "Every element shifts one slot to the left",
            "Only size goes down",
          ],
          answer: 0,
          explanation:
            "The oldest element is at front. Moving front forward is enough. Nothing has to be shifted.",
        },
      ],
    },
    "week-5-short-hash-tables": {
      recall: [
        {
          id: "week-5-short-hash-tables-r1",
          prompt: "Which property must a good hash function have?",
          options: [
            "The same input always gives the same hash code",
            "It must return a different code for every possible input",
            "It must be random",
          ],
          answer: 0,
          explanation:
            "If the same word could hash differently, you could store it and never find it again.",
        },
        {
          id: "week-5-short-hash-tables-r2",
          prompt: "With linear probing, where does a value go if its bucket is taken?",
          options: ["The next free bucket after it", "It is thrown away", "Into a linked list at that bucket"],
          answer: 0,
          explanation:
            "Probing tries the following spots in turn, which leads to clustering. A linked list per bucket is chaining, the other approach.",
        },
        {
          id: "week-5-short-hash-tables-r3",
          prompt: "What are hash tables bad at?",
          options: ["Keeping data in sorted order", "Inserting", "Looking up a value"],
          answer: 0,
          explanation:
            "Values are placed by hash code, not by order. Insert and lookup can be close to constant time.",
        },
      ],
    },
    "week-5-short-tries": {
      recall: [
        {
          id: "week-5-short-tries-r1",
          prompt: "Why can a trie never have a collision?",
          options: [
            "Each key has its own unique path through the nodes",
            "Tries use a perfect hash function",
            "Tries store only one key",
          ],
          answer: 0,
          explanation:
            "The key itself is the roadmap. Two keys only share a full path if they are identical.",
        },
        {
          id: "week-5-short-tries-r2",
          prompt: "In the short, university founding years are the keys. How many pointers does each node need?",
          options: ["10, one per digit", "26, one per letter", "4, one per digit of the year"],
          answer: 0,
          explanation:
            "The keys are made of the digits 0 to 9, so each node needs one pointer per possible digit.",
        },
      ],
    },
    "week-5-short-data-structures": {
      recall: [
        {
          id: "week-5-short-data-structures-r1",
          prompt: "What is an array's biggest strength?",
          options: [
            "Constant-time lookup by index",
            "Easy insertion in the middle",
            "Growing without copying",
          ],
          answer: 0,
          explanation:
            "array[20] goes straight to that slot. Inserting in the middle or growing means shifting or copying.",
        },
        {
          id: "week-5-short-data-structures-r2",
          prompt: "What is a linked list's main weakness compared with an array?",
          options: ["Lookup means walking the list", "It cannot grow", "Insertion is slow"],
          answer: 0,
          explanation:
            "Inserting is easy, but finding an item means following pointers one at a time, which is linear search.",
        },
      ],
    },
  },

  glossary: [
    { term: "data structure", meaning: "A way of organizing data in memory, such as an array, a linked list or a tree." },
    { term: "abstract data type", meaning: "A structure defined by how it behaves, like a queue, separate from how it is built in code." },
    { term: "queue", meaning: "A first in, first out structure: you enqueue at the back and dequeue from the front." },
    { term: "stack", meaning: "A last in, first out structure: you push onto the top and pop from the top." },
    { term: "realloc", meaning: "A function that resizes a block from malloc, copying the old values into the new block." },
    { term: "linked list", meaning: "A list of nodes anywhere in memory, each holding a value and a pointer to the next node." },
    { term: "node", meaning: "One box in a linked structure, holding an item and one or more pointers to other nodes." },
    { term: "-> (arrow)", meaning: "Goes to the address in a pointer and picks a field of the struct there, so n->number means (*n).number." },
    { term: "head", meaning: "The pointer to the first node of a linked list." },
    { term: "binary search tree", meaning: "A tree where every node's left side holds smaller values and its right side holds larger ones." },
    { term: "balanced", meaning: "A tree whose left and right sides are about the same size, so search takes O(log n)." },
    { term: "hash function", meaning: "A function that turns a value, such as a word, into a small number used as an array index." },
    { term: "hash table", meaning: "An array of linked lists where a hash function picks which list each value goes in." },
    { term: "bucket", meaning: "One slot of a hash table's array, holding every value that hashed to that index." },
    { term: "collision", meaning: "When two different values hash to the same bucket." },
    { term: "trie", meaning: "A tree of arrays where each letter of a key picks the next node, giving lookups that do not depend on how many keys are stored." },
    { term: "doubly-linked list", meaning: "A linked list whose nodes point to both the next and the previous node." },
  ],
};

export default content;
