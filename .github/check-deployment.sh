#!/bin/bash
# Automatic deployment monitoring script with GitHub API authentication
# Usage: ./check-deployment.sh <owner> <repo> <api_token>

OWNER="cpdoryl"
REPO="Disha-diagnostic-app"
API_TOKEN="${1:-$GH_API_TOKEN}"  # Use passed token or env var
MAX_WAIT=900  # 15 minutes
POLL_INTERVAL=10  # Check every 10 seconds

if [ -z "$API_TOKEN" ]; then
  echo "❌ Error: GitHub API token not provided"
  echo "Set GH_API_TOKEN environment variable or pass as argument"
  exit 1
fi

echo "🔍 Checking latest GitHub Actions deployment..."
echo "Repository: $OWNER/$REPO"
echo ""

# Get latest run with authenticated request
LATEST_RUN=$(curl -s -H "Authorization: token $API_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs?per_page=1" | \
  grep -o '"id": [0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$LATEST_RUN" ]; then
  echo "❌ Could not fetch latest run. Check:"
  echo "  - Repository name"
  echo "  - API token validity"
  echo "  - Token permissions (needs public_repo, repo:status)"
  exit 1
fi

echo "✅ Found run #$LATEST_RUN"
echo "🔄 Monitoring deployment progress..."
echo ""

# Poll for completion
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  # Get run status with authenticated request
  RUN_DATA=$(curl -s -H "Authorization: token $API_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$LATEST_RUN")
  
  STATUS=$(echo "$RUN_DATA" | grep -o '"status":"[^"]*"' | grep -o '[^"]*"$' | tr -d '"')
  CONCLUSION=$(echo "$RUN_DATA" | grep -o '"conclusion":"[^"]*"' | grep -o '[^"]*"$' | tr -d '"')
  
  if [ "$STATUS" = "completed" ]; then
    echo ""
    echo "✅ Deployment completed!"
    echo ""
    
    if [ "$CONCLUSION" = "success" ]; then
      echo "✅ STATUS: SUCCESS"
      echo ""
      echo "🌐 Live URLs:"
      echo "  ✓ https://disha-diagnostics.web.app/"
      echo "  ✓ https://disha.rylneuroacademy.com/"
      echo ""
      echo "⏱️  Changes typically live within 5-10 minutes"
      exit 0
    else
      echo "❌ STATUS: $CONCLUSION (FAILED)"
      echo ""
      echo "📊 View full logs:"
      echo "  https://github.com/$OWNER/$REPO/actions/runs/$LATEST_RUN"
      exit 1
    fi
  fi
  
  # Show progress
  MINS=$((ELAPSED / 60))
  SECS=$((ELAPSED % 60))
  printf "\r⏳ Status: $STATUS | Elapsed: ${MINS}m ${SECS}s / $((MAX_WAIT/60))m"
  
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

echo ""
echo "⏱️  Timeout reached (15 min). Check:"
echo "  https://github.com/$OWNER/$REPO/actions/runs/$LATEST_RUN"
exit 1
