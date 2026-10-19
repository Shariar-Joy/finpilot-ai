import { afterEach, describe, expect, it, vi } from "vitest";
import { runAgent } from "../src/lib/agent";
import { seedLedger } from "../src/lib/seed";
import { summary, total } from "../src/lib/domain";
import { api, ApiError } from "../src/lib/client-api";
import { passwordSchema } from "../src/lib/credentials";
const now = new Date("2026-10-19T12:00:00Z");
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("review regression cases", () => {
  it("uses the same usable password policy for registration and seeding", () => {
    expect(passwordSchema.safeParse("a".repeat(72)).success).toBe(true);
    expect(passwordSchema.safeParse("short").success).toBe(false);
  });
  it("rejects passwords that fit the character limit but exceed bcrypt's byte limit", () => {
    expect(passwordSchema.safeParse("a".repeat(70) + "💰").success).toBe(false);
  });
  it("never substitutes the first bill for an unknown merchant", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const state = seedLedger(now);
    await expect(
      runAgent(state, "alice", "Create a reminder for Unknown Merchant", now),
    ).rejects.toThrow("matching recurring merchant");
    expect(state.reminders).toHaveLength(0);
    expect(state.approvals).toHaveLength(0);
  });
  it.each([
    "Set next month’s dining budget",
    "Set next month’s dining budget 20.5% lower",
    "Set next month’s dining budget -20% lower",
  ])(
    "asks for a supported reduction instead of guessing: %s",
    async (message) => {
      vi.stubEnv("OPENAI_API_KEY", "");
      const result = await runAgent(seedLedger(now), "alice", message, now);
      expect(result.proposals).toHaveLength(0);
      expect(result.message.text).toContain("specify a whole percentage");
    },
  );
  it("uses an explicit YYYY-MM month in deterministic read tools", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await runAgent(
      seedLedger(now),
      "alice",
      "Compare dining in 2026-08",
      now,
    );
    expect(
      result.message.tools!.find((t) => t.name === "get_spending_summary")!
        .result,
    ).toMatchObject({ month: "2026-08" });
  });
  it("grounds a provider summary in the requested month's actual tool result", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-provider-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          output: [
            {
              type: "function_call",
              name: "get_spending_summary",
              arguments: JSON.stringify({ month: "2026-08" }),
            },
          ],
        }),
      ),
    );
    const state = seedLedger(now),
      result = await runAgent(state, "alice", "Summarize August", now);
    const expected = summary(state.transactions, "2026-08");
    expect(result.message.text).toContain("For 2026-08:");
    expect(result.message.text).toContain(`${expected.count} transactions`);
  });
  it("rejects noninteger inputs even if their sum happens to be an integer", () =>
    expect(() => total([0.1, 0.9])).toThrow("integer minor units"));
  it("converts transport errors to a safe actionable client error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("raw internal transport detail")),
    );
    await expect(api("me")).rejects.toThrow("Could not reach the server");
  });
  it("handles HTML proxy errors without exposing their content", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html>internal details</html>", { status: 502 }),
        ),
    );
    await expect(api("me")).rejects.toThrow("unexpected response");
  });
  it("preserves HTTP status for reliable session redirects", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "expired" }, { status: 401 }),
        ),
    );
    try {
      await api("me");
      throw new Error("Expected failure");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(401);
    }
  });
});
