import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { sealData, unsealData } from "iron-session";
import { parse, serialize } from "cookie";
import {
  AppError,
  type Audit,
  type Change,
  type Ledger,
  type PublicProposal,
} from "./domain";
import { deleteSession, readSession, saveSession, userById } from "./store";

const g = globalThis as typeof globalThis & {
  finpilotSecret?: string;
  finpilotLimits?: Map<string, { count: number; until: number }>;
};
function secret() {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (
    process.env.DATABASE_URL ||
    (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true")
  )
    throw new Error("SESSION_SECRET must be at least 32 characters");
  return (g.finpilotSecret ??= randomBytes(48).toString("hex"));
}
export const sha = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export const payloadHash = (payload: Change) => sha(canonical(payload));
const cookieName = "finpilot_session";
const ttl = 8 * 60 * 60;
export async function issueSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await saveSession(sha(token), userId, Date.now() + ttl * 1000);
  const value = await sealData({ token, userId }, { password: secret(), ttl });
  return serialize(cookieName, value, {
    httpOnly: true,
    secure: process.env.APP_ORIGIN?.startsWith("https://") ?? false,
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
}
export async function authenticate(request: Request) {
  const cookie = parse(request.headers.get("cookie") ?? "")[cookieName];
  if (!cookie) throw new AppError(401, "Please sign in to continue");
  const data = await unsealData<{ token?: string; userId?: string }>(cookie, {
    password: secret(),
    ttl,
  });
  if (!data.token || !data.userId)
    throw new AppError(401, "Session expired. Please sign in again");
  const session = await readSession(sha(data.token));
  if (!session || session.userId !== data.userId)
    throw new AppError(401, "Session expired. Please sign in again");
  const user = await userById(data.userId);
  if (!user) throw new AppError(401, "Session user not found");
  return { user, tokenHash: sha(data.token) };
}
export async function revokeSession(hash: string) {
  await deleteSession(hash);
  return serialize(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.APP_ORIGIN?.startsWith("https://") ?? false,
    path: "/",
    maxAge: 0,
  });
}
export function verifyOrigin(request: Request) {
  const url = new URL(request.url);
  const expected =
    process.env.APP_ORIGIN ??
    (request.headers.get("host")
      ? `${url.protocol}//${request.headers.get("host")}`
      : url.origin);
  if (request.headers.get("origin") !== expected)
    throw new AppError(403, "Request origin rejected");
}
export function rateLimit(key: string, max = 60, windowMs = 60_000) {
  const limits = (g.finpilotLimits ??= new Map());
  const now = Date.now();
  if (limits.size > 10000) {
    for (const [k, v] of limits) if (v.until <= now) limits.delete(k);
    if (limits.size > 10000)
      throw new AppError(429, "Service busy. Try again shortly");
  }
  const entry = limits.get(key);
  if (!entry || entry.until <= now) {
    limits.set(key, { count: 1, until: now + windowMs });
    return;
  }
  if (++entry.count > max)
    throw new AppError(429, "Too many requests. Please try again shortly");
}
export function audit(
  state: Ledger,
  actor: string,
  action: string,
  decision: Audit["decision"],
  correlationId: string,
  metadata: Audit["metadata"] = {},
) {
  const row: Audit = {
    id: randomUUID(),
    actor,
    action,
    decision,
    correlationId,
    timestamp: new Date().toISOString(),
    metadata,
  };
  state.audits.push(row);
  return row;
}
export function propose(
  state: Ledger,
  userId: string,
  payload: Change,
  correlationId: string,
  now = Date.now(),
): PublicProposal {
  if (
    state.approvals.filter((p) => p.status === "pending" && p.expiresAt > now)
      .length >= 20
  )
    throw new AppError(409, "Resolve pending proposals first");
  const token = randomBytes(32).toString("hex"),
    id = randomUUID(),
    expiresAt = now + 5 * 60_000;
  state.approvals.push({
    id,
    userId,
    payload,
    hash: payloadHash(payload),
    tokenHash: sha(token),
    expiresAt,
    status: "pending",
  });
  audit(
    state,
    userId,
    payload.kind === "budget"
      ? "propose_budget_change"
      : "propose_bill_reminder",
    "proposed",
    correlationId,
    { proposalId: id, payloadHash: payloadHash(payload) },
  );
  return { id, token, payload, expiresAt, status: "pending" };
}
export function decide(
  state: Ledger,
  userId: string,
  id: string,
  token: string,
  payload: Change,
  approve: boolean,
  correlationId: string,
  now = Date.now(),
) {
  const started = performance.now();
  const record = state.approvals.find((p) => p.id === id);
  const tokenHash = sha(token);
  if (
    !record ||
    record.userId !== userId ||
    record.status !== "pending" ||
    record.expiresAt <= now ||
    record.hash !== payloadHash(payload) ||
    !timingSafeEqual(Buffer.from(record.tokenHash), Buffer.from(tokenHash))
  )
    throw new AppError(
      403,
      "Approval is invalid, expired, modified, or already used",
    );
  record.status = approve ? "applied" : "rejected";
  if (approve && payload.kind === "budget") {
    const old = state.budgets.find(
      (b) => b.month === payload.month && b.category === payload.category,
    );
    if (old) {
      old.limit = payload.limit;
      old.threshold = payload.threshold;
    } else
      state.budgets.push({
        id: randomUUID(),
        category: payload.category,
        month: payload.month,
        limit: payload.limit,
        threshold: payload.threshold,
      });
  }
  if (approve && payload.kind === "reminder") {
    if (
      !state.reminders.some(
        (r) => r.merchant === payload.merchant && r.dueDate === payload.dueDate,
      )
    )
      state.reminders.push({
        id: randomUUID(),
        merchant: payload.merchant,
        dueDate: payload.dueDate,
        amount: payload.amount,
        done: false,
      });
  }
  const action =
    payload.kind === "budget" ? "apply_budget_change" : "apply_bill_reminder";
  for (const message of state.messages)
    for (const p of message.proposals ?? [])
      if (p.id === id) {
        p.status = record.status;
        message.tools?.push({
          name: action,
          tier: "mutate",
          durationMs: Math.max(
            0.01,
            Math.round((performance.now() - started) * 100) / 100,
          ),
          result: { decision: record.status, proposalId: id, correlationId },
        });
      }
  audit(
    state,
    userId,
    action,
    approve ? "approved" : "rejected",
    correlationId,
    { proposalId: id, payloadHash: record.hash },
  );
  return { status: record.status, action, payload };
}
