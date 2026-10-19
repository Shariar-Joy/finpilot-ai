import { beforeAll, describe, expect, it } from "vitest";
import { handleApi } from "../src/lib/api";
import { goldenPrompt } from "../src/lib/agent";
import { mutateLedger, readLedger } from "../src/lib/store";
import { monthOf, reducedBudget, shiftMonth } from "../src/lib/domain";
import type { PublicProposal } from "../src/lib/domain";

function request(
  path: string,
  body?: unknown,
  cookie = "",
  method = body ? "POST" : "GET",
  origin = process.env.APP_ORIGIN || "http://localhost:3000",
) {
  return handleApi(
    new Request(
      `${process.env.APP_ORIGIN || "http://localhost:3000"}/api/${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Cookie: cookie,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    ),
  );
}
let alice = "",
  bob = "",
  aliceId = "";
beforeAll(async () => {
  const a = await request("auth/demo", {}),
    b = await request("auth/demo", {});
  alice = a.headers.get("set-cookie")!.split(";")[0];
  bob = b.headers.get("set-cookie")!.split(";")[0];
  aliceId = (await a.json()).user.id;
});
describe("real API boundary", () => {
  it("requires authentication", async () =>
    expect((await request("data")).status).toBe(401));
  it("rejects cross-origin writes", async () =>
    expect(
      (
        await request(
          "agent",
          { message: "hello" },
          alice,
          "POST",
          "https://evil.test",
        )
      ).status,
    ).toBe(403));
  it("rejects caller-selected users", async () => {
    const a = await (await request("data", undefined, alice)).json(),
      b = await (
        await request("data?userId=" + aliceId, undefined, bob)
      ).json();
    expect(a.transactions[0].id).not.toBe(b.transactions[0].id);
  });
  it("enforces transaction ownership", async () => {
    const a = await (await request("data", undefined, alice)).json();
    expect(
      (
        await request(
          `transactions/${a.transactions[0].id}`,
          { category: "Other", confirmed: true },
          bob,
          "PATCH",
        )
      ).status,
    ).toBe(404);
  });
  it("enforces budget ownership", async () => {
    const a = await (await request("data", undefined, alice)).json();
    expect(
      (
        await request(
          `budgets/${a.allBudgets[0].id}`,
          { confirmed: true },
          bob,
          "DELETE",
        )
      ).status,
    ).toBe(404);
  });
  it("does not expose approval secrets in data responses", async () => {
    const r = await request("agent", { message: goldenPrompt }, alice);
    expect(r.status).toBe(200);
    const data = await (await request("data", undefined, alice)).text();
    expect(data).not.toContain("tokenHash");
    expect(data).not.toContain('"token":');
  });
  it("runs golden scenario with grounded tools, rejects then approves", async () => {
    const initial = await readLedger(aliceId);
    const before = JSON.stringify(initial.budgets);
    const first = await (
      await request("agent", { message: goldenPrompt }, alice)
    ).json();
    const p = first.proposals[0] as PublicProposal;
    expect(first.message.tools.map((t: { name: string }) => t.name)).toContain(
      "compare_months",
    );
    expect(first.message.citations.length).toBeGreaterThan(0);
    expect(JSON.stringify((await readLedger(aliceId)).budgets)).toBe(before);
    expect(
      (
        await request(
          "approvals",
          { ...p, approve: true, status: undefined, expiresAt: undefined },
          bob,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await request(
          "approvals",
          { id: p.id, token: p.token, payload: p.payload, approve: false },
          alice,
        )
      ).status,
    ).toBe(200);
    expect(JSON.stringify((await readLedger(aliceId)).budgets)).toBe(before);
    const second = await (
      await request("agent", { message: goldenPrompt }, alice)
    ).json();
    const q = second.proposals[0] as PublicProposal;
    expect(
      (
        await request(
          "approvals",
          {
            id: q.id,
            token: q.token,
            payload: { ...q.payload, limit: 1 },
            approve: true,
          },
          alice,
        )
      ).status,
    ).toBe(403);
    const approved = await request(
      "approvals",
      { id: q.id, token: q.token, payload: q.payload, approve: true },
      alice,
    );
    expect(approved.status).toBe(200);
    const state = await readLedger(aliceId),
      spending = -state.transactions
        .filter(
          (t) =>
            t.date.startsWith(monthOf()) &&
            t.category === "Dining" &&
            t.amount < 0,
        )
        .reduce((a, t) => a + t.amount, 0);
    expect(
      state.budgets.find(
        (b) => b.month === shiftMonth(monthOf(), 1) && b.category === "Dining",
      )!.limit,
    ).toBe(reducedBudget(spending, 20));
    expect(
      state.audits.some(
        (a) => a.action === "apply_budget_change" && a.decision === "approved",
      ),
    ).toBe(true);
    expect(
      (
        await request(
          "approvals",
          { id: q.id, token: q.token, payload: q.payload, approve: true },
          alice,
        )
      ).status,
    ).toBe(403);
  });
  it("expired approval cannot mutate", async () => {
    const r = await (
      await request("agent", { message: goldenPrompt }, alice)
    ).json();
    const p = r.proposals[0] as PublicProposal;
    await mutateLedger(aliceId, (s) => {
      s.approvals.find((a) => a.id === p.id)!.expiresAt = Date.now() - 1;
    });
    expect(
      (
        await request(
          "approvals",
          { id: p.id, token: p.token, payload: p.payload, approve: true },
          alice,
        )
      ).status,
    ).toBe(403);
  });
  it("does not accept direct agent mutations", async () =>
    expect(
      (await request("apply_budget_change", { limit: 1 }, alice)).status,
    ).toBe(404));
  it("rolls back invalid CSV, imports and deduplicates a valid batch", async () => {
    const before = (await readLedger(aliceId)).transactions.length;
    const csv =
      "date,merchant,amount,category\n2026-10-19,API Cafe,-12.00,Dining";
    expect(
      (
        await request(
          "transactions/import",
          {
            csv: csv + "\n2026-02-30,Bad,-2.00,Dining",
            commit: true,
            confirmed: true,
          },
          alice,
        )
      ).status,
    ).toBe(400);
    expect((await readLedger(aliceId)).transactions.length).toBe(before);
    expect(
      (await request("transactions/import", { csv, commit: true }, alice))
        .status,
    ).toBe(403);
    const preview = await request(
      "transactions/import",
      { csv, commit: false },
      alice,
    );
    expect(preview.status).toBe(200);
    expect((await readLedger(aliceId)).transactions.length).toBe(before);
    await request(
      "transactions/import",
      { csv, commit: true, confirmed: true },
      alice,
    );
    const again = await (
      await request(
        "transactions/import",
        { csv, commit: true, confirmed: true },
        alice,
      )
    ).json();
    expect(again.imported).toBe(0);
    expect(again.duplicates).toBe(1);
  });
  it("creates, edits and deletes budgets only with explicit confirmation", async () => {
    const body = {
      category: "Health",
      month: monthOf(),
      limit: 20000,
      threshold: 80,
    };
    expect((await request("budgets", body, alice)).status).toBe(400);
    const created = await (
      await request("budgets", { ...body, confirmed: true }, alice)
    ).json();
    expect(created.id).toBeTruthy();
    expect(
      (
        await request(
          `budgets/${created.id}`,
          { ...body, limit: 25000, confirmed: true },
          alice,
          "PATCH",
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await request(
          `budgets/${created.id}`,
          { confirmed: true },
          alice,
          "DELETE",
        )
      ).status,
    ).toBe(200);
  });
  it("creates a reminder only after approval", async () => {
    const result = await (
      await request(
        "agent",
        { message: "Create a reminder for Netflix" },
        alice,
      )
    ).json();
    const p = result.proposals[0] as PublicProposal;
    expect((await readLedger(aliceId)).reminders).toHaveLength(0);
    expect(
      (
        await request(
          "approvals",
          { id: p.id, token: p.token, payload: p.payload, approve: true },
          alice,
        )
      ).status,
    ).toBe(200);
    expect((await readLedger(aliceId)).reminders).toHaveLength(1);
  });
  it("exports CSV and a genuine PDF", async () => {
    const csv = await request("export/csv", undefined, alice);
    expect(csv.headers.get("content-type")).toContain("text/csv");
    const pdf = await request("export/pdf", undefined, alice);
    expect((await pdf.text()).startsWith("%PDF-")).toBe(true);
  });
  it("registers, logs in, and revokes sessions", async () => {
    const input = {
      name: "Test User",
      email: `test-${Date.now()}@example.test`,
      password: "test-password-only-123",
    };
    expect((await request("auth/register", input)).status).toBe(200);
    expect(
      (
        await request("auth/login", {
          email: input.email,
          password: input.password,
        })
      ).status,
    ).toBe(200);
    const r = await request("auth/login", {
      email: input.email,
      password: input.password,
    });
    const cookie = r.headers.get("set-cookie")!.split(";")[0];
    expect((await request("auth/logout", {}, cookie)).status).toBe(200);
    expect((await request("me", undefined, cookie)).status).toBe(401);
  });
});
