# Intégration Frontend-Backend - Résumé

## Ce qui a été fait

L'intégration complète entre le frontend Nuxt 4 et le backend NestJS a été réalisée avec succès. Les pages **Wall Hanging** et **Rugs** affichent maintenant de vraies données produits provenant de la base de données PostgreSQL.

## Fichiers créés

### Types TypeScript
1. **`/apps/frontend/app/types/product.d.ts`**
   - Définitions de types pour les entités Product du backend
   - Interface `Product`, `ProductDimensions`, `ProductCategory`, etc.
   - Types alignés avec l'entité backend

### Composable API
2. **`/apps/frontend/app/composables/useProducts.ts`**
   - Composable pour l'intégration API
   - Implémente les patterns Adapter, Facade et Decorator
   - Fonctions: `fetchByCategory()`, `fetchAll()`, `fetchById()`, `refresh()`
   - Gestion automatique des états loading/error
   - Cache de 5 minutes pour les performances
   - Compatible SSR avec `useFetch`

### Documentation
3. **`/apps/frontend/API-INTEGRATION.md`**
   - Documentation technique détaillée
   - Explication des design patterns utilisés
   - Exemples d'utilisation
   - Guide de dépannage

4. **`/FRONTEND-BACKEND-INTEGRATION.md`**
   - Guide de démarrage rapide
   - Configuration de l'environnement
   - Tests et validation
   - Checklist de vérification

5. **`/test-api-integration.sh`**
   - Script de test automatisé
   - Vérifie tous les endpoints API
   - Valide la configuration CORS
   - Teste la structure des données

6. **`/INTEGRATION-SUMMARY.md`** (ce fichier)
   - Résumé en français de l'intégration

## Fichiers modifiés

### Pages
1. **`/apps/frontend/app/pages/wall-hanging.vue`**
   - Utilise maintenant `useProducts()` au lieu de `useArtworkData()`
   - Récupère les produits de catégorie "wall-hanging" via API
   - Gestion des erreurs avec message et bouton retry
   - État de chargement avec skeletons

2. **`/apps/frontend/app/pages/rugs.vue`**
   - Utilise maintenant `useProducts()` au lieu de `useArtworkData()`
   - Récupère les produits de catégorie "rug" via API
   - Gestion des erreurs avec message et bouton retry
   - État de chargement avec skeletons

### Configuration
3. **`/apps/frontend/nuxt.config.ts`**
   - Ajout de `runtimeConfig.public.apiUrl`
   - Configurable via `NUXT_PUBLIC_API_URL` environment variable
   - Défaut: `http://localhost:4000/api`

4. **`/.env.dev.example`**
   - Ajout de `NUXT_PUBLIC_API_URL=http://backend:4000/api`
   - Pour Docker: utilise le nom du service backend
   - Pour local: utiliser `http://localhost:4000/api`

5. **`/.env.prod.example`**
   - Ajout de `NUXT_PUBLIC_API_URL=http://backend:4000/api`
   - Configuration pour production

### Backend
6. **`/apps/backend/src/main.ts`**
   - Ajout des URLs Docker dans la configuration CORS
   - `http://frontend:3002` et `http://backoffice:3001`
   - Permet les appels API depuis les containers Docker

7. **`/apps/backend/README.md`**
   - Documentation des endpoints API
   - Exemples curl pour tous les endpoints
   - Guide d'utilisation du seeder

8. **`/CLAUDE.md`**
   - Mise à jour avec documentation API integration
   - Section sur les patterns utilisés
   - Références vers la documentation détaillée

## Design Patterns appliqués

### 1. Adapter Pattern
**Fichier:** `useProducts.ts` - fonction `adaptProductToArtwork()`

**Objectif:** Convertir l'entité backend `Product` vers l'interface frontend `Artwork`

**Pourquoi:** Permet de garder la compatibilité avec les composants existants (ArtworkList, ArtworkCard) sans modifier leurs interfaces.

