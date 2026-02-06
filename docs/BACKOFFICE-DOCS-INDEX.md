# Backoffice Documentation Index

## Quick Links

### 🚀 Start Here

1. **[QUICK-START-BACKOFFICE.md](QUICK-START-BACKOFFICE.md)**
   - Quick start guide to test the backoffice
   - Commands to run
   - Expected console output

2. **[QUICK-START-CREDENTIALS.md](QUICK-START-CREDENTIALS.md)** ⭐ NEW
   - Quick guide for credentials update feature
   - User and developer instructions
   - API testing commands

3. **[API-URL-SUMMARY.md](API-URL-SUMMARY.md)**
   - One-page summary
   - URL resolution table
   - Files modified

### 📖 Detailed Documentation

#### Features

4. **[CREDENTIALS-UPDATE-FEATURE.md](CREDENTIALS-UPDATE-FEATURE.md)** ⭐ NEW
   - Credentials update feature documentation
   - Architecture and design patterns
   - Security features
   - Validation rules
   - API integration

5. **[CREDENTIALS-IMPLEMENTATION-SUMMARY.md](CREDENTIALS-IMPLEMENTATION-SUMMARY.md)** ⭐ NEW
   - Implementation summary
   - Files created/modified
   - Testing results
   - Production readiness

#### Infrastructure

6. **[BACKOFFICE-API-URL-FIX.md](BACKOFFICE-API-URL-FIX.md)**
   - Problem explanation
   - Solution implementation
   - Environment configuration
   - Testing guide

7. **[BACKOFFICE-API-URL-COMPLETE.md](BACKOFFICE-API-URL-COMPLETE.md)**
   - Complete modifications list
   - All code changes
   - Patterns applied
   - Troubleshooting guide

8. **[apps/backoffice/API-URL-DIAGRAM.md](apps/backoffice/API-URL-DIAGRAM.md)**
   - Architecture diagrams
   - Flow charts
   - Network architecture
   - Decision trees

## File Structure

```
/
├── QUICK-START-BACKOFFICE.md             # Quick start guide
├── QUICK-START-CREDENTIALS.md            # ⭐ NEW - Credentials quick start
├── API-URL-SUMMARY.md                    # Quick reference
├── BACKOFFICE-API-URL-FIX.md             # Detailed guide
├── BACKOFFICE-API-URL-COMPLETE.md        # Complete modifications
├── BACKOFFICE-DOCS-INDEX.md              # This file
├── CREDENTIALS-UPDATE-FEATURE.md         # ⭐ NEW - Feature docs
├── CREDENTIALS-IMPLEMENTATION-SUMMARY.md # ⭐ NEW - Implementation summary
├── test-backoffice-api-url.sh            # Test script (API URL)
├── test-credentials-update.sh            # ⭐ NEW - Test script (Credentials)
│
├── apps/backoffice/
│   ├── API-URL-DIAGRAM.md                # Architecture diagrams
│   ├── app/pages/
│   │   └── settings/
│   │       └── credentials.vue           # ⭐ NEW - Credentials update page
│   └── app/composables/
│       ├── useAuth.ts                    # ✅ Modified
│       ├── useProducts.ts                # ✅ Modified
│       └── useNavigation.ts              # ✅ Modified (Settings menu)
│
└── .env                                  # ✅ Modified
```

## Documentation Sections

### For New Features

#### Credentials Update Feature ⭐
- **Quick Start**: [QUICK-START-CREDENTIALS.md](QUICK-START-CREDENTIALS.md)
- **Feature Docs**: [CREDENTIALS-UPDATE-FEATURE.md](CREDENTIALS-UPDATE-FEATURE.md)
- **Implementation**: [CREDENTIALS-IMPLEMENTATION-SUMMARY.md](CREDENTIALS-IMPLEMENTATION-SUMMARY.md)

### For Infrastructure

#### Backoffice Setup
- **Quick Testing**: [QUICK-START-BACKOFFICE.md](QUICK-START-BACKOFFICE.md)
- **API URL Fix**: [BACKOFFICE-API-URL-FIX.md](BACKOFFICE-API-URL-FIX.md)
- **Implementation**: [BACKOFFICE-API-URL-COMPLETE.md](BACKOFFICE-API-URL-COMPLETE.md)
- **Architecture**: [apps/backoffice/API-URL-DIAGRAM.md](apps/backoffice/API-URL-DIAGRAM.md)
- **Quick Reference**: [API-URL-SUMMARY.md](API-URL-SUMMARY.md)

## Code Changes Summary

### New Features (Credentials Update)

1. **credentials.vue** (NEW - 458 lines) ⭐
   - Complete credentials update form
   - Validation, loading states, error handling
   - Location: `/apps/backoffice/app/pages/settings/credentials.vue`

