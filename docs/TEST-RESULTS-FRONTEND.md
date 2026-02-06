# Tests Frontend - Résultats Attendus

## Test 1 : Navigation vers Wall Hanging

### URL
```
http://localhost:3002/wall-hanging
```

### Console Navigateur (F12)

**Logs attendus** :
```javascript
[useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging (client)
[useProducts] Fetched X products
```

**❌ ERREUR (si pas corrigé)** :
```
Blocage d'une requête multiorigine (Cross-Origin Request) :
la politique « Same Origin » ne permet pas de consulter la ressource
distante située sur http://backend:4000/api/products/category/wall-hanging.
```

### Rendu Visuel

**✅ Attendu** :
- Page Wall Hanging chargée
- Produits affichés dans la grille
- Images chargées (ou placeholders)
- Aucune erreur visible

**❌ Erreur (si API échoue)** :
- Message d'erreur affiché
- Grille vide
- Spinner de chargement infini

---

## Test 2 : Navigation vers Rugs

### URL
```
http://localhost:3002/rugs
```

### Console Navigateur (F12)

**Logs attendus** :
```javascript
[useProducts] Fetching from: http://localhost:4000/api/products/category/rug (client)
[useProducts] Fetched Y products
```

### Rendu Visuel

**✅ Attendu** :
- Page Rugs chargée
- Produits affichés dans la grille
- Images chargées (ou placeholders)
- Aucune erreur visible

---

## Test 3 : Logs Docker (SSR)

### Commande
```bash
docker compose -f docker-compose.dev.yml logs frontend | grep "Fetching from"
```

### Sortie Attendue

```
atelier-kaisla-frontend-dev  | [wall-hanging] Fetching from: http://backend:4000/api/products/category/wall-hanging
atelier-kaisla-frontend-dev  | [rugs] Fetching from: http://backend:4000/api/products/category/rug
```

**Important** : Notez que SSR utilise `http://backend:4000/api` (réseau Docker interne)

---

## Test 4 : Network Tab (F12)

### Onglet Network (Réseau)

Filtrer par "products" :

**✅ Attendu** :
```
Request URL: http://localhost:4000/api/products/category/wall-hanging
Status: 200 OK
Type: xhr
```

**❌ Erreur CORS** :
```
Request URL: http://backend:4000/api/products/category/wall-hanging
Status: (failed)
Type: xhr
Error: net::ERR_NAME_NOT_RESOLVED
```

---

## Test 5 : API Directe

### Test API Wall Hanging

```bash
curl http://localhost:4000/api/products/category/wall-hanging
```

**Sortie attendue** :
```json
[
  {
    "id": "uuid-1234-5678",
    "name": "Mountain Sunset",
    "category": "wall-hanging",
    "price": "150.00",
    "stockQuantity": 1,
    "status": "available",
    ...
  }
]
```

### Test API Rugs

```bash
curl http://localhost:4000/api/products/category/rug
```

**Sortie attendue** :
```json
[
  {
    "id": "uuid-abcd-efgh",
    "name": "Woven Dreams",
    "category": "rug",
    "price": "300.00",
    "stockQuantity": 2,
    "status": "available",
    ...
  }
]
```

---

## Test 6 : Script Automatique

### Commande

```bash
./test-frontend-api.sh
```

### Sortie Attendue

```
======================================
Testing Frontend API Integration
======================================

1. Checking if frontend is running...
✓ Frontend is running (HTTP 200)

2. Checking if backend is running...
✓ Backend is running

3. Testing API endpoint directly...
✓ API returns X wall-hanging products

4. Testing frontend Wall Hanging page...
✓ Wall Hanging page loads

5. Testing frontend Rugs page...
✓ Rugs page loads

6. Checking Docker logs for recent errors...
✓ No CORS or error messages in recent logs

======================================
Test Summary
======================================

Next steps to verify in browser:
1. Open http://localhost:3002/wall-hanging
2. Open browser console (F12)
3. Check for CORS errors
4. Verify products are displayed

Expected console output:
  [useProducts] Fetching from: http://localhost:4000/api/products/category/wall-hanging (client)
  [useProducts] Fetched X products
```

---

## Scénarios de Défaillance

### Scénario 1 : Backend non démarré

**Symptôme** :
```
[useProducts] Error fetching products: fetch failed
```

**Solution** :
```bash
docker compose -f docker-compose.dev.yml up -d backend
```

### Scénario 2 : Frontend utilise encore http://backend:4000

**Symptôme** :
```
CORS Error: http://backend:4000/api/products/category/wall-hanging
net::ERR_NAME_NOT_RESOLVED
```

**Solution** :
1. Vérifier que le fichier `/apps/frontend/app/composables/useProducts.ts` contient la logique corrigée
2. Redémarrer le frontend : `docker compose -f docker-compose.dev.yml restart frontend`
3. Vider le cache du navigateur (Ctrl+Shift+R)

### Scénario 3 : Pas de produits dans la base

**Symptôme** :
```
[useProducts] Fetched 0 products
```

**Solution** :
```bash
# Vérifier les données
docker compose -f docker-compose.dev.yml exec backend npm run seed

# Ou accéder à pgAdmin : http://localhost:5050
```

---

## Checklist de Validation

- [ ] Frontend démarre sans erreur
- [ ] Page Wall Hanging charge correctement
- [ ] Page Rugs charge correctement
- [ ] Console navigateur : `http://localhost:4000/api` (PAS `http://backend:4000`)
- [ ] Aucune erreur CORS dans la console
- [ ] Produits affichés sur les pages
- [ ] Logs Docker montrent `http://backend:4000/api` pour SSR
- [ ] Script `./test-frontend-api.sh` passe tous les tests

---

**Date** : 2026-02-06
**Environnement** : Development (Docker)
**Frontend** : http://localhost:3002
**Backend** : http://localhost:4000