```typescript
// Backend Product → Frontend Artwork
adaptProductToArtwork(product: Product): Artwork {
  return {
    id: product.id,
    title: product.name,
    imageSrc: product.images?.[0] || '/placeholder.jpg',
    // ... mapping de tous les champs
  }
}
```

### 2. Facade Pattern
**Fichier:** `useProducts.ts` - composable principal

**Objectif:** Simplifier les interactions API complexes en une interface facile à utiliser

**Pourquoi:** Les composants n'ont pas besoin de connaître les détails de l'API (URL, cache, erreurs). Ils appellent simplement `fetchByCategory('wall-hanging')`.

```typescript
const { artworks, loading, error, fetchByCategory } = useProducts()
await fetchByCategory('wall-hanging')
// Tout est géré automatiquement: fetch, cache, adaptation, états
```

### 3. Decorator Pattern
**Implémentation:** Gestion automatique des états loading/error

**Objectif:** Ajouter des fonctionnalités (loading, error) sans modifier le code de fetch

**Pourquoi:** Sépare les préoccupations - la logique de fetch est indépendante de la gestion d'état.

```typescript
// Le composable "décore" les appels API avec:
loading.value = true  // Avant
try { await fetch() } // Appel API
catch { error.value } // Erreur
finally { loading.value = false } // Après
```

## Configuration requise

### Variables d'environnement

Créez ou mettez à jour votre fichier `.env` à la racine du projet:

```env
# Base de données
POSTGRES_HOST=postgres
POSTGRES_DB=atelier_kaisla_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# API URL pour le frontend
# En Docker: utiliser le nom du service
NUXT_PUBLIC_API_URL=http://backend:4000/api

# En local sans Docker: utiliser localhost
# NUXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Démarrage rapide

### 1. Démarrer l'environnement Docker

```bash
# Initialiser et démarrer tous les services
make init
make dev-up-d

# Vérifier que tout tourne
docker ps
```

### 2. Peupler la base de données

```bash
# Accéder au container backend
make backend-shell

# Dans le container, exécuter le seeder
npm run seed

# Sortir du container
exit
```

Cela crée 18 produits de test:
- 8 wall hangings (macramé, tapisseries, art textile)
- 10 rugs (Berbère, kilim, moderne, vintage)

### 3. Tester l'API backend

```bash
# Exécuter le script de test
./test-api-integration.sh

# Ou tester manuellement
curl http://localhost:4000/api/products/category/wall-hanging
```

### 4. Tester le frontend

Ouvrez dans votre navigateur:

- **Frontend**: http://localhost:3002
- **Wall Hangings**: http://localhost:3002/wall-hanging
- **Rugs**: http://localhost:3002/rugs
- **API Docs**: http://localhost:4000/api/docs

Vous devriez voir:
- ✅ Produits réels chargés depuis la base de données
- ✅ Skeleton loaders pendant le chargement
- ✅ Prix, dimensions et matériaux affichés
- ✅ Message d'erreur si backend indisponible
- ✅ Bouton retry en cas d'erreur

## Endpoints API disponibles

### 1. Produits par catégorie (utilisé par les pages)
```bash
GET /api/products/category/:category
```

**Paramètres:**
- `category`: `wall-hanging` ou `rug`

**Exemple:**
```bash
curl http://localhost:4000/api/products/category/wall-hanging
```

**Réponse:** Array de produits avec `status='available'`

### 2. Tous les produits (avec filtres)
```bash
GET /api/products?category=&status=&search=&page=&limit=
```

**Exemple:**
```bash
curl "http://localhost:4000/api/products?category=rug&status=available&limit=10"
```

### 3. Produit par ID
```bash
GET /api/products/:id
```

**Exemple:**
```bash
curl http://localhost:4000/api/products/uuid-ici
```

### 4. Statistiques
```bash
GET /api/products/statistics
```

**Réponse:**
```json
{
  "total": 18,
  "byCategory": {
    "wall-hanging": 8,
    "rug": 10
  },
  "byStatus": {
    "available": 15,
    "sold": 2,
    "draft": 1
  }
}
```

## Comment ça marche

### Flux de données

```
1. Utilisateur visite /wall-hanging
   ↓
