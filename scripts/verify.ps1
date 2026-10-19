$ErrorActionPreference = 'Continue'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    New-Item -ItemType Directory -Path 'docs/runs' -Force | Out-Null
    foreach ($check in @('lint', 'typecheck', 'test', 'seed', 'build', 'test:e2e')) {
        & npm.cmd run $check 2>&1 | Tee-Object -FilePath "docs/runs/$($check.Replace(':', '-')).log"
        if ($LASTEXITCODE -ne 0) { throw "Check failed: $check ($LASTEXITCODE)" }
    }
    & python -m unittest discover -s services/analytics -v 2>&1 | Tee-Object -FilePath 'docs/runs/python-tests.log'
    if ($LASTEXITCODE -ne 0) { throw 'Python tests failed' }
} finally {
    Pop-Location
}

