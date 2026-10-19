import { z } from "zod";

export const categories = [
  "Income",
  "Dining",
  "Groceries",
  "Housing",
  "Transport",
  "Subscriptions",
  "Utilities",
  "Shopping",
  "Health",
  "Other",
] as const;
export type Category = (typeof categories)[number];
export const categorySchema = z.enum(categories);
export const monthSchema = z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/);
export const dateSchema = z
  .string()
  .regex(/^20\d{2}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Invalid calendar date",
  );
export const centsSchema = z.number().int().min(1).max(100_000_000);
export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: Category;
  amount: number;
  synthetic: true;
}
export interface Budget {
  id: string;
  category: Category;
  month: string;
  limit: number;
  threshold: number;
}
export interface Reminder {
  id: string;
  merchant: string;
  dueDate: string;
  amount: number;
  done: boolean;
}
export type Change =
  | {
      kind: "budget";
      category: Category;
      month: string;
      limit: number;
      threshold: number;
    }
  | { kind: "reminder"; merchant: string; dueDate: string; amount: number };
export interface Approval {
  id: string;
  userId: string;
  hash: string;
  tokenHash: string;
  payload: Change;
  expiresAt: number;
  status: "pending" | "applied" | "rejected";
}
export interface PublicProposal {
  id: string;
  token: string;
  payload: Change;
  expiresAt: number;
  status: Approval["status"];
}
export interface Audit {
  id: string;
  actor: string;
  action: string;
  decision: "allowed" | "proposed" | "approved" | "rejected" | "denied";
  timestamp: string;
  correlationId: string;
  metadata: Record<string, string | number | boolean>;
}
export interface ToolEvent {
  name: string;
  tier: "read" | "propose" | "mutate";
  durationMs: number;
  result: unknown;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  tools?: ToolEvent[];
  proposals?: Omit<PublicProposal, "token">[];
  mode?: string;
  citations?: string[];
}
export interface Ledger {
  transactions: Transaction[];
  budgets: Budget[];
  reminders: Reminder[];
  approvals: Approval[];
  audits: Audit[];
  messages: ChatMessage[];
  seededAt: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function monthOf(date = new Date()) {
  return date.toISOString().slice(0, 7);
}
export function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7);
}
export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
export function toCents(value: string): number {
  if (!/^-?\d{1,7}(\.\d{1,2})?$/.test(value.trim()))
    throw new AppError(400, "Amount must have at most two decimal places");
  const s = value.trim();
  const [whole, fraction = ""] = s.replace("-", "").split(".");
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!n || n > 100_000_000)
    throw new AppError(400, "Amount is outside supported limits");
  return s.startsWith("-") ? -n : n;
}
export function reducedBudget(spending: number, percent: number) {
  if (
    !Number.isSafeInteger(spending) ||
    spending < 0 ||
    !Number.isInteger(percent) ||
    percent < 0 ||
    percent > 100
  )
    throw new AppError(400, "Invalid budget calculation");
  return Number((BigInt(spending) * BigInt(100 - percent) + 50n) / 100n);
}
export function total(values: number[]) {
  if (!values.every(Number.isSafeInteger))
    throw new AppError(400, "Money values must be safe integer minor units");
  const n = values.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(n))
    throw new AppError(400, "Total exceeds integer precision");
  return n;
}
export function summary(transactions: Transaction[], month: string) {
  const rows = transactions.filter((t) => t.date.startsWith(month));
  const income = total(rows.filter((t) => t.amount > 0).map((t) => t.amount));
  const expenses = -total(
    rows.filter((t) => t.amount < 0).map((t) => t.amount),
  );
  const byCategory = categories
    .map((category) => ({
      category,
      amount: -total(
        rows
          .filter((t) => t.category === category && t.amount < 0)
          .map((t) => t.amount),
      ),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  return {
    month,
    income,
    expenses,
    savings: income - expenses,
    count: rows.length,
    byCategory,
  };
}
export function budgetStatus(state: Ledger, month: string) {
  return state.budgets
    .filter((b) => b.month === month)
    .map((b) => {
      const spent = -total(
        state.transactions
          .filter(
            (t) =>
              t.date.startsWith(month) &&
              t.category === b.category &&
              t.amount < 0,
          )
          .map((t) => t.amount),
      );
      const percent = Math.round((spent * 100) / b.limit);
      return { ...b, spent, percent, alert: percent >= b.threshold };
    });
}
export function recurring(transactions: Transaction[], now = new Date()) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions.filter((t) => t.amount < 0)) {
    const key = t.merchant.trim().toLowerCase();
    groups.set(key, [...(groups.get(key) || []), t]);
  }
  return [...groups.values()].flatMap((group) => {
    const rows = group.sort((a, b) => a.date.localeCompare(b.date));
    if (rows.length < 3) return [];
    const gaps = rows
      .slice(1)
      .map(
        (t, i) => (Date.parse(t.date) - Date.parse(rows[i].date)) / 86400000,
      );
    const amounts = rows.map((t) => -t.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    if (
      !gaps.every((g) => g >= 25 && g <= 35) ||
      !amounts.every((a) => Math.abs(a - median) <= median * 0.15)
    )
      return [];
    const last = rows[rows.length - 1];
    const date = new Date(last.date + "T00:00:00Z");
    let due = date;
    // Clamp end-of-month dates instead of skipping February.
    do {
      const y = due.getUTCFullYear(),
        m = due.getUTCMonth() + 1;
      due = new Date(
        Date.UTC(
          y,
          m,
          Math.min(
            date.getUTCDate(),
            new Date(Date.UTC(y, m + 1, 0)).getUTCDate(),
          ),
        ),
      );
    } while (due.toISOString().slice(0, 10) < now.toISOString().slice(0, 10));
    return [
      {
        merchant: last.merchant,
        amount: median,
        dueDate: due.toISOString().slice(0, 10),
        evidence: rows.map((t) => t.id),
        confidence: "3+ monthly payments, 25–35 days apart, amount within 15%",
      },
    ];
  });
}
export function anomalies(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.amount < 0)
    .flatMap((t) => {
      const peers = transactions
        .filter(
          (p) =>
            p.category === t.category &&
            p.amount < 0 &&
            p.id !== t.id &&
            p.date < t.date,
        )
        .map((p) => -p.amount)
        .sort((a, b) => a - b);
      if (peers.length < 5) return [];
      const median = peers[Math.floor(peers.length / 2)];
      const threshold = Math.max(median * 3, 10000);
      return -t.amount > threshold
        ? [
            {
              ...t,
              median,
              threshold,
              reason: `Above 3× prior category median (${money(median)}) and $100. This is unusual spending, not a fraud determination.`,
            },
          ]
        : [];
    })
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 12);
}
