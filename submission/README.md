# FinPilot AI submission guide

The canonical deliverables are the four [compiled PDFs](../output/pdf), editable [Overleaf source](overleaf/README.md), and authentic [execution evidence](../docs/execution-evidence.md). IEEE formatting is a presentation choice, not a publication or acceptance claim. Both paper author blocks and the two-member checklist remain blank. The application demo is named **Shariar Joy**.

| Required material | Canonical location |
| --- | --- |
| Technical paper: architecture, algorithms, security and evaluation | [main.tex](overleaf/main.tex) · [PDF](../output/pdf/01-technical-paper.pdf) |
| Security self-assessment: permission tiers and known risks | [security.tex](overleaf/security.tex) · [PDF](../output/pdf/02-security-self-assessment.pdf) |
| Execution evidence and reproduction guide | [evidence.tex](overleaf/evidence.tex) · [PDF](../output/pdf/03-execution-evidence.pdf) |
| Team cover and requirements checklist | [submission.tex](overleaf/submission.tex) · [PDF](../output/pdf/04-submission-checklist.pdf) |
| Current source, setup, migrations and tests | Repository root; exact local snapshot exported by the packaging script |
| Actual sandbox recording, audit decisions and verification | [Recording](../docs/evidence/demo.webm) · [Audit](../docs/evidence/audit-example.json) · [Results](../docs/evidence/verification-summary.json) |

To verify and regenerate, run from the repository root:

```powershell
npm run verify
# Run capture-demo.mjs and record-demo.mjs against an isolated demo server when refreshing UI evidence.
node scripts/collect-evidence.mjs
powershell -File scripts/build-papers.ps1
# Render and visually check every PDF page before packaging.
powershell -File scripts/package-submission.ps1
```

The generated **submission/final** folder contains only four PDFs, an exact current source ZIP, selected authentic evidence, START_HERE.md and SHA256SUMS.txt. Open `submission/final/START_HERE.md` first. The source ZIP includes the editable papers, complete essential docs, test output and configuration; it excludes secrets, dependencies, caches and optional historical materials. After extracting the source ZIP, run the packaging script to recreate the generated judge-facing folder.

The generated **output/packages** folder contains FinPilot_AI_Overleaf.zip for direct Overleaf upload, FinPilot_AI_Submission.zip containing the complete judge-facing export, and archive checksums. Generated exports are ignored by Git and reproducible. The canonical source, evidence and PDFs remain versioned.

Historical logs, the previous review report, the optional Gamma prompt and prior ZIPs are archived outside the primary submission. No presentation deck is created or bundled. Fill both members' actual identity/enrollment/contact fields, review the requirements and accepted upload formats, and check the organizer's latest instructions before submitting. The cover is an unsigned preparation aid, not an official registration form.
