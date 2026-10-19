import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checksDir = path.join(root, "docs/evidence/checks");
await mkdir(checksDir, { recursive: true });
const port = process.env.FINPILOT_TEST_PORT || "3100";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error("FINPILOT_TEST_PORT must be between 1024 and 65535");
const env = {
  ...process.env,
  DATABASE_URL: "",
  OPENAI_API_KEY: "",
  APP_ORIGIN: "http://127.0.0.1:" + port,
  E2E_BASE_URL: "http://127.0.0.1:" + port,
  SESSION_SECRET: randomBytes(48).toString("hex"),
  FINPILOT_VERIFY_RUN: "true",
  FINPILOT_DIST_DIR: ".next/verification",
  PLAYWRIGHT_JSON_OUTPUT_NAME: "docs/evidence/browser-results.json",
};
const npmCli =
  process.env.npm_execpath ||
  path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
const npm = (args) =>
  process.platform === "win32"
    ? [process.execPath, [npmCli, ...args]]
    : ["npm", args];
const checks = [
  ["lint", ...npm(["run", "lint"])],
  ["typecheck", ...npm(["run", "typecheck"])],
  [
    "unit",
    ...npm([
      "run",
      "test",
      "--",
      "--reporter=json",
      "--outputFile=docs/evidence/unit-results.json",
    ]),
  ],
  [
    "browser",
    ...npm(["exec", "--", "playwright", "test", "--reporter=list,json"]),
  ],
  [
    "python-tests",
    "python",
    ["-m", "unittest", "discover", "-s", "services/analytics", "-v"],
  ],
  ["build", ...npm(["run", "build"])],
  ["seed", ...npm(["run", "seed"])],
];
const record = {
  startedAt: new Date().toISOString(),
  scope:
    "Local isolated memory demo; no database or paid model. Browser server on port " +
    port +
    ".",
  results: [],
};
for (const [name, command, args] of checks) {
  const startedAt = new Date().toISOString();
  console.log("Running " + name);
  let output = "";
  const result = await new Promise((resolve) => {
    const child = spawn(command, args, { cwd: root, env, windowsHide: true });
    child.stdout.on("data", (data) => {
      output += data;
      process.stdout.write(data);
    });
    child.stderr.on("data", (data) => {
      output += data;
      process.stderr.write(data);
    });
    child.on("error", (error) => {
      output += error.message + "\n";
      resolve({ exitCode: null, error: error.message });
    });
    child.on("close", (code, signal) => resolve({ exitCode: code, signal }));
  });
  await writeFile(path.join(checksDir, name + ".log"), output);
  record.results.push({
    name,
    startedAt,
    finishedAt: new Date().toISOString(),
    ...result,
    passed: result.exitCode === 0,
    log: "docs/evidence/checks/" + name + ".log",
  });
  await writeFile(
    path.join(checksDir, "check-results.json"),
    JSON.stringify(record, null, 2) + "\n",
  );
}
record.finishedAt = new Date().toISOString();
record.passed = record.results.every((check) => check.passed);
await writeFile(
  path.join(checksDir, "check-results.json"),
  JSON.stringify(record, null, 2) + "\n",
);
console.log(JSON.stringify(record, null, 2));
process.exitCode = record.passed ? 0 : 1;
