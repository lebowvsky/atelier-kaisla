#!/bin/bash

# Test script for POST /api/products/with-upload endpoint
# This script tests both dimension validation and image upload functionality

set -e

echo "🧪 Testing POST /api/products/with-upload endpoint"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000/api"

# Check if backend is running
echo "📡 Checking if backend is running..."
if ! curl -s "${API_URL}/products" > /dev/null; then
  echo -e "${RED}❌ Backend is not running on ${API_URL}${NC}"
  echo "Please start the backend with: make dev-up"
  exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Create a test image (1x1 pixel PNG)
TEST_IMAGE_1="/tmp/test-image-1.png"
TEST_IMAGE_2="/tmp/test-image-2.png"

# Create a simple 1x1 red PNG
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB\x60\x82" > "$TEST_IMAGE_1"

# Create a simple 1x1 blue PNG
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x00\xf8\x0f\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB\x60\x82" > "$TEST_IMAGE_2"

echo "🖼️  Test images created: $TEST_IMAGE_1, $TEST_IMAGE_2"
echo ""

# Test 1: Create product WITHOUT dimensions
echo "Test 1: Creating product WITHOUT dimensions"
echo "--------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_URL}/products/with-upload" \
  -F "name=Test Wall Hanging Without Dimensions" \
  -F "description=Testing product creation without dimensions" \
  -F "category=wall-hanging" \
  -F "price=99.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F "materials=Cotton, wool" \
  -F "images=@${TEST_IMAGE_1}" \
  -F "images=@${TEST_IMAGE_2}")

if echo "$RESPONSE" | grep -q '"id"'; then
  PRODUCT_ID_1=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Product created successfully without dimensions${NC}"
  echo "   Product ID: $PRODUCT_ID_1"

  # Check images
  IMAGE_COUNT=$(echo "$RESPONSE" | grep -o '"images":\[[^]]*\]' | grep -o 'http' | wc -l)
  echo "   Images uploaded: $IMAGE_COUNT"

  if [ "$IMAGE_COUNT" -eq 2 ]; then
    echo -e "${GREEN}   ✅ Both images uploaded successfully${NC}"

    # Extract and test image URLs
    echo "$RESPONSE" | grep -o 'http://[^"]*\.png' | while read -r IMAGE_URL; do
      echo "   Testing image URL: $IMAGE_URL"
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
      if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}   ✅ Image accessible (HTTP $HTTP_CODE)${NC}"
      else
        echo -e "${RED}   ❌ Image NOT accessible (HTTP $HTTP_CODE)${NC}"
      fi
    done
  else
    echo -e "${YELLOW}   ⚠️  Expected 2 images but got $IMAGE_COUNT${NC}"
  fi
else
  echo -e "${RED}❌ Failed to create product without dimensions${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Create product WITH dimensions (JSON string)
echo "Test 2: Creating product WITH dimensions (JSON string)"
echo "-------------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_URL}/products/with-upload" \
  -F "name=Test Rug With Dimensions" \
  -F "description=Testing product creation with dimensions" \
  -F "category=rug" \
  -F "price=149.99" \
  -F "status=draft" \
  -F "stockQuantity=3" \
  -F "materials=Wool, natural dyes" \
  -F 'dimensions={"width": 120, "height": 180, "unit": "cm"}' \
  -F "images=@${TEST_IMAGE_1}" \
  -F "images=@${TEST_IMAGE_2}")

if echo "$RESPONSE" | grep -q '"id"'; then
  PRODUCT_ID_2=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Product created successfully with dimensions${NC}"
  echo "   Product ID: $PRODUCT_ID_2"

  # Check dimensions
  if echo "$RESPONSE" | grep -q '"width":120'; then
    echo -e "${GREEN}   ✅ Dimensions saved correctly${NC}"
    echo "$RESPONSE" | grep -o '"dimensions":{[^}]*}' | sed 's/^/   /'
  else
    echo -e "${YELLOW}   ⚠️  Dimensions might not be saved correctly${NC}"
    echo "$RESPONSE" | grep -o '"dimensions":[^,}]*' | sed 's/^/   /'
  fi

  # Check images
  IMAGE_COUNT=$(echo "$RESPONSE" | grep -o '"images":\[[^]]*\]' | grep -o 'http' | wc -l)
  echo "   Images uploaded: $IMAGE_COUNT"

  if [ "$IMAGE_COUNT" -eq 2 ]; then
    echo -e "${GREEN}   ✅ Both images uploaded successfully${NC}"
  else
    echo -e "${YELLOW}   ⚠️  Expected 2 images but got $IMAGE_COUNT${NC}"
  fi
else
  echo -e "${RED}❌ Failed to create product with dimensions${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 3: View uploaded products
echo "Test 3: Retrieving created products"
echo "------------------------------------"
if [ -n "$PRODUCT_ID_1" ]; then
  echo "Fetching product 1 (without dimensions)..."
  PRODUCT_1=$(curl -s "${API_URL}/products/${PRODUCT_ID_1}")

  if echo "$PRODUCT_1" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Product 1 retrieved successfully${NC}"
    echo "$PRODUCT_1" | grep -o '"images":\[[^]]*\]' | sed 's/^/   /'
  fi
fi

if [ -n "$PRODUCT_ID_2" ]; then
  echo "Fetching product 2 (with dimensions)..."
  PRODUCT_2=$(curl -s "${API_URL}/products/${PRODUCT_ID_2}")

  if echo "$PRODUCT_2" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Product 2 retrieved successfully${NC}"
    echo "$PRODUCT_2" | grep -o '"dimensions":{[^}]*}' | sed 's/^/   /'
    echo "$PRODUCT_2" | grep -o '"images":\[[^]]*\]' | sed 's/^/   /'
  fi
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo ""
echo "✅ Key points to verify:"
echo "   1. Products created without validation errors"
echo "   2. Dimensions are saved correctly (when provided)"
echo "   3. Image URLs are generated"
echo "   4. Images are accessible via HTTP"
echo ""
echo "🔍 To verify images are actually visible:"
echo "   - Open http://localhost:4000/api/docs"
echo "   - Or check the frontend/backoffice to see if images display"
echo ""
echo "📝 Check backend logs for detailed debugging information:"
echo "   docker compose -f docker-compose.dev.yml logs -f backend"
echo ""

# Cleanup
rm -f "$TEST_IMAGE_1" "$TEST_IMAGE_2"
echo "🧹 Cleaned up test images"
