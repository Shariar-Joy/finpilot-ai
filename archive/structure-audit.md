# Repository structure audit - before changes

Audit date: 19 October 2026 (Asia/Dhaka). This inventory was written before any existing project file was moved or edited. No deletion is authorized by this audit.

Inventory: 120 project files. Decisions: ARCHIVE 10, KEEP 107, MOVE 3. DELETE: 0.

## Complete KEEP / MOVE / ARCHIVE / DELETE table

| Existing file | Action | Destination | Reason |
| --- | --- | --- | --- |
| `.env.example` | KEEP | `.env.example` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.gitattributes` | KEEP | `.gitattributes` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | KEEP | `.github/ISSUE_TEMPLATE/bug_report.yml` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.github/PULL_REQUEST_TEMPLATE.md` | KEEP | `.github/PULL_REQUEST_TEMPLATE.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.github/workflows/ci.yml` | KEEP | `.github/workflows/ci.yml` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.gitignore` | KEEP | `.gitignore` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `.prettierignore` | KEEP | `.prettierignore` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `AGENTS.md` | KEEP | `AGENTS.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `CONTRIBUTING.md` | KEEP | `CONTRIBUTING.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `LICENSE` | KEEP | `LICENSE` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `README.md` | KEEP | `README.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `SECURITY.md` | KEEP | `SECURITY.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `THIRD_PARTY_NOTICES.md` | KEEP | `THIRD_PARTY_NOTICES.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docker-compose.yml` | KEEP | `docker-compose.yml` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/algorithms.md` | KEEP | `docs/algorithms.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/architecture.md` | KEEP | `docs/architecture.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/competition-requirements.md` | KEEP | `docs/competition-requirements.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/demo-script.md` | KEEP | `docs/demo-script.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/dependency-licenses.json` | KEEP | `docs/dependency-licenses.json` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/evidence/agent-approved.png` | KEEP | `docs/evidence/agent-approved.png` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/agent-proposal.png` | KEEP | `docs/evidence/agent-proposal.png` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/audit-example.json` | KEEP | `docs/evidence/audit-example.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/benchmark.json` | KEEP | `docs/evidence/benchmark.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/browser-results.json` | KEEP | `docs/evidence/browser-results.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/ci-verification.json` | KEEP | `docs/evidence/ci-verification.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/dashboard-desktop.png` | KEEP | `docs/evidence/dashboard-desktop.png` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/dashboard-mobile.png` | KEEP | `docs/evidence/dashboard-mobile.png` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/demo-recording.json` | KEEP | `docs/evidence/demo-recording.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/demo.webm` | KEEP | `docs/evidence/demo.webm` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/monthly-summary.pdf` | KEEP | `docs/evidence/monthly-summary.pdf` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/settings-light.png` | KEEP | `docs/evidence/settings-light.png` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/unit-results.json` | KEEP | `docs/evidence/unit-results.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/evidence/verification-summary.json` | KEEP | `docs/evidence/verification-summary.json` | Authentic required evidence stays at its referenced path; snapshot originals before fresh tests/captures overwrite any file. |
| `docs/execution-evidence.md` | KEEP | `docs/execution-evidence.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `docs/gamma-presentation-prompt.md` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/gamma-presentation-prompt.md` | Optional historical preparation material; remove from primary submission and repair inbound links. |
| `docs/review-report.md` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/review-report.md` | Optional historical preparation material; remove from primary submission and repair inbound links. |
| `docs/runs/build.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/build.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/capture.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/capture.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/dependency-audit.json` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/dependency-audit.json` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/lint.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/lint.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/python-tests.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/python-tests.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/seed.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/seed.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/service-integration.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/service-integration.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/runs/typecheck.log` | ARCHIVE | `archive/2026-10-19-pre-simplification/docs/runs/typecheck.log` | Historical authentic command output; preserve bytes and update evidence-guide links. |
| `docs/security-self-assessment.md` | KEEP | `docs/security-self-assessment.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `e2e/golden.spec.ts` | KEEP | `e2e/golden.spec.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `eslint.config.mjs` | KEEP | `eslint.config.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `next-env.d.ts` | KEEP | `next-env.d.ts` | Pre-existing local modification detected; save exact bytes, do not reset user content. Next may regenerate its type declarations during verification. |
| `next.config.ts` | KEEP | `next.config.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `output/FinPilot_AI_Overleaf.zip` | MOVE | `archive/2026-10-19-pre-simplification/output/FinPilot_AI_Overleaf.zip` | Prior generated archives/checksums; preserve original bytes, regenerate packages under output/packages/. |
| `output/FinPilot_AI_Submission.zip` | MOVE | `archive/2026-10-19-pre-simplification/output/FinPilot_AI_Submission.zip` | Prior generated archives/checksums; preserve original bytes, regenerate packages under output/packages/. |
| `output/SHA256SUMS.txt` | MOVE | `archive/2026-10-19-pre-simplification/output/SHA256SUMS.txt` | Prior generated archives/checksums; preserve original bytes, regenerate packages under output/packages/. |
| `output/pdf/01-technical-paper.pdf` | KEEP | `output/pdf/01-technical-paper.pdf` | Compiled deliverable stays canonical; preserve original bytes in archive before recompiling refreshed figures/references. |
| `output/pdf/02-security-self-assessment.pdf` | KEEP | `output/pdf/02-security-self-assessment.pdf` | Compiled deliverable stays canonical; preserve original bytes in archive before recompiling refreshed figures/references. |
| `output/pdf/03-execution-evidence.pdf` | KEEP | `output/pdf/03-execution-evidence.pdf` | Compiled deliverable stays canonical; preserve original bytes in archive before recompiling refreshed figures/references. |
| `output/pdf/04-submission-checklist.pdf` | KEEP | `output/pdf/04-submission-checklist.pdf` | Compiled deliverable stays canonical; preserve original bytes in archive before recompiling refreshed figures/references. |
| `package-lock.json` | KEEP | `package-lock.json` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `package.json` | KEEP | `package.json` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `playwright.config.ts` | KEEP | `playwright.config.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `postcss.config.mjs` | KEEP | `postcss.config.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `prisma/migrations/20261019000000_initial/migration.sql` | KEEP | `prisma/migrations/20261019000000_initial/migration.sql` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `prisma/migrations/migration_lock.toml` | KEEP | `prisma/migrations/migration_lock.toml` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `prisma/schema.prisma` | KEEP | `prisma/schema.prisma` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `public/sample-transactions.csv` | KEEP | `public/sample-transactions.csv` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/benchmark.ts` | KEEP | `scripts/benchmark.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/build-papers.ps1` | KEEP | `scripts/build-papers.ps1` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/capture-demo.mjs` | KEEP | `scripts/capture-demo.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/collect-evidence.mjs` | KEEP | `scripts/collect-evidence.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/dependency-notices.mjs` | KEEP | `scripts/dependency-notices.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/package-submission.ps1` | KEEP | `scripts/package-submission.ps1` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/record-demo.mjs` | KEEP | `scripts/record-demo.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/seed.ts` | KEEP | `scripts/seed.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/verify-services.mjs` | KEEP | `scripts/verify-services.mjs` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `scripts/verify.ps1` | KEEP | `scripts/verify.ps1` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `services/analytics/Dockerfile` | KEEP | `services/analytics/Dockerfile` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `services/analytics/main.py` | KEEP | `services/analytics/main.py` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `services/analytics/requirements.txt` | KEEP | `services/analytics/requirements.txt` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `services/analytics/test_main.py` | KEEP | `services/analytics/test_main.py` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/[section]/page.tsx` | KEEP | `src/app/[section]/page.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/api/[...path]/route.ts` | KEEP | `src/app/api/[...path]/route.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/error.tsx` | KEEP | `src/app/error.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/globals.css` | KEEP | `src/app/globals.css` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/icon.svg` | KEEP | `src/app/icon.svg` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/layout.tsx` | KEEP | `src/app/layout.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/loading.tsx` | KEEP | `src/app/loading.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/login/page.tsx` | KEEP | `src/app/login/page.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/not-found.tsx` | KEEP | `src/app/not-found.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/page.tsx` | KEEP | `src/app/page.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/app/register/page.tsx` | KEEP | `src/app/register/page.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/components/auth.tsx` | KEEP | `src/components/auth.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/components/finance-app.tsx` | KEEP | `src/components/finance-app.tsx` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/agent.ts` | KEEP | `src/lib/agent.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/api.ts` | KEEP | `src/lib/api.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/client-api.ts` | KEEP | `src/lib/client-api.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/credentials.ts` | KEEP | `src/lib/credentials.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/csv.ts` | KEEP | `src/lib/csv.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/domain.ts` | KEEP | `src/lib/domain.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/security.ts` | KEEP | `src/lib/security.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/seed.ts` | KEEP | `src/lib/seed.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `src/lib/store.ts` | KEEP | `src/lib/store.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `submission/README.md` | KEEP | `submission/README.md` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `submission/overleaf/README.md` | KEEP | `submission/overleaf/README.md` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/approval-flow.tex` | KEEP | `submission/overleaf/approval-flow.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/architecture.tex` | KEEP | `submission/overleaf/architecture.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/evidence.tex` | KEEP | `submission/overleaf/evidence.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/figures/agent.png` | KEEP | `submission/overleaf/figures/agent.png` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/figures/dashboard.png` | KEEP | `submission/overleaf/figures/dashboard.png` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/main.tex` | KEEP | `submission/overleaf/main.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/references.bib` | KEEP | `submission/overleaf/references.bib` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/results.tex` | KEEP | `submission/overleaf/results.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/security.tex` | KEEP | `submission/overleaf/security.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/shared.tex` | KEEP | `submission/overleaf/shared.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `submission/overleaf/submission.tex` | KEEP | `submission/overleaf/submission.tex` | Keep editable paper source and figures; snapshot before updating references or captured figures. |
| `tests/agent.test.ts` | KEEP | `tests/agent.test.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `tests/api.test.ts` | KEEP | `tests/api.test.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `tests/domain.test.ts` | KEEP | `tests/domain.test.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `tests/regression.test.ts` | KEEP | `tests/regression.test.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `tests/repository.test.ts` | KEEP | `tests/repository.test.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `tsconfig.json` | KEEP | `tsconfig.json` | Required implementation, configuration, tests, documentation or editable source; retain path. |
| `vitest.config.ts` | KEEP | `vitest.config.ts` | Required implementation, configuration, tests, documentation or editable source; retain path. |

