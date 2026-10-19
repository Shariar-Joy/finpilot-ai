$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = Split-Path -Parent $PSScriptRoot
$runId = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8)
$buildRoot = Join-Path $projectRoot ".tools/package-build/$runId"
$sourceStage = Join-Path $buildRoot 'source'
$judgeStage = Join-Path $buildRoot 'final'
$packageStage = Join-Path $buildRoot 'packages'
New-Item -ItemType Directory -Path $sourceStage,$judgeStage,$packageStage -Force | Out-Null
function Copy-ProjectFile([string]$relative, [string]$destinationRoot) {
    $source = Join-Path $projectRoot $relative
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing required source: $relative" }
    $destination = Join-Path $destinationRoot $relative
    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination
}
function Copy-ProjectTree([string]$relative, [string]$destinationRoot) {
    $tree = Join-Path $projectRoot $relative
    foreach ($file in Get-ChildItem -LiteralPath $tree -Recurse -File -Force) {
        $fileRelative = $file.FullName.Substring($projectRoot.Length + 1).Replace('\','/')
        if ($fileRelative -match '(^|/)(__pycache__|\.venv|node_modules|\.pytest_cache)(/|$)' -or $file.Extension -eq '.pyc') { continue }
        Copy-ProjectFile $fileRelative $destinationRoot
    }
}
function Save-PreviousExport([string]$relative) {
    $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
    $destination = [IO.Path]::GetFullPath((Join-Path $projectRoot ("archive/generated-exports/$runId/" + $relative.Replace('/','-'))))
    if (-not $source.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar) -or -not $destination.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe export archive path' }
    if (Test-Path -LiteralPath $source) {
        if ((Resolve-Path -LiteralPath $source).Path -ne $source) { throw 'Unexpected resolved export path' }
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        Move-Item -LiteralPath $source -Destination $destination
    }
}
$checkRecord = Get-Content -LiteralPath (Join-Path $projectRoot 'docs/evidence/checks/check-results.json') -Raw | ConvertFrom-Json
if (-not $checkRecord.passed) { throw 'Final packaging requires an actual successful verification run' }
$summary = Get-Content -LiteralPath (Join-Path $projectRoot 'docs/evidence/verification-summary.json') -Raw | ConvertFrom-Json
if ($summary.verificationStartedAt -ne $checkRecord.startedAt) { throw 'Collect current verification evidence before packaging' }
$rootFiles = @('.env.example','.gitattributes','.gitignore','.prettierignore','AGENTS.md','CONTRIBUTING.md','LICENSE','README.md','SECURITY.md','THIRD_PARTY_NOTICES.md','docker-compose.yml','eslint.config.mjs','next-env.d.ts','next.config.ts','package.json','package-lock.json','playwright.config.ts','postcss.config.mjs','tsconfig.json','vitest.config.ts','submission/README.md')
foreach ($file in $rootFiles) { Copy-ProjectFile $file $sourceStage }
foreach ($tree in @('src','services','prisma','tests','e2e','scripts','public','.github','docs/evidence','submission/overleaf','output/pdf')) { Copy-ProjectTree $tree $sourceStage }
foreach ($name in @('architecture.md','algorithms.md','competition-requirements.md','security-self-assessment.md','execution-evidence.md','demo-script.md','dependency-licenses.json')) { Copy-ProjectFile "docs/$name" $sourceStage }
$sourceManifest = foreach ($file in Get-ChildItem -LiteralPath $sourceStage -Recurse -File -Force | Sort-Object FullName) {
    [ordered]@{ path = $file.FullName.Substring($sourceStage.Length + 1).Replace('\','/'); sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLower() }
}
[ordered]@{ description = 'Exact local source snapshot; excludes archive, dependencies, secrets and generated submission exports'; createdAt = [DateTime]::UtcNow.ToString('o'); files = @($sourceManifest) } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $sourceStage 'SOURCE_MANIFEST.json') -Encoding utf8
[IO.Compression.ZipFile]::CreateFromDirectory($sourceStage,(Join-Path $judgeStage 'FinPilot_AI_Source.zip'))
foreach ($name in @('01-technical-paper.pdf','02-security-self-assessment.pdf','03-execution-evidence.pdf','04-submission-checklist.pdf')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "output/pdf/$name") -Destination $judgeStage
}
$evidenceDir = Join-Path $judgeStage 'evidence'
New-Item -ItemType Directory -Path $evidenceDir | Out-Null
foreach ($name in @('demo.webm','demo-recording.json','audit-example.json','verification-summary.json','ci-verification.json','benchmark.json','unit-results.json','browser-results.json','dashboard-desktop.png','agent-approved.png')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "docs/evidence/$name") -Destination $evidenceDir
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/evidence/checks/check-results.json') -Destination (Join-Path $evidenceDir 'check-results.json')
$startHere = @(
    '# FinPilot AI - start here',
    '',
    '2026 Shenzhen International FinTech Competition, Topic A: Personal Finance Assistant.',
    '',
    '## Review order',
    '',
    '1. 01-technical-paper.pdf - architecture, algorithms, security and measured evaluation.',
    '2. 02-security-self-assessment.pdf - permission tiers, approvals and residual risks.',
    '3. 03-execution-evidence.pdf - actual sandbox behavior and reproduction guide.',
    '4. evidence/demo.webm - actual captioned application recording; synthetic data only.',
    '5. FinPilot_AI_Source.zip - exact current local source, editable paper source, configuration, tests, essential documentation and authentic evidence.',
    '6. 04-submission-checklist.pdf - team fields and final review checklist.',
    '',
    'SHA256SUMS.txt verifies the exported files. Optional Gamma/review notes, historical logs and old packages are archived outside this folder.',
    '',
    '## Run the application',
    '',
    'Extract FinPilot_AI_Source.zip. Install Node.js 24 LTS, then run:',
    '',
    '    npm ci',
    '    npm run dev',
    '',
    'Open http://127.0.0.1:3000 and choose Explore the live demo. The new isolated demo account is named Shariar Joy. No database or model key is required.',
    '',
    'For editable papers, open submission/overleaf from the source ZIP, upload that folder as an Overleaf project and select main.tex with pdfLaTeX. A standalone Overleaf ZIP is generated separately under output/packages in the workspace.',
    '',
    '## Verification and scope',
    '',
    "Current local results: $($summary.unit.passed) TypeScript/API tests, $($summary.browser.passed) Chromium scenarios and $($summary.python.passed) Python tests; lint, strict types, seed and production build passed. See evidence/check-results.json for actual outcomes and timestamps.",
    '',
    'The PostgreSQL record in evidence/ci-verification.json is an earlier successful remote CI run with its exact commit; it is not a new remote run of this local cleanup. Current source and logs are in the source ZIP. Live paid-model execution, hosted deployment and restart recovery remain unverified.',
    '',
    'Only synthetic financial data is used. In-memory mode loses data on restart. No bank connection, transfer or external notification is performed.',
    '',
    '## Team review',
    '',
    'Both paper author blocks and the two-member checklist remain blank. The demo display name is not an authorship or eligibility declaration. Complete actual team details, review all claims and check the latest organizer instructions before submission.',
    '',
    'Repository and history: https://github.com/Shariar-Joy/finpilot-ai'
)
[IO.File]::WriteAllLines((Join-Path $judgeStage 'START_HERE.md'),$startHere,(New-Object Text.UTF8Encoding($false)))
$hashes = Get-ChildItem -LiteralPath $judgeStage -Recurse -File | Sort-Object FullName | ForEach-Object {
    '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower(), $_.FullName.Substring($judgeStage.Length + 1).Replace('\','/')
}
[IO.File]::WriteAllLines((Join-Path $judgeStage 'SHA256SUMS.txt'),[string[]]$hashes,[Text.Encoding]::ASCII)
[IO.Compression.ZipFile]::CreateFromDirectory((Join-Path $projectRoot 'submission/overleaf'),(Join-Path $packageStage 'FinPilot_AI_Overleaf.zip'))
[IO.Compression.ZipFile]::CreateFromDirectory($judgeStage,(Join-Path $packageStage 'FinPilot_AI_Submission.zip'))
$packageHashes = Get-ChildItem -LiteralPath $packageStage -Filter '*.zip' -File | Sort-Object Name | ForEach-Object {
    '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower(), $_.Name
}
[IO.File]::WriteAllLines((Join-Path $packageStage 'SHA256SUMS.txt'),[string[]]$packageHashes,[Text.Encoding]::ASCII)
Save-PreviousExport 'submission/final'
Save-PreviousExport 'output/packages'
Move-Item -LiteralPath $judgeStage -Destination (Join-Path $projectRoot 'submission/final')
Move-Item -LiteralPath $packageStage -Destination (Join-Path $projectRoot 'output/packages')
Write-Output 'Judge-facing export: submission/final/START_HERE.md'
Write-Output 'Regenerated packages: output/packages/'
