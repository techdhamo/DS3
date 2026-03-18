#!/bin/bash

# 🚀 DS3 World Deployment Script v1.0
# Deploys DS3 World with Docker and Cloudflare DNS

set -e

echo "🎮 DS3 World Deployment v1.0"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp ENV_EXAMPLE.txt .env
    echo -e "${YELLOW}📝 Please edit .env file with your actual credentials before continuing.${NC}"
    echo -e "${YELLOW}   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RAZORPAY keys${NC}"
    read -p "Press Enter after editing .env file..."
fi

# Function to check if service is running
check_service() {
    if docker-compose ps | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    echo -e "${BLUE}⏳ Waiting for DS3 World to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ DS3 World is running!${NC}"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    echo -e "${RED}❌ Service failed to start within 60 seconds${NC}"
    return 1
}

# Main deployment
main() {
    echo -e "${BLUE}📦 Building Docker images...${NC}"
    docker-compose build
    
    echo -e "${BLUE}🚀 Starting services...${NC}"
    docker-compose up -d
    
    echo -e "${BLUE}🔍 Checking service status...${NC}"
    sleep 10
    
    if check_service; then
        echo -e "${GREEN}✅ Services are running!${NC}"
        docker-compose ps
        
        if wait_for_service; then
            echo -e "${GREEN}🎉 DS3 World deployed successfully!${NC}"
            echo -e "${GREEN}🌐 Local URL: http://localhost:3000${NC}"
            echo -e "${GREEN}📊 Docker logs: docker-compose logs -f${NC}"
            echo -e "${GREEN}🛑 Stop services: docker-compose down${NC}"
            
            # Show database info
            echo -e "${BLUE}💾 Database Commands:${NC}"
            echo -e "${BLUE}   Run migrations: docker-compose exec app npx prisma db push${NC}"
            echo -e "${BLUE}   Seed database: docker-compose exec app npx prisma db seed${NC}"
            echo -e "${BLUE}   View database: docker-compose exec postgres psql -U postgres -d ds3_world${NC}"
        else
            echo -e "${RED}❌ Service check failed${NC}"
            echo -e "${YELLOW}📋 Check logs: docker-compose logs${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Services failed to start${NC}"
        echo -e "${YELLOW}📋 Check logs: docker-compose logs${NC}"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    docker-compose down
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Update function
update() {
    echo -e "${BLUE}🔄 Updating DS3 World...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    wait_for_service
    echo -e "${GREEN}✅ Update complete!${NC}"
}

# Backup function
backup() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    docker-compose exec postgres pg_dump -U postgres ds3_world > "backup_${timestamp}.sql"
    echo -e "${GREEN}✅ Backup created: backup_${timestamp}.sql${NC}"
}

# Command line arguments
case "${1:-}" in
    "deploy"|"")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "update")
        update
        ;;
    "backup")
        backup
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "stop")
        docker-compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy DS3 World (default)"
        echo "  cleanup  - Stop services and clean up Docker"
        echo "  update   - Update DS3 World"
        echo "  backup   - Backup database"
        echo "  logs     - Show logs"
        echo "  status   - Show service status"
        echo "  stop     - Stop services"
        echo "  help     - Show this help"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
