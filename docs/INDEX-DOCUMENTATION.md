# Index de Documentation - Atelier Kaisla

Ce fichier répertorie toute la documentation et les scripts de test du projet.

## 📚 Documentation Principale

| Fichier | Description | Dernière MAJ |
|---------|-------------|--------------|
| `CLAUDE.md` | Guide principal pour Claude Code | 2026-02-06 |
| `README.md` | Documentation projet principale | - |
| `DOCKER-QUICKSTART.md` | Guide rapide Docker | - |

---

## 🔧 Corrections CORS

### Frontend (Nouveau - 2026-02-06)

| Fichier | Type | Description |
|---------|------|-------------|
| **`QUICK-FIX-FRONTEND-CORS.md`** | ⚡ Quick Start | Guide rapide (30 sec) |
| **`FRONTEND-CORS-COMPLETE-FIX.md`** | 🎯 Correction Complète | Tous les changements appliqués (3 fichiers) |
| `FRONTEND-CORS-FIX.md` | 📖 Détaillé | Documentation technique complète |
| `FRONTEND-CORS-BEFORE-AFTER.md` | 🔄 Comparaison | Avant/Après avec exemples |
| `FRONTEND-CORS-SUMMARY.md` | 📝 Résumé | Résumé exécutif |
| `TEST-RESULTS-FRONTEND.md` | ✅ Tests | Résultats attendus et validation |
| `CORRECTION-COMPLETE.md` | 📋 Première étape | Résumé de la première correction |

**Fichiers modifiés (3)** :
- `/apps/frontend/app/composables/useProducts.ts`
- `/apps/frontend/app/pages/wall-hanging.vue`
- `/apps/frontend/app/pages/rugs.vue`

### Backoffice (Précédent)

| Fichier | Type | Description |
|---------|------|-------------|
| `START-HERE-CORS.md` | ⚡ Quick Start | Point de départ CORS |
| `CORS-FIX-SUMMARY.md` | 📝 Résumé | Correction backoffice |
| `CORS-TROUBLESHOOTING.md` | 🔍 Debug | Guide de dépannage |
| `DEPLOYMENT-CORS-FIX.md` | 🚀 Deploy | Guide déploiement |
| `CORS-FIX-README.md` | 📖 Général | Vue d'ensemble |

**Fichier modifié** : `/apps/backoffice/app/composables/useProducts.ts`

---

## 📤 Upload de Produits

| Fichier | Type | Description |
|---------|------|-------------|
| `QUICK-START-UPLOAD.md` | ⚡ Quick Start | Guide rapide upload |
| `PRODUCT-UPLOAD-FIX.md` | 📖 Détaillé | Documentation upload |
| `FIXES-SUMMARY.md` | 📝 Résumé | Résumé des corrections |

**Fichiers modifiés** :
- `/apps/backend/src/products/products.controller.ts`
- `/apps/backend/src/products/dto/*.dto.ts`

---

## 🧪 Scripts de Test

### CORS et API

| Script | Description | Usage |
|--------|-------------|-------|
| **`test-frontend-api.sh`** | ✅ Test frontend API | `./test-frontend-api.sh` |
| `test-backoffice-api-url.sh` | Test backoffice API | `./test-backoffice-api-url.sh` |
| `test-cors.sh` | Test CORS production | `./test-cors.sh <api> <backoffice> <frontend>` |
| `test-api-integration.sh` | Test intégration API | `./test-api-integration.sh` |

### Upload et Produits

| Script | Description | Usage |
|--------|-------------|-------|
| `test-product-upload.sh` | Test upload complet | `./test-product-upload.sh` |
| `test-upload.sh` | Test upload simple | `./test-upload.sh` |
| `verify-upload-setup.sh` | Vérifier config upload | `./verify-upload-setup.sh` |
| `test-product-form.sh` | Test formulaire produit | `./test-product-form.sh` |

### Production et Debug

| Script | Description | Usage |
|--------|-------------|-------|
| `diagnose-production.sh` | Diagnostic production | `./diagnose-production.sh` |
| `fix-production-500.sh` | Correction erreurs 500 | `./fix-production-500.sh` |
| `DEPLOY-CORS-NOW.sh` | Déploiement CORS rapide | `./DEPLOY-CORS-NOW.sh` |

---

## 🎯 Guide de Navigation Rapide

### Je veux...

#### Corriger une erreur CORS dans le frontend
1. **Quick Start** : `QUICK-FIX-FRONTEND-CORS.md`
2. **Tester** : `./test-frontend-api.sh`
3. **Détails** : `FRONTEND-CORS-FIX.md`

