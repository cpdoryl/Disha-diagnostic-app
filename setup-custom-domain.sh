#!/bin/bash

###############################################################################
# DISHA Custom Domain Setup Script
# Automates Google Cloud Run custom domain configuration
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         DISHA Custom Domain Setup Script                  ║${NC}"
echo -e "${BLUE}║     Setting up disha.rylneuroacademy.com                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
SERVICE_NAME="disha-diagnostics"
REGION="asia-southeast1"
DOMAIN="disha.rylneuroacademy.com"
PARENT_DOMAIN="rylneuroacademy.com"

# Step 1: Verify Prerequisites
echo -e "${YELLOW}[Step 1/8]${NC} Checking prerequisites..."

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}✗ gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl not found. Please install curl.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites verified${NC}"
echo ""

# Step 2: Get GCP Project ID
echo -e "${YELLOW}[Step 2/8]${NC} Configuring Google Cloud..."

PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}✗ No GCP project configured. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project ID: $PROJECT_ID${NC}"
echo ""

# Step 3: Verify Cloud Run Service
echo -e "${YELLOW}[Step 3/8]${NC} Verifying Cloud Run service..."

SERVICE_STATUS=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format='value(status.conditions[0].status)' 2>/dev/null || echo "UNKNOWN")

if [ "$SERVICE_STATUS" != "True" ]; then
    echo -e "${RED}✗ Cloud Run service not found or not ready.${NC}"
    echo "  Run: gcloud run deploy $SERVICE_NAME --region $REGION"
    exit 1
fi

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format='value(status.url)')

echo -e "${GREEN}✓ Service running at: $SERVICE_URL${NC}"
echo ""

# Step 4: Get Static IP
echo -e "${YELLOW}[Step 4/8]${NC} Provisioning static IP address..."

# Check if static IP already exists
EXISTING_IP=$(gcloud compute addresses describe disha-ip \
  --global \
  --format='value(address)' 2>/dev/null || echo "")

if [ -z "$EXISTING_IP" ]; then
    echo "  Creating new static IP..."
    gcloud compute addresses create disha-ip --global
    STATIC_IP=$(gcloud compute addresses describe disha-ip \
      --global \
      --format='value(address)')
else
    STATIC_IP=$EXISTING_IP
    echo "  Using existing static IP..."
fi

echo -e "${GREEN}✓ Static IP: $STATIC_IP${NC}"
echo ""

# Step 5: Display DNS Configuration
echo -e "${YELLOW}[Step 5/8]${NC} DNS Configuration Instructions"
echo ""
echo -e "${BLUE}You need to add the following DNS record to your domain registrar:${NC}"
echo ""
echo -e "  ${YELLOW}Record Type:${NC} CNAME"
echo -e "  ${YELLOW}Host/Subdomain:${NC} disha"
echo -e "  ${YELLOW}Value:${NC} run.app"
echo -e "  ${YELLOW}TTL:${NC} 3600 (or 300 for testing)"
echo ""
echo -e "${BLUE}Or use this A record instead:${NC}"
echo ""
echo -e "  ${YELLOW}Record Type:${NC} A"
echo -e "  ${YELLOW}Host/Subdomain:${NC} disha"
echo -e "  ${YELLOW}Value:${NC} $STATIC_IP"
echo -e "  ${YELLOW}TTL:${NC} 3600"
echo ""
echo -e "${YELLOW}Add these DNS records at your domain registrar before continuing.${NC}"
echo ""
read -p "Press Enter once you've added the DNS records..."
echo ""

# Step 6: Test DNS Resolution
echo -e "${YELLOW}[Step 6/8]${NC} Testing DNS resolution..."

RESOLVED_IP=$(nslookup $DOMAIN 2>/dev/null | grep -oP '(?<=Address: )[^#]*' | tail -1 || echo "")

if [ -z "$RESOLVED_IP" ]; then
    echo -e "${YELLOW}⚠ DNS not resolving yet. This is normal if you just added the records.${NC}"
    echo "  Waiting 30 seconds for DNS propagation..."
    sleep 30
    RESOLVED_IP=$(nslookup $DOMAIN 2>/dev/null | grep -oP '(?<=Address: )[^#]*' | tail -1 || echo "")
fi

if [ -z "$RESOLVED_IP" ]; then
    echo -e "${YELLOW}⚠ DNS still not resolving. Please check your DNS settings and try again.${NC}"
else
    echo -e "${GREEN}✓ DNS resolved to: $RESOLVED_IP${NC}"
fi
echo ""

# Step 7: Update Cloud Run Domain Mapping
echo -e "${YELLOW}[Step 7/8]${NC} Updating Cloud Run service configuration..."

# Update service with domain environment variable
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --update-env-vars DOMAIN=$DOMAIN

echo -e "${GREEN}✓ Cloud Run service updated${NC}"
echo ""

# Step 8: Verify HTTPS Access
echo -e "${YELLOW}[Step 8/8]${NC} Testing HTTPS access..."

echo "  Waiting for SSL certificate provisioning (this may take 2-5 minutes)..."

# Try to access the domain with a timeout
for i in {1..30}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
        echo -e "${GREEN}✓ HTTPS access successful (HTTP $RESPONSE)${NC}"
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              Setup Complete! 🎉                            ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${GREEN}Your DISHA Diagnostic Engine is now available at:${NC}"
        echo -e "  ${BLUE}https://$DOMAIN${NC}"
        echo ""
        echo -e "${YELLOW}Next Steps:${NC}"
        echo "  1. Open https://$DOMAIN in your browser"
        echo "  2. Verify the app loads correctly"
        echo "  3. Test the diagnostic workflow"
        echo "  4. Monitor Cloud Run logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
        echo ""
        exit 0
    fi

    if [ $((i % 5)) -eq 0 ]; then
        echo "  Attempt $i/30... (HTTP $RESPONSE)"
    fi

    sleep 5
done

echo -e "${YELLOW}⚠ HTTPS access not yet available. SSL certificate may still be provisioning.${NC}"
echo "  This is normal. Please wait a few more minutes and access:"
echo -e "  ${BLUE}https://$DOMAIN${NC}"
echo ""
echo "If you continue to experience issues, check:"
echo "  1. DNS records are correctly configured"
echo "  2. Cloud Run logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
echo "  3. SSL certificate status in Google Cloud Console"
echo ""

exit 0
