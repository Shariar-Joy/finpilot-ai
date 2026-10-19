import { PrismaClient, Prisma } from "@prisma/client";
import { AppError, type Ledger, type User } from "./domain";

type Memory = {
  users: Map<string, User>;
  ledgers: Map<string, Ledger>;
  sessions: Map<string, { userId: string; expiresAt: number }>;
  lock: Promise<unknown>;
};
type Globals = typeof globalThis & {
  finpilotMemory?: Memory;
  finpilotPrisma?: PrismaClient;
};
const g = globalThis as Globals;
const memory = (g.finpilotMemory ??= {
  users: new Map(),
  ledgers: new Map(),
  sessions: new Map(),
  lock: Promise.resolve(),
});
export const persistent = !!process.env.DATABASE_URL;
export function ensureStorageConfigured() {
  if (
    !persistent &&
    process.env.NODE_ENV === "production" &&
    process.env.DEMO_MODE !== "true"
  )
    throw new AppError(
      503,
      "Set DATABASE_URL or explicitly enable ephemeral storage with DEMO_MODE=true",
    );
  if (
    process.env.NODE_ENV === "production" &&
    process.env.DEMO_MODE !== "true" &&
    !process.env.APP_ORIGIN?.startsWith("https://")
  )
    throw new AppError(503, "Production requires an HTTPS APP_ORIGIN");
}
const prisma = persistent ? (g.finpilotPrisma ??= new PrismaClient()) : null;
export async function createUser(user: User, ledger: Ledger) {
  if (prisma) {
    try {
      await prisma.user.create({
        data: {
          ...user,
          ledger: {
            create: { data: ledger as unknown as Prisma.InputJsonValue },
          },
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      )
        throw new AppError(409, "Email already registered");
      throw e;
    }
  } else {
    if ([...memory.users.values()].some((u) => u.email === user.email))
      throw new AppError(409, "Email already registered");
    if (memory.users.size >= 500)
      throw new AppError(503, "Demo capacity reached; restart the demo server");
    memory.users.set(user.id, structuredClone(user));
    memory.ledgers.set(user.id, structuredClone(ledger));
  }
}
export async function findUser(email: string) {
  return prisma
    ? prisma.user.findUnique({ where: { email } })
    : ([...memory.users.values()].find((u) => u.email === email) ?? null);
}
export async function userById(id: string) {
  return prisma
    ? prisma.user.findUnique({ where: { id } })
    : (memory.users.get(id) ?? null);
}
export async function saveSession(
  tokenHash: string,
  userId: string,
  expiresAt: number,
) {
  if (prisma)
    await prisma.session.create({
      data: { tokenHash, userId, expiresAt: new Date(expiresAt) },
    });
  else memory.sessions.set(tokenHash, { userId, expiresAt });
}
export async function readSession(tokenHash: string) {
  const s = prisma
    ? await prisma.session.findUnique({ where: { tokenHash } })
    : memory.sessions.get(tokenHash);
  return s && Number(s.expiresAt) > Date.now() ? s : null;
}
export async function deleteSession(tokenHash: string) {
  if (prisma) await prisma.session.deleteMany({ where: { tokenHash } });
  else memory.sessions.delete(tokenHash);
}
export async function readLedger(userId: string): Promise<Ledger> {
  const s = prisma
    ? ((await prisma.ledger.findUnique({ where: { userId } }))
        ?.data as unknown as Ledger)
    : memory.ledgers.get(userId);
  if (!s) throw new AppError(404, "Workspace not found");
  return structuredClone(s);
}
// All mutations work on an isolated copy. Exceptions discard the copy, including partial CSV imports.
export async function mutateLedger<T>(
  userId: string,
  fn: (ledger: Ledger) => T,
): Promise<T> {
  if (prisma) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const record = await prisma.ledger.findUnique({ where: { userId } });
      if (!record) throw new AppError(404, "Workspace not found");
      const state = structuredClone(record.data) as unknown as Ledger;
      const result = fn(state);
      const update = await prisma.ledger.updateMany({
        where: { userId, version: record.version },
        data: {
          data: state as unknown as Prisma.InputJsonValue,
          version: { increment: 1 },
        },
      });
      if (update.count === 1) return result;
    }
    throw new AppError(409, "Workspace changed concurrently. Please retry.");
  }
  const operation = memory.lock.then(() => {
    const old = memory.ledgers.get(userId);
    if (!old) throw new AppError(404, "Workspace not found");
    const next = structuredClone(old);
    const result = fn(next);
    memory.ledgers.set(userId, next);
    return result;
  });
  memory.lock = operation.catch(() => undefined);
  return operation;
}
export async function disconnect() {
  await prisma?.$disconnect();
}
