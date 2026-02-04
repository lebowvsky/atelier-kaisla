# Quick Deployment Guide - CORS Fix

## What Was Fixed
The backoffice (`https://bokaisla.lebowvsky.com`) could not communicate with the API (`https://api.lebowvsky.com`) due to inadequate CORS configuration. This is now fixed.

## Deployment Steps

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Stop Production Containers
```bash
make prod-down
# or
docker compose -f docker-compose.prod.yml down
```

### 3. Rebuild Backend (No Cache)
```bash
docker compose -f docker-compose.prod.yml build backend --no-cache
```

### 4. Start Production Environment
```bash
make prod-up
# or
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verify Environment Variables
```bash
docker exec atelier-kaisla-backend-prod env | grep URL
```

**Expected output:**
```
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
```

If these are missing or incorrect, update `docker-compose.prod.yml` and restart.

### 6. Check Backend Logs
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

**Look for:**
```
🌐 CORS enabled for origins: https://kaisla.lebowvsky.com, https://bokaisla.lebowvsky.com
```

### 7. Test CORS
```bash
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com
```

All tests should pass except the last one (unauthorized origin test).

## Quick Verification

### Browser Test
1. Open `https://bokaisla.lebowvsky.com`
2. Open DevTools (F12) > Console tab
3. Try making API requests
4. **No CORS errors should appear**

### cURL Test
```bash
curl -X OPTIONS \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -H "Access-Control-Request-Method: POST" \
  -i https://api.lebowvsky.com/api/products | grep "Access-Control"
```

**Expected output:**
```
Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,Accept,Origin,X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers
Access-Control-Allow-Credentials: true
```

## Troubleshooting

### Still Getting CORS Errors?

1. **Check Traefik configuration**: Remove any CORS middleware in Traefik labels (conflicts with NestJS CORS)
2. **Verify environment variables**: Ensure `FRONTEND_URL` and `BACKOFFICE_URL` are set correctly
3. **Check origin**: Verify browser is sending correct origin header
4. **View backend logs**: Look for CORS block warnings

### Detailed Troubleshooting
See `/CORS-TROUBLESHOOTING.md` for comprehensive debugging steps.

## What Changed

### Modified Files
- `/apps/backend/src/main.ts` - Enhanced CORS configuration

### New Files
- `/CORS-FIX-SUMMARY.md` - Detailed fix explanation
- `/CORS-TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- `/DEPLOYMENT-CORS-FIX.md` - This file
- `/test-cors.sh` - Automated testing script

## Rollback (If Needed)

```bash
git revert HEAD
docker compose -f docker-compose.prod.yml build backend --no-cache
make prod-up
```

## Support

- Run test script: `./test-cors.sh`
- Check logs: `make prod-logs-backend`
- Read troubleshooting: `/CORS-TROUBLESHOOTING.md`
- View fix summary: `/CORS-FIX-SUMMARY.md`

## Time Estimate
- Deployment: 5-10 minutes
- Testing: 2-3 minutes
- **Total: ~15 minutes**

---

**Last Updated:** 2026-02-04
