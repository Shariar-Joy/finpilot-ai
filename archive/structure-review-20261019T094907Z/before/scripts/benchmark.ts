import { writeFile, mkdir } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { runAgent, goldenPrompt } from "../src/lib/agent";
import { seedLedger } from "../src/lib/seed";
import {
  summary,
  recurring,
  anomalies,
  reducedBudget,
} from "../src/lib/domain";
const date = new Date("2026-10-19T12:00:00Z");
if (process.env.OPENAI_API_KEY)
  throw new Error(
    "Unset OPENAI_API_KEY: this benchmark measures deterministic tools only",
  );
const durations: number[] = [];
for (let i = 0; i < 110; i++) {
  const ledger = seedLedger(date);
  const start = performance.now();
  await runAgent(ledger, "benchmark-synthetic-user", goldenPrompt, date);
  if (i >= 10) durations.push(performance.now() - start);
}
durations.sort((a, b) => a - b);
const ledger = seedLedger(date),
  agent = await runAgent(
    ledger,
    "benchmark-synthetic-user",
    goldenPrompt,
    date,
  );
const october = summary(ledger.transactions, "2026-10");
const compare = agent.message.tools!.find(
  (t) => t.name === "compare_months",
)!.result;
const result = {
  capturedAt: new Date().toISOString(),
  seedDate: date.toISOString(),
  synthetic: true,
  node: process.version,
  platform: process.platform,
  transactions: ledger.transactions.length,
  recordedDays: 90,
  monthly: october,
  comparison: compare,
  proposedLimit: reducedBudget(
    october.byCategory.find((c) => c.category === "Dining")!.amount,
    20,
  ),
  recurringMerchants: recurring(ledger.transactions, date).length,
  unusualPurchases: anomalies(ledger.transactions).length,
  benchmark: {
    scope:
      "In-process deterministic agent only; excludes seed construction, HTTP, browser, database and LLM",
    warmupRuns: 10,
    measuredRuns: 100,
    medianMs: durations[49],
    p95Ms: durations[94],
    minMs: durations[0],
    maxMs: durations[99],
  },
};
await mkdir("docs/evidence", { recursive: true });
await writeFile(
  "docs/evidence/benchmark.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result, null, 2));
