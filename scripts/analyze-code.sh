#!/bin/bash

# DS3 Code Analysis Script
# Run this to analyze code quality locally

echo "=========================================="
echo "   🔍 DS3 CODE ANALYSIS"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check TypeScript compilation
echo "📋 Checking TypeScript compilation..."
cd /Users/dhamo/lab/ds3
if npx tsc --noEmit 2>&1 | head -20; then
    echo -e "${GREEN}✅ TypeScript compilation passed${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found${NC}"
fi
echo ""

# Run ESLint
echo "🔍 Running ESLint..."
if npx eslint . --ext .ts,.tsx --max-warnings=0 2>&1 | head -30; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint warnings/errors found${NC}"
fi
echo ""

# Check for security issues
echo "🔒 Security Analysis..."
if grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.js" app/ 2>/dev/null | grep -v "node_modules" | grep -v "ENV_" | head -10; then
    echo -e "${YELLOW}⚠️  Potential hardcoded secrets found${NC}"
else
    echo -e "${GREEN}✅ No obvious hardcoded secrets${NC}"
fi
echo ""

# Count files
echo "📊 Project Statistics:"
echo "  TypeScript/React files: $(find app -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)"
echo "  Java files: $(find ds3-dropshipping-service -name "*.java" 2>/dev/null | wc -l)"
echo "  Mobile screens: $(find mobile-app/src -name "*.tsx" 2>/dev/null | wc -l)"
echo ""

# Git stats
echo "📈 Git Statistics:"
echo "  Total commits: $(git rev-list --count HEAD)"
echo "  Lines of code: $(git ls-files | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')"
echo "  Last author: $(git log -1 --format='%an <%ae>')"
echo ""

echo "=========================================="
echo "   🎯 CODERABBIT.AI SETUP"
echo "=========================================="
echo ""
echo "To enable AI code review, install Coderabbit:"
echo ""
echo "1. Go to: https://github.com/apps/coderabbit-ai"
echo "2. Click 'Install'"
echo "3. Select repository: techdhamo/DS3"
echo "4. Coderabbit will automatically review PRs"
echo ""
echo "Features you'll get:"
echo "  ✅ AI-powered code review"
echo "  ✅ Automatic PR summaries"
echo "  ✅ Security vulnerability detection"
echo "  ✅ Performance suggestions"
echo "  ✅ Best practice recommendations"
echo ""
echo "=========================================="
