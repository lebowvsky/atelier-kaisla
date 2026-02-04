# Image Upload Feature - Backoffice Product Form

## Overview

The backoffice product form has been updated to support image file uploads instead of URL links. This provides a better user experience and integrates directly with the backend's multipart/form-data upload endpoint.

## Changes Made

### 1. Composable Updates (`apps/backoffice/app/composables/useProducts.ts`)

#### New Method: `createProductWithImages`

```typescript
const createProductWithImages = async (
  dto: Omit<CreateProductDto, 'images'>,
  imageFiles: File[]
): Promise<Product | null>
```

**Pattern Applied**: Adapter + Builder Patterns

- **Adapter Pattern**: Converts frontend form data to backend's multipart/form-data format
- **Builder Pattern**: Progressive FormData construction with all product fields

**Features**:
- Accepts product DTO without images field + array of File objects
- Constructs FormData with all product fields (name, description, category, price, etc.)
- Serializes dimensions as JSON string for FormData
- Appends up to 5 image files
- Uses native `fetch` API (better FormData handling than Nuxt `$fetch`)
- Automatically refreshes product list on success
- Full error handling with proper error structure

**API Endpoint**: `POST /api/products/with-upload`

### 2. Component Updates (`apps/backoffice/app/components/products/ProductForm.vue`)

#### New State Management

```typescript
// File handling state
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

// Validation constants
const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
```

#### New Functions

**`validateFile(file: File): string | null`**
- Chain of Responsibility Pattern for validation pipeline
- Validates file type (JPEG, PNG, WebP only)
- Validates file size (max 5MB)
- Returns error message or null if valid

**`handleFileChange(event: Event)`**
- Decorator Pattern for file selection with validation
- Handles multiple file selection
- Validates total image count (max 5)
- Validates each file individually
- Generates preview URLs using FileReader API
- Provides immediate user feedback on errors

**`removeImage(index: number)`**
- Removes image from selection
- Updates previews synchronously
- Clears validation errors when images exist

**`formatFileSize(bytes: number): string`**
- Pure utility function for human-readable file sizes
- Formats: Bytes, KB, MB

#### Updated UI

**File Upload Interface** (replaces textarea):

1. **Hidden File Input**
   - Accepts: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Multiple selection enabled
   - Disabled when 5 images reached

2. **Upload Button**
   - Shows current count (e.g., "Add More Images (2/5)")
   - Disabled when limit reached
   - Clear visual feedback

3. **Image Preview Grid**
   - 2-column responsive grid
   - Each preview shows:
     - Image thumbnail
     - Filename (truncated)
     - File size (formatted)
     - Remove button (appears on hover)
     - "Primary" badge on first image
   - Empty slots show remaining capacity
   - Visual indicator with image icon

4. **Empty State**
   - Shown when no images uploaded
   - Large image icon
   - Helpful instructions

5. **Validation Messages**
   - File type errors
   - File size errors
   - Total count errors
   - At least one image required

## Design Patterns Applied

### 1. **Adapter Pattern** (`createProductWithImages`)
- Transforms frontend File objects to backend's multipart/form-data format
- Bridges the gap between browser FormData API and backend upload endpoint

### 2. **Builder Pattern** (`createProductWithImages`)
- Progressive construction of FormData object
- Step-by-step addition of all product fields
- Conditional fields (dimensions, materials, description)

### 3. **Chain of Responsibility Pattern** (`validateFile`)
- Sequential validation checks
- Stops at first failure
- Returns specific error messages

### 4. **Decorator Pattern** (`handleFileChange`)
- Wraps file selection with validation logic
- Adds preview generation capability
- Enhances basic input behavior

### 5. **Strategy Pattern** (file handling)
- Different strategies for different file types
- Preview generation using FileReader API
- Size formatting strategy

## User Experience Improvements

### Before (URL-based)
- Manual URL entry
- No validation
- No preview
- Prone to typos
- Requires external hosting

### After (File Upload)
- Drag-and-drop ready (can be enhanced)
- Real-time validation
- Instant previews
- File size and type checks
- Direct integration with backend storage
- Visual feedback (progress, errors, success)
- Primary image indication
- Easy removal of images
- Clear remaining capacity indicator

## Validation Rules

