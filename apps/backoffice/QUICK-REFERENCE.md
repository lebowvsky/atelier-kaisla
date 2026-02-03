# Quick Reference Guide

## 🎯 File Locations

### Components
```
app/components/AppSidebar.vue        ← Main sidebar navigation
```

### Layouts
```
app/layouts/default.vue              ← Default layout with sidebar
```

### Pages
```
app/pages/index.vue                  ← Home/Dashboard
app/pages/products.vue               ← Products management
app/pages/about.vue                  ← About page
```

### Composables
```
app/composables/useNavigation.ts     ← Navigation state management
```

### Types
```
app/types/navigation.d.ts            ← Navigation interfaces
app/types/global.d.ts                ← Global type definitions
```

## 🚀 Commands

### Development
```bash
npm run dev                          # Start dev server (port 3001)
npm run build                        # Build for production
npm run preview                      # Preview production build
```

### Docker
```bash
make dev-up-d                        # Start all services
make dev-logs-backoffice             # View backoffice logs
make dev-down                        # Stop all services
```

### Utilities
```bash
npx nuxi prepare                     # Regenerate types
npm install                          # Install dependencies
```

## 📝 Common Tasks

### Add Navigation Item
1. Edit `app/composables/useNavigation.ts`
2. Import icon: `import { YourIcon } from 'lucide-vue-next'`
3. Add item to `navigationItems` array
4. Create page in `app/pages/`

### Create New Page
```vue
<!-- app/pages/your-page.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Your Page - Backoffice',
  description: 'Description'
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Content -->
    </div>
  </NuxtLayout>
</template>
```

### Update Branding
Edit `app/components/AppSidebar.vue`:
- Line ~20: Logo/brand text
- Line ~55: User profile info

### Change Colors
Edit `app/assets/css/main.css`:
- Lines 44-77: Light mode colors
- Lines 79-111: Dark mode colors

## 🎨 Available shadcn-vue Components

Already installed:
- Sidebar (with all sub-components)
- Button
- Input
- Separator
- Sheet (mobile menu)
- Tooltip
- Skeleton

Add more:
```bash
npx shadcn-vue@latest add [component-name]
```

Popular additions:
- `npx shadcn-vue@latest add dropdown-menu`
- `npx shadcn-vue@latest add dialog`
- `npx shadcn-vue@latest add table`
- `npx shadcn-vue@latest add card`

## 🔍 Useful Patterns

### Fetch Data
```typescript
const { data, pending, error } = await useFetch('/api/endpoint')
```

### Computed Property
```typescript
const filteredItems = computed(() => 
  items.value.filter(item => item.active)
)
```

### Watch Route
```typescript
const route = useRoute()
watch(() => route.path, (newPath) => {
  console.log('Route changed to:', newPath)
})
```

### Composable Pattern
```typescript
export function useYourFeature() {
  const state = ref(initialValue)
  
  const action = () => {
    // Logic here
  }
  
  return { state: readonly(state), action }
}
```

## 📦 Import Patterns

### Components (Auto-imported)
```vue
<template>
  <Button>Click me</Button>
  <AppSidebar />
</template>
```

### Icons
```typescript
import { Home, Settings, User } from 'lucide-vue-next'
```

### Composables (Auto-imported)
```typescript
const { navigationItems } = useNavigation()
```

### UI Components
```typescript
import { Button } from '@/components/ui/button'
```

## 🎭 Design Patterns

### Singleton (Navigation)
```typescript
// Always returns same instance
const { navigationItems } = useNavigation()
```

### Factory (Create Items)
```typescript
const createNavItem = (title, path, icon) => ({
  title, path, icon,
  isActive: route.path === path
})
```

### Strategy (Conditional Logic)
```typescript
const getColor = (status) => {
  const colorMap = {
    active: 'green',
    draft: 'yellow',
    archived: 'gray'
  }
  return colorMap[status]
}
```

## 🔐 TypeScript

### Define Interface
```typescript
interface MyData {
  id: number
  name: string
  optional?: boolean
}
```

### Type Props
```typescript
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()
```

### Type Emits
```typescript
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()
```

## 🎨 Tailwind Classes

### Layout
```html
<div class="flex items-center justify-between">
<div class="grid grid-cols-3 gap-4">
<div class="space-y-4">
```

### Spacing
```html
<div class="p-4">           <!-- padding 16px -->
<div class="m-6">           <!-- margin 24px -->
<div class="gap-2">         <!-- grid/flex gap 8px -->
```

### Responsive
```html
<div class="md:flex lg:grid xl:grid-cols-4">
```

### Colors
```html
<div class="bg-primary text-primary-foreground">
<div class="border-border">
<div class="text-muted-foreground">
```

## 📱 Responsive Breakpoints

```
sm:   640px    (Tailwind)
md:   768px    (Tablet)
lg:   1024px   (Desktop)
xl:   1280px   (Large desktop)
2xl:  1536px   (Extra large)
```

## 🐛 Debug Tips

### Check Route
```vue
<template>
  <div>Current: {{ $route.path }}</div>
</template>
```

### Console Log
```typescript
console.log('Debug:', { data, error, pending })
```

### Vue DevTools
- Install Vue DevTools browser extension
- Inspect component state
- Track route changes

## 📚 Documentation Files

```
README-SIDEBAR.md              ← Quick start (you are here)
ARCHITECTURE.md                ← Full architecture docs
SIDEBAR-IMPLEMENTATION.md      ← Implementation guide
VISUAL-GUIDE.md                ← Visual reference
CHECKLIST.md                   ← Implementation checklist
IMPLEMENTATION-SUMMARY.md      ← Summary & metrics
QUICK-REFERENCE.md             ← This file
```

## 🔗 Useful Links

- [Nuxt 4 Docs](https://nuxt.com)
- [Vue 3 Docs](https://vuejs.org)
- [shadcn-vue](https://shadcn-vue.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## ⚡ Performance Tips

1. Use `computed()` for derived state
2. Lazy load heavy components with `defineAsyncComponent`
3. Use `shallowRef()` for large data structures
4. Avoid unnecessary watchers
5. Use `v-once` for static content

## 🎯 Best Practices

1. Always define TypeScript types
2. Use composables for reusable logic
3. Keep components small and focused
4. Document design patterns in comments
5. Test responsive design on real devices
6. Use semantic HTML elements
7. Add ARIA labels for accessibility

## 🆘 Common Errors

### "Cannot find module '@/...'"
```bash
npx nuxi prepare
```

### "Port 3001 in use"
```bash
lsof -i :3001
kill -9 <PID>
```

### "Type error in component"
```bash
# Check tsconfig.json paths
# Regenerate types
npx nuxi prepare
```

### "CSS not loading"
```bash
# Check main.css import in nuxt.config.ts
# Verify Tailwind plugin configured
```

## 🎁 Bonus Features

### Add Dark Mode Toggle
```bash
npm install @vueuse/core
```

```vue
<script setup>
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
```

### Add Loading State
```typescript
const loading = ref(false)
const fetchData = async () => {
  loading.value = true
  try {
    await api.fetch()
  } finally {
    loading.value = false
  }
}
```

### Add Toast Notifications
```bash
npx shadcn-vue@latest add toast
```

---

**Quick tip**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) in most code editors to quickly find and open files.

**Happy coding!** 🚀
