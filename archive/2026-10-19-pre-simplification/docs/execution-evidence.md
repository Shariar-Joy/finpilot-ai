# Execution evidence

Verified on **19 October 2026 (Asia/Dhaka)** in the supplied Windows workspace. These results come from actual commands and browser runs; no hosted application deployment is claimed; source publication is tracked separately.

Environment: Node.js v24.13.0, npm 11.6.2, Python 3.14.2, Next.js 16.4.2, Prisma Client/CLI 6.19.3, Vitest 4.1.12, Playwright Chromium. The Python environment already supplied FastAPI 0.138.2, uvicorn 0.49.0 and httpx 0.28.1. Package-lock.json records the exact npm dependency tree.

## Final checks

| Actual command                                                                             | Outcome                                                                                                        | Raw output                                                                 |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `npm install --offline=false --no-audit --no-fund`                                         | Dependencies installed and Prisma Client generated                                                             | Executed in the work session; lockfile retained                            |
| `npm run lint`                                                                             | PASS, no warnings/errors                                                                                       | [lint.log](runs/lint.log)                                                  |
| `npm run typecheck`                                                                        | PASS, TypeScript strict                                                                                        | [typecheck.log](runs/typecheck.log)                                        |
| `npm run test`                                                                             | PASS, **61 tests in 5 files**                                                                                  | [unit-results.json](evidence/unit-results.json)                                                  |
| `npm run seed`                                                                             | PASS, **134 synthetic transactions** for the current 90-day seed; explicitly no CLI persistence in memory mode | [seed.log](runs/seed.log)                                                  |
| `npm run build`                                                                            | PASS, optimized production build and generated route manifest                                                  | [build.log](runs/build.log)                                                |
| `npm run test:e2e`                                                                         | PASS, **4 Chromium browser tests**                                                                             | [browser-results.json](evidence/browser-results.json)                                          |
| `python -m unittest discover -s services/analytics -v`                                     | PASS, **8 tests**                                                                                              | [python-tests.log](runs/python-tests.log)                                  |
| `npm audit --omit=dev --json --offline=false`                                              | PASS, **0 reported runtime vulnerabilities** on this date                                                      | [dependency-audit.json](runs/dependency-audit.json)                        |
| `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` | Generated the initial PostgreSQL migration                                                                     | [migration SQL](../prisma/migrations/20261019000000_initial/migration.sql) |
| `npx prisma validate` with a nonconnecting placeholder DATABASE_URL                        | PASS, schema valid                                                                                             | Executed in the work session; no connection was attempted                  |
| `npx prisma format`                                                                        | PASS                                                                                                           | Schema retained                                                            |
| `npm run dev`                                                                              | PASS, served local app on 127.0.0.1:3000                                                                       | Used for browser tests and evidence capture                                |
| `npm run start -- --port 3001` with explicit ephemeral mode and Python service env         | PASS, actual production server started                                                                         | Used for service smoke test                                                |
| `python -m uvicorn main:app --host 127.0.0.1 --port 8000 --no-access-log`                  | PASS, actual local FastAPI service started                                                                     | Used for service smoke test                                                |
| `node scripts/verify-services.mjs`                                                         | PASS, production Next.js totals agree exactly with FastAPI; missing service token rejected with 401            | [service-integration.log](runs/service-integration.log)                    |

`scripts/verify.ps1` ran lint, typecheck, unit/API tests, seed, production build, E2E and Python tests sequentially and saved those raw logs. PowerShell may format native stderr warnings as `NativeCommandError` records even when commands return 0; the script checks actual exit codes. The seed runner warns that no `.env` exists and continues in explicit demo behavior. Python's current Starlette test adapter emits an httpx deprecation warning; its eight tests still pass. Playwright emits a NO_COLOR/FORCE_COLOR environment warning.

## Behaviors proved by tests

- Exact decimal parsing, cent rounding, integer overflow checks, calendar validation, month shifts, monthly totals and budget usage.
- Synthetic seed, monthly recurrence evidence and month-end clamping, unusual-spending thresholds and earlier-only baselines.
- CSV quotes/schema/batch failure, existing/intra-batch duplicate detection, preview without writes, explicit import confirmation, actual import and idempotent re-import; formula-neutralized export.
- Real Request/Response API authentication, registration/login/logout revocation, cross-origin rejection, per-user transaction/budget ownership and isolation.
- Exact-payload approval binding, wrong tokens, tampering, expiry, cross-user use, replay, valid acceptance and rejection without financial changes.
- Server-side tool invocation, provider-selected tools using mocked Responses output, invalid/oversized provider plans and provider failure fallback. No live paid provider request was made.
- Browser golden scenario: tool results and transaction evidence → rejection and unchanged budgets → second proposal → approval → exact saved next-month limit → approved/rejected audit events.
- Browser import validation/preview/deduplication/confirmation/category editing/PDF download; budget create/edit/delete; Netflix reminder proposal/approval/completion; mobile navigation, overflow, Escape and light theme.
- FastAPI strict integer validation, bad dates, duplicate IDs, extra fields, body limits, private token and exact arithmetic; live production Next.js/Python agreement.

