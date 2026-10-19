# Five-minute demonstration

All amounts shown are computed from synthetic records. Seed generation is relative to the server's UTC date; use the interface's actual values instead of memorized figures. No bank account, real payment, email or financial credential is involved.

## Before presenting

1. Run `npm ci`, `npm run dev`; open http://127.0.0.1:3000.
2. Choose **Explore the live demo**. A fresh isolated workspace is seeded with 90 days. No password is needed. PostgreSQL users may instead log in to `demo@finpilot.local` using the configured DEMO_PASSWORD after running the seed command.
3. Confirm the storage label. In-memory mode resets on server restart. An optional LLM/Python service is not required for the golden scenario.

## 0:00–0:30 — The problem and promise

“FinPilot makes personal finances understandable and helps complete a plan. We focus on explainable calculations, inspectable tools and user control. This is a synthetic sandbox.”

Point to the synthetic badge and storage mode. All amounts are USD; accounting months use UTC.

## 0:30–1:15 — Financial picture

Show income, expenses, net savings, category mix and cumulative spending. Open Transactions; search a merchant and change month/category. Inspect a transaction ID. The graphs and summaries use actual application records.

## 1:15–2:00 — Import with guardrails

Open **Import CSV**, download the sample or paste a current-month row:

```csv
date,merchant,amount,category
2026-10-19,Demo Riverside Cafe,-24.50,Dining
2026-10-19,Demo Riverside Cafe,-24.50,Dining
```

Replace the date with the current UTC date if needed. Validate; show one new row and one duplicate. Confirm import. Import the same file again to show no duplicate additions. Optionally demonstrate that `2026-02-30` rejects the entire batch. Edit a category using its explicit confirmation form.

## 2:00–3:40 — A question becomes a completed task

Open **AI copilot → Run demo scenario**. It sends:

> Why did I spend more on dining this month? Set next month’s dining budget 20% below this month’s dining spending.

Expand `get_spending_summary`, `compare_months`, `list_transactions`, `get_budget_status` and `propose_budget_change`. Show same-day-of-month comparison, purchase counts, average size and transaction IDs. Explain that the new limit is calculated on the server from recorded current-month dining spending, rounded to cents. A proposal is not a completed write.

Read the exact category, target month, amount and threshold. Choose **Approve change**. The result and `apply_budget_change` timeline entry appear. Open **Budgets**, select next month, and verify the exact dining limit. Open **Activity & audit** and inspect actor, decision, timestamp, correlation ID and payload hash.

## 3:40–4:20 — Rejection proves control

Run the scenario again. Before responding, note the existing next-month limit. Choose **Reject**. The proposal states that financial data is unchanged. Verify the same budget amount and a rejected audit decision. Automated API tests also cover tampered, expired, replayed and cross-user approvals.

## 4:20–5:00 — Innovation with boundaries

Show recurring bills and evidence; propose a Netflix reminder, review and approve it, then mark it complete in Bills. Show unusual purchases with median-based explanations, labeled “unusual, not fraud.” Download the monthly PDF. Mention that the deterministic agent completes the workflow without a key; optional OpenAI planning and private FastAPI analysis extend the application. Do not claim regulatory certification or production readiness for real funds.

## Practical notes

- If a proposal expires (five minutes), ask for a new one. Approvals are only available in the tab where they were created.
- “Next month” is relative to UTC now; change the budget month selector after approval.
- Bill inference requires three monthly observations; early in a calendar month some merchants have fewer recorded samples.
- If the server restarts in memory mode, choose a fresh demo. PostgreSQL preserves state when configured and migrated.
- Evidence and documented test commands are in [execution-evidence.md](execution-evidence.md). Use actual runs for submission claims.
