$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot 'output'
$sourceDir = Join-Path $projectRoot 'submission/overleaf'
$stageDir = Join-Path $projectRoot '.tools/submission-package'
if (Test-Path -LiteralPath $stageDir) {
    $resolved = (Resolve-Path -LiteralPath $stageDir).Path
    $expected = [IO.Path]::GetFullPath((Join-Path $projectRoot '.tools/submission-package'))
    if ($resolved -ne $expected -or -not $resolved.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe package staging path' }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
New-Item -ItemType Directory -Path $stageDir,$outputDir -Force | Out-Null
$overleaf = Join-Path $outputDir 'FinPilot_AI_Overleaf.zip'
Compress-Archive -Path (Join-Path $sourceDir '*') -DestinationPath $overleaf -Force
Copy-Item -LiteralPath (Join-Path $outputDir 'pdf') -Destination (Join-Path $stageDir 'pdf') -Recurse
Copy-Item -LiteralPath $overleaf -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/gamma-presentation-prompt.md') -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/competition-requirements.md') -Destination $stageDir
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs/review-report.md') -Destination $stageDir
$startHere = @(
    '# FinPilot AI submission package',
    '',
    'Source and setup: https://github.com/Shariar-Joy/finpilot-ai',
    '',
    '## Included files',
    '',
    '- pdf/01-technical-paper.pdf: architecture, algorithms, security and measured evaluation.',
    '- pdf/02-security-self-assessment.pdf: permission tiers, controls, verification and residual risks.',
    '- pdf/03-execution-evidence.pdf: actual sandbox evidence and reproduction instructions.',
    '- pdf/04-submission-checklist.pdf: two-member blank identity fields and requirements checklist.',
    '- FinPilot_AI_Overleaf.zip: upload this ZIP to Overleaf; select main.tex and compile with pdfLaTeX.',
    '- evidence/demo.webm: actual captioned application recording; no presentation deck is included.',
    '- evidence/: recording metadata, real synthetic audit events, test summary, benchmark and screenshots.',
    '- gamma-presentation-prompt.md: prompt for creating the presentation separately.',
    '- competition-requirements.md and review-report.md: requirements mapping and completed source review.',
    '- SHA256SUMS.txt: checksums for package contents.',
    '',
    '## Before submitting',
    '',
    'Fill both members identity, institution and contact fields in the LaTeX sources; review eligibility, claims, independence/IP terms and signatures. The blank fields are not signed declarations. Recompile and inspect all four documents after editing.',
    '',
    'This package uses synthetic financial data. Local PostgreSQL and live paid-model execution were not exercised; consult the repository CI outcome for remote database verification. No hosted application or security certification is claimed.',
    '',
    'The supplied rules state a deadline of 20 October 2026, 23:59 Beijing time (21:59 Bangladesh). Check later organizer notices and the accepted upload format before submission.'
)
$startHere | Set-Content -LiteralPath (Join-Path $stageDir 'START_HERE.md') -Encoding utf8
$evidenceDir = Join-Path $stageDir 'evidence'
New-Item -ItemType Directory -Path $evidenceDir | Out-Null
foreach ($file in @('demo.webm','demo-recording.json','audit-example.json','verification-summary.json','benchmark.json','dashboard-desktop.png','agent-approved.png')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "docs/evidence/$file") -Destination $evidenceDir
}
Get-ChildItem -LiteralPath $stageDir -Recurse -File | Sort-Object FullName | ForEach-Object {
    $relative = $_.FullName.Substring($stageDir.Length + 1).Replace('\','/')
    '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower(), $relative
} | Set-Content -LiteralPath (Join-Path $stageDir 'SHA256SUMS.txt') -Encoding ascii
Compress-Archive -Path (Join-Path $stageDir '*') -DestinationPath (Join-Path $outputDir 'FinPilot_AI_Submission.zip') -Force
Get-FileHash -LiteralPath $overleaf,(Join-Path $outputDir 'FinPilot_AI_Submission.zip') -Algorithm SHA256 | Format-Table Algorithm,Hash,Path
