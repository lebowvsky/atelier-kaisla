# Quick Start Guide - Atelier Kaisla Frontend

## Development Server

Start the development server:

```bash
cd /Users/bricelegallo/dev/side-projects/atelier-kaisla/apps/frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
apps/frontend/
├── app/
│   ├── app.vue                    # Root component
│   ├── components/
│   │   └── AppNavbar.vue          # Main navigation bar
│   ├── composables/
│   │   └── useNavigation.ts       # Navigation configuration
│   ├── layouts/
│   │   └── default.vue            # Default layout with navbar
│   ├── pages/
│   │   ├── index.vue              # Home page
│   │   ├── wall-hanging.vue       # Wall Hanging collection
│   │   ├── rugs.vue               # Rugs collection
│   │   ├── about.vue              # About page
│   │   └── blog.vue               # Blog page
│   └── types/
│       └── navigation.d.ts        # TypeScript definitions
├── public/
│   └── logo-kaisla.png            # Brand logo
├── nuxt.config.ts                 # Nuxt configuration
└── package.json                   # Dependencies

## Available Routes

- `/` - Home page
- `/wall-hanging` - Wall Hanging collection
- `/rugs` - Rugs collection
- `/about` - About page
- `/blog` - Blog page

## Features

- Fully responsive navbar (mobile & desktop)
- Sticky navigation (stays visible on scroll)
- Active route highlighting
- Keyboard navigation support
- ARIA labels for accessibility
- SEO optimized with meta tags
- TypeScript support
- SSR compatible

## Next Steps

1. Start the dev server
2. Open `http://localhost:3000` in your browser
3. Test the navigation by clicking menu items
4. Verify mobile responsiveness (resize browser or use DevTools)
5. Check keyboard navigation (Tab and Enter keys)

## Build for Production

```bash
npm run build
npm run preview
```

## Additional Commands

```bash
npm run generate  # Generate static site
npm run preview   # Preview production build
```

## Documentation

See `NAVBAR-README.md` for detailed technical documentation about the navbar implementation.
