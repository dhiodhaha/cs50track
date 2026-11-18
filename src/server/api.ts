import { z } from "zod";
import { isPublic, publicSummary, renderBadge } from "../lib/public";
import { persistedStateSchema } from "./state-schema";

export interface Env {
  DB: D1Database;
  EMAIL?: SendEmail;
  OWNER_EMAIL?: string;
  EMAIL_FROM?: string;
  APP_ORIGIN?: string;
  AUTH_MODE?: string;
  LOCAL_AUTH_BYPASS?: string;
}

const windowMs = 15 * 60 * 1000;
const sessionMs = 30 * 24 * 60 * 60 * 1000;
const neutralMessage =
  "If this address has access, a sign-in link is on its way. Check your inbox.";
const emailSchema = z.email().max(254);
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const requestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(emailSchema),
});
const verifySchema = z.object({ token: tokenSchema });
const writeSchema = z.object({
  revision: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER - 1),
  operationId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
  state: persistedStateSchema,
});

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}

export function isLocalhost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

export function authConfiguration(request: Request, env: Env) {
  const url = new URL(request.url);
  const development =
    env.AUTH_MODE === "development" && isLocalhost(url.hostname);
  const owner = env.OWNER_EMAIL?.trim().toLowerCase() ?? "";
  let origin = "";
  try {
    const configured = new URL(env.APP_ORIGIN ?? "");
    if (
      configured.origin === env.APP_ORIGIN &&
      !configured.username &&
      !configured.password &&
      (configured.protocol === "https:" ||
        (development && isLocalhost(configured.hostname)))
    ) {
      origin =
        development &&
        isLocalhost(configured.hostname) &&
        configured.protocol === url.protocol &&
        configured.port === url.port
          ? url.origin
          : configured.origin;
    }
  } catch {
    /* Missing configuration fails closed. */
  }
  const configured = Boolean(
    env.DB &&
    emailSchema.safeParse(owner).success &&
    origin &&
    origin === url.origin &&
    (development ||
      (env.AUTH_MODE !== "development" &&
        env.EMAIL &&
        emailSchema.safeParse(env.EMAIL_FROM).success)),
  );
  return { development, configured, owner, origin };
}

