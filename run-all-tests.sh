#!/bin/bash

K6="/c/Users/BPVERM~1/AppData/Local/Temp/k6-download/k6-v0.47.0-windows-amd64/k6.exe"
RESULTS_DIR="./test-results-phase5"

mkdir -p "$RESULTS_DIR"

echo "======================================================"
echo "PHASE 5: LOAD TESTING EXECUTION"
echo "======================================================"
echo ""

TESTS=(
    "k6/baseline.js:Baseline Performance:5 min:1 user"
    "k6/load-light.js:Light Load:12 min:50 users"
    "k6/load-normal.js:Normal Load:15 min:200 users"
    "k6/load-heavy.js:Heavy Load:18 min:500 users"
    "k6/spike-test.js:Spike Test:5 min:100->500 users"
)

TOTAL_TESTS=${#TESTS[@]}
CURRENT=0
START_TIME=$(date +%s)

for TEST_INFO in "${TESTS[@]}"; do
    IFS=':' read -r SCRIPT NAME DURATION USERS <<< "$TEST_INFO"
    CURRENT=$((CURRENT + 1))
    
    echo "[$CURRENT/$TOTAL_TESTS] $NAME"
    echo "  Script: $SCRIPT"
    echo "  Duration: $DURATION | Users: $USERS"
    echo "  Start: $(date "+%H:%M:%S")"
    echo ""
    
    TEST_START=$(date +%s)
    
    # Run test
    "$K6" run "$SCRIPT" 2>&1 | tee "$RESULTS_DIR/${NAME// /_}.txt"
    
    TEST_END=$(date +%s)
    TEST_DURATION=$((TEST_END - TEST_START))
    
    echo "  Duration: ${TEST_DURATION}s"
    echo ""
    
    if [ $CURRENT -lt $TOTAL_TESTS ]; then
        echo "Waiting for next test..."
        sleep 3
    fi
done

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

echo ""
echo "======================================================"
echo "ALL TESTS COMPLETE"
echo "======================================================"
echo "Total Duration: $((TOTAL_DURATION / 60)) minutes $((TOTAL_DURATION % 60)) seconds"
echo "Results saved to: $RESULTS_DIR/"
echo ""
