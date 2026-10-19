# Execution evidence

## Current local verification

Executed on **19 October 2026 (Asia/Dhaka)** in the supplied Windows workspace. The final suite was rerun after assembling the judge-facing layout. The current result is linked to one actual verification run; it is not inferred from CI configuration or old logs.

Run: 2026-10-19T09:26:02.573Z to 2026-10-19T09:27:40.596Z (UTC). Scope: Local isolated memory demo; no database or paid model. Browser server on port 3100. Separate Next.js output is under .next/verification; the existing port-3000 server was not reused or stopped.

| Check | Actual outcome | Raw output |
| --- | --- | --- |
| Lint | PASS | [lint.log](evidence/checks/lint.log) |
| Strict typecheck | PASS | [typecheck.log](evidence/checks/typecheck.log) |
| TypeScript/domain/API unit tests | 61 passed | [unit.log](evidence/checks/unit.log) |
| Chromium browser scenarios | 4 passed | [browser.log](evidence/checks/browser.log) |
| Python FastAPI tests | 8 passed | [python-tests.log](evidence/checks/python-tests.log) |
| Production build | PASS | [build.log](evidence/checks/build.log) |
| Synthetic seed validation | PASS | [seed.log](evidence/checks/seed.log) |

All requested checks passed: **61 TypeScript/API tests in 5 files, 4 browser scenarios and 8 Python tests**. There are no outstanding failing checks. The seed contained 134 synthetic transactions; the memory-mode CLI does not persist a named account.

[Machine-readable check outcomes](evidence/checks/check-results.json) ? [Verification summary](evidence/verification-summary.json) ? [Unit output](evidence/unit-results.json) ? [Browser output](evidence/browser-results.json)

The browser suite exercises approval/rejection and exact budget state, CSV validation/deduplication/category editing/report exports, budget CRUD and bill-reminder approval/completion, and mobile navigation/theme/dialog behavior. It now also checks that the demo account displays **Shariar Joy**. Registered-user behavior and financial calculations were not redesigned.

Non-fatal warnings from Node color settings and the installed Starlette TestClient/httpx integration remain in the raw logs. They did not fail any check. No dependencies were upgraded during this structural cleanup.

## Actual captures and recording

[Desktop dashboard](evidence/dashboard-desktop.png) ? [Mobile dashboard](evidence/dashboard-mobile.png) ? [Agent proposal](evidence/agent-proposal.png) ? [Approved result](evidence/agent-approved.png) ? [Light-theme settings](evidence/settings-light.png)

[Actual monthly PDF export](evidence/monthly-summary.pdf) ? [Sanitized audit decisions](evidence/audit-example.json) ? [Real demo recording](evidence/demo.webm) ? [Recording metadata](evidence/demo-recording.json)

The refreshed **81-second** captioned WebM records actual Chromium interactions against the isolated production build. It has no audio narration. Its assertions require the exact approved budget to be saved, a separate rejection to leave the complete budget array unchanged, and no browser page errors. The capture script independently saved the real authenticated monthly PDF and actual sanitized audit events, with no page errors.

Still captures and the video use separate fresh synthetic accounts. Their random transaction/proposal IDs need not match. The screenshots and video show Shariar Joy as a demo display name, not a claim about real finances or paper authorship. The two paper-author identity fields remain blank.

The temporary evidence-server launcher initially needed a Windows file-URL correction; after that setup correction, capture and recording succeeded. No application feature change was needed for that launcher issue.

## Historical external verification

The preserved [successful PostgreSQL/application CI run](https://github.com/Shariar-Joy/finpilot-ai/actions/runs/39220992552) verified the earlier commit `8fa49cab72e06efcadcd1d36dc2ccaad9f657cc3`. It applied a real PostgreSQL 17 migration and ran the same 61 domain/API cases against PostgreSQL, including concurrency and rollback; its application job also passed memory/Python/browser checks and build. [Observed CI metadata](evidence/ci-verification.json) records that exact run. It is historical evidence, not a newly executed remote check of this uncommitted cleanup. Repeated adapter runs are not additional unique tests.

The [earlier production Next.js/FastAPI integration record](evidence/service-integration.log) reports matching integer totals and missing-token rejection with 401. The [preserved runtime advisory scan](evidence/dependency-audit.json) reported zero runtime vulnerabilities at its recorded time; it was not rerun in this cleanup and is not a security guarantee. These authentic records were retained from the earlier execution.

The [fixed-seed benchmark](evidence/benchmark.json) is also retained unchanged. Its ten warm-ups and 100 measured runs cover in-process deterministic agent execution only, excluding seed construction, HTTP, browser rendering, database and LLM. No end-to-end latency or model-performance comparison is claimed.

## Reproduction and limits

Run npm run verify to execute the complete isolated local suite. Logs and exit codes are written to docs/evidence/checks; the runner continues to report every check if one fails and exits nonzero for any failure. FINPILOT_TEST_PORT can select another free port. Run node scripts/collect-evidence.mjs only after successful verification and current captures; it rejects failed or stale test output. See [README](../README.md) for individual commands and environment setup.

- Live paid OpenAI calls remain unverified; provider tests use mocks and the real keyless agent completes the demo task.
- This local cleanup did not start PostgreSQL or rerun database/restart-recovery checks. The earlier remote run above has its own exact scope.
- No hosted deployment, bank connection, money transfer, external notification, load test, independent penetration test or regulatory certification is claimed.
- Memory mode loses state on process restart. PostgreSQL aggregate storage, process-local rate limits, identity and retention hardening remain documented prototype limitations.

Historical logs, prior review/Gamma material, old packages and original evidence/paper versions are preserved under archive/2026-10-19-pre-simplification with a SHA-256 manifest. Current evidence and canonical paper paths remain available. Optional history is excluded from the generated judge export.

See the [architecture](architecture.md), [algorithms](algorithms.md), [security self-assessment](security-self-assessment.md), [requirements crosswalk](competition-requirements.md), [demo script](demo-script.md) and [submission guide](../submission/README.md).
