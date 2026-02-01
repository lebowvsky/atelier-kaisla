# Code Snippets - Useful Examples

This document contains useful code snippets for common tasks related to the navbar and navigation.

## Adding a New Navigation Item

### Step 1: Add to Navigation Configuration

Edit `/app/composables/useNavigation.ts`:

```typescript
export const useNavigation = () => {
  const navigationItems = computed<NavigationItem[]>(() => [
    // ... existing items
    {
      label: 'Contact',           // Display text
      path: '/contact',           // Route path
      ariaLabel: 'Contact us'     // Accessibility label
    }
  ])

  return { navigationItems }
}
```

### Step 2: Create the Page

Create `/app/pages/contact.vue`:

```vue
<script setup lang="ts">
useHead({
  title: 'Contact'
})

useSeoMeta({
  title: 'Contact Us | Atelier Kaisla',
  description: 'Get in touch with Atelier Kaisla. We would love to hear from you.',
  ogTitle: 'Contact Us | Atelier Kaisla',
  ogDescription: 'Get in touch with Atelier Kaisla.'
})
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Contact Us</h1>
      <p>Get in touch with us.</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 3rem 1.5rem;
  min-height: calc(100vh - 82px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #000000;
}
</style>
```

## Creating a Dropdown Menu

### Step 1: Extend Navigation Type

Edit `/app/types/navigation.d.ts`:

```typescript
export interface NavigationItem {
  label: string
  path: string
  ariaLabel: string
  children?: NavigationItem[]  // Add this line
}
```

### Step 2: Add Items with Children

Edit `/app/composables/useNavigation.ts`:

```typescript
{
  label: 'Shop',
  path: '/shop',
  ariaLabel: 'Browse our shop',
  children: [
    {
      label: 'Wall Hanging',
      path: '/shop/wall-hanging',
      ariaLabel: 'Browse wall hangings'
    },
    {
      label: 'Rugs',
      path: '/shop/rugs',
      ariaLabel: 'Browse rugs'
    }
  ]
}
```

### Step 3: Update Navbar Component

Add dropdown rendering logic to `AppNavbar.vue`:

```vue
<template v-if="item.children">
  <div class="dropdown">
    <button class="dropdown-toggle">
      {{ item.label }}
      <span class="dropdown-arrow">▼</span>
    </button>
    <div class="dropdown-menu">
      <NuxtLink
        v-for="child in item.children"
        :key="child.path"
        :to="child.path"
        class="dropdown-item"
      >
        {{ child.label }}
      </NuxtLink>
    </div>
  </div>
</template>
```

## Customizing Navbar Styles

### Change Colors

Edit the scoped styles in `AppNavbar.vue`:

```css
/* Background color */
.navbar {
  background-color: #1f2937;  /* Dark gray */
  border-bottom: 1px solid #374151;
}

/* Link colors */
.nav-link {
  color: #f3f4f6;  /* Light gray */
}

.nav-link:hover {
  color: #ffffff;  /* White on hover */
}

/* Active link underline */
.nav-link::after {
  background-color: #10b981;  /* Green accent */
}
```

### Change Logo Size

```css
/* Mobile */
.logo-image {
  height: 40px;  /* Smaller on mobile */
}

/* Desktop */
@media (min-width: 768px) {
  .logo-image {
    height: 70px;  /* Larger on desktop */
  }
}
```

### Change Navbar Height

```css
.navbar__container {
  padding: 1.5rem 1.5rem;  /* Increase vertical padding */
}
```

## Adding a Search Bar to Navbar

### Step 1: Create Search Component

Create `/app/components/AppSearch.vue`:

```vue
<script setup lang="ts">
const searchQuery = ref('')
const router = useRouter()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    })
  }
}
</script>

<template>
  <form class="search-form" @submit.prevent="handleSearch">
    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search..."
      class="search-input"
      aria-label="Search products"
    />
    <button type="submit" class="search-button" aria-label="Submit search">
      🔍
    </button>
  </form>
</template>

<style scoped>
.search-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
}

.search-button {
  padding: 0.5rem 1rem;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### Step 2: Add to Navbar

Edit `AppNavbar.vue`:

```vue
<template>
  <nav class="navbar">
    <div class="navbar__container">
      <div class="navbar__logo">
        <!-- Logo -->
      </div>

      <!-- Add search here -->
      <div class="navbar__search">
        <AppSearch />
      </div>

      <div class="navbar__menu">
        <!-- Navigation items -->
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar__container {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}
</style>
```

## Adding User Authentication Menu

### Step 1: Create Auth Composable

Create `/app/composables/useAuth.ts`:

```typescript
export const useAuth = () => {
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)

  const login = async (credentials: LoginCredentials) => {
    // Login logic
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
}
```

### Step 2: Add User Menu to Navbar

Edit `AppNavbar.vue`:

```vue
<script setup lang="ts">
const { isAuthenticated, user, logout } = useAuth()
</script>

