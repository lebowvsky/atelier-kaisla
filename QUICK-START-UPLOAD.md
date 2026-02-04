# Quick Start: Product Upload API

## TL;DR

The `POST /api/products/with-upload` endpoint is now fully functional. Both issues are fixed:
- ✅ Dimensions validation works
- ✅ Images upload and display correctly

## Quick Test

```bash
# Run automated test
./test-product-upload.sh

# Manual test with dimensions
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Beautiful Wall Hanging" \
  -F "description=Handwoven with love" \
  -F "category=wall-hanging" \
  -F "price=149.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F 'dimensions={"width": 80, "height": 120, "unit": "cm"}' \
  -F "materials=Cotton, wool, natural dyes" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## API Reference

### Endpoint
`POST /api/products/with-upload`

### Content-Type
`multipart/form-data`

### Required Fields
- `name` (string, max 255 chars)
- `category` ("wall-hanging" | "rug")
- `price` (number, positive)
- `images` (file[], 1-5 images, JPEG/PNG/WebP, max 5MB each)

### Optional Fields
- `description` (string, max 500 chars)
- `status` ("available" | "sold" | "draft", default: "draft")
- `stockQuantity` (number, min 0, default: 0)
- `dimensions` (JSON string): `'{"width": 120, "height": 180, "unit": "cm"}'`
- `materials` (string)

### Response Example

```json
{
  "id": "uuid",
  "name": "Beautiful Wall Hanging",
  "description": "Handwoven with love",
  "category": "wall-hanging",
  "price": "149.99",
  "status": "available",
  "stockQuantity": 1,
  "dimensions": {
    "width": 80,
    "height": 120,
    "unit": "cm"
  },
  "materials": "Cotton, wool, natural dyes",
  "images": [
    "http://localhost:4000/uploads/products/uuid-1.jpg",
    "http://localhost:4000/uploads/products/uuid-2.jpg"
  ],
  "createdAt": "2026-02-04T19:30:00.000Z",
  "updatedAt": "2026-02-04T19:30:00.000Z"
}
```

## JavaScript/TypeScript Example

```typescript
// Using fetch
const formData = new FormData();
formData.append('name', 'Beautiful Wall Hanging');
formData.append('description', 'Handwoven with love');
formData.append('category', 'wall-hanging');
formData.append('price', '149.99');
formData.append('status', 'available');
formData.append('stockQuantity', '1');
formData.append('dimensions', JSON.stringify({
  width: 80,
  height: 120,
  unit: 'cm'
}));
formData.append('materials', 'Cotton, wool, natural dyes');

// Add images
const image1 = document.getElementById('image1').files[0];
const image2 = document.getElementById('image2').files[0];
formData.append('images', image1);
formData.append('images', image2);

const response = await fetch('http://localhost:4000/api/products/with-upload', {
  method: 'POST',
  body: formData,
});

const product = await response.json();
console.log('Product created:', product);
```

## React/Vue Example

```typescript
// React/Vue file upload component
async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  // Add dimensions as JSON string
  const dimensions = {
    width: parseFloat(formData.get('width')),
    height: parseFloat(formData.get('height')),
    unit: formData.get('unit')
  };
  formData.set('dimensions', JSON.stringify(dimensions));
  formData.delete('width');
  formData.delete('height');
  formData.delete('unit');

  try {
    const response = await fetch('/api/products/with-upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error.message);
      return;
    }

    const product = await response.json();
    console.log('Success!', product);
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Common Issues

### Issue: "At least one image is required"
**Solution**: Ensure you're uploading at least one image with the field name `images`

### Issue: "Invalid file type"
**Solution**: Only JPEG, JPG, PNG, and WebP images are supported

### Issue: File size error
**Solution**: Each image must be under 5MB

### Issue: Dimensions validation error
**Solution**: Ensure dimensions is a valid JSON string:
```javascript
// ✅ Correct
dimensions: '{"width": 120, "height": 180, "unit": "cm"}'

// ❌ Wrong (missing quotes around JSON)
dimensions: {width: 120, height: 180, unit: "cm"}

// ❌ Wrong (not a string)
dimensions: {"width": 120, "height": 180, "unit": "cm"}
```

### Issue: Images return 404
**Possible causes**:
1. Backend not running
2. Static file serving not configured (check main.ts)
3. Upload directory doesn't exist (check backend logs)

**Solution**: Check backend logs: `docker compose -f docker-compose.dev.yml logs backend`

## Debugging

### View Backend Logs
```bash
# All logs
make dev-logs-backend

# Follow logs in real-time
docker compose -f docker-compose.dev.yml logs -f backend

# Filter for errors
docker compose -f docker-compose.dev.yml logs backend | grep ERROR
```

### Check Upload Directory
```bash
# Inside Docker container
docker exec -it atelier-kaisla-backend-dev ls -lah /app/uploads/products

# Local (if running without Docker)
ls -lah apps/backend/uploads/products
```

### Test Image Accessibility
```bash
# Replace {filename} with actual filename from response
curl -I http://localhost:4000/uploads/products/{filename}.jpg

# Should return: HTTP/1.1 200 OK
```

## API Documentation

Interactive API documentation (Swagger):
- URL: http://localhost:4000/api/docs
- Try the endpoint directly in the browser
- See request/response schemas
- Test file uploads

## Files Changed

The following files were modified to fix the issues:

1. `/apps/backend/src/modules/products/dto/create-product-with-upload.dto.ts` - Dimensions validation fix
2. `/apps/backend/src/modules/products/products.module.ts` - Multer configuration
3. `/apps/backend/src/modules/products/products.controller.ts` - Added logging
4. `/apps/backend/src/modules/products/products.service.ts` - Added logging
5. `/apps/backend/src/modules/upload/upload.service.ts` - Added logging

## Related Documentation

- **Detailed fix explanation**: `/FIXES-SUMMARY.md`
- **Technical documentation**: `/PRODUCT-UPLOAD-FIX.md`
- **Test script**: `/test-product-upload.sh`

## Need Help?

1. Run the test script: `./test-product-upload.sh`
2. Check backend logs: `make dev-logs-backend`
3. View API docs: http://localhost:4000/api/docs
4. Read detailed docs: `/FIXES-SUMMARY.md`
