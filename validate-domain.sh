#!/bin/bash

###############################################################################
# DISHA Domain Validation Script
# Verifies custom domain setup and connectivity
###############################################################################

set +e  # Don't exit on errors, we want to continue testing

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="disha.rylneuroacademy.com"
SERVICE_NAME="disha-diagnostics"
REGION="asia-southeast1"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         DISHA Domain Validation Script                    ║${NC}"
echo -e "${BLUE}║     Validating: $DOMAIN                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: DNS Resolution
echo -e "${YELLOW}[Test 1/8]${NC} DNS Resolution"
echo "  Command: nslookup $DOMAIN"

RESOLVED=$(nslookup $DOMAIN 2>&1 | grep -oP '(?<=Address: )[^#]*' | head -1)

if [ -z "$RESOLVED" ]; then
    echo -e "  ${RED}✗ FAILED${NC} - Domain not resolving"
    echo "    Fix: Ensure DNS records are added to your domain registrar"
else
    echo -e "  ${GREEN}✓ PASSED${NC} - Resolved to: $RESOLVED"
fi
echo ""

# Test 2: HTTP Connection
echo -e "${YELLOW}[Test 2/8]${NC} HTTP Connectivity"
echo "  Command: curl -L http://$DOMAIN"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 5 "http://$DOMAIN" 2>/dev/null)

if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
    echo -e "  ${YELLOW}⚠ TIMEOUT${NC} - Service may not be responding yet"
    echo "    This is normal if you just set up the domain"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "  ${GREEN}✓ PASSED${NC} - Redirecting to HTTPS (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓ PASSED${NC} - Connected successfully (HTTP $HTTP_CODE)"
else
    echo -e "  ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "    Check Cloud Run logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
fi
echo ""

# Test 3: HTTPS Connection
echo -e "${YELLOW}[Test 3/8]${NC} HTTPS Connectivity"
echo "  Command: curl -k https://$DOMAIN"

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k --connect-timeout 5 "https://$DOMAIN" 2>/dev/null)

if [ -z "$HTTPS_CODE" ] || [ "$HTTPS_CODE" = "000" ]; then
    echo -e "  ${YELLOW}⚠ TIMEOUT${NC} - HTTPS may still be provisioning"
    echo "    Give it 2-5 minutes for SSL certificate setup"
elif [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo -e "  ${GREEN}✓ PASSED${NC} - HTTPS connected (HTTP $HTTPS_CODE)"
else
    echo -e "  ${RED}✗ FAILED${NC} - HTTPS $HTTPS_CODE"
    echo "    Cloud Run may need to be redeployed"
fi
echo ""

# Test 4: SSL Certificate
echo -e "${YELLOW}[Test 4/8]${NC} SSL Certificate Validity"
echo "  Command: openssl s_client -connect $DOMAIN:443"

SSL_EXPIRY=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d'=' -f2)

if [ -z "$SSL_EXPIRY" ]; then
    echo -e "  ${YELLOW}⚠ PENDING${NC} - SSL certificate still provisioning"
    echo "    This is normal. Wait 2-5 minutes for automatic provisioning"
else
    echo -e "  ${GREEN}✓ PASSED${NC} - Certificate valid until: $SSL_EXPIRY"
fi
echo ""

# Test 5: HTTP Headers
echo -e "${YELLOW}[Test 5/8]${NC} Security Headers"
echo "  Checking X-Frame-Options, X-Content-Type-Options, etc."

HEADERS=$(curl -s -k -I "https://$DOMAIN" 2>/dev/null)

HAS_SECURITY_HEADERS=false

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    echo -e "  ${GREEN}✓${NC} X-Frame-Options found"
    HAS_SECURITY_HEADERS=true
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    echo -e "  ${GREEN}✓${NC} X-Content-Type-Options found"
    HAS_SECURITY_HEADERS=true
fi

if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    echo -e "  ${GREEN}✓${NC} Strict-Transport-Security found"
    HAS_SECURITY_HEADERS=true
fi

if [ "$HAS_SECURITY_HEADERS" = false ]; then
    echo -e "  ${YELLOW}⚠ OPTIONAL${NC} - Security headers not detected"
    echo "    This is optional but recommended"
