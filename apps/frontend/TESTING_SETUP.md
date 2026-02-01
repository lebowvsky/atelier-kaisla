# Testing Setup Guide for Frontend

## Overview

This guide explains how to set up testing for the Nuxt 4 frontend application using Vitest (recommended for Vue 3 + Nuxt 4).

## Prerequisites

The SocialShare component already has test files created in:
- `/apps/frontend/app/composables/__tests__/useSocialData.spec.ts`

## Quick Setup

### 1. Install Testing Dependencies

```bash
cd apps/frontend
npm install -D vitest @vitest/ui happy-dom @vue/test-utils
```

**Package purposes:**
- `vitest`: Fast test runner powered by Vite
- `@vitest/ui`: Optional UI for test visualization
- `happy-dom`: Lightweight DOM implementation for tests
- `@vue/test-utils`: Official Vue testing utilities

### 2. Create Vitest Configuration

Create `vitest.config.ts` in `/apps/frontend/`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
```

### 3. Update package.json Scripts

Add these test scripts to `/apps/frontend/package.json`:

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 4. Create Test Setup File (Optional)

Create `/apps/frontend/app/test/setup.ts`:

```typescript
import { vi } from 'vitest'

// Mock Nuxt auto-imports if needed
global.useHead = vi.fn()
global.useSeoMeta = vi.fn()
global.useRoute = vi.fn()
global.useRouter = vi.fn()

// Add custom matchers or global test setup here
```

Update `vitest.config.ts` to include setup:

```typescript
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./app/test/setup.ts'], // Add this line
    // ... rest of config
  },
})
```

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test useSocialData.spec.ts
```

### Watch Mode (re-run on file changes)
```bash
npm run test -- --watch
```

### UI Mode (visual test runner)
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

## Testing the SocialShare Component

### Current Test File
Location: `/apps/frontend/app/composables/__tests__/useSocialData.spec.ts`

Run with:
```bash
npm run test -- useSocialData
```

### Expected Test Results

✅ All tests should pass:
- Social Links Data (8 tests)
- Contact Information (4 tests)
- Configuration (1 test)
- URL Validation (4 tests)
- Platform Colors (3 tests)
- API Integration (3 tests)

**Total: ~23 tests**

## Creating Additional Tests

### Testing Vue Components

Create `/apps/frontend/app/components/__tests__/SocialShare.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialShare from '../SocialShare.vue'

describe('SocialShare Component', () => {
  it('should render social links', () => {
    const wrapper = mount(SocialShare)

    const links = wrapper.findAll('.social-share__link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should render with dark theme by default', () => {
    const wrapper = mount(SocialShare)

    expect(wrapper.classes()).toContain('social-share--dark')
  })

  it('should render with light theme when prop is set', () => {
    const wrapper = mount(SocialShare, {
      props: { theme: 'light' }
    })

    expect(wrapper.classes()).toContain('social-share--light')
  })

  it('should render contact email', () => {
    const wrapper = mount(SocialShare)

    const email = wrapper.find('.social-share__email')
    expect(email.text()).toContain('eloise@atelierkaisla.com')
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(SocialShare)

    const links = wrapper.findAll('.social-share__link')
    links.forEach(link => {
      expect(link.attributes('aria-label')).toBeDefined()
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toContain('noopener')
    })
  })

  it('should apply compact class when compact prop is true', () => {
    const wrapper = mount(SocialShare, {
      props: { compact: true }
    })

    expect(wrapper.classes()).toContain('social-share--compact')
  })
})
```

### Testing Composables

Already created: `/apps/frontend/app/composables/__tests__/useSocialData.spec.ts`

Pattern to follow:
```typescript
import { describe, it, expect } from 'vitest'
import { useYourComposable } from '../useYourComposable'

describe('useYourComposable', () => {
  it('should return expected data structure', () => {
    const { data } = useYourComposable()

    expect(data).toBeDefined()
    expect(data).toHaveProperty('someProperty')
  })
})
```

## Test Coverage Goals

### Minimum Coverage Targets
- **Composables**: 90%+
- **Components**: 85%+
- **Utilities**: 95%+
- **Overall**: 85%+

### Check Current Coverage
```bash
npm run test:coverage
```

This generates a report in `/apps/frontend/coverage/index.html`

## Best Practices

### 1. Test Organization
```
app/
├── components/
│   ├── SocialShare.vue
│   └── __tests__/
│       └── SocialShare.spec.ts
├── composables/
│   ├── useSocialData.ts
│   └── __tests__/
│       └── useSocialData.spec.ts
└── utils/
    ├── helpers.ts
    └── __tests__/
        └── helpers.spec.ts
```

### 2. Test Naming Convention
- Test files: `*.spec.ts` or `*.test.ts`
- Test blocks: Descriptive with pattern name when applicable
- Example: `describe('useSocialData - Factory Pattern', () => {})`

### 3. What to Test

✅ **DO Test:**
- Public API of components/composables
- User interactions (clicks, keyboard)
- Data transformations (pure functions)
- Accessibility attributes
- Edge cases and error states
- Design pattern implementations

❌ **DON'T Test:**
- Implementation details
- Third-party library internals
- CSS styles (use visual regression testing instead)
- Private functions (test through public API)

### 4. Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange: Set up test data
  const input = 'test'

  // Act: Execute the function
  const result = processData(input)

  // Assert: Verify the result
  expect(result).toBe('expected')
})
```

### 5. Mocking

When testing components that use composables:
```typescript
import { vi } from 'vitest'

vi.mock('~/composables/useSocialData', () => ({
  useSocialData: vi.fn(() => ({
    socialLinks: [
      { platform: 'instagram', name: 'Instagram', url: 'https://...' }
    ],
    contactInfo: { email: 'test@example.com' }
  }))
}))
```

## Troubleshooting

### Issue: Cannot find module '~/*'
**Solution:** Check `vitest.config.ts` alias configuration matches your project structure.

### Issue: "ReferenceError: document is not defined"
**Solution:** Ensure `environment: 'happy-dom'` is set in vitest.config.ts

### Issue: Nuxt auto-imports not recognized
**Solution:** Add mocks in test setup file or use `.nuxt/imports.d.ts` types

### Issue: SCSS imports fail
**Solution:** Mock SCSS imports in vitest.config.ts:
```typescript
test: {
  // ...
  css: {
    modules: {
      classNameStrategy: 'non-scoped'
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: apps/frontend

      - name: Run tests
        run: npm run test:coverage
        working-directory: apps/frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: apps/frontend/coverage
```

## Docker Testing

Run tests in Docker container:

```bash
# From project root
docker compose -f docker-compose.dev.yml exec frontend npm run test

# Or with coverage
docker compose -f docker-compose.dev.yml exec frontend npm run test:coverage
```

## VSCode Integration

### Recommended Extensions
- **Vitest** by Vitest (vitest.explorer)
- **Vue - Official** (vue.volar)

### Settings
Add to `.vscode/settings.json`:
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test"
}
```

## Next Steps

1. **Install dependencies**
   ```bash
   npm install -D vitest @vitest/ui happy-dom @vue/test-utils
   ```

2. **Create vitest.config.ts**

3. **Add test scripts to package.json**

4. **Run existing tests**
   ```bash
   npm run test
   ```

5. **Create component tests**
   - SocialShare component tests
   - ImageGrid component tests
   - Navigation tests

6. **Set up CI/CD testing**

7. **Aim for 85%+ coverage**

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Nuxt Testing Guide](https://nuxt.com/docs/getting-started/testing)

---

**Testing Philosophy:**
Write tests that give you confidence, not just coverage. Focus on testing behavior, not implementation.
