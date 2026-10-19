"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Compass,
  CreditCard,
  Download,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Utensils,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { api, ApiError } from "@/lib/client-api";
import {
  categories,
  monthOf,
  money,
  shiftMonth,
  toCents,
  type Audit,
  type Budget,
  type ChatMessage,
  type PublicProposal,
  type Reminder,
  type Transaction,
} from "@/lib/domain";
import type { anomalies, budgetStatus, recurring, summary } from "@/lib/domain";

type Data = {
  transactions: Transaction[];
  budgets: ReturnType<typeof budgetStatus>;
  allBudgets: Budget[];
  reminders: Reminder[];
  bills: ReturnType<typeof recurring>;
  anomalies: ReturnType<typeof anomalies>;
  summary: ReturnType<typeof summary>;
  audits: Audit[];
  messages: ChatMessage[];
  seededAt: string;
};
type Me = {
  user: { id: string; name: string; email: string };
  storage: string;
  agent: string;
  analytics: boolean;
};
const nav: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowDownLeft },
  { id: "budgets", label: "Budgets", icon: Target },
  { id: "bills", label: "Bills & subscriptions", icon: CreditCard },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "agent", label: "AI copilot", icon: Sparkles },
  { id: "activity", label: "Activity & audit", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];
const colors = [
  "#a69bff",
  "#74dfc4",
  "#72a7ed",
  "#f3bf79",
  "#e69fc8",
  "#8ed6e1",
  "#b3ca80",
  "#8d96b1",
  "#c2b1d5",
];
const monthLabel = (m: string) =>
  new Date(m + "-01T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
function CategoryIcon({ category }: { category: string }) {
  const Icon =
    category === "Dining"
      ? Utensils
      : category === "Income"
        ? ArrowDownLeft
        : category === "Housing"
          ? Wallet
          : CreditCard;
  return (
    <span className={`category-icon cat-${category.toLowerCase()}`}>
      <Icon size={17} />
    </span>
  );
}
function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Compass size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button
          aria-label="Close dialog"
          className="icon-button"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function TransactionTable({
  rows,
  onEdit,
  compact = false,
}: {
  rows: Transaction[];
  onEdit: (t: Transaction) => void;
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date (UTC)</th>
            <th className="number">Amount</th>
            {!compact && (
              <th>
                <span className="sr-only">Edit</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} id={t.id}>
              <td>
                <div className="row">
                  <CategoryIcon category={t.category} />
                  <div>
                    <strong>{t.merchant}</strong>
                    <span className="transaction-id">{t.id}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="category-label">{t.category}</span>
              </td>
              <td className="muted nowrap">
                {new Date(t.date + "T12:00:00Z").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </td>
              <td className={`number amount ${t.amount > 0 ? "positive" : ""}`}>
                {t.amount > 0 ? "+" : "−"}
                {money(Math.abs(t.amount))}
              </td>
              {!compact && (
                <td>
                  <button
                    className="text-button"
                    onClick={() => onEdit(t)}
                    aria-label={`Edit category for ${t.merchant}`}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <Empty
          title="No matching transactions"
          text="Try a different search, category, or month."
        />
      )}
    </div>
  );
}
export function FinanceApp({ section }: { section: string }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null),
    [data, setData] = useState<Data | null>(null),
    [month, setMonth] = useState(monthOf()),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [chatBusy, setChatBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [page, setPage] = useState(1),
    [chat, setChat] = useState("");
  const [modal, setModal] = useState<
      "import" | "budget" | "transaction" | "delete" | null
    >(null),
    [editingBudget, setEditingBudget] = useState<Budget | null>(null),
    [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
      null,
    ),
    [csv, setCsv] = useState(""),
    [preview, setPreview] = useState<{
      rows: Transaction[];
      duplicates: number;
      total: number;
    } | null>(null),
    [modalError, setModalError] = useState("");
  const [python, setPython] = useState<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
    count: number;
  } | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const messagesEnd = useRef<HTMLDivElement>(null);
  const refresh = useCallback(async () => {
    const result = await api<Data>(`data?month=${month}`);
    setData(result);
  }, [month]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    let active = true;
    api<Me>("me")
      .then((v) => {
        if (active) {
          setMe(v);
          setTheme(localStorage.getItem("finpilot-theme") ?? "dark");
          try {
            setTokens(
              JSON.parse(sessionStorage.getItem("finpilot-approvals") ?? "{}"),
            );
          } catch {}
        }
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace("/login");
        else if (active) setError((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, [router]);
  useEffect(() => {
    if (!me) return;
    let active = true;
    api<Data>(`data?month=${month}`)
      .then((v) => {
        if (active) {
          setData(v);
          const reference = window.location.hash.slice(1);
          if (section === "transactions" && reference) {
            const t = v.transactions.find((t) => t.id === reference);
            if (t) {
              setSearch(reference);
              setMonth(t.date.slice(0, 7));
            }
          }
        }
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, [me, month, section]);
  useEffect(() => {
    if (section === "agent" && data?.messages.length)
      messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.messages.length, section]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(id);
  }, [notice]);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("finpilot-theme", next);
  }
  function openModal(kind: typeof modal) {
    setModalError("");
    setModal(kind);
  }
  async function action(fn: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
      setNotice(success);
      setModal(null);
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      setModalError(message);
    } finally {
      setBusy(false);
    }
  }
  async function sendChat(message: string) {
    if (!message.trim() || chatBusy) return;
    setChatBusy(true);
    setError("");
    setChat("");
    try {
      const result = await api<{ proposals: PublicProposal[] }>("agent", {
        message,
      });
      setTokens((old) => {
        const next = {
          ...old,
          ...Object.fromEntries(result.proposals.map((p) => [p.id, p.token])),
        };
        sessionStorage.setItem("finpilot-approvals", JSON.stringify(next));
        return next;
      });
      await refresh();
      if (section !== "agent") router.push("/agent");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChatBusy(false);
    }
  }
  async function decision(p: Omit<PublicProposal, "token">, approve: boolean) {
    await action(
      async () => {
        await api("approvals", {
          id: p.id,
          token: tokens[p.id] ?? "",
          payload: p.payload,
          approve,
        });
        setTokens((old) => {
          const next = { ...old };
          delete next[p.id];
          sessionStorage.setItem("finpilot-approvals", JSON.stringify(next));
          return next;
        });
      },
      approve
        ? "Approved. The change is saved and recorded in your audit log."
        : "Proposal rejected. Your financial data is unchanged.",
    );
  }
  const golden =
    "Why did I spend more on dining this month? Set next month’s dining budget 20% below this month’s dining spending.";
  const currentNav = nav.find((n) => n.id === section)!;
  if (!data || !me)
    return (
      <main className="loading-screen">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              className="btn secondary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <Link href="/login">Return to sign in</Link>
          </>
        ) : (
          <>
            <span className="spinner" />
            <h2>Bringing your money into focus…</h2>
            <p className="muted">Preparing your synthetic sandbox workspace.</p>
          </>
        )}
      </main>
    );
  const summary = data.summary;
  const sorted = [...data.transactions].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const filtered = sorted.filter(
    (t) =>
      t.date.startsWith(month) &&
      (category === "All" || t.category === category) &&
      `${t.merchant} ${t.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const chart = Array.from(
    {
      length: new Date(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)),
        0,
      ).getDate(),
    },
    (_, i) => {
      const day = i + 1;
      const sum = (m: string) =>
        -data.transactions
          .filter(
            (t) =>
              t.date.startsWith(m) &&
              Number(t.date.slice(8)) <= day &&
              t.amount < 0,
          )
          .reduce((a, t) => a + t.amount, 0) / 100;
      return {
        day,
        current:
          month === monthOf() && day > new Date().getUTCDate()
            ? null
            : sum(month),
        previous: sum(shiftMonth(month, -1)),
      };
    },
  );
  const statCards = [
    {
      label: "Total income",
      amount: summary.income,
      icon: ArrowDownLeft,
      detail: `${data.transactions.filter((t) => t.date.startsWith(month) && t.amount > 0).length} income transactions`,
      color: "mint",
    },
    {
      label: "Total spending",
      amount: summary.expenses,
      icon: ArrowUpRight,
      detail: `${summary.count} transactions this month`,
      color: "purple",
    },
    {
      label: "Net savings",
      amount: summary.savings,
      icon: Wallet,
      detail: summary.income
        ? `${Math.round((summary.savings * 100) / summary.income)}% of income kept`
        : "No income recorded",
      color: "blue",
    },
  ];
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">
            <Compass size={23} />
          </span>
          finpilot<span className="brand-ai">AI</span>
        </Link>
        <div className="workspace-picker">
          <span className="workspace-icon">A</span>
          <div>
            <strong>Personal workspace</strong>
            <small>Synthetic demo account</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.slice(0, 6).map(({ id, label, icon: Icon }) => (
            <Link
              onClick={() => setMobile(false)}
              href={`/${id}`}
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              aria-current={section === id ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "agent" && <span className="nav-new">AI</span>}
            </Link>
          ))}
        </nav>
        <div className="nav-label second">MANAGE</div>
        <nav aria-label="Account navigation">
          {nav.slice(6).map(({ id, label, icon: Icon }) => (
            <Link
              onClick={() => setMobile(false)}
              href={`/${id}`}
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              aria-current={section === id ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sandbox-card">
            <span className="row">
              <FlaskConical size={17} />
              <strong>A safe space to explore</strong>
            </span>
            <p>
              All data is synthetic.
              <br />
              Every decision stays yours.
            </p>
            <span className="badge mint">
              <span className="dot" />
              Sandbox mode
            </span>
          </div>
          <Link href="/settings" className="profile">
            <span className="avatar">{me.user.name.slice(0, 1)}</span>
            <span>
              <strong>{me.user.name}</strong>
              <small>Personal account</small>
            </span>
            <ChevronRight size={17} />
          </Link>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="row">
            <button
              aria-label="Open navigation"
              className="icon-button mobile-menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Workspace <ChevronRight size={13} />{" "}
              <strong>{currentNav.label}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <Link href="/transactions" className="search-link">
              <Search size={16} />
              <span>Find a transaction</span>
            </Link>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              href="/bills"
              aria-label="View bill reminders"
              className="icon-button notification"
            >
              <Bell size={18} />
              {data.reminders.some((r) => !r.done) && <span />}
            </Link>
            <Link
              href="/settings"
              className="avatar small"
              aria-label="Account settings"
            >
              {me.user.name.slice(0, 1)}
            </Link>
          </div>
        </header>
        <main id="main" className={`main-content page-${section}`}>
          <div className="page-header">
            <div>
              <div className="eyebrow small-eyebrow">
                YOUR MONEY, UNDERSTOOD.
              </div>
              <h1>
                {section === "dashboard"
                  ? `Looking good, ${me.user.name.split(" ")[0]}.`
                  : currentNav.label}
                {section === "dashboard" && <span className="greeting-dot" />}
              </h1>
              <p>
                {
                  (
                    {
                      dashboard:
                        "Here’s the big picture. Let’s make your next move a good one.",
                      transactions: "Every little detail, all in one place.",
                      budgets:
                        "Give your money a direction. Leave room for what matters.",
                      bills: "Fewer surprises. A little more peace of mind.",
                      insights: "Connect the dots behind your spending.",
                      agent:
                        "Ask a question. See the work. You make the final call.",
                      activity:
                        "A transparent record of every meaningful action.",
                      settings: "Your workspace, on your terms.",
                    } as Record<string, string>
                  )[section]
                }
              </p>
            </div>
            <div className="page-header-actions">
              {["dashboard", "transactions", "budgets"].includes(section) && (
                <label className="month-picker">
                  <span className="sr-only">Selected month</span>
                  <input
                    aria-label="Selected month"
                    type="month"
                    min="2000-01"
                    max="2099-12"
                    value={month}
                    onChange={(e) => {
                      if (e.target.value) {
                        setMonth(e.target.value);
                        setPage(1);
                      }
                    }}
                  />
                </label>
              )}
              {section === "dashboard" && (
                <a
                  className="btn secondary"
                  href={`/api/export/pdf?month=${month}`}
                >
                  <Download size={16} />
                  Export report
                </a>
              )}
              {section === "transactions" && (
                <button
                  className="btn primary"
                  onClick={() => {
                    setCsv("");
                    setPreview(null);
                    openModal("import");
                  }}
                >
                  <Upload size={16} />
                  Import CSV
                </button>
              )}
              {section === "budgets" && (
                <button
                  className="btn primary"
                  onClick={() => {
                    setEditingBudget(null);
                    openModal("budget");
                  }}
                >
                  <Plus size={17} />
                  New budget
                </button>
              )}
            </div>
          </div>
          <div className="sandbox-strip">
            <span>
              <FlaskConical size={14} /> SYNTHETIC DATA <i />{" "}
              {monthLabel(month)} · USD
            </span>
            <span className="storage-label">{me.storage}</span>
          </div>
          {error && (
            <div role="alert" className="alert error">
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="alert success">
              <Check size={17} />
              {notice}
            </div>
          )}
          {section === "dashboard" && (
            <>
              <div className="stat-grid">
                {statCards.map(
                  ({ label, amount, icon: Icon, detail, color }) => (
                    <article className="stat-card" key={label}>
                      <div className="row between">
                        <span>{label}</span>
                        <span className={`stat-icon ${color}`}>
                          <Icon size={18} />
                        </span>
                      </div>
                      <strong className="stat-number">{money(amount)}</strong>
                      <div className="stat-detail">
                        <span className={`tiny-dot ${color}`} />
                        {detail}
                      </div>
                    </article>
                  ),
                )}
              </div>
              <div className="dashboard-grid">
                <section className="panel spending-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Spending over time</h2>
                      <p>A little perspective on your daily outflow.</p>
                    </div>
                    <span className="badge neutral">Cumulative</span>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i style={{ background: colors[0] }} />
                      {monthLabel(month).split(" ")[0]}
                    </span>
                    <span>
                      <i className="dashed" />
                      {monthLabel(shiftMonth(month, -1)).split(" ")[0]}
                    </span>
                    <strong>{money(summary.expenses)}</strong>
                  </div>
                  <div className="area-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chart}
                        margin={{ top: 15, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="spendingGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#a69bff"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="100%"
                              stopColor="#a69bff"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 5"
                          vertical={false}
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "var(--muted)" }}
                          minTickGap={28}
                          tickFormatter={(v) => `${String(v).padStart(2, "0")}`}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "var(--muted)" }}
                          width={52}
                          tickFormatter={(v) =>
                            `$${v >= 1000 ? `${v / 1000}k` : v}`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--panel)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            color: "var(--text)",
                          }}
                          formatter={(v) => [`$${Number(v).toFixed(2)}`]}
                          labelFormatter={(v) => `Day ${v}`}
                        />
                        <Area
                          isAnimationActive={false}
                          dataKey="previous"
                          name="Prior month"
                          stroke="#596276"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="transparent"
                        />
                        <Area
                          isAnimationActive={false}
                          dataKey="current"
                          name="Selected month"
                          stroke="#a69bff"
                          strokeWidth={2.5}
                          fill="url(#spendingGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer">
                    <ShieldCheck size={14} /> Calculated from your recorded
                    transactions · Current month ends today (UTC)
                  </div>
                </section>
                <section className="panel category-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Where it went</h2>
                      <p>Spending by category</p>
                    </div>
                    <Link
                      href="/insights"
                      className="icon-button"
                      aria-label="View spending insights"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  {summary.byCategory.length ? (
                    <>
                      <div className="donut-wrap">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              isAnimationActive={false}
                              data={summary.byCategory}
                              dataKey="amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              innerRadius={58}
                              outerRadius={76}
                              paddingAngle={4}
                              stroke="none"
                            >
                              {summary.byCategory.map((c, i) => (
                                <Cell
                                  key={c.category}
                                  fill={colors[i % colors.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v) => money(Number(v))}
                              contentStyle={{
                                background: "var(--panel)",
                                border: "1px solid var(--border)",
                                borderRadius: 10,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center">
                          <small>Total spent</small>
                          <strong>{money(summary.expenses)}</strong>
                        </div>
                      </div>
                      <div className="category-legend">
                        {summary.byCategory.slice(0, 4).map((c, i) => (
                          <div className="row between" key={c.category}>
                            <span>
                              <i style={{ background: colors[i] }} />
                              {c.category}
                            </span>
                            <strong>
                              {Math.round((c.amount * 100) / summary.expenses)}%{" "}
                              <small>{money(c.amount)}</small>
                            </strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Empty
                      title="A fresh month"
                      text="Import transactions to see your spending mix."
                    />
                  )}
                </section>
              </div>
              <div className="copilot-banner">
                <span className="copilot-orb">
                  <Sparkles size={25} />
                </span>
                <div>
                  <span className="eyebrow">
                    A SMALL INSIGHT. A SMARTER NEXT STEP.
                  </span>
                  <h2>Your spending has a story. Let’s understand it.</h2>
                  <p>
                    Ask why dining changed this month, then build a budget with
                    your copilot.
                  </p>
                </div>
                <button
                  className="btn lavender"
                  disabled={chatBusy}
                  onClick={() => sendChat(golden)}
                >
                  Ask your copilot <ArrowRight size={17} />
                </button>
              </div>
              <div className="dashboard-bottom">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent transactions</h2>
                      <p>The latest pieces of your financial picture.</p>
                    </div>
                    <Link href="/transactions" className="text-button">
                      View all <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <TransactionTable
                    compact
                    rows={sorted.slice(0, 5)}
                    onEdit={() => {}}
                  />
                </section>
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Budget check-in</h2>
                      <p>Little limits. Bigger possibilities.</p>
                    </div>
                    <Link
                      href="/budgets"
                      className="icon-button"
                      aria-label="View budgets"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  <div className="budget-mini-list">
                    {data.budgets.slice(0, 4).map((b) => (
                      <div key={b.id} className="budget-mini">
                        <div className="row between">
                          <span>{b.category}</span>
                          <span>
                            <strong>{money(b.spent)}</strong>
                            <small> / {money(b.limit)}</small>
                          </span>
                        </div>
                        <div className="progress">
                          <span
                            style={{ width: `${Math.min(100, b.percent)}%` }}
                            className={
                              b.percent >= 100 ? "over" : b.alert ? "near" : ""
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {!data.budgets.length && (
                      <Empty
                        title="Set your first intention"
                        text="Create a monthly category budget."
                      />
                    )}
                  </div>
                  <Link href="/budgets" className="panel-footer-link">
                    Make room for your goals <ArrowRight size={15} />
                  </Link>
                </section>
              </div>
            </>
          )}
          {section === "transactions" && (
            <section className="panel">
              <div className="filter-bar">
                <label className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search transactions"
                    placeholder="Search merchant or transaction ID…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <label>
                  <span className="sr-only">Filter by category</span>
                  <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    {["All", ...categories].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <a
                  className="btn secondary"
                  href={`/api/export/csv?month=${month}`}
                >
                  <ArrowDownToLine size={16} />
                  Export CSV
                </a>
              </div>
              <TransactionTable
                rows={filtered.slice((page - 1) * 15, page * 15)}
                onEdit={(t) => {
                  setEditingTransaction(t);
                  openModal("transaction");
                }}
              />
              <div className="pagination">
                <span>
                  {filtered.length} synthetic transactions · {monthLabel(month)}
                </span>
                <div className="row">
                  <button
                    className="btn secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    {page} / {Math.max(1, Math.ceil(filtered.length / 15))}
                  </span>
                  <button
                    className="btn secondary"
                    disabled={page * 15 >= filtered.length}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
          {section === "budgets" && (
            <>
              <div className="info-note">
                <Target size={18} />
                <span>
                  Monthly limits help you plan. Alerts begin at your chosen
                  threshold. Budgets are sandbox records and do not move money.
                </span>
              </div>
              <div className="budget-grid">
                {data.budgets.map((b) => (
                  <article className="panel budget-card" key={b.id}>
                    <div className="row between">
                      <CategoryIcon category={b.category} />
                      <span
                        className={`badge ${b.percent >= 100 ? "amber" : b.alert ? "purple" : "mint"}`}
                      >
                        {b.percent >= 100
                          ? "Over budget"
                          : b.alert
                            ? "Near your limit"
                            : "On track"}
                      </span>
                    </div>
                    <h2>{b.category}</h2>
                    <div className="budget-number">
                      <strong>{money(b.spent)}</strong>
                      <span>of {money(b.limit)}</span>
                    </div>
                    <div className="progress">
                      <span
                        className={
                          b.percent >= 100 ? "over" : b.alert ? "near" : ""
                        }
                        style={{ width: `${Math.min(100, b.percent)}%` }}
                      />
                    </div>
                    <div className="row between muted small-text">
                      <span>{b.percent}% used</span>
                      <span>Alert at {b.threshold}%</span>
                    </div>
                    <p className="budget-advice">
                      {b.percent >= 100
                        ? `You’re ${money(b.spent - b.limit)} over. Review recent purchases or adjust next month’s plan.`
                        : `${money(b.limit - b.spent)} left to spend this month.`}
                    </p>
                    <div className="row between">
                      <button
                        className="text-button"
                        onClick={() => {
                          setEditingBudget(b);
                          openModal("budget");
                        }}
                      >
                        Edit budget <ArrowRight size={14} />
                      </button>
                      <button
                        aria-label={`Delete ${b.category} budget`}
                        className="icon-button"
                        onClick={() => {
                          setEditingBudget(b);
                          openModal("delete");
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!data.budgets.length && (
                <Empty
                  title="A fresh plan starts here"
                  text="Create a budget for this month or let your copilot suggest one."
                  action={
                    <button
                      className="btn primary"
                      onClick={() => {
                        setEditingBudget(null);
                        openModal("budget");
                      }}
                    >
                      Create a budget
                    </button>
                  }
                />
              )}
            </>
          )}
          {section === "bills" && (
            <>
              <div className="stat-grid">
                <article className="stat-card">
                  <span>Estimated monthly recurring</span>
                  <strong className="stat-number">
                    {money(data.bills.reduce((a, b) => a + b.amount, 0))}
                  </strong>
                  <p className="muted">Inferred from your synthetic history</p>
                </article>
                <article className="stat-card">
                  <span>Recurring merchants</span>
                  <strong className="stat-number">{data.bills.length}</strong>
                  <p className="muted">
                    At least 3 consistent monthly payments
                  </p>
                </article>
                <article className="stat-card">
                  <span>Open in-app reminders</span>
                  <strong className="stat-number">
                    {data.reminders.filter((r) => !r.done).length}
                  </strong>
                  <p className="muted">No emails or payments are sent</p>
                </article>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Your recurring picture</h2>
                    <p>
                      Payments 25–35 days apart, within 15% of the median
                      amount.
                    </p>
                  </div>
                  <span className="badge purple">
                    Inferred · review before use
                  </span>
                </div>
                <div className="bill-list">
                  {data.bills.map((b) => (
                    <article className="bill-row" key={b.merchant}>
                      <CategoryIcon category="Subscriptions" />
                      <div className="bill-name">
                        <h3>{b.merchant}</h3>
                        <details>
                          <summary>
                            {b.evidence.length} transaction references
                          </summary>
                          <div className="evidence-list">
                            {b.evidence.map((id) => (
                              <Link key={id} href={`/transactions#${id}`}>
                                {id}
                              </Link>
                            ))}
                          </div>
                        </details>
                      </div>
                      <div>
                        <strong>{money(b.amount)}</strong>
                        <small>estimated / month</small>
                      </div>
                      <div className="bill-date">
                        <small>Next expected</small>
                        <strong>{b.dueDate}</strong>
                      </div>
                      <button
                        className="btn secondary"
                        disabled={chatBusy}
                        onClick={() =>
                          sendChat(
                            `Create an in-app reminder for ${b.merchant}`,
                          )
                        }
                      >
                        <Bell size={15} />
                        Set reminder
                      </button>
                    </article>
                  ))}
                </div>
                {!data.bills.length && (
                  <Empty
                    title="No recurring pattern yet"
                    text="At least three monthly payments are needed."
                  />
                )}
              </section>
              <section className="panel section-gap">
                <div className="panel-heading">
                  <div>
                    <h2>In-app reminders</h2>
                    <p>
                      Visible here whenever you open your workspace. Dates use
                      UTC.
                    </p>
                  </div>
                </div>
                {data.reminders.length ? (
                  <div className="reminder-list">
                    {data.reminders.map((r) => (
                      <div
                        className={`reminder ${r.done ? "done" : ""}`}
                        key={r.id}
                      >
                        <Bell size={20} />
                        <div>
                          <strong>{r.merchant}</strong>
                          <p>
                            {r.dueDate} · {money(r.amount)} ·{" "}
                            {r.done
                              ? "Completed"
                              : r.dueDate <=
                                  new Date().toISOString().slice(0, 10)
                                ? "Due now"
                                : "Upcoming"}
                          </p>
                        </div>
                        <button
                          className="btn secondary"
                          disabled={busy}
                          onClick={() =>
                            action(
                              () =>
                                api(
                                  `reminders/${r.id}`,
                                  { done: !r.done, confirmed: true },
                                  "PATCH",
                                ),
                              r.done
                                ? "Reminder reopened."
                                : "Reminder marked complete.",
                            )
                          }
                        >
                          {r.done ? "Reopen" : "Mark complete"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="One less thing to remember"
                    text="Choose a recurring bill, review the proposed reminder, and approve it in your copilot."
                  />
                )}
              </section>
            </>
          )}
          {section === "insights" && (
            <>
              <div className="insight-hero">
                <span className="copilot-orb">
                  <Lightbulb size={27} />
                </span>
                <div>
                  <span className="eyebrow">INSIGHTS WITH THE RECEIPTS</span>
                  <h2>Understand the pattern behind the purchase.</h2>
                  <p>
                    Transparent rules and transaction evidence. No black-box
                    risk scores.
                  </p>
                </div>
                <button
                  className="btn primary"
                  disabled={chatBusy}
                  onClick={() => sendChat("Explain my unusual spending")}
                >
                  Explore with copilot <ArrowRight size={16} />
                </button>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Unusual spending</h2>
                    <p>
                      Above $100 and 3× the prior category median, with at least
                      5 earlier purchases.
                    </p>
                  </div>
                  <span className="badge amber">Unusual, not fraud</span>
                </div>
                {data.anomalies.map((t) => (
                  <div className="anomaly-row" key={t.id}>
                    <CategoryIcon category={t.category} />
                    <div>
                      <h3>
                        {t.merchant}{" "}
                        <span className="badge neutral">{t.category}</span>
                      </h3>
                      <p>{t.reason}</p>
                      <Link
                        className="text-button"
                        href={`/transactions#${t.id}`}
                      >
                        Reference: {t.id} <ArrowUpRight size={13} />
                      </Link>
                    </div>
                    <strong className="nowrap">{money(-t.amount)}</strong>
                  </div>
                ))}
                {!data.anomalies.length && (
                  <Empty
                    title="Nothing outside the usual pattern"
                    text="No recorded purchase meets the transparent thresholds."
                  />
                )}
              </section>
              <div className="insight-cards">
                <article className="panel">
                  <TrendingUp size={24} />
                  <h2>Your savings snapshot</h2>
                  <p>
                    {summary.income
                      ? `${Math.round((summary.savings * 100) / summary.income)}% of your recorded income remains after expenses in ${monthLabel(month)}.`
                      : "No income is recorded for this month."}
                  </p>
                  <Link href="/budgets" className="text-button">
                    Plan your next month <ArrowRight size={14} />
                  </Link>
                </article>
                <article className="panel">
                  <CreditCard size={24} />
                  <h2>Review the recurring costs</h2>
                  <p>
                    {data.bills.length} merchants show a consistent monthly
                    pattern. Review subscriptions you no longer use before
                    adjusting your plan.
                  </p>
                  <Link href="/bills" className="text-button">
                    See recurring payments <ArrowRight size={14} />
                  </Link>
                </article>
              </div>
            </>
          )}
          {section === "agent" && (
            <div className="agent-layout">
              <section className="panel chat-panel">
                <div className="agent-header">
                  <span className="sparkle-box">
                    <Sparkles size={21} />
                  </span>
                  <div>
                    <h2>
                      FinPilot copilot <span className="dot" />
                    </h2>
                    <p>{me.agent}</p>
                  </div>
                  <span className="badge mint">
                    <ShieldCheck size={12} />
                    Approval protected
                  </span>
                </div>
                <div className="chat-messages" aria-live="polite">
                  {!data.messages.length && (
                    <div className="chat-welcome">
                      <span className="copilot-orb">
                        <Sparkles size={30} />
                      </span>
                      <h2>
                        A clearer picture starts
                        <br />
                        with a good question.
                      </h2>
                      <p>
                        I can explain your spending, find recurring bills,
                        <br />
                        and help you plan. You approve every change.
                      </p>
                      <div className="prompt-grid">
                        {[
                          "Why did I spend more on dining this month?",
                          "Analyze my recurring subscriptions",
                          "Explain my unusual spending",
                        ].map((p) => (
                          <button
                            key={p}
                            disabled={chatBusy}
                            onClick={() => sendChat(p)}
                          >
                            {p}
                            <ArrowUpRight size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.messages.map((m) => (
                    <article key={m.id} className={`chat-message ${m.role}`}>
                      <span
                        className={
                          m.role === "assistant"
                            ? "chat-avatar"
                            : "avatar small"
                        }
                      >
                        {m.role === "assistant" ? (
                          <Sparkles size={16} />
                        ) : (
                          me.user.name.slice(0, 1)
                        )}
                      </span>
                      <div className="message-content">
                        <span className="message-author">
                          {m.role === "assistant" ? "FinPilot" : "You"}
                          <small>
                            {new Date(m.timestamp).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </span>
                        <div className="message-text">{m.text}</div>
                        {m.tools && (
                          <div className="tool-timeline">
                            <span className="tool-label">
                              <Activity size={12} /> Tool execution · {m.mode}
                            </span>
                            {m.tools.map((t, i) => (
                              <details key={i} className="tool-event">
                                <summary>
                                  <CheckCheck size={14} />
                                  <code>{t.name}</code>
                                  <span
                                    className={`badge ${t.tier === "read" ? "neutral" : t.tier === "mutate" ? "mint" : "purple"}`}
                                  >
                                    {t.tier}
                                  </span>
                                  <small>{t.durationMs}ms</small>
                                  <ChevronDown size={12} />
                                </summary>
                                <pre>{JSON.stringify(t.result, null, 2)}</pre>
                              </details>
                            ))}
                          </div>
                        )}
                        {m.citations?.length ? (
                          <details className="citations">
                            <summary>
                              <FileText size={13} />
                              {m.citations.length} grounded transaction
                              references
                            </summary>
                            <div className="evidence-list">
                              {m.citations.map((id) => (
                                <Link key={id} href={`/transactions#${id}`}>
                                  {id}
                                </Link>
                              ))}
                            </div>
                          </details>
                        ) : null}
                        {m.proposals?.map((p) => (
                          <div
                            className={`proposal-card ${p.status}`}
                            key={p.id}
                          >
                            <div className="row between">
                              <span className="eyebrow">
                                <ShieldCheck size={14} /> YOUR APPROVAL REQUIRED
                              </span>
                              <span
                                className={`badge ${p.status === "applied" ? "mint" : p.status === "rejected" ? "amber" : "purple"}`}
                              >
                                {p.status === "applied"
                                  ? "Approved"
                                  : p.status === "rejected"
                                    ? "Rejected"
                                    : "Proposed"}
                              </span>
                            </div>
                            <h3>
                              {p.payload.kind === "budget"
                                ? `${p.payload.category} budget · ${monthLabel(p.payload.month)}`
                                : `Reminder · ${p.payload.merchant}`}
                            </h3>
                            <strong className="proposal-amount">
                              {money(
                                p.payload.kind === "budget"
                                  ? p.payload.limit
                                  : p.payload.amount,
                              )}
                            </strong>
                            <p>
                              {p.payload.kind === "budget"
                                ? `Monthly limit · alert at ${p.payload.threshold}%`
                                : `Due ${p.payload.dueDate} · in-app notification only`}
                            </p>
                            {p.status === "pending" ? (
                              <>
                                <p className="small-text muted">
                                  {p.expiresAt <= Date.now()
                                    ? "Expired. Ask for a new proposal."
                                    : `One-time approval expires at ${new Date(p.expiresAt).toLocaleTimeString()}.`}
                                </p>
                                {!tokens[p.id] && p.expiresAt > Date.now() && (
                                  <p className="small-text muted">
                                    Approval is available in the tab where this
                                    proposal was created. You can ask for a new
                                    one here.
                                  </p>
                                )}
                                <div className="row">
                                  <button
                                    className="btn primary"
                                    disabled={
                                      busy ||
                                      !tokens[p.id] ||
                                      p.expiresAt <= Date.now()
                                    }
                                    onClick={() => decision(p, true)}
                                  >
                                    <Check size={16} />
                                    Approve change
                                  </button>
                                  <button
                                    className="btn secondary"
                                    disabled={
                                      busy ||
                                      !tokens[p.id] ||
                                      p.expiresAt <= Date.now()
                                    }
                                    onClick={() => decision(p, false)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="proposal-result">
                                {p.status === "applied" ? (
                                  <>
                                    <CheckCheck size={16} />
                                    Applied and recorded in your audit log.
                                  </>
                                ) : (
                                  <>
                                    <X size={16} />
                                    Rejected. No financial data changed.
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                  {chatBusy && (
                    <div className="agent-thinking" role="status">
                      <LoaderCircle size={17} className="spin" />
                      Checking your ledger and running tools…
                    </div>
                  )}
                  <div ref={messagesEnd} />
                </div>
                <form
                  className="chat-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChat(chat);
                  }}
                >
                  <label className="sr-only" htmlFor="chat-input">
                    Ask your copilot
                  </label>
                  <input
                    id="chat-input"
                    placeholder="Ask about your money, or plan your next move…"
                    maxLength={2000}
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    disabled={chatBusy}
                  />
                  <button
                    aria-label="Send message"
                    disabled={chatBusy || !chat.trim()}
                    className="send-button"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="chat-disclaimer">
                  <ShieldCheck size={12} />
                  Synthetic data only. Deterministic calculations. You approve
                  every change.
                </div>
              </section>
              <aside className="agent-aside">
                <div className="demo-card">
                  <span className="badge purple">
                    <FlaskConical size={12} />
                    GUIDED DEMO
                  </span>
                  <h2>
                    From “why?”
                    <br />
                    to “what’s next?”
                  </h2>
                  <p>
                    Understand this month’s dining spending. Set next month’s
                    budget 20% lower.
                  </p>
                  <ol>
                    <li>Inspect the spending comparison</li>
                    <li>Review transaction evidence</li>
                    <li>Approve or reject the proposal</li>
                    <li>See the decision in your audit log</li>
                  </ol>
                  <button
                    className="btn primary full"
                    disabled={chatBusy}
                    onClick={() => sendChat(golden)}
                  >
                    <Sparkles size={16} />
                    Run demo scenario
                  </button>
                </div>
                <div className="agent-trust">
                  <ShieldCheck size={23} />
                  <h3>You’re in the pilot’s seat.</h3>
                  <p>
                    Read tools analyze your data. Propose tools prepare a
                    change. Mutation tools require your one-time approval.
                  </p>
                  <Link className="text-button" href="/activity">
                    Explore the audit trail <ArrowRight size={13} />
                  </Link>
                </div>
              </aside>
            </div>
          )}
          {section === "activity" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Your workspace, on the record</h2>
                  <p>
                    Actor, decision, timestamp, correlation ID. No passwords,
                    tokens, or chat text in audit metadata.
                  </p>
                </div>
                <span className="badge neutral">
                  {data.audits.length} events
                </span>
              </div>
              {data.audits.length ? (
                <div className="audit-list">
                  {data.audits.map((a) => (
                    <article className="audit-row" key={a.id}>
                      <span className={`audit-icon ${a.decision}`}>
                        <ShieldCheck size={18} />
                      </span>
                      <div>
                        <div className="row wrap">
                          <h3>{a.action.replaceAll("_", " ")}</h3>
                          <span
                            className={`badge ${a.decision === "denied" || a.decision === "rejected" ? "amber" : a.decision === "proposed" ? "purple" : "mint"}`}
                          >
                            {a.decision}
                          </span>
                        </div>
                        <p>
                          {new Date(a.timestamp).toLocaleString()} · Actor{" "}
                          {a.actor.slice(0, 8)}…
                        </p>
                        <details>
                          <summary>Inspect event</summary>
                          <pre>{JSON.stringify(a, null, 2)}</pre>
                        </details>
                      </div>
                      <time dateTime={a.timestamp}>
                        {new Date(a.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty
                  title="A clean slate"
                  text="Your workspace actions will appear here."
                />
              )}
            </section>
          )}
          {section === "settings" && (
            <div className="settings-grid">
              <section className="panel settings-panel">
                <h2>Your profile</h2>
                <div className="profile-large">
                  <span className="avatar">{me.user.name.slice(0, 1)}</span>
                  <div>
                    <strong>{me.user.name}</strong>
                    <p>{me.user.email}</p>
                  </div>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Appearance</strong>
                    <p>Find your focus in light or dark.</p>
                  </div>
                  <button className="btn secondary" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    Use {theme === "dark" ? "light" : "dark"} mode
                  </button>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Currency & dates</strong>
                    <p>USD · dates and monthly accounting use UTC.</p>
                  </div>
                  <span className="badge neutral">USD</span>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Session</strong>
                    <p>
                      Encrypted cookie · 8-hour expiry · server-side revocation.
                    </p>
                  </div>
                  <button
                    className="btn secondary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await api("auth/logout", {});
                        sessionStorage.removeItem("finpilot-approvals");
                        router.replace("/login");
                      } catch (error) {
                        setError((error as Error).message);
                        setBusy(false);
                      }
                    }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </section>
              <section className="panel settings-panel">
                <h2>Environment & controls</h2>
                <div className="environment-item">
                  <span className="dot" />
                  <div>
                    <strong>Synthetic sandbox</strong>
                    <p>
                      No bank credentials. No transfers. Every account starts
                      with 90 days of labeled synthetic data.
                    </p>
                  </div>
                </div>
                <div className="environment-item">
                  <FileText size={17} />
                  <div>
                    <strong>Storage</strong>
                    <p>{me.storage}</p>
                  </div>
                </div>
                <div className="environment-item">
                  <Sparkles size={17} />
                  <div>
                    <strong>Agent runtime</strong>
                    <p>{me.agent}. API credentials stay on the server.</p>
                  </div>
                </div>
                <div className="environment-item">
                  <ShieldCheck size={17} />
                  <div>
                    <strong>Approval policy</strong>
                    <p>
                      One-time tokens are bound to your identity, exact payload,
                      and five-minute expiry. Applied and rejected tokens cannot
                      be reused.
                    </p>
                  </div>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Python analysis service</strong>
                    <p>
                      {me.analytics
                        ? "Configured · verify its live connection"
                        : "Optional · configure server environment variables"}
                    </p>
                  </div>
                  <button
                    className="btn secondary"
                    disabled={busy}
                    onClick={() =>
                      action(
                        async () => setPython(await api("analytics")),
                        "Python analysis verified.",
                      )
                    }
                  >
                    Verify
                  </button>
                </div>
                {python && (
                  <div className="info-note">
                    Python verified {python.count} rows for {python.month}:
                    income {money(python.income)}, expenses{" "}
                    {money(python.expenses)}, savings {money(python.savings)}.
                  </div>
                )}
              </section>
              <section className="panel settings-panel">
                <h2>Your reports</h2>
                <p className="muted">
                  Download a synthetic monthly summary. CSV merchant fields are
                  protected against spreadsheet formula injection.
                </p>
                <div className="row wrap">
                  <a
                    className="btn primary"
                    href={`/api/export/pdf?month=${month}`}
                  >
                    <Download size={16} />
                    Monthly PDF
                  </a>
                  <a
                    className="btn secondary"
                    href={`/api/export/csv?month=${month}`}
                  >
                    <FileText size={16} />
                    Transactions CSV
                  </a>
                </div>
              </section>
            </div>
          )}
          <footer className="workspace-footer">
            <span>
              <Compass size={13} /> FinPilot AI · A clearer way forward.
            </span>
            <span>Synthetic sandbox · No real financial transactions</span>
          </footer>
        </main>
      </div>
      {modal === "import" && (
        <Modal
          title="Bring your transactions into focus"
          onClose={() => setModal(null)}
        >
          <p className="muted">
            Upload a synthetic CSV (512 KB, 2,000 rows max). The entire batch is
            validated before any data is written.
          </p>
          <a className="text-button" href="/sample-transactions.csv" download>
            <Download size={14} />
            Download sample CSV
          </a>
          <label className="upload-drop">
            <Upload size={26} />
            <strong>Choose a CSV file</strong>
            <span>date,merchant,amount,category</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                setPreview(null);
                setModalError("");
                if (f) {
                  if (f.size > 512 * 1024) {
                    setModalError("File exceeds 512 KB");
                    return;
                  }
                  setCsv(await f.text());
                }
              }}
            />
          </label>
          <label>
            Or paste CSV
            <textarea
              aria-label="CSV content"
              rows={5}
              placeholder={
                "date,merchant,amount,category\n2026-10-19,Demo Cafe,-24.50,Dining"
              }
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setPreview(null);
              }}
            />
          </label>
          {modalError && (
            <p className="error-text" role="alert">
              {modalError}
            </p>
          )}
          {preview && (
            <div className="import-preview">
              <span className="badge mint">{preview.rows.length} new rows</span>{" "}
              <span className="badge neutral">
                {preview.duplicates} duplicates skipped
              </span>
              <p className="muted">
                All {preview.total} rows passed validation. All imported data is
                marked synthetic.
              </p>
              <div className="preview-table">
                {preview.rows.slice(0, 5).map((t, i) => (
                  <div className="row between" key={i}>
                    <span>
                      {t.merchant} <small>{t.date}</small>
                    </span>
                    <strong>{money(t.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            {!preview ? (
              <button
                className="btn primary"
                disabled={!csv || busy}
                onClick={async () => {
                  setBusy(true);
                  setModalError("");
                  try {
                    setPreview(
                      await api("transactions/import", { csv, commit: false }),
                    );
                  } catch (e) {
                    setModalError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Validate & preview <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="btn primary"
                disabled={busy || !preview.rows.length}
                onClick={() =>
                  action(
                    () =>
                      api("transactions/import", {
                        csv,
                        commit: true,
                        confirmed: true,
                      }),
                    "CSV imported. Duplicates were skipped.",
                  )
                }
              >
                <Check size={16} />
                Confirm import ({preview.rows.length})
              </button>
            )}
          </div>
        </Modal>
      )}
      {modal === "budget" && (
        <Modal
          title={editingBudget ? "Adjust your plan" : "Set a monthly intention"}
          onClose={() => setModal(null)}
        >
          <p className="muted">
            Review the category, month, limit, and alert threshold. Saving
            confirms this sandbox change.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              let limit: number;
              try {
                limit = toCents(String(f.get("limit")));
              } catch (e) {
                setModalError((e as Error).message);
                return;
              }
              action(
                () =>
                  api(
                    editingBudget ? `budgets/${editingBudget.id}` : "budgets",
                    {
                      category: f.get("category"),
                      month: f.get("month"),
                      limit,
                      threshold: Number(f.get("threshold")),
                      confirmed: true,
                    },
                    editingBudget ? "PATCH" : "POST",
                  ),
                "Your budget is saved.",
              );
            }}
          >
            <label>
              Category
              <select
                name="category"
                defaultValue={editingBudget?.category ?? "Dining"}
              >
                {categories
                  .filter((c) => c !== "Income")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </label>
            <div className="form-columns">
              <label>
                Month
                <input
                  type="month"
                  name="month"
                  defaultValue={editingBudget?.month ?? month}
                  required
                  min="2000-01"
                  max="2099-12"
                />
              </label>
              <label>
                Monthly limit (USD)
                <input
                  name="limit"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                  defaultValue={
                    editingBudget
                      ? (editingBudget.limit / 100).toFixed(2)
                      : "500.00"
                  }
                  required
                />
              </label>
            </div>
            <label>
              Alert threshold (%)
              <input
                name="threshold"
                type="number"
                min={1}
                max={100}
                defaultValue={editingBudget?.threshold ?? 80}
                required
              />
            </label>
            {modalError && (
              <p role="alert" className="error-text">
                {modalError}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button disabled={busy} className="btn primary">
                <Check size={16} />
                Confirm & save budget
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "delete" && editingBudget && (
        <Modal title="Delete this budget?" onClose={() => setModal(null)}>
          <p>
            Remove the {editingBudget.category} limit of{" "}
            {money(editingBudget.limit)} for {monthLabel(editingBudget.month)}?
          </p>
          <p className="muted">
            This affects the sandbox budget record. Your transaction history
            stays available.
          </p>
          {modalError && (
            <p role="alert" className="error-text">
              {modalError}
            </p>
          )}
          <div className="modal-actions">
            <button className="btn secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button
              className="btn danger"
              disabled={busy}
              onClick={() =>
                action(
                  () =>
                    api(
                      `budgets/${editingBudget.id}`,
                      { confirmed: true },
                      "DELETE",
                    ),
                  "Budget deleted and recorded in your audit log.",
                )
              }
            >
              Confirm deletion
            </button>
          </div>
        </Modal>
      )}
      {modal === "transaction" && editingTransaction && (
        <Modal
          title="Put this purchase in its place"
          onClose={() => setModal(null)}
        >
          <p>
            <strong>{editingTransaction.merchant}</strong> ·{" "}
            {money(editingTransaction.amount)}
          </p>
          <p className="muted">Reference {editingTransaction.id}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              action(
                () =>
                  api(
                    `transactions/${editingTransaction.id}`,
                    { category: f.get("category"), confirmed: true },
                    "PATCH",
                  ),
                "Transaction category updated.",
              );
            }}
          >
            <label>
              Category
              <select
                name="category"
                defaultValue={editingTransaction.category}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {modalError && (
              <p role="alert" className="error-text">
                {modalError}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button className="btn primary" disabled={busy}>
                <Check size={16} />
                Confirm category change
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
