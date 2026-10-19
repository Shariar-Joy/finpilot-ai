"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/client-api";
export function DemoButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <button
        className={`btn ${compact ? "secondary" : "primary"}`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await api("auth/demo", {});
            sessionStorage.removeItem("finpilot-approvals");
            router.replace("/dashboard");
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        <Sparkles size={17} />
        {busy
          ? "Preparing your workspace…"
          : compact
            ? "Try the demo"
            : "Explore the live demo"}
        <ArrowRight size={17} />
      </button>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
export function Auth({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <main className="auth-page">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <Compass size={23} />
        </span>
        finpilot<span className="brand-ai">AI</span>
      </Link>
      <section className="auth-card">
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>{register ? "A clearer financial future." : "Welcome back."}</h1>
        <p className="muted">
          {register
            ? "Create a sandbox account to explore your money."
            : "Your financial picture, ready when you are."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const f = new FormData(e.currentTarget);
            try {
              await api(register ? "auth/register" : "auth/login", {
                email: f.get("email"),
                password: f.get("password"),
                ...(register ? { name: f.get("name") } : {}),
              });
              sessionStorage.removeItem("finpilot-approvals");
              router.replace("/dashboard");
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          {register && (
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={60}
                required
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={12}
              maxLength={72}
              required
              placeholder="At least 12 characters"
            />
          </label>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <button disabled={busy} className="btn primary full">
            {busy ? "One moment…" : register ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-divider">
          <span />
          or explore first
          <span />
        </div>
        <DemoButton compact />
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to FinPilot?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <div className="info-note">
          <ShieldCheck size={17} />
          All accounts use synthetic sandbox data. No real bank connections or
          transfers.
        </div>
      </section>
    </main>
  );
}
