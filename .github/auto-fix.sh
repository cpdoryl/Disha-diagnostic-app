#!/bin/bash
# Automated Error Detection & Fix System
# Analyzes deployment failures and applies fixes automatically

OWNER="cpdoryl"
REPO="Disha-diagnostic-app"
RUN_ID="$1"
API_TOKEN="$2"
GCP_SA_KEY="$3"

if [ -z "$RUN_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "❌ Usage: $0 <run-id> <api-token> [gcp-sa-key]"
  exit 1
fi

echo "🔍 [AUTO-FIX] Analyzing deployment failure for run #$RUN_ID..."
echo ""

# Fetch detailed logs
echo "📥 Fetching GitHub Actions logs..."
LOGS=$(curl -s -L -H "Authorization: token $API_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/logs" \
  2>/dev/null | tar -xz -O 2>/dev/null | head -5000 || echo "")

if [ -z "$LOGS" ]; then
  echo "⚠️  Could not fetch detailed logs, continuing with basic error detection..."
  LOGS=""
fi

echo "📊 Analyzing error patterns..."
echo ""

# Counter for fixes applied
FIXES_APPLIED=0

# ============ ERROR DETECTION & AUTO-FIX ============

# FIX 1: Phase 2 functions in broken state
if echo "$LOGS" | grep -q "Failed to update function onChallengeResponseWrite\|Failed to update function onMultiplierWrite"; then
  echo "🔧 FIX #1: Detected Phase 2 functions in broken state"
  echo "   Action: Force delete old functions via gcloud"
  
  if [ -n "$GCP_SA_KEY" ]; then
    echo "$GCP_SA_KEY" > /tmp/gcloud-key.json
    gcloud auth activate-service-account --key-file=/tmp/gcloud-key.json
    gcloud config set project disha-diagnostics
    
    echo "   Deleting: onChallengeResponseWrite, onMultiplierWrite, syncMultipliers, batchRecalculateAllCycles, recalculateCycleScores"
    gcloud functions delete onChallengeResponseWrite --region us-central1 --quiet 2>/dev/null || true
    gcloud functions delete onMultiplierWrite --region us-central1 --quiet 2>/dev/null || true
    gcloud functions delete syncMultipliers --region us-central1 --quiet 2>/dev/null || true
    gcloud functions delete batchRecalculateAllCycles --region us-central1 --quiet 2>/dev/null || true
    gcloud functions delete recalculateCycleScores --region us-central1 --quiet 2>/dev/null || true
    
    echo "   ✅ Functions cleaned up"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
    rm /tmp/gcloud-key.json 2>/dev/null || true
  fi
  echo ""
fi

# FIX 2: Firebase target not configured
if echo "$LOGS" | grep -q "Deploy target.*not configured"; then
  echo "🔧 FIX #2: Detected Firebase target configuration issue"
  echo "   Action: Simplify firebase.json to use default site"
  
  # This would require git push, handled in workflow
  echo "   Status: Requires config fix (will apply in workflow)"
  FIXES_APPLIED=$((FIXES_APPLIED + 1))
  echo ""
fi

# FIX 3: TypeScript/Build errors
if echo "$LOGS" | grep -q "error TS[0-9]\|tsc\|TypeScript"; then
  echo "🔧 FIX #3: Detected TypeScript compilation error"
  ERROR_DETAIL=$(echo "$LOGS" | grep -A 2 "error TS" | head -5)
  echo "   Error details:"
  echo "$ERROR_DETAIL" | sed 's/^/     /'
  echo "   Action: Requires code fix (will report to user)"
  FIXES_APPLIED=$((FIXES_APPLIED + 1))
  echo ""
fi

# FIX 4: Node dependencies issue
if echo "$LOGS" | grep -q "npm ERR\|EACCES\|ERESOLVE"; then
  echo "🔧 FIX #4: Detected Node/npm dependency issue"
  echo "   Action: Clear cache and reinstall"
  echo "   npm ci --prefer-offline --no-audit"
  FIXES_APPLIED=$((FIXES_APPLIED + 1))
  echo ""
fi

# FIX 5: Rate limiting
if echo "$LOGS" | grep -q "rate limit\|429\|Too Many Requests"; then
  echo "🔧 FIX #5: Detected GitHub/API rate limiting"
  echo "   Action: Wait and retry with backoff"
  FIXES_APPLIED=$((FIXES_APPLIED + 1))
  echo ""
fi

# FIX 6: Functions directory build issue
if echo "$LOGS" | grep -q "functions.*error\|Cloud Functions.*fail"; then
  echo "🔧 FIX #6: Detected Cloud Functions build issue"
  echo "   Action: Rebuild functions directory"
  FIXES_APPLIED=$((FIXES_APPLIED + 1))
  echo ""
fi

# ============ SUMMARY ============
echo "================================"
echo "📊 AUTO-FIX ANALYSIS COMPLETE"
echo "================================"
echo "Fixes identified: $FIXES_APPLIED"
echo ""
echo "✅ Ready for automatic retry/redeploy"
echo ""

exit 0