export function randomToken(): string {
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function cookieName(development: boolean): string {
  return development ? "cs50_session_local" : "__Host-cs50_session";
}

function sessionCookie(
  value: string,
  development: boolean,
  clear = false,
): string {
  return `${cookieName(development)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : sessionMs / 1000}${development ? "" : "; Secure"}`;
}

async function sessionEmail(
  request: Request,
  env: Env,
  config: ReturnType<typeof authConfiguration>,
) {
  if (!config.configured) return null;
  if (config.development && env.LOCAL_AUTH_BYPASS !== "false")
    return config.owner;
  const prefix = `${cookieName(config.development)}=`;
  const cookie = (request.headers.get("Cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!tokenSchema.safeParse(cookie).success) return null;
  const session = await env.DB.prepare(
    "SELECT email FROM auth_sessions WHERE digest = ? AND expires_at > ? AND email = ?",
  )
    .bind(await digest(cookie!), Date.now(), config.owner)
    .first<{ email: string }>();
  return session?.email ?? null;
}

function json(
  value: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

async function body(request: Request): Promise<unknown> {
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new HttpError(415, "Send a JSON request.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    length += next.value.byteLength;
    if (length > 1_000_000) {
      await reader.cancel();
      throw new HttpError(413, "This save is too large.");
    }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "Send valid JSON.");
  }
}

function sameOrigin(request: Request, origin: string) {
  if (
    request.headers.get("Origin") !== origin ||
    request.headers.get("Sec-Fetch-Site") === "cross-site"
  ) {
    throw new HttpError(403, "This request must come from CS50 Track.");
  }
}

async function limitLogin(
  request: Request,
  env: Env,
  email: string,
  now: number,
) {
  const [address, source] = await Promise.all([
    digest(`address:${email}`),
    digest(`source:${request.headers.get("CF-Connecting-IP") ?? "unknown"}`),
  ]);
  const cutoff = now - windowMs;
  const results = await env.DB.batch([
    env.DB.prepare("DELETE FROM login_requests WHERE requested_at <= ?").bind(
      cutoff,
    ),
    env.DB.prepare(
      `INSERT INTO login_requests(id, address_digest, source_digest, requested_at)
      SELECT ?, ?, ?, ? WHERE
      (SELECT COUNT(*) FROM login_requests WHERE address_digest = ? AND requested_at > ?) < 3
      AND (SELECT COUNT(*) FROM login_requests WHERE source_digest = ? AND requested_at > ?) < 10`,
    ).bind(
      crypto.randomUUID(),
      address,
      source,
      now,
      address,
      cutoff,
      source,
      cutoff,
    ),
  ]);
  if (results[1].meta.changes === 1) return;
  const limits = await env.DB.prepare(
    `SELECT
    (SELECT COUNT(*) FROM login_requests WHERE address_digest = ?) AS address_count,
    (SELECT MIN(requested_at) FROM login_requests WHERE address_digest = ?) AS address_oldest,
    (SELECT COUNT(*) FROM login_requests WHERE source_digest = ?) AS source_count,
    (SELECT MIN(requested_at) FROM login_requests WHERE source_digest = ?) AS source_oldest`,
  )
    .bind(address, address, source, source)
    .first<{
      address_count: number;
      address_oldest: number | null;
      source_count: number;
      source_oldest: number | null;
    }>();
  const next = Math.max(
    limits && limits.address_count >= 3
      ? (limits.address_oldest ?? now) + windowMs
      : now,
    limits && limits.source_count >= 10
      ? (limits.source_oldest ?? now) + windowMs
      : now,
  );
  throw new HttpError(
    429,
    "Too many sign-in requests. Please try again later.",
    Math.max(1, Math.ceil((next - now) / 1000)),
  );
}

async function requestLink(
  request: Request,
  env: Env,
  config: ReturnType<typeof authConfiguration>,
) {
  const parsed = requestSchema.safeParse(await body(request));
  if (!parsed.success) throw new HttpError(400, "Enter a valid email address.");
  const now = Date.now();
  await limitLogin(request, env, parsed.data.email, now);
  if (parsed.data.email !== config.owner)
    return json({ message: neutralMessage });
  const token = randomToken();
  const tokenDigest = await digest(token);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM magic_tokens WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare(
      "INSERT INTO magic_tokens(digest, email, created_at, expires_at) VALUES(?, ?, ?, ?)",
    ).bind(tokenDigest, config.owner, now, now + windowMs),
  ]);
  const link = new URL("/auth/verify", config.origin);
  link.searchParams.set("token", token);
  if (config.development)
    return json({ message: neutralMessage, developmentUrl: link.href });
  try {
    await env.EMAIL!.send({
      from: env.EMAIL_FROM!,
      to: config.owner,
      subject: "Your CS50 Track sign-in link",
      text: `Continue to CS50 Track:\n\n${link.href}\n\nThis private sign-in link expires in 15 minutes and works once. Open it and press Continue to sign in. If you did not request this email, you can ignore it.`,
    });
  } catch (error) {
    await env.DB.prepare("DELETE FROM magic_tokens WHERE digest = ?")
      .bind(tokenDigest)
      .run();
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string" &&
      /^E_[A-Z_]+$/.test(error.code)
        ? error.code
        : "UNKNOWN";
    console.error("Login email delivery failed", { code });
    throw new HttpError(
      503,
      "The sign-in email could not be sent. Please try again.",
    );
  }
  return json({ message: neutralMessage });
}

async function verifyLink(
  request: Request,
  env: Env,
  config: ReturnType<typeof authConfiguration>,
) {
  const parsed = verifySchema.safeParse(await body(request));
  if (!parsed.success)
    throw new HttpError(
      400,
      "This sign-in link is invalid or expired. Request a new link.",
    );
  const now = Date.now();
  const tokenDigest = await digest(parsed.data.token);
  const session = randomToken();
  const results = await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO auth_sessions(digest, email, created_at, expires_at)
      SELECT ?, email, ?, ? FROM magic_tokens WHERE digest = ? AND email = ? AND used_at IS NULL AND expires_at > ?`,
    ).bind(
      await digest(session),
      now,
      now + sessionMs,
      tokenDigest,
      config.owner,
      now,
    ),
    env.DB.prepare(
      "UPDATE magic_tokens SET used_at = ? WHERE digest = ? AND email = ? AND used_at IS NULL AND expires_at > ?",
    ).bind(now, tokenDigest, config.owner, now),
  ]);
  if (results[0].meta.changes !== 1)
    throw new HttpError(
      400,
      "This sign-in link is invalid or expired. Request a new link.",
    );
  return json({ ok: true }, 200, {
    "Set-Cookie": sessionCookie(session, config.development),
  });
}

async function readState(env: Env, email: string) {
  const row = await env.DB.prepare(
    "SELECT revision, state_json FROM owner_state WHERE email = ?",
  )
    .bind(email)
    .first<{ revision: number; state_json: string | null }>();
  return {
    revision: row?.revision ?? 0,
    state: row?.state_json
      ? persistedStateSchema.parse(JSON.parse(row.state_json))
      : null,
  };
}

async function stateResponse(env: Env, email: string) {
  return json(await readState(env, email));
}

const publicHeaders = { "Cache-Control": "public, max-age=300" };

async function publicRecord(env: Env, owner: string) {
  if (!env.DB || !emailSchema.safeParse(owner).success) return null;
  const { state } = await readState(env, owner);
  return isPublic(state) ? publicSummary(state, new Date()) : null;
}

async function publicResponse(request: Request, env: Env, owner: string) {
  const summary = await publicRecord(env, owner);
  if (new URL(request.url).pathname === "/api/public/badge.svg")
    return new Response(renderBadge(summary), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        ...publicHeaders,
      },
    });
  if (!summary) throw new HttpError(404, "This page is not public.");
  return json(summary, 200, publicHeaders);
}

async function writeState(request: Request, env: Env, email: string) {
  const parsed = writeSchema.safeParse(await body(request));
  if (!parsed.success)
    throw new HttpError(
      400,
      "The saved state is invalid. Check the entries and try again.",
    );
  const { revision, state, operationId } = parsed.data;
  const payloadDigest = await digest(JSON.stringify({ revision, state }));
  const now = Date.now();
  const results = await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO owner_state(email, revision, state_json, updated_at) VALUES(?, 0, NULL, ?)",
    ).bind(email, now),
    env.DB.prepare(
      `INSERT OR IGNORE INTO state_operations(email, operation_id, payload_digest, revision, created_at)
      SELECT ?, ?, ?, ?, ? WHERE (SELECT revision FROM owner_state WHERE email = ?) = ?`,
    ).bind(
      email,
      operationId,
      payloadDigest,
      revision + 1,
      now,
      email,
      revision,
    ),
    env.DB.prepare(
      `UPDATE owner_state SET revision = ?, state_json = ?, updated_at = ? WHERE email = ? AND revision = ?
      AND EXISTS(SELECT 1 FROM state_operations WHERE email = ? AND operation_id = ? AND payload_digest = ? AND revision = ?)`,
    ).bind(
      revision + 1,
      JSON.stringify(state),
      now,
      email,
      revision,
      email,
      operationId,
      payloadDigest,
      revision + 1,
    ),
    env.DB.prepare(
      "SELECT payload_digest, revision FROM state_operations WHERE email = ? AND operation_id = ?",
    ).bind(email, operationId),
    env.DB.prepare("SELECT revision FROM owner_state WHERE email = ?").bind(
      email,
    ),
  ]);
  const operation = results[3].results[0] as
    { payload_digest: string; revision: number } | undefined;
  if (operation?.payload_digest === payloadDigest)
    return json({ revision: operation.revision, ok: true });
  const current = results[4].results[0] as { revision: number };
  return json(
    {
      error: operation
        ? "This save identifier was already used. Reload before saving."
        : "Your plan changed on another device. Reload before saving.",
      revision: current.revision,
    },
    409,
  );
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  try {
    const path = new URL(request.url).pathname;
    const config = authConfiguration(request, env);
    if (path === "/api/auth/session" && request.method === "GET") {
      const email = await sessionEmail(request, env, config);
      return json({
        authenticated: Boolean(email),
        ...(email ? { email } : {}),
        development: config.development,
        configured: config.configured,
      });
    }
    if (path === "/api/public" || path === "/api/public/badge.svg") {
      if (request.method !== "GET" && request.method !== "HEAD")
        throw new HttpError(405, "This request method is not supported.");
      return await publicResponse(request, env, config.owner);
    }
    if (!config.configured)
      throw new HttpError(
        503,
        "Sign-in is not configured. Please contact the owner.",
      );
    if (request.method !== "GET" && request.method !== "HEAD")
      sameOrigin(request, config.origin);
    if (path === "/api/auth/request" && request.method === "POST")
      return await requestLink(request, env, config);
    if (path === "/api/auth/verify" && request.method === "POST")
      return await verifyLink(request, env, config);
    if (path === "/api/auth/logout" && request.method === "POST") {
      const prefix = `${cookieName(config.development)}=`;
      const token = (request.headers.get("Cookie") ?? "")
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix))
        ?.slice(prefix.length);
      if (tokenSchema.safeParse(token).success)
        await env.DB.prepare("DELETE FROM auth_sessions WHERE digest = ?")
          .bind(await digest(token!))
          .run();
      return json({ ok: true }, 200, {
        "Set-Cookie": sessionCookie("", config.development, true),
      });
    }
    const email = await sessionEmail(request, env, config);
    if (!email)
      throw new HttpError(401, "Sign in to access your study records.");
    if (path === "/api/state" && request.method === "GET")
      return await stateResponse(env, email);
    if (path === "/api/state" && request.method === "PUT")
      return await writeState(request, env, email);
    if (path === "/api/state" || path.startsWith("/api/auth/"))
      throw new HttpError(405, "This request method is not supported.");
    throw new HttpError(404, "This endpoint does not exist.");
  } catch (error) {
    if (error instanceof HttpError)
      return json(
        {
          error: error.message,
          ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
        },
        error.status,
        error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {},
      );
    console.error("CS50 Track API request failed");
    return json(
      { error: "The request could not be completed. Please try again." },
      500,
    );
  }
}
