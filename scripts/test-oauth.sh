#!/bin/bash

# 🔐 DS3 World OAuth Test Script
# Tests Google OAuth configuration

echo "🔐 DS3 World OAuth Configuration Test"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Checking OAuth configuration...${NC}"

# Check if environment variables are set
source env.cloudflare

if [ "$GOOGLE_CLIENT_ID" = "your-google-client-id-here" ] || [ "$GOOGLE_CLIENT_SECRET" = "your-google-client-secret-here" ]; then
    echo -e "${RED}❌ Google OAuth credentials not configured${NC}"
    echo -e "${YELLOW}📝 Please update env.cloudflare with your Google OAuth credentials${NC}"
    echo -e "${YELLOW}   Get them from: https://console.cloud.google.com/apis/credentials${NC}"
    echo
    echo -e "${BLUE}📋 Required URLs for Google Cloud Console:${NC}"
    echo -e "   Application Home Page: ${YELLOW}https://ds3.world${NC}"
    echo -e "   Privacy Policy: ${YELLOW}https://ds3.world/privacy${NC}"
    echo -e "   Terms of Service: ${YELLOW}https://ds3.world/terms${NC}"
    echo -e "   Redirect URIs:"
    echo -e "     • ${YELLOW}http://localhost:3000/api/auth/callback/google${NC}"
    echo -e "     • ${YELLOW}https://ds3.world/api/auth/callback/google${NC}"
    echo -e "   Authorized Domain: ${YELLOW}ds3.world${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Google OAuth credentials found${NC}"
echo -e "${BLUE}🔍 Testing OAuth endpoints...${NC}"

# Test if the application is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local application is running${NC}"
else
    echo -e "${YELLOW}⚠️  Local application not running. Start with: npm run dev${NC}"
fi

# Test if the production tunnel is accessible
if curl -s https://ds3.world > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production tunnel is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Production tunnel not accessible. Deploy with: ./deploy-cloudflare.sh deploy${NC}"
fi

echo -e "${GREEN}✅ OAuth configuration test complete!${NC}"
echo -e "${YELLOW}🎮 Test Google Sign-In at: https://ds3.world/auth/signin${NC}"
