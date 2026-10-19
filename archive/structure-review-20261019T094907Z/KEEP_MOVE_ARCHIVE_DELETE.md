# Structure review before changes

Reviewed 19 October 2026 (Asia/Dhaka). This complete table was produced after the read-only reference/import/packaging audit and before refreshing any existing file. The primary working tree already contains an earlier cleanup and unrelated local edits. Preserve them. No application feature changes or deletions are planned.

## Decisions

| Existing path | Decision | Destination / reason |
| --- | --- | --- |
| `.env.example` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.gitattributes` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.gitignore` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.prettierignore` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `AGENTS.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `CONTRIBUTING.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `LICENSE` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `README.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `SECURITY.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `THIRD_PARTY_NOTICES.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docker-compose.yml` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `eslint.config.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `next-env.d.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `next.config.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `package-lock.json` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `package.json` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `playwright.config.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `postcss.config.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tsconfig.json` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `vitest.config.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.github/PULL_REQUEST_TEMPLATE.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `.github/workflows/ci.yml` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/algorithms.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/architecture.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/competition-requirements.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/demo-script.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/dependency-licenses.json` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/execution-evidence.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/security-self-assessment.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `docs/evidence/agent-approved.png` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/agent-proposal.png` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/audit-example.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/benchmark.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/browser-results.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/ci-verification.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/dashboard-desktop.png` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/dashboard-mobile.png` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/demo-recording.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/demo.webm` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/dependency-audit.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/monthly-summary.pdf` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/service-integration.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/settings-light.png` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/unit-results.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/verification-summary.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/browser.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/build.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/check-results.json` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/lint.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/python-tests.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/seed.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/typecheck.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `docs/evidence/checks/unit.log` | KEEP | Retain authentic evidence at referenced path. Snapshot original before current check outputs refresh. |
| `e2e/golden.spec.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `output/pdf/01-technical-paper.pdf` | KEEP | Keep compiled deliverable. Recompile only if corresponding paper source changes. |
| `output/pdf/02-security-self-assessment.pdf` | KEEP | Keep compiled deliverable. Recompile only if corresponding paper source changes. |
| `output/pdf/03-execution-evidence.pdf` | KEEP | Keep compiled deliverable. Recompile only if corresponding paper source changes. |
| `output/pdf/04-submission-checklist.pdf` | KEEP | Keep compiled deliverable. Recompile only if corresponding paper source changes. |
| `prisma/schema.prisma` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `prisma/migrations/migration_lock.toml` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `prisma/migrations/20261019000000_initial/migration.sql` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `public/sample-transactions.csv` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/benchmark.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/build-papers.ps1` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/capture-demo.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/collect-evidence.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/dependency-notices.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/package-submission.ps1` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/record-demo.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/seed.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/verify-services.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/verify.mjs` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `scripts/verify.ps1` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `services/analytics/Dockerfile` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `services/analytics/main.py` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `services/analytics/requirements.txt` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `services/analytics/test_main.py` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/error.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/globals.css` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/icon.svg` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/layout.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/loading.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/not-found.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/page.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/[section]/page.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/api/[...path]/route.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/login/page.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/app/register/page.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/components/auth.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/components/finance-app.tsx` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/agent.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/api.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/client-api.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/credentials.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/csv.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/domain.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/security.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/seed.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `src/lib/store.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/README.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/README.md` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/approval-flow.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/architecture.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/evidence.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/main.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/references.bib` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/results.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/security.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/shared.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/submission.tex` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/figures/agent.png` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `submission/overleaf/figures/dashboard.png` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tests/agent.test.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tests/api.test.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tests/domain.test.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tests/regression.test.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `tests/repository.test.ts` | KEEP | Retain canonical implementation, configuration, tests, documentation or paper source. |
| `archive/README.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/cleanup-result.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/package-validation.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/reference-check.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/structure-audit.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/CONTRIBUTING.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/LICENSE` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/README.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/SECURITY.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/THIRD_PARTY_NOTICES.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/manifest.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/algorithms.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/architecture.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/competition-requirements.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/demo-script.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/dependency-licenses.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/execution-evidence.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/gamma-presentation-prompt.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/review-report.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/security-self-assessment.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/agent-approved.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/agent-proposal.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/audit-example.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/benchmark.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/browser-results.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/ci-verification.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/dashboard-desktop.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/dashboard-mobile.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/demo-recording.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/demo.webm` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/monthly-summary.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/settings-light.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/unit-results.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/evidence/verification-summary.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/build.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/capture.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/dependency-audit.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/lint.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/python-tests.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/seed.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/service-integration.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/docs/runs/typecheck.log` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/FinPilot_AI_Overleaf.zip` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/FinPilot_AI_Submission.zip` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/SHA256SUMS.txt` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/pdf/01-technical-paper.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/pdf/02-security-self-assessment.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/pdf/03-execution-evidence.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/output/pdf/04-submission-checklist.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/prisma/migrations/20261019000000_initial/migration.sql` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/public/sample-transactions.csv` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/README.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/README.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/approval-flow.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/architecture.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/evidence.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/main.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/references.bib` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/results.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/security.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/shared.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/submission.tex` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/figures/agent.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/submission/overleaf/figures/dashboard.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/2026-10-19-pre-simplification/user-state/next-env.d.ts` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/output-packages/FinPilot_AI_Overleaf.zip` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/output-packages/FinPilot_AI_Submission.zip` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/output-packages/SHA256SUMS.txt` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/01-technical-paper.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/02-security-self-assessment.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/03-execution-evidence.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/04-submission-checklist.pdf` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/FinPilot_AI_Source.zip` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/SHA256SUMS.txt` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/START_HERE.md` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/agent-approved.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/audit-example.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/benchmark.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/browser-results.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/check-results.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/ci-verification.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/dashboard-desktop.png` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/demo-recording.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/demo.webm` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/unit-results.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `archive/generated-exports/20261019T092837Z-1a18250d/submission-final/evidence/verification-summary.json` | ARCHIVE | Already outside primary submission. Retain original bytes and provenance. |
| `submission/final/` | MOVE | Packaging archives existing export under archive/generated-exports, then installs freshly staged deliverables. |
| `output/packages/` | MOVE | Packaging archives previous generated ZIPs/checksums, then regenerates. |
| `.tools/` | ARCHIVE | Local tools, intermediate papers, package staging and interrupted presentation captures remain ignored and excluded from all packages. |
| `output/presentation/` | KEEP | Empty interrupted-task directory. Excluded from source/export allowlist. |
| `node_modules/; .next/; test-results/; playwright-report/; *.tsbuildinfo; __pycache__/` | KEEP | Generated local dependencies and caches remain ignored and excluded from packages. |
| `.git/` | KEEP | Preserve repository history and all pre-existing local edits. |
| `DELETE` | DELETE | None. No irreversible deletion or source removal. |

## Reference and execution audit

- 72 primary Markdown file/directory links resolved. External URLs were not revalidated as part of this local structural audit.
- All 13 LaTeX input, figure and bibliography references resolved.
- All 52 local TypeScript/JavaScript imports resolved, including @/ aliases. Every static package import is declared in package.json.
- CI, package.json, test configurations, Docker paths, paper compilation and submission packaging were read. Runtime checks will verify actual execution.
- Packaging uses an explicit source/docs allowlist, excludes caches/secrets/archive, includes authentic evidence and current logs, and requires a successful matching verification record.
- Existing 59-entry historical archive SHA-256 manifest verified with no mismatch. Archived historical links are frozen context and are not primary working references.
- .gitignore already excludes dependencies/builds/tooling/final ZIPs. Add explanations and preserve current and newly archived authentic log files.
- No changes to src, services, prisma, tests, e2e, public, financial calculations or application features are planned.
- Refresh evidence summary only from actual check output. Retain historical integration/CI/benchmark evidence with its original scope.

## Planned outputs

Keep submission/overleaf editable and output/pdf canonical. Generate submission/final/START_HERE.md, four PDFs, exact source ZIP, authentic evidence and checksums. Generate Overleaf and submission ZIPs under output/packages. No presentation work is part of this cleanup.

## Duplicate and generated material

Primary exact-byte duplicate groups: 0.

Previous judge export: 18 files. Previous generated package folder: 3 files. These are deliberate export copies and will be preserved before regeneration.

The original Gamma prompt, review report, docs/runs logs and output ZIPs already reside in `archive/2026-10-19-pre-simplification/` with their provenance manifest. Current verification logs under `docs/evidence/checks/` and the two historical integration/advisory records remain required evidence.
