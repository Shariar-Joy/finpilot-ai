# FinPilot AI

**Your money, understood.** A functional personal finance sandbox for the 2026 Shenzhen International FinTech Competition, Topic A.

Next.js App Router · React · TypeScript strict · Tailwind CSS · Recharts · Prisma/PostgreSQL · Python FastAPI · optional OpenAI Responses function calling.

[![Verification](https://github.com/Shariar-Joy/finpilot-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Shariar-Joy/finpilot-ai/actions/workflows/ci.yml)

![FinPilot dashboard using synthetic records](submission/overleaf/figures/dashboard.png)

## The workflow

```mermaid
flowchart LR
  A[Inspect or import synthetic records] --> B[Ask a finance question]
  B --> C[Inspect tools and transaction evidence]
  C --> D[Review an exact proposal]
  D --> E{Your decision}
  E -->|Approve| F[Apply once and record audit]
  E -->|Reject| G[Leave finances unchanged and record decision]
```

The agent completes a real sandbox state change. It cannot approve its own proposal. Watch the [actual short captioned demo](docs/evidence/demo.webm), inspect the [verification summary](docs/evidence/verification-summary.json) and [successful application/PostgreSQL CI evidence](docs/evidence/ci-verification.json), or follow the [five-minute walkthrough](docs/demo-script.md).

## Competition paperwork

The [submission guide](submission/README.md) explains the four compiled papers, editable [Overleaf source](submission/overleaf/README.md), authentic evidence and the generated judge-facing export. Run `powershell -File scripts/package-submission.ps1`, then begin with `submission/final/START_HERE.md`. That folder contains only final deliverables, authentic evidence and checksums. The reports use IEEE conference formatting and retain blank identity fields for two members. No presentation deck is included.

See the [requirements crosswalk](docs/competition-requirements.md), [security policy](SECURITY.md), [contribution guide](CONTRIBUTING.md), [project rights notice](LICENSE), and [third-party notices](THIRD_PARTY_NOTICES.md). Historical review notes, Gamma prompt, logs and old packages are preserved under archive, outside the primary submission. No IEEE publication, competition acceptance, score, or regulatory certification is claimed.

## Run the demo (no database or API key needed)

Requires Node.js 24 LTS and npm. From this directory:

```powershell
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**, choose **Explore the live demo**, then **AI copilot → Run demo scenario**. Inspect the tools, evidence, and proposed dining budget. Reject it first; run again and approve. Check **Budgets → next month** and **Activity & audit**.

The demo button creates a fresh, isolated account named **Shariar Joy** with 90 days of synthetic transactions. There is no shared password. You can also register with an email-shaped identifier and a password (12+ characters, at most 72 UTF-8 bytes), then sign in again. No email is sent or verified. All accounts and CSV imports are sandbox data.

**Without `DATABASE_URL`, data exists only in the server process memory. Restarting the server loses accounts, sessions, budgets, imports, and audit history.** The UI identifies this mode. Use one server process. It is unsuitable for multiple replicas or serverless hosting. A configured but unreachable database never silently falls back to memory.

## PostgreSQL persistence

Copy `.env.example` to `.env` and configure:

```dotenv
DATABASE_URL=postgresql://finpilot:YOUR_PASSWORD@localhost:5432/finpilot
APP_ORIGIN=http://127.0.0.1:3000
SESSION_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
DEMO_PASSWORD=YOUR_CHOSEN_DEMO_PASSWORD_OF_AT_LEAST_12_CHARACTERS
```

Generate secrets locally using `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Do not commit `.env`.

For Docker Desktop, start its engine, set `POSTGRES_PASSWORD` in your shell to the same password used in `DATABASE_URL`, then:

```powershell
docker compose up -d postgres
npm run db:migrate
npm run seed
npm run dev
```

`seed` loads `.env` and creates **demo@finpilot.local** with the password you supplied in `DEMO_PASSWORD`. Rerunning it does not overwrite an existing account. The demo button remains available and creates a separate workspace. `npm run db:push` is available for disposable development databases; use migrations for deployments.

The schema uses relational users and revocable sessions plus one JSONB ledger aggregate per user. Approval consumption, budget writes, and audit records commit together using optimistic version checks. See [architecture](docs/architecture.md) for tradeoffs. PostgreSQL migrations are provided; see [execution evidence](docs/execution-evidence.md) for what was actually exercised in this environment.

## Python FastAPI service

Python 3.13+ is recommended. In a second terminal:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r services/analytics/requirements.txt
$env:ANALYTICS_SERVICE_TOKEN = 'YOUR_GENERATED_SERVICE_SECRET'
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir services/analytics --host 127.0.0.1 --port 8000 --no-access-log
```

Set the same `ANALYTICS_SERVICE_TOKEN` and `ANALYTICS_URL=http://127.0.0.1:8000` in the Next.js `.env`, restart Next.js, and choose **Settings → Python analysis service → Verify**. The server forwards only the current user's transaction IDs, dates, categories, and integer amounts. Python independently calculates the monthly totals. It cannot mutate financial records. The full demo works when this optional service is offline.

Alternatively set `ANALYTICS_SERVICE_TOKEN` in your shell and run `docker compose up -d analytics`. Its port is bound to loopback. `/health` is public; `/analyze` requires the service token and limits requests to 2 MB / 10,000 records. No browser CORS access is enabled.

## LLM configuration

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default `gpt-4.1-mini`; choose a Responses-compatible model available to your account). Restart the app. Only server code reads the key.

The provider selects a bounded batch of read/proposal function calls through the Responses API. Validated tools execute on the server; financial answers are rendered from deterministic results, rather than trusting model arithmetic or permission claims. The model never receives approval tokens and has no mutation tool. Missing keys, provider errors, invalid plans, or timeouts select the fully functional deterministic agent. Provider planning is stateless and does not retain conversation context. The UI names the runtime used for each response. Live paid-provider execution requires your own credential; tests use mocked provider responses.

## Available workflows

- Dashboard: monthly income, expenses, savings, category donut, and daily cumulative spending comparison.
- Transactions: merchant/ID search, month/category filters, pagination, category editing, CSV preview, strict batch validation, deduplication and atomic import.
- Budgets: create, edit, delete, alert thresholds and progress; next-month agent changes become visible when selecting that month.
- Bills: evidence-backed monthly inference, approved in-app reminders, completion/reopening. No email or payment is sent.
- Insights: transparent unusual-spending rules and transaction references, without fraud claims.
- Agent: real server tools, visible results, evidence links, exact proposals, rejection, approval, expiry, and mutation timeline.
- Activity: actor, decision, UTC timestamp, correlation ID and sanitized metadata.
- Reports: downloadable monthly CSV and a genuine one-page PDF. Exported merchant text is neutralized for spreadsheets.
- Theme, mobile navigation, keyboard controls, native modal focus management, reduced-motion support, loading/error/empty states.

CSV format (signed USD amounts, maximum two decimal places; exact headers in this order):

```csv
date,merchant,amount,category
2026-10-19,Demo Cafe,-24.50,Dining
2026-10-18,Demo Studio,125.00,Income
```

Categories: Income, Dining, Groceries, Housing, Transport, Subscriptions, Utilities, Shopping, Health, Other. A [sample file](public/sample-transactions.csv) is downloadable in the import dialog. It uses fixed October 2026 dates; select that month after importing it. Duplicate identity is date + normalized merchant + signed amount; identical legitimate same-day purchases are therefore treated as duplicates. A bad row rejects the entire batch. Limits are 512 KB and 2,000 rows per import.

## Verification

Run `npm run verify` for the complete local suite. It uses a separate demo server on port 3100 and a build directory under `.next/verification`, without a database or paid model key. Override the port with `FINPILOT_TEST_PORT` if necessary. Actual outcomes and UTF-8 logs are written to `docs/evidence/checks`; all checks run even if one fails. The runner returns a failing exit code if any check fails.

Individual commands remain available:

```powershell
npm run lint
npm run typecheck
npm run test
npm run seed
npm run build
npx playwright install chromium
npm run test:e2e
python -m unittest discover -s services/analytics -v
```

Vitest tests domain calculations, approval security, real Request/Response API handlers, ownership, auth, imports and provider boundaries. Playwright exercises actual browser flows and mobile rendering against a running Next.js server, or starts one automatically. Keep `APP_ORIGIN` consistent with the browser URL; default tests use `http://127.0.0.1:3000`. Unit/API tests run in memory by default; unset inherited `DATABASE_URL` for an isolated run. Tests never require a paid LLM key.

`node scripts/capture-demo.mjs` captures real UI screenshots, a PDF and sanitized audit events while a local server runs. `node scripts/verify-services.mjs` checks the production Next.js/Python path at port 3001 (override with `E2E_BASE_URL`). See [execution evidence](docs/execution-evidence.md) for exact results and limitations.

## Production deployment

1. Provision PostgreSQL, apply `npm run db:migrate`, and back it up. Set `DATABASE_URL`, a strong persistent `SESSION_SECRET`, and an HTTPS `APP_ORIGIN` matching your public URL. Do not set `DEMO_MODE=true` for a durable deployment.
2. Run `npm ci`, `npm run build`, then `npm run start -- --hostname 0.0.0.0`. Use a TLS reverse proxy; configure its request limits and per-IP rate limits. Serve from one canonical origin. HTTPS makes the session cookie Secure.
3. Deploy FastAPI privately if wanted; set a strong shared service token and private `ANALYTICS_URL`. Do not expose its port publicly.
4. For an explicitly temporary production preview, set `DEMO_MODE=true` before `npm run start`. Data remains ephemeral and single-process. Without a database or this explicit opt-in the API returns 503.

Builds do not require credentials or a live database. Deployment, domain registration, real bank integrations, transfers, email delivery, MFA, password recovery and regulatory certification are outside this sandbox's scope. Current rate limits are process-local: use a distributed gateway for multi-instance deployment. See [security self-assessment](docs/security-self-assessment.md).

## Source map

`src/app` — routes/layout/styles; `src/components` — client interfaces; `src/lib/domain.ts` — money/analysis; `csv.ts` — import/export; `store.ts` — memory/PostgreSQL repository; `security.ts` — sessions/approvals/audit; `agent.ts` — tool orchestration; `api.ts` — HTTP boundary; `prisma` — schema/migration; `services/analytics` — FastAPI; `tests` / `e2e` — verification.

[Architecture](docs/architecture.md) · [Algorithms](docs/algorithms.md) · [Security](docs/security-self-assessment.md) · [Five-minute demo](docs/demo-script.md) · [Execution evidence](docs/execution-evidence.md)
