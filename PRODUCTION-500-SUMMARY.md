# Résumé des Erreurs 500 en Production et Solutions

## Diagnostic Rapide

Vos erreurs 500 en production sont causées par **deux problèmes critiques**:

### 1. Répertoire `/app/uploads` manquant
- **Impact**: Le backend NestJS ne peut pas démarrer correctement car il essaie de servir des fichiers statiques depuis un répertoire inexistant
- **Gravité**: CRITIQUE - Empêche le démarrage
- **Correction**: Le Dockerfile a été modifié pour créer ce répertoire

### 2. Table `products` inexistante
- **Impact**: Toutes les requêtes vers `/api/products` échouent avec une erreur 500
- **Gravité**: CRITIQUE - Empêche l'utilisation de l'API
- **Correction**: Script SQL d'initialisation créé

---

## Solution Immédiate (5 minutes)

### Option 1: Script Automatique (Recommandé)

```bash
./fix-production-500.sh
```

Ce script fait tout automatiquement et affiche des messages de progression.

### Option 2: Commandes Manuelles

```bash
# 1. Créer le répertoire uploads
docker exec atelier-kaisla-backend-prod mkdir -p /app/uploads
docker exec atelier-kaisla-backend-prod chown nestjs:nodejs /app/uploads

# 2. Créer la table products
docker exec -i atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod < docker/postgres/init-scripts/02-create-products-table.sql

# 3. Redémarrer le backend
docker restart atelier-kaisla-backend-prod

# 4. Vérifier
docker logs -f atelier-kaisla-backend-prod
```

---

## Fichiers Modifiés (Corrections Permanentes)

Les fichiers suivants ont été modifiés localement et doivent être committés puis déployés:

### 1. `apps/backend/Dockerfile`
```diff
+ # Créer le répertoire uploads avec les bonnes permissions
+ RUN mkdir -p /app/uploads
+
  # Changer la propriété des fichiers
  RUN chown -R nestjs:nodejs /app
```

### 2. `docker-compose.prod.yml`
```diff
  backend:
+   volumes:
+     # Persist uploaded files
+     - uploads_prod:/app/uploads
    expose:
      - "4000"

  volumes:
    postgres_data_prod:
      driver: local
+   uploads_prod:
+     driver: local
```

### 3. `docker/postgres/init-scripts/02-create-products-table.sql` (NOUVEAU)
Script SQL qui crée automatiquement la table products lors de l'initialisation.

### 4. `apps/backend/src/main.ts`
```diff
  if (allowedOrigins.includes(origin)) {
-   logger.debug(`✅ CORS allowed for origin: ${origin}`);
+   logger.log(`✅ CORS allowed for origin: ${origin}`);
    callback(null, true);
```

---

## Workflow de Déploiement

### Correction Immédiate (maintenant)

```bash
# Sur le serveur Dokploy
./fix-production-500.sh
```

Cela résout le problème **immédiatement** sans rebuild.

### Déploiement Permanent (plus tard)

```bash
# 1. En local - Commit les changements
git add .
git commit -m "fix(production): resolve 500 errors - add uploads directory and persistent volume"
git push

# 2. Sur Dokploy - Pull et rebuild
cd /path/to/atelier-kaisla
git pull
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## Tests de Vérification

Après correction, ces commandes doivent toutes réussir:

```bash
# 1. Health check
curl https://api.lebowvsky.com/api/health
# ✅ Attendu: {"status":"ok","timestamp":"2026-02-05T..."}

# 2. Liste des produits
curl https://api.lebowvsky.com/api/products
# ✅ Attendu: [] ou une liste de produits JSON

# 3. Logs backend sans erreur
docker logs --tail 50 atelier-kaisla-backend-prod | grep "Error"
# ✅ Attendu: Aucune erreur

# 4. Backend healthy
docker ps | grep backend
# ✅ Attendu: Status "Up" et "(healthy)"

