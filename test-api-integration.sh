#!/bin/bash

# Test API Integration Script
# This script verifies that the frontend-backend integration is working correctly

set -e  # Exit on error

echo "🧪 Testing Atelier Kaisla API Integration"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4000"
API_BASE="${BACKEND_URL}/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "Step 1: Testing Backend API Endpoints"
echo "--------------------------------------"
echo ""

# Test 1: Backend Health Check
echo -n "Testing backend health... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 404 ]; then
    print_result 0 "Backend is running"
else
    print_result 1 "Backend is not responding (HTTP $HTTP_CODE)"
fi

# Test 2: API Prefix
echo -n "Testing API prefix... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/products")
if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "API prefix /api is configured correctly"
else
    print_result 1 "API prefix not working (HTTP $HTTP_CODE)"
fi

# Test 3: Get Wall Hangings
echo -n "Testing GET /api/products/category/wall-hanging... "
RESPONSE=$(curl -s "${API_BASE}/products/category/wall-hanging")
if echo "$RESPONSE" | grep -q "\"category\":\"wall-hanging\"" || echo "$RESPONSE" | grep -q "\[\]"; then
    COUNT=$(echo "$RESPONSE" | grep -o "\"id\":" | wc -l | tr -d ' ')
    print_result 0 "Wall hangings endpoint works (found $COUNT products)"
else
    print_result 1 "Wall hangings endpoint failed"
fi

# Test 4: Get Rugs
echo -n "Testing GET /api/products/category/rug... "
RESPONSE=$(curl -s "${API_BASE}/products/category/rug")
if echo "$RESPONSE" | grep -q "\"category\":\"rug\"" || echo "$RESPONSE" | grep -q "\[\]"; then
    COUNT=$(echo "$RESPONSE" | grep -o "\"id\":" | wc -l | tr -d ' ')
    print_result 0 "Rugs endpoint works (found $COUNT products)"
else
    print_result 1 "Rugs endpoint failed"
fi

# Test 5: Get All Products
echo -n "Testing GET /api/products... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/products")
if [ "$HTTP_CODE" -eq 200 ]; then
    print_result 0 "All products endpoint works"
else
    print_result 1 "All products endpoint failed (HTTP $HTTP_CODE)"
fi

# Test 6: Get Statistics
echo -n "Testing GET /api/products/statistics... "
RESPONSE=$(curl -s "${API_BASE}/products/statistics")
if echo "$RESPONSE" | grep -q "\"total\":" && echo "$RESPONSE" | grep -q "\"byCategory\":"; then
    TOTAL=$(echo "$RESPONSE" | grep -o "\"total\":[0-9]*" | grep -o "[0-9]*")
    print_result 0 "Statistics endpoint works (total: $TOTAL products)"
else
    print_result 1 "Statistics endpoint failed"
fi

# Test 7: Swagger Documentation
echo -n "Testing Swagger documentation... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/docs")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ]; then
    print_result 0 "Swagger docs are accessible at ${API_BASE}/docs"
else
    print_result 1 "Swagger docs not accessible (HTTP $HTTP_CODE)"
fi

echo ""
echo "Step 2: Testing CORS Configuration"
echo "-----------------------------------"
echo ""

# Test 8: CORS Headers
echo -n "Testing CORS headers... "
CORS_HEADER=$(curl -s -H "Origin: http://localhost:3002" -I "${API_BASE}/products" | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADER" ]; then
    print_result 0 "CORS is configured correctly"
else
    print_result 1 "CORS headers not found"
fi

echo ""
echo "Step 3: Data Validation"
echo "-----------------------"
echo ""

# Test 9: Product Data Structure
echo -n "Testing product data structure... "
PRODUCT=$(curl -s "${API_BASE}/products/category/wall-hanging" | head -c 1000)
REQUIRED_FIELDS=("id" "name" "category" "price" "status")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$PRODUCT" | grep -q "\"$field\":"; then
        MISSING_FIELDS+=("$field")
    fi
done

if [ ${#MISSING_FIELDS[@]} -eq 0 ]; then
    print_result 0 "Product data structure is correct"
else
    print_result 1 "Missing fields: ${MISSING_FIELDS[*]}"
fi

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Integration is working correctly.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open frontend: http://localhost:3002"
    echo "2. Visit wall hangings: http://localhost:3002/wall-hanging"
    echo "3. Visit rugs: http://localhost:3002/rugs"
    echo "4. Check Swagger docs: http://localhost:4000/api/docs"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure backend is running: make dev-up"
    echo "2. Check backend logs: make dev-logs-backend"
    echo "3. Verify database is seeded: make backend-shell → npm run seed"
    echo "4. Check .env configuration"
    exit 1
fi
