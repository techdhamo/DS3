#!/bin/bash

# 🌐 Cloudflare Tunnel Setup Generator
# Automates Cloudflare tunnel creation and configuration

set -e

echo "🌐 Cloudflare Tunnel Setup Generator"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
TUNNEL_NAME="ds3-world-docker"
DOMAIN="ds3.world"
CONFIG_FILE="$HOME/.cloudflared/config.yml"

# Check if cloudflared is installed
check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        echo -e "${YELLOW}⚠️  cloudflared not found. Installing...${NC}"
        
        # Detect OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/cloudflare-main.gpg
            echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/ stable main' | sudo tee /etc/apt/sources.list.d/cloudflare.list
            sudo apt-get update && sudo apt-get install cloudflared
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install cloudflared
        else
            echo -e "${RED}❌ Please install cloudflared manually: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ cloudflared installed${NC}"
    fi
}

# Login to Cloudflare
login_cloudflare() {
    echo -e "${BLUE}🔐 Logging into Cloudflare...${NC}"
    echo -e "${YELLOW}📋 This will open a browser window to authenticate${NC}"
    
    cloudflared tunnel login
    
    echo -e "${GREEN}✅ Logged into Cloudflare${NC}"
}

# Create tunnel
create_tunnel() {
    echo -e "${BLUE}🚇 Creating Cloudflare tunnel...${NC}"
    
    # Check if tunnel already exists
    if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        echo -e "${YELLOW}⚠️  Tunnel '$TUNNEL_NAME' already exists${NC}"
        read -p "Do you want to use existing tunnel? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $2}')
            echo -e "${GREEN}✅ Using existing tunnel: $TUNNEL_UUID${NC}"
            return
        else
            echo -e "${BLUE}🗑️  Deleting existing tunnel...${NC}"
            cloudflared tunnel delete "$TUNNEL_NAME"
        fi
    fi
    
    # Create new tunnel
    echo -e "${BLUE}🔨 Creating new tunnel: $TUNNEL_NAME${NC}"
    TUNNEL_UUID=$(cloudflared tunnel create "$TUNNEL_NAME" | grep "Created tunnel" | awk '{print $4}')
    
    echo -e "${GREEN}✅ Tunnel created: $TUNNEL_UUID${NC}"
}

# Configure tunnel
configure_tunnel() {
    echo -e "${BLUE}⚙️  Configuring tunnel...${NC}"
    
    # Create config directory
    mkdir -p "$(dirname "$CONFIG_FILE")"
    
    # Create tunnel configuration
    cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $HOME/.cloudflared/${TUNNEL_UUID}.json

ingress:
  - hostname: $DOMAIN
    service: http://app:3000
  - hostname: www.$DOMAIN
    service: http://app:3000
  - hostname: api.$DOMAIN
    service: http://app:3000
  - service: http_status:404
EOF
    
    echo -e "${GREEN}✅ Tunnel configured${NC}"
    echo -e "${BLUE}📄 Config file: $CONFIG_FILE${NC}"
}

# Generate token
generate_token() {
    echo -e "${BLUE}🎫 Generating tunnel token...${NC}"
    
    TOKEN=$(cloudflared tunnel token "$TUNNEL_UUID")
    
    echo -e "${GREEN}✅ Token generated${NC}"
    
    # Save token to file
    echo "$TOKEN" > "cloudflare-tunnel-token.txt"
    echo -e "${BLUE}💾 Token saved to: cloudflare-tunnel-token.txt${NC}"
    
    # Copy to clipboard (if possible)
    if command -v pbcopy &> /dev/null; then
        echo "$TOKEN" | pbcopy
        echo -e "${GREEN}📋 Token copied to clipboard${NC}"
    elif command -v xclip &> /dev/null; then
        echo "$TOKEN" | xclip -selection clipboard
        echo -e "${GREEN}📋 Token copied to clipboard${NC}"
    fi
}

