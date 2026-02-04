# Guide de déploiement Dokploy

## Problème résolu

Le backoffice n'était pas accessible sur `https://bokaisla.lebowvsky.com` car le `docker-compose.prod.yml` manquait les **labels Traefik** nécessaires pour que Dokploy puisse router le trafic.

## Modifications apportées

### 1. Ajout des labels Traefik

Les labels suivants ont été ajoutés à chaque service exposé (backend, frontend, backoffice):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<service>.rule=Host(`<domain>`)"
  - "traefik.http.routers.<service>.entrypoints=websecure"
  - "traefik.http.routers.<service>.tls.certresolver=letsencrypt"
  - "traefik.http.services.<service>.loadbalancer.server.port=<port>"
```

### 2. Configuration des domaines

- **Backend**: `api.lebowvsky.com` (port 4000)
- **Frontend**: `kaisla.lebowvsky.com` (port 3000)
- **Backoffice**: `bokaisla.lebowvsky.com` (port 3000)

### 3. Remplacement de `ports` par `expose`

Les directives `ports:` ont été remplacées par `expose:` pour éviter les conflits de ports et laisser Traefik gérer l'accès externe.

### 4. Mise à jour des URLs d'API

Les variables d'environnement `NUXT_PUBLIC_API_URL` pointent maintenant vers `https://api.lebowvsky.com` au lieu de `http://backend:4000`.

## Configuration DNS requise

Assurez-vous que les enregistrements DNS suivants sont configurés dans votre zone DNS OVH:

```
api.lebowvsky.com      A    <IP_DE_VOTRE_VPS>
kaisla.lebowvsky.com   A    <IP_DE_VOTRE_VPS>
bokaisla.lebowvsky.com A    <IP_DE_VOTRE_VPS>
```

## Étapes de déploiement avec Dokploy

### Option A: Déploiement via l'interface Dokploy (recommandé)

1. Connectez-vous à `https://dokploy.lebowvsky.com`

2. Créez ou sélectionnez votre projet "Atelier Kaisla"

3. Pour chaque service (backend, frontend, backoffice):
   - Cliquez sur "Add Application" ou "Compose"
   - Sélectionnez votre repository Git
   - Choisissez la branche `main`
   - Spécifiez le fichier: `docker-compose.prod.yml`
   - Cliquez sur "Deploy"

4. Vérifiez les logs de déploiement pour chaque service

5. Une fois déployé, Traefik devrait automatiquement:
   - Détecter les services via les labels
   - Générer des certificats SSL Let's Encrypt
   - Router le trafic vers les bons containers

### Option B: Déploiement manuel via SSH

Si vous préférez déployer manuellement:

```bash
# Connectez-vous à votre VPS
ssh user@lebowvsky.com

# Naviguez vers votre projet
cd /path/to/atelier-kaisla

# Tirez les dernières modifications
git pull origin main

# Créez le fichier .env de production
cp .env.prod.example .env
nano .env  # Configurez vos variables

# Déployez avec Docker Compose
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Vérifiez les logs
docker compose -f docker-compose.prod.yml logs -f
```

## Vérification du déploiement

### 1. Vérifier que les containers sont démarrés

```bash
docker compose -f docker-compose.prod.yml ps
```

Tous les services devraient être en état "Up" et "healthy".

### 2. Vérifier les labels Traefik

```bash
docker inspect atelier-kaisla-backoffice-prod | grep traefik
```

Vous devriez voir tous les labels Traefik configurés.

### 3. Tester les URLs

```bash
# Backend API
curl -I https://api.lebowvsky.com/health

# Frontend
curl -I https://kaisla.lebowvsky.com

# Backoffice
curl -I https://bokaisla.lebowvsky.com
```

Tous devraient retourner un code HTTP 200 ou 301/302.

### 4. Vérifier les certificats SSL

Ouvrez chaque URL dans votre navigateur et vérifiez que:
- Le cadenas SSL est vert
- Le certificat est émis par Let's Encrypt
- Aucun avertissement de sécurité n'apparaît

## Dépannage

### Le backoffice renvoie toujours 404

1. Vérifiez que le container est bien démarré:
   ```bash
   docker ps | grep backoffice
   ```

2. Vérifiez les logs du backoffice:
   ```bash
   docker logs atelier-kaisla-backoffice-prod
   ```

3. Vérifiez les logs de Traefik:
   ```bash
   docker logs traefik  # ou le nom du container Traefik de Dokploy
   ```

4. Vérifiez que Traefik détecte bien le service:
   ```bash
   # Via l'API Traefik (si activée)
   curl http://localhost:8080/api/http/routers
   ```

### Certificat SSL non généré

Si Let's Encrypt ne génère pas le certificat:

1. Vérifiez que les DNS pointent bien vers votre VPS
2. Attendez quelques minutes (propagation DNS)
3. Redémarrez Traefik:
   ```bash
   docker restart <traefik_container>
   ```

### Erreur CORS sur l'API

Si le frontend/backoffice ne peut pas communiquer avec l'API:

1. Vérifiez la configuration CORS dans le backend (`apps/backend/src/main.ts`)
2. Ajoutez les domaines autorisés:
   ```typescript
   app.enableCors({
     origin: [
       'https://kaisla.lebowvsky.com',
       'https://bokaisla.lebowvsky.com'
     ],
     credentials: true
   });
   ```

### Port déjà utilisé

Si vous obtenez une erreur "port already in use":

1. Vérifiez que vous utilisez bien `expose:` au lieu de `ports:` dans le docker-compose
2. Arrêtez les containers conflictuels:
   ```bash
   docker stop $(docker ps -q --filter "publish=3001")
   ```

## Variables d'environnement de production

Créez un fichier `.env` à la racine du projet avec:

```bash
# Base de données
POSTGRES_DB=atelier_kaisla_prod
POSTGRES_USER=kaisla_admin
POSTGRES_PASSWORD=CHANGE_ME_SECURE_PASSWORD

# API
API_URL=https://api.lebowvsky.com

# Nuxt
NODE_ENV=production
```

**IMPORTANT**: Ne committez JAMAIS le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

## Monitoring

### Vérifier l'état des services

```bash
# Tous les services
docker compose -f docker-compose.prod.yml ps

# Utilisation des ressources
docker stats

# Logs en temps réel
docker compose -f docker-compose.prod.yml logs -f
```

### Health checks

Les health checks sont configurés pour tous les services. Vérifiez leur état:

```bash
docker inspect --format='{{json .State.Health}}' atelier-kaisla-backend-prod | jq
docker inspect --format='{{json .State.Health}}' atelier-kaisla-frontend-prod | jq
docker inspect --format='{{json .State.Health}}' atelier-kaisla-backoffice-prod | jq
```

## Rollback en cas de problème

Si le nouveau déploiement ne fonctionne pas:

```bash
# Arrêter les services
docker compose -f docker-compose.prod.yml down

# Revenir au commit précédent
git revert HEAD

# Redéployer
docker compose -f docker-compose.prod.yml up -d --build
```

## Prochaines étapes

Une fois le déploiement fonctionnel:

1. Configurez des sauvegardes automatiques de la base de données
2. Mettez en place un monitoring (Prometheus + Grafana)
3. Configurez des alertes (Sentry, email, Slack)
4. Ajoutez un CI/CD pipeline (GitHub Actions)
5. Configurez des backups réguliers des volumes Docker

## Support

En cas de problème persistant:

1. Consultez les logs Dokploy
2. Vérifiez la documentation Dokploy: https://docs.dokploy.com
3. Consultez la documentation Traefik: https://doc.traefik.io/traefik/