<template>
  <nav class="navbar">
    <div class="navbar__container">
      <!-- Logo and navigation -->

      <!-- User menu -->
      <div class="navbar__user">
        <template v-if="isAuthenticated">
          <div class="user-menu">
            <button class="user-button">
              {{ user?.name }}
            </button>
            <div class="user-dropdown">
              <NuxtLink to="/profile">Profile</NuxtLink>
              <NuxtLink to="/orders">Orders</NuxtLink>
              <button @click="logout">Logout</button>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="login-button">
            Login
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
```

## Filtering Navigation Items

Using the utility functions from `navigation.ts`:

```typescript
import { filterNavigationItems } from '~/utils/navigation'

// Only show items that are public
const publicItems = filterNavigationItems(
  navigationItems.value,
  (item) => !item.requiresAuth
)

// Only show admin items
const adminItems = filterNavigationItems(
  navigationItems.value,
  (item) => item.adminOnly === true
)
```

## Creating Breadcrumbs

```vue
<script setup lang="ts">
import { getBreadcrumbTrail } from '~/utils/navigation'

const route = useRoute()
const { navigationItems } = useNavigation()

const breadcrumbs = computed(() =>
  getBreadcrumbTrail(navigationItems.value, route.path)
)
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li v-for="(item, index) in breadcrumbs" :key="item.path">
        <NuxtLink :to="item.path">
          {{ item.label }}
        </NuxtLink>
        <span v-if="index < breadcrumbs.length - 1" class="separator">
          /
        </span>
      </li>
    </ol>
  </nav>
</template>
```

## Adding Icons to Navigation

### Using Emoji

```typescript
{
  label: '🏠 Home',
  path: '/',
  ariaLabel: 'Navigate to home page'
}
```

### Using Icon Library (e.g., Heroicons)

```bash
npm install @heroicons/vue
```

```vue
<script setup lang="ts">
import { HomeIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <NuxtLink to="/" class="nav-link">
    <HomeIcon class="icon" />
    <span>Home</span>
  </NuxtLink>
</template>

<style scoped>
.icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}
</style>
```

## Making Navbar Transparent

For pages with hero sections:

```vue
<!-- In your page -->
<script setup lang="ts">
// Tell layout to use transparent navbar
provide('transparentNavbar', true)
</script>

<!-- In default.vue layout -->
<script setup lang="ts">
const isTransparent = inject('transparentNavbar', false)
</script>

<template>
  <AppNavbar :transparent="isTransparent" />
</template>

<!-- In AppNavbar.vue -->
<script setup lang="ts">
defineProps<{
  transparent?: boolean
}>()
</script>

<template>
  <nav
    class="navbar"
    :class="{ 'navbar--transparent': transparent }"
  >
    <!-- Content -->
  </nav>
</template>

<style scoped>
.navbar--transparent {
  background-color: transparent;
  border-bottom: none;
}

.navbar--transparent .nav-link {
  color: #ffffff;
}
</style>
```

## Animating Navbar on Scroll

```vue
<script setup lang="ts">
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="navbar"
    :class="{ 'navbar--scrolled': isScrolled }"
  >
    <!-- Content -->
  </nav>
</template>

<style scoped>
.navbar {
  transition: all 0.3s ease;
  padding: 1.5rem;
}

.navbar--scrolled {
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

## Multi-Language Navigation

```typescript
// useNavigation.ts
export const useNavigation = () => {
  const { locale } = useI18n()

  const navigationItems = computed<NavigationItem[]>(() => {
    const items = {
      en: [
        { label: 'Home', path: '/', ariaLabel: 'Navigate to home page' },
        { label: 'About', path: '/about', ariaLabel: 'Learn more about us' }
      ],
      fr: [
        { label: 'Accueil', path: '/', ariaLabel: 'Aller à l\'accueil' },
        { label: 'À propos', path: '/about', ariaLabel: 'En savoir plus' }
      ]
    }

    return items[locale.value] || items.en
  })

  return { navigationItems }
}
```

## Adding a Cart Icon

```vue
<script setup lang="ts">
const cartCount = ref(3) // From cart store/composable
</script>

<template>
  <NuxtLink to="/cart" class="cart-link" aria-label="View shopping cart">
    🛒
    <span v-if="cartCount > 0" class="cart-badge">
      {{ cartCount }}
    </span>
  </NuxtLink>
</template>

<style scoped>
.cart-link {
  position: relative;
  font-size: 1.5rem;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
```

## Tips

1. Always update types when modifying navigation structure
2. Keep navigation items in composable for consistency
3. Use utility functions for complex navigation operations
4. Test mobile menu after any navbar changes
5. Verify accessibility after modifications
6. Update SEO meta tags when adding new pages

## Common Patterns

### Active Link Styling
Already implemented in `AppNavbar.vue` via `isActiveRoute()` and `getNavItemClasses()`

### Conditional Navigation Items
```typescript
const navigationItems = computed(() => {
  const items = [/* base items */]

  if (isAdmin.value) {
    items.push({
      label: 'Admin',
      path: '/admin',
      ariaLabel: 'Access admin panel'
    })
  }

  return items
})
```

### External Links
```vue
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  class="nav-link"
>
  External Link ↗
</a>
```
