#!/bin/bash

# Verification script for upload feature setup
# Checks that all files are in place and backend is ready

set -e

echo "🔍 Verifying Upload Feature Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Check function
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} Missing: $1"
    ((CHECKS_FAILED++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} Found: $1"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} Missing: $1"
    ((CHECKS_FAILED++))
  fi
}

echo "📁 Checking Upload Module Files..."
check_file "apps/backend/src/modules/upload/upload.module.ts"
check_file "apps/backend/src/modules/upload/upload.service.ts"
check_file "apps/backend/src/modules/upload/upload.service.spec.ts"
echo ""

echo "📁 Checking Products Module Updates..."
check_file "apps/backend/src/modules/products/dto/create-product-with-upload.dto.ts"
check_file "apps/backend/src/modules/products/products.controller.ts"
check_file "apps/backend/src/modules/products/products.service.ts"
check_file "apps/backend/src/modules/products/products.module.ts"
echo ""

echo "📁 Checking Common Utilities..."
check_file "apps/backend/src/common/guards/file-size-validation.pipe.ts"
check_file "apps/backend/src/common/filters/file-upload-exception.filter.ts"
echo ""

echo "📁 Checking Upload Directory..."
check_dir "apps/backend/uploads"
check_dir "apps/backend/uploads/products"
check_file "apps/backend/uploads/.gitignore"
echo ""

echo "📁 Checking Documentation..."
check_file "apps/backend/UPLOAD-API.md"
check_file "apps/backend/CHANGELOG-UPLOAD.md"
check_file "PRODUCT-UPLOAD-SUMMARY.md"
check_file "FILES-CHANGED.md"
echo ""

echo "📁 Checking Test Tools..."
check_file "apps/backend/test-upload.html"
check_file "test-upload.sh"
echo ""

echo "=================================="
echo ""

# Summary
TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED))
echo "Results: ${GREEN}${CHECKS_PASSED}${NC} passed, ${RED}${CHECKS_FAILED}${NC} failed out of ${TOTAL_CHECKS} checks"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "📋 Next Steps:"
  echo "  1. Start backend: cd apps/backend && npm run start:dev"
  echo "  2. Test with HTML form: open apps/backend/test-upload.html"
  echo "  3. Test with script: ./test-upload.sh"
  echo "  4. View API docs: http://localhost:4000/api/docs"
  echo ""
  echo "📚 Documentation:"
  echo "  - Quick start: PRODUCT-UPLOAD-SUMMARY.md"
  echo "  - API reference: apps/backend/UPLOAD-API.md"
  echo "  - Changelog: apps/backend/CHANGELOG-UPLOAD.md"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some checks failed!${NC}"
  echo ""
  echo "Please ensure all files are present."
  echo "Review FILES-CHANGED.md for complete file list."
  echo ""
  exit 1
fi
