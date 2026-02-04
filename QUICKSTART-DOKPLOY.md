# Démarrage rapide - Déploiement Dokploy

## Problème résolu ✅

Le backoffice affichait une **404** à cause de conflits entre les labels Traefik du docker-compose et ceux générés automatiquement par Dokploy.

**Solution**: Les labels Traefik ont été supprimés du `docker-compose.prod.yml`. Le routage se configure maintenant via l'interface Dokploy.

## Changements effectués

1. ✅ **Labels Traefik supprimés** du docker-compose (pour éviter les conflits)
2. ✅ **Configuration CORS** mise à jour dans le backend
3. ✅ **Variables d'environnement** de production configurées
4. ✅ **Domaines à configurer dans Dokploy**:
   - Frontend: `kaisla.lebowvsky.com`
   - Backoffice: `bokaisla.lebowvsky.com`
   - Backend API: `api.lebowvsky.com`

## Configuration DNS (OVH)

Vérifiez que ces enregistrements A existent dans votre zone DNS:

```
api.lebowvsky.com      A    <IP_DE_VOTRE_VPS>
kaisla.lebowvsky.com   A    <IP_DE_VOTRE_VPS>
bokaisla.lebowvsky.com A    <IP_DE_VOTRE_VPS>
```

## Étapes de déploiement

### 1. Commiter et pousser les changements

```bash
git add docker-compose.prod.yml DOKPLOY-DOMAINS-SETUP.md
git commit -m "fix: remove Traefik labels to avoid conflicts with Dokploy"
git push origin main
```

### 2. Redéployer sur Dokploy

**Via l'interface Dokploy:**

1. Ouvrez `https://dokploy.lebowvsky.com`
2. Allez dans votre projet "Atelier Kaisla"
3. Cliquez sur **"Redeploy"** pour chaque service
4. Attendez la fin du déploiement

**Via SSH (si vous préférez):**

```bash
ssh lebowvsky@<IP_VPS>
cd /etc/dokploy/compose/atelier-kaisla-frontend-wcr1nx/code
git pull origin main
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Configurer les domaines dans Dokploy ⭐ IMPORTANT

Pour chaque service, ajoutez le domaine personnalisé dans l'interface Dokploy:

#### Frontend
- Service: `frontend`
- Domaine: `kaisla.lebowvsky.com`
- Port: `3000`
- SSL: ✅ Activé (Let's Encrypt)

#### Backend
- Service: `backend`
- Domaine: `api.lebowvsky.com`
- Port: `4000`
- SSL: ✅ Activé

#### Backoffice (le problème principal!)
- Service: `backoffice`
- Domaine: `bokaisla.lebowvsky.com`
- Port: `3000`
- SSL: ✅ Activé

**📖 Guide détaillé**: Consultez `DOKPLOY-DOMAINS-SETUP.md` pour les instructions complètes.

### 4. Vérifier le déploiement

```bash
# Vérifier qu'il n'y a plus de conflits Traefik
sudo docker logs dokploy-traefik --tail 50 | grep -i "cannot be linked"
# Cette commande ne devrait rien retourner

# Tester les URLs
curl -I https://kaisla.lebowvsky.com
curl -I https://api.lebowvsky.com/health
curl -I https://bokaisla.lebowvsky.com
```

Tous devraient retourner un code HTTP 200 (ou 301/302).

## Dépannage

### Les erreurs Traefik persistent

```bash
# Vérifier les logs Traefik
sudo docker logs dokploy-traefik --tail 100

# Si vous voyez toujours "cannot be linked automatically":
# 1. Redémarrer les services
sudo docker restart atelier-kaisla-backoffice-prod
sudo docker restart atelier-kaisla-frontend-prod
sudo docker restart atelier-kaisla-backend-prod

# 2. Redémarrer Traefik
sudo docker restart dokploy-traefik
```

### Le backoffice affiche toujours 404

1. Vérifiez que le domaine est bien configuré dans Dokploy
2. Vérifiez que le container est démarré: `sudo docker ps | grep backoffice`
3. Vérifiez les logs: `sudo docker logs atelier-kaisla-backoffice-prod`
4. Attendez 2-3 minutes pour la propagation SSL

### Certificat SSL non généré

```bash
# Vérifier que les DNS pointent bien vers le VPS
dig +short bokaisla.lebowvsky.com

# Si l'IP est correcte, attendez quelques minutes
# Let's Encrypt peut prendre du temps à générer les certificats
```

## Variables d'environnement

Le fichier `.env` n'est pas nécessaire si vous déployez via Dokploy, car Dokploy utilise ses propres variables.

Si vous déployez manuellement via SSH, créez le fichier:

```bash
cp .env.prod.example .env
nano .env  # Changez POSTGRES_PASSWORD
```

## Vérification finale

Une fois tout configuré, testez dans votre navigateur:

- ✅ Frontend: https://kaisla.lebowvsky.com (page d'accueil)
- ✅ Backoffice: https://bokaisla.lebowvsky.com (panneau admin) ← Devrait fonctionner maintenant!
- ✅ Backend: https://api.lebowvsky.com/api/docs (Swagger, si activé)

## Documentation

- **Configuration des domaines**: `DOKPLOY-DOMAINS-SETUP.md`
- **Déploiement complet**: `DOKPLOY-DEPLOYMENT.md`
- **Doc Dokploy**: https://docs.dokploy.com
- **Doc Traefik**: https://doc.traefik.io/traefik/

## Support

En cas de problème:
1. Consultez `DOKPLOY-DOMAINS-SETUP.md`
2. Vérifiez les logs: `sudo docker logs <container>`
3. Vérifiez les logs Traefik: `sudo docker logs dokploy-traefik`
