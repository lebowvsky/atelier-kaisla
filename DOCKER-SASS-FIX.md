# Docker sass-embedded Fix Guide

## Problem Summary

The `sass-embedded` dependency was failing in the Docker container because:

1. **Missing native build tools**: `sass-embedded` uses a native Dart Sass binary that requires compilation tools (python3, make, g++) on Alpine Linux
2. **Volume mounting**: The anonymous volume mount for `/app/node_modules` was preserving the broken state even after code changes
3. **Alpine Linux limitations**: The base `node:20-alpine` image is minimal and doesn't include build tools by default

## Changes Made

### 1. Updated Dockerfile (`apps/frontend/Dockerfile`)

Added native build dependencies to both the **development** and **builder** stages:

```dockerfile
# Install native dependencies required for sass-embedded
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat
```

These tools are necessary for:
- **python3**: Required by node-gyp for building native modules
- **make**: Build automation tool
- **g++**: C++ compiler for native bindings
- **libc6-compat**: Compatibility library for some npm packages

## How to Fix Your Running Container

### Option 1: Clean Rebuild (Recommended)

This completely rebuilds the containers and removes old volumes:

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove the frontend container and its volumes
docker-compose -f docker-compose.dev.yml rm -f frontend

# Remove anonymous volumes (this clears the broken node_modules)
docker volume ls -q -f "dangling=true" | xargs docker volume rm 2>/dev/null || true

# Rebuild the frontend container with no cache
docker-compose -f docker-compose.dev.yml build --no-cache frontend

# Start the services
docker-compose -f docker-compose.dev.yml up -d
```

### Option 2: Quick Rebuild

If you're confident the issue is just the build dependencies:

```bash
# Stop and rebuild just the frontend
docker-compose -f docker-compose.dev.yml up -d --build --force-recreate frontend
```

### Option 3: Manual Container Fix (Temporary)

If you need a quick fix without rebuilding:

```bash
# Enter the running container
docker exec -it atelier-kaisla-frontend-dev sh

# Install build tools
apk add --no-cache python3 make g++ libc6-compat

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Exit and restart
exit
docker-compose -f docker-compose.dev.yml restart frontend
```

**Note**: Option 3 is temporary and will be lost when the container is recreated.

## Verification Steps

After rebuilding, verify the fix:

```bash
# Check container logs
docker-compose -f docker-compose.dev.yml logs -f frontend

# You should see Nuxt starting successfully without sass-embedded errors

# Test the application
curl http://localhost:3000

# Enter the container to verify sass-embedded
docker exec -it atelier-kaisla-frontend-dev sh
ls -la node_modules/sass-embedded
```

## Understanding the Volume Issue

In `docker-compose.dev.yml`, this configuration:

```yaml
volumes:
  - ./apps/frontend:/app
  - /app/node_modules  # Anonymous volume
  - /app/.nuxt
```

Creates an **anonymous volume** for `/app/node_modules` that persists between container restarts. This is good for performance (avoids re-syncing large directories), but bad when the node_modules are broken.

The clean rebuild process removes these anonymous volumes, ensuring a fresh start.

## Production Considerations

The production stage doesn't need sass-embedded because:
1. SCSS files are compiled during the build stage
2. Production only needs runtime dependencies (`npm ci --omit=dev`)
3. The compiled output (`.output` directory) contains pre-processed CSS

However, if you encounter issues in production builds, the builder stage now has the necessary tools.

## Alternative Solution: Use Full Node Image

If you continue to have issues with Alpine, consider using the full Node image:

```dockerfile
# Instead of node:20-alpine
FROM node:20 AS development

# Benefits:
# - Pre-installed build tools
# - Better compatibility with native modules
# - Slightly larger image size (trade-off)

# Downside:
# - Image size increases from ~180MB to ~1GB
```

This is generally not recommended unless absolutely necessary, as Alpine images are preferred for their small size and security benefits.

## Troubleshooting

### If sass-embedded still fails after rebuild:

1. **Check architecture compatibility**:
   ```bash
   docker exec -it atelier-kaisla-frontend-dev uname -m
   # Should show x86_64 or aarch64
   ```

2. **Verify npm install completed successfully**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs frontend | grep sass-embedded
   ```

3. **Check for platform-specific issues**:
   ```bash
   # Force platform (useful on Apple Silicon)
   docker-compose -f docker-compose.dev.yml build --platform linux/amd64 frontend
   ```

4. **Try sass instead of sass-embedded**:

   If issues persist, you can use the pure JavaScript Sass implementation (slower but more compatible):

   In `package.json`:
   ```json
   "devDependencies": {
     "sass": "^1.97.3"
     // Remove sass-embedded if needed
   }
   ```

## Best Practices Going Forward

1. **Always rebuild after Dockerfile changes**: `docker-compose build --no-cache`
2. **Clean volumes when changing dependencies**: `docker-compose down -v`
3. **Monitor container logs**: `docker-compose logs -f frontend`
4. **Keep package.json and package-lock.json in sync**: Commit both files
5. **Document native dependencies**: Add comments in Dockerfile for why each tool is needed

## Summary

The Dockerfile has been updated to include all necessary build tools for sass-embedded. Run the clean rebuild commands above to apply the fix. The application should now start successfully in Docker with full SCSS preprocessing support.
