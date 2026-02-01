# Architecture Overview - Navbar Implementation

## Component Hierarchy

```
app.vue (Root)
├── NuxtRouteAnnouncer (Accessibility)
└── NuxtLayout (Layout Wrapper)
    └── layouts/default.vue
        ├── <header>
        │   └── AppNavbar.vue
        │       ├── Logo (NuxtLink)
        │       ├── Desktop Navigation
        │       │   └── NavigationItems (map)
        │       └── Mobile Navigation
        │           ├── Hamburger Toggle
        │           └── Mobile Menu (conditional)
        └── <main>
            └── NuxtPage (Current Route)
                ├── pages/index.vue
                ├── pages/wall-hanging.vue
                ├── pages/rugs.vue
                ├── pages/about.vue
                └── pages/blog.vue
```

## Data Flow

```
useNavigation composable
    ↓
navigationItems (computed)
    ↓
AppNavbar component
    ↓
├── Desktop Navigation Items
└── Mobile Navigation Items
```

## Type System

```
navigation.d.ts (Type Definitions)
    ↓
NavigationItem interface
    ↓
├── useNavigation.ts (returns NavigationItem[])
├── AppNavbar.vue (consumes NavigationItem[])
└── navigation.ts utilities (operates on NavigationItem[])
```

## Design Pattern Implementation

### 1. Strategy Pattern

```
useNavigation composable
    │
    ├── Current: Main navigation strategy
    │
    └── Future extensions:
        ├── useAuthenticatedNavigation (logged-in users)
        ├── useAdminNavigation (admin users)
        └── useLocalizedNavigation (multi-language)
```

**Benefits**:
- Easy to swap navigation strategies
- Centralized configuration
- No component modification needed

### 2. Observer Pattern

```
Reactive State (isMobileMenuOpen)
    │
    ├── Observed by: Mobile menu visibility
    ├── Observed by: Hamburger icon state
    └── Observed by: Animation triggers

Actions:
    ├── toggleMobileMenu() → updates state
    └── closeMobileMenu() → updates state
```

**Benefits**:
- Automatic UI updates
- Decoupled state and presentation
- No manual DOM manipulation

### 3. Composition Pattern

```
AppNavbar.vue
    │
    ├── Composables
    │   ├── useNavigation() → navigation items
    │   ├── useRoute() → current route
    │   └── useSeoMeta() → SEO tags
    │
    ├── Reactive State
    │   └── isMobileMenuOpen (ref)
    │
    └── Pure Functions
        ├── isActiveRoute()
        ├── getNavItemClasses()
        ├── toggleMobileMenu()
        └── closeMobileMenu()
```

**Benefits**:
- Reusable logic
- Testable functions
- Clear separation of concerns

### 4. Functional Programming

#### Pure Functions
```typescript
// Input → Output (always the same)
isActiveRoute(path: string): boolean
getNavItemClasses(item: NavigationItem): string
findNavigationItemByPath(items: NavigationItem[], path: string): NavigationItem | undefined
```

#### Higher-Order Functions
```typescript
// Functions that operate on other functions
filterNavigationItems(items, predicate)
transformNavigationItems(items, transform)
```

#### Function Composition
```typescript
// Small functions combined to create complex behavior
const getActiveClass = (item) =>
  pipe(
    isActiveRoute,
    toClassName
  )(item.path)
```

**Benefits**:
- Predictable behavior
- Easy to test
- No side effects
- Reusable utilities

## File Organization

```
apps/frontend/
│
├── app/
│   ├── app.vue                 # Root component
│   │
│   ├── types/                  # TypeScript definitions
│   │   └── navigation.d.ts     # Navigation types
│   │
│   ├── composables/            # Reusable logic
│   │   └── useNavigation.ts    # Navigation config
│   │
│   ├── utils/                  # Pure utility functions
│   │   └── navigation.ts       # Navigation helpers
│   │
│   ├── components/             # Vue components
│   │   └── AppNavbar.vue       # Navbar component
│   │
│   ├── layouts/                # Page layouts
│   │   └── default.vue         # Default layout
│   │
│   └── pages/                  # Route pages
│       ├── index.vue           # /
│       ├── wall-hanging.vue    # /wall-hanging
│       ├── rugs.vue            # /rugs
│       ├── about.vue           # /about
│       └── blog.vue            # /blog
│
└── public/                     # Static assets
    └── logo-kaisla.png         # Logo image
```

## State Management

### Component State (Local)
```typescript
// AppNavbar.vue
const isMobileMenuOpen = ref(false)  // Local state

// Functions that modify state
const toggleMobileMenu = () => { ... }
const closeMobileMenu = () => { ... }
```

### Computed State (Derived)
```typescript
// useNavigation.ts
const navigationItems = computed(() => [...])  // Derived from config

// AppNavbar.vue
const getNavItemClasses = (item) => { ... }  // Derived from route
```

