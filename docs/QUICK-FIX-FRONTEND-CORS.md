# Quick Fix - Frontend CORS Error

## Le Problème

```
❌ CORS Error: http://backend:4000/api/... not accessible from browser
```

Le navigateur ne peut pas résoudre le hostname Docker `backend`.

## La Solution (1 ligne)

**Développement** : Le navigateur utilise `http://localhost:4000/api`
**Production** : Le navigateur utilise `https://api.lebowvsky.com`

## Code Corrigé

`/apps/frontend/app/composables/useProducts.ts` :

```typescript
const getApiUrl = (): string => {
  // Client-side (browser)
  if (import.meta.client) {
    // Production: use public API URL from environment
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    // Development: force localhost
    return 'http://localhost:4000/api'
  }

  // Server-side (SSR): use environment variable
  return config.public.apiUrl
}
```

## Test

```bash
# Test automatique
./test-frontend-api.sh

# Test manuel
# 1. Ouvrir http://localhost:3002/wall-hanging
# 2. Console (F12) : chercher "[useProducts] Fetching from: http://localhost:4000/api..."
# 3. Vérifier que les produits s'affichent
```

## Résultat Attendu

✅ **Console navigateur** :
```
[useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging (client)
[useProducts] Fetched X products
```

✅ **Logs Docker (SSR)** :
```bash
docker compose -f docker-compose.dev.yml logs frontend | grep "Fetching from"

# Attendu:
[wall-hanging] Fetching from: http://backend:4000/api/products/category/wall-hanging
```

✅ **Navigateur** :
- Pas d'erreur CORS
- Produits affichés sur /wall-hanging et /rugs

## Documentation Complète

Voir `/FRONTEND-CORS-FIX.md` pour les détails techniques.