2. **useNavigation.ts** (Modified) ⭐
   - Added "Settings" menu item
   - Settings icon integration
   - Location: `/apps/backoffice/app/composables/useNavigation.ts`

3. **Test Scripts** (NEW) ⭐
   - `test-credentials-update.sh` - API testing
   - Documentation files (3 files)

### Infrastructure Files

4. **useAuth.ts** (47 lines modified)
   - Updated `getApiUrl()` function
   - Added debug logging
   - Location: `/apps/backoffice/app/composables/useAuth.ts`

5. **useProducts.ts** (80 lines modified)
   - Updated `getApiUrl()` function
   - Added debug logging to all API methods
   - Location: `/apps/backoffice/app/composables/useProducts.ts`

6. **.env** (6 lines added)
   - Added `NUXT_PUBLIC_API_URL` variable
   - Location: `/.env`

### Key Functions Modified

```typescript
// Core logic in both useAuth.ts and useProducts.ts
const getApiUrl = (): string => {
  if (import.meta.client) {
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    return 'http://localhost:4000/api'
  }
  return config.public.apiUrl || 'http://backend:4000/api'
}
```

## Testing

### Credentials Update Feature ⭐

**Automated Test**:
```bash
./test-credentials-update.sh
```

**Manual Test**:
```bash
make dev-up-d
# Open http://localhost:3001
# Login with admin/k4sla1!
# Click "Settings" in sidebar
# Update username or password
```

### Backoffice API URL

**Automated Test**:
```bash
./test-backoffice-api-url.sh
```

**Manual Test**:
```bash
make dev-up-d
# Open http://localhost:3001
# Login with admin/k4sla1!
# Check browser console
```

**Expected Output**:
```
[useAuth] Logging in to: http://localhost:4000/api/auth/login
[useAuth] Context: { client: true, env: 'development', url: 'http://localhost:4000/api' }
✓ Login successful
```

## URL Resolution Matrix

| Context | Environment | URL Used | Source |
|---------|-------------|----------|--------|
| Browser | Dev | `http://localhost:4000/api` | Hardcoded |
| Browser | Prod | `https://api.lebowvsky.com` | `NUXT_PUBLIC_API_URL` |
| SSR | Dev | `http://backend:4000/api` | `NUXT_PUBLIC_API_URL` |
| SSR | Prod | `https://api.lebowvsky.com` | `NUXT_PUBLIC_API_URL` |

## Design Patterns Applied

### Credentials Update Feature ⭐
- **Chain of Responsibility Pattern**: Validation pipeline
- **Command Pattern**: Form submission encapsulation
- **Adapter Pattern**: API response transformation
- **Facade Pattern**: `useAuth()` simplified interface
- **Singleton Pattern**: Global navigation state

### API URL Infrastructure
- **Adapter Pattern**: `getApiUrl()` adapts URL based on context
- **Strategy Pattern**: Different URL strategies for different contexts
- **Decorator Pattern**: Debug logs decorate API calls

## Common Issues

### CORS Error
**Fix**: Corrected by this implementation (browser now uses localhost)

### Wrong URL in Console
**Fix**: Clear cache and rebuild: `make dev-rebuild`

### Backend Unreachable
**Fix**: Restart environment: `make dev-down && make dev-up-d`

## Environment Variables

### Development (.env)
```bash
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

### Production (.env.prod)
```bash
NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
```

## Related Documentation

- [CLAUDE.md](CLAUDE.md) - Project overview
- [CORS-FIX-SUMMARY.md](CORS-FIX-SUMMARY.md) - CORS configuration
- [DEPLOYMENT-CORS-FIX.md](DEPLOYMENT-CORS-FIX.md) - Deployment guide

## Support

For issues or questions:
1. Check troubleshooting sections in detailed docs
2. Run test script: `./test-backoffice-api-url.sh`
3. Review logs: `make dev-logs-backoffice`

## Recent Updates

### 2026-02-06 - Credentials Update Feature ⭐
- ✅ Created credentials update page (`/settings/credentials`)
- ✅ Added "Settings" navigation menu item
- ✅ Implemented secure password change with validation
- ✅ Username update with uniqueness check
- ✅ Full test coverage with automated script
- ✅ Comprehensive documentation (3 files)
- ✅ Production ready

### 2026-02-06 - Backoffice API URL Fix
- ✅ Fixed API URL resolution for development
- ✅ Browser now uses `localhost:4000` instead of `backend:4000`
- ✅ SSR uses correct Docker network URL
- ✅ Test scripts and documentation

---

**Last Updated**: 2026-02-06
**Status**: ✅ All features implemented and tested
**Version**: 2.0 (Added Credentials Update Feature)