### No Global State
- Navigation configuration is in composable
- No Pinia/Vuex needed for simple navbar
- Scales to global state when needed

## Routing Strategy

```
Nuxt File-Based Routing
    │
    ├── pages/index.vue         → /
    ├── pages/wall-hanging.vue  → /wall-hanging
    ├── pages/rugs.vue          → /rugs
    ├── pages/about.vue         → /about
    └── pages/blog.vue          → /blog

Navigation:
    NuxtLink components → Client-side routing
    No page reloads → SPA behavior
    SSR compatible → SEO friendly
```

## Styling Strategy

### Scoped Styles
```vue
<!-- AppNavbar.vue -->
<style scoped>
/* Styles only apply to this component */
.navbar { ... }
.nav-link { ... }
</style>
```

### Global Styles
```vue
<!-- app.vue -->
<style>
/* Global reset and typography */
* { box-sizing: border-box; }
html { font-family: ...; }
</style>
```

### Responsive Breakpoints
```css
/* Mobile First */
.navbar { ... }  /* Base: Mobile */

/* Tablet and Desktop */
@media (min-width: 768px) {
  .navbar { ... }  /* Enhanced */
}

/* Large Desktop */
@media (min-width: 1024px) {
  .navbar { ... }  /* Further enhanced */
}
```

## SEO Architecture

```
Layout Level (default.vue)
    ↓
useHead() - Global config
    ├── htmlAttrs: { lang: 'en' }
    ├── titleTemplate: '%s | Atelier Kaisla'
    └── Basic meta tags

Page Level (index.vue, etc.)
    ↓
useSeoMeta() - Page-specific
    ├── title
    ├── description
    ├── ogTitle, ogDescription, ogImage
    └── twitterCard, etc.

Result:
    Complete SEO meta tags for each page
```

## Accessibility Architecture

```
Semantic HTML
    ├── <nav role="navigation">
    ├── <header>
    ├── <main>
    └── <ul role="menubar">

ARIA Attributes
    ├── aria-label (descriptive labels)
    ├── aria-current (active page)
    ├── aria-expanded (menu state)
    └── aria-controls (menu target)

Keyboard Navigation
    ├── Tab (focus navigation)
    ├── Enter (activate links)
    └── Focus indicators (visible outlines)

Screen Reader Support
    └── NuxtRouteAnnouncer (route changes)
```

## Performance Considerations

### Code Splitting
- Nuxt automatically splits routes
- Each page is a separate chunk
- Lazy loading for better performance

### SSR Optimization
- Server-rendered HTML for initial load
- Client-side hydration
- No client-only dependencies in navbar

### Asset Optimization
- Logo with explicit width/height (no layout shift)
- Minimal CSS (scoped styles)
- No external dependencies

## Extensibility Points

### Adding New Routes
1. Create page in `/app/pages/`
2. Add item to `useNavigation.ts`
3. No component changes needed

### Adding Submenus
1. Extend `NavigationItem` type with `children` property
2. Update `AppNavbar.vue` to render nested items
3. Add dropdown styles and logic

### Adding User Menu
1. Create `useAuth()` composable
2. Add conditional rendering in `AppNavbar.vue`
3. Create user menu component

### Adding Search
1. Create search component
2. Add to navbar layout
3. Implement search logic

## Testing Strategy

### Unit Tests (Future)
```typescript
// useNavigation.spec.ts
test('returns navigation items', () => {
  const { navigationItems } = useNavigation()
  expect(navigationItems.value).toHaveLength(5)
})

// navigation.spec.ts
test('isPathActive matches correctly', () => {
  expect(isPathActive('/', '/')).toBe(true)
  expect(isPathActive('/about', '/about')).toBe(true)
})
```

### Component Tests (Future)
```typescript
// AppNavbar.spec.ts
test('renders all navigation items', () => {
  const wrapper = mount(AppNavbar)
  expect(wrapper.findAll('.nav-link')).toHaveLength(5)
})

test('toggles mobile menu', async () => {
  const wrapper = mount(AppNavbar)
  await wrapper.find('.navbar__toggle').trigger('click')
  expect(wrapper.find('.navbar__menu--mobile').exists()).toBe(true)
})
```

### E2E Tests (Future)
```typescript
// navbar.e2e.ts
test('navigates between pages', async () => {
  await page.goto('/')
  await page.click('text=About')
  expect(page.url()).toContain('/about')
})
```

## Maintenance Notes

### Adding Navigation Items
Edit: `/app/composables/useNavigation.ts`

### Styling Changes
Edit: `/app/components/AppNavbar.vue` (scoped styles)

### Type Updates
Edit: `/app/types/navigation.d.ts`

### Layout Changes
Edit: `/app/layouts/default.vue`

### SEO Updates
Edit: Individual page files (useSeoMeta)