| Rule | Value | Error Message |
|------|-------|---------------|
| Max images | 5 | "Maximum 5 images allowed. You've selected X images." |
| Min images | 1 | "At least one product image is required" |
| Max file size | 5MB | "File size exceeds 5MB limit" |
| Allowed types | JPEG, PNG, WebP | "Invalid file type. Allowed: JPEG, PNG, WebP" |

## API Integration

### Backend Endpoint

**URL**: `POST /api/products/with-upload`

**Content-Type**: `multipart/form-data`

**Fields**:
```
name: string (required)
description: string (optional)
category: 'wall-hanging' | 'rug' (required)
price: number (required)
status: 'draft' | 'available' | 'sold' (optional)
stockQuantity: number (optional)
materials: string (optional)
dimensions: JSON string (optional) - { width, height, unit }
images: File[] (max 5) - Field name repeated for each file
```

**Response**: Product entity with uploaded image URLs

**Example**:
```json
{
  "id": "uuid",
  "name": "Handwoven Wall Hanging",
  "category": "wall-hanging",
  "price": "149.99",
  "images": [
    "http://localhost:4000/uploads/wall-hanging-1.jpg",
    "http://localhost:4000/uploads/wall-hanging-2.jpg"
  ],
  ...
}
```

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (up to 5)
- [ ] Try uploading more than 5 images (should show error)
- [ ] Upload unsupported file type (should show error)
- [ ] Upload file larger than 5MB (should show error)
- [ ] Remove image from preview
- [ ] Submit form without images (should show validation error)
- [ ] Preview images display correctly
- [ ] File size formatting is accurate
- [ ] Success message shows on product creation
- [ ] Products list refreshes after creation
- [ ] Backend stores images correctly
- [ ] Image URLs in response are accessible

## Browser Compatibility

**File API Support**:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

**FileReader API Support**:
- Modern browsers: ✅ Full support
- IE11: ⚠️ Requires polyfill (not in scope)

## Future Enhancements

1. **Drag-and-Drop Support**
   - Add drop zone
   - Visual feedback during drag

2. **Image Editing**
   - Crop/resize before upload
   - Adjust brightness/contrast
   - Rotate images

3. **Upload Progress**
   - Progress bar for each image
   - Overall upload percentage
   - Cancel upload capability

4. **Image Optimization**
   - Client-side compression
   - Format conversion
   - Thumbnail generation

5. **Image Reordering**
   - Drag-and-drop to reorder
   - Set different primary image
   - Visual position indicators

6. **Bulk Upload**
   - Folder upload support
   - Batch processing
   - Queue management

## Performance Considerations

**Memory Management**:
- FileReader creates data URLs (base64)
- Large images can consume memory
- Preview generation is on-demand
- Cleanup on component unmount

**Network**:
- Native `fetch` with FormData
- No unnecessary retries
- Clear error messages
- Auto-refresh products list

## Accessibility

**ARIA Labels**:
- File input has descriptive label
- Remove buttons have `aria-label` with context
- Validation errors associated with inputs

**Keyboard Navigation**:
- Tab through upload button
- Enter/Space to trigger file selection
- Tab to remove buttons
- Visual focus indicators

**Screen Readers**:
- Announces validation errors
- Describes image count
- Clear button labels

## Files Modified

1. `/apps/backoffice/app/composables/useProducts.ts`
   - Added `createProductWithImages` method
   - Updated return statement with new method

2. `/apps/backoffice/app/components/products/ProductForm.vue`
   - Replaced image URL textarea with file upload interface
   - Added file validation logic
   - Added preview generation
   - Added image removal functionality
   - Updated submit handler
   - Updated reset function

## Dependencies

**No new dependencies required!**

All features use native browser APIs:
- `FormData` API (multipart/form-data)
- `FileReader` API (preview generation)
- `File` API (file handling)
- Native `fetch` API (upload)

## Conclusion

The image upload feature provides a professional, user-friendly interface for adding product images in the backoffice. It follows Vue 3 Composition API best practices, implements proper design patterns, and provides comprehensive validation and error handling.

The implementation is fully typed with TypeScript, accessible, and performant. It integrates seamlessly with the existing backend upload endpoint and maintains consistency with the project's architectural patterns.
