#!/bin/bash

# 🔧 DS3 World DNS Fix Script
# Fixes DNS configuration for Cloudflare tunnel

echo "🔧 DS3 World DNS Fix"
echo "==================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Tunnel information
TUNNEL_ID="f153d377-e4e5-464b-8292-fdc110a95bab"
DOMAIN="ds3.world"

echo -e "${BLUE}📋 Current DNS Configuration Issues:${NC}"
echo "❌ A records pointing to static IPs"
echo "❌ Not using Cloudflare tunnel"
echo "❌ Deployment stuck waiting for DNS"

echo -e "\n${YELLOW}🛠️ Manual DNS Changes Required:${NC}"
echo "Go to: https://dash.cloudflare.com/dns/$DOMAIN"
echo

echo -e "${BLUE}1. DELETE these A records:${NC}"
echo "   - Type: A, Name: @, Content: 15.197.148.33"
echo "   - Type: A, Name: @, Content: 3.33.130.190"
echo

echo -e "${BLUE}2. ADD this CNAME record:${NC}"
echo "   - Type: CNAME"
echo "   - Name: @"
echo "   - Content: $TUNNEL_ID.cfargotunnel.com"
echo "   - Proxy status: Proxied (orange cloud)"
echo "   - TTL: Auto"
echo

echo -e "${BLUE}3. KEEP these records (for email):${NC}"
echo "   - MX records (zoho.in)"
echo "   - TXT records (DMARC, SPF, resend)"
echo "   - CNAME: www → ds3.world"
echo

echo -e "${YELLOW}⚠️  After making these changes:${NC}"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Run: ./deploy-cloudflare.sh deploy"
echo "3. Check: curl https://ds3.world"

echo -e "\n${GREEN}✅ Expected Result:${NC}"
echo "Your app will be accessible at:"
echo "- https://ds3.world"
echo "- https://www.ds3.world"
echo "- https://api.ds3.world"

echo -e "\n${BLUE}🔍 Test DNS after changes:${NC}"
echo "nslookup ds3.world"
echo "Should return: $TUNNEL_ID.cfargotunnel.com"

echo -e "\n${RED}❌ Common Issues:${NC}"
echo "- DNS propagation takes time"
echo "- Clear browser cache"
echo "- Check proxy status (orange cloud)"
echo "- Verify tunnel is running"

echo -e "\n${GREEN}🚀 Ready to deploy after DNS fix!${NC}"
