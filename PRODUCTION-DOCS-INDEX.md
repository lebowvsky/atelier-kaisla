# Index de la Documentation Production

Ce répertoire contient plusieurs fichiers de documentation et scripts pour résoudre les erreurs 500 en production.

---

## Guides de Documentation

### 1. **PRODUCTION-500-SUMMARY.md** ⭐ COMMENCEZ ICI
**À lire en premier**

Résumé exécutif qui explique:
- Les 2 problèmes critiques identifiés
- La solution rapide (5 minutes)
- Les fichiers modifiés
- Le workflow de déploiement
- La checklist de résolution

**Quand l'utiliser**: Première lecture pour comprendre rapidement le problème et la solution.

---

### 2. **QUICK-FIX-PRODUCTION.md** ⚡ SOLUTION RAPIDE
**Solution immédiate**

Guide concis avec:
- TL;DR avec la commande unique à exécuter
- Solution manuelle étape par étape
- Commandes de vérification post-correction
- Procédure de déploiement permanent

**Quand l'utiliser**: Quand vous voulez corriger le problème immédiatement avec des commandes copy-paste.

---

### 3. **PRODUCTION-TROUBLESHOOTING.md** 🔍 GUIDE COMPLET
**Diagnostic approfondi**

Guide exhaustif en 7 étapes:
1. Vérifier les logs du backend
2. Vérifier l'état des conteneurs
3. Vérifier la base de données PostgreSQL
4. Vérifier les variables d'environnement
5. Tester la connectivité
6. Vérifier le répertoire uploads
7. Vérifier la configuration Traefik/Dokploy

Inclut aussi:
- Solutions aux 5 problèmes courants
- Commandes de redémarrage complet
- Checklist de vérification rapide

**Quand l'utiliser**: Quand vous avez besoin de comprendre en détail ce qui se passe ou quand le fix rapide ne suffit pas.

---

### 4. **PRODUCTION-FIXES.md** 🔧 DÉTAILS TECHNIQUES
**Explications techniques détaillées**

Documentation technique qui couvre:
- Les 6 problèmes identifiés avec explications détaillées
- Le code exact des corrections à appliquer
- Le plan d'action recommandé en 3 étapes
- Les vérifications post-correction

**Quand l'utiliser**: Quand vous voulez comprendre les aspects techniques ou modifier le code manuellement.

---

## Scripts Exécutables

### 1. **fix-production-500.sh** 🚀 CORRECTION AUTOMATIQUE
**Script de correction automatique**

Ce que fait le script:
1. ✅ Vérifie que Docker et les conteneurs existent
2. ✅ Crée le répertoire `/app/uploads` avec les bonnes permissions
3. ✅ Crée la table `products` dans PostgreSQL
4. ✅ Redémarre le backend
5. ✅ Teste les endpoints (health, products)
6. ✅ Affiche des messages colorés de progression

**Comment l'utiliser**:
```bash
./fix-production-500.sh
```

**Durée**: ~30 secondes

**Quand l'utiliser**: C'est la solution recommandée pour corriger rapidement les erreurs 500.

---

### 2. **diagnose-production.sh** 🔍 DIAGNOSTIC AUTOMATIQUE
**Script de diagnostic complet**

Ce que fait le script:
1. État des conteneurs et health status
2. Logs du backend (50 dernières lignes)
3. Variables d'environnement (mots de passe masqués)
4. État de la base de données (connexion, tables, produits)
5. Répertoire uploads (existence, permissions)
6. Tests de connectivité (API interne et publique)
7. Réseau et volumes Docker
8. Résumé avec recommandations automatiques

**Comment l'utiliser**:
```bash
./diagnose-production.sh
```

**Durée**: ~10 secondes

**Quand l'utiliser**:
- Avant d'appliquer les corrections (pour comprendre le problème)
- Après les corrections (pour vérifier que tout fonctionne)
- Pour collecter des informations de debugging

---

## Fichiers de Code Modifiés

### 1. **apps/backend/Dockerfile**
Ajout de la création du répertoire `/app/uploads`

### 2. **docker-compose.prod.yml**
Ajout du volume `uploads_prod` pour persister les fichiers uploadés

### 3. **docker/postgres/init-scripts/02-create-products-table.sql** (NOUVEAU)
Script SQL qui crée automatiquement la table `products` lors de l'initialisation de PostgreSQL

### 4. **apps/backend/src/main.ts**
Amélioration des logs CORS (utilise `logger.log` au lieu de `logger.debug`)

---

## Workflow Recommandé

### Scénario 1: Première Correction (Urgence)

