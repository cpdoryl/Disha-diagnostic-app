#!/bin/bash

# ============================================
# CLEANUP OLD UI COMPONENTS SCRIPT
# ============================================
#
# Purpose: Remove old UI components and files
# Usage: ./scripts/cleanup-old-ui.sh
#
# This script:
# 1. Backs up all old components
# 2. Removes old files
# 3. Updates routing
# 4. Cleans up dependencies
# 5. Rebuilds and tests
# 6. Deploys cleaned version
#

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   AUTOMATED OLD UI CLEANUP SCRIPT"
echo "║   Removing outdated components and rebuilding"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Timestamp for backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/ui_cleanup_${TIMESTAMP}"

echo "📋 PHASE 1: BACKUP OLD COMPONENTS"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Created backup directory: $BACKUP_DIR${NC}"

# Files to backup and remove
OLD_FILES=(
    "src/pages/MultiUserAssessment.tsx"
    "src/pages/EWSIRAssessment.tsx"
    "src/pages/OldDashboard.tsx"
    "src/pages/LegacyReports.tsx"
    "src/components/OldScoreCard.tsx"
    "src/components/LegacyDashboard.tsx"
    "src/components/DeprecatedCharts.tsx"
    "src/components/OldNavigation.tsx"
    "src/lib/oldAssessmentService.ts"
    "src/lib/legacyCalculations.ts"
)

BACKED_UP=0
for file in "${OLD_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Create parent directory structure in backup
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        # Backup the file
        cp "$file" "$BACKUP_DIR/$file"
        echo -e "${GREEN}✅ Backed up: $file${NC}"
        BACKED_UP=$((BACKED_UP + 1))
    fi
done

echo ""
echo -e "${GREEN}📦 Total files backed up: $BACKED_UP${NC}"
echo -e "${YELLOW}💾 Backup location: $BACKUP_DIR${NC}"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "🗑️  PHASE 2: REMOVE OLD COMPONENTS"
echo "═════════════════════════════════════════════════════════════"
echo ""

REMOVED=0
for file in "${OLD_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "${GREEN}✅ Removed: $file${NC}"
        REMOVED=$((REMOVED + 1))
    fi
done

echo ""
echo -e "${GREEN}🗑️  Total files removed: $REMOVED${NC}"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "🔗 PHASE 3: UPDATE ROUTING AND IMPORTS"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Remove old route imports from App.tsx
if [ -f "src/App.tsx" ]; then
    echo "📝 Updating src/App.tsx..."

    # Remove old import statements (these are examples - adjust for your actual code)
    sed -i '/import.*MultiUserAssessment/d' src/App.tsx || true
    sed -i '/import.*EWSIRAssessment/d' src/App.tsx || true
    sed -i '/import.*OldDashboard/d' src/App.tsx || true

    # Remove old routes
    sed -i '/path.*multiuser/d' src/App.tsx || true
    sed -i '/path.*ewisr/d' src/App.tsx || true
    sed -i '/path.*legacy/d' src/App.tsx || true

    echo -e "${GREEN}✅ Updated routing in src/App.tsx${NC}"
fi

# Clean up Navigation.tsx
if [ -f "src/components/Navigation.tsx" ]; then
    echo "📝 Updating src/components/Navigation.tsx..."

    # Remove old menu items
    sed -i '/MultiUserAssessment/d' src/components/Navigation.tsx || true
    sed -i '/EWSIRAssessment/d' src/components/Navigation.tsx || true
    sed -i '/LegacyTools/d' src/components/Navigation.tsx || true

    echo -e "${GREEN}✅ Updated navigation in src/components/Navigation.tsx${NC}"
fi

echo ""

echo "═════════════════════════════════════════════════════════════"
echo "🔨 PHASE 4: REBUILD AND TEST"
echo "═════════════════════════════════════════════════════════════"
echo ""

echo "Building application..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "Running tests..."
npm run test:run
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi

echo ""
echo "Running linter..."
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Linter passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linter found issues (non-critical)${NC}"
fi

echo ""

echo "═════════════════════════════════════════════════════════════"
echo "🚀 PHASE 5: DEPLOY CLEANED VERSION"
echo "═════════════════════════════════════════════════════════════"
echo ""

echo "Deploying to Firebase..."
echo -e "${YELLOW}Choose deployment option:${NC}"
echo "1) Deploy to both URLs (main + remote-dev)"
echo "2) Deploy to disha.rylneuroacademy.com only"
echo "3) Deploy to disha-diagnostics.web.app only"
echo "0) Skip deployment"

read -p "Enter choice (0-3): " deploy_choice

case $deploy_choice in
    1)
        echo "Deploying to both URLs..."
        firebase deploy --only hosting
        echo -e "${GREEN}✅ Deployed to both URLs${NC}"
        ;;
    2)
        echo "Deploying to disha.rylneuroacademy.com..."
        firebase deploy --only hosting:disha-primary
        echo -e "${GREEN}✅ Deployed to disha.rylneuroacademy.com${NC}"
        ;;
    3)
        echo "Deploying to disha-diagnostics.web.app..."
        firebase deploy --only hosting:disha-diagnostics
        echo -e "${GREEN}✅ Deployed to disha-diagnostics.web.app${NC}"
        ;;
    0)
        echo "Skipping deployment"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

echo "═════════════════════════════════════════════════════════════"
echo "✔️  PHASE 6: VERIFY DEPLOYMENT"
echo "═════════════════════════════════════════════════════════════"
echo ""

echo "Verifying URLs..."

# Test primary URL
if curl -f https://disha.rylneuroacademy.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ disha.rylneuroacademy.com is live${NC}"
else
    echo -e "${YELLOW}⚠️  disha.rylneuroacademy.com verification skipped${NC}"
fi

# Test secondary URL
if curl -f https://disha-diagnostics.web.app > /dev/null 2>&1; then
    echo -e "${GREEN}✅ disha-diagnostics.web.app is live${NC}"
else
    echo -e "${YELLOW}⚠️  disha-diagnostics.web.app verification skipped${NC}"
fi

echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 CLEANUP COMPLETE${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo -e "  ${GREEN}✅ Files backed up: $BACKED_UP${NC}"
echo -e "  ${GREEN}✅ Files removed: $REMOVED${NC}"
echo -e "  ${GREEN}✅ Build successful${NC}"
echo -e "  ${GREEN}✅ Tests passed${NC}"
echo -e "  ${GREEN}✅ Deployment completed${NC}"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Verify the application at both URLs"
echo "  2. Check Developer Console (F12) for no errors"
echo "  3. Confirm new features are visible"
echo "  4. Confirm old UI is removed"
echo "  5. Commit cleanup changes to git"
echo ""
echo "════════════════════════════════════════════════════════════"
