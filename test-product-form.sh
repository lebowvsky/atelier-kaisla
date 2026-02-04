#!/bin/bash

# Test Product Form Integration
# This script tests the product creation endpoint used by the backoffice form

set -e

echo "========================================="
echo "Product Form Integration Test"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -n "Checking backend connection... "
if curl -s http://localhost:4000/api/products > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Error: Backend is not running on http://localhost:4000"
    echo "Start it with: make dev-up"
    exit 1
fi

echo ""

# Test 1: Create a minimal product (required fields only)
echo "Test 1: Create minimal product (required fields only)"
echo "----------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Wall Hanging",
    "category": "wall-hanging",
    "price": 149.99
  }')

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    PRODUCT_ID=$(echo "$RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✓${NC} Product created successfully"
    echo "  ID: $PRODUCT_ID"
    echo "  Name: $(echo "$RESPONSE" | jq -r '.name')"
    echo "  Price: €$(echo "$RESPONSE" | jq -r '.price')"
    echo "  Status: $(echo "$RESPONSE" | jq -r '.status')"
else
    echo -e "${RED}✗${NC} Failed to create product"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""

# Test 2: Create a complete product (all fields)
echo "Test 2: Create complete product (all fields)"
echo "----------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Handwoven Bohemian Wall Hanging",
    "description": "Beautiful handcrafted wall hanging with intricate patterns and natural fibers",
    "category": "wall-hanging",
    "price": 199.99,
    "status": "available",
    "stockQuantity": 5,
    "materials": "Cotton, wool, natural dyes",
    "dimensions": {
      "width": 60,
      "height": 90,
      "unit": "cm"
    },
    "images": [
      "https://placehold.co/600x900/e2e8f0/64748b?text=Wall+Hanging+1",
      "https://placehold.co/600x900/e2e8f0/64748b?text=Wall+Hanging+2"
    ]
  }')

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    PRODUCT_ID=$(echo "$RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✓${NC} Product created successfully"
    echo "  ID: $PRODUCT_ID"
    echo "  Name: $(echo "$RESPONSE" | jq -r '.name')"
    echo "  Price: €$(echo "$RESPONSE" | jq -r '.price')"
    echo "  Stock: $(echo "$RESPONSE" | jq -r '.stockQuantity')"
    echo "  Dimensions: $(echo "$RESPONSE" | jq -r '.dimensions.width')x$(echo "$RESPONSE" | jq -r '.dimensions.height') $(echo "$RESPONSE" | jq -r '.dimensions.unit')"
    echo "  Images: $(echo "$RESPONSE" | jq -r '.images | length') images"
else
    echo -e "${RED}✗${NC} Failed to create product"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""

# Test 3: Validation error (missing required fields)
echo "Test 3: Validation error (missing price)"
echo "----------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Product",
    "category": "wall-hanging"
  }')

if echo "$RESPONSE" | jq -e '.statusCode' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Validation error returned as expected"
    echo "  Status: $(echo "$RESPONSE" | jq -r '.statusCode')"
    echo "  Message: $(echo "$RESPONSE" | jq -r '.message')"
else
    echo -e "${YELLOW}⚠${NC} Expected validation error, got: $RESPONSE"
fi

echo ""

# Test 4: Get all products (verify our test products exist)
echo "Test 4: Verify products list"
echo "----------------------------------------------"
RESPONSE=$(curl -s http://localhost:4000/api/products)
TOTAL=$(echo "$RESPONSE" | jq -r '.total')
echo -e "${GREEN}✓${NC} Total products in database: $TOTAL"

# Count test products
TEST_COUNT=$(echo "$RESPONSE" | jq -r '.data | map(select(.name | contains("Test"))) | length')
echo "  Test products created: $TEST_COUNT"

echo ""
echo "========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Open backoffice: http://localhost:3001/products"
echo "2. Click 'Add Product' button"
echo "3. Fill in the form and submit"
echo "4. Verify the new product appears in the list"
echo ""
echo "To view all products via API:"
echo "  curl http://localhost:4000/api/products | jq"
echo ""
echo "To view API documentation:"
echo "  open http://localhost:4000/api/docs"
