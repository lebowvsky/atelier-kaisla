# Guide de Troubleshooting Production - Erreurs 500

## Diagnostic des Erreurs 500 sur Dokploy

Ce guide vous aide à identifier et résoudre les erreurs 500 du backend en production.

---

## Étape 1: Vérifier les Logs du Backend

Les logs du backend contiennent les informations cruciales pour identifier la cause des erreurs 500.

### Commandes Dokploy

```bash
# Voir les logs du backend en temps réel
docker logs -f atelier-kaisla-backend-prod

# Voir les 100 dernières lignes
docker logs --tail 100 atelier-kaisla-backend-prod

# Rechercher des erreurs spécifiques
docker logs atelier-kaisla-backend-prod 2>&1 | grep -i "error"
docker logs atelier-kaisla-backend-prod 2>&1 | grep -i "failed"
docker logs atelier-kaisla-backend-prod 2>&1 | grep -i "exception"
```

### Ce que vous devriez voir au démarrage

Un démarrage réussi affiche:
```
🚀 Backend API is running on: http://localhost:4000/api
📚 API Documentation: http://localhost:4000/api/docs
🌍 Environment: production
🗄️  Database: atelier_kaisla_prod
🌐 CORS enabled for origins: https://kaisla.lebowvsky.com, https://bokaisla.lebowvsky.com
```

### Erreurs Fréquentes à Rechercher

1. **Erreur de connexion à la base de données**
```
❌ Failed to start application: Error: connect ECONNREFUSED
```

2. **Variables d'environnement manquantes**
```
ValidationError: "POSTGRES_PASSWORD" is required
```

3. **Erreur CORS**
```
❌ CORS blocked for origin: https://kaisla.lebowvsky.com
```

4. **Erreur TypeORM**
```
QueryFailedError: relation "products" does not exist
```

---

## Étape 2: Vérifier l'État des Conteneurs

### Vérifier que tous les conteneurs sont en cours d'exécution

```bash
# Voir le statut de tous les conteneurs
docker ps -a | grep atelier-kaisla

# Vérifier le statut complet avec Docker Compose
docker compose -f docker-compose.prod.yml ps
```

### États Attendus

Tous les conteneurs doivent avoir le statut `Up` et être `healthy`:
```
atelier-kaisla-backend-prod     Up (healthy)
atelier-kaisla-postgres-prod    Up (healthy)
atelier-kaisla-frontend-prod    Up (healthy)
atelier-kaisla-backoffice-prod  Up (healthy)
```

### Si un conteneur est `unhealthy` ou `restarting`

```bash
# Voir pourquoi le health check échoue
docker inspect atelier-kaisla-backend-prod | grep -A 20 "Health"

# Redémarrer le conteneur
docker restart atelier-kaisla-backend-prod
```

---

## Étape 3: Vérifier la Base de Données PostgreSQL

### Connexion à PostgreSQL

```bash
# Accéder au shell PostgreSQL
docker exec -it atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod

# Ou avec les variables d'environnement de production
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod
```

### Vérifications dans PostgreSQL

```sql
-- Lister toutes les tables
\dt

-- Vérifier que la table products existe
SELECT * FROM products LIMIT 1;

-- Vérifier le nombre de produits
SELECT COUNT(*) FROM products;

-- Voir la structure de la table
\d products

-- Quitter PostgreSQL
\q
```

### Si la table n'existe pas

La table `products` doit être créée. Le backend utilise `synchronize: false` en production pour la sécurité.

**Solution**: Vous devez créer la table manuellement ou exécuter les migrations.

```bash
# Option 1: Créer la table manuellement (via psql)
docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status);
"

# Option 2: Activer temporairement synchronize (ATTENTION: RISQUÉ)
# Ajouter TYPEORM_SYNC=true dans les variables d'environnement backend
# puis redémarrer le conteneur backend
```

---

## Étape 4: Vérifier les Variables d'Environnement

### Voir les variables d'environnement du backend

