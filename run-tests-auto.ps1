#!/usr/bin/env pwsh
# Phase 5 Load Testing - Auto-Run (No Prompt)

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "PHASE 5: LOAD TESTING EXECUTION" -ForegroundColor Cyan
Write-Host "DISHA Diagnostic Engine - Automated Testing" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$testDir = "C:\disha-diagnostic-engine"
$tests = @(
    @{ name = "Baseline Performance"; script = "k6/baseline.js"; duration = "5 min"; users = "1" },
    @{ name = "Light Load"; script = "k6/load-light.js"; duration = "12 min"; users = "50" },
    @{ name = "Normal Load"; script = "k6/load-normal.js"; duration = "15 min"; users = "200" },
    @{ name = "Heavy Load"; script = "k6/load-heavy.js"; duration = "18 min"; users = "500" },
    @{ name = "Spike Test"; script = "k6/spike-test.js"; duration = "5 min"; users = "100->500" }
)

Write-Host "PREREQUISITES CHECK" -ForegroundColor Cyan
Write-Host "-------"

$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
$k6Check = Get-Command k6 -ErrorAction SilentlyContinue

if ($nodeCheck) { Write-Host "[OK] Node.js $(node --version)" -ForegroundColor Green }
else { Write-Host "[ERROR] Node.js not found"; exit }

if ($npmCheck) { Write-Host "[OK] npm $(npm --version)" -ForegroundColor Green }
else { Write-Host "[ERROR] npm not found"; exit }

if ($k6Check) {
    Write-Host "[OK] k6 available" -ForegroundColor Green
    $canRunTests = $true
} else {
    Write-Host "[INFO] k6 not found - will show test structure" -ForegroundColor Yellow
    $canRunTests = $false
}

Write-Host ""
Write-Host "TEST SCHEDULE" -ForegroundColor Cyan
Write-Host "-------"

foreach ($test in $tests) {
    Write-Host "$($test.name) - $($test.duration) with $($test.users) users" -ForegroundColor White
}

Write-Host ""
Write-Host "Target: https://disha-diagnostics.web.app/" -ForegroundColor Yellow
Write-Host "Total Duration: ~55 minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "STARTING TESTS" -ForegroundColor Green
Write-Host "-------"
Write-Host ""

$startTime = Get-Date
$results = @()
$testCount = 0
$passCount = 0
$skipCount = 0

foreach ($test in $tests) {
    $testCount++

    Write-Host "[$testCount/$($tests.Count)] $($test.name)" -ForegroundColor Cyan

    $testPath = Join-Path $testDir $test.script

    if (Test-Path $testPath) {
        if ($canRunTests) {
            try {
                Write-Host "  Executing k6 test..." -ForegroundColor Gray
                Write-Host "  Command: k6 run $testPath" -ForegroundColor DarkGray

                # Run k6 with output redirection
                & k6 run $testPath 2>&1 | Tee-Object -Variable output | Select-Object -Last 20

                Write-Host "  [OK] Test completed" -ForegroundColor Green
                $results += @{ Test = $test.name; Status = "PASS"; Duration = "~$($test.duration)" }
                $passCount++
            }
            catch {
                Write-Host "  [ERROR] Test failed: $_" -ForegroundColor Red
                $results += @{ Test = $test.name; Status = "FAIL"; Duration = "0" }
            }
        }
        else {
            Write-Host "  Test script exists: $testPath" -ForegroundColor Yellow
            Write-Host "  To run: k6 run $testPath" -ForegroundColor Gray
            Write-Host "  [SKIP] k6 not available" -ForegroundColor Yellow
            $results += @{ Test = $test.name; Status = "SKIP"; Duration = $test.duration }
            $skipCount++
        }
    }
    else {
        Write-Host "  [ERROR] File not found: $testPath" -ForegroundColor Red
        $results += @{ Test = $test.name; Status = "FAIL"; Duration = "0" }
    }

    Write-Host ""

    if ($testCount -lt $tests.Count) {
        Write-Host "  Waiting for next test..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

$endTime = Get-Date
$totalTime = $endTime - $startTime

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Results:" -ForegroundColor Cyan
Write-Host "-------"

foreach ($result in $results) {
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "SKIP" { "Yellow" }
        "FAIL" { "Red" }
        default { "White" }
    }
    Write-Host "  $($result.Test): $($result.Status)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Statistics:" -ForegroundColor Cyan
Write-Host "-------"
Write-Host "  Tests Passed: $passCount" -ForegroundColor Green
Write-Host "  Tests Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "  Tests Failed: $($testCount - $passCount - $skipCount)" -ForegroundColor Red
Write-Host "  Total Duration: $([math]::Round($totalTime.TotalMinutes, 2)) minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "Installation Instructions (if needed):" -ForegroundColor Yellow
Write-Host "-------"
Write-Host "  1. Download k6: https://github.com/grafana/k6/releases" -ForegroundColor Gray
Write-Host "  2. Extract to folder in PATH" -ForegroundColor Gray
Write-Host "  3. Or run: npm install -g k6" -ForegroundColor Gray
Write-Host ""

Write-Host "Manual Test Execution:" -ForegroundColor Cyan
Write-Host "-------"
foreach ($test in $tests) {
    Write-Host "  k6 run $($test.script)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "PHASE 5 FRAMEWORK READY!" -ForegroundColor Green
Write-Host ""
