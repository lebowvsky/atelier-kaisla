<!--
  @pattern Strategy Pattern + Template Method Pattern
  @purpose Products management page with data table
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-vue-next'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'Products - Atelier Kaisla Backoffice',
  description: 'Manage products for Atelier Kaisla e-commerce platform'
})

/**
 * Product interface
 * Pattern: Value Object for data representation
 */
interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'draft' | 'archived'
}

/**
 * Mock product data
 * TODO: Replace with API call
 */
const products = ref<Product[]>([
  {
    id: 1,
    name: 'Handwoven Wall Hanging - Desert',
    category: 'Wall Hanging',
    price: 129.99,
    stock: 5,
    status: 'active'
  },
  {
    id: 2,
    name: 'Macramé Wall Art - Ocean',
    category: 'Wall Hanging',
    price: 89.99,
    stock: 12,
    status: 'active'
  },
  {
    id: 3,
    name: 'Bohemian Rug - Sunset',
    category: 'Rugs',
    price: 299.99,
    stock: 3,
    status: 'active'
  },
  {
    id: 4,
    name: 'Minimalist Wall Hanging',
    category: 'Wall Hanging',
    price: 159.99,
    stock: 0,
    status: 'draft'
  },
  {
    id: 5,
    name: 'Vintage Rug Collection',
    category: 'Rugs',
    price: 449.99,
    stock: 2,
    status: 'active'
  }
])

/**
 * Get status badge color
 * Pattern: Strategy Pattern for status styling
 */
const getStatusColor = (status: Product['status']): string => {
  const colorMap: Record<Product['status'], string> = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  }
  return colorMap[status]
}

/**
 * Format price
 * Pure function for currency formatting
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">
            Products
          </h2>
          <p class="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <!-- Search and Filters -->
      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            class="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
        </div>
      </div>

      <!-- Products Table -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Product
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Category
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Price
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Stock
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
                class="border-b transition-colors hover:bg-muted/50"
              >
                <td class="p-4 align-middle">
                  <div class="font-medium">{{ product.name }}</div>
                </td>
                <td class="p-4 align-middle">
                  {{ product.category }}
                </td>
                <td class="p-4 align-middle">
                  {{ formatPrice(product.price) }}
                </td>
                <td class="p-4 align-middle">
                  <span :class="product.stock === 0 ? 'text-red-600 font-medium' : ''">
                    {{ product.stock }}
                  </span>
                </td>
                <td class="p-4 align-middle">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="getStatusColor(product.status)"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="p-4 align-middle">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t px-4 py-4">
          <div class="text-sm text-muted-foreground">
            Showing <strong>1-5</strong> of <strong>5</strong> products
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
