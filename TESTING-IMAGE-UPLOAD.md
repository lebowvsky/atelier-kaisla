# Testing Image Upload Feature

## Quick Start

1. **Start the development environment** (if not already running):
   ```bash
   make dev-up
   ```

2. **Access the backoffice**:
   - URL: http://localhost:3001
   - Navigate to Products section
   - Click "Add New Product" button

## Test Scenarios

### ✅ Test 1: Upload Single Image

**Steps**:
1. Fill in required fields (name, price)
2. Click "Upload Images" button
3. Select a single JPEG/PNG/WebP image (< 5MB)
4. Verify preview appears
5. Check filename and file size displayed correctly
6. Submit form

**Expected Result**:
- Image preview shows immediately
- File info (name, size) displays correctly
- Primary badge appears on first image
- Form submits successfully
- Product created with image URL

---

### ✅ Test 2: Upload Multiple Images

**Steps**:
1. Fill in required fields
2. Click "Upload Images"
3. Select 2-3 images at once (use Cmd/Ctrl + click)
4. Verify all previews appear
5. Click "Add More Images"
6. Add 1-2 more images
7. Submit form

**Expected Result**:
- All previews display in grid
- Button shows count (e.g., "Add More Images (3/5)")
- Empty slots show remaining capacity
- First image has "Primary" badge
- Form submits successfully

---

### ❌ Test 3: Exceed Maximum Images

**Steps**:
1. Upload 5 images successfully
2. Try to click "Upload Images" button

**Expected Result**:
- Button is disabled
- Button text shows "Add More Images (5/5)"
- Cannot select more files

**Alternative**:
1. Upload 3 images
2. Click "Add More Images"
3. Select 3 more images (total would be 6)

**Expected Result**:
- Error message: "Maximum 5 images allowed. You've selected 6 images."
- No new images added
- Previous 3 images remain

---

### ❌ Test 4: Invalid File Type

**Steps**:
1. Fill in required fields
2. Click "Upload Images"
3. Try to select a PDF, GIF, or BMP file

**Expected Result**:
- File selector may filter out non-image files (browser dependent)
- If file is selected, error message appears:
  - "filename.pdf: Invalid file type. Allowed: JPEG, PNG, WebP"
- No preview generated

---

### ❌ Test 5: File Too Large

**Steps**:
1. Fill in required fields
2. Click "Upload Images"
3. Select an image larger than 5MB

**Expected Result**:
- Error message: "filename.jpg: File size exceeds 5MB limit"
- No preview generated
- File rejected

**How to test**:
- Use a high-resolution photo (> 5MB)
- Or create a test file:
  ```bash
  # Create a 6MB test file
  dd if=/dev/zero of=large-image.jpg bs=1m count=6
  ```

---

### ❌ Test 6: Submit Without Images

**Steps**:
1. Fill in all other required fields
2. Do NOT upload any images
3. Click "Create Product"

**Expected Result**:
- Validation error appears:
  - "At least one product image is required"
- Form does not submit
- Error message is red and prominent

---

### ✅ Test 7: Remove Images

**Steps**:
1. Upload 3 images
2. Hover over the second image preview
3. Click the red X button

**Expected Result**:
- Image is removed immediately
- Remaining images shift position
- Counter updates (e.g., "Add More Images (2/5)")
- Empty slots increase
- Can upload more images

---

### ✅ Test 8: Complete Product Creation

**Steps**:
1. Fill in all fields:
   - Name: "Test Wall Hanging"
   - Description: "Beautiful handwoven piece"
   - Category: "Wall Hanging"
   - Price: 149.99
   - Status: "Available"
   - Stock Quantity: 5
   - Materials: "Cotton, wool"
   - Enable dimensions: 50cm × 70cm
2. Upload 2-3 images
3. Review all previews
4. Click "Create Product"

**Expected Result**:
- Loading spinner appears
- "Creating..." button text
- Success message with green checkmark
- "Product created successfully!"
- Form closes after 1.5 seconds
- New product appears in products list
- Images are accessible via returned URLs

---

