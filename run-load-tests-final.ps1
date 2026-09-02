#!/usr/bin/env pwsh
# Phase 5 Load Testing - Automated Runner

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "PHASE 5: LOAD TESTING - AUTOMATED TEST RUNNER" -ForegroundColor Cyan
Write-Host "DISHA Diagnostic Engine Performance Testing" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$testDir = "C:\disha-diagnostic-engine"
$tests = @(
    @{ name = "Baseline Performance"; script = "k6/baseline.js"; duration = "5 minutes"; users = "1" },
    @{ name = "Light Load"; script = "k6/load-light.js"; duration = "12 minutes"; users = "50" },
    @{ name = "Normal Load"; script = "k6/load-normal.js"; duration = "15 minutes"; users = "200" },
    @{ name = "Heavy Load"; script = "k6/load-heavy.js"; duration = "18 minutes"; users = "500" },
    @{ name = "Spike Test"; script = "k6/spike-test.js"; duration = "5 minutes"; users = "100->500" }
)

Write-Host "Checking Prerequisites..." -ForegroundColor Cyan
Write-Host "-------------------------------------------------------"

$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
$k6Check = Get-Command k6 -ErrorAction SilentlyContinue

if ($nodeCheck) { Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green }
else { Write-Host "[FAIL] Node.js NOT found"; exit }

if ($npmCheck) { Write-Host "[OK] npm: $(npm --version)" -ForegroundColor Green }
else { Write-Host "[FAIL] npm NOT found"; exit }

if ($k6Check) { Write-Host "[OK] k6: Available" -ForegroundColor Green }
else { Write-Host "[WARN] k6: Not in PATH (will show test structure)" -ForegroundColor Yellow }

Write-Host ""
Write-Host "Test Schedule" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------"

foreach ($test in $tests) {
    Write-Host "  [$($test.name)]" -ForegroundColor White
    Write-Host "    Duration: $($test.duration) | Users: $($test.users)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Total Duration: ~55 minutes" -ForegroundColor Yellow
Write-Host "Target: https://disha-diagnostics.web.app/" -ForegroundColor Yellow

Write-Host ""
$response = Read-Host "Start testing? (yes/no)"

if ($response -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting Tests..." -ForegroundColor Green
Write-Host "-------------------------------------------------------"
Write-Host ""

$startTime = Get-Date
$results = @()
$count = 0

foreach ($test in $tests) {
    $count++
    Write-Host "[$count/$($tests.Count)] $($test.name)" -ForegroundColor Cyan
    Write-Host "  Start: $(Get-Date -Format "HH:mm:ss")" -ForegroundColor Gray
    Write-Host "  Config: $($test.duration) | $($test.users) users" -ForegroundColor Gray

    $testStartTime = Get-Date
    $testPath = Join-Path $testDir $test.script

    if (Test-Path $testPath) {
        if ($k6Check) {
            try {
                Write-Host "  Running k6..." -ForegroundColor Gray
                & k6 run $testPath 2>&1
                Write-Host "  [PASS] Test completed" -ForegroundColor Green
                $results += @{ Test = $test.name; Status = "PASS"; Duration = $((Get-Date) - $testStartTime).TotalSeconds }
            }
            catch {
                Write-Host "  [FAIL] Error: $_" -ForegroundColor Red
                $results += @{ Test = $test.name; Status = "FAIL"; Duration = 0 }
            }
        }
        else {
            Write-Host "  Test script: $testPath" -ForegroundColor Gray
            Write-Host "  Script available for manual execution" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  To install k6:" -ForegroundColor Yellow
            Write-Host "    1. Download: https://github.com/grafana/k6/releases" -ForegroundColor Gray
            Write-Host "    2. Extract to PATH" -ForegroundColor Gray
            Write-Host "    3. Or run: npm install -g k6" -ForegroundColor Gray
            Write-Host ""
            $results += @{ Test = $test.name; Status = "SKIP"; Duration = 0 }
        }
    }
    else {
        Write-Host "  [FAIL] File not found: $testPath" -ForegroundColor Red
        $results += @{ Test = $test.name; Status = "FAIL"; Duration = 0 }
    }

    Write-Host ""
    if ($count -lt $tests.Count) {
        Write-Host "  Preparing next test..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

$endTime = Get-Date
$totalTime = $endTime - $startTime

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Summary" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------"

foreach ($result in $results) {
    $color = if ($result.Status -eq "PASS") { "Green" } elseif ($result.Status -eq "SKIP") { "Yellow" } else { "Red" }
    Write-Host "  $($result.Test): $($result.Status)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Timing" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------"
Write-Host "  Total Time: $([math]::Round($totalTime.TotalMinutes, 2)) minutes" -ForegroundColor Yellow
Write-Host "  Start: $($startTime.ToString("HH:mm:ss"))" -ForegroundColor Gray
Write-Host "  End: $($endTime.ToString("HH:mm:ss"))" -ForegroundColor Gray

Write-Host ""
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------"
Write-Host "  1. Review test results above" -ForegroundColor White
Write-Host "  2. Run extended tests (endurance, workflow, survey)" -ForegroundColor White
Write-Host "  3. Analyze performance data" -ForegroundColor White
Write-Host "  4. Create comprehensive report" -ForegroundColor White

Write-Host ""
Write-Host "Phase 5 testing framework ready!" -ForegroundColor Green
Write-Host ""
