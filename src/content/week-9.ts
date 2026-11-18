import type { WeekContent } from "./types";

/** Code block from a raw template: keeps backslashes, drops the first and last newline. */
const code = (s: TemplateStringsArray) =>
  String.raw(s).replace(/\r/g, "").replace(/^\n/, "").replace(/\n$/, "");

const SPORTS = "['Basketball', 'Soccer', 'Ultimate Frisbee']";

const content: WeekContent = {
  unitId: "week-9",
  parts: {
    "week-9-lecture-p1": {
      hook: "So far your pages were fixed files: every visitor got the same bytes. Real sites answer differently depending on who asks and what they ask for. Flask lets Python sit behind a URL, read what arrived with the request, and build the reply on the spot. Everything this week, from forms to logins to shopping carts, grows from that one idea.",
      after: {
        "http-server": [
          {
            kind: "predict",
            id: "week-9-lecture-p1-static-dynamic",
            prompt: "Which of these pages needs code running on the server, not just a file?",
            options: [
              "An about page that never changes",
              "A page that says hello to whatever name is in the URL",
              "A page styled with a CSS file",
              "A page that shows an image",
            ],
            answer: 1,
            explanation:
              "The greeting depends on the request, so a program must build the HTML when the request arrives. The others are static: the same file for everyone, which http-server can serve as is.",
          },
        ],
        flask: [
          {
            kind: "blank",
            id: "week-9-lecture-p1-route-decorator",
            prompt: "Fill the gap so Flask calls index when someone visits /.",
            code: code`
@app.____("/")
def index():
    return "hello, world"
`,
            language: "python",
            options: ["route", "get", "url"],
            answer: 0,
            explanation:
              "@app.route(\"/\") is a decorator that ties the path / to the function below it. Flask has no app.url decorator.",
          },
          {
            kind: "trace",
            id: "week-9-lecture-p1-args-get",
            caption:
              "Two requests reach the same route: first /?name=Kelly, then plain /. Assume index.html says hello, {{ name }}.",
            code: code`
@app.route("/")
def index():
    name = request.args.get("name", "world")
    return render_template("index.html", name=name)
`,
            language: "python",
            steps: [
              {
                line: 2,
                vars: { "request.method": "'GET'", "request.args": "{'name': 'Kelly'}" },
                note: "Request 1 is GET /?name=Kelly. Flask matched the path / and called index.",
              },
              {
                line: 3,
                vars: { "request.method": "'GET'", "request.args": "{'name': 'Kelly'}", name: "'Kelly'" },
                note: "request.args holds the key=value pairs after the ? in the URL.",
              },
              {
                line: 4,
                vars: { "request.method": "'GET'", "request.args": "{'name': 'Kelly'}", name: "'Kelly'" },
                output: "hello, Kelly",
                note: "The template's {{ name }} is replaced with Kelly.",
              },
              {
                line: 2,
                vars: { "request.method": "'GET'", "request.args": "{}" },
                note: "Request 2 is GET / with no query string. Each request is a fresh call.",
              },
              {
                line: 3,
                vars: { "request.method": "'GET'", "request.args": "{}", name: "'world'" },
                note: "There is no name key, so get returns the default, world.",
              },
              {
                line: 4,
                vars: { "request.method": "'GET'", "request.args": "{}", name: "'world'" },
                output: "hello, world",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-9-lecture-p1-no-route",
            prompt: "This app has only the @app.route(\"/\") route. You visit /goodbye. What comes back?",
            options: ["404 Not Found", "hello, world", "500 Internal Server Error"],
            answer: 0,
            explanation:
              "Flask looks for a route matching the path. No route matches /goodbye, so it answers 404. Nothing crashed, so it is not a 500.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p1-templates-folder",
            prompt:
              "You save index.html in a folder called template instead of templates, then visit /. What happens?",
            options: [
              "500 Internal Server Error, because render_template cannot find index.html",
              "404 Not Found, because the route is missing",
              "The page shows, because Flask searches every folder",
            ],
            answer: 0,
            explanation:
              "render_template only looks in templates. The route exists, so it is not a 404; the route's code crashes looking for the file, and the terminal shows TemplateNotFound.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p1-requirements",
            prompt: "What is requirements.txt for in a Flask app?",
            options: [
              "It lists the libraries the app needs to run, such as Flask",
              "It lists the routes the app supports",
              "It holds the HTML templates",
            ],
            answer: 0,
            explanation:
              "requirements.txt names the third-party libraries to install. Routes live in app.py and templates live in the templates folder.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-9-lecture-p1-recap-empty-name",
        prompt:
          "Same route as before, with name = request.args.get(\"name\", \"world\"). You visit /?name= with nothing after the equals sign. What does the page say?",
        options: ["hello, ", "hello, world", "hello, None"],
        answer: 0,
        explanation:
          "The key name is present, with an empty string as its value, so get returns '' and never uses the default. Defaults only apply when the key is missing entirely.",
      },
      exercise: {
        prompt:
          "Change app.py so that visiting /?n=5 shows 25, /?n=12 shows 144, and / with no n shows 0. If n is not a whole number, as in /?n=cat, show please give a whole number. Run flask run and try each URL in your browser.",
        language: "python",
        starter: code`
from flask import Flask, request

app = Flask(__name__)


@app.route("/")
def index():
    return "TODO"
`,
        hints: [
          "request.args.get(\"n\", \"0\") gives you a string, with \"0\" when n is missing.",
          "str.isdigit() tells you whether the string is safe to pass to int().",
          "A route must return text, so convert the number back with str() before returning it.",
        ],
        solution: code`
# Values in request.args are always strings, so check before converting.
# Flask needs a string back, which is why the square goes through str().
from flask import Flask, request

app = Flask(__name__)


@app.route("/")
def index():
    n = request.args.get("n", "0")
    if not n.isdigit():
        return "please give a whole number"
    return str(int(n) ** 2)
`,
      },
      recall: [
        {
          id: "week-9-lecture-p1-r1",
          prompt: "You visit / with no query string. What does request.args.get(\"name\", \"world\") return?",
          options: ["'world'", "None", "''"],
          answer: 0,
          explanation:
            "The second argument is the default, used when the key is missing from the URL. Without a default, get would return None.",
        },
        {
          id: "week-9-lecture-p1-r2",
          prompt: "What does @app.route(\"/\") do?",
          options: [
            "Ties the URL path / to the function defined right below it",
            "Sends the user to /",
            "Starts the web server",
          ],
          answer: 0,
          explanation:
            "It is a decorator: when a request for / arrives, Flask calls that function and sends back what it returns. Sending the user elsewhere is redirect.",
        },
        {
          id: "week-9-lecture-p1-r3",
          prompt: "Where does render_template(\"index.html\") look for the file?",
          options: [
            "In the templates folder next to app.py",
            "In the same folder as app.py",
            "In the static folder",
          ],
          answer: 0,
          explanation:
            "Flask expects templates/ beside app.py. static/ is for files sent as they are, like the cat image in froshims.",
        },
        {
          id: "week-9-lecture-p1-r4",
          prompt: "What makes a page dynamic rather than static?",
          options: [
            "Code on the server builds the HTML for each request",
            "It uses CSS",
            "It is served from cs50.dev",
          ],
          answer: 0,
          explanation:
            "A static page is the same file for everyone. A dynamic page is generated server-side from the request, such as a name in the URL.",
        },
      ],
    },

    "week-9-lecture-p2": {
      hook: "Nobody types ?name=David into an address bar; people fill in forms. Here you connect an HTML form to a Flask route, stop copy-pasting the same HTML into every page with a shared layout, and see why a password must never travel in the URL. By the end, one route both shows a form and handles what the form sends back.",
      after: {
        forms: [
          {
            kind: "predict",
            id: "week-9-lecture-p2-form-url",
            prompt: "You type Kelly in this form and click Greet. What URL does the browser request?",
            code: code`
<form action="/greet" method="get">
    <input autocomplete="off" autofocus name="name" placeholder="Name" type="text">
    <button type="submit">Greet</button>
</form>
`,
            language: "html",
            options: ["/greet?name=Kelly", "/greet?Name=Kelly", "/?greet=Kelly", "/greet/Kelly"],
            answer: 0,
            explanation:
              "action is the path and method get puts the data after a ?. The key is the name attribute, name, not the placeholder text Name.",
          },
          {
            kind: "blank",
            id: "week-9-lecture-p2-args-key",
            prompt: "The form's input is <input name=\"name\" placeholder=\"Name\">. Fill the gap so the route reads what was typed.",
            code: code`
@app.route("/greet")
def greet():
    return render_template("greet.html", name=request.args.get("____", "world"))
`,
            language: "python",
            options: ["name", "Name", "greet"],
            answer: 0,
            explanation:
              "The key is the input's name attribute, and keys are case sensitive. Name is only the placeholder hint, so get(\"Name\") would always return world.",
          },
        ],
        templates: [
          {
            kind: "blank",
            id: "week-9-lecture-p2-extends",
            prompt: "Fill the gap so greet.html reuses the shared layout.",
            code: code`
{% ____ "layout.html" %}

{% block body %}
    hello, {{ name }}
{% endblock %}
`,
            language: "jinja",
            options: ["extends", "include", "block"],
            answer: 0,
            explanation:
              "extends says this page is layout.html with its blocks filled in. The block body section is what gets placed where layout.html has its own block body.",
          },
          {
            kind: "compare",
            id: "week-9-lecture-p2-layout",
            prompt: "Both versions of greet.html produce the same page. Which is better designed?",
            language: "html",
            a: {
              label: "Full page in every template",
              code: code`
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>hello</title>
    </head>
    <body>
        hello, {{ name }}
    </body>
</html>
`,
            },
            b: {
              label: "Extends layout.html",
              code: code`
{% extends "layout.html" %}

{% block body %}
    hello, {{ name }}
{% endblock %}
`,
            },
            answer: "b",
            explanation:
              "With A, every template repeats the head and body tags, so changing the title means editing every file. With B, layout.html holds them once and each page supplies only what is unique.",
          },
        ],
        "request-methods": [
          {
            kind: "compare",
            id: "week-9-lecture-p2-get-vs-post",
            prompt: "This form asks for a password. Which method should it use?",
            language: "html",
            a: {
              label: "method=\"get\"",
              code: code`
<form action="/login" method="get">
    <input name="username" type="text">
    <input name="password" type="password">
    <button type="submit">Log in</button>
</form>
`,
            },
            b: {
              label: "method=\"post\"",
              code: code`
<form action="/login" method="post">
    <input name="username" type="text">
    <input name="password" type="password">
    <button type="submit">Log in</button>
</form>
`,
            },
            answer: "b",
            explanation:
              "GET puts every field in the URL, so the password would sit in the address bar and the browser history. POST sends it deeper in the request, out of the URL.",
          },
          {
            kind: "trace",
            id: "week-9-lecture-p2-one-route",
            caption:
              "One route handles both requests. First you visit / in the address bar, then you submit the form with Kelly typed in.",
            code: code`
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        return render_template("greet.html", name=request.form.get("name", "world"))
    return render_template("index.html")
`,
            language: "python",
            steps: [
              {
                line: 2,
                vars: { "request.method": "'GET'", "request.form": "{}" },
                note: "Request 1: typing a URL and pressing Enter sends GET.",
              },
              { line: 3, vars: { "request.method": "'GET'", "request.form": "{}" }, note: "GET is not POST, so skip line 4." },
              {
                line: 5,
                vars: { "request.method": "'GET'", "request.form": "{}" },
                output: "index.html: the form",
              },
              {
                line: 2,
                vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}" },
                note: "Request 2: the form has action=\"/\" and method=\"post\", so it posts back to the same route.",
              },
              { line: 3, vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}" } },
              {
                line: 4,
                vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}" },
                output: "greet.html: hello, Kelly",
                note: "POST data is in request.form, not request.args.",
              },
            ],
          },
          {
            kind: "demo",
            id: "week-9-lecture-p2-http-demo",
            demo: "http",
            caption:
              "The /hello route here accepts only GET. Send POST /hello: that status is what you get when a form posts to a route without methods=[\"POST\"].",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p2-args-on-post",
            prompt:
              "A form posts name=Kelly to this route. What does the page say?",
            code: code`
@app.route("/greet", methods=["POST"])
def greet():
    return render_template("greet.html", name=request.args.get("name", "world"))
`,
            language: "python",
            options: ["hello, world", "hello, Kelly", "405 Method Not Allowed"],
            answer: 0,
            explanation:
              "request.args only reads the URL's query string, and a POST puts the data in the body. Nothing named name is in the URL, so you get the default; use request.form.get for POST.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p2-empty-post",
            prompt:
              "The route uses request.form.get(\"name\", \"world\"). You submit the form with the box left empty. What does greet.html show?",
            options: ["hello, ", "hello, world", "An error page"],
            answer: 0,
            explanation:
              "An empty text box is still submitted, as name with the value ''. The key exists, so the default world is never used. This is the bug the notes fix by moving the default into the template.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-9-lecture-p2-recap-jinja-if",
        prompt: "The route now passes name=request.form.get(\"name\"). The user submits an empty box. What does this greet.html show?",
        code: code`
{% extends "layout.html" %}

{% block body %}
    hello,
    {% if name %}
        {{ name }}
    {% else %}
        world
    {% endif %}
{% endblock %}
`,
        language: "jinja",
        options: ["hello, world", "hello, ", "hello, None"],
        answer: 0,
        explanation:
          "An empty string counts as false in Jinja, just as in Python, so the else branch prints world. The check now catches both a missing name and an empty one.",
      },
      exercise: {
        prompt:
          "Build an app with one route / that accepts GET and POST. On GET it shows a form with a text input named color. On POST it shows Your favorite color is blue, or Your favorite color is a mystery if the box was empty. Both pages extend one layout.html. Run flask run and submit with and without a color.",
        language: "python",
        starter: code`
# app.py
from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


# templates/layout.html
# <!DOCTYPE html>
# <html lang="en">
#     <head><title>color</title></head>
#     <body>{% block body %}{% endblock %}</body>
# </html>
`,
        hints: [
          "The route needs methods=[\"GET\", \"POST\"], and the form needs method=\"post\".",
          "Inside the route, check request.method == \"POST\" to decide which template to render.",
          "Pass request.form.get(\"color\") to the template and use {% if color %} there for the mystery case.",
        ],
        solution: code`
# One route, two jobs: GET shows the form, POST shows the answer.
# The template's if handles both a missing and an empty color.

# app.py
from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        return render_template("color.html", color=request.form.get("color"))
    return render_template("index.html")


# templates/layout.html
<!DOCTYPE html>
<html lang="en">
    <head><title>color</title></head>
    <body>{% block body %}{% endblock %}</body>
</html>

# templates/index.html
{% extends "layout.html" %}

{% block body %}
    <form action="/" method="post">
        <input autocomplete="off" autofocus name="color" placeholder="Color" type="text">
        <button type="submit">Tell me</button>
    </form>
{% endblock %}

# templates/color.html
{% extends "layout.html" %}

{% block body %}
    Your favorite color is {% if color %}{{ color }}{% else %}a mystery{% endif %}
{% endblock %}
`,
      },
      recall: [
        {
          id: "week-9-lecture-p2-r1",
          prompt: "A form uses method=\"post\". Where does Flask put what was typed?",
          options: ["request.form", "request.args", "request.method"],
          answer: 0,
          explanation:
            "request.args reads the URL's query string, which GET uses. POST data travels in the body and is read with request.form.",
        },
        {
          id: "week-9-lecture-p2-r2",
          prompt: "Why should a login form use POST rather than GET?",
          options: [
            "GET would put the password in the URL, where it shows in the address bar and history",
            "GET cannot send more than one field",
            "POST makes the page load faster",
          ],
          answer: 0,
          explanation:
            "GET encodes every field into the URL. POST keeps the data out of it.",
        },
        {
          id: "week-9-lecture-p2-r3",
          prompt: "What do {% extends \"layout.html\" %} and {% block body %} do together?",
          options: [
            "Reuse layout.html's HTML and fill in only the part that differs on this page",
            "Copy this page's HTML into layout.html on disk",
            "Load layout.html in a second browser tab",
          ],
          answer: 0,
          explanation:
            "layout.html marks a block, and each page that extends it supplies that block, so the shared HTML lives in one file.",
        },
        {
          id: "week-9-lecture-p2-r4",
          prompt: "A route is written @app.route(\"/greet\") with no methods argument. A form posts to it. What happens?",
          options: [
            "405 Method Not Allowed, because routes accept only GET by default",
            "It works the same as GET",
            "404 Not Found",
          ],
          answer: 0,
          explanation:
            "The path exists, so it is not a 404, but the route was never told to accept POST. Add methods=[\"POST\"] or [\"GET\", \"POST\"].",
        },
      ],
    },

    "week-9-lecture-p3": {
      hook: "Froshims is the first real app of the week: students register for a sport, and the server must decide whether to believe them. A dropdown only offers three sports, but anyone can edit the page or send their own request. You will see why the server checks everything, how a Jinja loop builds HTML from a Python list, and why data kept in a variable vanishes.",
      after: {
        "frosh-ims": [
          {
            kind: "trace",
            id: "week-9-lecture-p3-register",
            caption:
              "Kelly submits the form with Soccer chosen. Follow the dictionary version of register() through each check.",
            code: code`
@app.route("/register", methods=["POST"])
def register():
    name = request.form.get("name")
    if not name:
        return render_template("error.html", message="Missing name")
    sport = request.form.get("sport")
    if not sport:
        return render_template("error.html", message="Missing sport")
    if sport not in SPORTS:
        return render_template("error.html", message="Invalid sport")
    REGISTRANTS[name] = sport
    return redirect("/registrants")
`,
            language: "python",
            steps: [
              {
                line: 3,
                vars: { SPORTS, REGISTRANTS: "{}", name: "'Kelly'" },
                note: "The form sent name=Kelly and sport=Soccer.",
              },
              { line: 4, vars: { SPORTS, REGISTRANTS: "{}", name: "'Kelly'" }, note: "Kelly is not empty, so skip line 5." },
              { line: 6, vars: { SPORTS, REGISTRANTS: "{}", name: "'Kelly'", sport: "'Soccer'" } },
              { line: 7, vars: { SPORTS, REGISTRANTS: "{}", name: "'Kelly'", sport: "'Soccer'" } },
              {
                line: 9,
                vars: { SPORTS, REGISTRANTS: "{}", name: "'Kelly'", sport: "'Soccer'" },
                note: "Soccer is in SPORTS, so the check passes.",
              },
              {
                line: 11,
                vars: { SPORTS, REGISTRANTS: "{'Kelly': 'Soccer'}", name: "'Kelly'", sport: "'Soccer'" },
              },
              {
                line: 12,
                vars: { SPORTS, REGISTRANTS: "{'Kelly': 'Soccer'}", name: "'Kelly'", sport: "'Soccer'" },
                output: "Redirect to /registrants",
                note: "The browser now makes a new GET request to /registrants.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-9-lecture-p3-edited-html",
            prompt:
              "Someone uses developer tools to change an option's value to Chess, picks it and submits. What does the dictionary version of register() do?",
            options: [
              "Shows the error page with Invalid sport",
              "Registers them for Chess",
              "Nothing; the browser blocks edited forms",
            ],
            answer: 0,
            explanation:
              "Anyone can change HTML in their own browser, so the dropdown proves nothing. The server checks sport not in SPORTS itself and refuses Chess.",
          },
          {
            kind: "blank",
            id: "week-9-lecture-p3-endfor",
            prompt: "Fill the gap to close the loop that builds one <option> per sport.",
            code: code`
<select name="sport">
    <option selected value="">Sport</option>
    {% for sport in sports %}
        <option value="{{ sport }}">{{ sport }}</option>
    {% ____ %}
</select>
`,
            language: "jinja",
            options: ["endfor", "end", "done"],
            answer: 0,
            explanation:
              "Jinja blocks close with end plus the keyword that opened them: endfor, endif, endblock. Indentation alone does not end a block, unlike in Python.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p3-radio",
            prompt:
              "The radio-button version gives every input name=\"sport\" and type=\"radio\". How many sports can one student pick?",
            options: ["Exactly one", "Any number", "None until they also pick from a dropdown"],
            answer: 0,
            explanation:
              "Radio buttons with the same name form a group, and choosing one unchooses the others. The SQL version later switches to checkboxes to allow several.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p3-dict-overwrite",
            prompt:
              "With REGISTRANTS[name] = sport, Kelly registers for Soccer, then registers again for Basketball. What does /registrants show for Kelly?",
            options: [
              "One row: Kelly, Basketball",
              "Two rows: Kelly, Soccer and Kelly, Basketball",
              "One row: Kelly, Soccer",
            ],
            answer: 0,
            explanation:
              "A dictionary key appears once, so the second assignment replaces the first value. To keep both you need something like rows in a database.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p3-restart",
            prompt: "Three students register, then you stop flask run and start it again. What does /registrants show?",
            options: [
              "An empty table",
              "All three students",
              "An error, because REGISTRANTS no longer exists",
            ],
            answer: 0,
            explanation:
              "REGISTRANTS lives in the server's memory. Restarting runs app.py from the top, so REGISTRANTS = {} starts empty again. Saving data across restarts needs a database.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-9-lecture-p3-recap-first-version",
        prompt:
          "In the first version, Kelly types her name but leaves the dropdown on its Sport placeholder, whose value is empty. Which page does she see?",
        code: code`
if not request.form.get("name") or request.form.get("sport") not in SPORTS:
    return render_template("failure.html")
return render_template("success.html")
`,
        language: "python",
        options: ["failure.html", "success.html", "405 Method Not Allowed"],
        answer: 0,
        explanation:
          "The name check passes, but the sport is '', which is not in SPORTS, so the or is true. Validating on the server catches a skipped field as well as an edited one.",
      },
      exercise: {
        prompt:
          "Starting from the dictionary version of froshims, add a route /count that renders count.html, listing every sport in SPORTS with how many people registered for it, like Soccer: 2. Register two people for Soccer and one for Ultimate Frisbee, then visit /count: Basketball shows 0, Soccer shows 2, Ultimate Frisbee shows 1.",
        language: "python",
        starter: code`
@app.route("/count")
def count():
    # TODO: build a dict of sport -> number of registrants
    return render_template("count.html")
`,
        hints: [
          "Start a dictionary with every sport in SPORTS set to 0, so empty sports still show.",
          "Loop over REGISTRANTS: each value is the sport that person chose.",
          "In count.html, loop with {% for sport in counts %} and show {{ counts[sport] }}.",
        ],
        solution: code`
# Starting every sport at 0 means sports nobody chose still appear.
# REGISTRANTS maps name -> sport, so each value adds one to that sport.

# app.py
@app.route("/count")
def count():
    counts = {}
    for sport in SPORTS:
        counts[sport] = 0
    for name in REGISTRANTS:
        counts[REGISTRANTS[name]] += 1
    return render_template("count.html", counts=counts)


# templates/count.html
{% extends "layout.html" %}

{% block body %}
    <h1>Count</h1>
    <ul>
        {% for sport in counts %}
            <li>{{ sport }}: {{ counts[sport] }}</li>
        {% endfor %}
    </ul>
{% endblock %}
`,
      },
      recall: [
        {
          id: "week-9-lecture-p3-r1",
          prompt: "The form only offers three sports. Why does register() still check sport not in SPORTS?",
          options: [
            "Users can edit the HTML or send their own request, so the server cannot trust the form",
            "Flask requires every route to check its inputs",
            "The check makes the page load faster",
          ],
          answer: 0,
          explanation:
            "What the browser shows is under the user's control. Only checks on the server are guaranteed to run.",
        },
        {
          id: "week-9-lecture-p3-r2",
          prompt: "Why did the dictionary version of froshims lose its registrants?",
          options: [
            "They lived in memory, which is wiped when the server stops",
            "Dictionaries can only hold one entry",
            "redirect deletes the dictionary",
          ],
          answer: 0,
          explanation:
            "Variables last only as long as the program runs. A database file on disk survives restarts.",
        },
        {
          id: "week-9-lecture-p3-r3",
          prompt: "What does {% for sport in sports %} do in a template?",
          options: [
            "Repeats the HTML inside it once for each item in the list passed to the template",
            "Runs a Python loop in the browser",
            "Checks whether sports is empty",
          ],
          answer: 0,
          explanation:
            "Jinja runs the loop on the server while building the page, so the browser receives one <option> or row per sport.",
        },
        {
          id: "week-9-lecture-p3-r4",
          prompt: "After saving a registrant, why return redirect(\"/registrants\") instead of a template?",
          options: [
            "It tells the browser to request /registrants, so that route shows the up-to-date list",
            "redirect saves the data to disk",
            "Templates cannot be returned from a POST route",
          ],
          answer: 0,
          explanation:
            "redirect sends the browser to another URL, where the registrants route renders the table. The route that saved the data does not have to build that page too.",
        },
      ],
    },

    "week-9-lecture-p4": {
      hook: "Froshims forgot everyone the moment the server stopped. Put a SQLite database behind it and registrations survive restarts, several sports per student become several rows, and a Deregister button can delete one exact row by its id. This is the shape of most web apps you will build: a form, a route, a query and a template.",
      after: {
        "flask-and-sql": [
          {
            kind: "predict",
            id: "week-9-lecture-p4-get-vs-getlist",
            prompt:
              "With checkboxes, Kelly ticks Basketball and Soccer. Both inputs are named sport. What does request.form.get(\"sport\") return?",
            options: ["'Basketball'", "['Basketball', 'Soccer']", "'Basketball, Soccer'"],
            answer: 0,
            explanation:
              "get returns only the first value sent under that name. That is why the SQL version uses request.form.getlist(\"sport\"), which returns every value as a list.",
          },
          {
            kind: "trace",
            id: "week-9-lecture-p4-getlist-loop",
            caption:
              "Inside register(), name is already 'Kelly' and she ticked two sports. Watch the checks, then one INSERT per sport.",
            code: code`
sports = request.form.getlist("sport")
if not sports:
    return render_template("error.html", message="Missing sport")
for sport in sports:
    if sport not in SPORTS:
        return render_template("error.html", message="Invalid sport")
for sport in sports:
    db.execute("INSERT INTO registrants (name, sport) VALUES(?, ?)", name, sport)
return redirect("/registrants")
`,
            language: "python",
            steps: [
              {
                line: 1,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", "rows added": "(none)" },
              },
              {
                line: 2,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", "rows added": "(none)" },
                note: "The list is not empty, so skip line 3.",
              },
              {
                line: 4,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", sport: "'Basketball'", "rows added": "(none)" },
              },
              {
                line: 5,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", sport: "'Basketball'", "rows added": "(none)" },
              },
              {
                line: 4,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", sport: "'Soccer'", "rows added": "(none)" },
              },
              {
                line: 5,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", sport: "'Soccer'", "rows added": "(none)" },
                note: "Every sport is valid. Nothing is written until all of them pass.",
              },
              {
                line: 7,
                vars: { name: "'Kelly'", sports: "['Basketball', 'Soccer']", sport: "'Basketball'", "rows added": "(none)" },
              },
              {
                line: 8,
                vars: {
                  name: "'Kelly'",
                  sports: "['Basketball', 'Soccer']",
                  sport: "'Basketball'",
                  "rows added": "(Kelly, Basketball)",
                },
              },
              {
                line: 7,
                vars: {
                  name: "'Kelly'",
                  sports: "['Basketball', 'Soccer']",
                  sport: "'Soccer'",
                  "rows added": "(Kelly, Basketball)",
                },
              },
              {
                line: 8,
                vars: {
                  name: "'Kelly'",
                  sports: "['Basketball', 'Soccer']",
                  sport: "'Soccer'",
                  "rows added": "(Kelly, Basketball), (Kelly, Soccer)",
                },
              },
              {
                line: 9,
                vars: {
                  name: "'Kelly'",
                  sports: "['Basketball', 'Soccer']",
                  sport: "'Soccer'",
                  "rows added": "(Kelly, Basketball), (Kelly, Soccer)",
                },
                output: "Redirect to /registrants",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-9-lecture-p4-placeholder",
            prompt: "Fill the gap so the id from the form is passed to SQL safely.",
            code: code`
id = request.form.get("id")
if id:
    db.execute("DELETE FROM registrants WHERE id = ____", id)
`,
            language: "python",
            options: ["?", "id", "{id}"],
            answer: 0,
            explanation:
              "The ? is a placeholder that db.execute fills in with the next argument, escaping it safely. Writing id inside the string compares the column to itself, which is true for every row, so it would delete them all.",
          },
          {
            kind: "compare",
            id: "week-9-lecture-p4-injection",
            prompt: "Both delete the row whose id came from the form. Which is safe to put on a public server?",
            language: "python",
            a: {
              label: "f-string",
              code: 'db.execute(f"DELETE FROM registrants WHERE id = {id}")',
            },
            b: {
              label: "Placeholder",
              code: 'db.execute("DELETE FROM registrants WHERE id = ?", id)',
            },
            answer: "b",
            explanation:
              "With A, someone can post id=1 OR 1=1 and the query deletes every row. With B, the library treats the whole value as data, never as SQL, which blocks this SQL injection.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p4-hidden-id",
            prompt:
              "Each row of registrants.html has a small form with <input name=\"id\" type=\"hidden\" value=\"{{ registrant.id }}\">. What does it do when you click Deregister?",
            options: [
              "Sends that row's id to /deregister without showing a text box",
              "Hides the row from the table",
              "Asks you to type the id",
            ],
            answer: 0,
            explanation:
              "A hidden input is submitted like any other input but is not displayed. The route reads it with request.form.get(\"id\") and deletes that one row.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p4-execute-select",
            prompt: "What does db.execute(\"SELECT * FROM registrants\") return to Python?",
            options: [
              "A list of dictionaries, one per row, with keys like id, name and sport",
              "A single string of all the rows",
              "The number of rows",
            ],
            answer: 0,
            explanation:
              "That list is passed to the template, where the loop uses registrant.name and registrant.sport for each row.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-9-lecture-p4-recap-persist",
        prompt:
          "In the SQL version, Kelly registers for Soccer. You stop flask run, start it again and visit /registrants. What do you see?",
        options: [
          "Kelly, Soccer is still there",
          "An empty table, as in the dictionary version",
          "An error until someone registers again",
        ],
        answer: 0,
        explanation:
          "The rows live in froshims.db, a file on disk, and the registrants route reads them with SELECT on every request. Restarting the program does not touch the file.",
      },
      exercise: {
        prompt:
          "Add a /count route to the SQL version of froshims that runs SELECT sport, COUNT(*) AS n FROM registrants GROUP BY sport and renders count.html, listing each sport with its number. Register Kelly for Basketball and Soccer and David for Soccer; /count should show Basketball: 1 and Soccer: 2.",
        language: "python",
        starter: code`
@app.route("/count")
def count():
    # TODO
    return render_template("count.html")
`,
        hints: [
          "db.execute returns a list of dictionaries; here each has the keys sport and n.",
          "Pass that list to the template under a name such as rows.",
          "In the template, loop over rows and print {{ row[\"sport\"] }} and {{ row[\"n\"] }}.",
        ],
        solution: code`
# GROUP BY makes SQL do the counting, one result row per sport.
# AS n gives the count column a name the template can use.

# app.py
@app.route("/count")
def count():
    rows = db.execute("SELECT sport, COUNT(*) AS n FROM registrants GROUP BY sport")
    return render_template("count.html", rows=rows)


# templates/count.html
{% extends "layout.html" %}

{% block body %}
    <h1>Count</h1>
    <ul>
        {% for row in rows %}
            <li>{{ row["sport"] }}: {{ row["n"] }}</li>
        {% endfor %}
    </ul>
{% endblock %}
`,
      },
      recall: [
        {
          id: "week-9-lecture-p4-r1",
          prompt: "Several checkboxes share name=\"sport\". How do you get all the ticked values in Flask?",
          options: [
            "request.form.getlist(\"sport\")",
            "request.form.get(\"sport\")",
            "request.args.get(\"sport\")",
          ],
          answer: 0,
          explanation:
            "getlist returns every value as a list. get returns only the first one, and args reads the URL, not posted data.",
        },
        {
          id: "week-9-lecture-p4-r2",
          prompt: "Why write db.execute(\"... WHERE id = ?\", id) instead of putting id into the string yourself?",
          options: [
            "The placeholder escapes the value, so user input cannot change the SQL (SQL injection)",
            "Placeholders make the query run faster",
            "SQLite cannot read numbers inside strings",
          ],
          answer: 0,
          explanation:
            "Anything from a form is under the user's control. The ? keeps it as data rather than letting it become part of the command.",
        },
        {
          id: "week-9-lecture-p4-r3",
          prompt: "Why do registrations in the SQL version survive a server restart?",
          options: [
            "They are stored as rows in froshims.db, a file on disk",
            "Flask saves every variable when it stops",
            "The browser keeps a copy and sends it back",
          ],
          answer: 0,
          explanation:
            "A dictionary in memory disappears with the program. The database file stays, and each request reads it afresh.",
        },
        {
          id: "week-9-lecture-p4-r4",
          prompt: "What is a hidden input used for in the Deregister form?",
          options: [
            "Sending a value, the row's id, that the user does not need to see or type",
            "Hiding the row after it is deleted",
            "Keeping the password secret",
          ],
          answer: 0,
          explanation:
            "type=\"hidden\" is submitted like any input but not shown, so each Deregister button carries its own row's id.",
        },
      ],
    },

    "week-9-lecture-p5": {
      hook: "HTTP forgets you between requests, yet sites remember that you logged in and what is in your cart. The trick is a cookie your browser sends back with every request, pointing to a session on the server. You will also see how a page can ask the server for data while you type, and why JSON is how programs talk to each other.",
      after: {
        "cookies-and-session": [
          {
            kind: "trace",
            id: "week-9-lecture-p5-login",
            caption:
              "Follow one browser through four requests: visit /, log in as Kelly, land on / again, then log out.",
            code: code`
@app.route("/")
def index():
    return render_template("index.html", name=session.get("name"))
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        session["name"] = request.form.get("name")
        return redirect("/")
    return render_template("login.html")
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")
`,
            language: "python",
            steps: [
              {
                line: 3,
                vars: { session: "{}" },
                output: "You are not logged in.",
                note: "GET /. session.get returns None, so the template's if name is false.",
              },
              {
                line: 6,
                vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}", session: "{}" },
                note: "You submit the login form, which posts to /login.",
              },
              {
                line: 7,
                vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}", session: "{'name': 'Kelly'}" },
              },
              {
                line: 8,
                vars: { "request.method": "'POST'", "request.form": "{'name': 'Kelly'}", session: "{'name': 'Kelly'}" },
                note: "The browser follows the redirect with a new GET /, sending its session cookie.",
              },
              {
                line: 3,
                vars: { session: "{'name': 'Kelly'}" },
                output: "You are logged in as Kelly.",
                note: "Same browser, same cookie, so the same session.",
              },
              { line: 12, vars: { session: "{}" }, note: "You click Log out: GET /logout." },
              { line: 13, vars: { session: "{}" } },
              { line: 3, vars: { session: "{}" }, output: "You are not logged in." },
            ],
          },
          {
            kind: "predict",
            id: "week-9-lecture-p5-session-where",
            prompt:
              "The app sets SESSION_TYPE to filesystem. When Kelly logs in, what does her browser's cookie actually hold?",
            options: [
              "A session id; the name Kelly is stored on the server's disk",
              "The name Kelly in plain text",
              "Kelly's password",
            ],
            answer: 0,
            explanation:
              "The cookie, as in Cookie: session=value, only identifies the session. Flask-Session keeps the session's data in files on the server and looks it up by that id.",
          },
          {
            kind: "blank",
            id: "week-9-lecture-p5-clear",
            prompt: "Fill the gap so logging out forgets everything stored for this user.",
            code: code`
@app.route("/logout")
def logout():
    session.____()
    return redirect("/")
`,
            language: "python",
            options: ["clear", "close", "delete"],
            answer: 0,
            explanation:
              "session behaves like a dictionary, and a dictionary's clear method empties it. After that, session.get(\"name\") returns None again.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p5-mvc",
            prompt: "In MVC terms, what is app.py?",
            options: ["The controller", "The view", "The model"],
            answer: 0,
            explanation:
              "app.py decides what happens for each request. The view is the templates the user sees, and the model is how data is stored, such as the SQLite database.",
          },
        ],
        "shopping-cart": [
          {
            kind: "predict",
            id: "week-9-lecture-p5-cart-init",
            prompt:
              "Why does cart() begin with if \"cart\" not in session: session[\"cart\"] = []?",
            options: [
              "On a first visit there is no cart yet, so append would fail without an empty list to add to",
              "To empty the cart on every request",
              "To log the user out",
            ],
            answer: 0,
            explanation:
              "session[\"cart\"].append(book_id) needs a list to exist. The check creates one only when it is missing, so later items are kept.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p5-cart-contents",
            prompt: "Starting with an empty cart, you click Add to Cart on book 1, then on book 3. What is session[\"cart\"]?",
            options: ["['1', '3']", "['3']", "[]"],
            answer: 0,
            explanation:
              "Each POST appends the hidden id to the list in your session, and values from a form arrive as strings. The redirect to /cart does not clear anything.",
          },
        ],
        shows: [
          {
            kind: "predict",
            id: "week-9-lecture-p5-like",
            prompt:
              "The shows table has The Office, Office Space and Parks and Recreation. You search for office. Which titles come back?",
            code: 'db.execute("SELECT * FROM shows WHERE title LIKE ?", "%" + request.args.get("q") + "%")',
            language: "python",
            options: [
              "The Office and Office Space",
              "Only Office Space",
              "None, because office is lowercase",
            ],
            answer: 0,
            explanation:
              "% matches any run of characters, so %office% finds office anywhere in the title. SQLite's LIKE ignores case for English letters.",
          },
          {
            kind: "predict",
            id: "week-9-lecture-p5-missing-q",
            prompt: "With that first version of search(), you visit /search with no ?q= at all. What happens?",
            options: [
              "500 Internal Server Error: get returns None, and \"%\" + None is a TypeError",
              "Every show is listed",
              "404 Not Found",
            ],
            answer: 0,
            explanation:
              "Python cannot add a string and None, so the route crashes. The later version checks if q: first and uses an empty list otherwise.",
          },
        ],
        apis: [
          {
            kind: "predict",
            id: "week-9-lecture-p5-ajax-fragment",
            prompt:
              "In the AJAX version, you type off. What does the server send back to fetch?",
            options: [
              "Just <li> elements for matching shows, which JavaScript puts inside the <ul>",
              "A whole new page, which replaces the current one",
              "Nothing until you press Enter",
            ],
            answer: 0,
            explanation:
              "search.html is only a loop of <li> tags. On every input event, fetch gets them and innerHTML swaps them in, with no reload.",
          },
        ],
        json: [
          {
            kind: "compare",
            id: "week-9-lecture-p5-html-vs-json",
            prompt: "Another program, not a browser, wants to use your search results. Which response is better?",
            language: "python",
            a: {
              label: "HTML fragments",
              code: code`
@app.route("/search")
def search():
    q = request.args.get("q")
    shows = db.execute("SELECT * FROM shows WHERE title LIKE ? LIMIT 50", "%" + q + "%") if q else []
    return render_template("search.html", shows=shows)
`,
            },
            b: {
              label: "JSON",
              code: code`
@app.route("/search")
def search():
    q = request.args.get("q")
    shows = db.execute("SELECT * FROM shows WHERE title LIKE ? LIMIT 50", "%" + q + "%") if q else []
    return jsonify(shows)
`,
            },
            answer: "b",
            explanation:
              "JSON is plain keys and values that any program can read, and the caller decides how to display them. With A, the caller would have to pick data back out of <li> tags.",
          },
          {
            kind: "trace",
            id: "week-9-lecture-p5-json-loop",
            caption:
              "Suppose response.json() gave back two shows. Watch the loop from the notes build the list's HTML.",
            code: code`
let shows = [{title: 'The Office'}, {title: 'Office Space'}];
let html = '';
for (let i in shows) {
    let title = shows[i].title;
    html += '<li>' + title + '</li>';
}
document.querySelector('ul').innerHTML = html;
`,
            language: "javascript",
            steps: [
              { line: 1, vars: { shows: "[{title: 'The Office'}, {title: 'Office Space'}]" } },
              { line: 2, vars: { shows: "[{title: 'The Office'}, {title: 'Office Space'}]", html: "''" } },
              {
                line: 3,
                vars: { shows: "[{title: 'The Office'}, {title: 'Office Space'}]", html: "''", i: "'0'" },
                note: "for ... in gives the index, as a string.",
              },
              {
                line: 4,
                vars: {
                  shows: "[{title: 'The Office'}, {title: 'Office Space'}]",
                  html: "''",
                  i: "'0'",
                  title: "'The Office'",
                },
              },
              {
                line: 5,
                vars: {
                  shows: "[{title: 'The Office'}, {title: 'Office Space'}]",
                  html: "'<li>The Office</li>'",
                  i: "'0'",
                  title: "'The Office'",
                },
              },
              {
                line: 3,
                vars: { shows: "[{title: 'The Office'}, {title: 'Office Space'}]", html: "'<li>The Office</li>'", i: "'1'" },
              },
              {
                line: 4,
                vars: {
                  shows: "[{title: 'The Office'}, {title: 'Office Space'}]",
                  html: "'<li>The Office</li>'",
                  i: "'1'",
                  title: "'Office Space'",
                },
              },
              {
                line: 5,
                vars: {
                  shows: "[{title: 'The Office'}, {title: 'Office Space'}]",
                  html: "'<li>The Office</li><li>Office Space</li>'",
                  i: "'1'",
                  title: "'Office Space'",
                },
              },
              {
                line: 7,
                vars: {
                  shows: "[{title: 'The Office'}, {title: 'Office Space'}]",
                  html: "'<li>The Office</li><li>Office Space</li>'",
                },
                output: "• The Office\n• Office Space",
                note: "i and title were declared with let inside the loop, so they no longer exist here.",
              },
            ],
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-9-lecture-p5-recap-two-carts",
        prompt:
          "Kelly adds two books on her laptop. David, on his own laptop, visits /cart for the first time. What does he see?",
        options: [
          "An empty cart",
          "Kelly's two books",
          "An error, because the cart already belongs to Kelly",
        ],
        answer: 0,
        explanation:
          "Each browser has its own cookie, so each gets its own session and its own session[\"cart\"]. HTTP itself forgets; the cookie is what ties requests to one person.",
      },
      exercise: {
        prompt:
          "Write app.py so that / says You have visited 1 times on the first visit, 2 on the next reload, and so on, counted per browser with session. Add /reset, which clears the count and redirects to /. Open a private window too: it should start again at 1.",
        language: "python",
        starter: code`
from flask import Flask, redirect, session
from flask_session import Session

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route("/")
def index():
    return "TODO"
`,
        hints: [
          "session.get(\"visits\", 0) gives 0 the first time, without a KeyError.",
          "Store the new number back in session[\"visits\"] before returning.",
          "The reset route is the logout route from the notes with a different name.",
        ],
        solution: code`
# session is a dictionary per browser, so each browser keeps its own count.
# A private window has no cookie yet, so it gets a fresh session.
from flask import Flask, redirect, session
from flask_session import Session

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route("/")
def index():
    session["visits"] = session.get("visits", 0) + 1
    return f"You have visited {session['visits']} times"


@app.route("/reset")
def reset():
    session.clear()
    return redirect("/")
`,
      },
      recall: [
        {
          id: "week-9-lecture-p5-r1",
          prompt: "How does the server know a new request comes from someone who already logged in?",
          options: [
            "The browser sends back a cookie with a session id, and the server looks up that session",
            "The server remembers the user's IP address forever",
            "The user's name is in every URL",
          ],
          answer: 0,
          explanation:
            "HTTP itself keeps no memory between requests. The cookie, like Cookie: session=value, links each request to its session.",
        },
        {
          id: "week-9-lecture-p5-r2",
          prompt: "What does session.clear() do in the logout route?",
          options: [
            "Removes everything stored in this user's session, so they are no longer logged in",
            "Deletes every user's session",
            "Deletes the user from the database",
          ],
          answer: 0,
          explanation:
            "Only the current browser's session is emptied. Other users' sessions and any database rows are untouched.",
        },
        {
          id: "week-9-lecture-p5-r3",
          prompt: "What is JSON?",
          options: [
            "A text format of keys and values (dictionaries and lists) that programs exchange",
            "A JavaScript library for drawing pages",
            "A kind of SQL database",
          ],
          answer: 0,
          explanation:
            "JavaScript Object Notation is a plain, computer-friendly way to send data. jsonify turns a Python list or dictionary into it.",
        },
        {
          id: "week-9-lecture-p5-r4",
          prompt: "What does the AJAX version of shows gain over the form version?",
          options: [
            "Results update as you type, without loading a new page",
            "Searches no longer need a database",
            "The server no longer needs a /search route",
          ],
          answer: 0,
          explanation:
            "JavaScript calls fetch in the background on every input event and puts the results into the page, which never reloads.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-9-section-r1",
        prompt: "A user types /login into the address bar and presses Enter. Which request method is that?",
        options: ["GET", "POST"],
        answer: 0,
        explanation:
          "Visiting a URL asks for a page, which is GET. POST happens when a form with method=\"post\" is submitted.",
      },
      {
        id: "week-9-section-r2",
        prompt: "In the birthdays app's MVC picture, which part is the SQLite database?",
        options: ["The model", "The view", "The controller"],
        answer: 0,
        explanation:
          "The model is the stored data. The view is the HTML page, and the controller is the Python in app.py that handles requests.",
      },
      {
        id: "week-9-section-r3",
        prompt: "What does this return?",
        code: 'db.execute("SELECT * FROM birthdays WHERE month = ?", month)',
        options: [
          "A list of dictionaries, one for each birthday row in that month",
          "The single first birthday in that month",
          "The number of birthdays in that month",
        ],
        answer: 0,
        explanation:
          "SELECT * gives every column of every matching row, and the ? is filled in with month. A count would need COUNT(*).",
      },
      {
        id: "week-9-section-r4",
        prompt: "The route is @app.route(\"/\") with no methods argument, and the form posts to /. What happens on submit?",
        options: [
          "An error saying the method is not allowed",
          "The form data is saved as usual",
          "The page reloads with the data in the URL",
        ],
        answer: 0,
        explanation:
          "Without methods=[\"GET\", \"POST\"], the route accepts only GET, so Flask rejects the POST with 405 Method Not Allowed.",
      },
    ],
    exercise: {
      prompt:
        "Build a guestbook with one route / for GET and POST. On POST, read name and message from the form, INSERT them into a messages table with ? placeholders, then redirect to /. On GET, SELECT every message and list them under the form. Sign it twice, restart flask run: both entries are still listed.",
      language: "python",
      starter: code`
# guestbook.db was created with:
# CREATE TABLE messages (id INTEGER PRIMARY KEY, name TEXT NOT NULL, message TEXT NOT NULL);

from cs50 import SQL
from flask import Flask, redirect, render_template, request

app = Flask(__name__)
db = SQL("sqlite:///guestbook.db")


@app.route("/", methods=["GET", "POST"])
def index():
    # TODO
    return render_template("index.html")
`,
      hints: [
        "Check request.method first: POST adds a row, GET shows the page.",
        "Skip the INSERT if either field is empty, then redirect either way.",
        "On GET, pass the result of SELECT name, message FROM messages to the template and loop over it with Jinja.",
      ],
      solution: code`
# POST changes data and then redirects, so reloading the page does not sign twice.
# GET only reads, and the rows live in guestbook.db, so they survive restarts.

# app.py
from cs50 import SQL
from flask import Flask, redirect, render_template, request

app = Flask(__name__)
db = SQL("sqlite:///guestbook.db")


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        name = request.form.get("name")
        message = request.form.get("message")
        if name and message:
            db.execute("INSERT INTO messages (name, message) VALUES(?, ?)", name, message)
        return redirect("/")
    messages = db.execute("SELECT name, message FROM messages")
    return render_template("index.html", messages=messages)


# templates/index.html
{% extends "layout.html" %}

{% block body %}
    <form action="/" method="post">
        <input autocomplete="off" name="name" placeholder="Name" type="text">
        <input autocomplete="off" name="message" placeholder="Message" type="text">
        <button type="submit">Sign</button>
    </form>
    <ul>
        {% for row in messages %}
            <li>{{ row["name"] }}: {{ row["message"] }}</li>
        {% endfor %}
    </ul>
{% endblock %}
`,
    },
  },

  shorts: {
    "week-9-short-flask": {
      recall: [
        {
          id: "week-9-short-flask-r1",
          prompt: "Decorators like @app.route belong to which language feature?",
          options: [
            "Python in general; Flask uses them to tie functions to URLs",
            "Flask only; they do not exist elsewhere in Python",
            "HTML templates",
          ],
          answer: 0,
          explanation:
            "Decorators are a Python feature that wraps a function. Flask's route decorator registers the function for a path.",
        },
        {
          id: "week-9-short-flask-r2",
          prompt: "A route accepts both GET and POST. How can it do different things for each?",
          options: [
            "Check request.method, for example show the form on GET and process it on POST",
            "Write two functions with the same name",
            "Flask picks a different template automatically",
          ],
          answer: 0,
          explanation:
            "request.method tells you how the data arrived, so one function can branch on it.",
        },
        {
          id: "week-9-short-flask-r3",
          prompt: "Which Flask function sends the user to a different page?",
          options: ["redirect", "render_template", "session"],
          answer: 0,
          explanation:
            "redirect points the browser at another URL. render_template builds a page from a template, and session stores data per user.",
        },
      ],
    },
    "week-9-short-ajax": {
      recall: [
        {
          id: "week-9-short-ajax-r1",
          prompt: "What does AJAX let a page do?",
          options: [
            "Ask the server for more data after the page has loaded, and update part of the page without a full refresh",
            "Load the page faster the first time",
            "Run Python in the browser",
          ],
          answer: 0,
          explanation:
            "Live sports scores are the classic example: the numbers change while the rest of the page stays put.",
        },
        {
          id: "week-9-short-ajax-r2",
          prompt: "What does asynchronous mean here?",
          options: [
            "The request happens later, while you are still on the page, not as part of loading it",
            "The request is sent to two servers at once",
            "The response arrives before the request",
          ],
          answer: 0,
          explanation:
            "The page carries on working while the request is out, and your code handles the response when it arrives.",
        },
        {
          id: "week-9-short-ajax-r3",
          prompt: "With an XMLHttpRequest, which combination means the data arrived and everything went well?",
          options: ["readyState 4 and status 200", "readyState 0 and status 200", "readyState 4 and status 404"],
          answer: 0,
          explanation:
            "readyState 4 means the request is complete, and status 200 means OK. readyState 0 means it has not even been set up.",
        },
      ],
    },
  },

  glossary: [
    { term: "Static page", meaning: "A page that is the same file for every visitor, sent as it is." },
    { term: "Dynamic page", meaning: "A page that server-side code builds for each request, based on what was asked." },
    { term: "Flask", meaning: "A Python micro-framework for writing web applications as routes and functions." },
    { term: "Route", meaning: "A URL path, like /greet, tied to the function that answers requests for it." },
    { term: "Decorator", meaning: "A line like @app.route(\"/\") above a function that adds behaviour to it, here linking it to a path." },
    { term: "Query string", meaning: "The ?key=value part of a URL, which Flask reads with request.args." },
    { term: "request.form", meaning: "Where Flask puts data sent by a form with method=\"post\"." },
    { term: "Template", meaning: "An HTML file with Jinja placeholders like {{ name }} that Flask fills in with render_template." },
    { term: "Jinja", meaning: "The template language Flask uses, with {{ }} for values and {% %} for if, for, extends and block." },
    { term: "Redirect", meaning: "A response that tells the browser to go and request a different URL." },
    { term: "Cookie", meaning: "A small piece of data the browser stores and sends back to the same server with each request." },
    { term: "Session", meaning: "Per-user data the server keeps between requests, found through the user's cookie." },
    { term: "MVC", meaning: "Model, view, controller: the data, the pages the user sees, and the code (app.py) that connects them." },
    { term: "SQL injection", meaning: "An attack where user input is treated as part of a SQL command; ? placeholders prevent it." },
    { term: "API", meaning: "A set of rules that lets one program request data or actions from another service." },
    { term: "AJAX", meaning: "JavaScript asking the server for data in the background and updating part of the page without a reload." },
    { term: "JSON", meaning: "JavaScript Object Notation: a text format of keys and values that programs use to exchange data." },
  ],
};

export default content;
