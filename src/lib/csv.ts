import Papa from "papaparse";
import { createHash } from "node:crypto";
import {
  AppError,
  categorySchema,
  dateSchema,
  toCents,
  type Transaction,
} from "./domain";

export function fingerprint(
  t: Pick<Transaction, "date" | "merchant" | "amount">,
) {
  return createHash("sha256")
    .update(JSON.stringify([t.date, t.merchant.trim().toLowerCase(), t.amount]))
    .digest("hex");
}
export function parseCsv(csv: string, existing: Transaction[]) {
  if (Buffer.byteLength(csv, "utf8") > 512 * 1024)
    throw new AppError(413, "CSV exceeds 512 KB");
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) =>
      h
        .trim()
        .toLowerCase()
        .replace(/^\uFEFF/, ""),
  });
  if (parsed.errors.length)
    throw new AppError(400, "Malformed CSV: " + parsed.errors[0].message);
  if (parsed.meta.fields?.join(",") !== "date,merchant,amount,category")
    throw new AppError(
      400,
      "Required headers in order: date,merchant,amount,category",
    );
  if (parsed.data.length < 1 || parsed.data.length > 2000)
    throw new AppError(400, "CSV must contain 1–2,000 rows");
  const seen = new Set(existing.map(fingerprint));
  const rows: Transaction[] = [];
  let duplicates = 0;
  for (const [index, row] of parsed.data.entries()) {
    if (
      !dateSchema.safeParse(row.date).success ||
      !categorySchema.safeParse(row.category).success ||
      !row.merchant?.trim() ||
      row.merchant.length > 120 ||
      /[\u0000-\u001f]/.test(row.merchant)
    )
      throw new AppError(
        400,
        `Invalid date, merchant or category on row ${index + 2}; entire batch rejected`,
      );
    let amount: number;
    try {
      amount = toCents(row.amount);
    } catch {
      throw new AppError(
        400,
        `Invalid amount on row ${index + 2}; entire batch rejected`,
      );
    }
    const t: Transaction = {
      id: "",
      date: row.date,
      merchant: row.merchant.trim(),
      amount,
      category: categorySchema.parse(row.category),
      synthetic: true,
    };
    const key = fingerprint(t);
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    rows.push(t);
  }
  return { rows, duplicates, total: parsed.data.length };
}
export function exportCsv(transactions: Transaction[]) {
  const safe = (s: string) => (/^[\s]*[=+\-@\t\r]/.test(s) ? "'" + s : s);
  return Papa.unparse(
    {
      fields: ["date", "merchant", "amount", "category"],
      data: transactions.map((t) => [
        t.date,
        safe(t.merchant),
        (t.amount / 100).toFixed(2),
        t.category,
      ]),
    },
    { quotes: true },
  );
}
