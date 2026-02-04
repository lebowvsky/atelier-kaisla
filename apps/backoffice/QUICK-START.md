# Backoffice Quick Start Guide

## Accessing the Backoffice

1. **Start the development environment:**
   ```bash
   make dev-up
   ```

2. **Access the backoffice:**
   ```
   http://localhost:3001
   ```

3. **Available pages:**
   - Home: `http://localhost:3001/`
   - Products: `http://localhost:3001/products`
   - About: `http://localhost:3001/about`

## Managing Products

### Viewing Products

Navigate to the Products page (`/products`) to see:
- Complete products list with images
- Search functionality
- Filter by category (Wall Hanging / Rug)
- Filter by status (Available / Sold / Draft)
- Sort by name, price, or date
- Real-time statistics (total, low stock, drafts)

### Adding a New Product

1. **Click "Add Product" button** (top-right or in empty state)
2. **Fill in the form:**

   **Required Fields:**
   - Product Name (max 255 characters)
   - Category (Wall Hanging or Rug)
   - Price in EUR (must be greater than 0)

   **Optional Fields:**
   - Description (max 500 characters, live counter)
   - Status (Draft, Available, or Sold) - defaults to Draft
   - Stock Quantity (defaults to 0)
   - Materials (e.g., "Cotton, wool, natural dyes")
   - Image URLs (one per line in textarea)

   **Dimensions (Optional, toggle to enable):**
   - Width (must be > 0)
   - Height (must be > 0)
   - Unit (cm or inch)

3. **Click "Create Product"**
4. **Wait for success message** (green alert)
5. **Form closes automatically** after 1.5 seconds
6. **Products list refreshes** with your new product

### Form Validation

The form validates all fields before submission:

- **Product Name**: Required, cannot be empty
- **Price**: Must be greater than 0
- **Stock Quantity**: Cannot be negative
- **Description**: Max 500 characters (live counter shows remaining)
- **Dimensions**: If enabled, width and height must be greater than 0

Validation errors appear in red below each field.

### Example: Creating a Wall Hanging

```
Product Name: Handwoven Bohemian Wall Hanging
Description: Beautiful handcrafted piece with intricate patterns
Category: Wall Hanging
Price: 199.99
Status: Available
Stock Quantity: 5
Materials: Cotton, wool, natural dyes

Dimensions (enabled):
  Width: 60
  Height: 90
  Unit: cm

Image URLs:
https://example.com/wall-hanging-1.jpg
https://example.com/wall-hanging-2.jpg
```

### Example: Creating a Rug

```
Product Name: Vintage Kilim Rug
Description: Authentic vintage kilim with geometric patterns
Category: Rug
Price: 449.99
Status: Available
Stock Quantity: 1
Materials: Wool, cotton base

Dimensions (enabled):
  Width: 120
  Height: 180
  Unit: cm

Image URLs:
https://example.com/rug-front.jpg
https://example.com/rug-detail.jpg
https://example.com/rug-back.jpg
```

## Products List Features

### Search
Type in the search box to filter products by:
- Product name
- Description
- Materials

### Filters
Use dropdown filters to narrow results:
- **Category**: Wall Hanging or Rug
- **Status**: Available, Sold, or Draft

### Sorting
Sort products by:
- **Date** (newest first or oldest first)
- **Name** (A-Z or Z-A)
- **Price** (low to high or high to low)

Toggle sort direction with the ↑/↓ button.

### Actions
For each product, you can:
- **View** (eye icon) - View details
- **Edit** (pencil icon) - Edit product
- **Delete** (trash icon) - Delete product (with confirmation)

### Statistics Cards

At the top of the page, see:
- **Total Products**: Count of all products
- **Low Stock Alert**: Products with ≤5 items in stock
- **Draft Products**: Products not yet published

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit form (when focused on a button)
- **Escape**: Close the form sheet
- **Arrow Keys**: Navigate dropdown options

