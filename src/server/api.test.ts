import { readFile } from "node:fs/promises";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { authConfiguration, digest, handleApi, type Env } from "./api";
import { courseUnits } from "../lib/course";
import type { AppState, Attempt, StudySession } from "../lib/model";
import { addDays, dateInZone } from "../lib/schedule";

const origin = "http://localhost:5173";
const owner = "owner@example.test";
let runtime: Miniflare;
let env: Env;

function request(
  path: string,
  method = "GET",
  data?: unknown,
  cookie?: string,
  extra: Record<string, string> = {},
) {
  return new Request(`${origin}${path}`, {
    method,
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
}

async function link(email = owner, extra: Record<string, string> = {}) {
  const response = await handleApi(
    request("/api/auth/request", "POST", { email }, undefined, extra),
    env,
  );
  const result = (await response.json()) as { developmentUrl: string };
  expect(response.status).toBe(200);
  return new URL(result.developmentUrl).searchParams.get("token")!;
}

async function login() {
  const response = await handleApi(
    request("/api/auth/verify", "POST", { token: await link() }),
    env,
  );
  expect(response.status).toBe(200);
  return response.headers.get("Set-Cookie")!.split(";")[0];
}

function state(): AppState {
  return {
    schemaVersion: 1,
    settings: {
      startDate: "2026-11-16",
      timezone: "Asia/Jakarta",
      weekdayStart: "09:00",
      weekdayMinutes: 240,
      breakStart: "12:00",
      breakMinutes: 60,
      saturdayStart: "09:00",
      saturdayMinutes: 120,
    },
    resources: {},
    attempts: [],
    sessions: [],
    activeTaskId: null,
    activeSessionId: null,
    sessionRecoveryId: null,
    blockers: {},
    milestones: {},
    taskEstimates: {},
    planHistory: [],
    plan: {
      version: 0,
      startDate: "2026-11-16",
      targetDate: "2027-02-05",
      timezone: "Asia/Jakarta",
      blocks: [],
    },
  };
}

beforeAll(async () => {
  runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script:
        'export default { fetch() { return new Response("D1 test runtime") } }',
      d1Databases: ["DB"],
      compatibilityDate: "2026-11-01",
    }),
  );
  const db = await runtime.getD1Database("DB");
  const sql = await readFile(
    new URL("../../migrations/0001_initial.sql", import.meta.url),
    "utf8",
  );
  await db.batch(
    sql
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean)
      .map((statement) => db.prepare(statement)),
  );
  env = {
    DB: db as unknown as D1Database,
    OWNER_EMAIL: owner,
    APP_ORIGIN: origin,
    AUTH_MODE: "development",
    LOCAL_AUTH_BYPASS: "false",
  };
}, 30_000);

beforeEach(async () => {
  vi.restoreAllMocks();
  for (const table of [
    "magic_tokens",
    "auth_sessions",
    "login_requests",
    "owner_state",
    "state_operations",
  ])
    await env.DB.prepare(`DELETE FROM ${table}`).run();
});

afterAll(async () => {
  await runtime?.dispose();
});

