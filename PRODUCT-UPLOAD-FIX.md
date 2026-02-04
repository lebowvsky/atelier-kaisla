# Product Upload Endpoint Fix Documentation

This document describes the fixes applied to the `POST /api/products/with-upload` endpoint to resolve two critical issues.

## Issues Fixed

### Issue 1: Dimensions Validation Failure

**Problem**: When sending dimensions via FormData, the API returned validation errors:
```
Error creating product
[
  "dimensions.property width should not exist",
  "dimensions.property height should not exist",
  "dimensions.property unit should not exist"
]
```

**Root Cause**:
- The `CreateProductWithUploadDto` was using `@Transform` decorator after `@Type` and `@ValidateNested`
- The transformation logic didn't properly handle empty strings or undefined values
- Decorator order matters in class-transformer/class-validator

**Solution Applied**:
1. **Reordered decorators** in `/apps/backend/src/modules/products/dto/create-product-with-upload.dto.ts`:
   - `@IsOptional()` first (to allow undefined)
   - `@Transform()` second (to transform the value)
   - `@ValidateNested()` and `@Type()` last (to validate the transformed object)

2. **Improved transformation logic**:
   - Handle `undefined`, `null`, and empty strings by returning `undefined`
   - Parse JSON strings safely with try-catch
   - Return objects as-is if already parsed
   - Return `undefined` on parse errors (will be caught by validation if required)

3. **Made dimensions truly optional**:
   - If no dimensions are provided, validation is skipped
   - If dimensions are provided, they are validated properly

**Code Changes**:
```typescript
// Before (WRONG ORDER)
@ValidateNested()
@Type(() => DimensionsDto)
@IsOptional()
@Transform(({ value }) => { /* ... */ })
dimensions?: DimensionsDto;

// After (CORRECT ORDER)
@IsOptional()
@Transform(({ value }) => {
  // Handle undefined/null/empty
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  // Parse JSON string
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return undefined;
    }
  }

  // Return object as-is
  return value;
})
@ValidateNested()
@Type(() => DimensionsDto)
dimensions?: DimensionsDto;
```

### Issue 2: Uploaded Images Not Accessible

**Problem**:
- Products were created successfully
- Image URLs were generated
- But images didn't display in frontend/backoffice

**Investigation Required**:
The static file serving is already configured in `main.ts`:
```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

**Solution Applied**:
Added comprehensive logging throughout the upload pipeline to debug the issue:

1. **Controller logging** (`products.controller.ts`):
   - Log when request is received
   - Log body and files
   - Log base URL
   - Log successful creation

2. **Service logging** (`products.service.ts`):
   - Log DTO received
   - Log files being processed
   - Log generated URLs
   - Log product data before saving
   - Log saved product with images
   - Log detailed error information with stack traces

3. **Upload service logging** (`upload.service.ts`):
   - Log upload directory checks
   - Log directory creation
   - Log file URL generation

4. **Multer configuration logging** (`upload.module.ts`):
   - Log when files are accepted/rejected
   - Log filename generation
   - Log file details (mimetype, size)

## How to Test

### 1. Using the Test Script

Run the automated test script:
```bash
./test-product-upload.sh
```

This will:
- Create a product WITHOUT dimensions
- Create a product WITH dimensions
- Verify both products were created successfully
- Check if images are accessible via HTTP
- Display image URLs for manual verification

### 2. Manual Testing with cURL

**Test without dimensions**:
```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Test Wall Hanging" \
  -F "description=Beautiful handwoven piece" \
  -F "category=wall-hanging" \
  -F "price=99.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F "materials=Cotton, wool" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Test with dimensions**:
```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Test Rug" \
  -F "description=Handwoven rug" \
  -F "category=rug" \
  -F "price=149.99" \
  -F "status=draft" \
  -F "stockQuantity=3" \
  -F "materials=Wool, natural dyes" \
  -F 'dimensions={"width": 120, "height": 180, "unit": "cm"}' \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Alternative dimension format** (if FormData sends nested objects):
```bash
-F "dimensions[width]=120" \
-F "dimensions[height]=180" \
-F "dimensions[unit]=cm"
```

### 3. Using Swagger UI

1. Open http://localhost:4000/api/docs
2. Navigate to `POST /api/products/with-upload`
3. Click "Try it out"
4. Fill in the form fields
5. Upload images
6. Execute the request
7. Check the response for image URLs

### 4. Verify Image Access

After creating a product, check if images are accessible:
```bash
# Get product details
curl http://localhost:4000/api/products/{product-id}

