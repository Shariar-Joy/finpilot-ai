import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { createUser, mutateLedger, readLedger } from "../src/lib/store";
import { seedLedger } from "../src/lib/seed";
import { decide, propose } from "../src/lib/security";
describe("atomic repository invariants", () => {
  it("commits one of two concurrent uses of the same approval", async () => {
    const id = randomUUID(),
      ledger = seedLedger();
    const payload = {
      kind: "budget" as const,
      category: "Dining" as const,
      month: "2026-11",
      limit: 12345,
      threshold: 80,
    };
    const p = propose(ledger, id, payload, "concurrency-fixture");
    await createUser(
      {
        id,
        email: `${id}@example.test`,
        name: "Synthetic test user",
        passwordHash: "not-a-login-account",
      },
      ledger,
    );
    const results = await Promise.allSettled(
      [1, 2].map(() =>
        mutateLedger(id, (s) =>
          decide(s, id, p.id, p.token, p.payload, true, "concurrent-approval"),
        ),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const after = await readLedger(id);
    expect(
      after.audits.filter(
        (a) => a.action === "apply_budget_change" && a.decision === "approved",
      ),
    ).toHaveLength(1);
  });
  it("discards an entire mutation when it throws after editing a copy", async () => {
    const id = randomUUID(),
      ledger = seedLedger();
    await createUser(
      {
        id,
        email: `${id}@example.test`,
        name: "Synthetic test user",
        passwordHash: "not-a-login-account",
      },
      ledger,
    );
    await expect(
      mutateLedger(id, (s) => {
        s.budgets = [];
        s.transactions = [];
        throw new Error("invalid batch fixture");
      }),
    ).rejects.toThrow("invalid batch");
    const after = await readLedger(id);
    expect(after.budgets).toEqual(ledger.budgets);
    expect(after.transactions).toEqual(ledger.transactions);
  });
});
