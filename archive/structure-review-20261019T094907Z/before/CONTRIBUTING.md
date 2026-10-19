# Contributing

Use Node.js 24, the committed npm lockfile, and synthetic data. Start with the [README](README.md), then inspect the architecture and algorithms before changing financial or approval behavior.

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` and the relevant Playwright/Python checks. Include a regression test when correcting arithmetic, validation, ownership, or approval security. Keep financial calculations on the server and store money as integer minor units.

Changes to the optional provider must preserve the deterministic fallback and must never grant the model direct mutation authority. Do not commit `.env`, credentials, session/approval tokens, real records, local caches, generated test traces or third-party competition PDFs.

Use focused commits and a clear description of the behavior and actual verification. Do not claim unexecuted tests, live database verification, compliance certification or external deployment.