```bash
# Afficher toutes les variables d'environnement
docker exec atelier-kaisla-backend-prod env | grep -E "NODE_ENV|PORT|DATABASE|POSTGRES|FRONTEND|BACKOFFICE"
```

### Variables Requises

Le backend nécessite ces variables:
```bash
NODE_ENV=production
PORT=4000
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=atelier_kaisla_prod
DATABASE_USER=kaisla_admin
DATABASE_PASSWORD=<votre_mot_de_passe_sécurisé>
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
```

### Vérifier le fichier .env sur le serveur

```bash
# Sur le serveur Dokploy, vérifier le fichier .env
cat .env | grep -v PASSWORD  # Afficher sans les mots de passe

# Vérifier que le mot de passe est bien défini
grep -q "POSTGRES_PASSWORD=CHANGEZ_MOI" .env && echo "⚠️  ATTENTION: Mot de passe par défaut détecté!" || echo "✅ Mot de passe personnalisé"
```

---

## Étape 5: Tester la Connectivité

### Test du Health Check

```bash
# Depuis le serveur Dokploy
curl http://localhost:4000/health

# Devrait retourner:
# {"status":"ok","timestamp":"2026-02-05T..."}
```

### Test via Traefik/API publique

```bash
# Tester l'API publique
curl https://api.lebowvsky.com/api/health

# Tester un endpoint protégé (produits)
curl https://api.lebowvsky.com/api/products
```

### Test de connexion réseau entre conteneurs

```bash
# Depuis le conteneur backend, ping postgres
docker exec atelier-kaisla-backend-prod wget --spider http://localhost:4000/health

# Vérifier la résolution DNS de postgres
docker exec atelier-kaisla-backend-prod ping -c 2 postgres
```

---

## Étape 6: Vérifier le Répertoire Uploads

Le backend sert les images uploadées depuis le répertoire `uploads/`.

```bash
# Vérifier si le répertoire uploads existe dans le conteneur
docker exec atelier-kaisla-backend-prod ls -la /app/uploads

# Si le répertoire n'existe pas, le créer
docker exec atelier-kaisla-backend-prod mkdir -p /app/uploads
docker exec atelier-kaisla-backend-prod chown -R nestjs:nodejs /app/uploads
```

---

## Étape 7: Vérifier la Configuration Traefik/Dokploy

### Vérifier les labels Traefik du backend

```bash
# Inspecter les labels du conteneur backend
docker inspect atelier-kaisla-backend-prod | grep -A 30 "Labels"
```

### Labels Attendus

Le conteneur backend doit avoir des labels Traefik similaires à:
```yaml
traefik.enable=true
traefik.http.routers.backend.rule=Host(`api.lebowvsky.com`)
traefik.http.routers.backend.entrypoints=websecure
traefik.http.routers.backend.tls=true
traefik.http.services.backend.loadbalancer.server.port=4000
```

---

## Solutions aux Problèmes Courants

### Problème 1: Database Connection Refused

**Symptôme**: Logs montrent `Error: connect ECONNREFUSED postgres:5432`

**Causes possibles**:
1. PostgreSQL n'est pas démarré
2. Mauvais nom d'hôte (doit être `postgres`)
3. Mauvaises credentials

**Solution**:
```bash
# Vérifier que PostgreSQL est healthy
docker ps | grep postgres

# Redémarrer PostgreSQL si nécessaire
docker restart atelier-kaisla-postgres-prod

# Attendre que PostgreSQL soit prêt
docker logs -f atelier-kaisla-postgres-prod

# Puis redémarrer le backend
docker restart atelier-kaisla-backend-prod
```

### Problème 2: Table "products" Does Not Exist

**Symptôme**: `QueryFailedError: relation "products" does not exist`

**Cause**: La base de données n'a pas été initialisée avec la structure des tables.

**Solution**: Voir Étape 3 ci-dessus pour créer la table.

### Problème 3: CORS Errors

**Symptôme**: Frontend affiche des erreurs CORS dans la console

