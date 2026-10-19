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
const recording = JSON.parse(
  await readFile("docs/evidence/demo-recording.json", "utf8"),
);
if (
  !unit.success ||
  unit.numFailedTests ||
  browser.stats.unexpected ||
  browser.stats.skipped
)
  throw new Error("Verification contains failures or skipped browser cases");
const { spawnSync } = await import("node:child_process");
const result = spawnSync(
  "python",
  ["-m", "unittest", "discover", "-s", "services/analytics", "-v"],
  { encoding: "utf8" },
);
if (result.status !== 0)
  throw new Error(
    result.error?.message || result.stderr || "Python checks failed",
  );
const output = result.stdout + result.stderr;
const count = Number(output.match(/Ran (\d+) tests?/)?.[1]);
if (!count) throw new Error("Python test count missing");
await writeFile("docs/runs/python-tests.log", output);
const summary = {
  generatedAt: new Date().toISOString(),
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
const latex = `% Generated from actual executed results. Do not change counts by hand.\n\\newcommand{\\UnitTests}{${summary.unit.passed}}\n\\newcommand{\\BrowserTests}{${summary.browser.passed}}\n\\newcommand{\\PythonTests}{${count}}\n\\newcommand{\\RecordedTransactions}{${benchmark.transactions}}\n\\newcommand{\\AgentMedian}{${benchmark.benchmark.medianMs.toFixed(3)}}\n\\newcommand{\\AgentPninetyfive}{${benchmark.benchmark.p95Ms.toFixed(3)}}\n\\newcommand{\\EvidenceDate}{19 October 2026}\n`;
await writeFile(
  "submission/overleaf/results.tex",
  latex + `\\newcommand{\\DemoSeconds}{${recording.elapsedSeconds}}\n`,
);
console.log(JSON.stringify(summary, null, 2));
