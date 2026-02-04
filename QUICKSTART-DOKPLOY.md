# Démarrage rapide - Déploiement Dokploy

## Changements effectués ✅

1. **Labels Traefik ajoutés** au `docker-compose.prod.yml` pour tous les services
2. **Configuration CORS** mise à jour dans le backend
3. **Variables d'environnement** de production configurées
4. **Domaines configurés**:
   - Frontend: `kaisla.lebowvsky.com`
   - Backoffice: `bokaisla.lebowvsky.com`
   - Backend API: `api.lebowvsky.com`

## Configuration DNS (OVH)

Ajoutez ces enregistrements A dans votre zone DNS:

```
api.lebowvsky.com      A    <IP_DE_VOTRE_VPS>
kaisla.lebowvsky.com   A    <IP_DE_VOTRE_VPS>
bokaisla.lebowvsky.com A    <IP_DE_VOTRE_VPS>
```

## Étapes de déploiement

### 1. Préparer l'environnement local

```bash
# Copier le fichier d'exemple
cp .env.prod.example .env

# Modifier le fichier .env
nano .env

# IMPORTANT: Changez le mot de passe PostgreSQL
# POSTGRES_PASSWORD=un_mot_de_passe_tres_securise
```

### 2. Commiter et pousser les changements

```bash
git add docker-compose.prod.yml .env.prod.example
git commit -m "feat: add Traefik labels for Dokploy deployment"
git push origin main
```

### 3. Déployer sur Dokploy

**Option A: Via l'interface Dokploy (recommandé)**

1. Ouvrez `https://dokploy.lebowvsky.com`
2. Allez dans votre projet "Atelier Kaisla"
3. Cliquez sur "Deploy" ou "Redeploy"
4. Attendez la fin du déploiement

**Option B: Via SSH sur le VPS**

```bash
ssh user@<IP_VPS>
cd /path/to/atelier-kaisla
git pull origin main

# Créer le fichier .env si pas encore fait
cp .env.prod.example .env
nano .env  # Configurer les variables

# Déployer
docker compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Vérifier le déploiement

Testez chaque URL dans votre navigateur:

- ✅ Frontend: https://kaisla.lebowvsky.com
- ✅ Backoffice: https://bokaisla.lebowvsky.com
- ✅ Backend: https://api.lebowvsky.com/health

Si tout fonctionne, vous devriez voir:
- Le frontend afficher la page d'accueil
- Le backoffice afficher la page d'administration
- L'API retourner un statut de santé

## Dépannage rapide

### Le backoffice affiche toujours 404

```bash
# Vérifier que le container est démarré
docker ps | grep backoffice

# Vérifier les logs
docker logs atelier-kaisla-backoffice-prod

# Redémarrer le service
docker restart atelier-kaisla-backoffice-prod
```

### Certificat SSL non généré

Attendez 2-3 minutes pour la génération du certificat Let's Encrypt. Si le problème persiste:

```bash
# Vérifier les DNS
dig +short bokaisla.lebowvsky.com

# Redémarrer Traefik
docker restart traefik  # ou le nom du container Traefik de Dokploy
```

### Erreur de connexion à l'API

Vérifiez que le backend est démarré et accessible:

```bash
# Test depuis le VPS
curl http://localhost:4000/api/health

# Test depuis l'extérieur
curl https://api.lebowvsky.com/health
```

## Variables d'environnement importantes

Dans votre fichier `.env` de production:

```bash
# Mot de passe sécurisé (OBLIGATOIRE)
POSTGRES_PASSWORD=VotreMotDePasseTresSecurise123!

# Domaines (déjà configurés dans docker-compose.prod.yml)
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
API_URL=https://api.lebowvsky.com
```

## Pour aller plus loin

Consultez `DOKPLOY-DEPLOYMENT.md` pour:
- Configuration avancée
- Monitoring et logs
- Sauvegardes
- CI/CD
- Troubleshooting détaillé

## Support

En cas de problème:
1. Vérifiez les logs: `docker compose -f docker-compose.prod.yml logs`
2. Consultez la doc Dokploy: https://docs.dokploy.com
3. Vérifiez la doc Traefik: https://doc.traefik.io/traefik/
