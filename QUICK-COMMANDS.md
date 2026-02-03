# Quick Commands - Product Upload Feature

## 🚀 Démarrage rapide

### 1. Démarrer le backend

```bash
cd apps/backend
npm run start:dev
```

Backend accessible sur: `http://localhost:4000`

---

## 🧪 Tester l'upload

### Option 1: Page HTML (Plus simple)

```bash
# Ouvrir dans le navigateur
open apps/backend/test-upload.html
```

### Option 2: Script automatisé

```bash
# Depuis la racine du projet
./test-upload.sh
```

### Option 3: cURL (Manuel)

```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Test Product" \
  -F "category=wall-hanging" \
  -F "price=99.99" \
  -F "images=@/path/to/image.jpg"
```

### Option 4: Swagger UI

```
http://localhost:4000/api/docs
```

---

## 📋 Vérifications

### Vérifier que tous les fichiers sont présents

```bash
./verify-upload-setup.sh
```

### Build & Lint

```bash
cd apps/backend

# Compiler
npm run build

# Linter
npm run lint

# Tests
npm test
```

---

## 🔍 Debugging

### Voir les fichiers uploadés

```bash
ls -la apps/backend/uploads/products/
```

### Accéder directement à une image

```
http://localhost:4000/uploads/products/nom-du-fichier.jpg
```

### Voir les logs du backend

Les logs apparaissent dans la console où tourne `npm run start:dev`

### Vérifier la base de données

```bash
# Avec Docker
make db-shell

# Dans psql
\c atelier_kaisla_dev
SELECT id, name, images FROM products;
```

---

## 📚 Documentation

### Guides principaux

```bash
# Guide rapide
cat IMPLEMENTATION-COMPLETE.md

# Documentation API complète
cat apps/backend/UPLOAD-API.md

# Résumé avec exemples
cat PRODUCT-UPLOAD-SUMMARY.md

# Liste des changements
cat FILES-CHANGED.md
```

### Swagger (Interactive)

```
http://localhost:4000/api/docs
```

---

## 🛠️ Commandes utiles

### Backend

```bash
cd apps/backend

# Développement
npm run start:dev          # Mode watch
npm run start:debug        # Mode debug

# Production
npm run build              # Compiler
npm run start:prod         # Démarrer en prod

# Tests
npm run test               # Tests unitaires
npm run test:watch         # Tests en mode watch
npm run test:cov           # Coverage

# Code quality
npm run lint               # ESLint
npm run format             # Prettier
```

### Docker

```bash
# Depuis la racine du projet
make dev-up-d              # Démarrer en arrière-plan
make dev-logs-backend      # Voir les logs backend
make dev-down              # Arrêter
make dev-rebuild           # Reconstruire
```

### Base de données

```bash
# Seeding
make seed-docker           # Ajouter des produits
make seed-docker-clean     # Reset + seed

# Accès direct
make db-shell              # Connexion PostgreSQL
```

---

## 🧹 Nettoyage

### Supprimer les images uploadées

```bash
rm -rf apps/backend/uploads/products/*
```

### Réinitialiser la base de données

```bash
make seed-docker-clean
```

### Clean build

```bash
cd apps/backend
rm -rf dist node_modules
npm install
npm run build
```

---

## 📊 Endpoints API

### Créer un produit (avec upload)

```bash
POST http://localhost:4000/api/products/with-upload
Content-Type: multipart/form-data

Champs requis:
- name (string)
- category (wall-hanging | rug)
- price (number)
- images (files, 1-5)
```

### Créer un produit (JSON)

```bash
POST http://localhost:4000/api/products
Content-Type: application/json

{
  "name": "Product",
  "category": "wall-hanging",
  "price": 99.99
}
```

### Lister tous les produits

```bash
GET http://localhost:4000/api/products
```

### Produits par catégorie

```bash
GET http://localhost:4000/api/products/category/wall-hanging
GET http://localhost:4000/api/products/category/rug
```

### Obtenir un produit

```bash
GET http://localhost:4000/api/products/:id
```

### Mettre à jour un produit

```bash
PATCH http://localhost:4000/api/products/:id
Content-Type: application/json

{
  "price": 149.99
}
```