describe("private magic-link authentication on actual local D1", () => {
  it("opens the local owner's saved state without login on loopback hosts", async () => {
    const local = { ...env, LOCAL_AUTH_BYPASS: undefined };
    for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) {
      const response = await handleApi(
        new Request(`http://${hostname}:5173/api/auth/session`),
        local,
      );
      expect(await response.json()).toEqual({
        authenticated: true,
        email: owner,
        development: true,
        configured: true,
      });
      expect(response.headers.get("Set-Cookie")).toBeNull();
    }
    const save = { revision: 0, state: state(), operationId: "local-save" };
    expect(
      (await handleApi(request("/api/state", "PUT", save), local)).status,
    ).toBe(200);
    expect(
      await (await handleApi(request("/api/state"), local)).json(),
    ).toEqual({
      revision: 1,
      state: save.state,
    });
    expect(
      (
        await handleApi(
          request("/api/state", "PUT", save, undefined, {
            Origin: "https://attacker.test",
          }),
          local,
        )
      ).status,
    ).toBe(403);
    expect(
      await env.DB.prepare("SELECT COUNT(*) AS count FROM auth_sessions").first(
        "count",
      ),
    ).toBe(0);
  });

  it("never bypasses production login or trusts forwarded localhost headers", async () => {
    const production: Env = {
      ...env,
      AUTH_MODE: "production",
      LOCAL_AUTH_BYPASS: "true",
      APP_ORIGIN: "https://private.example",
      EMAIL_FROM: "login@example.test",
      EMAIL: { send: vi.fn(async () => ({ messageId: "unused" })) },
    };
    const response = await handleApi(
      new Request("https://private.example/api/auth/session", {
        headers: { "X-Forwarded-Host": "localhost:5173" },
      }),
      production,
    );
    expect(await response.json()).toEqual({
      authenticated: false,
      development: false,
      configured: true,
    });
    expect(
      (
        await handleApi(
          new Request("https://private.example/api/state"),
          production,
        )
      ).status,
    ).toBe(401);
    const localProduction = {
      ...production,
      APP_ORIGIN: "https://localhost:5173",
    };
    expect(
      (
        await handleApi(
          new Request("https://localhost:5173/api/state"),
          localProduction,
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await handleApi(new Request("https://private.example/api/state"), {
          ...production,
          AUTH_MODE: "development",
        })
      ).status,
    ).toBe(503);
  });

  it("fails closed for missing production configuration and accidental remote development mode", async () => {
    expect(
      authConfiguration(new Request("https://cs50track.example/"), {
        ...env,
        APP_ORIGIN: "https://cs50track.example",
      }).configured,
    ).toBe(false);
    expect(
      authConfiguration(request("/"), { ...env, AUTH_MODE: undefined })
        .configured,
    ).toBe(false);
    expect(
      await (
        await handleApi(request("/api/auth/session"), {
          ...env,
          OWNER_EMAIL: undefined,
        })
      ).json(),
    ).toEqual({ authenticated: false, development: true, configured: false });
  });

  it("rejects malformed and cross-origin requests and gives an unlisted address the neutral response", async () => {
    expect(
      (
        await handleApi(
          request("/api/auth/request", "POST", { email: "invalid" }),
          env,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await handleApi(
          request("/api/auth/request", "POST", { email: owner }, undefined, {
            Origin: "https://attacker.test",
          }),
          env,
        )
      ).status,
    ).toBe(403);
    const response = await handleApi(
      request("/api/auth/request", "POST", { email: "stranger@example.test" }),
      env,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message:
        "If this address has access, a sign-in link is on its way. Check your inbox.",
    });
    expect(
      await env.DB.prepare("SELECT COUNT(*) AS count FROM magic_tokens").first(
        "count",
      ),
    ).toBe(0);
    expect((await handleApi(request("/api/state"), env)).status).toBe(401);
  });

  it("normalizes owner case, stores only a token digest, and GET does not consume it", async () => {
    const token = await link("  OWNER@EXAMPLE.TEST  ");
    expect(token).toHaveLength(43);
    const row = await env.DB.prepare(
      "SELECT digest, expires_at - created_at AS lifetime FROM magic_tokens",
    ).first<{ digest: string; lifetime: number }>();
    expect(row).toEqual({ digest: await digest(token), lifetime: 900_000 });
    expect(
      (await handleApi(request(`/api/auth/verify?token=${token}`), env)).status,
    ).toBe(401);
    const response = await handleApi(
      request("/api/auth/verify", "POST", { token }),
      env,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toContain(
      "HttpOnly; SameSite=Lax; Max-Age=2592000",
    );
  });

  it("atomically allows one of two concurrent confirmations and rejects expired tokens", async () => {
    const token = await link();
    const responses = await Promise.all(
      [1, 2].map(() =>
        handleApi(request("/api/auth/verify", "POST", { token }), env),
      ),
    );
    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 400,
    ]);
    expect(
      await env.DB.prepare("SELECT COUNT(*) AS count FROM auth_sessions").first(
        "count",
      ),
    ).toBe(1);
    const expired = await link();
    await env.DB.prepare(
      "UPDATE magic_tokens SET expires_at = 0 WHERE digest = ?",
    )
      .bind(await digest(expired))
      .run();
    expect(
      (
        await handleApi(
          request("/api/auth/verify", "POST", { token: expired }),
          env,
        )
      ).status,
    ).toBe(400);
  });

  it("enforces the address limit across concurrent requests and the source limit across addresses", async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        handleApi(request("/api/auth/request", "POST", { email: owner }), env),
      ),
    );
    expect(
      responses.filter((response) => response.status === 200),
    ).toHaveLength(3);
    expect(
      responses.filter((response) => response.status === 429),
    ).toHaveLength(2);
    expect(
      Number(
        responses
          .find((response) => response.status === 429)!
          .headers.get("Retry-After"),
      ),
    ).toBeGreaterThan(0);
    for (let index = 0; index < 7; index++)
      expect(
        (
          await handleApi(
            request("/api/auth/request", "POST", {
              email: `person${index}@example.test`,
            }),
            env,
          )
        ).status,
      ).toBe(200);
    expect(
      (
        await handleApi(
          request("/api/auth/request", "POST", { email: "last@example.test" }),
          env,
        )
      ).status,
    ).toBe(429);
  });

  it("expires server sessions and revokes the old cookie on logout", async () => {
    const cookie = await login();
    expect(
      await (
        await handleApi(
          request("/api/auth/session", "GET", undefined, cookie),
          env,
        )
      ).json(),
    ).toEqual({
      authenticated: true,
      email: owner,
      development: true,
      configured: true,
    });
    const response = await handleApi(
      request("/api/auth/logout", "POST", undefined, cookie),
      env,
    );
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(
      (await handleApi(request("/api/state", "GET", undefined, cookie), env))
        .status,
    ).toBe(401);
    const second = await login();
    await env.DB.prepare("UPDATE auth_sessions SET expires_at = 0").run();
    expect(
      (await handleApi(request("/api/state", "GET", undefined, second), env))
        .status,
    ).toBe(401);
  });

  it("sends production email natively without disclosing a token and uses Secure cookies", async () => {
    const send = vi.fn(
      async (_message: EmailMessage | EmailMessageBuilder) => ({
        messageId: "test-message",
      }),
    );
    const production: Env = {
      ...env,
      AUTH_MODE: undefined,
      APP_ORIGIN: "https://private.example",
      EMAIL_FROM: "login@example.test",
      EMAIL: { send },
    };
    const post = (path: string, data: unknown) =>
      new Request(`https://private.example${path}`, {
        method: "POST",
        headers: {
          Origin: "https://private.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    const response = await handleApi(
      post("/api/auth/request", { email: owner }),
      production,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).not.toHaveProperty("developmentUrl");
    expect(send).toHaveBeenCalledOnce();
    const message = send.mock.calls[0][0] as unknown as {
      text: string;
      to: string;
    };
    expect(message.to).toBe(owner);
    const token = new URL(
      message.text.match(/https:\/\/\S+/)![0],
    ).searchParams.get("token")!;
    const verified = await handleApi(
      post("/api/auth/verify", { token }),
      production,
    );
    expect(verified.headers.get("Set-Cookie")).toMatch(
      /^__Host-cs50_session=.*; Secure$/,
    );
  });

  it("deletes a failed delivery token and returns a retryable error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const production: Env = {
      ...env,
      AUTH_MODE: undefined,
      APP_ORIGIN: "https://private.example",
      EMAIL_FROM: "login@example.test",
      EMAIL: {
        send: async () => {
          throw Object.assign(new Error("private provider details"), {
            code: "E_DELIVERY_FAILED",
          });
        },
      },
    };
    const response = await handleApi(
      new Request("https://private.example/api/auth/request", {
        method: "POST",
        headers: {
          Origin: "https://private.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: owner }),
      }),
      production,
    );
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain(
      "private provider details",
    );
    expect(
      await env.DB.prepare("SELECT COUNT(*) AS count FROM magic_tokens").first(
        "count",
      ),
    ).toBe(0);
  });
});

