# Backoffice Troubleshooting Guide

## Quick Health Check

Test if the backoffice is running correctly:

```bash
# Check container status
docker compose -f docker-compose.dev.yml ps | grep backoffice

# Test HTTP response
curl -I http://localhost:3001

# View logs
docker compose -f docker-compose.dev.yml logs --tail 50 backoffice
```

Expected: HTTP 200 response and container status "Up"

## Common Issues

### Issue 1: TypeScript Errors

**Symptom**: `Failed to load TypeScript` error in logs

**Solution**:
```bash
# Rebuild the container
docker compose -f docker-compose.dev.yml stop backoffice
docker compose -f docker-compose.dev.yml rm -f backoffice
docker compose -f docker-compose.dev.yml build --no-cache backoffice
docker compose -f docker-compose.dev.yml up -d backoffice
```

### Issue 2: Double Slash Bug (Nuxt 4.3.0)

**Symptom**: HTTP 500 error with message about `.nuxt//dist/server/server.mjs`

**Solution**: The `fix-double-slash.js` script should automatically fix this. Verify it's running:

```bash
docker compose -f docker-compose.dev.yml logs backoffice | grep fix-double-slash
```

You should see:
```
[fix-double-slash] ✓ Fixed double slash in .nuxt/dev/index.mjs
[fix-double-slash] 👀 Watching for changes...
```

If not, restart the container:
```bash
docker compose -f docker-compose.dev.yml restart backoffice
```

### Issue 3: Port Already in Use

**Symptom**: `Error: bind: address already in use`

**Solution**:
```bash
# Find the process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Restart the container
docker compose -f docker-compose.dev.yml up -d backoffice
```

### Issue 4: Hot Reload Not Working

**Symptom**: Changes to files not reflected in the browser

**Solution**:
```bash
# Restart the container
docker compose -f docker-compose.dev.yml restart backoffice

# If that doesn't work, remove .nuxt cache
rm -rf apps/backoffice/.nuxt
docker compose -f docker-compose.dev.yml restart backoffice
```

### Issue 5: Component Name Conflicts

**Symptom**: Warnings like `Two component files resolving to the same name UiButton`

**Status**: These are **warnings only** and don't prevent the application from running. They occur because:
- `index.ts` files export components
- Component `.vue` files with the same name exist

**Impact**: None - the application works correctly

**To suppress** (optional): You can configure Nuxt to ignore index files for component auto-import, but it's not necessary.

## Development Commands

```bash
# Start backoffice only
docker compose -f docker-compose.dev.yml up -d backoffice

# Stop backoffice
docker compose -f docker-compose.dev.yml stop backoffice

# View real-time logs
docker compose -f docker-compose.dev.yml logs -f backoffice

# Access backoffice shell
docker compose -f docker-compose.dev.yml exec backoffice sh

# Run commands inside container
docker compose -f docker-compose.dev.yml exec backoffice npm run dev:original
```

## Clean Rebuild (Nuclear Option)

If nothing else works:

```bash
# Stop and remove container
docker compose -f docker-compose.dev.yml stop backoffice
docker compose -f docker-compose.dev.yml rm -f backoffice

# Clean local files
cd apps/backoffice
rm -rf node_modules .nuxt .output package-lock.json

# Rebuild from scratch
cd ../..
docker compose -f docker-compose.dev.yml build --no-cache backoffice
docker compose -f docker-compose.dev.yml up -d backoffice

# Wait 30 seconds and test
sleep 30
curl -I http://localhost:3001
```

## Debugging Tips

### Enable Verbose Logging

Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  debug: true,
  logLevel: 'verbose'
})
```

### Check File Permissions

```bash
docker compose -f docker-compose.dev.yml exec backoffice ls -la /app
docker compose -f docker-compose.dev.yml exec backoffice ls -la /app/.nuxt
```

### Verify Environment Variables

```bash
docker compose -f docker-compose.dev.yml exec backoffice env | grep -E "(NODE|NUXT)"
```

## Performance Issues

If the backoffice is slow:

1. **Check Docker resources**: Ensure Docker has sufficient CPU and memory
2. **Reduce hot reload scope**: Add exclusions in `nuxt.config.ts`
3. **Disable source maps temporarily**: Set `sourcemap: false` in vite config

## Getting Help

1. Check the logs: `docker compose -f docker-compose.dev.yml logs backoffice`
2. Review `BUGFIX-NUXT-DOUBLE-SLASH.md` for known issues
3. Verify all dependencies are installed: `npm list` inside container
4. Check Docker container health: `docker compose ps`

## Useful Links

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- Project Architecture: `ARCHITECTURE.md` (if exists)

---

Last Updated: February 3, 2026