### Supprimer un produit

```bash
DELETE http://localhost:4000/api/products/:id
```

### Statistiques

```bash
GET http://localhost:4000/api/products/statistics
```

---

## 🎨 Exemples d'intégration

### JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('name', 'Mon Produit');
formData.append('category', 'wall-hanging');
formData.append('price', '99.99');
formData.append('images', fileInput.files[0]);

const response = await fetch('http://localhost:4000/api/products/with-upload', {
  method: 'POST',
  body: formData,
});

const product = await response.json();
```

### Vue/Nuxt

```vue
<script setup>
async function uploadProduct(formData) {
  return await $fetch('/api/products/with-upload', {
    method: 'POST',
    body: formData,
  });
}
</script>
```

### cURL avec tous les champs

```bash
curl -X POST http://localhost:4000/api/products/with-upload \
  -F "name=Suspension Murale" \
  -F "description=Belle pièce artisanale" \
  -F "category=wall-hanging" \
  -F "price=199.99" \
  -F "status=available" \
  -F "stockQuantity=1" \
  -F "dimensions={\"width\": 60, \"height\": 80, \"unit\": \"cm\"}" \
  -F "materials=Coton, laine" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

---

## ❓ Aide rapide

### Le backend ne démarre pas

```bash
cd apps/backend
npm install
npm run build
npm run start:dev
```

### Upload échoue (400)

- Vérifier que les champs requis sont présents (name, category, price, images)
- Vérifier le format des images (JPEG, PNG, WebP)
- Vérifier la taille (max 5MB par image)

### Upload échoue (413)

- Fichier trop grand (max 5MB)
- Trop de fichiers (max 5)

### Images non accessibles

```bash
# Vérifier que le dossier existe
ls apps/backend/uploads/products/

# Vérifier les permissions
chmod 755 apps/backend/uploads/products/

# Tester l'URL directement
curl http://localhost:4000/uploads/products/nom-fichier.jpg
```

### CORS error

Vérifier que l'origine est autorisée dans `apps/backend/src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
});
```

---

## 📖 Pour aller plus loin

### Documentation complète

```bash
# Lire les guides
less IMPLEMENTATION-COMPLETE.md
less apps/backend/UPLOAD-API.md
less PRODUCT-UPLOAD-SUMMARY.md

# Ou ouvrir dans un éditeur
code IMPLEMENTATION-COMPLETE.md
```

### Modifier la configuration

- **Taille max:** `apps/backend/src/modules/upload/upload.module.ts` (ligne 48)
- **Types autorisés:** `apps/backend/src/modules/upload/upload.module.ts` (lignes 29-34)
- **Nombre max:** `apps/backend/src/modules/products/products.controller.ts` (ligne 78)
- **Dossier upload:** `apps/backend/src/modules/upload/upload.module.ts` (ligne 20)

### Ajouter des fonctionnalités

Voir les recommandations dans:
- `IMPLEMENTATION-COMPLETE.md` (section "Prochaines étapes")
- `apps/backend/UPLOAD-API.md` (section "Future Enhancements")

---

## 🎯 One-liners utiles

```bash
# Tout tester en une fois
npm run build && ./test-upload.sh

# Restart rapide backend
cd apps/backend && npm run start:dev

# Voir les dernières images uploadées
ls -lt apps/backend/uploads/products/ | head -5

# Compter les produits en BDD
make db-shell -c "SELECT COUNT(*) FROM products;"

# Nettoyer tout
rm -rf apps/backend/uploads/products/* && make seed-docker-clean

# Build + Lint + Test
cd apps/backend && npm run build && npm run lint && npm test
```

---

## 💡 Tips

- Utilisez `test-upload.html` pour un test rapide et visuel
- Consultez Swagger pour la documentation interactive
- Les images sont dans `apps/backend/uploads/products/`
- Les URLs sont automatiquement générées avec le baseUrl
- Les fichiers sont nettoyés automatiquement si la création échoue
- UUID garantit l'unicité des noms de fichiers

---

**Aide supplémentaire:** Consultez `IMPLEMENTATION-COMPLETE.md` pour le guide complet
