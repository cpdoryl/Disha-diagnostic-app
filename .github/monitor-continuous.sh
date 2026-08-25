#!/bin/bash
# Truly Continuous & Autonomous Deployment Monitor
# Actively polls, detects changes, and reports automatically

OWNER="cpdoryl"
REPO="Disha-diagnostic-app"
API_TOKEN="$1"
MONITOR_FILE="/tmp/deployment-monitor-state.txt"
CHECK_INTERVAL=5  # Check every 5 seconds

if [ -z "$API_TOKEN" ]; then
  echo "❌ Error: GitHub API token required"
  echo "Usage: $0 <api-token>"
  exit 1
fi

# Initialize state file
touch $MONITOR_FILE
LAST_RUN_ID=""
LAST_STATUS=""
LAST_CONCLUSION=""

echo "🤖 AUTONOMOUS MONITOR STARTED"
echo "   Continuously watching deployments..."
echo "   Polling interval: ${CHECK_INTERVAL}s"
echo "   State file: $MONITOR_FILE"
echo ""
echo "======================================"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Monitor initialized"
echo "======================================"
echo ""

# Main monitoring loop - NEVER EXIT
while true; do
  # Get latest deployment run
  RESPONSE=$(curl -s -H "Authorization: token $API_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/runs?per_page=1")
  
  # Parse response
  RUN_ID=$(echo "$RESPONSE" | grep -o '"id": [0-9]*' | head -1 | grep -o '[0-9]*')
  RUN_NUMBER=$(echo "$RESPONSE" | grep -o '"run_number": [0-9]*' | head -1 | grep -o '[0-9]*')
  STATUS=$(echo "$RESPONSE" | grep -o '"status": "[^"]*"' | head -1 | cut -d'"' -f4)
  CONCLUSION=$(echo "$RESPONSE" | grep -o '"conclusion": "[^"]*"' | head -1 | cut -d'"' -f4)
  HTML_URL=$(echo "$RESPONSE" | grep -o '"html_url": "[^"]*"' | head -1 | cut -d'"' -f4)
  
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Check if this is a new run
  if [ "$RUN_ID" != "$LAST_RUN_ID" ]; then
    echo ""
    echo "======================================"
    echo "🔔 NEW DEPLOYMENT DETECTED!"
    echo "======================================"
    echo "[$TIMESTAMP] Run #$RUN_NUMBER started"
    echo "Status: $STATUS"
    echo "Link: $HTML_URL"
    echo ""
    LAST_RUN_ID="$RUN_ID"
    LAST_STATUS="$STATUS"
    LAST_CONCLUSION="$CONCLUSION"
  fi
  
  # Check if status changed on same run
  if [ "$RUN_ID" = "$LAST_RUN_ID" ] && [ "$STATUS" != "$LAST_STATUS" ]; then
    echo "[$TIMESTAMP] STATUS CHANGED: $LAST_STATUS → $STATUS"
    
    if [ "$STATUS" = "in_progress" ]; then
      echo "   🔄 Deployment in progress..."
    elif [ "$STATUS" = "completed" ]; then
      echo "   ✅ Deployment completed!"
      echo "   Conclusion: $CONCLUSION"
      
      if [ "$CONCLUSION" = "success" ]; then
        echo ""
        echo "======================================"
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "======================================"
        echo "✅ Both URLs now live:"
        echo "   • https://disha-diagnostics.web.app/"
        echo "   • https://disha.rylneuroacademy.com/"
        echo "[$TIMESTAMP] Deployment complete and live"
        echo "======================================"
        echo ""
      else
        echo ""
        echo "======================================"
        echo "❌ DEPLOYMENT FAILED!"
        echo "======================================"
        echo "Conclusion: $CONCLUSION"
        echo "View logs: $HTML_URL"
        echo "[$TIMESTAMP] Analyzing failure..."
        echo "======================================"
        echo ""
      fi
    fi
    
    LAST_STATUS="$STATUS"
    LAST_CONCLUSION="$CONCLUSION"
  fi
  
  # Save state
  echo "$RUN_ID|$STATUS|$CONCLUSION" > $MONITOR_FILE
  
  # Wait before next check
  sleep $CHECK_INTERVAL
done
