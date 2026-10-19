# Third-party notices

FinPilot AI uses third-party software under the respective package licenses. The project license does not replace them. Exact npm versions are in `package-lock.json`; [generated runtime metadata](docs/dependency-licenses.json) records installed package names, versions, declared licenses and upstream repositories. Rebuild it with `node scripts/dependency-notices.mjs` after dependency changes. Platform-specific optional packages not installed on the generating machine are identified by the lockfile and retain their own notices.

Principal components include Next.js, React, Tailwind CSS, Recharts, Lucide, Zod, Papa Parse, PDF-lib, iron-session, cookie, bcryptjs, Prisma/PostgreSQL, FastAPI, Pydantic and uvicorn. Refer to the installed distribution's LICENSE/NOTICE files for full terms. Python requirements pin the application service versions; their installed distributions retain upstream notices.

The paperwork uses the standard IEEEtran LaTeX class and bibliography conventions supplied by the TeX distribution, plus TikZ, graphicx, amsmath, cite and hyperref. The source does not redistribute the IEEE template class, competition rule PDF, external publication text, trademarks, or publisher logos. Formatting does not imply IEEE affiliation, acceptance, or endorsement.

Product screenshots and diagrams were captured or authored from this project. Merchant names in the seed are fictional demonstration labels or text references and do not indicate sponsorship. No external stock imagery, real bank account dataset, or copyrighted competition poster is included in the source package.

Portable LaTeX/Poppler tools are local QA dependencies kept outside versioned source under `.tools`; their binaries are not published in the repository. Do not remove upstream notices when packaging executable application dependencies.
