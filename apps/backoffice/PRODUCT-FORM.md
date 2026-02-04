# Product Form Feature

## Overview

The Product Form is a comprehensive interface for creating new products in the Atelier Kaisla backoffice. It implements multiple design patterns for maintainability and follows Vue 3 Composition API best practices.

## Design Patterns Applied

### 1. Builder Pattern
Progressive form data construction where the form state is built step-by-step with validation at each stage.

**Location**: `components/products/ProductForm.vue`
```typescript
const formData = ref<CreateProductDto>({
  name: '',
  description: '',
  category: 'wall-hanging',
  price: 0,
  status: 'draft',
  stockQuantity: 0,
  images: [],
  materials: '',
  dimensions: undefined,
})
```

### 2. Chain of Responsibility Pattern
Validation pipeline that checks each field sequentially and stops at the first error.

**Location**: `components/products/ProductForm.vue` - `validateForm()`
```typescript
const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  // Chain of validation rules
  if (!formData.value.name.trim()) {
    validationErrors.value.name = 'Product name is required'
    isValid = false
  } else if (formData.value.name.length > 255) {
    validationErrors.value.name = 'Product name must be less than 255 characters'
    isValid = false
  }
  // ... more validations

  return isValid
}
```

### 3. Facade Pattern
The `useProducts` composable provides a simplified interface for complex API operations.

**Location**: `composables/useProducts.ts`
```typescript
const { createProduct, loading, error, clearError } = useProducts()
```

### 4. Decorator Pattern
Loading and error state management wraps the API calls with additional functionality.

**Location**: `composables/useProducts.ts` - `executeApiCall()`

## Architecture

### Component Structure

```
components/
├── products/
│   └── ProductForm.vue          # Main form component
└── ui/
    ├── button/
    │   └── Button.vue           # Button component
    ├── input/
    │   └── Input.vue            # Text input component
    ├── label/
    │   └── Label.vue            # Form label (NEW)
    ├── textarea/
    │   └── Textarea.vue         # Textarea component (NEW)
    ├── select/
    │   └── Select.vue           # Select dropdown (NEW)
    └── sheet/
        ├── Sheet.vue            # Sheet container
        ├── SheetContent.vue     # Sheet content panel
        └── SheetTrigger.vue     # Sheet trigger button
```

### Form Fields

The form includes all fields from the backend `CreateProductDto`:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | Yes | Max 255 characters |
| `description` | `string` | No | Max 500 characters |
| `category` | `'wall-hanging' \| 'rug'` | Yes | Enum validation |
| `price` | `number` | Yes | Must be > 0 |
| `status` | `'available' \| 'sold' \| 'draft'` | No | Enum validation |
| `stockQuantity` | `number` | No | Must be >= 0 |
| `materials` | `string` | No | No limit |
| `dimensions` | `object` | No | width/height > 0 if enabled |
| `images` | `string[]` | No | Array of URLs |

### Dimensions Object

When enabled, dimensions include:
- `width`: number (must be > 0)
- `height`: number (must be > 0)
- `unit`: `'cm' | 'inch'`

### Image URLs

Images are entered as URLs, one per line in a textarea. The form processes them into an array before submission.

## Usage

### Opening the Form

The form is integrated into the products page using a Sheet (slide-out panel):

```vue
<Sheet v-model:open="isFormOpen">
  <SheetTrigger as-child>
    <Button>
      <Plus class="mr-2 h-4 w-4" />
      Add Product
    </Button>
  </SheetTrigger>
  <SheetContent class="w-full sm:max-w-2xl">
    <ProductForm
      :open="isFormOpen"
      @close="isFormOpen = false"
      @success="handleFormSuccess"
    />
  </SheetContent>
</Sheet>
```

### Events

The ProductForm emits two events:

1. **`@close`**: Fired when the user cancels or closes the form
2. **`@success`**: Fired when a product is successfully created

### Example Integration

```vue
<script setup lang="ts">
const isFormOpen = ref(false)

const handleFormSuccess = async () => {
  isFormOpen.value = false
  await refreshProducts() // Reload the products list
}
</script>

<template>
  <ProductForm
    :open="isFormOpen"
    @close="isFormOpen = false"
    @success="handleFormSuccess"
  />
</template>
```

## API Integration

### Endpoint

**POST** `/api/products`

### Request Body

```typescript
{
  name: string
  description?: string
  category: 'wall-hanging' | 'rug'
  price: number
  status?: 'available' | 'sold' | 'draft'
  stockQuantity?: number
  images?: string[]
  dimensions?: {
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  materials?: string
}
```

### Response

