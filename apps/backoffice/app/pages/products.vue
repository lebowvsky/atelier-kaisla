<!--
  @pattern Facade + Strategy + Observer Patterns
  @purpose Professional product management page with real API integration

  Patterns Applied:
  - Facade: useProducts composable simplifies complex API operations
  - Strategy: Different filtering and sorting strategies
  - Observer: Reactive state updates from API
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import ProductForm from '@/components/products/ProductForm.vue'
import { Plus, Search, Eye, Pencil, Trash2, Filter, RefreshCw } from 'lucide-vue-next'
import type { Product, ProductCategory, ProductStatus } from '@/types/product'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'Products - Atelier Kaisla Backoffice',
  description: 'Manage products for Atelier Kaisla e-commerce platform',
})

/**
 * Pattern: Facade Pattern - Centralized data management
 */
const {
  products,
  loading,
  error,
  hasProducts,
  hasError,
  fetchProducts,
  deleteProduct,
  clearError,
} = useProducts()

/**
 * Pattern: Pure utility functions for formatting
 */
const {
  formatPrice,
  formatCategory,
  formatStatus,
  getStatusColor,
  getStockColor,
} = useProductFormatting()

/**
 * Filter state (Strategy Pattern)
 */
const filters = ref({
  search: '',
  category: '' as ProductCategory | '',
  status: '' as ProductStatus | '',
})

/**
 * Sort state
 */
const sortBy = ref<'name' | 'price' | 'createdAt'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

/**
 * Computed: Filtered and sorted products
 * Pattern: Strategy Pattern for filtering/sorting
 */
const filteredProducts = computed(() => {
  let result = [...products.value]

  // Filter by search term
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.materials?.toLowerCase().includes(search)
    )
  }

  // Filter by category
  if (filters.value.category) {
    result = result.filter((p) => p.category === filters.value.category)
  }

  // Filter by status
  if (filters.value.status) {
    result = result.filter((p) => p.status === filters.value.status)
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'price':
        comparison = a.price - b.price
        break
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

/**
 * Computed: Statistics
 */
const totalProducts = computed(() => filteredProducts.value.length)
const lowStockProducts = computed(
  () => filteredProducts.value.filter((p) => p.stockQuantity <= 5).length
)
const draftProducts = computed(
  () => filteredProducts.value.filter((p) => p.status === 'draft').length
)

/**
 * Load products on mount (client-side) and during SSR
 * Using onMounted for client-side and immediate call for SSR
 */
if (import.meta.server) {
  // Execute during SSR
  await fetchProducts()
} else {
  // Execute on client mount
  onMounted(async () => {
    await fetchProducts()
  })
}

/**
 * Refresh products list
 */
const refreshProducts = async () => {
  await fetchProducts()
}

/**
 * Handle product deletion
 */
const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) {
    return
  }

  const success = await deleteProduct(id)
  if (success) {
    // Success feedback (could use toast notification)
    console.log('Product deleted successfully')
  }
}

/**
 * Clear all filters
 */
const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: '',
  }
}

/**
 * Toggle sort order
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

/**
 * Get first image URL or placeholder
 */
const getProductImage = (product: Product): string => {
  if (product.productImages && product.productImages.length > 0) {
    return product.productImages[0].url
  }
  return 'https://placehold.co/60x60/e2e8f0/64748b?text=No+Image'
}

/**
 * Sheet state for product form (create mode)
 */
const isFormOpen = ref(false)

/**
 * Handle form success (create mode)
 */
const handleFormSuccess = async () => {
  isFormOpen.value = false
  await refreshProducts()
}

/**
 * Edit mode state
 */
const editingProduct = ref<Product | null>(null)
const isEditFormOpen = ref(false)

/**
 * Handle edit button click
 */
const handleEdit = async (id: string) => {
  const { fetchProductById } = useProducts()
  const product = await fetchProductById(id)
  if (product) {
    editingProduct.value = product
    isEditFormOpen.value = true
  }
}

/**
 * Handle edit form success
 */
