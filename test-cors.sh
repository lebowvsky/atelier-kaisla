#!/bin/bash

# CORS Testing Script
# Tests CORS configuration for Atelier Kaisla backend

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Atelier Kaisla CORS Testing Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
API_URL="${1:-https://api.lebowvsky.com}"
BACKOFFICE_URL="${2:-https://bokaisla.lebowvsky.com}"
FRONTEND_URL="${3:-https://kaisla.lebowvsky.com}"

echo -e "${YELLOW}Testing API URL:${NC} $API_URL"
echo -e "${YELLOW}Backoffice Origin:${NC} $BACKOFFICE_URL"
echo -e "${YELLOW}Frontend Origin:${NC} $FRONTEND_URL"
echo ""

# Test function
test_cors() {
    local origin=$1
    local method=$2
    local endpoint=$3
    local test_name=$4

    echo -e "${BLUE}Testing: ${test_name}${NC}"
    echo -e "  Origin: ${origin}"
    echo -e "  Method: ${method}"
    echo -e "  Endpoint: ${endpoint}"

    if [ "$method" = "OPTIONS" ]; then
        # Preflight request
        response=$(curl -s -i -X OPTIONS \
            -H "Origin: ${origin}" \
            -H "Access-Control-Request-Method: POST" \
            -H "Access-Control-Request-Headers: Content-Type, Authorization" \
            "${API_URL}${endpoint}" 2>&1)
    else
        # Actual request
        response=$(curl -s -i -X ${method} \
            -H "Origin: ${origin}" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}" 2>&1)
    fi

    # Check for CORS headers
    if echo "$response" | grep -q "Access-Control-Allow-Origin: ${origin}"; then
        echo -e "  ${GREEN}✓ Access-Control-Allow-Origin: ${origin}${NC}"
        success=true
    elif echo "$response" | grep -q "Access-Control-Allow-Origin:"; then
        actual_origin=$(echo "$response" | grep "Access-Control-Allow-Origin:" | cut -d' ' -f2 | tr -d '\r')
        echo -e "  ${YELLOW}⚠ Access-Control-Allow-Origin: ${actual_origin}${NC}"
        echo -e "  ${YELLOW}  Expected: ${origin}${NC}"
        success=false
    else
        echo -e "  ${RED}✗ Access-Control-Allow-Origin header missing${NC}"
        success=false
    fi

    if [ "$method" = "OPTIONS" ]; then
        # Check additional preflight headers
        if echo "$response" | grep -q "Access-Control-Allow-Methods:"; then
            methods=$(echo "$response" | grep "Access-Control-Allow-Methods:" | cut -d' ' -f2- | tr -d '\r')
            echo -e "  ${GREEN}✓ Access-Control-Allow-Methods: ${methods}${NC}"
        else
            echo -e "  ${RED}✗ Access-Control-Allow-Methods header missing${NC}"
            success=false
        fi

        if echo "$response" | grep -q "Access-Control-Allow-Headers:"; then
            headers=$(echo "$response" | grep "Access-Control-Allow-Headers:" | cut -d' ' -f2- | tr -d '\r')
            echo -e "  ${GREEN}✓ Access-Control-Allow-Headers: ${headers}${NC}"
        else
            echo -e "  ${RED}✗ Access-Control-Allow-Headers header missing${NC}"
            success=false
        fi
    fi

    if echo "$response" | grep -q "Access-Control-Allow-Credentials: true"; then
        echo -e "  ${GREEN}✓ Access-Control-Allow-Credentials: true${NC}"
    else
        echo -e "  ${YELLOW}⚠ Access-Control-Allow-Credentials not found${NC}"
    fi

    # Check HTTP status
    status_code=$(echo "$response" | grep -E "^HTTP" | tail -1 | awk '{print $2}')
    if [ -n "$status_code" ]; then
        if [ "$method" = "OPTIONS" ]; then
            if [ "$status_code" = "204" ] || [ "$status_code" = "200" ]; then
                echo -e "  ${GREEN}✓ Status Code: ${status_code}${NC}"
            else
                echo -e "  ${YELLOW}⚠ Status Code: ${status_code} (expected 204 or 200)${NC}"
            fi
        else
            if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
                echo -e "  ${GREEN}✓ Status Code: ${status_code}${NC}"
            else
                echo -e "  ${RED}✗ Status Code: ${status_code}${NC}"
            fi
        fi
    fi

    if [ "$success" = true ]; then
        echo -e "  ${GREEN}Result: PASSED ✓${NC}"
    else
        echo -e "  ${RED}Result: FAILED ✗${NC}"
    fi

    echo ""
}

# Test Suite
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test 1: Backoffice Preflight${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
test_cors "$BACKOFFICE_URL" "OPTIONS" "/api/products" "Backoffice OPTIONS /api/products"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test 2: Backoffice GET Request${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
test_cors "$BACKOFFICE_URL" "GET" "/api/products" "Backoffice GET /api/products"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test 3: Frontend Preflight${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
test_cors "$FRONTEND_URL" "OPTIONS" "/api/products" "Frontend OPTIONS /api/products"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test 4: Frontend GET Request${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
test_cors "$FRONTEND_URL" "GET" "/api/products" "Frontend GET /api/products"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test 5: Unauthorized Origin${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
test_cors "https://malicious-site.com" "GET" "/api/products" "Unauthorized origin (should fail)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Manual Browser Testing:${NC}"
echo "1. Open $BACKOFFICE_URL in browser"
echo "2. Open DevTools (F12) > Network tab"
echo "3. Try making API requests"
echo "4. Check for CORS errors in console"
echo ""
echo -e "${YELLOW}Backend Logs:${NC}"
echo "docker compose -f docker-compose.prod.yml logs -f backend | grep CORS"
echo ""
echo -e "${YELLOW}Environment Check:${NC}"
echo "docker exec atelier-kaisla-backend-prod env | grep URL"
echo ""
echo -e "${GREEN}CORS testing completed!${NC}"
