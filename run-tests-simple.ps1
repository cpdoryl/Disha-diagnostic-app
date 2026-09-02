#!/usr/bin/env pwsh
<#
.SYNOPSIS
Simple k6 Load Test Runner - Phase 5
.DESCRIPTION
Runs baseline and load tests sequentially
#>

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PHASE 5: LOAD TESTING - AUTOMATED TEST RUNNER             ║" -ForegroundColor Cyan
Write-Host "║  DISHA Diagnostic Engine Performance Testing               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$testDir = "C:\disha-diagnostic-engine"
$tests = @(
    @{ name = "Baseline Performance"; script = "k6/baseline.js"; duration = "5 minutes"; users = "1" },
    @{ name = "Light Load"; script = "k6/load-light.js"; duration = "12 minutes"; users = "50" },
    @{ name = "Normal Load"; script = "k6/load-normal.js"; duration = "15 minutes"; users = "200" },
    @{ name = "Heavy Load"; script = "k6/load-heavy.js"; duration = "18 minutes"; users = "500" },
    @{ name = "Spike Test"; script = "k6/spike-test.js"; duration = "5 minutes"; users = "100→500" }
)

Write-Host "📋 Prerequisites Check..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
$k6Check = Get-Command k6 -ErrorAction SilentlyContinue

if ($nodeCheck) { Write-Host "✅ Node.js: $(node --version)" -ForegroundColor Green }
else { Write-Host "❌ Node.js NOT found"; exit }

if ($npmCheck) { Write-Host "✅ npm: $(npm --version)" -ForegroundColor Green }
else { Write-Host "❌ npm NOT found"; exit }

if ($k6Check) { Write-Host "✅ k6: Available" -ForegroundColor Green }
else { Write-Host "⚠️  k6: Not in PATH (will show test structure instead)" -ForegroundColor Yellow }

Write-Host ""
Write-Host "📊 Test Schedule" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

foreach ($test in $tests) {
    Write-Host "  • $($test.name)" -ForegroundColor White
    Write-Host "    Duration: $($test.duration) | Users: $($test.users)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Total Duration: ~55 minutes" -ForegroundColor Yellow
Write-Host "Target App: https://disha-diagnostics.web.app/" -ForegroundColor Yellow

Write-Host ""
$response = Read-Host "Ready to start testing? (yes/no)"

if ($response -ne "yes") {
    Write-Host "Testing cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting Tests..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

$startTime = Get-Date
$results = @()
$testCount = 0

foreach ($test in $tests) {
    $testCount += 1
    Write-Host "[$testCount/$($tests.Count)] $($test.name)" -ForegroundColor Cyan
    Write-Host "  Start: $(Get-Date -Format "HH:mm:ss")" -ForegroundColor Gray
    Write-Host "  Duration: $($test.duration) | Users: $($test.users)" -ForegroundColor Gray

    $testStartTime = Get-Date
    $testPath = Join-Path $testDir $test.script

    if (Test-Path $testPath) {
        if ($k6Check) {
            try {
                Write-Host "  Running k6 test..." -ForegroundColor Gray
                & k6 run $testPath
                Write-Host "  ✅ Test completed" -ForegroundColor Green
                $results += @{ Test = $test.name; Status = "✅ Completed"; Duration = $((Get-Date) - $testStartTime).TotalSeconds }
            }
            catch {
                Write-Host "  ❌ Error: $_" -ForegroundColor Red
                $results += @{ Test = $test.name; Status = "❌ Failed"; Duration = 0 }
            }
        }
        else {
            Write-Host "  📄 Test script preview:" -ForegroundColor Gray
            Get-Content $testPath | Select-Object -First 15 | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray }
            Write-Host "     ..." -ForegroundColor DarkGray
            Write-Host "  ℹ️  k6 not found. To install:" -ForegroundColor Yellow
            Write-Host "     Visit: https://github.com/grafana/k6/releases" -ForegroundColor Yellow
            Write-Host "     Or run: npm install -g k6" -ForegroundColor Yellow
            $results += @{ Test = $test.name; Status = "⏭️  Skipped (k6 not found)"; Duration = 0 }
        }
    }
    else {
        Write-Host "  ❌ Test file not found: $testPath" -ForegroundColor Red
        $results += @{ Test = $test.name; Status = "❌ File not found"; Duration = 0 }
    }

    Write-Host ""
    if ($testCount -lt $tests.Count) {
        Write-Host "  ⏳ Preparing next test..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

$endTime = Get-Date
$totalTime = $endTime - $startTime

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST EXECUTION COMPLETE                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

foreach ($result in $results) {
    Write-Host "  $($result.Test): $($result.Status)" -ForegroundColor White
}

Write-Host ""
Write-Host "⏱️  Total Time: $([math]::Round($totalTime.TotalMinutes, 2)) minutes" -ForegroundColor Yellow
Write-Host "Start: $($startTime.ToString("HH:mm:ss"))" -ForegroundColor Gray
Write-Host "End:   $($endTime.ToString("HH:mm:ss"))" -ForegroundColor Gray

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review test results above" -ForegroundColor White
Write-Host "  2. Run extended tests (endurance, workflow, survey)" -ForegroundColor White
Write-Host "  3. Analyze performance data" -ForegroundColor White
Write-Host "  4. Create comprehensive report" -ForegroundColor White

Write-Host ""
Write-Host "✅ Phase 5 testing framework ready!" -ForegroundColor Green
Write-Host ""
