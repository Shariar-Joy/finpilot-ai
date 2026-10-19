import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  Compass,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { DemoButton } from "@/components/auth";
export default function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Compass size={23} />
          </span>
          finpilot<span className="brand-ai">AI</span>
        </Link>
        <div className="landing-links">
          <a href="#how-it-works">How it works</a>
          <span className="badge mint">
            <span className="dot" />
            Synthetic sandbox
          </span>
          <Link href="/login" className="btn secondary">
            Sign in <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} /> A little clarity. A lot more possibility.
          </div>
          <h1>
            Make sense of
            <br />
            your money.
            <br />
            <span>Make room for life.</span>
          </h1>
          <p>
            Meet the financial copilot that connects the dots, explains the why,
            and helps you take the next step. Always with you in control.
          </p>
          <div className="hero-actions">
            <DemoButton />
            <Link href="/register" className="btn secondary">
              Create an account <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <ShieldCheck size={16} /> Explore 90 days of synthetic data. No bank
            connection.
          </div>
        </div>
        <div className="hero-product">
          <div className="preview-top">
            <div className="preview-dot" />
            <div className="preview-dot" />
            <div className="preview-dot" />
            <span>YOUR FINANCIAL PICTURE</span>
          </div>
          <div className="preview-body">
            <div className="row between">
              <span className="muted">This month’s net savings</span>
              <Wallet size={20} />
            </div>
            <strong className="preview-number">
              More clarity.
              <br />
              Less guesswork.
            </strong>
            <div className="preview-chart">
              {[32, 48, 35, 60, 50, 76, 64, 82, 74, 93, 88, 100].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="preview-insight">
              <span className="sparkle-box">
                <Sparkles size={22} />
              </span>
              <div>
                <strong>Turn a question into a plan.</strong>
                <p>
                  Understand spending. Review a proposal.
                  <br />
                  Approve only what works for you.
                </p>
              </div>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="landing-features">
        {[
          {
            icon: ChartNoAxesCombined,
            title: "See the whole picture",
            text: "Transactions, budgets, recurring bills. One calm place to understand it all.",
          },
          {
            icon: Sparkles,
            title: "Ask a better question",
            text: "An agent that uses real tools, shows its work, and cites your transactions.",
          },
          {
            icon: ShieldCheck,
            title: "Keep the final say",
            text: "Every agent change needs your approval. Every decision leaves an audit trail.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={25} />
            <h2>{title}</h2>
            <p>{text}</p>
            <span>
              <Check size={15} /> Built into your workspace
            </span>
          </article>
        ))}
      </section>
      <footer className="landing-footer">
        <span>FinPilot AI · Your money, understood.</span>
        <span>2026 FinTech Competition · Topic A · Sandbox demonstration</span>
      </footer>
    </main>
  );
}
