#!/bin/bash

# CORS Fix - One-Command Deployment Script
# This script automates the complete deployment of the CORS fix

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKEND_CONTAINER="atelier-kaisla-backend-prod"

echo -e "${BLUE}================================================================================================${NC}"
echo -e "${BLUE}                      ATELIER KAISLA - CORS FIX DEPLOYMENT${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "${CYAN}► Step $1: $2${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "docker-compose.prod.yml not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

print_success "Found docker-compose.prod.yml"
echo ""

# Step 1: Show current status
print_step "1" "Checking current container status"
docker compose -f "$COMPOSE_FILE" ps backend || true
echo ""

# Step 2: Confirm deployment
echo -e "${YELLOW}This will:${NC}"
echo "  1. Stop the backend container"
echo "  2. Rebuild it with new CORS configuration"
echo "  3. Start the backend container"
echo "  4. Verify environment variables"
echo "  5. Check logs for CORS configuration"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user"
    exit 0
fi
echo ""

# Step 3: Stop containers
print_step "2" "Stopping production containers"
docker compose -f "$COMPOSE_FILE" down
print_success "Containers stopped"
echo ""

# Step 4: Rebuild backend
print_step "3" "Rebuilding backend with new CORS configuration (this may take 2-5 minutes)"
docker compose -f "$COMPOSE_FILE" build backend --no-cache
print_success "Backend rebuilt successfully"
echo ""

# Step 5: Start containers
print_step "4" "Starting production containers"
docker compose -f "$COMPOSE_FILE" up -d
print_success "Containers started"
echo ""

# Step 6: Wait for backend to be ready
print_step "5" "Waiting for backend to be ready (30 seconds)"
sleep 30
print_success "Backend should be ready"
echo ""

# Step 7: Verify environment variables
print_step "6" "Verifying environment variables"
echo ""
ENV_CHECK=$(docker exec "$BACKEND_CONTAINER" env | grep URL || echo "")

if echo "$ENV_CHECK" | grep -q "FRONTEND_URL=https://kaisla.lebowvsky.com"; then
    print_success "FRONTEND_URL is correctly set"
else
    print_error "FRONTEND_URL is missing or incorrect"
    echo "Expected: FRONTEND_URL=https://kaisla.lebowvsky.com"
    echo "Actual: $ENV_CHECK"
fi

if echo "$ENV_CHECK" | grep -q "BACKOFFICE_URL=https://bokaisla.lebowvsky.com"; then
    print_success "BACKOFFICE_URL is correctly set"
else
    print_error "BACKOFFICE_URL is missing or incorrect"
    echo "Expected: BACKOFFICE_URL=https://bokaisla.lebowvsky.com"
    echo "Actual: $ENV_CHECK"
fi
echo ""

# Step 8: Check CORS logs
print_step "7" "Checking backend logs for CORS configuration"
echo ""
CORS_LOG=$(docker compose -f "$COMPOSE_FILE" logs backend | grep "CORS enabled" | tail -1 || echo "")

if [ -n "$CORS_LOG" ]; then
    print_success "CORS configuration found in logs:"
    echo "$CORS_LOG"
else
    print_warning "CORS configuration not found in logs yet"
    print_warning "Backend may still be starting up"
fi
echo ""

# Step 9: Container status
print_step "8" "Checking container health"
docker compose -f "$COMPOSE_FILE" ps backend
echo ""

# Step 10: Run automated tests if available
if [ -f "./test-cors.sh" ]; then
    print_step "9" "Running automated CORS tests"
    echo ""
    read -p "Run automated tests now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com
    else
        print_warning "Skipping automated tests"
        echo "You can run them later with:"
        echo "  ./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com"
    fi
else
    print_warning "test-cors.sh not found"
fi
echo ""

# Summary
echo -e "${BLUE}================================================================================================${NC}"
echo -e "${BLUE}                              DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""
print_success "Backend container rebuilt with new CORS configuration"
print_success "Container is running"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Test in Browser:"
echo "   - Open: https://bokaisla.lebowvsky.com"
echo "   - Open DevTools (F12) > Console"
echo "   - Make API requests"
echo "   - Verify no CORS errors appear"
echo ""

echo "2. Monitor Logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f backend | grep CORS"
echo ""

echo "3. Manual cURL Test:"
echo "   curl -X OPTIONS \\"
echo "     -H \"Origin: https://bokaisla.lebowvsky.com\" \\"
echo "     -H \"Access-Control-Request-Method: POST\" \\"
echo "     -i https://api.lebowvsky.com/api/products | grep \"Access-Control\""
echo ""

echo "4. If Issues Persist:"
echo "   - Check: /CORS-TROUBLESHOOTING.md"
echo "   - Check Traefik configuration (remove CORS middleware if present)"
echo "   - Verify browser cache cleared"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  - Quick guide: /CORS-FIX-README.md"
echo "  - Troubleshooting: /CORS-TROUBLESHOOTING.md"
echo "  - Technical details: /CORS-FIX-SUMMARY.md"
echo ""

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}================================================================================================${NC}"
