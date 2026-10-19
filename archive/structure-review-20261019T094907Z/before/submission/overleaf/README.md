# Overleaf package

Upload the complete ZIP using **New Project → Upload Project**. Keep all files and the `figures/` directory together.

Use **pdfLaTeX**, a recent TeX Live version, and `main.tex` as the main document. Recompile from scratch after changing the bibliography. The standard `IEEEtran` class and bibliography style are available in Overleaf; no paid package, shell escape, minted, external script or secret is required.

Change Overleaf's main document to compile the other required paperwork:

- `main.tex`: technical paper, standard IEEE conference two-column layout.
- `security.tex`: separate security self-assessment, IEEE two-column layout.
- `evidence.tex`: execution evidence/reproduction report, IEEE two-column layout.
- `submission.tex`: cover/team form/checklist, IEEE one-column layout for readable form fields.

`shared.tex` holds the two blank team-member author blocks. Replace the blank name, institution and email fields there; complete the extra team and signature fields in `submission.tex`. Do not invent affiliations or sign a declaration before reviewing it. `results.tex` is generated from executed local verification and benchmark data; update only after new runs.

The report contains actual application screenshots and original vector architecture/approval diagrams. It is formatted using IEEE conventions; no IEEE publication, acceptance, logo, copyright number or endorsement is claimed. The competition PDF itself is not redistributed.

Read the main repository README, requirements crosswalk and execution evidence. Optional presentation-preparation notes are archived outside the final submission; no deck is included. The package contains an actual captioned demo recording with its metadata, alongside screenshots and audit records.
