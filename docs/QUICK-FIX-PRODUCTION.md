# Correction Rapide des Erreurs 500 en Production

## TL;DR - Solution Immédiate

Si vous avez des erreurs 500 en production sur Dokploy, exécutez ce script:

```bash
./fix-production-500.sh
```

Ce script va:
1. Créer le répertoire `/app/uploads` manquant
2. Créer la table `products` dans PostgreSQL
3. Redémarrer le backend
4. Tester les endpoints

**Durée estimée**: 30 secondes

---

## Causes Identifiées des Erreurs 500

### 1. Répertoire Uploads Manquant (CRITIQUE)
Le Dockerfile de production ne créait pas le répertoire `/app/uploads`, causant une erreur au démarrage de NestJS.

### 2. Table Products Inexistante
En production, `synchronize: false` est activé (sécurité), donc TypeORM ne crée pas automatiquement les tables.

### 3. Pas de Volume pour les Uploads
Les fichiers uploadés n'étaient pas persistés entre les redémarrages.

---

## Solution Manuelle (si le script ne fonctionne pas)

### Étape 1: Créer le répertoire uploads

```bash
docker exec atelier-kaisla-backend-prod mkdir -p /app/uploads
docker exec atelier-kaisla-backend-prod chown nestjs:nodejs /app/uploads
```

### Étape 2: Créer la table products

```bash
# Remplacer kaisla_admin et atelier_kaisla_prod par vos valeurs si différentes
docker exec -i atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod << 'EOF'
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(20) NOT NULL CHECK (category IN ('wall-hanging', 'rug')),
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('available', 'sold', 'draft')),
    stock_quantity INT DEFAULT 0,
    images TEXT,
    dimensions JSON,
    materials TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status);
EOF
```

### Étape 3: Redémarrer le backend

```bash
docker restart atelier-kaisla-backend-prod
```

### Étape 4: Vérifier

```bash
# Voir les logs
docker logs -f atelier-kaisla-backend-prod

# Tester l'API
curl https://api.lebowvsky.com/api/health
curl https://api.lebowvsky.com/api/products
```

---

## Corrections Permanentes Appliquées

Les corrections suivantes ont été appliquées au code (commit nécessaire):

### 1. Dockerfile Backend
Le répertoire `/app/uploads` est maintenant créé automatiquement.

### 2. docker-compose.prod.yml
Un volume `uploads_prod` a été ajouté pour persister les fichiers uploadés.

### 3. Script SQL d'initialisation
`docker/postgres/init-scripts/02-create-products-table.sql` crée automatiquement la table products lors de la première initialisation.

### 4. Logs CORS améliorés
Les logs CORS utilisent maintenant `logger.log` au lieu de `logger.debug` pour être visibles en production.

---

## Déployer les Corrections Permanentes

Pour appliquer les corrections de manière permanente:

```bash
# 1. Commit les changements (en local)
git add .
git commit -m "fix(production): resolve 500 errors - add uploads dir and db table"
git push

# 2. Sur le serveur Dokploy
cd /path/to/atelier-kaisla
git pull

# 3. Rebuild les conteneurs
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 4. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Vérification Post-Correction

Après avoir appliqué les corrections, tous ces tests doivent réussir:

```bash
# 1. Backend démarre correctement
docker logs atelier-kaisla-backend-prod | grep "🚀 Backend API is running"
# Attendu: 🚀 Backend API is running on: http://localhost:4000/api

# 2. Connexion à la base de données
docker logs atelier-kaisla-backend-prod | grep "Database"
# Attendu: 🗄️  Database: atelier_kaisla_prod

# 3. CORS configuré
docker logs atelier-kaisla-backend-prod | grep "CORS enabled"
# Attendu: 🌐 CORS enabled for origins: https://kaisla.lebowvsky.com, https://bokaisla.lebowvsky.com

# 4. Health check
curl https://api.lebowvsky.com/api/health
# Attendu: {"status":"ok","timestamp":"..."}

# 5. Liste des produits
curl https://api.lebowvsky.com/api/products
# Attendu: [] ou [{"id":"...","name":"...",...}]

# 6. Table products existe
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "\dt"
# Attendu: Liste des tables incluant "products"

# 7. Répertoire uploads existe
docker exec atelier-kaisla-backend-prod ls -la /app/uploads
# Attendu: Répertoire existant avec propriétaire nestjs:nodejs
```

---

## Si les Problèmes Persistent

### 1. Vérifier les logs détaillés

```bash
# Backend
docker logs --tail 200 atelier-kaisla-backend-prod

# PostgreSQL
docker logs --tail 100 atelier-kaisla-postgres-prod
```

### 2. Vérifier les variables d'environnement

```bash
docker exec atelier-kaisla-backend-prod env | grep -E "NODE_ENV|DATABASE|FRONTEND|BACKOFFICE"
```

Variables attendues:
- `NODE_ENV=production`
- `DATABASE_HOST=postgres`
- `DATABASE_NAME=atelier_kaisla_prod`
- `DATABASE_USER=kaisla_admin`
- `FRONTEND_URL=https://kaisla.lebowvsky.com`
- `BACKOFFICE_URL=https://bokaisla.lebowvsky.com`

### 3. Tester la connexion PostgreSQL

```bash
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "SELECT version();"
```

### 4. Consulter les guides détaillés

- `PRODUCTION-TROUBLESHOOTING.md` - Guide complet de diagnostic
- `PRODUCTION-FIXES.md` - Détails des corrections et explications techniques

---

## Commandes Utiles

### Redémarrage complet

```bash
docker compose -f docker-compose.prod.yml restart
```

### Rebuild complet (si nécessaire)

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Voir l'état des conteneurs

```bash
docker compose -f docker-compose.prod.yml ps
```

### Suivre les logs en temps réel

```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Seulement le backend
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Support

Si après avoir suivi ce guide le problème persiste:

1. Collectez les logs:
```bash
docker logs atelier-kaisla-backend-prod > backend-logs.txt
docker logs atelier-kaisla-postgres-prod > postgres-logs.txt
docker ps -a > containers-status.txt
```

2. Vérifiez les variables d'environnement (en masquant les mots de passe)

3. Consultez les fichiers de troubleshooting détaillés dans le projet