### ✅ Test 9: File Size Formatting

**Steps**:
1. Upload images of different sizes:
   - Small: < 100KB
   - Medium: 500KB - 1MB
   - Large: 2-4MB
2. Check displayed file sizes

**Expected Result**:
- Small files: "85.5 KB" format
- Medium files: "750 KB" format
- Large files: "2.3 MB" format
- Accurate and readable

---

### ✅ Test 10: API Integration

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Fill in form and upload 2 images
4. Submit form
5. Inspect the request

**Expected Result**:
- Request URL: `http://localhost:4000/api/products/with-upload`
- Request Method: `POST`
- Content-Type: `multipart/form-data; boundary=...`
- Request payload contains:
  - All form fields (name, description, etc.)
  - Two image files
  - Dimensions as JSON string
- Response: Product object with image URLs
- Status: 201 Created

---

## Backend Verification

### Check Uploaded Files

**Access backend container**:
```bash
make backend-shell
```

**List uploaded files**:
```bash
ls -lh uploads/
```

**Expected**:
- Files with unique names (timestamped or UUID)
- File sizes match originals
- Correct file extensions

### Check Database

**Access database**:
```bash
make db-shell
```

**Query products**:
```sql
SELECT id, name, images FROM products ORDER BY created_at DESC LIMIT 1;
```

**Expected**:
- `images` column contains array of URLs
- URLs point to uploaded files
- Format: `["http://localhost:4000/uploads/image1.jpg", ...]`

---

## Error Handling Tests

### Test 11: Backend Offline

**Steps**:
1. Stop backend container:
   ```bash
   docker stop atelier-kaisla-backend-dev
   ```
2. Try to create a product with images

**Expected Result**:
- Error message appears
- "Error creating product"
- Details about connection failure
- Form doesn't reset
- User can retry

**Cleanup**:
```bash
docker start atelier-kaisla-backend-dev
```

---

### Test 12: Network Timeout

**Steps**:
1. In DevTools Network tab, throttle to "Slow 3G"
2. Upload 3 large images (2-4MB each)
3. Submit form

**Expected Result**:
- Loading state persists
- Eventually completes or times out gracefully
- Clear error message if timeout occurs

---

## Accessibility Tests

### Test 13: Keyboard Navigation

**Steps**:
1. Use only keyboard (no mouse)
2. Tab to "Upload Images" button
3. Press Enter/Space to open file selector
4. Select files using file picker
5. Tab to remove buttons
6. Press Enter to remove image

**Expected Result**:
- All actions work via keyboard
- Visual focus indicators
- Logical tab order

---

### Test 14: Screen Reader

**Steps**:
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate to product form
3. Listen to announcements

**Expected Result**:
- "Product Images, required" announced
- "Upload Images button"
- Image count announced
- Remove buttons have context ("Remove image 1")
- Validation errors are announced

---

## Performance Tests

### Test 15: Large Images

**Steps**:
1. Upload 5 images, each 4-5MB
2. Monitor browser memory (DevTools > Performance)
3. Generate previews
4. Submit form

**Expected Result**:
- Previews generate in < 1 second per image
- No browser freeze
- Memory usage acceptable
- Successful upload

---

### Test 16: Rapid Operations

**Steps**:
1. Upload 2 images
2. Immediately remove one
3. Add 2 more
4. Remove another
5. Add one more
6. Submit

**Expected Result**:
- All operations complete smoothly
- No race conditions
- Correct final count
- Successful submission

---

## Visual Regression Tests

### Test 17: Light/Dark Mode

**Steps**:
1. Test form in light mode
2. Switch to dark mode (if implemented)
3. Check:
   - Preview borders
   - Empty state colors
   - Button styles
   - Error messages

**Expected Result**:
- All elements visible and readable
- Proper contrast in both modes

---

### Test 18: Responsive Layout

**Steps**:
1. Test on different viewport sizes:
   - Desktop: 1920px wide
   - Tablet: 768px wide
   - Mobile: 375px wide

**Expected Result**:
- Preview grid adjusts (2 columns on desktop, 1-2 on mobile)
- Upload button remains accessible
- Text doesn't overflow
- Touch targets are large enough (mobile)

