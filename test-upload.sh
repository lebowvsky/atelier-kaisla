#!/bin/bash

# Test script for product upload endpoint
# This script tests the /api/products/with-upload endpoint

set -e

API_URL="http://localhost:4000/api/products/with-upload"
TEST_IMAGE="test-image.jpg"

echo "🧪 Testing Product Upload API"
echo "=============================="
echo ""

# Check if test image exists, if not create a simple one
if [ ! -f "$TEST_IMAGE" ]; then
  echo "📸 Creating test image..."
  # Create a simple 1x1 pixel JPEG for testing
  # Using base64 encoded minimal JPEG
  echo "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==" | base64 -d > "$TEST_IMAGE"
  echo "✓ Test image created"
fi

echo ""
echo "📤 Sending POST request to $API_URL"
echo ""

# Test 1: Create product with image
echo "Test 1: Creating product with image..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -F "name=Test Wall Hanging" \
  -F "description=A beautiful test product created via upload API" \
  -F "category=wall-hanging" \
  -F "price=199.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F "dimensions={\"width\": 60, \"height\": 80, \"unit\": \"cm\"}" \
  -F "materials=Cotton, wool, natural fibers" \
  -F "images=@$TEST_IMAGE")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Test 1 PASSED - Product created successfully (HTTP $HTTP_CODE)"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.'

  # Extract product ID for cleanup
  PRODUCT_ID=$(echo "$BODY" | jq -r '.id')
  echo ""
  echo "Product ID: $PRODUCT_ID"
else
  echo "❌ Test 1 FAILED - Expected HTTP 201, got HTTP $HTTP_CODE"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.'
  exit 1
fi

echo ""
echo "=============================="
echo "✅ All tests completed successfully!"
echo ""
echo "💡 Tips:"
echo "  - View all products: curl http://localhost:4000/api/products"
echo "  - View this product: curl http://localhost:4000/api/products/$PRODUCT_ID"
echo "  - Delete this product: curl -X DELETE http://localhost:4000/api/products/$PRODUCT_ID"
echo "  - API Documentation: http://localhost:4000/api/docs"
echo ""

# Cleanup test image
rm -f "$TEST_IMAGE"
