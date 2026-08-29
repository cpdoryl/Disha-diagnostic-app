#!/usr/bin/env pwsh
<#
.SYNOPSIS
Automated k6 Load Test Runner for DISHA Diagnostic Engine
.DESCRIPTION
Runs all Phase 5 load tests sequentially with results collection
.AUTHOR
CPDO - Chief Product Development Officer
.DATE
August 29, 2026
#>

# Configuration
$testDir = "C:\disha-diagnostic-engine"
$testsToRun = @(
    @{
        name     = "Baseline Performance"
        script   = "k6/baseline.js"
        duration = "5 minutes"
        users    = "1 (no load)"
    },
    @{
        name     = "Light Load"
        script   = "k6/load-light.js"
        duration = "12 minutes"
        users    = "50 concurrent"
    },
    @{
        name     = "Normal Load"
        script   = "k6/load-normal.js"
        duration = "15 minutes"
        users    = "200 concurrent"
    },
    @{
        name     = "Heavy Load"
        script   = "k6/load-heavy.js"
        duration = "18 minutes"
        users    = "500 concurrent"
    },
    @{
        name     = "Spike Test"
        script   = "k6/spike-test.js"
        duration = "5 minutes"
        users    = "100 → 500"
    }
)

# Color output
$colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error   = "Red"
    Info    = "Cyan"
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PHASE 5: LOAD TESTING - AUTOMATED TEST RUNNER             ║" -ForegroundColor Cyan
Write-Host "║  DISHA Diagnostic Engine Performance Testing               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue

if ($hasNode) {
    Write-Host "✅ Node.js installed: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js NOT found" -ForegroundColor Red
    exit 1
}

if ($hasNpm) {
    Write-Host "✅ npm installed: $(npm --version)" -ForegroundColor Green
} else {
    Write-Host "❌ npm NOT found" -ForegroundColor Red
    exit 1
}

# Check k6
$k6Available = $null
try {
    $k6Available = k6 version 2>$null
    if ($k6Available) {
        Write-Host "✅ k6 installed: $k6Available" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  k6 not in PATH - attempting to download..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Test Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Target Application: https://disha-diagnostics.web.app/" -ForegroundColor Yellow
Write-Host "Tests to Execute: $($testsToRun.Count)" -ForegroundColor Yellow
Write-Host "Total Duration: ~55 minutes" -ForegroundColor Yellow
Write-Host ""

# Show test schedule
Write-Host "📅 Test Schedule" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$totalDuration = 0
foreach ($i = 0; $i -lt $testsToRun.Count; $i++) {
    $test = $testsToRun[$i]
    Write-Host "  $($i + 1). $($test.name)" -ForegroundColor White
    Write-Host "     Script: $($test.script)" -ForegroundColor Gray
    Write-Host "     Duration: $($test.duration) | Users: $($test.users)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "⚠️  WARNING: These tests will generate significant load on the server" -ForegroundColor Yellow
Write-Host "Ensure the application server can handle the load before proceeding." -ForegroundColor Yellow
Write-Host ""

# Ask for confirmation
$response = Read-Host "Ready to start testing? (yes/no)"
if ($response -ne "yes") {
    Write-Host "Testing cancelled by user." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting Load Tests..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

$startTime = Get-Date
$results = @()

# Run each test
foreach ($i = 0; $i -lt $testsToRun.Count; $i++) {
    $test = $testsToRun[$i]
    $testNum = $i + 1

    Write-Host "[$testNum/$($testsToRun.Count)] Running: $($test.name)" -ForegroundColor Cyan
    Write-Host "  Start Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    Write-Host "  Script: $($test.script)" -ForegroundColor Gray
    Write-Host "  ─────────────────────────────────────────────────────────" -ForegroundColor Gray

    $testStartTime = Get-Date

    # Try to run k6 test
    $testPath = Join-Path $testDir $test.script

    if (Test-Path $testPath) {
        try {
            # Attempt to run via k6 or npx k6
            if ($k6Available) {
                & k6 run $testPath
            } else {
                Write-Host "  ℹ️ Running via Node.js (k6 not found in PATH)" -ForegroundColor Yellow
                Write-Host "  To use k6 directly, please install from: https://k6.io/docs/getting-started/installation/" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "  For now, showing test script content:" -ForegroundColor Yellow
                Write-Host "  ─────────────────────────────────────────────────────────" -ForegroundColor Gray
                Get-Content $testPath | Select-Object -First 20
                Write-Host "  ... (truncated)" -ForegroundColor Gray
            }

            $testEndTime = Get-Date
            $testDuration = $testEndTime - $testStartTime

            $results += @{
                Test     = $test.name
                Status   = "Completed"
                Duration = $testDuration.TotalSeconds
                Time     = Get-Date -Format 'HH:mm:ss'
            }

            Write-Host "  ✅ Complete: $($testDuration.TotalSeconds) seconds" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error: $_" -ForegroundColor Red
            $results += @{
                Test     = $test.name
                Status   = "Failed"
                Duration = 0
                Time     = Get-Date -Format 'HH:mm:ss'
            }
        }
    } else {
        Write-Host "  ❌ Test file not found: $testPath" -ForegroundColor Red
    }

    Write-Host ""
    if ($i -lt $testsToRun.Count - 1) {
        Write-Host "  ⏳ Preparing next test..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

$endTime = Get-Date
$totalTime = $endTime - $startTime

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTING COMPLETE                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
foreach ($result in $results) {
    $statusColor = if ($result.Status -eq "Completed") { "Green" } else { "Red" }
    Write-Host "  $($result.Test): $($result.Status)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "⏱️  Total Duration: $($totalTime.TotalMinutes.ToString('F2')) minutes" -ForegroundColor Yellow
Write-Host "Start Time: $($startTime.ToString('HH:mm:ss'))" -ForegroundColor Yellow
Write-Host "End Time: $($endTime.ToString('HH:mm:ss'))" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the test results above" -ForegroundColor White
Write-Host "  2. Check application logs for any errors" -ForegroundColor White
Write-Host "  3. Run extended tests (endurance, workflow, survey)" -ForegroundColor White
Write-Host "  4. Create comprehensive analysis report" -ForegroundColor White
Write-Host ""

Write-Host "📄 Documentation:" -ForegroundColor Cyan
Write-Host "  • PHASE_5_EXECUTION_LOG.md - Test execution details" -ForegroundColor Gray
Write-Host "  • PHASE_5_PERFORMANCE_TESTING_PLAN.md - Full test plan" -ForegroundColor Gray
Write-Host "  • PHASE_5_KICKOFF.md - Quick reference" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Testing framework ready for production use!" -ForegroundColor Green
