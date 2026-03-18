#!/bin/bash

# 🌐 DS3 World Cloudflare Docker Deployment Script
# Deploys DS3 World with integrated Cloudflare Tunnel

set -e

echo "🌐 DS3 World Cloudflare Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.cloudflare.yml"
ENV_FILE=".env.cloudflare"

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}❌ $COMPOSE_FILE not found.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Setup environment
setup_environment() {
    echo -e "${BLUE}📝 Setting up environment...${NC}"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}⚠️  $ENV_FILE not found. Creating template...${NC}"
        cat > "$ENV_FILE" << EOF
# Cloudflare Tunnel Token (get from cloudflared tunnel token <tunnel-id>)
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_SSdPA3h606fLOj
RAZORPAY_KEY_SECRET=Wliz04YS8d1CTL1jUiySFT6v
RAZORPAY_WEBHOOK_SECRET=razorpay_webhook_ds3_world_8f2a9b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a

# Resend Email
RESEND_API_KEY=re_A7wLESJk_FNfNuWtjHNYUv8kpRQPGCmP7
EMAIL_FROM=noreply@ds3.world
EOF
        echo -e "${YELLOW}📋 Please edit $ENV_FILE with your actual credentials${NC}"
        echo -e "${YELLOW}   Required: CLOUDFLARE_TUNNEL_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET${NC}"
        echo -e "${YELLOW}   Get tunnel token: cloudflared tunnel token <tunnel-id>${NC}"
        read -p "Press Enter after editing $ENV_FILE..."
    fi

    # Validate required variables
    source "$ENV_FILE"
    
    if [ "$CLOUDFLARE_TUNNEL_TOKEN" = "your-cloudflare-tunnel-token-here" ]; then
        echo -e "${RED}❌ Please update CLOUDFLARE_TUNNEL_TOKEN in $ENV_FILE${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Environment setup complete${NC}"
}

# Deploy application
deploy() {
    echo -e "${BLUE}🚀 Deploying DS3 World with Cloudflare...${NC}"
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down 2>/dev/null || true
    
    # Build and start containers
    echo -e "${BLUE}📦 Building Docker images...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
    
    echo -e "${BLUE}🌐 Starting services with Cloudflare Tunnel...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
    sleep 15
    
    # Check services
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services are running!${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        
        # Wait for app to be ready
        echo -e "${BLUE}⏳ Waiting for DS3 World to be ready...${NC}"
        for i in {1..60}; do
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                echo -e "${GREEN}✅ DS3 World is ready!${NC}"
                break
            fi
            sleep 2
            echo -n "."
        done
        
        echo -e "${GREEN}🎉 DS3 World deployed successfully with Cloudflare!${NC}"
        echo -e "${GREEN}🌐 External URL: https://ds3.world${NC}"
        echo -e "${GREEN}🔗 Local URL: http://localhost:3000${NC}"
        echo -e "${GREEN}📊 Logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f${NC}"
        echo -e "${GREEN}🛑 Stop: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down${NC}"
        
        # Setup database
        setup_database
        
    else
        echo -e "${RED}❌ Services failed to start${NC}"
        echo -e "${YELLOW}📋 Check logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs${NC}"
        exit 1
    fi
}

# Setup database
setup_database() {
    echo -e "${BLUE}💾 Setting up database...${NC}"
    
    # Wait for PostgreSQL to be ready
    echo -e "${BLUE}⏳ Waiting for PostgreSQL...${NC}"
    for i in {1..30}; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
            break
        fi
        sleep 2
        echo -n "."
    done
    
    # Run Prisma commands
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec app npx prisma db push
    
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec app npx prisma db seed
    
    echo -e "${GREEN}✅ Database setup complete${NC}"
}

# Status check
status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    echo -e "\n${BLUE}🌐 Cloudflare Tunnel Status:${NC}"
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs cloudflared 2>/dev/null | grep -q "connected"; then
        echo -e "${GREEN}✅ Cloudflare Tunnel is connected${NC}"
    else
        echo -e "${RED}❌ Cloudflare Tunnel may not be connected${NC}"
        echo -e "${YELLOW}📋 Check logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs cloudflared${NC}"
    fi
    
    echo -e "\n${BLUE}🔍 External Access Test:${NC}"
    if curl -s https://ds3.world > /dev/null 2>&1; then
        echo -e "${GREEN}✅ External access working (https://ds3.world)${NC}"
    else
        echo -e "${YELLOW}⚠️  External access may not be ready yet${NC}"
    fi
}

# Logs
logs() {
    echo -e "${BLUE}📋 Following logs... (Ctrl+C to exit)${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
}

# Stop services
stop() {
    echo -e "${BLUE}🛑 Stopping DS3 World...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Backup
backup() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backup_${timestamp}.sql"
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec postgres pg_dump -U postgres ds3_world > "$backup_file"
    
    echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
}

# Update
update() {
    echo -e "${BLUE}🔄 Updating DS3 World...${NC}"
    
    # Pull latest code
    if [ -d ".git" ]; then
        echo -e "${BLUE}📥 Pulling latest code...${NC}"
        git pull
    fi
    
    # Redeploy
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    echo -e "${BLUE}⏳ Waiting for services to restart...${NC}"
    sleep 15
    
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Update complete!${NC}"
    else
        echo -e "${RED}❌ Update failed${NC}"
        echo -e "${YELLOW}📋 Check logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs${NC}"
    fi
}

# Help
help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy   - Deploy DS3 World with Cloudflare (default)"
    echo "  status   - Show service status"
    echo "  logs     - Show logs"
    echo "  stop     - Stop services"
    echo "  backup   - Backup database"
    echo "  update   - Update application"
    echo "  help     - Show this help"
    echo ""
    echo "Environment file: $ENV_FILE"
    echo "Compose file: $COMPOSE_FILE"
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    deploy
}

# Command line arguments
case "${1:-}" in
    "deploy"|"")
        main
        ;;
    "status")
        status
        ;;
    "logs")
        logs
        ;;
    "stop")
        stop
        ;;
    "backup")
        backup
        ;;
    "update")
        update
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
