# Commit Message - Backoffice API URL Fix

## Suggested Commit Message

```
fix: correct backoffice API URL resolution for dev and production

Resolved CORS error in development by implementing intelligent URL detection
that uses localhost for browser requests and Docker network for SSR.

Changes:
- Updated useAuth.ts with smart getApiUrl() function
- Updated useProducts.ts with smart getApiUrl() function
- Added NUXT_PUBLIC_API_URL to .env
- Added debug logging for API URL resolution
- Created comprehensive documentation

The backoffice now correctly uses:
- Dev browser: http://localhost:4000/api
- Dev SSR: http://backend:4000/api
- Prod (all): https://api.lebowvsky.com

Fixes #[issue-number] (if applicable)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Files to Stage

### Modified
```bash
git add apps/backoffice/app/composables/useAuth.ts
git add apps/backoffice/app/composables/useProducts.ts
git add .env
```

### Created
```bash
git add BACKOFFICE-API-URL-FIX.md
git add BACKOFFICE-API-URL-COMPLETE.md
git add BACKOFFICE-DOCS-INDEX.md
git add QUICK-START-BACKOFFICE.md
git add API-URL-SUMMARY.md
git add apps/backoffice/API-URL-DIAGRAM.md
git add test-backoffice-api-url.sh
git add COMMIT-MESSAGE-BACKOFFICE-FIX.md
```

## Git Commands

```bash
# Stage modified composables
git add apps/backoffice/app/composables/useAuth.ts
git add apps/backoffice/app/composables/useProducts.ts

# Stage environment file
git add .env

# Stage documentation
git add BACKOFFICE-API-URL-FIX.md
git add BACKOFFICE-API-URL-COMPLETE.md
git add BACKOFFICE-DOCS-INDEX.md
git add QUICK-START-BACKOFFICE.md
git add API-URL-SUMMARY.md
git add apps/backoffice/API-URL-DIAGRAM.md

# Stage test script
git add test-backoffice-api-url.sh

# Commit with message
git commit -m "$(cat <<'EOF'
fix: correct backoffice API URL resolution for dev and production

Resolved CORS error in development by implementing intelligent URL detection
that uses localhost for browser requests and Docker network for SSR.

Changes:
- Updated useAuth.ts with smart getApiUrl() function
- Updated useProducts.ts with smart getApiUrl() function
- Added NUXT_PUBLIC_API_URL to .env
- Added debug logging for API URL resolution
- Created comprehensive documentation

The backoffice now correctly uses:
- Dev browser: http://localhost:4000/api
- Dev SSR: http://backend:4000/api
- Prod (all): https://api.lebowvsky.com

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

## Changes Summary

### Code Changes

**useAuth.ts** (4 changes):
1. Updated `getApiUrl()` function (lines 47-74)
2. Added context logging in `login()` (lines 127-131)
3. Added context logging in `getUser()` (lines 212-216)
4. Comments improved for clarity

**useProducts.ts** (9 changes):
1. Updated `getApiUrl()` function (lines 41-68)
2. Added logging in `fetchProducts()` (lines 162-167)
3. Added logging in `fetchProductById()` (lines 201-205)
4. Added logging in `fetchByCategory()` (lines 238-243)
5. Added logging in `createProduct()` (lines 258-263)
6. Added logging in `createProductWithImages()` (lines 311-317)
7. Added logging in `updateProduct()` (lines 364-369)
8. Added logging in `deleteProduct()` (lines 392-397)
9. Added logging in `fetchStatistics()` (lines 419-424)

**.env** (1 change):
1. Added `NUXT_PUBLIC_API_URL=http://backend:4000/api` with comments

### Documentation Created

1. **BACKOFFICE-API-URL-FIX.md** (5.3 KB)
   - Problem description
   - Solution explanation
   - Testing guide

2. **BACKOFFICE-API-URL-COMPLETE.md** (11 KB)
   - Complete modifications list
   - All code changes
   - Troubleshooting guide

3. **QUICK-START-BACKOFFICE.md** (4.7 KB)
   - Quick start guide
   - Test commands
   - Expected output

4. **API-URL-SUMMARY.md** (1.4 KB)
   - One-page summary
   - URL resolution table

5. **apps/backoffice/API-URL-DIAGRAM.md** (15 KB)
   - Architecture diagrams
   - Flow charts
   - Network diagrams

6. **BACKOFFICE-DOCS-INDEX.md** (4.2 KB)
   - Documentation index
   - Quick links
   - File structure

7. **test-backoffice-api-url.sh** (executable)
   - Automated test script
   - Configuration validation

## Lines Changed

- **useAuth.ts**: ~50 lines modified/added
- **useProducts.ts**: ~100 lines modified/added
- **.env**: 6 lines added
- **Documentation**: ~1,500 lines added (7 files)
- **Test script**: ~150 lines added

**Total**: ~1,800 lines changed/added

## Verification Steps Before Commit

1. ✅ Test script passes: `./test-backoffice-api-url.sh`
2. ✅ Development environment works: `make dev-up-d`
3. ✅ Browser console shows correct URL
4. ✅ Login successful
5. ✅ No CORS errors
6. ✅ Documentation complete
7. ✅ All files formatted correctly

## Post-Commit Steps

1. Test in development:
   ```bash
   make dev-down
   make dev-rebuild
   make dev-up-d
   ```

2. Open backoffice: http://localhost:3001

3. Test login

4. Verify console logs

5. Test in production (if deploying):
   ```bash
   # On production server
   git pull
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d --build
   ```

## Breaking Changes

None. This is a bug fix that improves existing functionality.

## Migration Notes

No migration needed. The changes are backward compatible and improve the existing API URL resolution logic.

---

**Date**: 2026-02-06
**Type**: Bug fix
**Scope**: Backoffice API integration
**Impact**: Development and production environments
