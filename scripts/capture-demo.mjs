import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
await mkdir("docs/evidence", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.getByRole("button", { name: "Explore the live demo" }).click();
  await page.getByRole("heading", { name: "Looking good, Shariar." }).waitFor();
  await page.locator(".recharts-sector").first().waitFor({ state: "visible" });
  await page.mouse.move(1400, 10);
  await page.screenshot({
    path: "docs/evidence/dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  const pdf = await page.request.get(`${base}/api/export/pdf`);
  await writeFile("docs/evidence/monthly-summary.pdf", await pdf.body());
  await page.getByRole("link", { name: "AI copilot" }).click();
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await page.getByRole("button", { name: "Approve change" }).waitFor();
  await page.screenshot({
    path: "docs/evidence/agent-proposal.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.locator(".proposal-result").waitFor();
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await page.getByRole("button", { name: "Approve change" }).click();
  await page.locator(".proposal-card.applied").waitFor();
  await page.screenshot({
    path: "docs/evidence/agent-approved.png",
    fullPage: true,
    animations: "disabled",
  });
  const data = await (await page.request.get(`${base}/api/data`)).json();
  // Logs include actual sanitized audit events; no session cookies or approval tokens.
  await writeFile(
    "docs/evidence/audit-example.json",
    JSON.stringify(
      data.audits
        .filter(
          (a) =>
            a.action === "apply_budget_change" ||
            a.action === "propose_budget_change",
        )
        .slice(0, 8),
      null,
      2,
    ),
  );
  await page.goto(`${base}/dashboard`);
  await page.getByRole("heading", { name: "Looking good, Shariar." }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".recharts-sector").first().waitFor({ state: "visible" });
  await page.screenshot({
    path: "docs/evidence/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto(`${base}/settings`);
  await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.screenshot({
    path: "docs/evidence/settings-light.png",
    fullPage: true,
    animations: "disabled",
  });
  if (errors.length) throw new Error(JSON.stringify(errors));
  console.log(
    "Captured real desktop/mobile/agent screenshots, monthly PDF, and sanitized audit events. No page errors.",
  );
} finally {
  await browser.close();
}