**Cause**: Le backend bloque les requêtes du frontend

**Solution**:
```bash
# Vérifier que FRONTEND_URL et BACKOFFICE_URL sont correctement définis
docker exec atelier-kaisla-backend-prod env | grep -E "FRONTEND_URL|BACKOFFICE_URL"

# Ils doivent être:
# FRONTEND_URL=https://kaisla.lebowvsky.com
# BACKOFFICE_URL=https://bokaisla.lebowvsky.com

# Si incorrect, modifier le .env et redémarrer
docker restart atelier-kaisla-backend-prod
```

### Problème 4: Container Unhealthy

**Symptôme**: `docker ps` montre le statut `unhealthy` pour le backend

**Cause**: Le health check échoue (endpoint `/health` ne répond pas)

**Solution**:
```bash
# Tester le health check manuellement
docker exec atelier-kaisla-backend-prod wget --spider http://localhost:4000/health

# Si ça échoue, voir les logs
docker logs --tail 50 atelier-kaisla-backend-prod

# Redémarrer le conteneur
docker restart atelier-kaisla-backend-prod
```

### Problème 5: Variables d'Environnement Manquantes

**Symptôme**: Logs montrent `ValidationError: "POSTGRES_PASSWORD" is required`

**Cause**: Le fichier `.env` n'est pas correctement configuré

**Solution**:
```bash
# Vérifier le fichier .env sur le serveur
cat .env

# S'assurer que toutes les variables requises sont présentes
# Voir la section "Variables Requises" ci-dessus

# Recréer les conteneurs avec les nouvelles variables
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## Commandes de Redémarrage Complet

Si vous avez modifié la configuration ou les variables d'environnement:

```bash
# Arrêter tous les conteneurs
docker compose -f docker-compose.prod.yml down

# Vérifier qu'ils sont bien arrêtés
docker ps -a | grep atelier-kaisla

# Redémarrer avec la nouvelle configuration
docker compose -f docker-compose.prod.yml up -d

# Suivre les logs de tous les services
docker compose -f docker-compose.prod.yml logs -f
```

---

## Rebuild Complet (en cas de problème persistant)

Si les problèmes persistent après toutes les étapes ci-dessus:

```bash
# Arrêter tous les conteneurs
docker compose -f docker-compose.prod.yml down

# Supprimer les images (ATTENTION: va forcer un rebuild)
docker rmi atelier-kaisla-backend-prod atelier-kaisla-frontend-prod atelier-kaisla-backoffice-prod

# Rebuild et redémarrer
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Vérifier le démarrage
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Checklist de Vérification Rapide

Utilisez cette checklist pour vérifier rapidement l'état du système:

- [ ] PostgreSQL est `healthy`: `docker ps | grep postgres`
- [ ] Backend est `healthy`: `docker ps | grep backend`
- [ ] Health check répond: `curl http://localhost:4000/health`
- [ ] Variables d'environnement correctes: `docker exec atelier-kaisla-backend-prod env`
- [ ] Table products existe: `docker exec -it atelier-kaisla-postgres-prod psql -U kaisla_admin -d atelier_kaisla_prod -c "\dt"`
- [ ] Logs backend sans erreurs: `docker logs --tail 50 atelier-kaisla-backend-prod`
- [ ] CORS configuré: Logs montrent les origins autorisées
- [ ] API publique accessible: `curl https://api.lebowvsky.com/api/health`

---

## Obtenir de l'Aide

Si après avoir suivi toutes ces étapes le problème persiste, collectez ces informations:

```bash
# Sauvegarder les logs
docker logs atelier-kaisla-backend-prod > backend-logs.txt
docker logs atelier-kaisla-postgres-prod > postgres-logs.txt

# État des conteneurs
docker ps -a > containers-status.txt

# Variables d'environnement (masquer les mots de passe)
docker exec atelier-kaisla-backend-prod env | grep -v PASSWORD > backend-env.txt
```

Partagez ces fichiers avec votre équipe ou sur un canal de support.
