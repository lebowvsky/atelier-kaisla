# Backoffice Architecture

## Overview

The Atelier Kaisla Backoffice is a modern admin panel built with Nuxt 4, Vue 3, TypeScript, and shadcn-vue components. It follows functional programming principles and implements Gang of Four design patterns adapted for Vue.js.

## Technology Stack

- **Nuxt 4.3.0**: Meta-framework with SSR support
- **Vue 3.5.27**: Composition API with `<script setup>`
- **TypeScript**: Full type safety with strict mode
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **shadcn-vue**: High-quality UI component library
- **lucide-vue-next**: Icon library

## Project Structure

```
app/
├── components/           # Vue components
│   ├── ui/              # shadcn-vue UI components
│   └── AppSidebar.vue   # Main sidebar navigation
├── composables/         # Reusable composition functions
│   └── useNavigation.ts # Navigation state management
├── layouts/             # Page layouts
│   └── default.vue      # Default layout with sidebar
├── pages/               # File-based routing
│   ├── index.vue        # Home/Dashboard page
│   ├── products.vue     # Products management
│   └── about.vue        # About page
├── types/               # TypeScript type definitions
│   ├── navigation.d.ts  # Navigation types
│   └── global.d.ts      # Global types
└── assets/
    └── css/
        └── main.css     # Tailwind CSS configuration
```

## Design Patterns Applied

### 1. Singleton Pattern
**Location**: `composables/useNavigation.ts`

The navigation composable acts as a singleton, providing centralized navigation state across the application.

```typescript
export function useNavigation() {
  // Single source of truth for navigation
  const route = useRoute()
  const navigationItems = computed<NavigationItem[]>(() => [...])

  return { navigationItems, isActive, currentPageTitle }
}
```

### 2. Observer Pattern
**Location**: `composables/useNavigation.ts`, `layouts/default.vue`

Vue's reactivity system implements the Observer pattern. The navigation state automatically updates all subscribers when the route changes.

```typescript
const { currentPageTitle } = useNavigation()
// Automatically updates when route changes
```

### 3. Factory Pattern
**Location**: `composables/useNavigation.ts`

Navigation items are created using a factory function that produces consistent item structures.

```typescript
const navigationItems = computed<NavigationItem[]>(() => [
  {
    title: 'Home',
    path: '/',
    icon: Home,
    isActive: route.path === '/'
  },
  // Factory creates uniform objects
])
```

### 4. Strategy Pattern
**Location**: `pages/products.vue`

Different strategies for rendering status badges based on product status.

```typescript
const getStatusColor = (status: Product['status']): string => {
  const colorMap: Record<Product['status'], string> = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  }
  return colorMap[status]
}
```

### 5. Template Method Pattern
**Location**: All page components (`pages/*.vue`)

Pages follow a consistent structure template:
1. SEO configuration
2. Data definition
3. Layout wrapper
4. Content sections

```vue
<script setup lang="ts">
// 1. SEO
useSeoMeta({ title: '...', description: '...' })

// 2. Data
const data = ref([...])

// 3. Helper functions
const formatData = (item) => { ... }
</script>

<template>
  <!-- 4. Layout wrapper -->
  <NuxtLayout name="default">
    <!-- Content -->
  </NuxtLayout>
</template>
```

### 6. Composite Pattern
**Location**: `components/AppSidebar.vue`, `layouts/default.vue`

The sidebar and layout compose multiple shadcn-vue components into a cohesive navigation structure.

```vue
<SidebarProvider>
  <AppSidebar>
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>...</SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter>...</SidebarFooter>
  </AppSidebar>
  <SidebarInset>...</SidebarInset>
</SidebarProvider>
```

### 7. Facade Pattern
**Location**: `layouts/default.vue`

The default layout provides a simplified interface for common page structure, hiding the complexity of sidebar management.

```vue
<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header>...</header>
      <main>
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
```

## Responsive Design

### Desktop (≥1024px)
- Sidebar visible at 240px width
- Can be collapsed to icon-only mode (48px)
- Content area adjusts automatically

### Tablet (768px - 1023px)
- Sidebar collapses by default
- Accessible via trigger button
- Overlay when opened

### Mobile (<768px)
- Sidebar as slide-out sheet
- Hamburger menu trigger
- Full-screen navigation overlay

## Type Safety

All components and composables are fully typed with TypeScript:

```typescript
// Strict interface definitions
interface NavigationItem {
  title: string
  path: string
  icon: Component
  badge?: string | number
  isActive?: boolean
}

// Typed composable returns
function useNavigation(): {
  navigationItems: ComputedRef<NavigationItem[]>
  isActive: (path: string) => boolean
  currentPageTitle: ComputedRef<string>
}
```

## Code Conventions

### Composables
- Prefix with `use`: `useNavigation`, `useProducts`
- Return readonly refs for state
- Pure functions for transformations
- Document with JSDoc and pattern annotations

### Components
- Use `<script setup lang="ts">`
- Props with `defineProps<T>()`
- Emits with `defineEmits<T>()`
- Scoped styles when needed

### Pages
- SEO meta tags with `useSeoMeta()`
- Wrap content in `<NuxtLayout>`
- TypeScript interfaces for data structures
- Pattern documentation in comments

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Testing Strategy

### Unit Tests
- Composables: Test pure functions and state management
- Components: Test rendering and user interactions
- Utils: Test data transformations

### Integration Tests
- Page routing and navigation
- Layout rendering
- Component communication

### E2E Tests
- Complete user workflows
- Navigation flows
- Form submissions

## Performance Optimization

- SSR with Nuxt 4 for fast initial load
- Component lazy loading with `defineAsyncComponent`
- Computed properties for derived state
- Tailwind CSS tree-shaking
- Icon tree-shaking with lucide-vue-next

## Future Enhancements

1. **Dark Mode Toggle**: User preference persistence
2. **Real-time Updates**: WebSocket integration for live data
3. **Advanced Filtering**: Complex data table filters
4. **Bulk Operations**: Multi-select actions for products
5. **Analytics Dashboard**: Charts and graphs with recharts
6. **User Management**: Admin roles and permissions
7. **API Integration**: Connect to NestJS backend
8. **Form Validation**: Advanced form handling with vee-validate

## Development Workflow

### Start Development Server
```bash
# With Docker
make dev-up-d
make dev-logs-backoffice

# Without Docker
cd apps/backoffice
npm install
npm run dev
```

### Access Application
- URL: http://localhost:3001
- Hot reload enabled
- TypeScript checking active

### Add New Page
1. Create file in `app/pages/`
2. Use `<NuxtLayout name="default">`
3. Add SEO meta tags
4. Update navigation in `useNavigation.ts`

### Add New Component
1. Create in `app/components/`
2. Use TypeScript with `<script setup>`
3. Document pattern usage
4. Add to components auto-import

## Resources

- [Nuxt 4 Documentation](https://nuxt.com)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [shadcn-vue Components](https://shadcn-vue.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
