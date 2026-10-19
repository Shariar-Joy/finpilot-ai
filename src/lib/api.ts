import { randomUUID } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  anomalies,
  AppError,
  budgetStatus,
  categorySchema,
  centsSchema,
  dateSchema,
  monthOf,
  monthSchema,
  money,
  recurring,
  summary,
  type Change,
  type User,
} from "./domain";
import { exportCsv, parseCsv } from "./csv";
import { seedLedger } from "./seed";
import {
  createUser,
  ensureStorageConfigured,
  findUser,
  mutateLedger,
  persistent,
  readLedger,
} from "./store";
import {
  audit,
  authenticate,
  decide,
  issueSession,
  rateLimit,
  revokeSession,
  verifyOrigin,
} from "./security";
import { runAgent } from "./agent";
import { passwordSchema } from "./credentials";

const json = (
  value: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
const budgetSchema = z
  .object({
    category: categorySchema.refine((c) => c !== "Income"),
    month: monthSchema,
    limit: centsSchema,
    threshold: z.number().int().min(1).max(100),
  })
  .strict();
const changeSchema = z.discriminatedUnion("kind", [
  budgetSchema.extend({ kind: z.literal("budget") }),
  z
    .object({
      kind: z.literal("reminder"),
      merchant: z.string().trim().min(1).max(120),
      dueDate: dateSchema,
      amount: centsSchema,
    })
    .strict(),
]);
async function bodyOf(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AppError(415, "Use application/json");
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 768 * 1024) {
      await reader.cancel();
      throw new AppError(413, "Request too large");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new AppError(400, "Invalid JSON");
  }
}
const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});
export async function handleApi(request: Request): Promise<Response> {
  const correlationId = randomUUID();
  try {
    ensureStorageConfigured();
    const path = new URL(request.url).pathname.replace(/^\/api\//, "");
    const method = request.method;
    if (method !== "GET") verifyOrigin(request);
    const body = method === "GET" ? {} : await bodyOf(request);
    if (path.startsWith("auth/") && path !== "auth/logout") {
      if (method !== "POST") throw new AppError(405, "Method not allowed");
      // No trust in caller-supplied forwarding headers; ingress must enforce per-IP limits in production.
      rateLimit("auth:global", 120, 60_000);
      let user: User;
      if (path === "auth/demo") {
        const id = randomUUID();
        user = {
          id,
          name: "Shariar Joy",
          email: `demo-${id.slice(0, 8)}@finpilot.local`,
          passwordHash: await hash(randomUUID(), 10),
        };
        await createUser(user, seedLedger());
      } else {
        const input = z
          .object({
            email: z
              .email()
              .max(254)
              .transform((s) => s.toLowerCase()),
            password: passwordSchema,
            name: z.string().trim().min(2).max(60).optional(),
          })
          .strict()
          .parse(body);
        rateLimit(`auth:${input.email}`, 10, 15 * 60_000);
        if (path === "auth/register") {
          user = {
            id: randomUUID(),
            name: input.name ?? "New member",
            email: input.email,
            passwordHash: await hash(input.password, 12),
          };
          await createUser(user, seedLedger());
        } else if (path === "auth/login") {
          const found = await findUser(input.email);
          const valid = await compare(
            input.password,
            found?.passwordHash ??
              "$2b$12$k5EMdLADkfB3pr5hG8IMceT6qSp2GUO33oIR9HvZy3/V4pfbZY7FO",
          );
          if (!found || !valid)
            throw new AppError(401, "Email or password is incorrect");
          user = found;
        } else throw new AppError(404, "Endpoint not found");
      }
      await mutateLedger(user.id, (s) =>
        audit(s, user.id, "session_created", "allowed", correlationId),
      );
      return json({ user: publicUser(user) }, 200, {
        "Set-Cookie": await issueSession(user.id),
      });
    }
    const { user, tokenHash } = await authenticate(request);
    rateLimit(`api:${user.id}`, 120);
    if (path === "auth/logout" && method === "POST")
      return json({ ok: true }, 200, {
        "Set-Cookie": await revokeSession(tokenHash),
      });
    if (path === "me" && method === "GET")
      return json({
        user: publicUser(user),
        storage: persistent
          ? "PostgreSQL · persistent"
          : "In-memory demo · resets on server restart",
        agent: process.env.OPENAI_API_KEY
          ? "OpenAI with deterministic tools"
          : "Deterministic tools · no API key required",
        analytics: !!(
          process.env.ANALYTICS_URL && process.env.ANALYTICS_SERVICE_TOKEN
        ),
      });
    if (path === "data" && method === "GET") {
      const s = await readLedger(user.id);
      const month = monthSchema.parse(
        new URL(request.url).searchParams.get("month") ?? monthOf(),
      );
      return json({
        transactions: s.transactions,
        budgets: budgetStatus(s, month),
        allBudgets: s.budgets,
        reminders: s.reminders,
        bills: recurring(s.transactions),
        anomalies: anomalies(s.transactions),
        summary: summary(s.transactions, month),
        audits: s.audits.slice().reverse(),
        messages: s.messages,
        pending: s.approvals
          .filter((p) => p.status === "pending")
          .map((p) => ({
            id: p.id,
            payload: p.payload,
            expiresAt: p.expiresAt,
            status: p.status,
          })),
        seededAt: s.seededAt,
      });
    }
    if (path === "agent" && method === "POST") {
      rateLimit(`agent:${user.id}`, 20);
      const { message } = z
        .object({ message: z.string().trim().min(1).max(2000) })
        .strict()
        .parse(body);
      const state = await readLedger(user.id),
        auditCount = state.audits.length,
        approvalCount = state.approvals.length,
        messageCount = state.messages.length;
      const result = await runAgent(state, user.id, message);
      await mutateLedger(user.id, (s) => {
        if (
          s.approvals.filter(
            (a) => a.status === "pending" && a.expiresAt > Date.now(),
          ).length +
            result.proposals.length >
          20
        )
          throw new AppError(409, "Resolve pending proposals first");
        s.approvals.push(...state.approvals.slice(approvalCount));
        s.audits.push(...state.audits.slice(auditCount));
        s.messages.push(...state.messages.slice(messageCount));
      });
      return json(result);
    }
    if (path === "approvals" && method === "POST") {
      const input = z
        .object({
          id: z.uuid(),
          token: z.string().length(64),
          payload: changeSchema,
          approve: z.boolean(),
        })
        .strict()
        .parse(body);
      try {
        const result = await mutateLedger(user.id, (s) =>
          decide(
            s,
            user.id,
            input.id,
            input.token,
            input.payload as Change,
            input.approve,
            correlationId,
          ),
        );
        return json({
          ...result,
          tool: {
            name: result.action,
            tier: "mutate",
            decision: result.status,
            correlationId,
          },
        });
      } catch (e) {
        await mutateLedger(user.id, (s) =>
          audit(s, user.id, "approval_attempt", "denied", correlationId, {
            proposalId: input.id,
          }),
        );
        throw e;
      }
    }
    if (path === "transactions/import" && method === "POST") {
      const input = z
        .object({
          csv: z.string().max(600000),
          commit: z.boolean(),
          confirmed: z.boolean().optional(),
        })
        .strict()
        .parse(body);
      if (input.commit && !input.confirmed)
        throw new AppError(403, "Explicit import confirmation required");
      if (!input.commit)
        return json(
          parseCsv(input.csv, (await readLedger(user.id)).transactions),
        );
      const result = await mutateLedger(user.id, (s) => {
        const parsed = parseCsv(input.csv, s.transactions);
        s.transactions.push(
          ...parsed.rows.map((t) => ({
            ...t,
            id: `tx_${randomUUID().slice(0, 12)}`,
          })),
        );
        audit(s, user.id, "csv_import", "approved", correlationId, {
          imported: parsed.rows.length,
          duplicates: parsed.duplicates,
        });
        return { imported: parsed.rows.length, duplicates: parsed.duplicates };
      });
      return json(result);
    }
    if (path.startsWith("transactions/") && method === "PATCH") {
      const id = path.slice("transactions/".length);
      const input = z
        .object({ category: categorySchema, confirmed: z.literal(true) })
        .strict()
        .parse(body);
      return json(
        await mutateLedger(user.id, (s) => {
          const t = s.transactions.find((t) => t.id === id);
          if (!t) throw new AppError(404, "Transaction not found");
          t.category = input.category;
          audit(s, user.id, "transaction_category", "approved", correlationId, {
            transactionId: id,
            category: input.category,
          });
          return t;
        }),
      );
    }
    if (path === "budgets" && method === "POST") {
      const { confirmed, ...input } = budgetSchema
        .extend({ confirmed: z.literal(true) })
        .parse(body);
      void confirmed;
      return json(
        await mutateLedger(user.id, (s) => {
          if (
            s.budgets.some(
              (b) => b.month === input.month && b.category === input.category,
            )
          )
            throw new AppError(
              409,
              "A budget already exists for this category and month. Edit it instead.",
            );
          const b = { ...input, id: randomUUID() };
          s.budgets.push(b);
          audit(s, user.id, "budget_created", "approved", correlationId, {
            budgetId: b.id,
          });
          return b;
        }),
      );
    }
    if (
      path.startsWith("budgets/") &&
      (method === "PATCH" || method === "DELETE")
    ) {
      const id = path.slice("budgets/".length);
      const input =
        method === "PATCH"
          ? budgetSchema.extend({ confirmed: z.literal(true) }).parse(body)
          : z
              .object({ confirmed: z.literal(true) })
              .strict()
              .parse(body);
      return json(
        await mutateLedger(user.id, (s) => {
          const b = s.budgets.find((b) => b.id === id);
          if (!b) throw new AppError(404, "Budget not found");
          if (method === "DELETE")
            s.budgets = s.budgets.filter((b) => b.id !== id);
          else {
            const { confirmed: _confirmed, ...fields } = input;
            void _confirmed;
            const v = budgetSchema.parse(fields);
            if (
              s.budgets.some(
                (other) =>
                  other.id !== id &&
                  other.category === v.category &&
                  other.month === v.month,
              )
            )
              throw new AppError(
                409,
                "Budget already exists for this month and category",
              );
            Object.assign(b, v);
          }
          audit(
            s,
            user.id,
            method === "DELETE" ? "budget_deleted" : "budget_updated",
            "approved",
            correlationId,
            { budgetId: id },
          );
          return { ok: true };
        }),
      );
    }
    if (path.startsWith("reminders/") && method === "PATCH") {
      const id = path.slice("reminders/".length),
        input = z
          .object({ done: z.boolean(), confirmed: z.literal(true) })
          .strict()
          .parse(body);
      return json(
        await mutateLedger(user.id, (s) => {
          const reminder = s.reminders.find((r) => r.id === id);
          if (!reminder) throw new AppError(404, "Reminder not found");
          reminder.done = input.done;
          audit(s, user.id, "reminder_updated", "approved", correlationId, {
            reminderId: id,
            done: input.done,
          });
          return reminder;
        }),
      );
    }
    if (path === "analytics" && method === "GET") {
      if (!process.env.ANALYTICS_URL || !process.env.ANALYTICS_SERVICE_TOKEN)
        throw new AppError(
          503,
          "Configure ANALYTICS_URL and ANALYTICS_SERVICE_TOKEN to connect the Python service",
        );
      const s = await readLedger(user.id);
      const response = await fetch(
        `${process.env.ANALYTICS_URL.replace(/\/$/, "")}/analyze`,
        {
          method: "POST",
          signal: AbortSignal.timeout(3000),
          headers: {
            "Content-Type": "application/json",
            "X-Service-Token": process.env.ANALYTICS_SERVICE_TOKEN,
          },
          body: JSON.stringify({
            month: monthOf(),
            transactions: s.transactions.map(
              ({ id, date, category, amount }) => ({
                id,
                date,
                category,
                amount,
              }),
            ),
          }),
        },
      );
      if (!response.ok) throw new AppError(503, "Python analysis unavailable");
      return json(await response.json());
    }
    if ((path === "export/csv" || path === "export/pdf") && method === "GET") {
      const s = await readLedger(user.id),
        month = monthSchema.parse(
          new URL(request.url).searchParams.get("month") ?? monthOf(),
        );
      const rows = s.transactions.filter((t) => t.date.startsWith(month));
      await mutateLedger(user.id, (l) =>
        audit(l, user.id, path, "allowed", correlationId, { month }),
      );
      if (path === "export/csv")
        return new Response(exportCsv(rows), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="finpilot-${month}.csv"`,
            "Cache-Control": "no-store",
          },
        });
      const report = summary(rows, month),
        doc = await PDFDocument.create(),
        page = doc.addPage([595, 842]),
        font = await doc.embedFont(StandardFonts.Helvetica),
        bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const line = (text: string, y: number, size = 12) =>
        page.drawText(text, {
          x: 48,
          y,
          size,
          font,
          color: rgb(0.12, 0.16, 0.24),
        });
      page.drawText("FinPilot AI", {
        x: 48,
        y: 780,
        size: 28,
        font: bold,
        color: rgb(0.25, 0.31, 0.85),
      });
      line("Your money, understood.", 754);
      line(`Monthly summary | ${month}`, 710, 18);
      line("SYNTHETIC SANDBOX DATA - No real bank connections", 682, 10);
      line(`Income: ${money(report.income)}`, 635);
      line(`Expenses: ${money(report.expenses)}`, 610);
      line(`Net savings: ${money(report.savings)}`, 585);
      report.byCategory.forEach((c, i) =>
        line(`${c.category}: ${money(c.amount)}`, 530 - i * 27),
      );
      line(
        `${rows.length} transactions. Generated ${new Date().toISOString().slice(0, 10)} (UTC).`,
        110,
        10,
      );
      line(
        "Educational demonstration; not personalized financial advice.",
        88,
        10,
      );
      return new Response(Buffer.from(await doc.save()), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="finpilot-${month}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }
    throw new AppError(404, "Endpoint not found");
  } catch (e) {
    if (e instanceof z.ZodError)
      return json(
        {
          error: e.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
          correlationId,
        },
        400,
      );
    if (e instanceof AppError)
      return json({ error: e.message, correlationId }, e.status);
    console.error(
      JSON.stringify({
        level: "error",
        correlationId,
        event: "request_failed",
        type: e instanceof Error ? e.name : "Unknown",
      }),
    );
    return json(
      {
        error: "Something went wrong. Please retry; your data is safe.",
        correlationId,
      },
      500,
    );
  }
}
