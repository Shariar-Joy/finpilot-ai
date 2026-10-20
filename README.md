# FinPilot AI

**Your money, understood.** A personal finance sandbox with explainable calculations, visible tool results, and user-approved budget and reminder changes.

[![Verification](https://github.com/Shariar-Joy/finpilot-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Shariar-Joy/finpilot-ai/actions/workflows/ci.yml)

## Features and architecture

- Monthly dashboards, transaction search, validated CSV imports, and CSV/PDF exports.
- Budgets, recurring-bill inference, in-app reminders, and unusual-spending explanations.
- A finance copilot that proposes exact changes, waits for approval or rejection, and records the decision. Tokens are user-bound, expire after five minutes, and can be consumed only once.
- User-scoped accounts, revocable sessions, responsive navigation, and light/dark themes.

The React/Next.js interface calls a same-origin API. Server functions validate input and calculate money in integer USD cents. Approval consumption, ledger changes, and audit entries commit together. Prisma supports PostgreSQL persistence; a single-process memory mode runs the demo without external services. Optional OpenAI planning selects read/proposal tools, while private FastAPI analytics independently checks monthly totals. Neither integration can authorize financial changes.

See [architecture](docs/architecture.md) and [algorithms](docs/algorithms.md).

## Install and run

Use **Node.js 24.x** and npm. From the directory containing `package.json`:

```powershell
npm ci
npm run dev
```

Open **http://127.0.0.1:3000** and choose **Explore the live demo**. No database, Python service, or API key is required. Each demo account receives 90 days of synthetic transactions. **Memory-mode data is lost on server restart.** A configured but unavailable database returns an error instead of falling back to memory.

### PostgreSQL

Copy `.env.example` to `.env`. Set `DATABASE_URL`, `APP_ORIGIN`, a random `SESSION_SECRET` of at least 32 characters, and a `DEMO_PASSWORD` of at least 12 characters. Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

With Docker Desktop running, set `POSTGRES_PASSWORD` in your shell to match `DATABASE_URL`, then:

```powershell
docker compose up -d postgres
npm run db:migrate
npm run seed
npm run dev
```

The seed creates `demo@finpilot.local` using `DEMO_PASSWORD` and leaves an existing account unchanged. Use migrations for persistent deployments.

### Optional integrations

For Python analytics, use Python 3.13 or newer:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r services/analytics/requirements.txt
$env:ANALYTICS_SERVICE_TOKEN = 'YOUR_GENERATED_SERVICE_SECRET'
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir services/analytics --host 127.0.0.1 --port 8000 --no-access-log
```

Set the same token and `ANALYTICS_URL=http://127.0.0.1:8000` in the application's `.env`, restart Next.js, and choose **Settings > Python analysis service > Verify**. Docker users can instead run `docker compose up -d analytics` with the token set in their shell.

For optional model planning, set the server-only `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `.env`, then restart. The configured default is `gpt-4.1-mini`. Missing keys, provider failures, or invalid plans use the deterministic fallback. Tests mock provider responses.

### Production

Configure PostgreSQL, apply migrations, set `DEMO_MODE=false`, a persistent session secret, and an HTTPS `APP_ORIGIN`. Run `npm run build`, then `npm run start -- --hostname 0.0.0.0` behind a TLS reverse proxy with request and rate limits. Keep analytics private. A temporary preview may explicitly use `DEMO_MODE=true`; memory storage remains ephemeral and single-process.

## Tests and evidence

For isolated local checks, leave `DATABASE_URL` and `OPENAI_API_KEY` unset:

```powershell
npm run lint
npm run typecheck
npm run test
python -m pip install -r services/analytics/requirements.txt
python -m unittest discover -s services/analytics -v
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts a development server at `http://127.0.0.1:3000`. For a separate port, set `APP_ORIGIN` and `E2E_BASE_URL` to the same origin and `FINPILOT_VERIFY_RUN=true` to require a fresh server. CI also runs the TypeScript suite against PostgreSQL.

Original [verification records](docs/evidence/checks/check-results.json), [unit results](docs/evidence/unit-results.json), [browser results](docs/evidence/browser-results.json), and [sanitized audit evidence](docs/evidence/audit-example.json) support the separately maintained competition reports. These are dated records, not results from each new checkout. The report-referenced screenshots and monthly PDF remain for traceability.

`npm run verify` intentionally overwrites test evidence; `node scripts/collect-evidence.mjs` validates that run and updates its summary. Use these and the capture/benchmark scripts only when refreshing evidence. `scripts/record-demo.mjs` reproduces the captioned application demo. New recordings and metadata go to ignored `output/demo/`; `FINPILOT_RECORDING_DIR` selects another destination. `scripts/verify-services.mjs` checks a running Next.js/FastAPI integration.

## Try the demo

Open **AI copilot > Run demo scenario**, inspect the tools and exact proposal, and reject it. Run it again and approve it; select the proposal's target month in **Budgets**, then inspect **Activity & audit**. The [sample CSV](public/sample-transactions.csv) uses fixed October 2026 dates. Accounting months use UTC.

The original [captioned recording](docs/evidence/demo.webm) demonstrates CSV validation, approval, rejection, and the audit trail. Completed competition deliverables are maintained separately in `FinPilot_AI_Doc` in the supplied workspace.

## Security and maintenance

This synthetic sandbox has no bank connection, payment execution, external notification delivery, email verification, MFA, or password recovery. Memory storage and rate limits are process-local. The ledger, audit retention, and deployment controls need further hardening for real users. Live-model reliability and independent penetration testing are unverified; no regulatory certification is claimed.

Keep credentials, `.env`, session/approval tokens, and real financial records out of Git. Read the [security design and limitations](docs/security-self-assessment.md), [security reporting policy](SECURITY.md), [contributing guide](CONTRIBUTING.md), [license](LICENSE), and [third-party notices](THIRD_PARTY_NOTICES.md).

## Authors

Shariar Nazim Joy and Abrar Hossain Abir, Department of Computer Science and Engineering, Independent University, Bangladesh.