2. Page appelle useProducts().fetchByCategory('wall-hanging')
   ↓
3. Composable fetch depuis http://backend:4000/api/products/category/wall-hanging
   ↓
4. Backend interroge PostgreSQL
   ↓
5. Backend retourne Product[]
   ↓
6. Composable adapte Product → Artwork (Adapter Pattern)
   ↓
7. État réactif mis à jour automatiquement
   ↓
8. Composant ArtworkList s'affiche avec les données
   ↓
9. Utilisateur voit la grille de produits
```

### Sécurité des types

Tout est typé avec TypeScript:

**Backend** → `Product` entity
**Frontend** → `Artwork` interface
**Adapter** → Conversion type-safe

Aucun `any`, tout est vérifié à la compilation.

### Cache et performance

- **Cache 5 minutes**: Les données sont mises en cache pendant 5 minutes
- **SSR**: Données fetchées côté serveur lors du chargement initial
- **Pas de refetch inutile**: Navigation entre pages utilise le cache

Pour forcer un refresh:
```typescript
const { refresh } = useProducts()
await refresh('wall-hanging')
```

## Dépannage

### Problème: "Unable to load products"

**Cause:** Frontend ne peut pas se connecter au backend

**Solution:**
```bash
# 1. Vérifier que le backend tourne
docker ps

# 2. Voir les logs du backend
make dev-logs-backend

# 3. Tester l'API directement
curl http://localhost:4000/api/products/category/wall-hanging

# 4. Vérifier le .env
cat .env | grep NUXT_PUBLIC_API_URL
```

### Problème: Liste de produits vide

**Cause:** Base de données vide

**Solution:**
```bash
make backend-shell
npm run seed
exit
```

### Problème: Erreur CORS dans la console

**Cause:** URL frontend non autorisée

**Solution:** Déjà configuré dans `main.ts`:
- ✅ `http://localhost:3002` (local)
- ✅ `http://frontend:3002` (Docker)

### Problème: Erreur TypeScript

**Cause:** Types manquants

**Solution:** Vérifier que ces fichiers existent:
- `/apps/frontend/app/types/product.d.ts`
- `/apps/frontend/app/types/artwork.d.ts`

Redémarrer le serveur TypeScript dans votre IDE.

## Prochaines étapes

Pour étendre l'intégration:

### 1. Pages de détail produit
- Créer `/products/[id].vue`
- Utiliser `fetchById(id)` du composable
- Afficher toutes les informations du produit

### 2. Recherche
- Ajouter input de recherche
- Utiliser `fetchAll({ search: query })`
- Debounce pour performance

### 3. Filtres
- Prix min/max
- Matériaux
- Dimensions
- Utiliser `fetchAll()` avec params

### 4. Panier d'achat
- Store Pinia pour le panier
- Ajouter au panier
- Persistance localStorage

### 5. Mises à jour temps réel
- WebSocket integration
- Notifications de stock
- Statut vendu en direct

## Documentation

Pour plus de détails:

- **Guide technique**: `/apps/frontend/API-INTEGRATION.md`
- **Backend API**: `/apps/backend/README.md`
- **Swagger**: `http://localhost:4000/api/docs`
- **Architecture**: `/apps/frontend/ARCHITECTURE.md`
- **Docker**: `/DOCKER-QUICKSTART.md`

## Résumé

✅ **Intégration complète** frontend-backend réalisée
✅ **Design patterns** appliqués (Adapter, Facade, Decorator)
✅ **Type-safe** avec TypeScript
✅ **SSR-compatible** avec Nuxt useFetch
✅ **Cache** pour les performances
✅ **Gestion d'erreur** robuste avec retry
✅ **Loading states** avec skeletons
✅ **CORS** configuré correctement
✅ **Documentation** complète
✅ **Script de test** automatisé
✅ **Compatible** avec les composants existants

Les pages wall-hanging et rugs affichent maintenant des données réelles depuis la base de données PostgreSQL, avec gestion complète du loading, des erreurs, et du cache.

---

**Bon développement !** 🚀