## Captured artifacts

[Desktop dashboard](evidence/dashboard-desktop.png), [mobile dashboard](evidence/dashboard-mobile.png), [agent proposal](evidence/agent-proposal.png), [approved agent result](evidence/agent-approved.png), [light-theme settings](evidence/settings-light.png), and [sanitized actual audit events](evidence/audit-example.json) are generated by `node scripts/capture-demo.mjs`. The sample monthly PDF is an actual authenticated report download. Capture scripts fail on browser page errors. Screenshots contain synthetic data only; approval tokens/cookies are excluded from captured logs.

The report was rendered with portable Poppler 26.09.0 (`pdftoppm -r 110 -png -singlefile`) and visually inspected: one A4 page with readable totals, category amounts and footer, without clipping or overlaps. `pdfinfo` confirmed one page, PDF 1.7, no JavaScript or form fields. Poppler emitted missing Symbol/ArialUnicode display-font warnings; the report uses embedded Helvetica and rendered correctly. The temporary PNG was inspected and removed after QA. Portable QA tooling is ignored under `.tools`; it is not an application dependency.

## Corrections during verification

Early checks found a JSX closure typo, a budget-update strict-schema mismatch, a test type-narrowing issue, a production configuration check running at build import time, local Next.js Host/origin normalization, a React Strict Mode dialog close-event race, a screen-reader table label leaking mobile overflow, and ambiguous E2E locators. These were corrected before the final passing run. Early screenshots were refreshed after disabling chart entry animation for consistent capture.

The dependency audit initially reported three high-severity entries through Prisma's `deepmerge-ts` dependency. A package override installs patched 8.x; Prisma generation, schema validation and the production build were rerun successfully. The final runtime audit reports zero. This is a point-in-time advisory check, not a general security guarantee.

## Remote continuous integration

The [successful GitHub run](https://github.com/Shariar-Joy/finpilot-ai/actions/runs/39220992552) verified commit `8fa49cab72e06efcadcd1d36dc2ccaad9f657cc3` on Ubuntu. Its application job passed clean installation, lint, strict types, 61 TypeScript/API tests in memory, 8 Python tests, production build, and 4 Chromium scenarios. Its PostgreSQL 17 job applied the real migration and passed the same 61 TypeScript/API cases against the database, including concurrent approval and copy rollback. Repeating the cases against two adapters does not create extra unique tests. The [observed job/step record](evidence/ci-verification.json) preserves the actual URL, commit and outcomes.

Clean CI exposed missing optional lockfile entries and a byte-order mark in the migration SQL; both were corrected. The browser readiness check also now allows cold route compilation. Target deployment and persistence across a process restart remain unverified.

## Unverified external capabilities and limitations

`docker compose config --quiet` also passed after the final environment-variable configuration fix; this validates the compose configuration without starting any containers.

- **Local PostgreSQL and restart recovery were not verified.** Docker CLI 29.7.2 was available, but its daemon was offline and the PostgreSQL CLI was absent. The remote PostgreSQL 17 migration and test run above closes the CI connection/atomicity gap. Repeat migration and recovery checks against the intended deployment before claiming that deployment is verified.
- **Live OpenAI execution was not verified:** no user API key was supplied. Mocked Responses function calls and full deterministic fallback were tested. Model availability, spend and account permissions are external.
- The local FastAPI integration was exercised directly with installed Python packages; the Docker images themselves were not built because the engine was unavailable.
- No public deployment, load test, independent penetration test, bank connectivity, actual payment, external notification delivery or regulatory certification is claimed.

Use [demo-script.md](demo-script.md) for the exact presentation path and [README](../README.md) for reproducible setup.

The subsequent source review added regression and atomicity checks. The current machine-readable summary records 61 TypeScript/API cases, 4 Chromium scenarios and 8 Python cases, all passing. See [review-report.md](review-report.md), [verification-summary.json](evidence/verification-summary.json), the real [demo recording](evidence/demo.webm), and [recording metadata](evidence/demo-recording.json). Fixed-seed microbenchmark values and their limited scope are in [benchmark.json](evidence/benchmark.json). The IEEE paperwork uses these executed values; no live model or local database result has been inferred.
