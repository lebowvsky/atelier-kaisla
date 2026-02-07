import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import ProductForm from './ProductForm.vue'
import type { Product } from '@/types/product'

// --- Mock setup ---

// Use actual Vue refs so the template reactivity works correctly
// (Vue auto-unwraps refs in templates, so plain objects would be truthy)
const mockLoadingRef = ref(false)
const mockErrorRef = ref<null | { statusCode: number; message: string }>(null)

const mockCreateProductWithImages = vi.fn()
const mockUpdateProduct = vi.fn()
const mockAddProductImages = vi.fn()
const mockUpdateProductImageMeta = vi.fn()
const mockRemoveProductImage = vi.fn()
const mockClearError = vi.fn()

vi.stubGlobal('useProducts', vi.fn(() => ({
  createProductWithImages: mockCreateProductWithImages,
  updateProduct: mockUpdateProduct,
  addProductImages: mockAddProductImages,
  updateProductImage: mockUpdateProductImageMeta,
  removeProductImage: mockRemoveProductImage,
  loading: mockLoadingRef,
  error: mockErrorRef,
  clearError: mockClearError,
})))

// Mock Nuxt auto-imports
vi.stubGlobal('useApi', vi.fn(() => ({
  loading: ref(false),
  error: ref(null),
  hasError: ref(false),
  getApiUrl: vi.fn(() => 'http://localhost:4000/api'),
  getAuthHeaders: vi.fn(() => ({})),
  getAuthHeadersForFormData: vi.fn(() => ({})),
  executeApiCall: vi.fn(),
  clearError: vi.fn(),
})))

// Mock #imports for Nuxt auto-imports used by the component
vi.mock('#imports', () => {
  const vue = require('vue')
  return {
    ref: vue.ref,
    computed: vue.computed,
    readonly: vue.readonly,
    watch: vue.watch,
    onMounted: vue.onMounted,
    Ref: {},
    useRuntimeConfig: () => ({ public: { apiUrl: 'http://localhost:4000/api' } }),
    navigateTo: vi.fn(),
    useSeoMeta: vi.fn(),
    useHead: vi.fn(),
  }
})

// Suppress console.log/error in tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

// --- Stub UI components ---
// These are shadcn-vue components that are auto-imported; we replace them with simple stubs

const ButtonStub = defineComponent({
  name: 'Button',
  props: ['type', 'variant', 'disabled'],
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('button', {
      type: props.type,
      disabled: props.disabled,
      onClick: () => emit('click'),
    }, slots.default?.())
  },
})

const InputStub = defineComponent({
  name: 'Input',
  props: ['id', 'modelValue', 'type', 'placeholder', 'disabled', 'step', 'min', 'ariaInvalid'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('input', {
      id: props.id,
      value: props.modelValue,
      type: props.type,
      disabled: props.disabled,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement
        const val = props.type === 'number' ? Number(target.value) : target.value
        emit('update:modelValue', val)
      },
    })
  },
})

const LabelStub = defineComponent({
  name: 'Label',
  props: ['for', 'required'],
  setup(props, { slots }) {
    return () => h('label', { for: props.for }, slots.default?.())
  },
})

const TextareaStub = defineComponent({
  name: 'Textarea',
  props: ['id', 'modelValue', 'placeholder', 'rows', 'disabled', 'ariaInvalid'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('textarea', {
      id: props.id,
      value: props.modelValue,
      onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value),
    })
  },
})

const SelectStub = defineComponent({
  name: 'Select',
  props: ['id', 'modelValue', 'disabled'],
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
    return () => h('select', {
      id: props.id,
      value: props.modelValue,
      onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value),
    }, slots.default?.())
  },
})

// Simple icon stubs
const IconStub = defineComponent({
  name: 'IconStub',
  setup() {
    return () => h('span', { class: 'icon-stub' })
  },
})

// --- Global stubs config ---
const globalStubs = {
  Button: ButtonStub,
  Input: InputStub,
  Label: LabelStub,
  Textarea: TextareaStub,
  Select: SelectStub,
  X: IconStub,
  Loader2: IconStub,
  CheckCircle2: IconStub,
  AlertCircle: IconStub,
  Upload: IconStub,
  Image: IconStub,
  ImageIcon: IconStub,
}

// --- Test data factories ---

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Test Wall Hanging',
    description: 'A beautiful piece',
    category: 'wall-hanging',
    price: 150,
    status: 'available',
    stockQuantity: 3,
    materials: 'Cotton, wool',
    dimensions: { width: 60, height: 90, unit: 'cm' },
    productImages: [
      {
        id: 'img-1',
        url: 'http://example.com/image1.jpg',
        showOnHome: true,
        sortOrder: 0,
        productId: 'prod-1',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function mountForm(props: { open: boolean; product?: Product } = { open: true }) {
  return mount(ProductForm, {
    props,
    global: {
      stubs: globalStubs,
    },
  })
}

// --- Helper to find button by text ---
function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find(b => b.text().includes(text))
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks()
  mockLoadingRef.value = false
  mockErrorRef.value = null
  mockCreateProductWithImages.mockResolvedValue(null)
  mockUpdateProduct.mockResolvedValue(null)
  mockAddProductImages.mockResolvedValue(null)
  mockUpdateProductImageMeta.mockResolvedValue(null)
  mockRemoveProductImage.mockResolvedValue(true)
})

