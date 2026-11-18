import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { parse } from "jsonc-parser";
import { z } from "zod";

const action = process.argv[2] ?? "build";
if (!["build", "dry-run", "deploy"].includes(action))
  throw new Error("Use build, dry-run, or deploy.");
const config = parse(readFileSync("wrangler.jsonc", "utf8")).env.production;
if (
  config.vars.AUTH_MODE !== "production" ||
  config.vars.APP_ORIGIN !== "https://cs50track.dhaf.in"
)
  throw new Error("Review the production origin and auth mode.");
z.email().parse(config.vars.OWNER_EMAIL);
z.email().parse(config.vars.EMAIL_FROM);
z.uuid().parse(config.d1_databases[0].database_id);
function run(path, args, env = {}) {
  const result = spawnSync(process.execPath, [path, ...args], {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run("node_modules/vite/bin/vite.js", ["build"], {
  CLOUDFLARE_ENV: "production",
});
rmSync("dist/server/.dev.vars", { force: true });
if (action !== "build")
  run("node_modules/wrangler/bin/wrangler.js", [
    "deploy",
    "--env",
    "production",
    ...(action === "dry-run" ? ["--dry-run"] : []),
  ]);
