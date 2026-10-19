import { chromium } from "@playwright/test";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
await mkdir("docs/evidence", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: ".tools/recordings", size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const video = page.video();
const started = Date.now();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
async function chapter(title, description, hold = 7500) {
  console.log(title);
  await page.evaluate(
    ({ title, description }) => {
      let el = document.getElementById("recording-caption");
      if (!el) {
        el = document.createElement("div");
        el.id = "recording-caption";
        el.style.cssText =
          "position:fixed;right:24px;bottom:20px;z-index:2147483647;max-width:570px;padding:15px 20px;background:#111827f2;border:1px solid #897bd0;border-radius:10px;pointer-events:none;color:#eef2ff;font:15px/1.6 Segoe UI,sans-serif;box-shadow:0 5px 25px #0005";
        document.body.append(el);
      }
      el.replaceChildren();
      const heading = document.createElement("strong");
      heading.textContent = title;
      heading.style.color = "#b9adff";
      const text = document.createElement("div");
      text.textContent = description;
      el.append(heading, text);
    },
    { title, description },
  );
  await page.waitForTimeout(hold);
}
try {
  await page.goto(base);
  await chapter(
    "FinPilot AI · Topic A",
    "Real application recording · synthetic accounts only · no bank connections",
    4500,
  );
  await page.getByRole("button", { name: "Explore the live demo" }).click();
  await page.getByRole("heading", { name: "Looking good, Alex." }).waitFor();
  await chapter(
    "1 · Understand the financial picture",
    "The dashboard calculates income, spending, savings and category totals from 90 days of synthetic records.",
  );
  await page.getByRole("link", { name: "Transactions", exact: true }).click();
  await page.getByRole("button", { name: "Import CSV" }).click();
  const date = new Date().toISOString().slice(0, 10);
  const row = `${date},Demo CSV Stationery,-12.00,Other`;
  await page
    .getByRole("textbox", { name: "CSV content" })
    .fill(`date,merchant,amount,category\n${row}\n${row}`);
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await page.getByText("1 duplicates skipped").waitFor();
  await chapter(
    "2 · Validate before writing",
    "The complete CSV passes validation; one repeated row is identified as a duplicate.",
  );
  await page.getByRole("button", { name: "Confirm import (1)" }).click();
  await page.getByRole("link", { name: "AI copilot" }).click();
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await page.getByRole("button", { name: "Approve change" }).waitFor();
  const tool = page
    .locator(".tool-event")
    .filter({ hasText: "compare_months" });
  await tool.locator("summary").click();
  await chapter(
    "3 · Inspect the tools and source evidence",
    "The comparison and transaction references are actual server results. The model does not calculate or authorize a write.",
    9000,
  );
  await tool.locator("summary").click();
  await page.locator(".proposal-card").scrollIntoViewIfNeeded();
  await chapter(
    "4 · Review the exact proposed budget",
    "The reviewed category, target month, limit and alert threshold are bound to an expiring one-time approval.",
    8500,
  );
  const before = await (await page.request.get(`${base}/api/data`)).json();
  const proposed = before.messages.filter((m) => m.proposals?.length).at(-1)
    .proposals[0];
  await page.getByRole("button", { name: "Approve change" }).click();
  await page.locator(".proposal-card.applied").waitFor();
  const appliedState = await (
    await page.request.get(`${base}/api/data`)
  ).json();
  const savedBudget = appliedState.allBudgets.find(
    (b) =>
      b.month === proposed.payload.month &&
      b.category === proposed.payload.category,
  );
  assert.equal(
    savedBudget?.limit,
    proposed.payload.limit,
    "Approved budget must match the exact reviewed limit",
  );
  await chapter(
    "5 · Complete the approved task",
    "Approval consumes the token and saves the exact budget together with an audit decision.",
  );
  await page.getByRole("link", { name: "Budgets", exact: true }).click();
  const budgetLoaded = page.waitForResponse(
    (r) =>
      r.url().includes("/api/data?month=" + proposed.payload.month) && r.ok(),
  );
  await page
    .getByLabel("Selected month", { exact: true })
    .fill(proposed.payload.month);
  await budgetLoaded;
  await chapter(
    "6 · Verify the saved target-month budget",
    "The next-month dining limit is now the exact amount that was reviewed.",
  );
  await page.goto(`${base}/agent`);
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await page.getByRole("button", { name: "Reject", exact: true }).waitFor();
  const beforeReject = await (
    await page.request.get(`${base}/api/data`)
  ).json();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.locator(".proposal-card.rejected").waitFor();
  const afterReject = await (await page.request.get(`${base}/api/data`)).json();
  assert.deepEqual(afterReject.allBudgets, beforeReject.allBudgets);
  await chapter(
    "7 · Reject a separate proposal",
    "This rejected run was checked against the complete budget state: financial records remain unchanged.",
  );
  await page.getByRole("link", { name: "Activity & audit" }).click();
  await page.locator(".audit-row").first().waitFor();
  await chapter(
    "8 · Follow the audit trail",
    "Actual actor, action, decision, timestamp, correlation ID and payload hash. Tokens and passwords are omitted.",
    10000,
  );
  await chapter(
    "FinPilot AI · Evidence you can inspect",
    "Source, tests, paperwork and known limits: github.com/Shariar-Joy/finpilot-ai · synthetic sandbox",
    6000,
  );
  assert.equal(errors.length, 0, JSON.stringify(errors));
} finally {
  await context.close();
  await browser.close();
}
await copyFile(await video.path(), "docs/evidence/demo.webm");
const metadata = {
  recordedAt: new Date().toISOString(),
  elapsedSeconds: Math.round((Date.now() - started) / 1000),
  synthetic: true,
  audio: false,
  captioning:
    "Descriptive recording captions only; all financial actions are actual application interactions",
  assertions: [
    "Approval saved exact reviewed payload",
    "Separate rejection left complete budget array unchanged",
    "No browser page errors",
  ],
  file: "docs/evidence/demo.webm",
};
assert(metadata.elapsedSeconds < 300, "Demo exceeded five minutes");
await writeFile(
  "docs/evidence/demo-recording.json",
  JSON.stringify(metadata, null, 2) + "\n",
);
console.log(JSON.stringify(metadata));
