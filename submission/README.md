# FinPilot AI submission package

The competition appendix was inspected in full. It requires technical documentation, a security self-assessment, source/deployment instructions/tests, and non-on-chain sandbox evidence. IEEE formatting is used at the user's request; it is not a publication or acceptance claim.

| Deliverable                                                                     | Editable source                           | Compiled output                                                  |
| ------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Technical paper — architecture, algorithms, security, evaluation and references | [main.tex](overleaf/main.tex)             | [Technical paper](../output/pdf/01-technical-paper.pdf)          |
| Security self-assessment — permission tiers, controls, tests, risk register     | [security.tex](overleaf/security.tex)     | [Security report](../output/pdf/02-security-self-assessment.pdf) |
| Execution evidence — actual task, reproduction, recording, verification limits  | [evidence.tex](overleaf/evidence.tex)     | [Execution report](../output/pdf/03-execution-evidence.pdf)      |
| Cover and team/submission checklist                                             | [submission.tex](overleaf/submission.tex) | [Cover/checklist](../output/pdf/04-submission-checklist.pdf)     |

Upload [FinPilot_AI_Overleaf.zip](../output/FinPilot_AI_Overleaf.zip) to Overleaf as a new project. Use pdfLaTeX with `main.tex` as the main document; choose the other `.tex` files to compile each companion. See [Overleaf instructions](overleaf/README.md). The [complete paperwork/evidence ZIP](../output/FinPilot_AI_Submission.zip) includes the PDFs, editable source, Gamma prompt and actual recording/evidence.

Both member names, institutions and emails are blank in `shared.tex`; the cover has extra identity, nationality, enrollment, contribution and signature fields. Complete them using actual information. These are unsigned preparation fields, not an official registration form or a claim that eligibility is satisfied.

[Actual short recording](../docs/evidence/demo.webm) · [Recording metadata](../docs/evidence/demo-recording.json) · [Actual test summary](../docs/evidence/verification-summary.json) · [Audit events](../docs/evidence/audit-example.json) · [Benchmark scope/data](../docs/evidence/benchmark.json) · [Gamma prompt](../docs/gamma-presentation-prompt.md)

No deck has been created. The supplied video has descriptive captions and no narration; review the accepted upload format before submitting. The supplied appendix says the deadline is **20 October 2026, 23:59 Beijing / 21:59 Bangladesh**, subject to any later organizer notice. For a two-member team, the appendix's at-least-60% non-Chinese requirement means both members must be non-Chinese. Check all eligibility and independence/IP requirements rather than treating blank forms as declarations.

To rebuild locally, install Tectonic or use the ignored local compiler under `.tools`, run `node scripts/collect-evidence.mjs` after actual tests, then `powershell -File scripts/build-papers.ps1`. To regenerate figures/recording, run the documented capture scripts against the app. The final PDFs were compiled and every page visually reviewed; local compiler caches and page-preview PNGs are excluded from the repository.
