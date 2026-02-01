# Atelier Kaisla - Frontend Application

E-commerce platform for handcrafted wall art and rugs built with Nuxt 4.

## Project Status

**Current Implementation**: Navbar and basic page structure
**Framework**: Nuxt 4.3.0 + Vue 3.5.27 + TypeScript
**Last Updated**: 2026-02-01

## Quick Links

- **Quick Start Guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Navbar Documentation**: [NAVBAR-README.md](./NAVBAR-README.md)
- **Architecture Overview**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Implementation Summary**: [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)
- **Final Report**: [FINAL-REPORT.md](./FINAL-REPORT.md)
- **Testing Checklist**: [VERIFICATION-CHECKLIST.md](./VERIFICATION-CHECKLIST.md)

## Features Implemented

- Fully responsive navigation bar
- 5 main pages (Home, Wall Hanging, Rugs, About, Blog)
- SEO optimization with meta tags
- Accessibility features (ARIA, keyboard navigation)
- Mobile hamburger menu
- Active route highlighting
- TypeScript support throughout

## Project Structure

```
apps/frontend/
├── app/
│   ├── app.vue                    # Root component
│   ├── components/
│   │   └── AppNavbar.vue          # Navigation bar
│   ├── composables/
│   │   └── useNavigation.ts       # Navigation config
│   ├── layouts/
│   │   └── default.vue            # Default layout
│   ├── pages/                     # Route pages
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Utility functions
├── public/
│   └── logo-kaisla.png            # Brand logo
└── Documentation files (.md)
```

## Available Routes

- `/` - Home page
- `/wall-hanging` - Wall Hanging collection
- `/rugs` - Rugs collection
- `/about` - About page
- `/blog` - Blog page

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