```typescript
{
  id: string
  name: string
  description?: string
  category: 'wall-hanging' | 'rug'
  price: string | number
  status: 'available' | 'sold' | 'draft'
  stockQuantity: number
  images?: string[]
  dimensions?: {
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  materials?: string
  createdAt: string
  updatedAt: string
}
```

## Validation Rules

### Client-Side Validation

All validation happens before API submission:

1. **Name**: Required, max 255 characters
2. **Description**: Optional, max 500 characters
3. **Price**: Required, must be > 0
4. **Stock Quantity**: Optional, must be >= 0
5. **Dimensions**: If enabled, width and height must be > 0

### Backend Validation

The backend validates using class-validator decorators in `CreateProductDto`:

- `@IsString()`, `@IsNotEmpty()`, `@MaxLength()`
- `@IsEnum()` for category and status
- `@IsNumber()`, `@IsPositive()` for price
- `@ValidateNested()` for dimensions object

## User Experience

### Success Flow

1. User clicks "Add Product" button
2. Sheet slides in from the right
3. User fills in the form
4. User clicks "Create Product"
5. Loading spinner appears on button
6. On success:
   - Green success message appears
   - "Product created successfully!" feedback
   - Form closes after 1.5 seconds
   - Products list refreshes automatically

### Error Handling

1. **Validation Errors**: Displayed inline below each field in red
2. **API Errors**: Displayed in a dismissible alert at the top of the form
3. **Loading State**: Button disabled with spinner during submission

### Accessibility

- All inputs have associated `<label>` elements
- Required fields marked with red asterisk
- ARIA attributes for invalid inputs (`aria-invalid`)
- Keyboard navigation supported throughout
- Focus management on sheet open/close

## Styling

The form uses Tailwind CSS utility classes and follows the shadcn/ui design system:

- **Border**: `border-input`
- **Background**: `bg-background`
- **Text**: `text-foreground`, `text-muted-foreground`
- **Focus Ring**: `focus-visible:ring-ring`
- **Error State**: `text-red-600`, `border-red-500`
- **Success State**: `text-green-800`, `bg-green-50`

## Testing

### Manual Testing Checklist

- [ ] Form opens when clicking "Add Product"
- [ ] All required field validations work
- [ ] Description character counter updates in real-time
- [ ] Dimensions fields show/hide correctly
- [ ] Image URLs split correctly by newlines
- [ ] Form resets after successful submission
- [ ] Error messages display correctly
- [ ] Success message appears and form closes
- [ ] Products list refreshes after creation
- [ ] Form can be canceled without saving
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### API Testing

```bash
# Test product creation
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "category": "wall-hanging",
    "price": 99.99,
    "status": "draft",
    "stockQuantity": 10,
    "materials": "Cotton, wool"
  }'
```

## Future Enhancements

1. **Image Upload**: Replace URL input with file upload (backend already supports `/api/products/with-upload`)
2. **Rich Text Editor**: For description field
3. **Auto-Save Draft**: Save form data to localStorage
4. **Duplicate Product**: Pre-fill form with existing product data
5. **Bulk Import**: CSV/Excel import for multiple products
6. **Image Preview**: Show image thumbnails as URLs are added
7. **Validation Debouncing**: Real-time validation as user types
8. **Unsaved Changes Warning**: Alert user before closing with unsaved data

## Related Files

- `/apps/backoffice/app/pages/products.vue` - Products list page
- `/apps/backoffice/app/composables/useProducts.ts` - Products API composable
- `/apps/backoffice/app/types/product.d.ts` - TypeScript type definitions
- `/apps/backend/src/modules/products/dto/create-product.dto.ts` - Backend DTO
- `/apps/backend/src/modules/products/products.controller.ts` - API endpoints

## Troubleshooting

### Form doesn't submit

1. Check browser console for validation errors
2. Ensure all required fields are filled
3. Verify backend is running: `curl http://localhost:4000/api/products`

### Images don't appear

1. Ensure URLs are valid and accessible
2. Check CORS configuration in backend
3. Images should be publicly accessible URLs

### Dimensions not saving

1. Ensure "Add Dimensions" checkbox is enabled
2. Verify width and height are greater than 0
3. Check backend logs for validation errors

### API errors

1. Check backend logs: `make dev-logs-backend`
2. Verify request payload in browser Network tab
3. Ensure database is running: `docker compose -f docker-compose.dev.yml ps`

## Support

For issues or questions:
1. Check backend Swagger docs: `http://localhost:4000/api/docs`
2. Review backend logs: `make dev-logs-backend`
3. Check browser console for client-side errors
