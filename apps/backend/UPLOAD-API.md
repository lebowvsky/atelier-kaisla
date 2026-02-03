# Product Upload API Documentation

## Overview

The Product Upload API allows you to create products with image uploads using multipart/form-data.

## Endpoint

```
POST /api/products/with-upload
```

## Authentication

Currently no authentication required (add JWT authentication in production).

## Request Format

- **Content-Type**: `multipart/form-data`
- **Method**: POST

## Form Fields

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Product name (max 255 chars) | "Handwoven Wall Hanging" |
| `category` | enum | Product category | "wall-hanging" or "rug" |
| `price` | number | Product price in euros | 149.99 |
| `images` | file[] | Product images (1-5 files) | Image files |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Product description (max 500 chars) | "Beautiful handwoven..." |
| `status` | enum | Product status | "available", "sold", or "draft" (default: "draft") |
| `stockQuantity` | number | Stock quantity | 1 (default: 0) |
| `dimensions` | string | JSON string of dimensions | '{"width": 50, "height": 70, "unit": "cm"}' |
| `materials` | string | Materials used | "Cotton, wool, natural dyes" |

## File Upload Requirements

### Image Constraints

- **Minimum**: 1 image required
- **Maximum**: 5 images per product
- **File Size**: Max 5MB per image
- **Allowed Formats**: JPEG, PNG, WebP
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### Security Features

1. File type validation (MIME type + extension matching)
2. File size validation (5MB limit)
3. Unique filename generation (UUID-based)
4. Safe file storage in dedicated uploads directory
5. Automatic cleanup on failed product creation

## Example Requests

### Using cURL

```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Handwoven Wall Hanging" \
  -F "description=Beautiful handwoven wall hanging made with natural fibers" \
  -F "category=wall-hanging" \
  -F "price=149.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F "dimensions={\"width\": 50, \"height\": 70, \"unit\": \"cm\"}" \
  -F "materials=Cotton, wool, natural dyes" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Using JavaScript (Fetch API)

```javascript
const formData = new FormData();

// Add text fields
formData.append('name', 'Handwoven Wall Hanging');
formData.append('description', 'Beautiful handwoven wall hanging');
formData.append('category', 'wall-hanging');
formData.append('price', '149.99');
formData.append('status', 'available');
formData.append('stockQuantity', '1');
formData.append('dimensions', JSON.stringify({
  width: 50,
  height: 70,
  unit: 'cm'
}));
formData.append('materials', 'Cotton, wool, natural dyes');

// Add image files
const imageInput = document.querySelector('input[type="file"]');
for (const file of imageInput.files) {
  formData.append('images', file);
}

// Send request
const response = await fetch('http://localhost:4000/api/products/with-upload', {
  method: 'POST',
  body: formData,
});

const product = await response.json();
console.log('Created product:', product);
```

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('name', 'Handwoven Wall Hanging');
formData.append('category', 'wall-hanging');
formData.append('price', 149.99);
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await axios.post(
  'http://localhost:4000/api/products/with-upload',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);

console.log('Created product:', response.data);
```

### Using Postman

1. Select **POST** method
2. Enter URL: `http://localhost:4000/api/products/with-upload`
3. Go to **Body** tab
4. Select **form-data**
5. Add fields:
   - `name` (text): "Handwoven Wall Hanging"
   - `category` (text): "wall-hanging"
   - `price` (text): "149.99"
   - `images` (file): Select image files (can add multiple)
   - Add other optional fields as needed
6. Click **Send**

## Response Format

### Success Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Handwoven Wall Hanging",
  "description": "Beautiful handwoven wall hanging made with natural fibers",
  "category": "wall-hanging",
  "price": 149.99,
  "status": "available",
  "stockQuantity": 1,
  "images": [
    "http://localhost:4000/uploads/products/550e8400-e29b-41d4-a716-446655440001.jpg",
    "http://localhost:4000/uploads/products/550e8400-e29b-41d4-a716-446655440002.jpg"
  ],
  "dimensions": {
    "width": 50,
    "height": 70,
    "unit": "cm"
  },
  "materials": "Cotton, wool, natural dyes",
  "createdAt": "2024-02-03T10:00:00.000Z",
  "updatedAt": "2024-02-03T10:00:00.000Z"
}
```

### Error Responses

#### 400 Bad Request - Missing Images

```json
{
  "statusCode": 400,
  "message": "At least one image is required",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Invalid File Type

```json
{
  "statusCode": 400,
  "message": "File image.pdf has invalid type. Only JPEG, PNG, and WebP are allowed",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "category must be one of the following values: wall-hanging, rug",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

#### 413 Payload Too Large

```json
{
  "statusCode": 413,
  "message": "File size exceeds 5MB limit",
  "error": "File Too Large"
}
```

## Image URLs

Uploaded images are accessible via:

```
http://localhost:4000/uploads/products/{filename}
```

Example:
```
http://localhost:4000/uploads/products/550e8400-e29b-41d4-a716-446655440001.jpg
```

## Alternative Endpoint (JSON without Upload)

For creating products without image upload (e.g., with pre-existing image URLs):

```
POST /api/products
Content-Type: application/json

{
  "name": "Handwoven Wall Hanging",
  "category": "wall-hanging",
  "price": 149.99,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

## Storage Location

- **Development**: `apps/backend/uploads/products/`
- **Production**: Configure cloud storage (S3, Google Cloud Storage, etc.)

## Best Practices

1. **Client-side validation**: Validate file types and sizes before upload
2. **Progress indicators**: Show upload progress for better UX
3. **Error handling**: Display user-friendly error messages
4. **Image optimization**: Compress images before upload when possible
5. **Multiple uploads**: Use array input for multiple file selection

## Testing with Swagger

Access the Swagger UI at `http://localhost:4000/api/docs` to test the endpoint interactively.

## Production Considerations

### Security

- [ ] Add authentication (JWT)
- [ ] Add authorization (role-based)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize filenames
- [ ] Implement virus scanning

### Performance

- [ ] Add image compression/optimization
- [ ] Generate thumbnails automatically
- [ ] Use CDN for image delivery
- [ ] Implement caching strategies
- [ ] Use cloud storage (S3, Cloudinary, etc.)

### Monitoring

- [ ] Log all uploads
- [ ] Monitor storage usage
- [ ] Track failed uploads
- [ ] Alert on suspicious activity

## Future Enhancements

1. Image compression and optimization
2. Multiple image sizes (thumbnail, medium, large)
3. Image cropping/editing capabilities
4. Cloud storage integration (AWS S3, Cloudinary)
5. Image CDN integration
6. Batch upload support
7. Image metadata extraction (EXIF data)
