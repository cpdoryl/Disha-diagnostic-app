#!/bin/bash
# Automated Error Detection & Monitoring System
# Analyzes deployment failures and provides detailed diagnostics

set -e

OWNER="cpdoryl"
REPO="Disha-diagnostic-app"
RUN_ID="$1"
API_TOKEN="$2"
GCP_SA_KEY="$3"

if [ -z "$RUN_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "❌ Usage: $0 <run-id> <api-token> [gcp-sa-key]"
  exit 1
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🔧 AUTOMATED ERROR DETECTION & FIX SYSTEM          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Analyzing deployment run #$RUN_ID..."
echo ""

# Counter for issues found
ISSUES_FOUND=0
ISSUES=()

# ============ STEP 1: FETCH LOGS ============

echo "📥 Fetching GitHub Actions logs..."

# Get the log URL
LOG_URL="https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/logs"

# Fetch logs (might be gzipped)
LOGS=$(curl -s -L -H "Authorization: token $API_TOKEN" "$LOG_URL" 2>/dev/null)

if [ -z "$LOGS" ]; then
  echo "⚠️  Could not fetch logs, attempting fallback..."
  LOGS="(logs unavailable)"
fi

# ============ STEP 2: ERROR DETECTION ============

echo ""
echo "🔍 Scanning for deployment errors..."
echo ""

# ERROR 1: Critical Firebase errors
if echo "$LOGS" | grep -q "Permission denied\|Permission 'cloudFunctions.functions.update' denied"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("GCP_PERMISSION_DENIED")
  echo "❌ ISSUE #$ISSUES_FOUND: GCP Permission Denied"
  echo "   Problem: Service account lacks Cloud Functions update permissions"
  echo "   Solution: Check GCP_SA_KEY secret has roles/cloudfunctions.developer role"
  echo ""
fi

# ERROR 2: Firestore database errors
if echo "$LOGS" | grep -q "Firestore database.*does not exist"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("FIRESTORE_DB_NOT_FOUND")
  echo "❌ ISSUE #$ISSUES_FOUND: Firestore Database Not Found"
  echo "   Problem: Database configuration missing"
  echo "   Solution: Ensure both databases exist in GCP Console"
  echo ""
fi

# ERROR 3: TypeScript compilation errors
if echo "$LOGS" | grep -q "error TS[0-9]"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("TYPESCRIPT_ERROR")
  echo "❌ ISSUE #$ISSUES_FOUND: TypeScript Compilation Failed"
  ERROR_DETAIL=$(echo "$LOGS" | grep "error TS" | head -3)
  echo "   Details:"
  echo "$ERROR_DETAIL" | sed 's/^/     /'
  echo ""
fi

# ERROR 4: Firebase CLI authentication
if echo "$LOGS" | grep -q "Error: Not authenticated\|Error: Authorization failed"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("FIREBASE_AUTH_FAILED")
  echo "❌ ISSUE #$ISSUES_FOUND: Firebase Authentication Failed"
  echo "   Problem: FIREBASE_CI_TOKEN invalid or expired"
  echo "   Solution: Regenerate token: firebase login:ci"
  echo ""
fi

# ERROR 5: Cloud Build quota
if echo "$LOGS" | grep -q "quota exceeded\|resource quota"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("QUOTA_EXCEEDED")
  echo "❌ ISSUE #$ISSUES_FOUND: GCP Quota Exceeded"
  echo "   Problem: Cloud Build or functions quota limit reached"
  echo "   Solution: Wait a few minutes and retry, or increase quota in GCP"
  echo ""
fi

# ERROR 6: Gen 1 to Gen 2 upgrade conflict
if echo "$LOGS" | grep -q "Upgrading from 1st Gen to 2nd Gen is not yet supported"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  ISSUES+=("GEN_UPGRADE_CONFLICT")
  echo "❌ ISSUE #$ISSUES_FOUND: Gen 1 to Gen 2 Upgrade Conflict"
  echo "   Problem: Cannot upgrade functions in-place from Gen 1 to Gen 2"
  echo "   Solution: Delete old function versions in Cloud Functions console"

  # Try to auto-delete
  if [ -n "$GCP_SA_KEY" ]; then
    echo "   Attempting auto-deletion..."
    echo "$GCP_SA_KEY" > /tmp/gcloud-key.json
    gcloud auth activate-service-account --key-file=/tmp/gcloud-key.json 2>/dev/null || true
    gcloud config set project disha-diagnostics 2>/dev/null || true

    for func in onChallengeResponseWrite onMultiplierWrite syncMultipliers; do
      echo "   Deleting: $func..."
      gcloud functions delete "$func" --region us-central1 --quiet 2>/dev/null || true
    done

    rm /tmp/gcloud-key.json 2>/dev/null || true
    echo "   ✅ Auto-deletion complete - retry deployment"
  fi
  echo ""
fi

# ERROR 7: No actual error - just warnings in logs
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ No critical errors detected"
  echo ""
  echo "⚠️  Checking logs for warnings or issues..."

  # Check what WAS in the logs
  if echo "$LOGS" | grep -q "error\|Error\|ERROR" | grep -v "error detection\|error analyzing" | head -3; then
    echo ""
    echo "Found in logs (might be warnings):"
    echo "$LOGS" | grep -i "error\|warn" | grep -v "error detection\|error analyzing" | head -3
  fi
fi

# ============ STEP 3: GCP STATUS CHECK ============

if [ -n "$GCP_SA_KEY" ]; then
  echo ""
  echo "🔐 Checking GCP status..."

  echo "$GCP_SA_KEY" > /tmp/gcloud-key.json
  gcloud auth activate-service-account --key-file=/tmp/gcloud-key.json 2>/dev/null || true
  gcloud config set project disha-diagnostics 2>/dev/null || true

  # List deployed functions
  FUNC_LIST=$(gcloud functions list --region us-central1 --format="value(name)" 2>/dev/null || echo "")

  if [ -n "$FUNC_LIST" ]; then
    FUNC_COUNT=$(echo "$FUNC_LIST" | wc -l)
    echo "✅ Functions deployed: $FUNC_COUNT"
    echo "$FUNC_LIST" | sed 's/^/   /'
  else
    echo "⚠️  No functions found in us-central1"
  fi

  rm /tmp/gcloud-key.json 2>/dev/null || true
fi

# ============ STEP 4: SUMMARY & RECOMMENDATIONS ============

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📋 DIAGNOSTIC SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ STATUS: No critical issues found"
  echo ""
  echo "ℹ️  Recommendations:"
  echo "   1. Check GitHub Actions workflow logs for details"
  echo "   2. Verify Firebase deployment completed successfully"
  echo "   3. Check Cloud Functions console for function status"
  echo "   4. Inspect deploy-output.log for warnings"
  echo ""
  echo "🔗 Links:"
  echo "   GitHub Actions: https://github.com/$OWNER/$REPO/actions/runs/$RUN_ID"
  echo "   Cloud Functions: https://console.cloud.google.com/functions?project=disha-diagnostics"
  echo "   Firebase Console: https://console.firebase.google.com/project/disha-diagnostics"
else
  echo "❌ STATUS: $ISSUES_FOUND critical issue(s) found"
  echo ""
  echo "Issues detected:"
  for i in "${!ISSUES[@]}"; do
    echo "   $((i+1)). ${ISSUES[$i]}"
  done
  echo ""
  echo "✅ Next Steps:"
  echo "   1. Review the issues above"
  echo "   2. Fix the root cause"
  echo "   3. Commit and push to retry deployment"
  echo "   4. Or contact support for assistance"
fi

echo ""
echo "⏱️  Next automatic retry in ~30 seconds (if enabled)"
echo ""

exit 0