# Test image URL (copy from response)
curl -I http://localhost:4000/uploads/products/{filename}.jpg
```

Should return `HTTP/1.1 200 OK` if the image is accessible.

## Debugging

### View Backend Logs

To see detailed debug logs:
```bash
# Docker
docker compose -f docker-compose.dev.yml logs -f backend

# Or using Make
make dev-logs-backend
```

### Check Upload Directory

Verify files are being saved:
```bash
# Docker
docker exec -it atelier-kaisla-backend-dev ls -lah /app/uploads/products

# Local
ls -lah apps/backend/uploads/products
```

### Common Issues and Solutions

#### Issue: "At least one image is required"
**Cause**: No files were uploaded
**Solution**: Ensure you're using `images` as the field name and sending at least one file

#### Issue: "Invalid file type"
**Cause**: File is not JPEG, PNG, or WebP
**Solution**: Convert image to a supported format

#### Issue: Validation error on dimensions
**Cause**: Dimensions JSON is malformed
**Solution**: Ensure JSON string is valid: `'{"width": 50, "height": 70, "unit": "cm"}'`

#### Issue: Images return 404
**Possible causes**:
1. Upload directory doesn't exist
   - Check backend logs for "Created upload directory" message
   - Manually create: `mkdir -p apps/backend/uploads/products`

2. Files aren't being saved
   - Check multer logs for filename generation
   - Verify disk space
   - Check permissions on upload directory

3. Static file serving not configured
   - Verify `main.ts` has `app.useStaticAssets()` call
   - Check the path mapping (should be `/uploads/` prefix)

4. Wrong URL format
   - URLs should be: `http://localhost:4000/uploads/products/{filename}`
   - Verify baseUrl is correct in logs

## File Upload Flow

1. **Client sends multipart/form-data request**
   - Form fields: name, description, category, price, etc.
   - Files: uploaded as `images[]` field (max 5 files)

2. **Multer intercepts the request**
   - Validates file types (JPEG, PNG, WebP only)
   - Validates file size (max 5MB per file)
   - Generates unique filename with UUID
   - Saves file to `./uploads/products/`
   - Logs file acceptance/rejection

3. **Controller receives request**
   - Validates at least one image is uploaded
   - Extracts base URL from request
   - Logs request details

4. **DTO transformation and validation**
   - Numbers are parsed from strings (price, stockQuantity)
   - Dimensions JSON is parsed if provided
   - Validators check all constraints

5. **Service creates product**
   - Ensures upload directory exists
   - Generates full URLs for each uploaded file
   - Creates product entity with image URLs
   - Saves to database
   - Logs success or cleans up files on error

6. **Static file serving**
   - NestJS serves files from `./uploads/products/`
   - URL pattern: `http://localhost:4000/uploads/products/{filename}`

## Expected Behavior

### Successful Response Example

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Test Wall Hanging",
  "description": "Beautiful handwoven piece",
  "category": "wall-hanging",
  "price": "99.99",
  "status": "available",
  "stockQuantity": 1,
  "materials": "Cotton, wool",
  "dimensions": {
    "width": 120,
    "height": 180,
    "unit": "cm"
  },
  "images": [
    "http://localhost:4000/uploads/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "http://localhost:4000/uploads/products/f9e8d7c6-b5a4-3210-fedc-ba0987654321.jpg"
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

## Next Steps

If images still don't display after these fixes:

1. **Check backend logs** for detailed error messages
2. **Verify upload directory permissions**:
   ```bash
   chmod 755 apps/backend/uploads/products
   ```
3. **Test image URL directly** in browser
4. **Check CORS configuration** if accessing from frontend
5. **Verify Docker volume mounts** if using Docker
6. **Check reverse proxy configuration** if behind nginx/traefik

## Files Modified

- `/apps/backend/src/modules/products/dto/create-product-with-upload.dto.ts` - Fixed dimensions transformation
- `/apps/backend/src/modules/products/products.controller.ts` - Added logging
- `/apps/backend/src/modules/products/products.service.ts` - Added detailed logging
- `/apps/backend/src/modules/upload/upload.service.ts` - Added logging
- `/apps/backend/src/modules/upload/upload.module.ts` - Added multer logging

## Testing Checklist

- [ ] Product creation without dimensions succeeds
- [ ] Product creation with dimensions succeeds
- [ ] Dimensions are saved correctly in database
- [ ] Image files are saved to `./uploads/products/`
- [ ] Image URLs are generated correctly
- [ ] Images are accessible via HTTP
- [ ] Images display in frontend
- [ ] Images display in backoffice
- [ ] Multiple images (up to 5) can be uploaded
- [ ] File type validation works (rejects non-images)
- [ ] File size validation works (rejects >5MB)
- [ ] Error handling works (cleanup on failure)