fi
echo ""

# Test 6: Content Type
echo -e "${YELLOW}[Test 6/8]${NC} Response Content Type"
echo "  Checking if app returns valid content"

CONTENT_TYPE=$(curl -s -k -I "https://$DOMAIN" 2>/dev/null | grep -i "content-type" | cut -d' ' -f2-)

if echo "$CONTENT_TYPE" | grep -qi "text/html\|application/json"; then
    echo -e "  ${GREEN}✓ PASSED${NC} - Content-Type: $CONTENT_TYPE"
else
    echo -e "  ${YELLOW}⚠ WARNING${NC} - Unexpected content type: $CONTENT_TYPE"
fi
echo ""

# Test 7: Cloud Run Service Status
echo -e "${YELLOW}[Test 7/8]${NC} Cloud Run Service Status"
echo "  Checking service in Google Cloud"

if ! command -v gcloud &> /dev/null; then
    echo -e "  ${YELLOW}⚠ SKIPPED${NC} - gcloud CLI not available"
else
    SERVICE_STATUS=$(gcloud run services describe $SERVICE_NAME \
      --region $REGION \
      --format='value(status.conditions[0].status)' 2>/dev/null)

    if [ "$SERVICE_STATUS" = "True" ]; then
        echo -e "  ${GREEN}✓ PASSED${NC} - Service is active"

        SERVICE_REVISIONS=$(gcloud run services describe $SERVICE_NAME \
          --region $REGION \
          --format='value(status.traffic[0].latestRevision)' 2>/dev/null)

        if [ -n "$SERVICE_REVISIONS" ]; then
            echo -e "  ${GREEN}✓${NC} Latest revision is serving traffic"
        fi
    else
        echo -e "  ${RED}✗ FAILED${NC} - Service not active"
        echo "    Run: gcloud run deploy $SERVICE_NAME --region $REGION --allow-unauthenticated"
    fi
fi
echo ""

# Test 8: Firebase Connectivity
echo -e "${YELLOW}[Test 8/8]${NC} Application Functionality"
echo "  Checking if DISHA app loads correctly"

APP_RESPONSE=$(curl -s -k "https://$DOMAIN" 2>/dev/null | grep -o "DISHA\|diagnostic\|Disha" | head -1)

if [ -n "$APP_RESPONSE" ]; then
    echo -e "  ${GREEN}✓ PASSED${NC} - Application content detected"
    echo "    The DISHA app appears to be loading correctly"
else
    echo -e "  ${YELLOW}⚠ PARTIAL${NC} - Content validation inconclusive"
    echo "    Open https://$DOMAIN in browser to verify manually"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Validation Summary                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "Domain: ${YELLOW}$DOMAIN${NC}"
echo ""

if [ -n "$RESOLVED" ] && [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Domain is fully configured and accessible!${NC}"
    echo ""
    echo -e "  Open in browser: ${BLUE}https://$DOMAIN${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test the DISHA diagnostic workflow"
    echo "  2. Verify Firebase data is being saved"
    echo "  3. Monitor logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
    echo "  4. Test on mobile devices"
    echo ""
elif [ "$HTTPS_CODE" = "000" ] && [ -n "$RESOLVED" ]; then
    echo -e "${YELLOW}⚠ Domain configured but HTTPS not yet ready${NC}"
    echo ""
    echo "This is normal! Please wait:"
    echo "  - 2-5 minutes for SSL certificate provisioning"
    echo "  - Then try again"
    echo ""
    echo "  Run again in 5 minutes: ./validate-domain.sh"
    echo ""
else
    echo -e "${RED}✗ Domain setup incomplete${NC}"
    echo ""
    echo "Please check:"
    echo "  1. DNS records added to your domain registrar"
    echo "  2. Cloud Run service is running"
    echo "  3. Review setup guide: CUSTOM_DOMAIN_INTEGRATION_GUIDE.md"
    echo ""
    echo "Run diagnostics:"
    echo "  - DNS check: nslookup $DOMAIN"
    echo "  - Service status: gcloud run services list --region $REGION"
    echo "  - View logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo ""
