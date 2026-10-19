$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    & node scripts/verify.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Verification failed; inspect docs/evidence/checks/check-results.json' }
} finally {
    Pop-Location
}

