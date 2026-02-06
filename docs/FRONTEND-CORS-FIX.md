# Frontend CORS Fix - Documentation

## Problème Initial

Le frontend essayait d'accéder à `http://backend:4000/api` depuis le navigateur, causant une erreur CORS :

```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin »
ne permet pas de consulter la ressource distante située sur
http://backend:4000/api/products/category/wall-hanging.
Raison : échec de la requête CORS. Code d'état : (null).
```

**Cause** : Le hostname `backend` est un hostname Docker interne, inaccessible depuis le navigateur de l'utilisateur.

## Solution Appliquée

Modification du fichier `/apps/frontend/app/composables/useProducts.ts` pour implémenter une logique intelligente de sélection d'URL API :

### Logique Implémentée

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

### Comportement par Environnement

#### Développement (NODE_ENV !== 'production')

| Contexte | URL Utilisée | Raison |
|----------|--------------|--------|
| **Client-side (Navigateur)** | `http://localhost:4000/api` | Le navigateur ne peut pas résoudre le hostname Docker `backend` |
| **Server-side (SSR)** | `http://backend:4000/api` | Nuxt s'exécute dans Docker et peut accéder au réseau Docker interne |

#### Production (NODE_ENV === 'production')

| Contexte | URL Utilisée | Raison |
|----------|--------------|--------|
| **Client-side (Navigateur)** | `https://api.lebowvsky.com` | URL publique accessible par les utilisateurs |
| **Server-side (SSR)** | `https://api.lebowvsky.com` | URL publique (ou URL interne si configurée) |

## Configuration

### Variable d'Environnement

Le fichier `.env` contient :

```bash
# Configuration Frontend (Nuxt)
# This URL is used for SSR (server-side rendering) only
# When running in Docker, use: http://backend:4000/api (internal Docker network)
# When running locally, use: http://localhost:4000/api
# Note: Client-side requests automatically use http://localhost:4000/api in development
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

### Configuration Nuxt

Le fichier `/apps/frontend/nuxt.config.ts` expose la variable :

```typescript
runtimeConfig: {
  public: {
    apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  }
}
```

## Vérification

### Test Automatique

Exécuter le script de test :

```bash
./test-frontend-api.sh
```

### Test Manuel dans le Navigateur

1. Ouvrir http://localhost:3002/wall-hanging dans le navigateur
2. Ouvrir la console (F12)
3. Vérifier les logs :

**Attendu** :
```
[useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging (client)
[useProducts] Fetched X products
```

**❌ ERREUR (si pas corrigé)** :
```
Blocage d'une requête multiorigine (Cross-Origin Request) :
la politique « Same Origin » ne permet pas de consulter la ressource
distante située sur http://backend:4000/api/...
```

4. Vérifier que les produits s'affichent sur la page

### Test SSR (Server-Side Rendering)

Les logs Docker montrent les appels SSR :

```bash
docker compose -f docker-compose.dev.yml logs frontend | grep "Fetching from"
```

**Attendu** :
```
[wall-hanging] Fetching from: http://backend:4000/api/products/category/wall-hanging
[rugs] Fetching from: http://backend:4000/api/products/category/rug
```

## Fichiers Modifiés

- `/apps/frontend/app/composables/useProducts.ts` : Logique de sélection d'URL API intelligente

## Pattern de Conception Utilisé

**Adapter Pattern** : Adapte l'URL de l'API en fonction du contexte d'exécution (client vs serveur) et de l'environnement (dev vs prod).

## Résultat Attendu

✅ Frontend affiche les produits wall-hanging en développement
✅ Frontend affiche les produits rugs en développement
✅ Pas d'erreur CORS en développement
✅ Fonctionne en production avec l'URL publique `https://api.lebowvsky.com`
✅ SSR utilise l'URL Docker interne en développement
✅ Client-side utilise localhost en développement

## Déploiement en Production

Pour le déploiement en production, s'assurer que :

1. La variable d'environnement `NUXT_PUBLIC_API_URL` est définie avec l'URL publique :
   ```bash
   NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
   ```

2. Le backend est configuré pour accepter les requêtes CORS depuis le domaine frontend :
   ```typescript
   // apps/backend/src/main.ts
   app.enableCors({
     origin: [
       'https://kaisla.lebowvsky.com',
       'https://bokaisla.lebowvsky.com'
     ],
     credentials: true
   })
   ```

3. Tester l'intégration après déploiement :
   ```bash
   ./test-cors.sh https://api.lebowvsky.com https://kaisla.lebowvsky.com
   ```

## Références

- Même correction appliquée au backoffice : `/apps/backoffice/app/composables/useProducts.ts`
- Documentation CORS backoffice : `/CORS-FIX-SUMMARY.md`
- Architecture frontend : `/apps/frontend/ARCHITECTURE.md`
- Documentation API : `/apps/frontend/API-INTEGRATION.md`
