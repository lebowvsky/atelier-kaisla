# API Examples

This document provides practical examples of using the Atelier Kaisla API with curl commands and expected responses.

## Base URL

```
Development: http://localhost:4000
```

## Interactive Documentation

Swagger UI is available at: http://localhost:4000/api/docs

## Products API

### 1. Create a Product

**Request:**
```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Handwoven Wall Hanging",
    "description": "Beautiful handcrafted wall hanging with natural fibers",
    "category": "wall-hanging",
    "price": 149.99,
    "status": "available",
    "stockQuantity": 1,
    "materials": "Cotton, wool, natural dyes",
    "dimensions": {
      "width": 60,
      "height": 90,
      "unit": "cm"
    },
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }'
```

**Response (201 Created):**
```json
{
  "id": "5fec71af-3c7f-40ad-9425-c81a9316acd5",
  "name": "Handwoven Wall Hanging",
  "description": "Beautiful handcrafted wall hanging with natural fibers",
  "category": "wall-hanging",
  "price": 149.99,
  "status": "available",
  "stockQuantity": 1,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "dimensions": {
    "width": 60,
    "height": 90,
    "unit": "cm"
  },
  "materials": "Cotton, wool, natural dyes",
  "createdAt": "2026-02-02T22:51:14.959Z",
  "updatedAt": "2026-02-02T22:51:14.959Z"
}
```

### 2. Get All Products (with pagination)

**Request:**
```bash
curl http://localhost:4000/products
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "5fec71af-3c7f-40ad-9425-c81a9316acd5",
      "name": "Handwoven Wall Hanging",
      "description": "Beautiful handcrafted wall hanging",
      "category": "wall-hanging",
      "price": 149.99,
      "status": "available",
      "stockQuantity": 1,
      "images": ["https://example.com/image1.jpg"],
      "dimensions": { "width": 60, "height": 90, "unit": "cm" },
      "materials": "Cotton, wool",
      "createdAt": "2026-02-02T22:51:14.959Z",
      "updatedAt": "2026-02-02T22:51:14.959Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Get Products with Filters

**Filter by category:**
```bash
curl "http://localhost:4000/products?category=wall-hanging"
```

**Filter by status:**
```bash
curl "http://localhost:4000/products?status=available"
```

**Search by name:**
```bash
curl "http://localhost:4000/products?search=wall"
```

**Combine filters with pagination:**
```bash
curl "http://localhost:4000/products?category=rug&status=available&page=1&limit=20"
```

### 4. Get Single Product by ID

**Request:**
```bash
curl http://localhost:4000/products/5fec71af-3c7f-40ad-9425-c81a9316acd5
```

**Response (200 OK):**
```json
{
  "id": "5fec71af-3c7f-40ad-9425-c81a9316acd5",
  "name": "Handwoven Wall Hanging",
  "description": "Beautiful handcrafted wall hanging",
  "category": "wall-hanging",
  "price": 149.99,
  "status": "available",
  "stockQuantity": 1,
  "images": ["https://example.com/image1.jpg"],
  "dimensions": { "width": 60, "height": 90, "unit": "cm" },
  "materials": "Cotton, wool",
  "createdAt": "2026-02-02T22:51:14.959Z",
  "updatedAt": "2026-02-02T22:51:14.959Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID \"non-existent-id\" not found",
  "error": "Not Found"
}
```

### 5. Get Products by Category (Public Endpoint)

**Request:**
```bash
curl http://localhost:4000/products/category/wall-hanging
```

**Response (200 OK):**
```json
[
  {
    "id": "5fec71af-3c7f-40ad-9425-c81a9316acd5",
    "name": "Handwoven Wall Hanging",
    "category": "wall-hanging",
    "price": 149.99,
    "status": "available",
    ...
  }
]
```

### 6. Get Product Statistics

**Request:**
```bash
curl http://localhost:4000/products/statistics
```

**Response (200 OK):**
```json
{
  "total": 15,
  "byCategory": {
    "wall-hanging": 8,
    "rug": 7
  },
  "byStatus": {
    "available": 12,
    "sold": 2,
    "draft": 1
  }
}
```

### 7. Update a Product

**Request (Partial Update):**
```bash
curl -X PATCH http://localhost:4000/products/5fec71af-3c7f-40ad-9425-c81a9316acd5 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 179.99,
    "stockQuantity": 0,
    "status": "sold"
  }'
