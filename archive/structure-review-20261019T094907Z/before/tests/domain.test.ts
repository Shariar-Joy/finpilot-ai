import { describe, it, expect } from "vitest";
import {
  anomalies,
  budgetStatus,
  dateSchema,
  reducedBudget,
  recurring,
  shiftMonth,
  summary,
  toCents,
  total,
  type Transaction,
} from "../src/lib/domain";
import { parseCsv, exportCsv } from "../src/lib/csv";
import { seedLedger } from "../src/lib/seed";
import { decide, payloadHash, propose } from "../src/lib/security";

const now = new Date("2026-10-19T12:00:00Z");
describe("exact money and dates", () => {
  it("parses dollars without floating-point arithmetic", () => {
    expect(toCents("0.29")).toBe(29);
    expect(toCents("-12.50")).toBe(-1250);
  });
  it.each(["1.001", "NaN", "Infinity", "0", "1e3", "99999999"])(
    "rejects invalid amount %s",
    (v) => expect(() => toCents(v)).toThrow(),
  );
  it("rounds budget to the nearest cent", () => {
    expect(reducedBudget(10001, 20)).toBe(8001);
    expect(reducedBudget(125, 20)).toBe(100);
  });
  it("rejects invalid percentages and unsafe totals", () => {
    expect(() => reducedBudget(100, 101)).toThrow();
    expect(() => total([Number.MAX_SAFE_INTEGER, 1])).toThrow();
  });
  it("moves across year boundaries", () =>
    expect(shiftMonth("2026-12", 1)).toBe("2027-01"));
  it("rejects calendar overflow", () =>
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false));
});
describe("synthetic financial analysis", () => {
  it("seeds 90 inclusive calendar days and only synthetic records", () => {
    const s = seedLedger(now);
    expect(s.transactions.length).toBeGreaterThan(100);
    expect(
      s.transactions.every((t) => t.synthetic && Number.isInteger(t.amount)),
    ).toBe(true);
    expect(
      Math.max(...s.transactions.map((t) => Date.parse(t.date))) -
        Math.min(...s.transactions.map((t) => Date.parse(t.date))),
    ).toBeLessThanOrEqual(89 * 86400000);
  });
  it("calculates totals and budgets from ledger records", () => {
    const s = seedLedger(now),
      sum = summary(s.transactions, "2026-10");
    expect(sum.income - sum.expenses).toBe(sum.savings);
    expect(sum.byCategory.reduce((a, c) => a + c.amount, 0)).toBe(sum.expenses);
    expect(
      budgetStatus(s, "2026-10").find((b) => b.category === "Dining")!.spent,
    ).toBe(sum.byCategory.find((c) => c.category === "Dining")!.amount);
  });
  it("detects monthly bills with evidence", () => {
    const bills = recurring(seedLedger(now).transactions, now);
    expect(
      bills.some(
        (b) =>
          b.merchant === "Netflix" &&
          b.evidence.length >= 3 &&
          b.amount === 1599,
      ),
    ).toBe(true);
  });
  it("does not infer bills from only two payments", () =>
    expect(
      recurring(
        seedLedger(now)
          .transactions.filter((t) => t.merchant === "Netflix")
          .slice(0, 2),
        now,
      ),
    ).toEqual([]));
  it("uses earlier category peers and a transparent threshold", () => {
    const flags = anomalies(seedLedger(now).transactions);
    expect(flags.some((t) => t.merchant.includes("Group dinner"))).toBe(true);
    expect(flags.every((t) => -t.amount > t.threshold)).toBe(true);
  });
  it("clamps recurring January 31 to February", () => {
    const rows = ["2025-11-30", "2025-12-31", "2026-01-31"].map((date, i) => ({
      id: String(i),
      date,
      merchant: "Monthly",
      category: "Subscriptions",
      amount: -1000,
      synthetic: true,
    })) as Transaction[];
    expect(recurring(rows, new Date("2026-02-01"))[0].dueDate).toBe(
      "2026-02-28",
    );
  });
});
describe("CSV atomic validation and duplicate protection", () => {
  const valid =
    "date,merchant,amount,category\n2026-10-19,Demo Cafe,-24.50,Dining";
  it("parses valid rows", () =>
    expect(parseCsv(valid, []).rows[0].amount).toBe(-2450));
  it("deduplicates within the batch and against stored data", () => {
    const p = parseCsv(valid + "\n2026-10-19,DEMO CAFE,-24.50,Dining", []);
    expect(p.rows).toHaveLength(1);
    expect(p.duplicates).toBe(1);
    expect(parseCsv(valid, p.rows).duplicates).toBe(1);
  });
  it("rejects a mixed valid/invalid batch entirely", () =>
    expect(() =>
      parseCsv(valid + "\n2026-02-30,Invalid,-12.00,Dining", []),
    ).toThrow());
  it("handles quoted commas", () =>
    expect(
      parseCsv(
        'date,merchant,amount,category\n2026-10-19,"Cafe, Demo",-2.00,Dining',
        [],
      ).rows[0].merchant,
    ).toBe("Cafe, Demo"));
  it("rejects headers and oversized uploads", () => {
    expect(() =>
      parseCsv("date,merchant,amount\n2026-10-19,a,2", []),
    ).toThrow();
    expect(() => parseCsv("a".repeat(512 * 1024 + 1), [])).toThrow();
  });
  it("neutralizes spreadsheet formulas in merchant names", () => {
    const p = parseCsv(valid, []);
    p.rows[0].merchant = '=HYPERLINK("bad")';
    expect(exportCsv(p.rows)).toContain("'=HYPERLINK");
  });
});
describe("approval payload binding", () => {
  const payload = {
    kind: "budget" as const,
    category: "Dining" as const,
    month: "2026-11",
    limit: 40000,
    threshold: 80,
  };
  it("hashes property ordering canonically", () =>
    expect(payloadHash(payload)).toBe(
      payloadHash({
        threshold: 80,
        limit: 40000,
        month: "2026-11",
        category: "Dining",
        kind: "budget",
      }),
    ));
  it("applies once and rejects replay", () => {
    const s = seedLedger(now),
      p = propose(s, "alice", payload, "corr");
    decide(s, "alice", p.id, p.token, payload, true, "corr");
    expect(
      s.budgets.find((b) => b.month === "2026-11" && b.category === "Dining")!
        .limit,
    ).toBe(40000);
    expect(() =>
      decide(s, "alice", p.id, p.token, payload, true, "corr"),
    ).toThrow();
  });
  it("rejects modified payload, cross-user, wrong token, and expiry", () => {
    const s = seedLedger(now),
      p = propose(s, "alice", payload, "corr", 1000);
    expect(() =>
      decide(
        s,
        "alice",
        p.id,
        p.token,
        { ...payload, limit: 1 },
        true,
        "corr",
        1001,
      ),
    ).toThrow();
    expect(() =>
      decide(s, "bob", p.id, p.token, payload, true, "corr", 1001),
    ).toThrow();
    expect(() =>
      decide(s, "alice", p.id, "wrong", payload, true, "corr", 1001),
    ).toThrow();
    expect(() =>
      decide(s, "alice", p.id, p.token, payload, true, "corr", 301000),
    ).toThrow();
  });
  it("rejection leaves financial data unchanged and consumes the token", () => {
    const s = seedLedger(now),
      before = JSON.stringify(s.budgets),
      p = propose(s, "alice", payload, "corr");
    decide(s, "alice", p.id, p.token, payload, false, "corr");
    expect(JSON.stringify(s.budgets)).toBe(before);
    expect(s.audits.at(-1)?.decision).toBe("rejected");
    expect(() =>
      decide(s, "alice", p.id, p.token, payload, true, "corr"),
    ).toThrow();
  });
});
