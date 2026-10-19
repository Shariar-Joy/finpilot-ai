import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { createUser, disconnect, findUser, persistent } from "../src/lib/store";
import { seedLedger } from "../src/lib/seed";
import { passwordSchema } from "../src/lib/credentials";
async function main() {
  const ledger = seedLedger();
  if (!persistent) {
    console.log(
      `Demo seed verified: ${ledger.transactions.length} synthetic transactions spanning 90 days. In-memory mode seeds each new demo session; this CLI does not persist state.`,
    );
    return;
  }
  const parsedPassword = passwordSchema.safeParse(process.env.DEMO_PASSWORD);
  if (!parsedPassword.success)
    throw new Error(
      "Set DEMO_PASSWORD (12+ characters, at most 72 UTF-8 bytes) to seed PostgreSQL",
    );
  const password = parsedPassword.data;
  if (await findUser("demo@finpilot.local")) {
    console.log("Demo account already exists; no data overwritten.");
    return;
  }
  await createUser(
    {
      id: randomUUID(),
      name: "Alex Morgan",
      email: "demo@finpilot.local",
      passwordHash: await hash(password, 12),
    },
    ledger,
  );
  console.log(
    `Seeded demo@finpilot.local with ${ledger.transactions.length} synthetic transactions. Password comes from DEMO_PASSWORD.`,
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(disconnect);
