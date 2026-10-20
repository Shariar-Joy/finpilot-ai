import { readFile, writeFile } from "node:fs/promises";
const unit = JSON.parse(
  await readFile("docs/evidence/unit-results.json", "utf8"),
);
const browser = JSON.parse(
  await readFile("docs/evidence/browser-results.json", "utf8"),
);
const benchmark = JSON.parse(
  await readFile("docs/evidence/benchmark.json", "utf8"),
);
if (
  !unit.success ||
  unit.numFailedTests ||
  browser.stats.unexpected ||
  browser.stats.skipped
)
  throw new Error("Verification contains failures or skipped browser cases");
const checks = JSON.parse(
  await readFile("docs/evidence/checks/check-results.json", "utf8"),
);
if (!checks.passed || checks.results.some((check) => !check.passed))
  throw new Error(
    "Run scripts/verify.mjs successfully before collecting final evidence",
  );
if (
  unit.startTime < Date.parse(checks.startedAt) ||
  Date.parse(browser.stats.startTime) < Date.parse(checks.startedAt)
)
  throw new Error(
    "Unit or browser results predate the current verification run",
  );
const output = await readFile("docs/evidence/checks/python-tests.log", "utf8");
const count = Number(output.match(/Ran (\d+) tests?/)?.[1]);
if (!count) throw new Error("Python test count missing");
const summary = {
  generatedAt: new Date().toISOString(),
  verificationStartedAt: checks.startedAt,
  scope: checks.scope,
  checks: checks.results.map(({ name, passed, log }) => ({
    name,
    passed,
    log,
  })),
  unit: {
    passed: unit.numPassedTests,
    failed: unit.numFailedTests,
    files: unit.testResults.length,
  },
  browser: { passed: browser.stats.expected, failed: browser.stats.unexpected },
  python: { passed: count, failed: 0 },
  benchmark: benchmark.benchmark,
};
await writeFile(
  "docs/evidence/verification-summary.json",
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