const handleEditFormSuccess = async () => {
  isEditFormOpen.value = false
  editingProduct.value = null
  await refreshProducts()
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Products</h2>
          <p class="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="refreshProducts"
            :disabled="loading"
          >
            <RefreshCw
              class="mr-2 h-4 w-4"
              :class="{ 'animate-spin': loading }"
            />
            Refresh
          </Button>
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
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Total Products
          </div>
          <div class="text-2xl font-bold">{{ totalProducts }}</div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Low Stock Alert
          </div>
          <div class="text-2xl font-bold text-orange-600">
            {{ lowStockProducts }}
          </div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Draft Products
          </div>
          <div class="text-2xl font-bold text-yellow-600">
            {{ draftProducts }}
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="hasError && error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">Error Loading Products</h3>
            <p class="text-sm">{{ error.message }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="clearError">
            Dismiss
          </Button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-sm">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search products..."
              class="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <!-- Category Filter -->
          <select
            v-model="filters.category"
            class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Categories</option>
            <option value="wall-hanging">Wall Hanging</option>
            <option value="rug">Rug</option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="filters.status"
            class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
          </select>

          <!-- Sort Options -->
          <select
            v-model="sortBy"
            class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>

          <Button variant="outline" size="sm" @click="toggleSortOrder">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </Button>

          <!-- Clear Filters -->
          <Button
            v-if="filters.search || filters.category || filters.status"
            variant="ghost"
            size="sm"
            @click="clearFilters"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex items-center justify-center p-12"
        >
          <div class="text-center">
            <RefreshCw class="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">
              Loading products...
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!hasProducts"
          class="flex flex-col items-center justify-center p-12"
        >
          <div class="text-center">
            <h3 class="text-lg font-semibold">No products found</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Get started by creating your first product
            </p>
            <Sheet v-model:open="isFormOpen">
              <SheetTrigger as-child>
                <Button class="mt-4">
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
          </div>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Image
                </th>
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Product
                </th>
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Category
                </th>
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Price
                </th>
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Stock
                </th>
                <th
                  class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  Status
                </th>
                <th
                  class="h-12 px-4 text-right align-middle font-medium text-muted-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-b transition-colors hover:bg-muted/50"
              >
                <!-- Image -->
                <td class="p-4 align-middle">
                  <img
                    :src="getProductImage(product)"
                    :alt="product.name"
                    class="h-12 w-12 rounded-md object-cover"
                  />
                </td>

                <!-- Product Name & Description -->
                <td class="p-4 align-middle">
                  <div class="font-medium">{{ product.name }}</div>
                  <div
                    v-if="product.description"
                    class="text-sm text-muted-foreground line-clamp-1"
                  >
                    {{ product.description }}
                  </div>
                </td>

                <!-- Category -->
                <td class="p-4 align-middle">
                  {{ formatCategory(product.category) }}
                </td>

                <!-- Price -->
                <td class="p-4 align-middle font-medium">
                  {{ formatPrice(product.price) }}
                </td>

                <!-- Stock -->
                <td class="p-4 align-middle">
                  <span :class="getStockColor(product.stockQuantity)">
                    {{ product.stockQuantity }}
                  </span>
                </td>

                <!-- Status -->
                <td class="p-4 align-middle">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="getStatusColor(product.status)"
                  >
                    {{ formatStatus(product.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="p-4 align-middle text-right">
                  <div class="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" title="View details">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit product" @click="handleEdit(product.id)">
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete product"
                      @click="handleDelete(product.id, product.name)"
                    >
                      <Trash2 class="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div
          v-if="hasProducts"
          class="flex items-center justify-between border-t px-4 py-4"
        >
          <div class="text-sm text-muted-foreground">
            Showing <strong>{{ filteredProducts.length }}</strong> of
            <strong>{{ products.length }}</strong> products
          </div>
          <div class="text-xs text-muted-foreground">
            <!-- Pagination controls can be added here when backend supports it -->
          </div>
        </div>
      </div>
      <!-- Edit Product Sheet -->
      <Sheet v-model:open="isEditFormOpen">
        <SheetContent class="w-full sm:max-w-2xl">
          <ProductForm
            :open="isEditFormOpen"
            :product="editingProduct ?? undefined"
            @close="isEditFormOpen = false; editingProduct = null"
            @success="handleEditFormSuccess"
          />
        </SheetContent>
      </Sheet>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Line clamp utility for descriptions */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
