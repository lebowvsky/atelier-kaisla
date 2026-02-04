# Configuration des domaines avec Dokploy

## Problème résolu

Le backoffice affichait une 404 à cause de **conflits de labels Traefik** entre le docker-compose.prod.yml et la configuration automatique de Dokploy.

**Solution**: Les labels Traefik ont été supprimés du docker-compose. Le routage se configure maintenant entièrement via l'interface Dokploy.

## Configuration des domaines dans Dokploy

### 1. Accéder à l'interface Dokploy

Connectez-vous sur `https://dokploy.lebowvsky.com`

### 2. Configurer les domaines pour chaque service

Pour chaque service (Frontend, Backend, Backoffice), vous devez ajouter le domaine personnalisé:

#### Frontend (kaisla.lebowvsky.com)

1. Cliquez sur votre application/projet (probablement nommé `atelier-kaisla-frontend-wcr1nx`)
2. Cherchez le service **frontend**
3. Trouvez la section **"Domains"** ou **"Routing"**
4. Ajoutez le domaine: `kaisla.lebowvsky.com`
5. Activez **HTTPS/SSL** (Let's Encrypt)
6. Spécifiez le **port interne**: `3000`
7. Sauvegardez

#### Backend API (api.lebowvsky.com)

1. Trouvez le service **backend**
2. Ajoutez le domaine: `api.lebowvsky.com`
3. Activez **HTTPS/SSL**
4. Port interne: `4000`
5. Sauvegardez

#### Backoffice (bokaisla.lebowvsky.com) ⭐ Principal problème

1. Trouvez le service **backoffice**
2. Ajoutez le domaine: `bokaisla.lebowvsky.com`
3. Activez **HTTPS/SSL**
4. Port interne: `3000`
5. Sauvegardez

### 3. Redéployer si nécessaire

Après avoir ajouté les domaines dans Dokploy:

1. Cliquez sur **"Redeploy"** ou **"Restart"** pour chaque service
2. Attendez que Traefik détecte les changements (quelques secondes)
3. Les certificats SSL seront générés automatiquement

## Vérification

Une fois configuré, vérifiez que chaque URL fonctionne:

```bash
curl -I https://kaisla.lebowvsky.com
curl -I https://api.lebowvsky.com/health
curl -I https://bokaisla.lebowvsky.com
```

Tous devraient retourner un code HTTP 200 (ou 301/302 pour les redirections).

## Alternative: Configuration via CLI Dokploy

Si Dokploy propose un CLI, vous pouvez aussi configurer les domaines en ligne de commande:

```bash
# Exemple (vérifiez la documentation Dokploy pour la syntaxe exacte)
dokploy domain add --service=backoffice --domain=bokaisla.lebowvsky.com --port=3000 --ssl=true
```

## Structure de l'interface Dokploy (guide général)

Selon les versions de Dokploy, l'interface peut varier. Cherchez:

### Navigation typique:
```
Projects → Atelier Kaisla → Services → [Service] → Settings/Domains
```

ou

```
Applications → [Application Name] → Domain Settings
```

### Champs à remplir:
- **Domain**: `bokaisla.lebowvsky.com`
- **Container Port**: `3000`
- **Enable SSL**: ✅ (Let's Encrypt)
- **Force HTTPS**: ✅ (redirection HTTP → HTTPS)

## Résolution des conflits (si problème persiste)

Si après configuration le backoffice ne fonctionne toujours pas:

### 1. Vérifier qu'il n'y a plus de conflits Traefik

```bash
sudo docker logs dokploy-traefik --tail 50 | grep -i "cannot be linked"
```

Cette commande ne devrait plus afficher d'erreurs.

### 2. Supprimer les anciens labels

Si des labels persistent sur les containers existants:

```bash
# Arrêter tous les services
sudo docker compose -f /etc/dokploy/compose/atelier-kaisla-frontend-wcr1nx/code/docker-compose.prod.yml down

# Redéployer via Dokploy (interface web)
# Ou en SSH:
cd /etc/dokploy/compose/atelier-kaisla-frontend-wcr1nx/code
git pull
sudo docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Vérifier les labels actuels

```bash
sudo docker inspect atelier-kaisla-backoffice-prod | grep "traefik.http.routers"
```

Vous devriez voir uniquement les routers créés par Dokploy (avec le préfixe du projet).

### 4. Vérifier que Traefik détecte le service

Accédez au dashboard Traefik (si activé):
- URL: `https://dokploy.lebowvsky.com:8080` (ou le port configuré)
- Cherchez le router `bokaisla.lebowvsky.com`
- Vérifiez qu'il pointe vers le bon service et port

## Points importants

### ✅ Ce qui est configuré dans docker-compose.prod.yml

- Variables d'environnement (CORS, URLs d'API)
- Ports internes exposés (`expose: 3000`)
- Réseaux Docker
- Health checks
- Configuration des applications

### ❌ Ce qui N'est PAS dans docker-compose.prod.yml

- Labels Traefik (supprimés pour éviter les conflits)
- Domaines personnalisés (gérés par Dokploy)
- Certificats SSL (gérés par Dokploy/Traefik)

### 📝 Variables d'environnement importantes

Le docker-compose conserve ces variables essentielles:

```yaml
environment:
  FRONTEND_URL: https://kaisla.lebowvsky.com
  BACKOFFICE_URL: https://bokaisla.lebowvsky.com
  NUXT_PUBLIC_API_URL: https://api.lebowvsky.com
```

Ces URLs sont utilisées pour:
- Configuration CORS du backend
- Requêtes API depuis le navigateur
- Redirections et liens internes

## Déploiement des changements

### Via Git + Dokploy (recommandé)

```bash
# Sur votre machine locale
git add docker-compose.prod.yml
git commit -m "fix: remove Traefik labels to avoid conflicts with Dokploy"
git push origin main

# Dokploy détectera automatiquement les changements et redéploiera
# Ou cliquez sur "Redeploy" dans l'interface
```

### Via SSH manuel

```bash
ssh lebowvsky@<IP_VPS>
cd /etc/dokploy/compose/atelier-kaisla-frontend-wcr1nx/code
git pull origin main
sudo docker compose -f docker-compose.prod.yml up -d --build
```

## Documentation Dokploy

Pour plus d'informations sur la configuration des domaines:

- Documentation officielle: https://docs.dokploy.com
- Section "Custom Domains": https://docs.dokploy.com/docs/core/domains
- Discord Dokploy: https://discord.gg/dokploy

## Prochaines étapes après résolution

Une fois que les trois domaines fonctionnent:

1. ✅ Tester toutes les fonctionnalités du frontend
2. ✅ Tester l'accès au backoffice
3. ✅ Vérifier que les requêtes API fonctionnent (frontend → backend)
4. ✅ Vérifier que les requêtes API fonctionnent (backoffice → backend)
5. ✅ Tester l'upload d'images et autres fonctionnalités
6. 📊 Configurer un monitoring (Sentry, logs, alertes)
7. 💾 Mettre en place des backups automatiques de la base de données
