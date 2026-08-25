#!/bin/bash
# Real-time Deployment Monitoring Script
# Monitors GitHub Actions and Cloud Functions status

set -e

OWNER="cpdoryl"
REPO="Disha-diagnostic-app"
PROJECT="disha-diagnostics"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if tokens are provided
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  GITHUB_TOKEN not set. Set it to enable GitHub Actions monitoring.${NC}"
  GITHUB_TOKEN=""
fi

if [ -z "$GCP_SA_KEY" ]; then
  echo -e "${YELLOW}⚠️  GCP_SA_KEY not set. Set it to enable Cloud Functions monitoring.${NC}"
  GCP_SA_KEY=""
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       📊 DISHA DEPLOYMENT MONITORING DASHBOARD            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============ STEP 1: GitHub Actions Status ============

if [ -n "$GITHUB_TOKEN" ]; then
  echo -e "${BLUE}🔄 GitHub Actions Status${NC}"
  echo "─────────────────────────────────────────────────────────────"

  # Get latest workflow run
  LATEST_RUN=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/test-and-deploy.yml/runs?per_page=1" \
    | grep -o '"status":"[^"]*"' | head -1 | sed 's/"status":"//;s/"$//')

  LATEST_RUN_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/test-and-deploy.yml/runs?per_page=1" \
    | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

  LATEST_RUN_CONCLUSION=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/test-and-deploy.yml/runs?per_page=1" \
    | grep -o '"conclusion":"[^"]*"' | head -1 | sed 's/"conclusion":"//;s/"$//')

  LATEST_RUN_CREATED=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/test-and-deploy.yml/runs?per_page=1" \
    | grep -o '"created_at":"[^"]*"' | head -1 | sed 's/"created_at":"//;s/"$//')

  echo "Latest Workflow Run:"
  echo "  Run ID: $LATEST_RUN_ID"
  echo "  Status: $LATEST_RUN"
  echo "  Conclusion: $LATEST_RUN_CONCLUSION"
  echo "  Started: $LATEST_RUN_CREATED"

  # Determine status emoji
  case "$LATEST_RUN_CONCLUSION" in
    "success")
      echo -e "  ${GREEN}✅ SUCCESS${NC}"
      ;;
    "failure")
      echo -e "  ${RED}❌ FAILED${NC}"
      echo "  $LATEST_RUN_ID"
      ;;
    "skipped")
      echo -e "  ${YELLOW}⏭️  SKIPPED${NC}"
      ;;
    *)
      echo -e "  ${BLUE}⏳ IN PROGRESS or UNKNOWN${NC}"
      ;;
  esac

  echo ""
else
  echo -e "${YELLOW}⚠️  GitHub Actions monitoring disabled (no GITHUB_TOKEN)${NC}"
  echo ""
fi

# ============ STEP 2: Cloud Functions Status ============

if [ -n "$GCP_SA_KEY" ]; then
  echo -e "${BLUE}☁️  Cloud Functions Status${NC}"
  echo "─────────────────────────────────────────────────────────────"

  # Authenticate with GCP
  echo "$GCP_SA_KEY" > /tmp/gcloud-key.json
  gcloud auth activate-service-account --key-file=/tmp/gcloud-key.json 2>/dev/null || true
  gcloud config set project "$PROJECT" 2>/dev/null || true

  # List functions in us-central1
  FUNCTIONS=$(gcloud functions list --region us-central1 --format="table(name,status,runtime)" 2>/dev/null || echo "")

  if [ -z "$FUNCTIONS" ]; then
    echo -e "${RED}❌ No functions found in us-central1${NC}"
  else
    echo "Deployed Functions:"
    echo "$FUNCTIONS" | tail -n +2 | while read line; do
      FUNC_NAME=$(echo "$line" | awk '{print $1}')
      FUNC_STATUS=$(echo "$line" | awk '{print $2}')
      FUNC_RUNTIME=$(echo "$line" | awk '{print $3}')

      if [ "$FUNC_STATUS" = "ACTIVE" ]; then
        echo -e "  ${GREEN}✅${NC} $FUNC_NAME (Runtime: $FUNC_RUNTIME)"
      else
        echo -e "  ${YELLOW}⏳${NC} $FUNC_NAME (Status: $FUNC_STATUS)"
      fi
    done
  fi

  # Count active functions
  ACTIVE_COUNT=$(echo "$FUNCTIONS" | grep "ACTIVE" | wc -l)
  echo ""
  echo "Summary:"
  echo "  Active Functions: $ACTIVE_COUNT/10"

  if [ "$ACTIVE_COUNT" -ge 8 ]; then
    echo -e "  ${GREEN}✅ Most functions active${NC}"
  elif [ "$ACTIVE_COUNT" -ge 5 ]; then
    echo -e "  ${YELLOW}⚠️  Some functions inactive${NC}"
  else
    echo -e "  ${RED}❌ Critical functions missing${NC}"
  fi

  rm /tmp/gcloud-key.json 2>/dev/null || true

  echo ""
