param([string]$Compiler = 'tectonic')
$ErrorActionPreference = 'Continue'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command $Compiler -ErrorAction SilentlyContinue)) {
    $Compiler = Join-Path $projectRoot '.tools/tectonic/tectonic.exe'
}
if (-not (Test-Path -LiteralPath $Compiler) -and -not (Get-Command $Compiler -ErrorAction SilentlyContinue)) {
    throw 'Install Tectonic or pass -Compiler with its executable path. Overleaf can compile the source without this local tool.'
}
$buildDir = Join-Path $projectRoot '.tools/latex-build'
$outputDir = Join-Path $projectRoot 'output/pdf'
New-Item -ItemType Directory -Path $buildDir,$outputDir -Force -ErrorAction Stop | Out-Null
$papers = [ordered]@{
    'main' = '01-technical-paper.pdf'
    'security' = '02-security-self-assessment.pdf'
    'evidence' = '03-execution-evidence.pdf'
    'submission' = '04-submission-checklist.pdf'
}
Push-Location -LiteralPath (Join-Path $projectRoot 'submission/overleaf')
try {
    foreach ($paper in $papers.Keys) {
        & $Compiler --keep-logs --outdir $buildDir "$paper.tex"
        if ($LASTEXITCODE -ne 0) { throw "LaTeX compilation failed: $paper" }
        $log = Get-Content -LiteralPath (Join-Path $buildDir "$paper.log") -Raw -ErrorAction Stop
        if ($log -match 'Overfull \\hbox|undefined references|Citation.+undefined') {
            throw "Layout or reference warnings require review: $paper"
        }
        Copy-Item -LiteralPath (Join-Path $buildDir "$paper.pdf") -Destination (Join-Path $outputDir $papers[$paper]) -Force -ErrorAction Stop
    }
} finally {
    Pop-Location
}
Write-Output 'Four documents compiled. Render and visually inspect every page before delivery.'