describe("versioned owner state on actual local D1", () => {
  it("round-trips new lesson notes and checkpoints without changing official results", async () => {
    const cookie = await login();
    const snapshot = state();
    snapshot.learning = {
      lastLessonId: "week-0-binary",
      lessons: {
        "week-0-binary": {
          answer: 1,
          exerciseDone: true,
          completed: true,
          notes: "A bit has two states.",
        },
      },
    };
    const response = await handleApi(
      request(
        "/api/state",
        "PUT",
        { revision: 0, state: snapshot, operationId: crypto.randomUUID() },
        cookie,
      ),
      env,
    );
    expect(response.status).toBe(200);
    const restored = await (
      await handleApi(request("/api/state", "GET", undefined, cookie), env)
    ).json();
    expect(restored).toEqual({ revision: 1, state: snapshot });
    expect(snapshot.attempts).toEqual([]);
    expect(snapshot.resources).toEqual({});
  });

  it("persists across logout and a later login and retries operations exactly once", async () => {
    const cookie = await login();
    expect(
      await (
        await handleApi(request("/api/state", "GET", undefined, cookie), env)
      ).json(),
    ).toEqual({ revision: 0, state: null });
    const save = {
      revision: 0,
      state: state(),
      operationId: crypto.randomUUID(),
    };
    for (let index = 0; index < 2; index++)
      expect(
        await (
          await handleApi(request("/api/state", "PUT", save, cookie), env)
        ).json(),
      ).toEqual({ revision: 1, ok: true });
    await handleApi(
      request("/api/auth/logout", "POST", undefined, cookie),
      env,
    );
    const nextCookie = await login();
    expect(
      await (
        await handleApi(
          request("/api/state", "GET", undefined, nextCookie),
          env,
        )
      ).json(),
    ).toEqual({ revision: 1, state: save.state });
  });

  it("rejects one simultaneous stale write and rejects identifier reuse with another payload", async () => {
    const cookie = await login();
    const writes = [1, 2].map((index) => ({
      revision: 0,
      state: { ...state(), blockers: { task: `write ${index}` } },
      operationId: `save-${index}`,
    }));
    const responses = await Promise.all(
      writes.map((write) =>
        handleApi(request("/api/state", "PUT", write, cookie), env),
      ),
    );
    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 409,
    ]);
    const successful =
      writes[responses.findIndex((response) => response.status === 200)];
    expect(
      (
        await handleApi(
          request(
            "/api/state",
            "PUT",
            { ...successful, state: state() },
            cookie,
          ),
          env,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await handleApi(
          request(
            "/api/state",
            "PUT",
            { ...successful, revision: 1, operationId: "new-save" },
            cookie,
          ),
          env,
        )
      ).status,
    ).toBe(200);
    expect(
      await (
        await handleApi(request("/api/state", "PUT", successful, cookie), env)
      ).json(),
    ).toEqual({ revision: 1, ok: true });
    expect(
      (
        (await (
          await handleApi(request("/api/state", "GET", undefined, cookie), env)
        ).json()) as { revision: number }
      ).revision,
    ).toBe(2);
  });

  it("rejects invalid state, multiple active sessions, and impossible session duration", async () => {
    const cookie = await login();
    const running: StudySession = {
      id: "session",
      taskId: "task",
      unitId: "week-0",
      label: "Study",
      startedAt: "2026-11-16T00:00:00.000Z",
      endedAt: null,
      elapsedSeconds: 0,
      status: "running",
      segmentStartedAt: "2026-11-16T00:00:00.000Z",
      lastHeartbeatAt: "2026-11-16T00:00:00.000Z",
      manual: false,
    };
    const invalidStates = [
      { ...state(), schemaVersion: 999 },
      { ...state(), sessions: [running, { ...running, id: "second" }] },
      { ...state(), sessions: [{ ...running, elapsedSeconds: 100 }] },
      {
        ...state(),
        sessions: [{ ...running, status: "finished", segmentStartedAt: null }],
      },
    ];
    for (const invalid of invalidStates)
      expect(
        (
          await handleApi(
            request(
              "/api/state",
              "PUT",
              { revision: 0, state: invalid, operationId: crypto.randomUUID() },
              cookie,
            ),
            env,
          )
        ).status,
      ).toBe(400);
    expect(
      await env.DB.prepare("SELECT COUNT(*) AS count FROM owner_state").first(
        "count",
      ),
    ).toBe(0);
  });
});

