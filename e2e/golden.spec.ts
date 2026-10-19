import { test, expect, type Page } from "@playwright/test";

async function demo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore the live demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Looking good, Alex." }),
  ).toBeVisible();
}
test("golden demo: evidence, reject unchanged, approve exact budget, audit", async ({
  page,
}) => {
  await demo(page);
  const initial = await (await page.request.get("/api/data")).json();
  await page.getByRole("link", { name: "AI copilot" }).click();
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await expect(
    page.getByRole("button", { name: "Approve change" }),
  ).toBeVisible();
  await expect(
    page.locator(".tool-event").filter({ hasText: "compare_months" }),
  ).toBeVisible();
  await expect(page.locator(".citations")).toContainText(
    "grounded transaction references",
  );
  const unchanged = await (await page.request.get("/api/data")).json();
  expect(unchanged.allBudgets).toEqual(initial.allBudgets);
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.locator(".proposal-result")).toContainText(
    "Rejected. No financial data changed.",
  );
  expect(
    (await (await page.request.get("/api/data")).json()).allBudgets,
  ).toEqual(initial.allBudgets);
  await page.getByRole("button", { name: "Run demo scenario" }).click();
  await page.getByRole("button", { name: "Approve change" }).click();
  await expect(page.locator(".proposal-result").last()).toContainText(
    "Applied and recorded",
  );
  const after = await (await page.request.get("/api/data")).json();
  const proposal = after.messages
    .filter((m: { proposals?: unknown[] }) => m.proposals?.length)
    .at(-1).proposals[0];
  expect(
    after.allBudgets.find(
      (b: { month: string; category: string }) =>
        b.month === proposal.payload.month && b.category === "Dining",
    ).limit,
  ).toBe(proposal.payload.limit);
  await page.getByRole("link", { name: "Activity & audit" }).click();
  await expect(
    page
      .locator(".audit-row")
      .filter({ hasText: "apply budget change" })
      .first(),
  ).toContainText("approved");
  await expect(
    page
      .locator(".audit-row")
      .filter({ hasText: "apply budget change" })
      .last(),
  ).toContainText("rejected");
});
test("CSV preview, atomic failure, duplicate detection, category editing and reports", async ({
  page,
}) => {
  await demo(page);
  await page.getByRole("link", { name: "Transactions", exact: true }).click();
  await page.getByRole("button", { name: "Import CSV" }).click();
  const month = new Date().toISOString().slice(0, 7);
  const csv = `date,merchant,amount,category\n${month}-01,E2E Synthetic Cafe,-24.50,Dining`;
  await page
    .getByRole("textbox", { name: "CSV content" })
    .fill(csv + "\n2026-02-30,Invalid,-4.00,Dining");
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "entire batch rejected",
  );
  await page
    .getByRole("textbox", { name: "CSV content" })
    .fill(csv + `\n${month}-01,E2E Synthetic Cafe,-24.50,Dining`);
  await page.getByRole("button", { name: "Validate & preview" }).click();
  await expect(page.getByText("1 duplicates skipped")).toBeVisible();
  await page.getByRole("button", { name: "Confirm import (1)" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("textbox", { name: "Search transactions" })
    .fill("E2E Synthetic Cafe");
  await expect(
    page.getByText("E2E Synthetic Cafe", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit category for E2E Synthetic Cafe" })
    .click();
  await page.getByRole("dialog").getByLabel("Category").selectOption("Other");
  await page.getByRole("button", { name: "Confirm category change" }).click();
  await expect(
    page.getByRole("cell", { name: "Other", exact: true }),
  ).toBeVisible();
  const pdf = await page.request.get("/api/export/pdf");
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).toString().startsWith("%PDF-")).toBe(true);
});
test("budget CRUD and recurring reminder approval", async ({ page }) => {
  await demo(page);
  await page.getByRole("link", { name: "Budgets", exact: true }).click();
  await page.getByRole("button", { name: "New budget" }).click();
  await page.getByRole("dialog").getByLabel("Category").selectOption("Health");
  await page.getByRole("button", { name: "Confirm & save budget" }).click();
  const card = page
    .locator(".budget-card")
    .filter({
      has: page.getByRole("heading", { name: "Health", exact: true }),
    });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Edit budget" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Monthly limit (USD)")
    .fill("325.50");
  await page.getByRole("button", { name: "Confirm & save budget" }).click();
  await expect(card).toContainText("$325.50");
  await card.getByRole("button", { name: "Delete Health budget" }).click();
  await page.getByRole("button", { name: "Confirm deletion" }).click();
  await expect(card).not.toBeVisible();
  await page.getByRole("link", { name: "Bills & subscriptions" }).click();
  await page
    .locator(".bill-row")
    .filter({ hasText: "Netflix" })
    .getByRole("button", { name: "Set reminder" })
    .click();
  await expect(page).toHaveURL(/\/agent$/);
  await expect(page.locator(".proposal-card")).toContainText("Netflix");
  await page.getByRole("button", { name: "Approve change" }).click();
  await page.getByRole("link", { name: "Bills & subscriptions" }).click();
  const reminder = page.locator(".reminder").filter({ hasText: "Netflix" });
  await expect(reminder).toBeVisible();
  await reminder.getByRole("button", { name: "Mark complete" }).click();
  await expect(reminder).toContainText("Completed");
});
test("mobile navigation, all routes, theme, keyboard dialog", async ({
  page,
}) => {
  await demo(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [label, heading] of [
    ["Insights", "Insights"],
    ["Settings", "Settings"],
    ["Transactions", "Transactions"],
    ["Budgets", "Budgets"],
  ]) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("link", { name: label, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: heading, exact: true }).first(),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "New budget" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