## Generated/local surfaces

| Surface | Action | Reason |
| --- | --- | --- |
| `.git/` | KEEP | Repository metadata; no reset, commit or publication is part of the structural cleanup. |
| `node_modules/` | KEEP | Installed dependencies required for verification; ignored. |
| `.next/`, test reports, Python/type caches | KEEP | Reproducible ignored local output; no recursive deletion in this cleanup. |
| `.tools/` | KEEP | Local compiler/Poppler/QA tools; ignored and excluded from all packages. |
| `submission/final/` (new) | KEEP | Generated judge-facing export: four PDFs, current source ZIP, real demo, selected evidence, checksums and START_HERE. |
| `output/packages/` (new) | KEEP | Rebuilt Overleaf and final-submission ZIPs; ignored rather than duplicate versioned binaries. |
| `docs/evidence/checks/` (new) | KEEP | Current authentic check logs and machine-readable outcomes, separate from historical logs. |

## Reference and dependency audit

- Checked 72 relative Markdown links; missing before changes: 0.
- TypeScript local-import resolution was run against the existing compiler configuration before this report: 0 unresolved imports. Application paths will not move.
- Inspected package.json command targets, CI, Playwright, TypeScript/ESLint configuration, verification, evidence collection, capture, recording, LaTeX build and packaging scripts.
- Existing packaging assumes output ZIPs at output root, copies optional Gamma/review documents, and creates only a hidden staging directory. Replace these paths with output/packages and a persistent submission/final export.
- verify.ps1 and collect-evidence.mjs currently write into docs/runs; redirect future output to docs/evidence/checks.
- docs/execution-evidence.md references historical runs and the review report: retarget to archive, retaining every authentic file.
- submission/overleaf/references.bib names the review report: update the note to the archived path; README and submission guide must link current exports.
- Capture/record scripts and browser tests expect Alex; update only the demo identity and matching selectors to Shariar.
- The existing demo API, persistent seed and registration example contain Alex Morgan. Change those display-name strings only; leave financial behavior and existing accounts untouched.
- Paper author fields remain blank for two members; the requested identity change applies to the application demo.

## Duplicate and provenance assessment

- Exact byte-identical tracked file groups: 0.
- Existing output ZIPs are generated bundles duplicating source/PDF/evidence content. They are historical snapshots, not canonical source.
- Paper figure crops and full screenshots serve different layouts and are not treated as disposable duplicates.
- Old PDFs/evidence and editable paper source will be copied to the dated archive before regeneration. A SHA-256 manifest will record every archived original.
- No working application module, migration, test or referenced evidence will be deleted.

## Planned reference validation after changes

- Resolve all active local Markdown links, LaTeX inputs/graphics/bibliography files and TypeScript imports.
- Verify packaging source paths, ZIP membership, file hashes and exclusion of archive/caches/optional preparation material from the judge view.
- Execute lint, strict typecheck, unit/API tests, Chromium workflows, Python tests and production build; retain actual logs and failures.
