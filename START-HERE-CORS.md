# START HERE - CORS Fix Guide

## Quick Overview

The backoffice (`https://bokaisla.lebowvsky.com`) can now communicate with the API (`https://api.lebowvsky.com`). The CORS configuration has been enhanced to handle all cross-origin requests properly.

## Status

- **Development**: ✅ Tested & Working
- **Production**: ⏳ Ready for deployment (15 minutes)
- **Testing**: ✅ Local tests passing (5/5)

## Deploy Now (3 Options)

### Option 1: Automated Deployment (Recommended)
```bash
./DEPLOY-CORS-NOW.sh
```
This interactive script will:
- Stop containers
- Rebuild backend
- Start containers
- Verify configuration
- Run tests
- Show next steps

### Option 2: Manual Deployment
```bash
make prod-down
docker compose -f docker-compose.prod.yml build backend --no-cache
make prod-up
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com
```

### Option 3: Step-by-Step Guide
Read `/DEPLOYMENT-CORS-FIX.md` for detailed instructions.

## What Changed

### Code Changes
Only one file modified:
- `/apps/backend/src/main.ts` - Enhanced CORS configuration

### Key Improvements
1. Explicit HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
2. Comprehensive headers (Content-Type, Authorization, etc.)
3. Preflight optimization (24h cache)
4. CORS logging (debug and monitoring)
5. Standard compliance (proper status codes)

## Quick Verification

After deployment, verify with:

```bash
# 1. Check environment variables
docker exec atelier-kaisla-backend-prod env | grep URL

# 2. Check logs
docker compose -f docker-compose.prod.yml logs backend | grep "CORS enabled"

# 3. Test with script
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com

# 4. Test with cURL
curl -X OPTIONS \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -H "Access-Control-Request-Method: POST" \
  -i https://api.lebowvsky.com/api/products | grep "Access-Control"
```

## Documentation Structure

```
START-HERE-CORS.md (you are here)
    │
    ├── Quick Deploy
    │   └── DEPLOY-CORS-NOW.sh (automated deployment)
    │   └── DEPLOYMENT-CORS-FIX.md (manual steps)
    │
    ├── Understanding
    │   └── CORS-FIX-README.md (overview)
    │   └── CORS-FIX-SUMMARY.md (technical details)
    │
    ├── Testing
    │   └── test-cors.sh (automated tests)
    │
    ├── Troubleshooting
    │   └── CORS-TROUBLESHOOTING.md (debugging guide)
    │
    └── Reference
        └── CHANGELOG-CORS.md (complete changelog)
        └── CORS-FILES-SUMMARY.txt (files overview)
```

## Testing After Deployment

### 1. Browser Test (Main Verification)
1. Open `https://bokaisla.lebowvsky.com`
2. Press F12 (DevTools)
3. Go to Console tab
4. Make API requests from backoffice
5. Verify: NO CORS errors should appear

### 2. Network Tab Check
1. Open DevTools > Network tab
2. Make an API request
3. Click on the request
4. Check Headers tab
5. Response headers should include:
   ```
   Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
   Access-Control-Allow-Credentials: true
   ```

### 3. Automated Test
```bash
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com
```
Expected: All tests pass (4/4, plus 1 expected failure for unauthorized origin)

## Common Issues

| Issue | Quick Fix |
|-------|-----------|
| CORS errors persist | Check Traefik (remove CORS middleware) |
| Environment vars wrong | Update docker-compose.prod.yml, restart |
| Logs show blocked origin | Verify FRONTEND_URL and BACKOFFICE_URL |
| Tests fail | Check backend is running, check URLs |

## Time Estimates

| Task | Duration |
|------|----------|
| Deploy (automated) | 5-8 minutes |
| Deploy (manual) | 10-12 minutes |
| Testing | 2-3 minutes |
| Browser verification | 1-2 minutes |
| **Total** | **10-15 minutes** |

## Need Help?

1. **Quick issues**: Check `/DEPLOYMENT-CORS-FIX.md`
2. **CORS errors**: Read `/CORS-TROUBLESHOOTING.md`
3. **Technical details**: See `/CORS-FIX-SUMMARY.md`
4. **Logs not showing CORS**: Backend may be restarting, wait 30s

## What to Expect

### Before Fix
```
Browser Console:
❌ Access to XMLHttpRequest at 'https://api.lebowvsky.com/api/products'
   from origin 'https://bokaisla.lebowvsky.com' has been blocked by CORS policy
```

### After Fix
```
Browser Console:
✅ No CORS errors

Backend Logs:
✅ 🌐 CORS enabled for origins: https://kaisla.lebowvsky.com, https://bokaisla.lebowvsky.com

Network Tab:
✅ Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
✅ Access-Control-Allow-Credentials: true
```

## Important Notes

1. **Traefik Users**: If using Traefik reverse proxy, remove any CORS middleware from labels. NestJS handles CORS completely.

2. **Environment Variables**: Ensure these are set in production:
   ```yaml
   FRONTEND_URL: https://kaisla.lebowvsky.com
   BACKOFFICE_URL: https://bokaisla.lebowvsky.com
   ```

3. **Browser Cache**: Clear browser cache if CORS errors persist after deployment (Ctrl+Shift+Delete).

4. **HTTPS Only**: This configuration is for HTTPS in production. Local development uses HTTP.

## Success Criteria

Deployment is successful when:
- ✅ Backend logs show CORS origins at startup
- ✅ Test script passes all tests (4/4)
- ✅ Browser shows no CORS errors
- ✅ API requests work from backoffice
- ✅ Environment variables are correct

## Next Actions

1. **Deploy Now**: Run `./DEPLOY-CORS-NOW.sh`
2. **Test**: Open backoffice in browser
3. **Verify**: Check console for no errors
4. **Monitor**: Watch backend logs for 5 minutes
5. **Done**: CORS issue resolved

## Files You Need

Essential:
- `/DEPLOY-CORS-NOW.sh` - One-command deployment
- `/test-cors.sh` - Testing script

Reference:
- `/CORS-FIX-README.md` - Overview
- `/CORS-TROUBLESHOOTING.md` - If issues occur
- `/DEPLOYMENT-CORS-FIX.md` - Manual deployment

Optional:
- `/CORS-FIX-SUMMARY.md` - Technical deep-dive
- `/CHANGELOG-CORS.md` - Complete changelog
- `/CORS-FILES-SUMMARY.txt` - All files overview

## Quick Commands Reference

```bash
# Deploy (automated)
./DEPLOY-CORS-NOW.sh

# Deploy (manual)
make prod-down && \
docker compose -f docker-compose.prod.yml build backend --no-cache && \
make prod-up

# Test
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend | grep CORS

# Check environment
docker exec atelier-kaisla-backend-prod env | grep URL

# Restart if needed
docker compose -f docker-compose.prod.yml restart backend
```

---

**Ready to deploy?** Run `./DEPLOY-CORS-NOW.sh` now!

**Questions?** Check `/CORS-TROUBLESHOOTING.md`

**Last Updated**: 2026-02-04
