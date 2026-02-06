# Corrections pour les Erreurs 500 en Production

## Problèmes Identifiés dans la Configuration Actuelle

Après analyse du code, voici les problèmes potentiels qui peuvent causer des erreurs 500:

---

## Problème 1: Répertoire Uploads Manquant (CRITIQUE)

### Description
Le backend sert les fichiers statiques depuis `/app/uploads`, mais ce répertoire n'est pas créé dans le Dockerfile de production. Cela peut causer:
- Erreur 500 au démarrage si NestJS ne peut pas servir les fichiers statiques
- Erreur 500 lors de l'upload de produits

### Fichier: `apps/backend/Dockerfile`

### Solution

Le Dockerfile doit créer le répertoire `uploads` et lui donner les bonnes permissions:

```dockerfile
# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Installer wget pour les health checks
RUN apk add --no-cache wget

# Installer seulement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier les fichiers buildés depuis le builder
COPY --from=builder /app/dist ./dist

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# AJOUT: Créer le répertoire uploads avec les bonnes permissions
RUN mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 4000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de production
CMD ["node", "dist/main.js"]
```

### Application de la Correction

```bash
# Sur le serveur Dokploy, après avoir modifié le Dockerfile:
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
```

---

## Problème 2: Volume Uploads Non Persistant

### Description
Les fichiers uploadés sont stockés dans le conteneur. Si le conteneur redémarre, les uploads sont perdus.

### Solution: Utiliser un Volume Docker

Modifier `docker-compose.prod.yml`:

```yaml
services:
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: production
    container_name: atelier-kaisla-backend-prod
    restart: always
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${POSTGRES_DB:-atelier_kaisla_prod}
      DATABASE_USER: ${POSTGRES_USER:-postgres}
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
      FRONTEND_URL: https://kaisla.lebowvsky.com
      BACKOFFICE_URL: https://bokaisla.lebowvsky.com
    volumes:
      # AJOUT: Persister les uploads
      - uploads_prod:/app/uploads
    expose:
      - "4000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - atelier-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data_prod:
    driver: local
  # AJOUT: Volume pour les uploads
  uploads_prod:
    driver: local
```

---

## Problème 3: Base de Données Non Initialisée

### Description
En production, `synchronize: false` est activé (bonne pratique de sécurité), mais cela signifie que les tables ne sont pas créées automatiquement.

### Solution 1: Migration SQL Manuelle

Créer un script d'initialisation: `docker/postgres/init-scripts/02-create-products-table.sql`

```sql
-- Create products table if it doesn't exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status);

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Note**: Ce script ne s'exécute que lors de la première initialisation de la base de données. Si la base existe déjà, il faut l'exécuter manuellement.

### Solution 2: Exécution Manuelle (Base Existante)

Si la base de données existe déjà:

```bash
# Créer le fichier SQL localement, puis l'exécuter
docker exec -i atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod < docker/postgres/init-scripts/02-create-products-table.sql
```

---

## Problème 4: Pas de Logs Détaillés en Production

### Description
En production, le backend loge seulement les erreurs. Cela rend le debugging difficile.

### Solution Temporaire pour le Debug

Ajouter une variable d'environnement dans `docker-compose.prod.yml`:

```yaml
backend:
  environment:
    # ... autres variables ...
    # AJOUT TEMPORAIRE: Activer les logs de requêtes pour le debug
    TYPEORM_LOGGING: "true"
```

**IMPORTANT**: Retirer cette variable une fois le problème résolu (impact sur les performances).

---

## Problème 5: Health Check Trop Strict

### Description
Le health check actuel teste l'endpoint `/health`, mais sans le préfixe `/api`.

Vérification dans `apps/backend/src/app.controller.ts`:
- L'endpoint est `@Get('health')` dans le `AppController`
- Le controller n'a pas de préfixe
- Donc l'endpoint est accessible à `/health` (sans `/api`)

### État Actuel
Le health check dans `docker-compose.prod.yml` est **correct**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/health"]
```

✅ **Pas de correction nécessaire sur ce point.**

---

## Problème 6: CORS - Origine Traefik

### Description
Traefik peut ajouter des headers qui modifient l'origin. Le backend pourrait bloquer les requêtes.

### Solution: Vérification et Ajout de Logs

Dans `apps/backend/src/main.ts`, la configuration CORS actuelle:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      logger.debug(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  // ... reste de la config ...
});
```

**Problème**: En production, `logger.debug` n'affiche rien car le niveau de log est trop élevé.

**Solution**: Utiliser `logger.log` au lieu de `logger.debug` pour voir les origins dans les logs:

```typescript
if (allowedOrigins.includes(origin)) {
  logger.log(`✅ CORS allowed for origin: ${origin}`);
  callback(null, true);
} else {
  logger.warn(`❌ CORS blocked for origin: ${origin}`);
  callback(new Error('Not allowed by CORS'));
}
```

---

## Plan d'Action Recommandé

### Étape 1: Corrections Immédiates (Sans Rebuild)

```bash
# 1. Créer le répertoire uploads dans le conteneur existant
docker exec atelier-kaisla-backend-prod mkdir -p /app/uploads
docker exec atelier-kaisla-backend-prod chown nestjs:nodejs /app/uploads

# 2. Créer la table products si elle n'existe pas
docker exec -i atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod << EOF
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

# 3. Redémarrer le backend pour appliquer les changements
docker restart atelier-kaisla-backend-prod

# 4. Vérifier les logs
docker logs -f atelier-kaisla-backend-prod
```

### Étape 2: Tester l'API

```bash
# Test health check
curl https://api.lebowvsky.com/api/health

# Test liste des produits
curl https://api.lebowvsky.com/api/products

# Si ça fonctionne, vous devriez voir un JSON avec la liste des produits
```

### Étape 3: Corrections Permanentes (Avec Rebuild)

Une fois que le système fonctionne, appliquer les corrections permanentes:

1. Modifier `apps/backend/Dockerfile` (voir Problème 1)
2. Modifier `docker-compose.prod.yml` (voir Problème 2)
3. Créer `docker/postgres/init-scripts/02-create-products-table.sql` (voir Problème 3)
4. Modifier `apps/backend/src/main.ts` pour les logs CORS (voir Problème 6)

Puis rebuild:

```bash
# Commit les changements
git add .
git commit -m "fix(production): add uploads directory and persistent volume"
git push

# Sur le serveur Dokploy
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## Vérification Post-Correction

Après avoir appliqué les corrections, vérifier:

```bash
# 1. Backend démarre sans erreur
docker logs --tail 100 atelier-kaisla-backend-prod | grep "🚀 Backend API is running"

# 2. Connexion DB réussie
docker logs --tail 100 atelier-kaisla-backend-prod | grep "Database"

# 3. CORS configuré
docker logs --tail 100 atelier-kaisla-backend-prod | grep "CORS enabled"

# 4. Table products existe
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "\dt"

# 5. Répertoire uploads existe
docker exec atelier-kaisla-backend-prod ls -la /app/uploads

# 6. API répond
curl https://api.lebowvsky.com/api/health
curl https://api.lebowvsky.com/api/products

# 7. Frontend peut accéder à l'API
curl -H "Origin: https://kaisla.lebowvsky.com" https://api.lebowvsky.com/api/products
```

Tous ces tests doivent réussir sans erreur 500.