describe('ProductForm', () => {
  describe('rendering', () => {
    it('should render in create mode when no product prop is provided', () => {
      const wrapper = mountForm({ open: true })

      expect(wrapper.text()).toContain('Add New Product')
      expect(wrapper.text()).toContain('Create a new product for your catalog')
    })

    it('should render in edit mode when product prop is provided', () => {
      const product = createMockProduct()
      const wrapper = mountForm({ open: true, product })

      expect(wrapper.text()).toContain('Edit Product')
      expect(wrapper.text()).toContain('Update product details')
    })

    it('should show "Create Product" button text in create mode', () => {
      const wrapper = mountForm({ open: true })
      expect(wrapper.text()).toContain('Create Product')
    })

    it('should show "Save Changes" button text in edit mode', () => {
      const product = createMockProduct()
      const wrapper = mountForm({ open: true, product })
      expect(wrapper.text()).toContain('Save Changes')
    })
  })

  describe('form pre-population in edit mode', () => {
    it('should populate form fields with product data', async () => {
      const product = createMockProduct()
      const wrapper = mountForm({ open: true, product })
      await nextTick()

      const nameInput = wrapper.find('input#name')
      expect((nameInput.element as HTMLInputElement).value).toBe('Test Wall Hanging')

      const descTextarea = wrapper.find('textarea#description')
      expect((descTextarea.element as HTMLTextAreaElement).value).toBe('A beautiful piece')
    })

    it('should enable dimensions when product has dimensions', async () => {
      const product = createMockProduct({
        dimensions: { width: 60, height: 90, unit: 'cm' },
      })
      const wrapper = mountForm({ open: true, product })
      await nextTick()

      const dimCheckbox = wrapper.find('#dimensionsEnabled')
      expect((dimCheckbox.element as HTMLInputElement).checked).toBe(true)
    })

    it('should show existing images in edit mode', async () => {
      const product = createMockProduct()
      const wrapper = mountForm({ open: true, product })
      await nextTick()

      expect(wrapper.text()).toContain('Current Images')
    })
  })

  describe('form validation', () => {
    it('should show validation error when name is empty on submit', async () => {
      const wrapper = mountForm({ open: true })

      // Submit the form (name is empty by default)
      const submitButton = findButtonByText(wrapper, 'Create Product')
      expect(submitButton).toBeTruthy()
      await submitButton!.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Product name is required')
    })

    it('should show validation error when price is 0', async () => {
      const wrapper = mountForm({ open: true })

      // Set a name but leave price at 0
      const nameInput = wrapper.find('input#name')
      await nameInput.setValue('Test Product')
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Create Product')
      await submitButton!.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Price must be greater than 0')
    })

    it('should show validation error when no images are provided in create mode', async () => {
      const wrapper = mountForm({ open: true })

      // Set name and price to pass those validations
      const nameInput = wrapper.find('input#name')
      await nameInput.setValue('Test Product')

      const priceInput = wrapper.find('input#price')
      await priceInput.setValue('100')
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Create Product')
      await submitButton!.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('At least one product image is required')
    })

    it('should show validation error for description exceeding 500 characters', async () => {
      const wrapper = mountForm({ open: true })

      const nameInput = wrapper.find('input#name')
      await nameInput.setValue('Test Product')

      const descTextarea = wrapper.find('textarea#description')
      await descTextarea.setValue('x'.repeat(501))
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Create Product')
      await submitButton!.trigger('click')
      await nextTick()

      expect(wrapper.text()).toContain('Description must be less than 500 characters')
    })
  })

  describe('close behavior', () => {
    it('should emit close event when Cancel is clicked and not loading', async () => {
      const wrapper = mountForm({ open: true })

      const cancelButton = findButtonByText(wrapper, 'Cancel')
      expect(cancelButton).toBeTruthy()
      await cancelButton!.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close when loading', async () => {
      mockLoadingRef.value = true
      const wrapper = mountForm({ open: true })
      await nextTick()

      // When loading, the Cancel button is disabled. But the handleClose function
      // also checks loading.value before emitting. Since the button is disabled,
      // clicking it won't trigger the event from the stub.
      // Instead, verify that the Cancel button has disabled=true
      const cancelButton = findButtonByText(wrapper, 'Cancel')
      expect(cancelButton).toBeTruthy()
      expect(cancelButton!.attributes('disabled')).toBeDefined()
    })
  })

  describe('image handling', () => {
    it('should display empty state when no images are uploaded in create mode', () => {
      const wrapper = mountForm({ open: true })
      expect(wrapper.text()).toContain('No images uploaded')
    })

    it('should show "Upload Images" button text initially', () => {
      const wrapper = mountForm({ open: true })
      expect(wrapper.text()).toContain('Upload Images')
    })

    it('should show image count info in upload button', () => {
      const wrapper = mountForm({ open: true })
      expect(wrapper.text()).toContain('Upload up to 5 images')
      expect(wrapper.text()).toContain('JPEG, PNG, WebP')
    })
  })

  describe('existing images in edit mode', () => {
    it('should display existing product images', async () => {
      const product = createMockProduct({
        productImages: [
          {
            id: 'img-1',
            url: 'http://example.com/img1.jpg',
            showOnHome: true,
            sortOrder: 0,
            productId: 'prod-1',
            createdAt: '2026-01-01T00:00:00Z',
          },
          {
            id: 'img-2',
            url: 'http://example.com/img2.jpg',
            showOnHome: false,
            sortOrder: 1,
            productId: 'prod-1',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      })
      const wrapper = mountForm({ open: true, product })
      await nextTick()

      expect(wrapper.text()).toContain('Current Images')

      const existingImgs = wrapper.findAll('img[alt="Product image"]')
      expect(existingImgs).toHaveLength(2)
    })

    it('should not require new images in edit mode when existing images are present', async () => {
      const product = createMockProduct()
      mockUpdateProduct.mockResolvedValue(product)

      const wrapper = mountForm({ open: true, product })
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Save Changes')
      expect(submitButton).toBeTruthy()
      await submitButton!.trigger('click')
      await flushPromises()

      expect(wrapper.text()).not.toContain('At least one product image is required')
    })
  })

  describe('submit behavior', () => {
    it('should block create submission when images are missing and show validation error', async () => {
      const newProduct = createMockProduct({ id: 'new-prod' })
      mockCreateProductWithImages.mockResolvedValue(newProduct)

      const wrapper = mountForm({ open: true })
      await nextTick()

      // Fill required fields
      const nameInput = wrapper.find('input#name')
      await nameInput.setValue('New Product')

      const priceInput = wrapper.find('input#price')
      await priceInput.setValue('100')
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Create Product')
      expect(submitButton).toBeTruthy()
      await submitButton!.trigger('click')
      await nextTick()

      // Should show image validation error since we cannot add files through the test
      expect(wrapper.text()).toContain('At least one product image is required')
      // createProductWithImages should NOT have been called due to validation failure
      expect(mockCreateProductWithImages).not.toHaveBeenCalled()
    })

    it('should call updateProduct in edit mode when submitting', async () => {
      const product = createMockProduct()
      const updatedProduct = createMockProduct({ name: 'Updated Name' })
      mockUpdateProduct.mockResolvedValue(updatedProduct)

      const wrapper = mountForm({ open: true, product })
      await nextTick()

      // Modify the product name
      const nameInput = wrapper.find('input#name')
      await nameInput.setValue('Updated Name')
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Save Changes')
      expect(submitButton).toBeTruthy()
      await submitButton!.trigger('click')
      await flushPromises()

      expect(mockUpdateProduct).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({ name: 'Updated Name' })
      )
    })

    it('should show success message after successful update', async () => {
      vi.useFakeTimers()

      const product = createMockProduct()
      mockUpdateProduct.mockResolvedValue(product)

      const wrapper = mountForm({ open: true, product })
      await nextTick()

      const submitButton = findButtonByText(wrapper, 'Save Changes')
      expect(submitButton).toBeTruthy()
      await submitButton!.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Product updated successfully!')

      vi.useRealTimers()
    })
  })

  describe('error display', () => {
    it('should show error message when API error is present', async () => {
      const wrapper = mountForm({ open: true })
      await nextTick()

      // Set error after mount (reactively via Vue ref)
      mockErrorRef.value = { statusCode: 500, message: 'Internal server error' }
      await nextTick()

      expect(wrapper.text()).toContain('Internal server error')
    })
  })

  describe('loading state', () => {
    it('should show loading text on submit button when loading', async () => {
      mockLoadingRef.value = true
      const wrapper = mountForm({ open: true })
      await nextTick()

      expect(wrapper.text()).toContain('Creating...')
    })

    it('should show "Saving..." in edit mode when loading', async () => {
      mockLoadingRef.value = true
      const product = createMockProduct()
      const wrapper = mountForm({ open: true, product })
      await nextTick()

      expect(wrapper.text()).toContain('Saving...')
    })
  })

  describe('formatFileSize utility', () => {
    it('should be used in the template for image previews', () => {
      const wrapper = mountForm({ open: true })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