# 5. Table products existe
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "\dt"
# ✅ Attendu: Table "products" dans la liste
```

---

## Documentation Créée

Quatre fichiers de documentation ont été créés pour vous aider:

### 1. **QUICK-FIX-PRODUCTION.md** (Lisez celui-ci en premier)
- Solution rapide et concise
- Commandes copy-paste
- Tests de vérification

### 2. **PRODUCTION-TROUBLESHOOTING.md** (Guide complet)
- Diagnostic étape par étape
- 7 étapes de vérification
- Solutions aux problèmes courants
- Commandes de diagnostic avancées

### 3. **PRODUCTION-FIXES.md** (Détails techniques)
- Explication des 6 problèmes identifiés
- Corrections détaillées avec code
- Plan d'action complet

### 4. **fix-production-500.sh** (Script automatique)
- Script bash exécutable
- Applique toutes les corrections automatiquement
- Affiche la progression avec des messages colorés

---

## Pourquoi ces Problèmes sont Apparus ?

### Répertoire Uploads
Le Dockerfile de développement utilise des volumes montés, donc le répertoire existe sur l'hôte. En production, le conteneur est autonome et doit créer ses propres répertoires.

### Table Products
En développement, `synchronize: true` crée automatiquement les tables. En production, `synchronize: false` est activé pour la sécurité (évite les modifications accidentelles de schéma). Il faut donc créer les tables manuellement via migrations ou scripts SQL.

---

## Prochaines Étapes Recommandées

### Court terme (maintenant)
1. ✅ Exécuter `./fix-production-500.sh`
2. ✅ Vérifier que l'API répond: `curl https://api.lebowvsky.com/api/health`
3. ✅ Tester le frontend: https://kaisla.lebowvsky.com

### Moyen terme (cette semaine)
1. Commit et push les corrections
2. Redéployer avec `docker-compose.prod.yml` mis à jour
3. Vérifier que les uploads sont persistés après un redémarrage

### Long terme (pour améliorer)
1. Mettre en place des migrations TypeORM
2. Ajouter un monitoring (logs centralisés, alertes)
3. Mettre en place des backups automatiques de la DB
4. Ajouter des tests end-to-end avant déploiement

---

## Checklist de Résolution

- [ ] Exécuter `./fix-production-500.sh` sur Dokploy
- [ ] Vérifier les logs: `docker logs -f atelier-kaisla-backend-prod`
- [ ] Tester l'API: `curl https://api.lebowvsky.com/api/health`
- [ ] Tester le frontend: https://kaisla.lebowvsky.com
- [ ] Commit les corrections en local
- [ ] Push vers le repo Git
- [ ] Pull sur Dokploy
- [ ] Rebuild et redéployer
- [ ] Vérifier que tout fonctionne après rebuild

---

## En Cas de Problème

Si après avoir appliqué les corrections, vous avez toujours des erreurs:

1. **Collectez les logs**:
```bash
docker logs atelier-kaisla-backend-prod > backend-logs.txt
docker logs atelier-kaisla-postgres-prod > postgres-logs.txt
docker compose -f docker-compose.prod.yml ps > status.txt
```

2. **Vérifiez les variables d'environnement**:
```bash
docker exec atelier-kaisla-backend-prod env | grep -E "DATABASE|NODE_ENV|FRONTEND|BACKOFFICE"
```

3. **Consultez PRODUCTION-TROUBLESHOOTING.md** pour un diagnostic approfondi

4. **Vérifiez Traefik** (si l'API publique ne répond pas):
```bash
docker logs traefik  # ou le nom de votre conteneur Traefik
```

---

## Contact et Support

Les fichiers de documentation contiennent des solutions pour la plupart des problèmes. En cas de blocage:

1. Consultez `PRODUCTION-TROUBLESHOOTING.md` - Section "Solutions aux Problèmes Courants"
2. Exécutez les commandes de diagnostic fournies
3. Collectez les logs et informations système

---

**Bon courage ! Les corrections devraient résoudre vos erreurs 500. 🚀**