## Common Workflows

### Creating a Draft Product

1. Click "Add Product"
2. Fill in name, category, and price
3. Leave Status as "Draft"
4. Add remaining details later
5. Submit

### Publishing a Product

1. Create product with Status = "Available"
2. Or edit existing draft and change status
3. Ensure all product details are complete
4. Add high-quality images

### Managing Stock

1. Create product with initial stock quantity
2. Update stock as products sell
3. Low stock products (≤5) appear in alert card

## Error Handling

### Form Validation Errors
- Appear below the relevant field in red
- Fix the error and try again
- All errors must be resolved before submission

### API Errors
- Appear at the top of the form in red
- Click X to dismiss
- Check backend logs if error persists: `make dev-logs-backend`

### Network Errors
If the form won't submit:
1. Check backend is running: `curl http://localhost:4000/api/products`
2. Check browser console for errors
3. Verify Docker containers: `make dev-up`

## Tips and Best Practices

### Product Names
- Be descriptive and specific
- Include key features or style
- Keep under 255 characters
- Examples:
  - "Handwoven Boho Wall Hanging with Tassels"
  - "Vintage Turkish Kilim Rug - Geometric Pattern"

### Descriptions
- Highlight unique features
- Mention materials and craftsmanship
- Keep under 500 characters
- Be clear and concise

### Pricing
- Enter price in euros (EUR)
- Use decimal format: 149.99
- Consider materials, size, and craftsmanship
- Research similar products

### Images
- Use high-quality photos
- Multiple angles recommended (2-4 images)
- Include detail shots
- Ensure URLs are publicly accessible
- HTTPS URLs preferred

### Status Management
- **Draft**: Use while preparing product
- **Available**: Ready for customers
- **Sold**: Mark as sold to remove from store

### Stock Tracking
- Set accurate initial quantity
- Update regularly as sales occur
- Monitor low stock alerts
- Restock when quantity ≤ 5

## Troubleshooting

### Form Won't Open
- Refresh the page
- Check browser console for errors
- Clear browser cache

### Can't Submit Form
- Ensure all required fields are filled (marked with *)
- Check for validation errors (red text)
- Verify price is greater than 0
- If dimensions enabled, ensure width/height > 0

### Images Don't Display
- Verify URLs are correct and accessible
- Use direct image URLs (ending in .jpg, .png, .webp)
- Ensure CORS is configured on image host
- Test URL in browser first

### Products Not Refreshing
- Click the Refresh button (top-right)
- Check browser console for errors
- Verify backend connection: `make dev-logs-backend`

## Technical Support

### View Backend Logs
```bash
make dev-logs-backend
```

### View Backoffice Logs
```bash
make dev-logs-backoffice
```

### Restart Services
```bash
make dev-down
make dev-up
```

### Test API Connection
```bash
curl http://localhost:4000/api/products | jq
```

### Run Integration Tests
```bash
./test-product-form.sh
```

### View API Documentation
Open in browser: http://localhost:4000/api/docs

## Additional Resources

- **Detailed Documentation**: `/apps/backoffice/PRODUCT-FORM.md`
- **API Integration Guide**: `/FRONTEND-BACKEND-INTEGRATION.md`
- **Backend API Reference**: `/apps/backend/README.md`
- **Project Setup**: `/CLAUDE.md`
- **Docker Guide**: `/DOCKER-QUICKSTART.md`

## Getting Help

If you encounter issues:

1. Check this Quick Start guide
2. Review the detailed documentation
3. Check backend logs for API errors
4. Run integration tests to verify setup
5. Review browser console for client errors

## Next Steps

Once comfortable with basic product management:

1. Explore filtering and sorting features
2. Try bulk operations (multiple products)
3. Learn keyboard shortcuts for efficiency
4. Set up product categories and tags
5. Implement product variants (future feature)

---

**Happy product managing!** 🎨
