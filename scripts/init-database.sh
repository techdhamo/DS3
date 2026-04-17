#!/bin/bash

# 🗄️ DS3 World Database Initialization Script
# Sets up the local Docker PostgreSQL database

echo "🗄️ DS3 World Database Initialization"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Initializing local PostgreSQL database...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Start the database container
echo -e "${BLUE}🚀 Starting PostgreSQL container...${NC}"
docker-compose -f docker-compose.cloudflare.yml up -d postgres

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if docker-compose -f docker-compose.cloudflare.yml exec -T postgres pg_isready -U ds3admin -d ds3world > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Push database schema
echo -e "${BLUE}📦 Pushing database schema...${NC}"
npx prisma db push

# Seed the database
echo -e "${BLUE}🌱 Seeding database with initial data...${NC}"
npx prisma db seed

echo -e "${GREEN}✅ Database initialization complete!${NC}"
echo -e "${YELLOW}📊 You can now view the database with: npx prisma studio${NC}"
echo -e "${YELLOW}🔍 Or connect with: psql -h localhost -p 5432 -U ds3admin -d ds3world${NC}"