else
  echo -e "${YELLOW}⚠️  Cloud Functions monitoring disabled (no GCP_SA_KEY)${NC}"
  echo ""
fi

# ============ STEP 3: Firebase Hosting Status ============

echo -e "${BLUE}🌐 Firebase Hosting Status${NC}"
echo "─────────────────────────────────────────────────────────────"

# Check Firebase URLs
echo "Live URLs:"
echo "  🔗 https://disha-diagnostics.web.app/"
echo "  🔗 https://disha.rylneuroacademy.com/"

echo ""
echo "Last deployment:"
if [ -f "deploy-output.log" ]; then
  DEPLOY_TIME=$(grep -o "Deploy complete\|Deployed\|deployment succeeded" deploy-output.log | tail -1)
  if [ -n "$DEPLOY_TIME" ]; then
    echo "  ✅ $DEPLOY_TIME"
  else
    echo "  ⚠️  Could not determine deployment status"
  fi
else
  echo "  ℹ️  No local deployment log found"
fi

echo ""

# ============ STEP 4: Quick Diagnostics ============

echo -e "${BLUE}🔍 Quick Diagnostics${NC}"
echo "─────────────────────────────────────────────────────────────"

# Check if .env is configured
if [ -f ".env" ]; then
  echo "  ✅ .env file exists"
else
  echo "  ⚠️  .env file not found (needed for local dev)"
fi

# Check if firebase.json is valid
if [ -f "firebase.json" ]; then
  if grep -q "disha-diagnostics" firebase.json; then
    echo "  ✅ firebase.json configured for disha-diagnostics"
  else
    echo "  ⚠️  firebase.json not properly configured"
  fi
else
  echo "  ❌ firebase.json not found"
fi

# Check if functions are built
if [ -d "functions/lib" ]; then
  FUNC_COUNT=$(find functions/lib -name "*.js" -type f | wc -l)
  if [ "$FUNC_COUNT" -gt 0 ]; then
    echo "  ✅ Cloud Functions compiled ($FUNC_COUNT .js files)"
  else
    echo "  ❌ Cloud Functions not compiled"
  fi
else
  echo "  ❌ functions/lib not found (run: cd functions && npm run build)"
fi

# Check if React app is built
if [ -d "build" ]; then
  BUILD_SIZE=$(du -sh build/ 2>/dev/null | awk '{print $1}')
  echo "  ✅ React app built ($BUILD_SIZE)"
else
  echo "  ⚠️  build/ directory not found (run: npm run build)"
fi

echo ""

# ============ STEP 5: Helpful Resources ============

echo -e "${BLUE}📚 Helpful Resources${NC}"
echo "─────────────────────────────────────────────────────────────"
echo "GitHub Actions:"
echo "  https://github.com/$OWNER/$REPO/actions"
echo ""
echo "Firebase Console:"
echo "  https://console.firebase.google.com/project/$PROJECT"
echo ""
echo "Cloud Functions:"
echo "  https://console.cloud.google.com/functions?project=$PROJECT"
echo ""
echo "Firestore Databases:"
echo "  https://console.firebase.google.com/project/$PROJECT/firestore/databases"
echo ""

# ============ FINAL STATUS ============

echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"

if [ "$ACTIVE_COUNT" -ge 8 ] 2>/dev/null && [ -n "$LATEST_RUN_CONCLUSION" ] && [ "$LATEST_RUN_CONCLUSION" = "success" ]; then
  echo -e "${GREEN}✅ SYSTEM STATUS: HEALTHY${NC}"
else
  echo -e "${YELLOW}⚠️  SYSTEM STATUS: NEEDS ATTENTION${NC}"
fi

echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