```

**Response (200 OK):**
```json
{
  "id": "5fec71af-3c7f-40ad-9425-c81a9316acd5",
  "name": "Handwoven Wall Hanging",
  "price": 179.99,
  "status": "sold",
  "stockQuantity": 0,
  ...
  "updatedAt": "2026-02-02T23:15:30.123Z"
}
```

### 8. Delete a Product

**Request:**
```bash
curl -X DELETE http://localhost:4000/products/5fec71af-3c7f-40ad-9425-c81a9316acd5
```

**Response (204 No Content):**
```
(No body - empty response)
```

## Validation Examples

### Invalid Input - Missing Required Fields

**Request:**
```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product"
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "category must be one of the following values: wall-hanging, rug",
    "category should not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Invalid Input - Wrong Type

**Request:**
```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "category": "wall-hanging",
    "price": "not-a-number"
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Invalid UUID Format

**Request:**
```bash
curl http://localhost:4000/products/invalid-uuid
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request"
}
```

## Using with HTTPie (alternative to curl)

HTTPie provides a more user-friendly CLI interface for HTTP requests.

### Install HTTPie
```bash
brew install httpie  # macOS
pip install httpie   # Python
```

### Examples with HTTPie

**Create product:**
```bash
http POST localhost:4000/products \
  name="Handwoven Rug" \
  category=rug \
  price:=299.99 \
  status=available \
  stockQuantity:=1
```

**Get products:**
```bash
http localhost:4000/products category==rug status==available
```

**Update product:**
```bash
http PATCH localhost:4000/products/5fec71af-3c7f-40ad-9425-c81a9316acd5 \
  price:=199.99
```

## Testing from JavaScript/TypeScript

### Using Fetch API

```typescript
// Create product
const response = await fetch('http://localhost:4000/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Handwoven Wall Hanging',
    category: 'wall-hanging',
    price: 149.99,
    status: 'available',
    stockQuantity: 1,
  }),
});

const product = await response.json();
console.log(product);
```

### Using Axios

```typescript
import axios from 'axios';

// Create product
const { data: product } = await axios.post('http://localhost:4000/products', {
  name: 'Handwoven Wall Hanging',
  category: 'wall-hanging',
  price: 149.99,
  status: 'available',
  stockQuantity: 1,
});

console.log(product);

// Get all products
const { data: result } = await axios.get('http://localhost:4000/products', {
  params: {
    category: 'wall-hanging',
    status: 'available',
    page: 1,
    limit: 10,
  },
});

console.log(result.data); // Array of products
```

## Rate Limiting (Future)

When rate limiting is implemented, you may receive:

**Response (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## CORS

CORS is configured to accept requests from:
- http://localhost:3002 (Frontend)
- http://localhost:3001 (Backoffice)

Requests from other origins will be blocked unless explicitly allowed.

## Health Check (Future)

```bash
curl http://localhost:4000/health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

## Tips

1. **Use jq for pretty printing:**
   ```bash
   curl http://localhost:4000/products | jq
   ```

2. **Save response to file:**
   ```bash
   curl http://localhost:4000/products > products.json
   ```

3. **Include response headers:**
   ```bash
   curl -i http://localhost:4000/products
   ```

4. **Follow redirects:**
   ```bash
   curl -L http://localhost:4000/products
   ```

5. **Verbose output for debugging:**
   ```bash
   curl -v http://localhost:4000/products
   ```

## Swagger UI

For the best interactive experience, use the Swagger UI at:
**http://localhost:4000/api/docs**

Features:
- Try all endpoints directly from browser
- See request/response schemas
- Authentication (when implemented)
- No need to write curl commands
