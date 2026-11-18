import type { WeekContent } from "./types";

/** Code block from a raw template: keeps backslashes, drops the first and last newline. */
const code = (s: TemplateStringsArray) =>
  String.raw(s).replace(/\r/g, "").replace(/^\n/, "").replace(/\n$/, "");

/** Code block from separate lines, for code that contains backticks or ${. */
const lines = (...l: string[]) => l.join("\n");

const content: WeekContent = {
  unitId: "week-8",
  parts: {
    "week-8-lecture-p1": {
      hook: "When you type harvard.edu and press Enter, your laptop finds one computer among billions and gets a page back in under a second. How? Start with the envelope: an address that names every machine, routers that pass packets along, DNS that turns names into numbers, and DHCP that gives your laptop an address in the first place.",
      after: {
        "the-internet": [
          {
            kind: "predict",
            id: "week-8-lecture-p1-router-job",
            prompt:
              "On the ARPANET map, each dot between two endpoints is a router. What is a router's job?",
            options: [
              "Store a copy of every website",
              "Pass data one step closer to where it is going",
              "Give each computer its IP address",
              "Turn names like harvard.edu into numbers",
            ],
            answer: 1,
            explanation:
              "A router decides which way to send each packet next, so data hops from router to router toward its destination. Handing out addresses is DHCP's job, and turning names into numbers is DNS's job.",
          },
        ],
        routers: [
          {
            kind: "predict",
            id: "week-8-lecture-p1-invalid-ip",
            prompt: "An IPv4 address has the form #.#.#.#. Which of these is not a valid IPv4 address?",
            options: ["192.168.1.1", "8.8.8.8", "172.16.300.4", "255.255.255.255"],
            answer: 2,
            explanation:
              "Each of the four numbers is 8 bits, so it ranges from 0 to 255. 300 does not fit in 8 bits. 255.255.255.255 looks odd but every part is in range.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p1-ipv4-count",
            prompt: "IPv4 addresses are 32 bits long. About how many different addresses is that?",
            options: ["32", "About 1,000 (255 times 4)", "About 4 billion", "About 4 million"],
            answer: 2,
            explanation:
              "32 bits give 2 to the 32nd power combinations, which is 4,294,967,296. Multiplying 255 by 4 counts the values of each part separately instead of every combination of the four parts.",
          },
          {
            kind: "trace",
            id: "week-8-lecture-p1-tcp-reassemble",
            caption:
              "Packets can arrive out of order. TCP numbers them so the receiver can rebuild the message. Watch Python do the same with sequence numbers.",
            code: code`
packets = {2: "wor", 1: "hello, ", 3: "ld"}
message = ""
for n in range(1, 4):
    message += packets[n]
print(message)
`,
            language: "python",
            steps: [
              {
                line: 1,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}" },
                note: "Packet 2 arrived first. The numbers, not the arrival order, say where each piece goes.",
              },
              {
                line: 2,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "''" },
              },
              {
                line: 3,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "''", n: "1" },
              },
              {
                line: 4,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, '", n: "1" },
              },
              {
                line: 3,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, '", n: "2" },
              },
              {
                line: 4,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, wor'", n: "2" },
              },
              {
                line: 3,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, wor'", n: "3" },
              },
              {
                line: 4,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, world'", n: "3" },
                note: "range(1, 4) stops before 4, so this is the last piece.",
              },
              {
                line: 5,
                vars: { packets: "{2: 'wor', 1: 'hello, ', 3: 'ld'}", message: "'hello, world'", n: "3" },
                output: "hello, world\n",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-8-lecture-p1-port-443",
            prompt:
              "Your browser sends packets to the server for https://www.harvard.edu/. Which TCP port goes with the IP address by default?",
            options: ["80", "443", "8080", "53"],
            answer: 1,
            explanation:
              "443 is the default port for HTTPS. 80 is the default for plain HTTP, and 8080 is the port http-server used for your own pages.",
          },
        ],
        dns: [
          {
            kind: "predict",
            id: "week-8-lecture-p1-dns-first",
            prompt:
              "You type harvard.edu. Before a single packet can go to Harvard's web server, what does your computer need to find out?",
            options: [
              "The server's IP address, by asking DNS",
              "The server's port, by asking DHCP",
              "The path of the page, by asking the router",
            ],
            answer: 0,
            explanation:
              "Packets are addressed by IP, not by name, so DNS looks up the IP address for harvard.edu first. The port is a known default, and the path is already in what you typed.",
          },
        ],
        dhcp: [
          {
            kind: "predict",
            id: "week-8-lecture-p1-dhcp",
            prompt:
              "You open a new laptop on a cafe's Wi-Fi. Nobody typed an IP address into it, yet it can browse right away. What gave it an address?",
            options: ["DHCP", "DNS", "TCP", "The first website you visit"],
            answer: 0,
            explanation:
              "DHCP assigns your device an IP address when it joins the network. It also tells your device which default gateway and which nameservers (DNS) to use.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-8-lecture-p1-recap-order",
        prompt: "You join Wi-Fi and visit https://harvard.edu. In which order do these happen?",
        options: [
          "DHCP gives you an address, DNS finds harvard.edu's IP, then TCP/IP packets go to port 443",
          "DNS finds harvard.edu's IP, DHCP gives you an address, then packets go to port 80",
          "Packets go to port 443, then DNS finds the IP, then DHCP gives you an address",
        ],
        answer: 0,
        explanation:
          "You need your own address before you can talk to anyone, and you need the server's IP before you can send it packets. HTTPS uses port 443, not 80.",
      },
      exercise: {
        prompt:
          "Write a Python function valid(address) that returns True only when address looks like an IPv4 address: exactly four whole numbers separated by dots, each from 0 to 255. Run the file: 1.2.3.4 and 255.255.255.255 should print True, and 256.1.1.1, 1.2.3 and a.b.c.d should print False.",
        language: "python",
        starter: code`
def valid(address):
    # TODO
    return False


for address in ["1.2.3.4", "255.255.255.255", "256.1.1.1", "1.2.3", "a.b.c.d"]:
    print(address, valid(address))
`,
        hints: [
          "Strings have a split method: '1.2.3.4'.split('.') gives a list of the parts.",
          "Check how many parts there are first, then check each part on its own.",
          "str.isdigit() tells you whether a part is safe to pass to int().",
        ],
        solution: code`
# Each part of an IPv4 address is 8 bits, so it must be a whole number from 0 to 255.
# Checking isdigit() first means int() never sees text like "a".
def valid(address):
    parts = address.split(".")
    if len(parts) != 4:
        return False
    for part in parts:
        if not part.isdigit():
            return False
        if int(part) > 255:
            return False
    return True


for address in ["1.2.3.4", "255.255.255.255", "256.1.1.1", "1.2.3", "a.b.c.d"]:
    print(address, valid(address))
`,
      },
      recall: [
        {
          id: "week-8-lecture-p1-r1",
          prompt: "What does DNS do?",
          options: [
            "Translates domain names like harvard.edu into IP addresses",
            "Gives your device its IP address when it joins a network",
            "Puts packets back in the right order",
            "Encrypts the pages you visit",
          ],
          answer: 0,
          explanation:
            "DNS is like a table from fully qualified domain names to IP addresses. Assigning your address is DHCP, and ordering packets is TCP.",
        },
        {
          id: "week-8-lecture-p1-r2",
          prompt: "A large photo is split into many packets. Why does TCP number them?",
          options: [
            "So the receiver can put them back in order and ask again for any that went missing",
            "So routers know which website the photo came from",
            "So the photo is compressed to a smaller size",
          ],
          answer: 0,
          explanation:
            "Packets can take different routes and arrive out of order or not at all. Sequence numbers let TCP reassemble them and request lost ones again.",
        },
        {
          id: "week-8-lecture-p1-r3",
          prompt: "Why did the internet need IPv6, with 128-bit addresses?",
          options: [
            "32-bit IPv4 allows only about 4 billion addresses, which is not enough for every device",
            "IPv4 addresses cannot be used with HTTPS",
            "IPv6 lets DNS skip looking up names",
          ],
          answer: 0,
          explanation:
            "2 to the 32nd power is a little over 4 billion. With 128 bits there are vastly more addresses than devices.",
        },
        {
          id: "week-8-lecture-p1-r4",
          prompt: "Which pair tells a packet which service, on which computer, it is meant for?",
          options: [
            "An IP address plus a TCP port number",
            "A domain name plus a file name",
            "A DHCP server plus a DNS server",
          ],
          answer: 0,
          explanation:
            "The IP address picks the computer and the port picks the service on it, such as 80 for HTTP or 443 for HTTPS.",
        },
      ],
    },

    "week-8-lecture-p2": {
      hook: "Every time you open a page, your browser and a server have a short conversation in plain text: a request that says what you want, and a response that starts with a number saying how it went. Learn to read that conversation and codes like 301, 404 or 500 stop being mysteries and start being clues you can act on.",
      after: {
        https: [
          {
            kind: "predict",
            id: "week-8-lecture-p2-url-path",
            prompt: "In https://www.example.com/folder/file.html, which part is the path?",
            options: ["https", "www.example.com", "/folder/file.html", ".com"],
            answer: 2,
            explanation:
              "The path is everything after the domain, starting at the slash. https is the protocol, www.example.com is the host, and .com is the top-level domain.",
          },
          {
            kind: "blank",
            id: "week-8-lecture-p2-get-line",
            prompt: "Fill in the first word your browser sends to ask for Harvard's home page.",
            code: code`
____ / HTTP/2
Host: www.harvard.edu
`,
            language: "http",
            options: ["GET", "200", "POST"],
            answer: 0,
            explanation:
              "A request starts with its method, and GET asks the server to send something back. 200 is a status code that appears in responses, not requests.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p2-curl-http",
            prompt:
              "You run this in the terminal. Notice it says http, without the s. What status code comes back?",
            code: "curl -I http://www.harvard.edu/",
            language: "bash",
            options: ["200", "301", "404", "500"],
            answer: 1,
            explanation:
              "301 means Moved Permanently: the server points your browser at the https address instead. 404 would mean the page does not exist at all.",
          },
          {
            kind: "trace",
            id: "week-8-lecture-p2-respond",
            caption:
              "A toy server in Python that picks a status code from the protocol and the path. Follow three requests.",
            code: code`
def respond(scheme, path):
    if scheme == "http":
        return "301 Moved Permanently"
    if path == "/":
        return "200 OK"
    return "404 Not Found"

print(respond("https", "/"))
print(respond("http", "/"))
print(respond("https", "/cats"))
`,
            language: "python",
            steps: [
              {
                line: 2,
                vars: { scheme: "'https'", path: "'/'" },
                note: "Called from line 8. The scheme is not http, so skip line 3.",
              },
              { line: 4, vars: { scheme: "'https'", path: "'/'" }, note: "The path is /, so this is true." },
              { line: 5, vars: { scheme: "'https'", path: "'/'" } },
              { line: 8, vars: {}, output: "200 OK\n" },
              {
                line: 2,
                vars: { scheme: "'http'", path: "'/'" },
                note: "Called from line 9. Plain http, so the server redirects.",
              },
              { line: 3, vars: { scheme: "'http'", path: "'/'" } },
              { line: 9, vars: {}, output: "200 OK\n301 Moved Permanently\n" },
              { line: 2, vars: { scheme: "'https'", path: "'/cats'" }, note: "Called from line 10." },
              { line: 4, vars: { scheme: "'https'", path: "'/cats'" }, note: "The path is not /, so skip line 5." },
              { line: 6, vars: { scheme: "'https'", path: "'/cats'" } },
              { line: 10, vars: {}, output: "200 OK\n301 Moved Permanently\n404 Not Found\n" },
            ],
          },
          {
            kind: "demo",
            id: "week-8-lecture-p2-http-demo",
            demo: "http",
            caption:
              "Send GET /hello, then POST /hello, then GET /missing. Say the status code out loud before you press Send each time.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p2-500",
            prompt:
              "Next week your own web app shows 500 Internal Server Error. Where should you look first?",
            options: [
              "At your own code, because a 500 usually means the program on the server crashed",
              "At the address bar, because a 500 means you typed the URL wrong",
              "At your Wi-Fi, because a 500 means packets were lost",
            ],
            answer: 0,
            explanation:
              "When the app is yours, a 500 is usually your bug. A mistyped URL gives 404, and lost packets are resent by TCP without any status code.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-8-lecture-p2-recap-redirect",
        prompt:
          "Your browser asks for http://www.harvard.edu/ and gets back 301 Moved Permanently, pointing to https://www.harvard.edu/. What does the browser do next?",
        options: [
          "Shows you an error page",
          "Sends a new GET request to the https address",
          "Keeps asking the http address until it gets 200",
          "Asks DHCP for a new IP address",
        ],
        answer: 1,
        explanation:
          "A 301 is a hint about where the page now lives, so the browser makes a fresh request there. That second request is the one that gets 200 OK.",
      },
      exercise: {
        prompt:
          "Write a Python function parse(url) that returns a tuple of the protocol, the host and the path. If the URL has no path, the path is /, as the notes say. Running the file should print ('https', 'www.example.com', '/folder/file.html'), then ('https', 'www.example.com', '/'), then ('http', 'harvard.edu', '/').",
        language: "python",
        starter: code`
def parse(url):
    # TODO
    return "", "", ""


print(parse("https://www.example.com/folder/file.html"))
print(parse("https://www.example.com"))
print(parse("http://harvard.edu/"))
`,
        hints: [
          "Split on :// first. The left side is the protocol.",
          "In what is left, the host ends at the first slash. split('/', 1) splits only once.",
          "Remember to put the slash back on the front of the path, and use / when there is none.",
        ],
        solution: code`
# The protocol ends at ://, the host ends at the first slash after that,
# and a URL with nothing after the host is really asking for /.
def parse(url):
    protocol, rest = url.split("://", 1)
    if "/" in rest:
        host, path = rest.split("/", 1)
        path = "/" + path
    else:
        host = rest
        path = "/"
    return protocol, host, path


print(parse("https://www.example.com/folder/file.html"))
print(parse("https://www.example.com"))
print(parse("http://harvard.edu/"))
`,
      },
      recall: [
        {
          id: "week-8-lecture-p2-r1",
          prompt: "What does the status code 404 tell you?",
          options: [
            "The server could not find anything at that URL",
            "The page moved permanently to a new address",
            "The server's own code crashed",
            "Everything worked",
          ],
          answer: 0,
          explanation:
            "404 is Not Found. A move is 301, a crash on the server is usually 500, and success is 200.",
        },
        {
          id: "week-8-lecture-p2-r2",
          prompt: "What does this request ask for?",
          code: "GET / HTTP/2\nHost: www.harvard.edu",
          options: [
            "The home page, at path /, of www.harvard.edu",
            "A list of every page on www.harvard.edu",
            "To send a form to www.harvard.edu",
          ],
          answer: 0,
          explanation:
            "GET asks for something, / is the path, and the Host line names the website. Sending form data in the request body is what POST is for.",
        },
        {
          id: "week-8-lecture-p2-r3",
          prompt: "What does curl -I https://www.harvard.edu/ show you?",
          options: [
            "The status code and headers of the server's response",
            "The full HTML of the page, rendered as in a browser",
            "The IP address of every router along the way",
          ],
          answer: 0,
          explanation:
            "The -I flag asks only for the response headers, so you see lines like HTTP/2 200 and Content-Type: text/html.",
        },
        {
          id: "week-8-lecture-p2-r4",
          prompt: "How is HTTPS different from HTTP?",
          options: [
            "HTTPS is the secure version of the same protocol",
            "HTTPS uses POST and HTTP uses GET",
            "HTTPS only works for .edu sites",
          ],
          answer: 0,
          explanation:
            "Both use the same requests and status codes. HTTPS adds security, and by default it uses port 443 instead of 80.",
        },
      ],
    },

    "week-8-lecture-p3": {
      hook: "A web page is just a text file, yet the browser reads it as a tree of nested boxes: the page holds a head and a body, the body holds a list, the list holds items. Once you see that tree, tags stop being things to memorise and become choices about structure, and that same tree is what JavaScript will reach into later.",
      after: {
        html: [
          {
            kind: "trace",
            id: "week-8-lecture-p3-parse-hello",
            caption:
              "The browser reads hello.html top to bottom. Watch which tags are open and where each piece of text ends up.",
            code: code`
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>hello, title</title>
    </head>
    <body>
        hello, body
    </body>
</html>
`,
            language: "html",
            steps: [
              {
                line: 1,
                vars: { "open tags": "(none)", "tab title": "''", "page shows": "''" },
                note: "This line says the file is a modern HTML document. Nothing is displayed.",
              },
              {
                line: 2,
                vars: { "open tags": "html", "tab title": "''", "page shows": "''" },
                note: "lang=\"en\" is an attribute: it describes the tag without being displayed.",
              },
              { line: 3, vars: { "open tags": "html > head", "tab title": "''", "page shows": "''" } },
              {
                line: 4,
                vars: { "open tags": "html > head", "tab title": "'hello, title'", "page shows": "''" },
                note: "The title opens and closes on one line. It goes on the tab, not the page.",
              },
              { line: 5, vars: { "open tags": "html", "tab title": "'hello, title'", "page shows": "''" } },
              { line: 6, vars: { "open tags": "html > body", "tab title": "'hello, title'", "page shows": "''" } },
              {
                line: 7,
                vars: { "open tags": "html > body", "tab title": "'hello, title'", "page shows": "'hello, body'" },
                note: "Text inside body is what you see in the window.",
              },
              { line: 8, vars: { "open tags": "html", "tab title": "'hello, title'", "page shows": "'hello, body'" } },
              {
                line: 9,
                vars: { "open tags": "(none)", "tab title": "'hello, title'", "page shows": "'hello, body'" },
                note: "Every tag that opened has now closed, in the reverse order it opened.",
              },
            ],
          },
          {
            kind: "predict",
            id: "week-8-lecture-p3-whitespace",
            prompt: "What does the browser show for this body?",
            code: code`
<body>
    hello,


    body
</body>
`,
            language: "html",
            options: [
              "hello, body on a single line",
              "hello, then two blank lines, then body",
              "Nothing, because blank lines are an error",
            ],
            answer: 0,
            explanation:
              "Browsers collapse runs of spaces and newlines into one space. To get separate paragraphs you need <p> tags, which is why the notes wrap each paragraph in <p> and </p>.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p3-ordered",
            prompt: "How does this list appear?",
            code: code`
<ol>
    <li>foo</li>
    <li>bar</li>
    <li>baz</li>
</ol>
`,
            language: "html",
            options: [
              "Numbered: 1. foo, 2. bar, 3. baz",
              "As bullet points",
              "foo bar baz on one line",
            ],
            answer: 0,
            explanation:
              "<ol> is an ordered list, so the browser numbers the items. <ul>, the unordered list, is the one that shows bullets.",
          },
          {
            kind: "blank",
            id: "week-8-lecture-p3-li",
            prompt: "Fill the gap so bar becomes the second bullet in the list.",
            code: code`
<ul>
    <li>foo</li>
    ____bar</li>
    <li>baz</li>
</ul>
`,
            language: "html",
            options: ["<li>", "<ul>", "<p>"],
            answer: 0,
            explanation:
              "Each item opens with <li> and closes with </li>. A tag must close with the same name it opened with, so <p> would not match </li>.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p3-table",
            prompt:
              "The keypad table in the notes has four <tr> elements, and each holds three <td> elements. What do you see?",
            options: ["4 rows of 3 cells", "3 rows of 4 cells", "12 cells in one row"],
            answer: 0,
            explanation:
              "<tr> is a table row and <td> is a cell (table data) inside that row. Four rows of three cells give the 1 to 9, then *, 0, # keypad layout.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p3-form-url",
            prompt: "You type cats into this form and submit it. Where does the browser go?",
            code: code`
<form action="https://www.google.com/search" method="get">
    <input name="q" type="search">
    <input type="submit" value="Google Search">
</form>
`,
            language: "html",
            options: [
              "https://www.google.com/search?q=cats",
              "https://www.google.com/search?search=cats",
              "https://www.google.com/search/cats",
            ],
            answer: 0,
            explanation:
              "The action is where the form goes, and method get puts the data in the URL after a ?. The key is the input's name, q, not its type.",
          },
          {
            kind: "compare",
            id: "week-8-lecture-p3-name-attr",
            prompt: "Which form actually sends what you type to Google?",
            language: "html",
            a: {
              label: "Input without a name",
              code: code`
<form action="https://www.google.com/search" method="get">
    <input type="search">
    <button>Google Search</button>
</form>
`,
            },
            b: {
              label: "Input with name=\"q\"",
              code: code`
<form action="https://www.google.com/search" method="get">
    <input name="q" type="search">
    <button>Google Search</button>
</form>
`,
            },
            answer: "b",
            explanation:
              "The browser only submits inputs that have a name, because the name becomes the key in ?q=cats. Version A sends Google an empty search.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p3-alt",
            prompt:
              "In image.html, the tag is <img alt=\"photo of bridge\" src=\"bridge.png\">. If bridge.png is missing, what is the alt text for?",
            options: [
              "It describes the image, shown in its place and read aloud by screen readers",
              "It is a second file the browser tries instead",
              "It sets the image's width",
            ],
            answer: 0,
            explanation:
              "src says where the image file is, and alt says in words what it shows. That helps anyone who cannot see the image, whether it failed to load or they use a screen reader.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-8-lecture-p3-recap-swap",
        prompt: "Someone swaps the two texts in hello.html. What does the browser tab say now?",
        code: code`
<html lang="en">
    <head>
        <title>hello, body</title>
    </head>
    <body>
        hello, title
    </body>
</html>
`,
        language: "html",
        options: ["hello, body", "hello, title", "Nothing, the tab shows the file name"],
        answer: 0,
        explanation:
          "Whatever is inside <title> in the head goes on the tab, whatever it says. The text in body is what fills the page.",
      },
      exercise: {
        prompt:
          "Write about.html with a title, an <h1> with your name, an ordered list of three things you want to build after CS50, and a link to https://cs50.harvard.edu/x/. Serve it with http-server and open it: the tab shows your title, the list is numbered 1 to 3, and clicking the link opens CS50's site.",
        language: "html",
        starter: code`
<!DOCTYPE html>

<html lang="en">
    <head>
        <title></title>
    </head>
    <body>

    </body>
</html>
`,
        hints: [
          "The title goes inside <title> in the head; everything visible goes in the body.",
          "A numbered list is <ol>, and each item needs its own <li> and </li>.",
          "A link is an <a> tag whose href attribute holds the address.",
        ],
        solution: code`
<!DOCTYPE html>

<!-- The head holds the tab title; the body holds what you see. -->
<!-- <ol> numbers its items, and <a href> makes text clickable. -->

<html lang="en">
    <head>
        <title>about me</title>
    </head>
    <body>
        <h1>Ada</h1>
        <ol>
            <li>A homepage</li>
            <li>A habit tracker</li>
            <li>A game for my family</li>
        </ol>
        <p>
            I am taking <a href="https://cs50.harvard.edu/x/">CS50x</a>.
        </p>
    </body>
</html>
`,
      },
      recall: [
        {
          id: "week-8-lecture-p3-r1",
          prompt: "What is the difference between <ul> and <ol>?",
          options: [
            "<ul> shows bullet points and <ol> shows numbers",
            "<ul> is for links and <ol> is for images",
            "<ol> can only hold three items",
          ],
          answer: 0,
          explanation:
            "Both hold <li> items. ul is an unordered list with bullets, and ol is an ordered list with numbers.",
        },
        {
          id: "week-8-lecture-p3-r2",
          prompt: "In a form, what does an input's name attribute decide?",
          options: [
            "The key its value is sent under, like q in ?q=cats",
            "The grey hint text inside the box",
            "Whether the box gets the cursor when the page loads",
          ],
          answer: 0,
          explanation:
            "name becomes the key in the submitted data. The hint text is placeholder, and getting the cursor is autofocus.",
        },
        {
          id: "week-8-lecture-p3-r3",
          prompt: "Why doesn't pressing Enter twice in your HTML file start a new paragraph on the page?",
          options: [
            "The browser treats runs of whitespace as a single space, so you need <p> tags",
            "HTML files cannot contain blank lines",
            "New paragraphs only appear in the head",
          ],
          answer: 0,
          explanation:
            "Whitespace and indentation are effectively ignored when the page is drawn. Structure comes from tags such as <p>.",
        },
        {
          id: "week-8-lecture-p3-r4",
          prompt: "Which part of an HTML page holds information like the title but is not drawn in the window?",
          options: ["head", "body", "footer"],
          answer: 0,
          explanation:
            "The head holds information about the page, such as its title and stylesheets. The body holds what is displayed.",
        },
      ],
    },

    "week-8-lecture-p4": {
      hook: "A form that accepts any text will collect garbage, and a page with styles pasted onto every tag is painful to change. Here are three fixes: regular expressions so the browser rejects badly formed input, CSS so one rule styles many elements at once, and frameworks like Bootstrap so you get a clean design without writing every rule yourself.",
      after: {
        "regular-expressions": [
          {
            kind: "predict",
            id: "week-8-lecture-p4-pattern-reject",
            prompt: "With this input, which address does the browser refuse to submit?",
            code: code`
<input name="email" pattern=".+@.+\.edu" type="email">
`,
            language: "html",
            options: [
              "malan@harvard.edu",
              "john.harvard@college.harvard.edu",
              "malan@harvard.com",
            ],
            answer: 2,
            explanation:
              ".+ means one or more of any character, so anything can come before and after the @, but the whole value must end in .edu. The second address is fine because .+ happily matches college.harvard.",
          },
          {
            kind: "blank",
            id: "week-8-lecture-p4-pattern-dot",
            prompt: "Fill the gap so the address must end with a real dot followed by edu.",
            code: code`
<input name="email" pattern=".+@.+____" type="email">
`,
            language: "html",
            options: [String.raw`\.edu`, ".edu", "edu"],
            answer: 0,
            explanation:
              String.raw`In a regular expression a bare . matches any character, so .edu would also accept harvardxedu. The backslash in \. means a literal dot.`,
          },
        ],
        css: [
          {
            kind: "trace",
            id: "week-8-lecture-p4-cascade",
            caption:
              "With the .centered, .large and .medium classes from the notes, step through which styles each element ends up with.",
            code: code`
<body class="centered">
    <header class="large">
        John Harvard
    </header>
    <main class="medium">
        Welcome to my home page!
    </main>
</body>
`,
            language: "html",
            steps: [
              {
                line: 1,
                vars: { element: "body", "text-align": "center", "font-size": "medium" },
                note: "text-align comes from .centered. medium is the browser's default size.",
              },
              {
                line: 2,
                vars: { element: "header", "text-align": "center", "font-size": "large" },
                note: "header has no text-align of its own, so it inherits center from body. That is the cascade.",
              },
              {
                line: 3,
                vars: { element: "header", "text-align": "center", "font-size": "large" },
                output: "John Harvard (centered, large)",
              },
              { line: 4, vars: { element: "body", "text-align": "center", "font-size": "medium" } },
              {
                line: 5,
                vars: { element: "main", "text-align": "center", "font-size": "medium" },
                note: "center again comes down from body; medium comes from .medium.",
              },
              {
                line: 6,
                vars: { element: "main", "text-align": "center", "font-size": "medium" },
                output: "John Harvard (centered, large)\nWelcome to my home page! (centered, medium)",
              },
              {
                line: 8,
                vars: { element: "(none)", "text-align": "", "font-size": "" },
                output: "John Harvard (centered, large)\nWelcome to my home page! (centered, medium)",
              },
            ],
          },
          {
            kind: "blank",
            id: "week-8-lecture-p4-class-selector",
            prompt: "Fill the gap so this rule styles every element with class=\"centered\".",
            code: code`
____centered
{
    text-align: center;
}
`,
            language: "css",
            options: [".", "#", "(nothing)"],
            answer: 0,
            explanation:
              "A dot selects a class, which many elements can share. A # selects one element by its id, and no prefix would look for a tag named centered.",
          },
          {
            kind: "compare",
            id: "week-8-lecture-p4-inline-vs-class",
            prompt: "Both pages look the same. Which is better designed?",
            language: "html",
            a: {
              label: "Style on every tag",
              code: code`
<p style="font-size: large; text-align: center;">John Harvard</p>
<p style="font-size: medium; text-align: center;">Welcome to my home page!</p>
<p style="font-size: small; text-align: center;">Copyright &#169; John Harvard</p>
`,
            },
            b: {
              label: "Classes in a stylesheet",
              code: code`
<link href="style.css" rel="stylesheet">

<body class="centered">
    <header class="large">John Harvard</header>
    <main class="medium">Welcome to my home page!</main>
    <footer class="small">Copyright &#169; John Harvard</footer>
</body>
`,
            },
            answer: "b",
            explanation:
              "A repeats text-align: center three times, so a change means three edits. B says it once on body and lets it cascade, and style.css can be shared by every page of the site.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p4-link-typo",
            prompt:
              "Your file is called style.css, but the head says <link href=\"styles.css\" rel=\"stylesheet\">. What do you see?",
            options: [
              "All the content, with none of your styles",
              "A 404 page instead of your content",
              "A blank white page",
            ],
            answer: 0,
            explanation:
              "The HTML still loads; only the stylesheet request fails. The browser draws the page with its default styles, so check the href when styles seem to vanish.",
          },
        ],
        frameworks: [
          {
            kind: "predict",
            id: "week-8-lecture-p4-bootstrap-missing",
            prompt:
              "You add class=\"table\" to the phonebook table but forget the Bootstrap <link> in the head. What happens?",
            options: [
              "The table still looks plain, because nothing defines what .table means",
              "The browser downloads Bootstrap automatically",
              "The page shows an error about an unknown class",
            ],
            answer: 0,
            explanation:
              "A class is only a label. Bootstrap's stylesheet contains the rules for .table, so without the link the label matches no rule and nothing changes.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-8-lecture-p4-recap-one-file",
        prompt:
          "Three pages of your site link style.css and use class=\"large\" for their headers. You change .large to font-size: x-large in style.css. How many pages change?",
        options: ["All three", "Only the first page that loaded it", "None until you edit each page"],
        answer: 0,
        explanation:
          "Each page reads the same file, so one edit restyles every page. That is the point of moving styles out of the tags and into a shared stylesheet.",
      },
      exercise: {
        prompt:
          "Make menu.html with three dishes, each in a <div> with its price in a <span class=\"price\">. Give one dish id=\"special\". In style.css, give every .price the same color and make #special bold, then link style.css in the head. Serve it: all three prices share a color and only the special dish is bold.",
        language: "html",
        starter: code`
<!-- menu.html -->
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>menu</title>
    </head>
    <body>
        <div>Soup</div>
        <div>Pasta</div>
        <div>Cake</div>
    </body>
</html>

/* style.css */
`,
        hints: [
          "A class can be shared by many elements; an id belongs to one.",
          "In CSS, .price selects the class and #special selects the id.",
          "font-weight: bold makes text bold, and color sets the text color.",
        ],
        solution: code`
<!-- menu.html -->
<!-- The class styles all three prices with one rule; the id picks out one dish. -->
<!DOCTYPE html>

<html lang="en">
    <head>
        <link href="style.css" rel="stylesheet">
        <title>menu</title>
    </head>
    <body>
        <div>Soup <span class="price">$4</span></div>
        <div id="special">Pasta <span class="price">$9</span></div>
        <div>Cake <span class="price">$5</span></div>
    </body>
</html>

/* style.css */
.price
{
    color: green;
}

#special
{
    font-weight: bold;
}
`,
      },
      recall: [
        {
          id: "week-8-lecture-p4-r1",
          prompt: "In CSS, how do you select every element with class=\"large\"?",
          options: [".large", "#large", "large"],
          answer: 0,
          explanation:
            "A dot selects by class. #large would select one element with id=\"large\", and plain large would look for a <large> tag.",
        },
        {
          id: "week-8-lecture-p4-r2",
          prompt: "You set text-align: center on <body>. Why are the <div>s inside it centered too?",
          options: [
            "Styles cascade down from a parent to the elements inside it",
            "Every <div> is centered by default",
            "text-align only works on body",
          ],
          answer: 0,
          explanation:
            "Everything inside body is its child, so inherited properties like text-align flow down to them unless a child sets its own.",
        },
        {
          id: "week-8-lecture-p4-r3",
          prompt: String.raw`What does pattern=".+@.+\.edu" require?`,
          options: [
            "At least one character, an @, at least one more character, then .edu at the end",
            "Exactly one character before the @",
            "Any address that contains the letters edu anywhere",
          ],
          answer: 0,
          explanation:
            String.raw`.+ is one or more of any character, \. is a literal dot, and the whole value has to match the pattern.`,
        },
        {
          id: "week-8-lecture-p4-r4",
          prompt: "What does a framework like Bootstrap give you?",
          options: [
            "Ready-made CSS (and some JavaScript) you turn on by adding its classes",
            "A new language that replaces HTML",
            "A server that hosts your site",
          ],
          answer: 0,
          explanation:
            "You link Bootstrap's stylesheet, then add classes like table to your own HTML to get its styling.",
        },
      ],
    },

    "week-8-lecture-p5": {
      hook: "HTML and CSS describe a page, but they cannot react. JavaScript runs inside the browser: it reads what the user typed, listens for clicks and keystrokes, and rewrites the page in memory without a reload. Its building blocks are ones you know from C and Python. What is new is the DOM, the page as a tree your code can change.",
      after: {
        javascript: [
          {
            kind: "predict",
            id: "week-8-lecture-p5-greet",
            prompt: "The user types David in the box with id=\"name\" and submits. What does the alert say?",
            code: "alert('hello, ' + document.querySelector('#name').value);",
            language: "javascript",
            options: ["hello, David", "hello, #name", "hello, name"],
            answer: 0,
            explanation:
              "querySelector('#name') finds the element with that id, and .value is whatever is typed in it. + joins two strings, as in Python.",
          },
          {
            kind: "blank",
            id: "week-8-lecture-p5-select-id",
            prompt: "Fill the gap to get the text from <input id=\"name\">.",
            code: "let text = document.querySelector('____').value;",
            language: "javascript",
            options: ["#name", ".name", "name"],
            answer: 0,
            explanation:
              "querySelector uses CSS selectors, so # means id. .name would look for a class, and name would look for a <name> tag.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p5-no-dcl",
            prompt:
              "This script sits in the head with no DOMContentLoaded wrapper, and the form is further down the page. What happens?",
            code: code`
<head>
    <script>
        document.querySelector('form').addEventListener('submit', function(e) {
            alert('hello');
            e.preventDefault();
        });
    </script>
</head>
`,
            language: "html",
            options: [
              "It works the same as with the wrapper",
              "querySelector returns null because the form has not been read yet, so the line throws an error",
              "The browser waits for the form automatically",
            ],
            answer: 1,
            explanation:
              "The browser runs the script as soon as it reads it, before the body exists. DOMContentLoaded delays your code until the whole page is in memory.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p5-prevent-default",
            prompt:
              "In the DOMContentLoaded version of hello.html, you delete e.preventDefault();. What happens when you submit?",
            options: [
              "The alert shows, then the browser submits the form and reloads the page",
              "Nothing changes at all",
              "The alert stops appearing",
            ],
            answer: 0,
            explanation:
              "Submitting a form normally sends it and loads a new page. preventDefault stops that default behaviour so only your JavaScript runs.",
          },
          {
            kind: "trace",
            id: "week-8-lecture-p5-keyup",
            caption:
              "The user types D, then a, then deletes both letters. Each keyup runs the function again with the box's current text.",
            code: lines(
              "let input = document.querySelector('input');",
              "input.addEventListener('keyup', function(event) {",
              "    let name = document.querySelector('p');",
              "    if (input.value) {",
              "        name.innerHTML = `hello, ${input.value}`;",
              "    }",
              "    else {",
              "        name.innerHTML = 'hello, whoever you are';",
              "    }",
              "});",
            ),
            language: "javascript",
            steps: [
              { line: 1, vars: { input: "<input>", "input.value": "''", "p.innerHTML": "''" } },
              {
                line: 2,
                vars: { input: "<input>", "input.value": "''", "p.innerHTML": "''" },
                note: "This only registers the function. Nothing inside it runs until a key is released.",
              },
              {
                line: 3,
                vars: { input: "<input>", "input.value": "'D'", name: "<p>", "p.innerHTML": "''" },
                note: "The user released D.",
              },
              { line: 4, vars: { input: "<input>", "input.value": "'D'", name: "<p>", "p.innerHTML": "''" } },
              {
                line: 5,
                vars: { input: "<input>", "input.value": "'D'", name: "<p>", "p.innerHTML": "'hello, D'" },
              },
              {
                line: 3,
                vars: { input: "<input>", "input.value": "'Da'", name: "<p>", "p.innerHTML": "'hello, D'" },
                note: "The user released a. The function starts over.",
              },
              {
                line: 5,
                vars: { input: "<input>", "input.value": "'Da'", name: "<p>", "p.innerHTML": "'hello, Da'" },
                note: "Line 4 was true again.",
              },
              {
                line: 3,
                vars: { input: "<input>", "input.value": "''", name: "<p>", "p.innerHTML": "'hello, D'" },
                note: "After two Backspaces the box is empty. (The first Backspace had set hello, D.)",
              },
              {
                line: 4,
                vars: { input: "<input>", "input.value": "''", name: "<p>", "p.innerHTML": "'hello, D'" },
                note: "An empty string counts as false.",
              },
              {
                line: 8,
                vars: {
                  input: "<input>",
                  "input.value": "''",
                  name: "<p>",
                  "p.innerHTML": "'hello, whoever you are'",
                },
              },
            ],
          },
          {
            kind: "compare",
            id: "week-8-lecture-p5-onsubmit-vs-listener",
            prompt: "Both show the same greeting. Which is better designed?",
            language: "html",
            a: {
              label: "onsubmit attribute",
              code: code`
<form onsubmit="greet(); return false;">
    <input id="name" type="text">
    <input type="submit">
</form>
`,
            },
            b: {
              label: "Event listener in the script",
              code: code`
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('form').addEventListener('submit', function(e) {
            alert('hello, ' + document.querySelector('#name').value);
            e.preventDefault();
        });
    });
</script>
<form>
    <input id="name" type="text">
    <input type="submit">
</form>
`,
            },
            answer: "b",
            explanation:
              "The notes call mixing onsubmit into the HTML bad design. B keeps structure in HTML and behaviour in JavaScript, so you can change either without touching the other.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p5-blink-first",
            prompt:
              "When the page loads, body.style.visibility is an empty string. What does the first call to blink() do?",
            code: code`
function blink()
{
    let body = document.querySelector('body');
    if (body.style.visibility == 'hidden')
    {
        body.style.visibility = 'visible';
    }
    else
    {
        body.style.visibility = 'hidden';
    }
}

window.setInterval(blink, 500);
`,
            language: "javascript",
            options: [
              "Hides the text, after the first 500 milliseconds",
              "Shows the text, so nothing visibly changes",
              "Throws an error because visibility was never set",
            ],
            answer: 0,
            explanation:
              "An empty string is not equal to 'hidden', so the else branch runs and hides the body. setInterval waits 500 ms before each call, and every call flips it.",
          },
          {
            kind: "predict",
            id: "week-8-lecture-p5-autocomplete",
            prompt:
              "In the autocomplete page, suppose WORDS is ['cat', 'cats', 'dog']. You type ca. How many <li> items are on the page?",
            options: ["0", "1", "2", "3"],
            answer: 2,
            explanation:
              "Both cat and cats start with ca. Each keyup starts html over from an empty string, so the list never collects duplicates from earlier keys.",
          },
        ],
      },
      recap: {
        kind: "predict",
        id: "week-8-lecture-p5-recap-empty",
        prompt:
          "In the first hello.html, with greet() and alert('hello, ' + document.querySelector('#name').value), you submit without typing anything. What does the alert say?",
        options: ["hello, ", "hello, whoever you are", "hello, undefined"],
        answer: 0,
        explanation:
          "An empty text box has the value '', so the alert joins hello, with nothing. The whoever you are fallback only existed in the keyup version, which checked for an empty value.",
      },
      exercise: {
        prompt:
          "Make count.html with a <textarea> and a <p>. Using addEventListener with the keyup event, update the <p> after every key to say how many characters are in the textarea, like 5 characters. Serve it with http-server: typing hello shows 5 characters, and deleting everything shows 0 characters.",
        language: "html",
        starter: code`
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>count</title>
    </head>
    <body>
        <textarea></textarea>
        <p>0 characters</p>
        <script>

        </script>
    </body>
</html>
`,
        hints: [
          "The script is at the end of body, so both elements already exist when it runs. Grab each once with document.querySelector.",
          "A textarea's text is in .value, and every string has a .length.",
          "Set the paragraph's innerHTML inside the listener so it updates on every key.",
        ],
        solution: code`
<!DOCTYPE html>

<!-- The script sits after the elements, so querySelector finds them without DOMContentLoaded. -->
<!-- keyup fires after each key, and value.length counts what is in the box at that moment. -->

<html lang="en">
    <head>
        <title>count</title>
    </head>
    <body>
        <textarea></textarea>
        <p>0 characters</p>
        <script>
            let box = document.querySelector('textarea');
            let count = document.querySelector('p');
            box.addEventListener('keyup', function() {
                count.innerHTML = box.value.length + ' characters';
            });
        </script>
    </body>
</html>
`,
      },
      recall: [
        {
          id: "week-8-lecture-p5-r1",
          prompt: "What does wrapping your code in a DOMContentLoaded listener guarantee?",
          options: [
            "The code runs only after the whole page has been read into memory",
            "The code runs before the page starts loading",
            "The code runs again every time the user clicks",
          ],
          answer: 0,
          explanation:
            "Without it, a script in the head can run before the elements it looks for exist, and querySelector returns null.",
        },
        {
          id: "week-8-lecture-p5-r2",
          prompt: "What does element.innerHTML = 'hello' do?",
          options: [
            "Replaces what is inside that element, changing the page without a reload",
            "Saves hello into the HTML file on disk",
            "Shows hello in a pop-up",
          ],
          answer: 0,
          explanation:
            "JavaScript changes the DOM, the copy of the page in memory. The file on the server is untouched, and a pop-up is what alert does.",
        },
        {
          id: "week-8-lecture-p5-r3",
          prompt: "What does window.setInterval(blink, 500) do?",
          options: [
            "Calls blink every 500 milliseconds",
            "Calls blink once, 500 times",
            "Waits 500 seconds, then calls blink once",
          ],
          answer: 0,
          explanation:
            "setInterval takes a function and a gap in milliseconds, and keeps calling the function with that gap between calls.",
        },
        {
          id: "week-8-lecture-p5-r4",
          prompt: "Why call e.preventDefault() inside a submit listener?",
          options: [
            "To stop the browser from sending the form and loading a new page",
            "To stop other scripts from reading the form",
            "To clear the text the user typed",
          ],
          answer: 0,
          explanation:
            "Submitting a form has a default behaviour. preventDefault cancels it so your JavaScript can handle the submit on its own.",
        },
      ],
    },
  },

  section: {
    recall: [
      {
        id: "week-8-section-r1",
        prompt: "In the scoreboard, why is #score1 an id while a style shared by both teams' cells would be a class?",
        options: [
          "An id names one element; a class can be given to many",
          "Ids are for CSS and classes are for JavaScript",
          "Classes only work on buttons",
        ],
        answer: 0,
        explanation:
          "Only one cell shows team 1's score, so an id fits. A class like .team can be put on several elements to style them all with one rule.",
      },
      {
        id: "week-8-section-r2",
        prompt: "Someone writes = instead of === in the win check. What happens on the very first click of +1?",
        code: lines(
          "let team1 = 0;",
          "document.querySelector('#add1').onclick = function() {",
          "    team1 = team1 + 1;",
          "    document.querySelector('#score1').innerHTML = team1;",
          "    if (team1 = 10) {",
          "        alert('Team 1 has won!');",
          "    }",
          "};",
        ),
        options: [
          "The alert appears at once, because = stores 10 in team1 and 10 counts as true",
          "Nothing happens until the score really reaches 10",
          "The browser refuses to run the script",
        ],
        answer: 0,
        explanation:
          "As in C, = assigns rather than compares. The page still shows 1, but team1 is now 10 and the alert fires on every click.",
      },
      {
        id: "week-8-section-r3",
        prompt: "Adding padding to the table did not move it away from the heading, but margin did. Why?",
        options: [
          "Padding is space inside an element's border; margin is space outside it",
          "Padding only works on text, not tables",
          "Margin is measured in pixels and padding is not",
        ],
        answer: 0,
        explanation:
          "To push other elements away you need space outside the border, which is margin. The browser's inspect tool shows both.",
      },
      {
        id: "week-8-section-r4",
        prompt: "What does document.querySelector('#score1').innerHTML = team1; do after a click?",
        options: [
          "Replaces the text inside the score cell with the new score",
          "Adds a new row to the table",
          "Reloads the page with the new score",
        ],
        answer: 0,
        explanation:
          "querySelector finds the one cell with id score1, and setting innerHTML changes what it shows, without a reload.",
      },
    ],
    exercise: {
      prompt:
        "Build scoreboard.html with two teams, each with a +1 button and a score cell. Add a Reset button that sets both scores back to 0, and alert when either team reaches 10, using ===. Serve it: ten clicks on a team's +1 show one alert, and Reset shows 0 and 0 again.",
      language: "html",
      starter: code`
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>scoreboard</title>
    </head>
    <body>
        <table>
            <tr><td>Team 1</td><td>Team 2</td></tr>
            <tr><td id="score1">0</td><td id="score2">0</td></tr>
            <tr>
                <td><button id="add1">+1</button></td>
                <td><button id="add2">+1</button></td>
            </tr>
        </table>
        <button id="reset">Reset</button>
        <script>
            let team1 = 0;
            let team2 = 0;
            // TODO
        </script>
    </body>
</html>
`,
      hints: [
        "Each button needs its own click listener: document.querySelector('#add1').addEventListener('click', ...).",
        "After changing a score variable, write it into the matching cell with innerHTML.",
        "Reset must change both the variables and the two cells, or the next click starts from the old score.",
      ],
      solution: code`
<!DOCTYPE html>

<!-- The variables hold the scores; innerHTML copies them onto the page after every change. -->
<!-- Reset clears both, so the next +1 starts from 0 again. -->

<html lang="en">
    <head>
        <title>scoreboard</title>
    </head>
    <body>
        <table>
            <tr><td>Team 1</td><td>Team 2</td></tr>
            <tr><td id="score1">0</td><td id="score2">0</td></tr>
            <tr>
                <td><button id="add1">+1</button></td>
                <td><button id="add2">+1</button></td>
            </tr>
        </table>
        <button id="reset">Reset</button>
        <script>
            let team1 = 0;
            let team2 = 0;

            document.querySelector('#add1').addEventListener('click', function() {
                team1 = team1 + 1;
                document.querySelector('#score1').innerHTML = team1;
                if (team1 === 10) {
                    alert('Team 1 has won!');
                }
            });

            document.querySelector('#add2').addEventListener('click', function() {
                team2 = team2 + 1;
                document.querySelector('#score2').innerHTML = team2;
                if (team2 === 10) {
                    alert('Team 2 has won!');
                }
            });

            document.querySelector('#reset').addEventListener('click', function() {
                team1 = 0;
                team2 = 0;
                document.querySelector('#score1').innerHTML = team1;
                document.querySelector('#score2').innerHTML = team2;
            });
        </script>
    </body>
</html>
`,
    },
  },

  shorts: {
    "week-8-short-internet-primer": {
      recall: [
        {
          id: "week-8-short-internet-primer-r1",
          prompt: "Before DHCP existed, who gave a computer its IP address?",
          options: [
            "A system administrator, by hand",
            "The website the computer visited first",
            "DNS, automatically",
          ],
          answer: 0,
          explanation:
            "DHCP automates a job that used to be done manually: a server hands out addresses from a list it is allowed to assign.",
        },
        {
          id: "week-8-short-internet-primer-r2",
          prompt: "Why are IPv6 addresses usually written in hexadecimal instead of decimal?",
          options: [
            "They are 128 bits long, so hex keeps them much shorter to write",
            "Hexadecimal addresses are more secure",
            "Routers cannot read decimal numbers",
          ],
          answer: 0,
          explanation:
            "IPv4 fits in four decimal numbers, but 128 bits would be very long in decimal. IPv6 is written as eight groups of hex digits, and runs of zeros can be shortened to ::.",
        },
        {
          id: "week-8-short-internet-primer-r3",
          prompt: "The short calls DNS the yellow pages of the web. Why?",
          options: [
            "It looks up the number (IP address) that goes with a name",
            "It lists every web page in alphabetical order",
            "It advertises websites to users",
          ],
          answer: 0,
          explanation:
            "Like a phone directory, DNS maps names you can remember to the numbers machines actually use.",
        },
      ],
    },
    "week-8-short-ip": {
      recall: [
        {
          id: "week-8-short-ip-r1",
          prompt: "Why connect networks through routers instead of wiring every network directly to every other?",
          options: [
            "Direct wires between every pair would cost far too much; routers pass data along a few hops instead",
            "Direct wires are slower than going through routers",
            "Routers give each network its domain name",
          ],
          answer: 0,
          explanation:
            "The trade-off is a few extra hops in exchange for far less cable. Each router uses its routing table to move data closer to its destination.",
        },
        {
          id: "week-8-short-ip-r2",
          prompt: "What does a router do with a packet whose destination it is not connected to?",
          options: [
            "Passes it to another router that is closer to the destination",
            "Drops it immediately",
            "Sends it back to the sender",
          ],
          answer: 0,
          explanation:
            "Its routing table says which way to send each range of addresses, so the packet moves one step closer each time.",
        },
        {
          id: "week-8-short-ip-r3",
          prompt: "Why might a router table list two different ways to reach the same network?",
          options: [
            "So packets still get through if one path fails or is busy",
            "So every packet is delivered twice",
            "Because IP addresses can belong to two networks at once",
          ],
          answer: 0,
          explanation:
            "With more than one route, a failure on one link does not cut the network off, and traffic can go around a congested router.",
        },
      ],
    },
    "week-8-short-tcp": {
      recall: [
        {
          id: "week-8-short-tcp-r1",
          prompt: "What does TCP add that IP alone does not provide?",
          options: [
            "A guarantee that every packet is delivered, in the right order",
            "An address for each computer",
            "A domain name for each website",
          ],
          answer: 0,
          explanation:
            "IP moves packets toward an address. TCP numbers them, like packet 8 of 15, and asks for any that went missing.",
        },
        {
          id: "week-8-short-tcp-r2",
          prompt: "Which port is conventionally used for secure web browsing (HTTPS)?",
          options: ["443", "80", "25", "53"],
          answer: 0,
          explanation:
            "443 is HTTPS and 80 is plain HTTP. 25 is SMTP for email and 53 is DNS.",
        },
        {
          id: "week-8-short-tcp-r3",
          prompt: "Why does a packet need a port number as well as an IP address?",
          options: [
            "The IP address picks the machine; the port picks which service on that machine gets the data",
            "The port number replaces the IP address on local networks",
            "The port number tells routers which path to take",
          ],
          answer: 0,
          explanation:
            "One computer can run a web server, an email server and more at once. The port says which of them the data is for.",
        },
      ],
    },
    "week-8-short-http": {
      recall: [
        {
          id: "week-8-short-http-r1",
          prompt: "In the request line GET /cats.html HTTP/1.1, what is /cats.html?",
          options: [
            "The request target: which page on the host you want",
            "The name of the website",
            "The status code",
          ],
          answer: 0,
          explanation:
            "A request line has a method, a request target and the HTTP version. The website itself goes on the separate Host line.",
        },
        {
          id: "week-8-short-http-r2",
          prompt: "Why do you rarely see a 301 Moved Permanently in your browser?",
          options: [
            "The browser follows it to the new location automatically",
            "Servers never send 301",
            "301 only appears on mobile devices",
          ],
          answer: 0,
          explanation:
            "A 301 response says where the page now lives, and modern browsers simply make a new request there.",
        },
        {
          id: "week-8-short-http-r3",
          prompt: "Which range of status codes means something went wrong on the client's side, like asking for a page that does not exist?",
          options: ["400s", "200s", "300s", "500s"],
          answer: 0,
          explanation:
            "404 Not Found and 403 Forbidden are 400s. 200s mean success, 300s mean redirection, and 500s are server errors.",
        },
      ],
    },
    "week-8-short-html": {
      recall: [
        {
          id: "week-8-short-html-r1",
          prompt: "Why is HTML called a markup language rather than a programming language?",
          options: [
            "Its tags describe the structure of text; it has no variables, loops or logic",
            "It can only be written by hand, not generated",
            "It is compiled into C before the browser runs it",
          ],
          answer: 0,
          explanation:
            "Tags tell the browser how to treat the text between them, such as heading or list item. Logic comes from JavaScript.",
        },
        {
          id: "week-8-short-html-r2",
          prompt: "How do you write a comment in HTML?",
          options: ["<!-- like this -->", "// like this", "# like this"],
          answer: 0,
          explanation:
            "HTML comments start with <!-- and end with -->. // is a comment in C and JavaScript, and # in Python.",
        },
        {
          id: "week-8-short-html-r3",
          prompt: "Your page looks fine, but you want to know whether its HTML is well formed. What can you use?",
          options: [
            "An online HTML validator",
            "The compiler, as with C",
            "Nothing; any page that displays is valid",
          ],
          answer: 0,
          explanation:
            "Browsers are forgiving and will display broken HTML. A validator checks for mistakes like tags that never close.",
        },
      ],
    },
    "week-8-short-css": {
      recall: [
        {
          id: "week-8-short-css-r1",
          prompt: "Which selector matches the one element with id=\"unique\"?",
          options: ["#unique", ".unique", "unique"],
          answer: 0,
          explanation:
            "Hash selects an id, dot selects a class, and a bare word selects a tag. Ids should be used for only one element.",
        },
        {
          id: "week-8-short-css-r2",
          prompt: "What does color: #ff0000; specify?",
          options: [
            "A color written as six hex digits: two each for red, green and blue",
            "An id selector named ff0000",
            "A font size of ff0000 pixels",
          ],
          answer: 0,
          explanation:
            "After a property, # starts a hex color. ff is full red and 00 is no green or blue, so this is red.",
        },
        {
          id: "week-8-short-css-r3",
          prompt: "What is the advantage of a separate .css file linked with a <link> tag?",
          options: [
            "Many pages can share one stylesheet, so a change happens in one place",
            "It is the only way CSS can work",
            "It makes the HTML load without any styles",
          ],
          answer: 0,
          explanation:
            "Styles can also go in a style attribute or a <style> tag, but a linked file keeps them in one place for a whole site.",
        },
      ],
    },
    "week-8-short-javascript": {
      recall: [
        {
          id: "week-8-short-javascript-r1",
          prompt: "What is the preferred way to include a JavaScript file used on several pages?",
          options: [
            "<script src=\"file.js\"></script> on each page",
            "Copy the code into a <script> tag on each page",
            "<link href=\"file.js\" rel=\"script\">",
          ],
          answer: 0,
          explanation:
            "The src attribute points to one shared file, just as a <link> tag shares a stylesheet. Copying code means fixing bugs in many places.",
        },
        {
          id: "week-8-short-javascript-r2",
          prompt: "With let nums = [10, 20, 30];, what does for (let i in nums) give you on each pass?",
          options: ["The index: 0, then 1, then 2", "The values: 10, then 20, then 30", "Nothing; for in only works on strings"],
          answer: 0,
          explanation:
            "for ... in walks over keys, and an array's keys are its indexes. Use nums[i] to get each value.",
        },
        {
          id: "week-8-short-javascript-r3",
          prompt: "In JavaScript, an object with properties and methods is most like what you saw earlier in the course?",
          options: [
            "A C struct, or a Python dictionary, that can also hold functions",
            "A C array of integers",
            "A SQL table",
          ],
          answer: 0,
          explanation:
            "An object groups named fields like a struct or dictionary. Its methods are functions you call on it with a dot, as in object.method().",
        },
      ],
    },
    "week-8-short-dom": {
      recall: [
        {
          id: "week-8-short-dom-r1",
          prompt: "What is the document object?",
          options: [
            "A JavaScript object that holds the whole page as a tree of nested objects",
            "The HTML file saved on the server",
            "A list of every website the browser has visited",
          ],
          answer: 0,
          explanation:
            "Each tag becomes an object inside its parent, like a tree. Change these objects and the page you see changes.",
        },
        {
          id: "week-8-short-dom-r2",
          prompt: "Which method finds an element by its id?",
          options: ["document.getElementById('name')", "document.getElementByID('name')", "document.findId('name')"],
          answer: 0,
          explanation:
            "JavaScript is case sensitive, and the d in Id is lowercase. getElementByID with a capital D does not exist.",
        },
        {
          id: "week-8-short-dom-r3",
          prompt: "For a node in the DOM tree, what is parentNode?",
          options: [
            "The node one level up that contains it",
            "The first node on the page",
            "A copy of the node",
          ],
          answer: 0,
          explanation:
            "parentNode goes up one level and childNodes goes down to the nodes inside, which is how you move around the tree.",
        },
      ],
    },
  },

  glossary: [
    { term: "IP address", meaning: "A number like 140.247.220.24 that identifies one computer on the internet." },
    { term: "Router", meaning: "A device that passes packets along, one step closer to where they are going." },
    { term: "Packet", meaning: "A small, standard-shaped piece of data that carries its source and destination address." },
    { term: "TCP", meaning: "The protocol that numbers packets, puts them back in order and resends lost ones, and uses ports to pick a service." },
    { term: "Port", meaning: "A number that says which service on a computer the data is for, such as 80 for HTTP or 443 for HTTPS." },
    { term: "DNS", meaning: "The system of servers that turns a domain name like harvard.edu into an IP address." },
    { term: "DHCP", meaning: "The protocol that gives your device its IP address, default gateway and nameservers when it joins a network." },
    { term: "HTTP and HTTPS", meaning: "The protocol browsers and servers use to request and send web pages; HTTPS is its secure version." },
    { term: "Status code", meaning: "The number at the start of a response that says how it went, like 200 OK or 404 Not Found." },
    { term: "HTML", meaning: "The markup language of tags, like <p> and <ul>, that gives a web page its structure." },
    { term: "Attribute", meaning: "Extra information written inside a tag, like href in <a href=\"...\"> or lang in <html lang=\"en\">." },
    { term: "Regular expression", meaning: "A pattern, like .+@.+\\.edu, that text must match." },
    { term: "CSS", meaning: "The style sheet language that controls how HTML looks, using selectors and property: value pairs." },
    { term: "Class and id", meaning: "Labels you put on elements so CSS or JavaScript can find them: a class (.name) for many, an id (#name) for one." },
    { term: "Framework", meaning: "A third-party library, like Bootstrap, that gives you ready-made styles or code to build on." },
    { term: "JavaScript", meaning: "The programming language that runs in the browser and makes pages interactive." },
    { term: "DOM", meaning: "The Document Object Model: the page loaded into memory as a tree that JavaScript can read and change." },
    { term: "Event listener", meaning: "A function the browser calls when something happens, like a click, a keyup or a form submit." },
  ],
};

export default content;