```bash
# 1. Comprendre le problème
cat PRODUCTION-500-SUMMARY.md

# 2. Diagnostiquer (optionnel)
./diagnose-production.sh

# 3. Corriger
./fix-production-500.sh

# 4. Vérifier
curl https://api.lebowvsky.com/api/health
curl https://api.lebowvsky.com/api/products
```

**Temps total**: 5 minutes

---

### Scénario 2: Investigation Détaillée

```bash
# 1. Lire le résumé
cat PRODUCTION-500-SUMMARY.md

# 2. Diagnostic complet
./diagnose-production.sh > diagnosis-report.txt

# 3. Consulter le guide de troubleshooting
cat PRODUCTION-TROUBLESHOOTING.md

# 4. Appliquer les corrections manuellement
# Suivre les étapes dans QUICK-FIX-PRODUCTION.md
```

**Temps total**: 15-30 minutes

---

### Scénario 3: Déploiement Permanent

```bash
# 1. Corriger l'urgence
./fix-production-500.sh

# 2. En local - Commit les changements
git add .
git commit -m "fix(production): resolve 500 errors"
git push

# 3. Sur Dokploy - Déployer
git pull
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 4. Vérifier
./diagnose-production.sh
```

**Temps total**: 10 minutes (+ temps de build)

---

## Arborescence des Fichiers

```
atelier-kaisla/
├── PRODUCTION-500-SUMMARY.md          ⭐ Commencez ici
├── QUICK-FIX-PRODUCTION.md            ⚡ Solution rapide
├── PRODUCTION-TROUBLESHOOTING.md      🔍 Guide complet
├── PRODUCTION-FIXES.md                🔧 Détails techniques
├── PRODUCTION-DOCS-INDEX.md           📚 Ce fichier
├── fix-production-500.sh              🚀 Script de correction
├── diagnose-production.sh             🔍 Script de diagnostic
├── docker-compose.prod.yml            (modifié)
├── apps/
│   └── backend/
│       ├── Dockerfile                 (modifié)
│       └── src/
│           └── main.ts                (modifié)
└── docker/
    └── postgres/
        └── init-scripts/
            └── 02-create-products-table.sql (nouveau)
```

---

## FAQ

### Q: Quel fichier dois-je lire en premier ?
**R**: `PRODUCTION-500-SUMMARY.md` pour comprendre le problème rapidement.

### Q: Comment corriger rapidement sans lire toute la documentation ?
**R**: Exécutez simplement `./fix-production-500.sh`

### Q: Le script fix-production-500.sh a échoué, que faire ?
**R**:
1. Lisez `PRODUCTION-TROUBLESHOOTING.md`
2. Exécutez `./diagnose-production.sh` pour voir les détails
3. Suivez les étapes manuelles dans `QUICK-FIX-PRODUCTION.md`

### Q: Comment vérifier que les corrections ont fonctionné ?
**R**: Exécutez `./diagnose-production.sh` et vérifiez qu'il n'y a plus d'erreurs rouges.

### Q: Faut-il commit les modifications avant ou après la correction ?
**R**:
- **Correction immédiate**: Le script `fix-production-500.sh` corrige le problème sans modifier le code
- **Correction permanente**: Ensuite, commit et déployez les modifications de code

### Q: Les corrections vont-elles supprimer mes données ?
**R**: Non, les corrections sont non-destructives. Elles créent seulement un répertoire et une table (si elle n'existe pas déjà).

### Q: Que faire si j'ai toujours des erreurs 500 après les corrections ?
**R**:
1. Exécutez `./diagnose-production.sh` pour collecter les informations
2. Consultez la section "Solutions aux Problèmes Courants" dans `PRODUCTION-TROUBLESHOOTING.md`
3. Vérifiez les logs détaillés: `docker logs --tail 200 atelier-kaisla-backend-prod`

---

## Commandes Rapides

```bash
# Diagnostic complet
./diagnose-production.sh

# Correction automatique
./fix-production-500.sh

# Voir les logs en temps réel
docker logs -f atelier-kaisla-backend-prod

# Tester l'API
curl https://api.lebowvsky.com/api/health
curl https://api.lebowvsky.com/api/products

# Redémarrer le backend
docker restart atelier-kaisla-backend-prod

# État des conteneurs
docker compose -f docker-compose.prod.yml ps
```

---

## Support

Si après avoir suivi toute cette documentation vous avez toujours des problèmes:

1. Collectez les informations avec `./diagnose-production.sh`
2. Sauvegardez les logs:
```bash
docker logs atelier-kaisla-backend-prod > backend-logs.txt
docker logs atelier-kaisla-postgres-prod > postgres-logs.txt
```
3. Consultez les fichiers de troubleshooting pour des solutions avancées

---

**Bonne chance ! 🚀**