describe("public progress page on actual local D1", () => {
  const today = () => dateInZone(new Date(), "Asia/Jakarta");
  const secrets = [
    "SECRET-NOTE",
    "SECRET-URL",
    "SECRET-REFLECTION",
    "SECRET-UNCLEAR",
    "SECRET-EXERCISE",
    "SECRET-BLOCKER",
    owner,
  ];

  function closeWeeks(units: string[], submittedAt: string): Attempt[] {
    return units.flatMap((id) =>
      courseUnits
        .find((unit) => unit.id === id)!
        .groups.map((group) => ({
          id: `${group.id}-${submittedAt}`,
          assignmentId: group.assignments[0]!.id,
          submittedAt,
          kind: "passed" as const,
          score: null,
          url: "https://example.test/SECRET-URL",
          note: "SECRET-NOTE",
        })),
    );
  }

  function publicState(
    startOffset: number,
    attempts: Attempt[],
    enabled = true,
  ): AppState {
    const start = addDays(today(), startOffset);
    const base = state();
    return {
      ...base,
      settings: { ...base.settings, startDate: start },
      attempts,
      resources: {
        "week-0-lecture": true,
        "week-1-lecture": true,
        skipped: false,
      },
      milestones: { project: true },
      blockers: { "week-1": "SECRET-BLOCKER" },
      sessions: [
        {
          id: "s1",
          taskId: "",
          unitId: "week-0",
          label: "Study",
          startedAt: "2026-11-16T00:00:00.000Z",
          endedAt: "2026-11-16T02:00:00.000Z",
          elapsedSeconds: 5430,
          status: "finished",
          segmentStartedAt: null,
          lastHeartbeatAt: "2026-11-16T02:00:00.000Z",
          manual: false,
        },
      ],
      study: {
        answers: {},
        recall: {},
        reflections: [
          {
            id: "r1",
            date: today(),
            stepId: "week-0-lecture",
            learned: "SECRET-REFLECTION",
            unclear: "SECRET-UNCLEAR",
          },
        ],
        exercises: { "week-0-ex": "SECRET-EXERCISE" },
        activeDays: {
          [today()]: true,
          "2026-01-01": true,
          "2026-01-02": false,
        },
        publicPage: { enabled, name: "Ada" },
      },
    };
  }

  async function save(value: AppState) {
    const cookie = await login();
    const response = await handleApi(
      request(
        "/api/state",
        "PUT",
        { revision: 0, state: value, operationId: crypto.randomUUID() },
        cookie,
      ),
      env,
    );
    expect(response.status).toBe(200);
  }

  const get = (path: string, target: Env = env) =>
    handleApi(new Request(`${origin}${path}`), target);
  const badgeText = async () =>
    [
      ...(await (await get("/api/public/badge.svg")).text()).matchAll(
        /<text [^>]*>([^<]*)</g,
      ),
    ].map((match) => match[1]);

  it("answers 404 when no state exists or the page is not enabled", async () => {
    const none = await get("/api/public");
    expect(none.status).toBe(404);
    expect(await none.json()).toEqual({ error: "This page is not public." });
    await save(publicState(0, [], false));
    const response = await get("/api/public");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "This page is not public.",
    });
  });

  it("serves only the public fields without a cookie, and caches them", async () => {
    await save(
      publicState(
        -8,
        closeWeeks(["week-0", "week-1"], new Date().toISOString()),
      ),
    );
    const response = await get("/api/public");
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    const text = await response.text();
    const body = JSON.parse(text);
    expect(Object.keys(body).sort()).toEqual([
      "activeDays",
      "name",
      "startDate",
      "stepsDone",
      "studyMinutes",
      "targetDate",
      "timezone",
      "today",
      "weeks",
    ]);
    expect(body).toMatchObject({
      name: "Ada",
      startDate: addDays(today(), -8),
      targetDate: addDays(today(), -8 + 69),
      timezone: "Asia/Jakarta",
      today: today(),
      stepsDone: 3,
      activeDays: 2,
      studyMinutes: 90,
    });
    expect(
      body.weeks.map((week: { status: string }) => week.status).slice(0, 3),
    ).toEqual(["late", "late", "current"]);
    expect(body.weeks[0].closedOn).toBe(today());
    for (const secret of secrets) expect(text).not.toContain(secret);
    expect(text).not.toContain("sessions");
  });

  it("is reachable with sign-in unconfigured and when it is configured", async () => {
    await save(publicState(0, []));
    expect(
      (await get("/api/public", { ...env, APP_ORIGIN: undefined })).status,
    ).toBe(200);
    expect(
      (await get("/api/public", { ...env, LOCAL_AUTH_BYPASS: undefined }))
        .status,
    ).toBe(200);
    expect((await get("/api/state")).status).toBe(401);
    const post = await handleApi(request("/api/public", "POST", {}), env);
    expect(post.status).toBe(405);
  });

  it("renders the badge for private, on-track, late and missed records", async () => {
    const privateBadge = await get("/api/public/badge.svg");
    expect(privateBadge.status).toBe(200);
    expect(privateBadge.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(privateBadge.headers.get("Cache-Control")).toBe(
      "public, max-age=300",
    );
    expect(await badgeText()).toEqual(["CS50x", "private"]);

    await env.DB.prepare("DELETE FROM owner_state").run();
    await env.DB.prepare("DELETE FROM state_operations").run();
    await save(publicState(-3, []));
    expect(await badgeText()).toEqual(["CS50x", "week 1 of 10 · on track"]);

    await env.DB.prepare("DELETE FROM owner_state").run();
    await env.DB.prepare("DELETE FROM state_operations").run();
    await save(
      publicState(
        -8,
        closeWeeks(["week-0", "week-1"], new Date().toISOString()),
      ),
    );
    expect(await badgeText()).toEqual(["CS50x", "week 2 of 10 · 2 late"]);

    await env.DB.prepare("DELETE FROM owner_state").run();
    await env.DB.prepare("DELETE FROM state_operations").run();
    await save(
      publicState(
        -15,
        closeWeeks(["week-0", "week-1"], new Date().toISOString()),
      ),
    );
    const svg = await (await get("/api/public/badge.svg")).text();
    expect(svg).toContain("week 3 of 10 · 1 missed");
    expect(svg).toContain("#b42318");
    for (const secret of secrets) expect(svg).not.toContain(secret);
  });
});
