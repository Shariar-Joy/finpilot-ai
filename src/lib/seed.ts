import { randomUUID } from "node:crypto";
import { type Ledger, type Category, monthOf, shiftMonth } from "./domain";

export function seedLedger(now = new Date()): Ledger {
  const transactions: Ledger["transactions"] = [];
  const today = new Date(now.toISOString().slice(0, 10) + "T12:00:00Z");
  const add = (
    date: string,
    merchant: string,
    category: Category,
    amount: number,
  ) =>
    transactions.push({
      id: `tx_${randomUUID().slice(0, 12)}`,
      date,
      merchant,
      category,
      amount,
      synthetic: true,
    });
  for (let back = 89; back >= 0; back--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - back);
    const date = d.toISOString().slice(0, 10),
      day = d.getUTCDate();
    const isCurrent = date.startsWith(monthOf(today));
    if (day === 1) {
      add(date, "Meridian Studio · Salary", "Income", 620000);
      add(date, "Parkside Apartments", "Housing", -165000);
    }
    if (day === 5) add(date, "Netflix", "Subscriptions", -1599);
    if (day === 9) add(date, "Spotify", "Subscriptions", -1099);
    if (day === 12) add(date, "City Energy", "Utilities", -8900);
    if (day === 15) add(date, "Fiber Internet", "Utilities", -5500);
    if (day % 6 === 0)
      add(date, "Whole Foods Market", "Groceries", -(6300 + day * 79));
    if (day % 3 === 0)
      add(
        date,
        ["Blue Bottle Coffee", "The Green Table", "Nori Kitchen"][
          day % 3 === 0 ? Math.floor(day / 3) % 3 : 0
        ],
        "Dining",
        -(isCurrent ? 3800 + day * 170 : 1600 + day * 50),
      );
    if (day % 2 === 1)
      add(date, "Corner Coffee", "Dining", -(isCurrent ? 650 : 450));
    if (day % 5 === 0) add(date, "Metro Transit", "Transport", -2400);
    if (day === 14) add(date, "Linen & Co.", "Shopping", -12400);
    if (day === 18)
      add(
        date,
        "Harbor House · Group dinner",
        "Dining",
        isCurrent ? -24800 : -6900,
      );
    if (day === 22) add(date, "Freelance design", "Income", 85000);
  }
  const current = monthOf(today);
  const budgets = [current, shiftMonth(current, 1)].flatMap((month) =>
    (
      [
        ["Dining", 55000],
        ["Groceries", 50000],
        ["Shopping", 25000],
        ["Transport", 18000],
        ["Subscriptions", 10000],
      ] as [Category, number][]
    ).map(([category, limit]) => ({
      id: randomUUID(),
      category,
      month,
      limit,
      threshold: 80,
    })),
  );
  return {
    transactions,
    budgets,
    reminders: [],
    approvals: [],
    audits: [],
    messages: [],
    seededAt: today.toISOString(),
  };
}
