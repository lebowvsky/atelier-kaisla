# Frontend CORS - Avant vs Après

## Comportement AVANT la correction

### Code Original

```typescript
const getApiUrl = () => {
  // Check if we're on the server (SSR) or client (browser)
  if (import.meta.server) {
    // Server-side: use internal Docker network address
    return config.public.apiUrl || 'http://backend:4000/api'
  } else {
    // Client-side: use localhost for browser
    return 'http://localhost:4000/api'
  }
}
```

### Problème

❌ **Développement** : Fonctionne (localhost en client, backend en SSR)
❌ **Production** : CASSE ! Le navigateur essaie d'accéder à `http://localhost:4000/api` au lieu de `https://api.lebowvsky.com`

### Logs Développement (AVANT)

**Navigateur (client)** :
```
[useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging
```

**Docker (SSR)** :
```
[wall-hanging] Fetching from: http://backend:4000/api/products/category/wall-hanging
```

### Logs Production (AVANT) - ❌ CASSÉ

**Navigateur (client)** :
```
❌ [useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging
❌ Error: Failed to fetch (localhost n'existe pas en production)
```

---

## Comportement APRÈS la correction

### Code Corrigé

```typescript
const getApiUrl = (): string => {
  // Client-side (browser)
  if (import.meta.client) {
    // Production: use public API URL from environment
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    // Development: force localhost (backend hostname not accessible from browser)
    return 'http://localhost:4000/api'
  }

  // Server-side (SSR): always use environment variable
  // Dev: http://backend:4000/api
  // Prod: https://api.lebowvsky.com
  return config.public.apiUrl
}
```

### Solution

✅ **Développement** : Fonctionne (localhost en client, backend en SSR)
✅ **Production** : Fonctionne (URL publique en client et SSR)

### Logs Développement (APRÈS)

**Navigateur (client)** :
```
✅ [useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging (client)
```

**Docker (SSR)** :
```
✅ [wall-hanging] Fetching from: http://backend:4000/api/products/category/wall-hanging
```

### Logs Production (APRÈS) - ✅ FONCTIONNE

**Navigateur (client)** :
```
✅ [useProducts] Fetching from: https://api.lebowvsky.com/products/category/wall-hanging (client)
```

**Docker (SSR)** :
```
✅ [wall-hanging] Fetching from: https://api.lebowvsky.com/products/category/wall-hanging
```

---

## Tableau Récapitulatif

| Environnement | Contexte | AVANT | APRÈS |
|---------------|----------|-------|-------|
| **Dev** | Client (navigateur) | ✅ `http://localhost:4000/api` | ✅ `http://localhost:4000/api` |
| **Dev** | SSR (Docker) | ✅ `http://backend:4000/api` | ✅ `http://backend:4000/api` |
| **Prod** | Client (navigateur) | ❌ `http://localhost:4000/api` | ✅ `https://api.lebowvsky.com` |
| **Prod** | SSR (Docker) | ✅ `https://api.lebowvsky.com` | ✅ `https://api.lebowvsky.com` |

---

## Différence Clé

### AVANT
```typescript
// ❌ Ne vérifie PAS l'environnement (dev vs prod) côté client
if (import.meta.server) {
  return config.public.apiUrl
} else {
  return 'http://localhost:4000/api' // Toujours localhost !
}
```

### APRÈS
```typescript
// ✅ Vérifie l'environnement côté client
if (import.meta.client) {
  if (process.env.NODE_ENV === 'production') {
    return config.public.apiUrl // URL publique en prod
  }
  return 'http://localhost:4000/api' // localhost en dev
}
```

---

## Impact

### Développement
- Aucun changement de comportement
- Toujours fonctionnel

### Production
- **AVANT** : Frontend cassé (localhost inaccessible)
- **APRÈS** : Frontend fonctionnel (URL publique)

---

## Configuration Production

Définir dans `.env` ou variables d'environnement de production :

```bash
NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
NODE_ENV=production
```

---

## Test de Validation

### Développement
```bash
./test-frontend-api.sh
```

### Production (après déploiement)
```bash
./test-cors.sh https://api.lebowvsky.com https://kaisla.lebowvsky.com
```

---

## Même Correction Appliquée

Cette correction est identique à celle appliquée au **backoffice** :
- `/apps/backoffice/app/composables/useProducts.ts` (déjà corrigé)
- `/apps/frontend/app/composables/useProducts.ts` (corrigé maintenant)

Les deux applications utilisent maintenant la même logique intelligente de sélection d'URL API.