#### Corriger une erreur CORS dans le backoffice
1. **Quick Start** : `START-HERE-CORS.md`
2. **Tester** : `./test-backoffice-api-url.sh`
3. **Détails** : `CORS-FIX-SUMMARY.md`

#### Uploader un produit
1. **Quick Start** : `QUICK-START-UPLOAD.md`
2. **Tester** : `./test-product-upload.sh`
3. **Détails** : `PRODUCT-UPLOAD-FIX.md`

#### Démarrer le projet
1. **Docker** : `DOCKER-QUICKSTART.md`
2. **Init** : `make init && make dev-up-d`
3. **Logs** : `make dev-logs`

#### Déployer en production
1. **CORS** : `DEPLOYMENT-CORS-FIX.md`
2. **Test** : `./test-cors.sh`
3. **Debug** : `CORS-TROUBLESHOOTING.md`

---

## 📦 Architecture

### Frontend (`/apps/frontend/`)
- **Composables** : `/apps/frontend/app/composables/`
- **Pages** : `/apps/frontend/app/pages/`
- **Types** : `/apps/frontend/app/types/`
- **Architecture** : `/apps/frontend/ARCHITECTURE.md`
- **API Integration** : `/apps/frontend/API-INTEGRATION.md`

### Backoffice (`/apps/backoffice/`)
- **Composables** : `/apps/backoffice/app/composables/`
- **Pages** : `/apps/backoffice/app/pages/`
- **Components** : `/apps/backoffice/app/components/`

### Backend (`/apps/backend/`)
- **Products** : `/apps/backend/src/products/`
- **Controllers** : `/apps/backend/src/products/products.controller.ts`
- **Services** : `/apps/backend/src/products/products.service.ts`
- **DTOs** : `/apps/backend/src/products/dto/`
- **README** : `/apps/backend/README.md`

---

## 🔍 Dépannage Rapide

### Erreur CORS Frontend
```bash
# 1. Vérifier logs
docker compose -f docker-compose.dev.yml logs frontend | grep "Fetching from"

# 2. Redémarrer frontend
docker compose -f docker-compose.dev.yml restart frontend

# 3. Tester
./test-frontend-api.sh
```

### Erreur CORS Backoffice
```bash
# 1. Vérifier logs
docker compose -f docker-compose.dev.yml logs backoffice | grep "API URL"

# 2. Redémarrer backoffice
docker compose -f docker-compose.dev.yml restart backoffice

# 3. Tester
./test-backoffice-api-url.sh
```

### Backend ne répond pas
```bash
# 1. Vérifier status
docker compose -f docker-compose.dev.yml ps backend

# 2. Voir logs
docker compose -f docker-compose.dev.yml logs backend

# 3. Redémarrer
docker compose -f docker-compose.dev.yml restart backend
```

### Base de données vide
```bash
# 1. Seed data
docker compose -f docker-compose.dev.yml exec backend npm run seed

# 2. Vérifier
curl http://localhost:4000/api/products

# 3. pgAdmin
open http://localhost:5050
```

---

## 📅 Historique des Modifications

| Date | Type | Description | Fichiers |
|------|------|-------------|----------|
| 2026-02-06 | CORS | Correction CORS frontend | `useProducts.ts` (frontend) |
| 2025-XX-XX | CORS | Correction CORS backoffice | `useProducts.ts` (backoffice) |
| 2025-XX-XX | Upload | Correction upload produits | `products.controller.ts`, DTOs |
| 2025-XX-XX | Init | Setup initial projet | Tous fichiers |

---

## 🚀 Commandes Make Utiles

```bash
# Développement
make init              # Initialiser projet
make dev-up-d          # Démarrer en background
make dev-down          # Arrêter tout
make dev-logs          # Voir tous les logs
make dev-rebuild       # Reconstruire

# Logs spécifiques
make dev-logs-frontend
make dev-logs-backend
make dev-logs-backoffice

# Shells
make frontend-shell
make backend-shell
make backoffice-shell
make db-shell

# Production
make prod-up
make prod-down
make prod-logs
```

---

## 📞 Support

Pour toute question, consulter :
1. `CLAUDE.md` - Guide principal
2. Index présent (ce fichier)
3. Documentation spécifique au problème
4. Scripts de test pour diagnostiquer

---

**Dernière mise à jour** : 2026-02-06
**Version projet** : 1.0.0
**Stack** : Nuxt 4 + NestJS + PostgreSQL + Docker
