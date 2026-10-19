# Archive — outside the primary submission

The file-by-file [structure audit](structure-audit.md) was completed before the cleanup. It records every KEEP, MOVE, ARCHIVE and DELETE decision; no deletion was selected.

The dated `2026-10-19-pre-simplification` snapshot preserves historical command logs, the previous review report, the optional Gamma prompt, old output ZIPs/checksums, original evidence, paper sources/PDFs and the pre-existing local Next.js type declaration. Its `manifest.json` records original file hashes. These records describe earlier runs and are not current verification results.

Current application and financial behavior are retained. Canonical current evidence is in `docs/evidence`, editable papers in `submission/overleaf`, and compiled papers in `output/pdf`. The generated `submission/final` folder is the judge-facing view; generated download ZIPs live in `output/packages`.

The packaging script excludes this archive from the source snapshot and judge export. Repeated packaging preserves prior generated exports in the ignored `generated-exports` directory instead of deleting them.

The later [structure review decision table](structure-review-20261019T094907Z/KEEP_MOVE_ARCHIVE_DELETE.md) records the 118 primary files and every existing archived file before this review. Its adjacent `before/` snapshot and SHA-256 manifest preserve the pre-existing working tree, including local edits, before verification records were refreshed. No application feature changes or deletions form part of that review.
