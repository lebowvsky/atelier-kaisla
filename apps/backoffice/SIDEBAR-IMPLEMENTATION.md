# Sidebar Implementation Guide

## What Has Been Implemented

A professional backoffice navigation sidebar has been successfully created using shadcn-vue components with the following features:

### ✅ Components Created

1. **AppSidebar.vue** - Main sidebar navigation component
   - Logo/branding section in header
   - Navigation menu with icons
   - User profile section in footer
   - Fully collapsible (icon-only mode)
   - Responsive mobile menu

2. **Layout** - `layouts/default.vue`
   - Sidebar + content area layout
   - Header with page title
   - Hamburger menu trigger
   - Responsive design

3. **Pages**
   - `/` - Home/Dashboard with statistics cards
   - `/products` - Products management with data table
   - `/about` - About page with platform information

4. **Composables**
   - `useNavigation.ts` - Navigation state management
   - Type-safe navigation items
   - Active route detection

5. **Types**
   - `types/navigation.d.ts` - Navigation interfaces
   - `types/global.d.ts` - Global type definitions

### ✅ Design Patterns Applied

- **Singleton Pattern**: `useNavigation()` composable
- **Observer Pattern**: Reactive navigation updates
- **Factory Pattern**: Navigation items creation
- **Strategy Pattern**: Status badge colors in products page
- **Template Method Pattern**: Consistent page structure
- **Composite Pattern**: Sidebar component composition
- **Facade Pattern**: Simplified layout interface

### ✅ Features

- **Responsive Design**
  - Desktop: Full sidebar (collapsible)
  - Tablet: Overlay sidebar
  - Mobile: Sheet/drawer navigation

- **Type Safety**
  - Full TypeScript coverage
  - Strict type checking
  - Interface definitions

- **Accessibility**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support

- **Dark Mode Ready**
  - CSS variables configured
  - Theme switcher can be added easily

## How to Run

### Option 1: With Docker (Recommended)

```bash
# Start all services including backoffice
make dev-up-d

# View backoffice logs
make dev-logs-backoffice

# Access application
open http://localhost:3001
```

### Option 2: Without Docker

```bash
cd apps/backoffice

# Install dependencies
npm install

# Start development server
npm run dev

# Access application
open http://localhost:3001
```

## Project Structure

```
apps/backoffice/
├── app/
│   ├── components/
│   │   ├── ui/                    # shadcn-vue components
│   │   └── AppSidebar.vue         # Main sidebar component
│   ├── composables/
│   │   └── useNavigation.ts       # Navigation state management
│   ├── layouts/
│   │   └── default.vue            # Main layout with sidebar
│   ├── pages/
│   │   ├── index.vue              # Home/Dashboard
│   │   ├── products.vue           # Products management
│   │   └── about.vue              # About page
│   ├── types/
│   │   ├── navigation.d.ts        # Navigation types
│   │   └── global.d.ts            # Global types
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   └── assets/
│       └── css/
│           └── main.css           # Tailwind configuration
├── nuxt.config.ts                 # Nuxt configuration
├── components.json                # shadcn-vue config
├── package.json
└── ARCHITECTURE.md                # Detailed architecture docs
```

## Navigation Items

Current navigation structure:

| Page     | Route       | Icon    | Description              |
|----------|-------------|---------|--------------------------|
| Home     | `/`         | Home    | Dashboard overview       |
| Products | `/products` | Package | Product management       |
| About    | `/about`    | Info    | Platform information     |

## Adding New Navigation Items

1. **Update Navigation Composable**

Edit `app/composables/useNavigation.ts`:

```typescript
import { YourIcon } from 'lucide-vue-next'

const navigationItems = computed<NavigationItem[]>(() => [
  // ... existing items
  {
    title: 'New Page',
    path: '/new-page',
    icon: YourIcon,
    isActive: route.path === '/new-page'
  }
])
```

2. **Create New Page**

Create `app/pages/new-page.vue`:

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'New Page - Atelier Kaisla Backoffice',
  description: 'Description'
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Your content -->
    </div>
  </NuxtLayout>
</template>
```

## Customization

### Change Sidebar Branding

Edit `app/components/AppSidebar.vue`:

```vue
<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
  <span class="text-xl font-bold">AK</span>  <!-- Change this -->
</div>
<div class="grid flex-1 text-left text-sm leading-tight">
  <span class="truncate font-semibold">Atelier Kaisla</span>  <!-- Change this -->
  <span class="truncate text-xs">Backoffice</span>
</div>
```

### Update User Profile

Edit `app/components/AppSidebar.vue` footer section:

```vue
<div class="grid flex-1 text-left text-sm leading-tight">
  <span class="truncate font-semibold">Admin User</span>  <!-- Change name -->
  <span class="truncate text-xs">admin@example.com</span>  <!-- Change email -->
</div>
```

### Customize Colors

Edit `app/assets/css/main.css` to change theme colors:

```css
:root {
  --sidebar: oklch(0.984 0.003 247.858);  /* Sidebar background */
  --sidebar-foreground: oklch(0.129 0.042 264.695);  /* Text color */
  --sidebar-primary: oklch(0.208 0.042 265.755);  /* Active item */
  /* ... */
}
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in docker-compose.dev.yml
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Regenerate types
npx nuxi prepare

# Clean and reinstall
rm -rf node_modules .nuxt
npm install
```

### Sidebar Not Showing

1. Check browser console for errors
2. Verify all shadcn-vue components are installed
3. Check CSS is being loaded (Tailwind)
4. Inspect network tab for failed imports

## Next Steps

Suggested enhancements:

1. **Connect to Backend API**
   - Fetch real product data
   - User authentication
   - API integration

2. **Add More Features**
   - Dark mode toggle
   - User profile dropdown
   - Search functionality
   - Notifications

3. **Expand Navigation**
   - Orders management
   - Customers list
   - Analytics dashboard
   - Settings page

4. **Add Authentication**
   - Login page
   - Protected routes
   - User roles/permissions

5. **Improve Data Tables**
   - Sorting
   - Filtering
   - Pagination
   - Bulk actions

## Resources

- [shadcn-vue Documentation](https://shadcn-vue.com)
- [Nuxt 4 Documentation](https://nuxt.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation

## Support

For issues or questions:
1. Check `ARCHITECTURE.md` for design patterns and structure
2. Review shadcn-vue component documentation
3. Check Nuxt 4 migration guides
4. Verify TypeScript types are generated

---

**Implementation Date**: February 2026
**Framework**: Nuxt 4.3.0 + Vue 3.5.27 + TypeScript
**UI Library**: shadcn-vue (New York style)
**Design System**: Tailwind CSS 4.1.18