# Update DNS records
update_dns() {
    echo -e "${BLUE}🌐 DNS Configuration Instructions:${NC}"
    echo
    echo -e "${YELLOW}1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/${NC}"
    echo -e "${YELLOW}2. Select domain: $DOMAIN${NC}"
    echo -e "${YELLOW}3. Go to DNS settings${NC}"
    echo -e "${YELLOW}4. Delete any existing A records for @ and www${NC}"
    echo -e "${YELLOW}5. Add these CNAME records:${NC}"
    echo
    echo -e "${BLUE}   Record 1:${NC}"
    echo -e "   Type: CNAME"
    echo -e "   Name: @"
    echo -e "   Content: $TUNNEL_UUID.cfargotunnel.com"
    echo -e "   Proxy status: Proxied (orange cloud)"
    echo
    echo -e "${BLUE}   Record 2:${NC}"
    echo -e "   Type: CNAME"
    echo -e "   Name: www"
    echo -e "   Content: $TUNNEL_UUID.cfargotunnel.com"
    echo -e "   Proxy status: Proxied (orange cloud)"
    echo
    echo -e "${YELLOW}6. Save DNS records${NC}"
    echo
    echo -e "${GREEN}✅ DNS configuration complete${NC}"
}

# Test tunnel
test_tunnel() {
    echo -e "${BLUE}🧪 Testing tunnel configuration...${NC}"
    
    # Test config syntax
    if cloudflared tunnel ingress validate "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Tunnel configuration is valid${NC}"
    else
        echo -e "${RED}❌ Tunnel configuration has errors${NC}"
        echo -e "${YELLOW}📋 Check: $CONFIG_FILE${NC}"
        return 1
    fi
}

# Generate environment file
generate_env_file() {
    echo -e "${BLUE}📝 Generating environment file...${NC}"
    
    TOKEN=$(cat cloudflare-tunnel-token.txt 2>/dev/null || echo "")
    
    cat > ".env.cloudflare" << EOF
# Cloudflare Tunnel Token
CLOUDFLARE_TUNNEL_TOKEN=$TOKEN

# Google OAuth (add your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay (add your credentials)
RAZORPAY_KEY_ID=rzp_test_SSdPA3h606fLOj
RAZORPAY_KEY_SECRET=Wliz04YS8d1CTL1jUiySFT6v
RAZORPAY_WEBHOOK_SECRET=razorpay_webhook_ds3_world_8f2a9b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a

# Resend Email
RESEND_API_KEY=re_A7wLESJk_FNfNuWtjHNYUv8kpRQPGCmP7
EMAIL_FROM=noreply@ds3.world
EOF
    
    echo -e "${GREEN}✅ Environment file created: .env.cloudflare${NC}"
    echo -e "${YELLOW}⚠️  Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET${NC}"
}

# Main setup
main() {
    echo -e "${BLUE}🚀 Starting Cloudflare tunnel setup...${NC}"
    echo
    
    check_cloudflared
    login_cloudflare
    create_tunnel
    configure_tunnel
    generate_token
    update_dns
    test_tunnel
    generate_env_file
    
    echo
    echo -e "${GREEN}🎉 Cloudflare tunnel setup complete!${NC}"
    echo
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo -e "1. Update DNS records in Cloudflare (see instructions above)"
    echo -e "2. Update .env.cloudflare with your Google OAuth credentials"
    echo -e "3. Deploy with: ./deploy-cloudflare.sh deploy"
    echo
    echo -e "${GREEN}🌐 Your app will be available at: https://$DOMAIN${NC}"
}

# Help
help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup    - Complete tunnel setup (default)"
    echo "  token    - Generate new token"
    echo "  test     - Test tunnel configuration"
    echo "  dns      - Show DNS configuration instructions"
    echo "  help     - Show this help"
}

# Command line arguments
case "${1:-}" in
    "setup"|"")
        main
        ;;
    "token")
        if [ -f "$CONFIG_FILE" ]; then
            TUNNEL_UUID=$(grep "tunnel:" "$CONFIG_FILE" | awk '{print $2}')
            generate_token
        else
            echo -e "${RED}❌ Tunnel config not found. Run setup first.${NC}"
        fi
        ;;
    "test")
        if [ -f "$CONFIG_FILE" ]; then
            test_tunnel
        else
            echo -e "${RED}❌ Tunnel config not found. Run setup first.${NC}"
        fi
        ;;
    "dns")
        if [ -f "$CONFIG_FILE" ]; then
            TUNNEL_UUID=$(grep "tunnel:" "$CONFIG_FILE" | awk '{print $2}')
            update_dns
        else
            echo -e "${RED}❌ Tunnel config not found. Run setup first.${NC}"
        fi
        ;;
    "help"|"-h"|"--help")
        help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        help
        exit 1
        ;;
esac