---

## Regression Tests

### Test 19: Existing Functionality

**Steps**:
1. Test all other form fields still work:
   - Name input
   - Description textarea
   - Category dropdown
   - Price input
   - Status dropdown
   - Stock quantity
   - Materials
   - Dimensions toggle and inputs

**Expected Result**:
- All fields work as before
- Validation unchanged
- Form submission works

---

### Test 20: Products List

**Steps**:
1. Create product with images
2. Go to products list
3. Verify new product appears
4. Check if images display (if list shows thumbnails)

**Expected Result**:
- Product appears immediately (list auto-refreshes)
- All product data correct
- Images accessible

---

## Automated Testing (Future)

**Unit Tests** (Vitest):
```typescript
// composables/__tests__/useProducts.spec.ts
describe('createProductWithImages', () => {
  it('should create FormData with files', async () => {
    const dto = { name: 'Test', category: 'wall-hanging', price: 100 }
    const files = [new File([''], 'test.jpg', { type: 'image/jpeg' })]

    const result = await createProductWithImages(dto, files)

    expect(result).toBeDefined()
  })
})

// components/__tests__/ProductForm.spec.ts
describe('ProductForm', () => {
  it('should validate file type', () => {
    const invalidFile = new File([''], 'test.pdf', { type: 'application/pdf' })
    const error = validateFile(invalidFile)

    expect(error).toContain('Invalid file type')
  })

  it('should validate file size', () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg')
    const error = validateFile(largeFile)

    expect(error).toContain('exceeds 5MB limit')
  })
})
```

**E2E Tests** (Playwright):
```typescript
test('upload product with images', async ({ page }) => {
  await page.goto('http://localhost:3001/products')
  await page.click('text=Add New Product')

  await page.fill('[id=name]', 'Test Product')
  await page.fill('[id=price]', '99.99')

  const fileInput = page.locator('input[type=file]')
  await fileInput.setInputFiles(['test-images/image1.jpg', 'test-images/image2.jpg'])

  await expect(page.locator('.preview-grid')).toContainText('image1.jpg')
  await expect(page.locator('.preview-grid')).toContainText('image2.jpg')

  await page.click('text=Create Product')

  await expect(page.locator('text=Product created successfully')).toBeVisible()
})
```

---

## Test Summary Checklist

- [ ] Single image upload
- [ ] Multiple image upload
- [ ] Maximum image limit (5)
- [ ] Invalid file type rejection
- [ ] Large file size rejection
- [ ] Required validation (at least 1 image)
- [ ] Image removal
- [ ] Complete product creation flow
- [ ] File size formatting accuracy
- [ ] API integration (multipart/form-data)
- [ ] Backend file storage
- [ ] Database image URLs
- [ ] Error handling (backend offline)
- [ ] Network timeout handling
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Performance with large files
- [ ] Rapid operations stability
- [ ] Light/dark mode (if applicable)
- [ ] Responsive design
- [ ] Regression testing (other form fields)

---

## Troubleshooting

### Issue: Previews Not Showing

**Solution**:
- Check browser console for FileReader errors
- Verify file is valid image
- Check if file size is causing memory issues

### Issue: Form Submits Without Images

**Solution**:
- Check validation logic in `validateForm()`
- Ensure `imageFiles.value.length === 0` check is present
- Verify validation runs before submit

### Issue: Backend Returns 400

**Solution**:
- Check Network tab for request payload
- Verify FormData contains all required fields
- Check backend logs for validation errors
- Ensure Content-Type header is NOT manually set

### Issue: Images Not Accessible After Upload

**Solution**:
- Check backend uploads directory exists
- Verify file permissions
- Check backend serves static files from uploads directory
- Inspect returned image URLs in response

---

## Contact & Support

For issues or questions about the image upload feature, refer to:
- `/IMAGE-UPLOAD-FEATURE.md` - Complete technical documentation
- `/apps/backend/README.md` - Backend API reference
- `/CLAUDE.md` - Project overview
