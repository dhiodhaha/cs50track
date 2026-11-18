import type { WeekContent } from "./types";

// Small tables shown inside prompts. Every answer below was checked by
// running the query against exactly these rows in SQLite.
const favorites = `-- favorites
-- Timestamp | language | problem
-- 9:01      | Python   | Hello, World
-- 9:02      | C        | Hello, World
-- 9:05      | Python   | DNA
-- 9:07      | C        | Mario
-- 9:12      | Python   | Hello, It's Me
-- NULL      | Scratch  | Hello, World`;

const shows = `-- shows
-- id | title                | year
-- 1  | The Office           | 2005
-- 2  | Catweazle            | 1970
-- 3  | Parks and Recreation | 2009`;

const showsAndRatings = `${shows}
--
-- ratings
-- show_id | rating
-- 1       | 9.0
-- 2       | 5.5
-- 3       | 8.6`;

const showsAndGenres = `${shows}
--
-- genres
-- show_id | genre
-- 1       | Comedy
-- 2       | Adventure
-- 2       | Comedy
-- 2       | Family
-- 3       | Comedy`;

const content: WeekContent = {
  unitId: "week-7",
  parts: {
    "week-7-lecture-p1": {
      hook: "Hundreds of people filled in a form about their favorite language. How do you find out which language won? You could scroll a spreadsheet and keep tallies, or you could write twenty lines of Python that count for you. This part builds those lines step by step, and each step fixes a weakness of the one before. Watch for the moment a dictionary replaces a pile of separate counters.",
      after: {
        "flat-file-database": [
          {
            kind: "predict",
            id: "week-7-lecture-p1-skip-header",
            prompt: "Here is a tiny favorites.csv. If you delete the next(reader) line, what is the first line the program prints?",
            code: `# favorites.csv
# Timestamp,language,problem
# 10/24/2022 9:01,Python,DNA
# 10/24/2022 9:02,C,Mario

import csv

with open("favorites.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row[1])`,
            language: "python",
            options: ["language", "Python", "Timestamp"],
            answer: 0,
            explanation: "csv.reader treats the header like any other row, so row[1] of the first row is the column name language. next(reader) exists to skip that header.",
          },
          {
            kind: "blank",
            id: "week-7-lecture-p1-next-blank",
            prompt: "Fill the gap so the loop starts at the first real favorite, not the header.",
            code: `reader = csv.reader(file)
____(reader)
for row in reader:
    print(row[1])`,
            language: "python",
            options: ["next", "skip", "del"],
            answer: 0,
            explanation: "next takes one row from the reader and throws it away here, so the for loop continues from the second row.",
          },
          {
            kind: "compare",
            id: "week-7-lecture-p1-reader-vs-dictreader",
            prompt: "Both print every language. Which is the better design?",
            language: "python",
            a: {
              label: "csv.reader",
              code: `reader = csv.reader(file)
next(reader)
for row in reader:
    print(row[1])`,
            },
            b: {
              label: "csv.DictReader",
              code: `reader = csv.DictReader(file)
for row in reader:
    print(row["language"])`,
            },
            answer: "b",
            explanation: "B finds the column by its name from the header, so it keeps working if someone reorders the columns. A trusts that the language is always at index 1.",
          },
          {
            kind: "trace",
            id: "week-7-lecture-p1-count-trace",
            caption: "Trace the dictionary counter on three favorites and watch keys appear.",
            code: `counts = {}
for favorite in ["Python", "C", "Python"]:
    if favorite in counts:
        counts[favorite] += 1
    else:
        counts[favorite] = 1
print(counts)`,
            language: "python",
            steps: [
              { line: 1, vars: { counts: "{}" } },
              { line: 2, vars: { counts: "{}", favorite: "'Python'" } },
              { line: 6, vars: { counts: "{'Python': 1}", favorite: "'Python'" }, note: "'Python' was not a key yet, so the else creates it with 1." },
              { line: 2, vars: { counts: "{'Python': 1}", favorite: "'C'" } },
              { line: 6, vars: { counts: "{'Python': 1, 'C': 1}", favorite: "'C'" } },
              { line: 2, vars: { counts: "{'Python': 1, 'C': 1}", favorite: "'Python'" } },
              { line: 4, vars: { counts: "{'Python': 2, 'C': 1}", favorite: "'Python'" }, note: "This time the key exists, so its count goes up." },
              { line: 7, vars: { counts: "{'Python': 2, 'C': 1}", favorite: "'Python'" }, output: "{'Python': 2, 'C': 1}\n" },
            ],
          },
          {
            kind: "predict",
            id: "week-7-lecture-p1-try-count",
            prompt: "This is the try and except version of the counter. What does it print?",
            code: `counts = {}
for favorite in ["C", "C"]:
    try:
        counts[favorite] += 1
    except KeyError:
        counts[favorite] = 1
print(counts)`,
            language: "python",
            options: ["{'C': 2}", "{'C': 1}", "KeyError"],
            answer: 0,
            explanation: "The first += fails with KeyError because 'C' is missing, and except creates it with 1. The second time the key exists, so += raises nothing and the count becomes 2.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p1-sorted-keys",
            prompt: "In what order are the languages printed?",
            code: `counts = {"Python": 5, "Scratch": 1, "C": 3}
for favorite in sorted(counts):
    print(favorite)`,
            language: "python",
            options: [
              "C, Python, Scratch",
              "Python, C, Scratch",
              "Python, Scratch, C",
            ],
            answer: 0,
            explanation: "sorted on a dictionary sorts its keys, and strings sort alphabetically. The counts play no part unless you pass a key argument.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p1-sorted-get",
            prompt: "Now the sort uses the counts. In what order are the languages printed?",
            code: `counts = {"Python": 5, "Scratch": 1, "C": 3}
for favorite in sorted(counts, key=counts.get, reverse=True):
    print(f"{favorite}: {counts[favorite]}")`,
            language: "python",
            options: [
              "Python: 5, C: 3, Scratch: 1",
              "Scratch: 1, C: 3, Python: 5",
              "C: 3, Python: 5, Scratch: 1",
            ],
            answer: 0,
            explanation: "key=counts.get sorts each language by its value, the count, and reverse=True puts the largest first. Without reverse you would get the smallest first.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-7-lecture-p1-recap-ascending",
        prompt: "Same counts, but reverse=True is gone. What is printed first?",
        code: `counts = {"Python": 5, "Scratch": 1, "C": 3}
for favorite in sorted(counts, key=counts.get):
    print(favorite)`,
        language: "python",
        options: ["Scratch", "Python", "C"],
        answer: 0,
        explanation: "Sorting by value without reverse goes from smallest to largest, and Scratch has the smallest count, 1.",
      },
      exercise: {
        prompt: "Write problems.py that reads favorites.csv with csv.DictReader, counts how many people chose each problem using a dictionary, and prints each problem with its count, most popular first. Check it on a small CSV you write yourself, where you can count by hand.",
        language: "python",
        starter: `import csv

with open("favorites.csv", "r") as file:
    reader = csv.DictReader(file)
    counts = {}
    # TODO: count each row["problem"]

# TODO: print each problem and its count, most popular first`,
        hints: [
          "The counting loop is the language counter from the notes with a different column name.",
          "sorted has a key parameter that can sort by the dictionary's values.",
          "reverse=True puts the largest count first.",
        ],
        solution: `import csv

with open("favorites.csv", "r") as file:
    reader = csv.DictReader(file)
    counts = {}
    for row in reader:
        problem = row["problem"]
        if problem in counts:
            counts[problem] += 1
        else:
            counts[problem] = 1

for problem in sorted(counts, key=counts.get, reverse=True):
    print(f"{problem}: {counts[problem]}")

# The dictionary grows one key per new problem, so no list of counters is
# needed. key=counts.get sorts by count instead of alphabetically.`,
      },
      recall: [
        {
          id: "week-7-lecture-p1-r1",
          prompt: "What makes a CSV file a flat-file database?",
          options: [
            "All the data sits in one table stored as a single text file",
            "It can only hold numbers",
            "It is stored in a compressed binary format",
          ],
          answer: 0,
          explanation: "A flat file has one table, row after row, with a separator such as a comma between columns.",
        },
        {
          id: "week-7-lecture-p1-r2",
          prompt: "Why is row[\"language\"] with DictReader safer than row[1] with csv.reader?",
          options: [
            "It still works if the columns are moved around",
            "It runs much faster",
            "It skips empty rows automatically",
          ],
          answer: 0,
          explanation: "DictReader uses the header to name each column, so you depend on the name, not on the position.",
        },
        {
          id: "week-7-lecture-p1-r3",
          prompt: "What does except KeyError handle in the counting loop?",
          options: [
            "The first time a language appears, before it has a key in counts",
            "A language spelled in lowercase",
            "A row with too many columns",
          ],
          answer: 0,
          explanation: "counts[favorite] += 1 needs an existing value. When the key is missing Python raises KeyError, and except sets it to 1.",
        },
        {
          id: "week-7-lecture-p1-r4",
          prompt: "In sorted(counts, key=counts.get, reverse=True), what does key=counts.get do?",
          options: [
            "Sorts the languages by their counts instead of by name",
            "Removes languages with a count of 0",
            "Returns the counts instead of the languages",
          ],
          answer: 0,
          explanation: "For each key, sorted calls counts.get to find the value it should sort by. The result is still a list of keys.",
        },
      ],
    },
    "week-7-lecture-p2": {
      hook: "Counting favorites in Python took a loop, a dictionary and a sort. In SQL the same answer is one line that says what you want rather than how to get it. That makes SQL powerful and also dangerous: one missing WHERE can change every row in a table. Predict each result on the six-row table below before you run anything on real data.",
      after: {
        "relational-databases": [
          {
            kind: "predict",
            id: "week-7-lecture-p2-count-distinct",
            prompt: "Using this favorites table, what does the query return?",
            code: `${favorites}

SELECT COUNT(DISTINCT language) FROM favorites;`,
            language: "sql",
            options: ["6", "3", "1"],
            answer: 1,
            explanation: "DISTINCT keeps each language once: Python, C and Scratch. COUNT then counts those 3. Plain COUNT(*) would count all 6 rows.",
          },
          {
            kind: "demo",
            id: "week-7-lecture-p2-sql-demo",
            demo: "sql",
            caption: "Before you change each setting, predict which rows survive the WHERE. Notice that ORDER BY only changes the order of the rows, never which rows appear.",
          },
        ],
        select: [
          {
            kind: "predict",
            id: "week-7-lecture-p2-group-by",
            prompt: "Using the favorites table, what single row does this return?",
            code: `${favorites}

SELECT language, COUNT(*) AS n FROM favorites
GROUP BY language
ORDER BY n DESC
LIMIT 1;`,
            language: "sql",
            options: ["Python | 3", "C | 2", "Scratch | 1", "Python | 6"],
            answer: 0,
            explanation: "GROUP BY makes one group per language and COUNT(*) counts the rows in each: Python 3, C 2, Scratch 1. ORDER BY n DESC puts the largest first, and LIMIT 1 keeps only that row.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p2-like",
            prompt: "How many rows does this count?",
            code: `${favorites}

SELECT COUNT(*) FROM favorites
WHERE language = 'Python' AND problem LIKE 'Hello, %';`,
            language: "sql",
            options: ["1", "2", "3"],
            answer: 1,
            explanation: "% matches any run of characters, so both Hello, World and Hello, It's Me match. AND also requires Python, which rules out DNA and the C and Scratch rows.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p2-and-or",
            prompt: "AND became OR. How many rows does this count now?",
            code: `${favorites}

SELECT COUNT(*) FROM favorites
WHERE language = 'C' OR problem = 'Hello, World';`,
            language: "sql",
            options: ["1", "4", "5"],
            answer: 1,
            explanation: "OR keeps a row if either side is true: the 2 C rows plus the 3 Hello, World rows. The C row with Hello, World is counted once, so the total is 4, not 5.",
          },
          {
            kind: "blank",
            id: "week-7-lecture-p2-quote-blank",
            prompt: "Fill the gap so the query counts the Hello, It's Me row.",
            code: `SELECT COUNT(*) FROM favorites WHERE problem = ____;`,
            language: "sql",
            options: ["'Hello, It''s Me'", "'Hello, It's Me'", "'Hello, It\\'s Me'"],
            answer: 0,
            explanation: "Inside a SQL string, two single quotes in a row stand for one quote character. A lone quote ends the string early, and SQLite does not treat backslash as an escape, so the other two are syntax errors.",
          },
        ],
        insert: [
          {
            kind: "predict",
            id: "week-7-lecture-p2-insert-null",
            prompt: "This INSERT names only two of the three columns. What is the new row's Timestamp?",
            code: `INSERT INTO favorites (language, problem)
VALUES ('SQL', 'Fiftyville');`,
            language: "sql",
            options: ["NULL", "The current time", "An error, because Timestamp is missing"],
            answer: 0,
            explanation: "A column you leave out of an INSERT gets NULL, meaning no value, unless the table gives it a default. Nothing fills in the time for you.",
          },
        ],
        delete: [
          {
            kind: "predict",
            id: "week-7-lecture-p2-delete-null",
            prompt: "Start from the six-row table, run the INSERT above, then this DELETE. How many rows are left?",
            code: `${favorites}

DELETE FROM favorites WHERE Timestamp IS NULL;`,
            language: "sql",
            options: ["6", "5", "7"],
            answer: 1,
            explanation: "After the INSERT there are 7 rows, and two have no Timestamp: the Scratch row and the new SQL row. Both are deleted, which leaves 5.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p2-equals-null",
            prompt: "On the six-row table, someone writes = instead of IS. How many rows does this delete?",
            code: `DELETE FROM favorites WHERE Timestamp = NULL;`,
            language: "sql",
            options: ["0", "1", "6"],
            answer: 0,
            explanation: "NULL means unknown, so comparing anything to it with = is never true, not even NULL = NULL. Always test for missing values with IS NULL.",
          },
        ],
        update: [
          {
            kind: "predict",
            id: "week-7-lecture-p2-update-all",
            prompt: "On the six-row table, you run this UPDATE. How many rows now have language SQL?",
            code: `UPDATE favorites SET language = 'SQL', problem = 'Fiftyville';`,
            language: "sql",
            options: ["1", "6", "0"],
            answer: 1,
            explanation: "Without a WHERE, UPDATE changes every row. That is why the notes warn about permissions and backups before you run commands like this.",
          },
          {
            kind: "trace",
            id: "week-7-lecture-p2-crud-trace",
            caption: "Run five statements in order and watch the table's rows change.",
            code: `CREATE TABLE favorites (language TEXT, problem TEXT);
INSERT INTO favorites (language, problem) VALUES ('C', 'Mario');
INSERT INTO favorites (language, problem) VALUES ('Python', 'DNA');
UPDATE favorites SET problem = 'Cash' WHERE language = 'C';
DELETE FROM favorites WHERE language = 'Python';
SELECT COUNT(*) FROM favorites;`,
            language: "sql",
            steps: [
              { line: 1, vars: { favorites: "(no rows)" }, note: "CREATE sets up the columns. The table starts empty." },
              { line: 2, vars: { favorites: "C | Mario" } },
              { line: 3, vars: { favorites: "C | Mario; Python | DNA" } },
              { line: 4, vars: { favorites: "C | Cash; Python | DNA" }, note: "WHERE limits the change to the C row." },
              { line: 5, vars: { favorites: "C | Cash" } },
              { line: 6, vars: { favorites: "C | Cash" }, output: "1\n", note: "Only SELECT shows you anything. The others changed the table silently." },
            ],
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-7-lecture-p2-recap-order",
        prompt: "Back to counting by language, now without DESC. Which row comes first?",
        code: `${favorites}

SELECT language, COUNT(*) FROM favorites
GROUP BY language
ORDER BY COUNT(*);`,
        language: "sql",
        options: ["Scratch | 1", "Python | 3", "C | 2"],
        answer: 0,
        explanation: "ORDER BY sorts from smallest to largest unless you add DESC, so the language with the fewest rows comes first.",
      },
      exercise: {
        prompt: "Open the lecture's favorites.db with sqlite3 favorites.db. Write one query that lists each problem with how many people chose it, most popular first, naming the count n. Then write a second query that counts the favorites whose problem starts with Hello. Check each answer against SELECT * FROM favorites; on a few rows.",
        language: "sql",
        starter: `-- 1. Each problem and how many chose it, most popular first

-- 2. How many favorites have a problem that starts with Hello`,
        hints: [
          "The first query is the language count from the notes, grouped by a different column.",
          "AS n gives the count a name you can use in ORDER BY.",
          "LIKE with % after a prefix matches anything that starts with it.",
        ],
        solution: `-- 1. Each problem and how many chose it, most popular first
SELECT problem, COUNT(*) AS n FROM favorites
GROUP BY problem
ORDER BY n DESC;

-- 2. How many favorites have a problem that starts with Hello
SELECT COUNT(*) FROM favorites WHERE problem LIKE 'Hello%';

-- GROUP BY makes one row per problem and COUNT(*) counts each group.
-- LIKE 'Hello%' matches any problem that begins with Hello.`,
      },
      recall: [
        {
          id: "week-7-lecture-p2-r1",
          prompt: "What does COUNT(DISTINCT language) count?",
          options: [
            "How many different languages appear",
            "How many rows the table has",
            "How many times the most popular language appears",
          ],
          answer: 0,
          explanation: "DISTINCT removes repeats first, then COUNT counts what is left.",
        },
        {
          id: "week-7-lecture-p2-r2",
          prompt: "What does UPDATE favorites SET problem = 'Mario'; do when there is no WHERE?",
          options: ["Changes every row", "Changes only the first row", "Fails with an error"],
          answer: 0,
          explanation: "WHERE is what limits an UPDATE or DELETE. Leave it out and the command applies to the whole table.",
        },
        {
          id: "week-7-lecture-p2-r3",
          prompt: "How do you select the rows whose Timestamp is missing?",
          options: ["WHERE Timestamp IS NULL", "WHERE Timestamp = NULL", "WHERE Timestamp = ''"],
          answer: 0,
          explanation: "= NULL is never true, because NULL means unknown. IS NULL is the test for a missing value.",
        },
        {
          id: "week-7-lecture-p2-r4",
          prompt: "What does LIMIT 1 do at the end of a query with ORDER BY n DESC?",
          options: [
            "Keeps only the top row after sorting",
            "Keeps only rows where n is 1",
            "Sorts only the first row",
          ],
          answer: 0,
          explanation: "ORDER BY runs first and LIMIT then cuts the result down, so you get the row with the largest n.",
        },
        {
          id: "week-7-lecture-p2-r5",
          prompt: "Which four operations does CRUD stand for?",
          options: [
            "Create, Read, Update, Delete",
            "Count, Read, Update, Drop",
            "Create, Run, Undo, Delete",
          ],
          answer: 0,
          explanation: "In SQL these map to CREATE and INSERT, SELECT, UPDATE, and DELETE.",
        },
      ],
    },
    "week-7-lecture-p3": {
      hook: "A show can have one star or dozens. Put stars in spreadsheet columns and you waste space or run out of columns. The answer is to split the data into tables that point at each other by id, and then join them back together when you ask a question. Keep the small tables below in view, and predict each result by following the ids by hand.",
      after: {
        imdb: [
          {
            kind: "compare",
            id: "week-7-lecture-p3-star-columns",
            prompt: "Two ways to store which people starred in which show. Which is the better design?",
            language: "sql",
            a: {
              label: "star columns",
              code: `CREATE TABLE shows (
    title TEXT,
    star1 TEXT,
    star2 TEXT,
    star3 TEXT,
    star4 TEXT
);`,
            },
            b: {
              label: "separate tables",
              code: `CREATE TABLE shows (id INTEGER, title TEXT, PRIMARY KEY(id));
CREATE TABLE people (id INTEGER, name TEXT, PRIMARY KEY(id));
CREATE TABLE stars (show_id INTEGER, person_id INTEGER);`,
            },
            answer: "b",
            explanation: "In A, a show with one star leaves three empty columns, and a show with five stars does not fit. B stores each person once and adds one stars row per appearance, however many there are.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p3-foreign-key",
            prompt: "In the ratings table, what role does show_id play?",
            code: showsAndRatings,
            language: "sql",
            options: [
              "A foreign key: it points to id, the primary key of shows",
              "The primary key of ratings, unrelated to shows",
              "A copy of the show's title",
            ],
            answer: 0,
            explanation: "A primary key identifies each row in its own table, like shows.id. A foreign key such as ratings.show_id refers to that primary key to link the tables.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p3-nested",
            prompt: "Using these two tables, which titles does the nested query return?",
            code: `${showsAndRatings}

SELECT title FROM shows WHERE id IN (
    SELECT show_id FROM ratings WHERE rating >= 6.0
);`,
            language: "sql",
            options: [
              "The Office and Parks and Recreation",
              "Only The Office",
              "All three shows",
            ],
            answer: 0,
            explanation: "The inner query runs first and returns show ids 1 and 3, whose ratings are 9.0 and 8.6. The outer query then returns the titles whose id is in that list.",
          },
        ],
        joins: [
          {
            kind: "predict",
            id: "week-7-lecture-p3-join-rows",
            prompt: "How many rows does this JOIN return for Catweazle?",
            code: `${showsAndGenres}

SELECT * FROM shows
JOIN genres ON shows.id = genres.show_id
WHERE id = 2;`,
            language: "sql",
            options: ["1", "3", "5"],
            answer: 1,
            explanation: "Catweazle has three genres rows, one-to-many, so the join pairs its single shows row with each of them. The title repeats on all three rows, which is fine for a temporary table.",
          },
          {
            kind: "trace",
            id: "week-7-lecture-p3-nested-trace",
            caption: "Evaluate the Steve Carell query from the innermost SELECT outward.",
            code: `SELECT title FROM shows WHERE id IN
    (SELECT show_id FROM stars WHERE person_id =
        (SELECT id FROM people WHERE name = 'Steve Carell'));`,
            language: "sql",
            steps: [
              { line: 3, vars: { "Steve Carell's id": "10" }, note: "people has (10, Steve Carell), (11, Amy Poehler), (12, Rainn Wilson)." },
              { line: 2, vars: { "Steve Carell's id": "10", "his show_ids": "1" }, note: "stars has (1, 10), (1, 12), (3, 11). Only (1, 10) has person_id 10." },
              { line: 1, vars: { "Steve Carell's id": "10", "his show_ids": "1" }, output: "The Office\n", note: "shows.id 1 is The Office." },
            ],
          },
          {
            kind: "blank",
            id: "week-7-lecture-p3-join-on-blank",
            prompt: "Fill the gap so the second JOIN connects each stars row to its person.",
            code: `SELECT title FROM shows
JOIN stars ON shows.id = stars.show_id
JOIN people ON stars.person_id = ____
WHERE name = 'Steve Carell';`,
            language: "sql",
            options: ["people.id", "people.name", "stars.show_id"],
            answer: 0,
            explanation: "stars.person_id is a foreign key that holds a person's id, so it must match people.id, the primary key it points to.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p3-like",
            prompt: "people has Steve Carell, Amy Poehler, Rainn Wilson and Steve Coogan. Which names come back?",
            code: `SELECT name FROM people WHERE name LIKE 'Steve C%';`,
            language: "sql",
            options: [
              "Steve Carell and Steve Coogan",
              "Only Steve Carell",
              "No rows, because no name is exactly Steve C%",
            ],
            answer: 0,
            explanation: "% stands for any run of characters, so every name that starts with Steve C matches. = would look for the exact text instead.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-7-lecture-p3-recap-join",
        prompt: "Back to shows and ratings, now joined. What does this return?",
        code: `${showsAndRatings}

SELECT title, rating FROM shows
JOIN ratings ON shows.id = ratings.show_id
ORDER BY rating DESC
LIMIT 1;`,
        language: "sql",
        options: [
          "The Office | 9.0",
          "Parks and Recreation | 8.6",
          "Catweazle | 5.5",
        ],
        answer: 0,
        explanation: "The JOIN lines each show up with its rating by matching ids. Sorting by rating from highest and keeping one row gives The Office.",
      },
      exercise: {
        prompt: "Save the starter as tiny.sql and run sqlite3 tiny.db, then .read tiny.sql. Write a query with JOINs that lists the titles of comedies rated 8.0 or higher, then a query that lists each genre with how many shows have it, largest first, ties in alphabetical order. You should get The Office and Parks and Recreation, then Comedy 3, Adventure 1, Family 1.",
        language: "sql",
        starter: `CREATE TABLE shows (id INTEGER, title TEXT NOT NULL, year NUMERIC, PRIMARY KEY(id));
CREATE TABLE ratings (show_id INTEGER NOT NULL, rating REAL NOT NULL, FOREIGN KEY(show_id) REFERENCES shows(id));
CREATE TABLE genres (show_id INTEGER NOT NULL, genre TEXT NOT NULL, FOREIGN KEY(show_id) REFERENCES shows(id));

INSERT INTO shows (id, title, year) VALUES (1, 'The Office', 2005), (2, 'Catweazle', 1970), (3, 'Parks and Recreation', 2009);
INSERT INTO ratings (show_id, rating) VALUES (1, 9.0), (2, 5.5), (3, 8.6);
INSERT INTO genres (show_id, genre) VALUES (1, 'Comedy'), (2, 'Adventure'), (2, 'Comedy'), (2, 'Family'), (3, 'Comedy');

-- 1. Titles of comedies rated 8.0 or higher

-- 2. Each genre and how many shows have it`,
        hints: [
          "Join shows to genres on the show's id, then join ratings the same way.",
          "Both conditions go in one WHERE, joined by AND.",
          "For the second query, GROUP BY genre and ORDER BY can take two columns separated by a comma.",
        ],
        solution: `-- 1. Titles of comedies rated 8.0 or higher
SELECT title FROM shows
JOIN genres ON shows.id = genres.show_id
JOIN ratings ON shows.id = ratings.show_id
WHERE genre = 'Comedy' AND rating >= 8.0;

-- 2. Each genre and how many shows have it
SELECT genre, COUNT(*) AS n FROM genres
GROUP BY genre
ORDER BY n DESC, genre;

-- Each JOIN matches a foreign key, show_id, to the primary key shows.id.
-- Sorting by n first and genre second makes the order of ties predictable.`,
      },
      recall: [
        {
          id: "week-7-lecture-p3-r1",
          prompt: "What is the difference between a primary key and a foreign key?",
          options: [
            "A primary key identifies a row in its own table; a foreign key refers to a primary key in another table",
            "A primary key is always text; a foreign key is always a number",
            "A table can have many primary keys but only one foreign key",
          ],
          answer: 0,
          explanation: "shows.id identifies each show. ratings.show_id and genres.show_id point back to it.",
        },
        {
          id: "week-7-lecture-p3-r2",
          prompt: "One show can have many genres. What kind of relationship is that?",
          options: ["One-to-many", "One-to-one", "Many-to-many"],
          answer: 0,
          explanation: "Each genres row belongs to one show, but a show can have several genres rows. Shows and ratings are one-to-one, and people and shows are many-to-many.",
        },
        {
          id: "week-7-lecture-p3-r3",
          prompt: "Why does WHERE id IN (SELECT ...) use IN rather than =?",
          options: [
            "The inner query can return several ids, and IN checks membership in that list",
            "IN is faster than = in every case",
            "= cannot be used with numbers",
          ],
          answer: 0,
          explanation: "= compares with a single value. When the subquery might return more than one row, IN tests whether the id is any of them.",
        },
        {
          id: "week-7-lecture-p3-r4",
          prompt: "In JOIN ratings ON shows.id = ratings.show_id, what does the ON part do?",
          options: [
            "Says which rows of the two tables belong together",
            "Filters out shows with low ratings",
            "Sorts the joined rows",
          ],
          answer: 0,
          explanation: "ON pairs each show with the ratings row whose show_id equals its id, building one wider temporary table.",
        },
      ],
    },
    "week-7-lecture-p4": {
      hook: "Your queries now run on real data, from Python, with input typed by strangers. That brings three new questions. How do you keep a search fast when a table has millions of rows? What happens when two people change the same row at the same moment? And what if someone types SQL into your login box? This part answers each one, and the last answer is a single character: ?.",
      after: {
        indexes: [
          {
            kind: "predict",
            id: "week-7-lecture-p4-index-what",
            prompt: "You run CREATE INDEX title_index ON shows (title);. Which query is it built to speed up?",
            options: [
              "SELECT * FROM shows WHERE title = 'The Office';",
              "SELECT * FROM shows WHERE year = 2005;",
              "SELECT COUNT(*) FROM ratings;",
            ],
            answer: 0,
            explanation: "The index organises the title column into a B-tree so the database can find a title without scanning every row. It does nothing for searches on other columns or other tables.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p4-index-cost",
            prompt: "If indexes make searches faster, why not index every column?",
            options: [
              "Each index takes extra storage space, so you trade space for speed",
              "SQLite allows only one index per database",
              "Indexes make every SELECT slower",
            ],
            answer: 0,
            explanation: "An index is an extra data structure stored alongside the table. Index the columns you search often, such as names and foreign keys like person_id.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p4-btree",
            prompt: "How does a B-tree differ from the binary trees you met in week 5?",
            options: [
              "A node can have more than two children",
              "It can only store numbers",
              "It is always searched linearly",
            ],
            answer: 0,
            explanation: "More children per node keeps the tree short and wide, so finding a value takes only a few steps down from the root.",
          },
        ],
        "using-sql-in-python": [
          {
            kind: "blank",
            id: "week-7-lecture-p4-db-open-blank",
            prompt: "Fill the gap so Python opens the favorites.db database with the CS50 Library.",
            code: `from cs50 import SQL

db = SQL("____")`,
            language: "python",
            options: ["sqlite:///favorites.db", "favorites.csv", "sqlite3 favorites.db"],
            answer: 0,
            explanation: "SQL takes a URL that names the database engine and the file. sqlite3 favorites.db is the terminal command, not something Python understands.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p4-rows-n",
            prompt: "favorites has two rows whose problem is Mario. What does the last line print?",
            code: `rows = db.execute("SELECT COUNT(*) AS n FROM favorites WHERE problem = ?", "Mario")
print(rows[0]["n"])`,
            language: "python",
            options: ["2", "[{'n': 2}]", "{'n': 2}"],
            answer: 0,
            explanation: "db.execute returns a list of dictionaries, one per row. rows[0] is the only row, and [\"n\"] reads the column named by AS n.",
          },
          {
            kind: "trace",
            id: "week-7-lecture-p4-rows-trace",
            caption: "Loop over rows shaped like db.execute's result, one dictionary per row.",
            code: `rows = [{"language": "Python", "n": 2}, {"language": "C", "n": 1}]
for row in rows:
    print(row["language"], row["n"])`,
            language: "python",
            steps: [
              { line: 1, vars: { rows: "[{'language': 'Python', 'n': 2}, {'language': 'C', 'n': 1}]" }, note: "What a GROUP BY query returns: a list with one dictionary per row." },
              { line: 2, vars: { rows: "(2 rows)", row: "{'language': 'Python', 'n': 2}" } },
              { line: 3, vars: { rows: "(2 rows)", row: "{'language': 'Python', 'n': 2}" }, output: "Python 2\n" },
              { line: 2, vars: { rows: "(2 rows)", row: "{'language': 'C', 'n': 1}" }, output: "Python 2\n" },
              { line: 3, vars: { rows: "(2 rows)", row: "{'language': 'C', 'n': 1}" }, output: "Python 2\nC 1\n" },
            ],
          },
        ],
        "race-conditions": [
          {
            kind: "predict",
            id: "week-7-lecture-p4-race",
            prompt: "A post has 10 likes. Two users click like at the same instant: each program reads 10, adds 1, and writes the result back. What is stored at the end?",
            options: ["12", "11", "10"],
            answer: 1,
            explanation: "Both programs read 10 before either writes, so both write 11 and one like is lost. Wrapping the read and write in BEGIN TRANSACTION and COMMIT makes them happen as one step.",
          },
        ],
        "sql-injection-attacks": [
          {
            kind: "compare",
            id: "week-7-lecture-p4-fstring-vs-placeholder",
            prompt: "Both check a login. Which should you write?",
            language: "python",
            a: {
              label: "f-string",
              code: `rows = db.execute(f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'")`,
            },
            b: {
              label: "placeholders",
              code: `rows = db.execute("SELECT * FROM users WHERE username = ? AND password = ?", username, password)`,
            },
            answer: "b",
            explanation: "In A, whatever the user types becomes part of the SQL itself, quotes and all. In B, the library fills each ? with a safely quoted value, so input can only ever be data, never code.",
          },
          {
            kind: "predict",
            id: "week-7-lecture-p4-injection",
            prompt: "Using version A, an attacker types admin'-- as the username and anything as the password. What does the query return?",
            code: `SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything'`,
            language: "sql",
            options: [
              "No rows, because the password is wrong",
              "The admin row: -- turns the password check into a comment",
              "A syntax error",
            ],
            answer: 1,
            explanation: "The typed quote closes the username string, and -- starts a SQL comment, so the rest of the line is ignored. The query only asks for username = 'admin', and the attacker is in without a password.",
          },
          {
            kind: "blank",
            id: "week-7-lecture-p4-placeholder-blank",
            prompt: "Fill the gap so the username is passed safely.",
            code: `rows = db.execute("SELECT * FROM users WHERE username = ____", username)`,
            language: "python",
            options: ["?", "'{username}'", "username"],
            answer: 0,
            explanation: "? marks where the library inserts the next argument, escaped. Without an f, '{username}' is literal text, and a bare username would be read as a column name.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-7-lecture-p4-recap-placeholder",
        prompt: "Same attack, but the code uses ? placeholders. The attacker types admin'-- and anything. What comes back?",
        code: `rows = db.execute("SELECT * FROM users WHERE username = ? AND password = ?", username, password)`,
        language: "python",
        options: [
          "No rows",
          "The admin row",
          "Every row in users",
        ],
        answer: 0,
        explanation: "The whole input, quote and dashes included, is treated as one username. No user is literally named admin'--, so nothing matches.",
      },
      exercise: {
        prompt: "Write popular.py that opens the lecture's favorites.db with the CS50 Library, asks for a language with input, and prints how many people chose it, using a ? placeholder. Typing Python should print a count. Typing Python' OR '1'='1 should print 0, not the size of the whole table.",
        language: "python",
        starter: `from cs50 import SQL

db = SQL("sqlite:///favorites.db")

language = input("Language: ")

# TODO: count favorites with that language, safely, and print the count`,
        hints: [
          "COUNT(*) AS n gives the result column a name you can read in Python.",
          "Put a ? where the language goes and pass language as the next argument to db.execute.",
          "db.execute returns a list of dictionaries; the count is in the first one.",
        ],
        solution: `from cs50 import SQL

db = SQL("sqlite:///favorites.db")

language = input("Language: ")

rows = db.execute("SELECT COUNT(*) AS n FROM favorites WHERE language = ?", language)
print(rows[0]["n"])

# The ? keeps the input as data: the quote in Python' OR '1'='1 is escaped,
# so the database looks for a language with that exact strange name.`,
      },
      recall: [
        {
          id: "week-7-lecture-p4-r1",
          prompt: "What is the trade-off of creating an index?",
          options: [
            "Faster searches on that column, at the cost of extra storage",
            "Smaller database, at the cost of slower searches",
            "No cost at all",
          ],
          answer: 0,
          explanation: "The index is a B-tree stored in addition to the table, so it takes space.",
        },
        {
          id: "week-7-lecture-p4-r2",
          prompt: "What does db.execute return for a SELECT?",
          options: [
            "A list of dictionaries, one per row, keyed by column name",
            "A single number",
            "A CSV string",
          ],
          answer: 0,
          explanation: "Even a query with one result returns a list, which is why the notes read rows[0] first.",
        },
        {
          id: "week-7-lecture-p4-r3",
          prompt: "Why use ? placeholders instead of putting user input into the SQL string yourself?",
          options: [
            "The library escapes the input, so it cannot change the query's meaning",
            "Queries with ? run faster",
            "SQL does not allow quotes",
          ],
          answer: 0,
          explanation: "Never trust user input. With ?, characters such as ' and -- stay inside the value instead of becoming SQL.",
        },
        {
          id: "week-7-lecture-p4-r4",
          prompt: "Which SQL features help avoid race conditions?",
          options: [
            "BEGIN TRANSACTION, COMMIT and ROLLBACK",
            "GROUP BY and ORDER BY",
            "CREATE INDEX",
          ],
          answer: 0,
          explanation: "A transaction groups several statements so they take effect together or not at all, and other users cannot slip changes in between.",
        },
      ],
    },
  },
  section: {
    recall: [
      {
        id: "week-7-section-r1",
        prompt: "The friend table has id INTEGER NOT NULL with PRIMARY KEY(id). You run INSERT INTO friend (name, age) VALUES ('Alice', 25); on the empty table. What is Alice's id?",
        options: ["1", "NULL", "0"],
        answer: 0,
        explanation: "An INTEGER primary key you leave out is filled in for you with the next number, starting at 1, so every row stays uniquely identified.",
      },
      {
        id: "week-7-section-r2",
        prompt: "Which statement about these two queries is always true?",
        code: `SELECT name FROM songs WHERE danceability > 0.75 AND energy > 0.75;
SELECT name FROM songs WHERE danceability > 0.75 OR energy > 0.75;`,
        options: [
          "The OR query returns at least as many songs as the AND query",
          "The AND query returns at least as many songs as the OR query",
          "They always return the same number of songs",
        ],
        answer: 0,
        explanation: "AND needs both conditions true and OR needs only one, so OR can only keep the same rows or more.",
      },
      {
        id: "week-7-section-r3",
        prompt: "Several artists were born after 1980. Which outer query is right?",
        options: [
          "SELECT * FROM songs WHERE artist_id IN (SELECT id FROM artists WHERE birth_year > 1980);",
          "SELECT * FROM songs WHERE artist_id = (SELECT id FROM artists WHERE birth_year > 1980);",
        ],
        answer: 0,
        explanation: "The inner query can return many ids. IN checks against all of them, while = compares with just one value.",
      },
      {
        id: "week-7-section-r4",
        prompt: "What does SELECT AVG(energy) FROM songs; return?",
        options: [
          "One row holding the average energy of all songs",
          "Every song with its energy",
          "The number of songs",
        ],
        answer: 0,
        explanation: "Aggregate functions like AVG and COUNT collapse many rows into a single value.",
      },
      {
        id: "week-7-section-r5",
        prompt: "Why should employee relationships refer to employees by id rather than by name?",
        options: [
          "Two employees can share a name, but each id is unique",
          "Names cannot be stored as TEXT",
          "ids make the table use more space",
        ],
        answer: 0,
        explanation: "Each piece of data lives in one place and is referred to by its primary key, so two people named Alice are never confused.",
      },
    ],
    exercise: {
      prompt: "Run sqlite3 friends.db and create a table friend with columns id, name and age, all NOT NULL, with id as the primary key. Insert Alice 25, Bob 32 and Charlie 42 without giving ids, change Alice's age to 26, then delete Bob. SELECT * FROM friend; should show 1|Alice|26 and 3|Charlie|42, and SELECT AVG(age) FROM friend; should show 34.0.",
      language: "sql",
      starter: `-- 1. CREATE TABLE friend ...

-- 2. Three INSERTs

-- 3. UPDATE Alice's age

-- 4. DELETE Bob

SELECT * FROM friend;
SELECT AVG(age) FROM friend;`,
      hints: [
        "Each column is written as name, type, then constraints, for example name TEXT NOT NULL.",
        "List only (name, age) in each INSERT so the id is filled in for you.",
        "UPDATE and DELETE both need a WHERE, or they affect every friend.",
      ],
      solution: `CREATE TABLE friend (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO friend (name, age) VALUES ('Alice', 25);
INSERT INTO friend (name, age) VALUES ('Bob', 32);
INSERT INTO friend (name, age) VALUES ('Charlie', 42);

UPDATE friend SET age = 26 WHERE name = 'Alice';

DELETE FROM friend WHERE name = 'Bob';

SELECT * FROM friend;
SELECT AVG(age) FROM friend;

-- The ids 1, 2 and 3 are assigned on insert, and deleting Bob leaves a gap
-- at 2. The average is (26 + 42) / 2 = 34.0.`,
    },
  },
  shorts: {
    "week-7-short-sql": {
      recall: [
        {
          id: "week-7-short-sql-r1",
          prompt: "users has idnum values 10, 11 and 12. How many passwords does this return?",
          code: `SELECT password FROM users WHERE idnum < 12;`,
          options: ["2", "3", "1"],
          answer: 0,
          explanation: "Only 10 and 11 are less than 12. 12 is not less than itself.",
        },
        {
          id: "week-7-short-sql-r2",
          prompt: "users has jerry, gcostanza and newman. moms has jerry, gcostanza and kramer. How many rows does a JOIN ON users.username = moms.username return?",
          options: ["2", "3", "4"],
          answer: 0,
          explanation: "A JOIN keeps only the usernames found in both tables, jerry and gcostanza. newman and kramer each appear in just one.",
        },
        {
          id: "week-7-short-sql-r3",
          prompt: "Why is a primary key often an INTEGER set to autoincrement?",
          options: [
            "Each new row gets a unique id automatically, even if you forget to supply one",
            "It makes text columns shorter",
            "It sorts the table alphabetically",
          ],
          answer: 0,
          explanation: "Every row must be uniquely identifiable. Letting the database pick the next number means you cannot accidentally reuse or skip giving an id.",
        },
        {
          id: "week-7-short-sql-r4",
          prompt: "What is the general shape of an UPDATE?",
          options: [
            "UPDATE table SET column = value WHERE predicate",
            "UPDATE column IN table TO value",
            "SET table.column = value WHERE predicate",
          ],
          answer: 0,
          explanation: "You name the table, SET the new value for a column, and use WHERE to choose which rows change.",
        },
      ],
    },
  },
  glossary: [
    { term: "flat-file database", meaning: "Data kept as a single table in a plain text file, such as a CSV." },
    { term: "relational database", meaning: "A database that stores data in several tables linked to each other by keys." },
    { term: "SQL", meaning: "Structured Query Language: the language for creating, reading, updating and deleting data in a relational database." },
    { term: "CRUD", meaning: "Create, Read, Update, Delete: the four basic things you do with stored data." },
    { term: "table", meaning: "A set of rows that all share the same columns, like one sheet of a spreadsheet." },
    { term: "query", meaning: "A SQL statement that asks the database a question or tells it to change something." },
    { term: "NULL", meaning: "A special value meaning no value at all, tested with IS NULL rather than = NULL." },
    { term: "aggregate function", meaning: "A function such as COUNT, AVG, MAX or MIN that turns many rows into one value." },
    { term: "GROUP BY", meaning: "A clause that collects rows with the same value into groups so an aggregate can be applied to each group." },
    { term: "primary key", meaning: "A column whose value uniquely identifies each row in its table, such as shows.id." },
    { term: "foreign key", meaning: "A column that holds another table's primary key, such as ratings.show_id, to link the two tables." },
    { term: "JOIN", meaning: "A way to combine rows of two tables into one temporary table by matching columns, usually a foreign key to a primary key." },
    { term: "subquery", meaning: "A SELECT nested inside another query, whose result the outer query uses." },
    { term: "index", meaning: "An extra data structure, a B-tree, that makes searching a column faster at the cost of space." },
    { term: "B-tree", meaning: "A tree whose nodes can have more than two children, which keeps it short so lookups take few steps." },
    { term: "race condition", meaning: "A bug where two actions happen at nearly the same time and the result depends on which goes first." },
    { term: "transaction", meaning: "A group of statements, started with BEGIN TRANSACTION, that take effect together or not at all." },
    { term: "SQL injection", meaning: "An attack where input typed by a user is run as part of a SQL query." },
    { term: "placeholder", meaning: "A ? in a query that the library fills in with a safely escaped value." },
  ],
};

export default content;
