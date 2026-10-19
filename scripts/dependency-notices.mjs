import { readFile, writeFile } from "node:fs/promises";
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const packages = [];
for (const [path, entry] of Object.entries(lock.packages)) {
  if (!path || entry.dev) continue;
  try {
    const pkg = JSON.parse(await readFile(`${path}/package.json`, "utf8"));
    packages.push({
      name: pkg.name,
      version: pkg.version,
      license:
        typeof pkg.license === "string"
          ? pkg.license
          : "See package license file",
      repository:
        typeof pkg.repository === "string"
          ? pkg.repository
          : (pkg.repository?.url ?? pkg.homepage ?? null),
    });
  } catch {
    /* Platform-specific optional packages may not be installed here. */
  }
}
packages.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(
  "docs/dependency-licenses.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scope:
        "Installed runtime dependency metadata; optional packages absent on this platform are not listed",
      packages,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Recorded ${packages.length} installed runtime dependency notices.`,
);
