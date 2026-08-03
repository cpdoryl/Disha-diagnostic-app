# DISHA Cloud Function Deployment Script for Windows

Write-Host "================================" -ForegroundColor Green
Write-Host "DISHA Firebase Cloud Function Deployment" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Cyan
$firebaseVersion = firebase --version 2>$null
if ($null -eq $firebaseVersion) {
    Write-Host "ERROR: Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}
else {
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Cyan
Set-Location functions
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Building TypeScript..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "TypeScript build successful!" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "Step 3: Deploying Cloud Functions..." -ForegroundColor Cyan
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.firebase.google.com/project/disha-diagnostics" -ForegroundColor White
    Write-Host "2. Click 'Functions' in the left sidebar" -ForegroundColor White
    Write-Host "3. Click 'initializeDISHADatabase'" -ForegroundColor White
    Write-Host "4. Click 'Testing' tab" -ForegroundColor White
    Write-Host "5. Click 'Call the function'" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run via CLI:" -ForegroundColor Yellow
    Write-Host "firebase functions:call initializeDISHADatabase" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Run 'firebase functions:log' to see detailed logs" -ForegroundColor Yellow
    exit 1
}
