# pgAdmin Setup Guide

pgAdmin est un outil d'administration web pour PostgreSQL, maintenant disponible sur votre instance Dokploy.

## 🚀 Accès rapide

**URL** : `https://pgadmin.lebowvsky.com`

## 📋 Configuration

### 1. Ajouter les variables d'environnement

Dans votre fichier `.env` sur le serveur de production :

```bash
PGADMIN_EMAIL=admin@kaisla.local
PGADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

### 2. Configurer le domaine dans Dokploy

Dans l'interface Dokploy :
1. Le domaine `pgadmin.lebowvsky.com` est déjà configuré dans les labels Traefik
2. Ajoutez un enregistrement DNS :
   - Type : `A`
   - Nom : `pgadmin`
   - Valeur : `213.32.21.190` (IP de votre serveur)

### 3. Déployer pgAdmin

```bash
# Sur le serveur
cd /etc/dokploy/compose/atelier-kaisla-frontend-wcr1nx/code

# Démarrer pgAdmin
sudo docker compose -f docker-compose.prod.yml up -d pgadmin

# Vérifier les logs
sudo docker logs atelier-kaisla-pgadmin-prod
```

## 🔌 Connexion à la base de données

### Première connexion

1. Ouvrez `https://pgadmin.lebowvsky.com`
2. Connectez-vous avec :
   - Email : `admin@kaisla.local` (ou votre PGADMIN_EMAIL)
   - Mot de passe : Votre PGADMIN_PASSWORD

### Ajouter le serveur PostgreSQL

1. **Clic droit sur "Servers"** → **Register** → **Server**

2. **Onglet General** :
   - Name : `Atelier Kaisla Production`

3. **Onglet Connection** :
   - Host name/address : `postgres`
   - Port : `5432`
   - Maintenance database : `atelier_kaisla_prod`
   - Username : `postgres` (ou votre POSTGRES_USER)
   - Password : Votre POSTGRES_PASSWORD
   - ✅ Save password

4. **Cliquez sur Save**

## 📊 Utilisation

Une fois connecté, vous pouvez :

- ✅ Voir toutes les tables (products, etc.)
- ✅ Exécuter des requêtes SQL
- ✅ Modifier les données directement
- ✅ Créer des sauvegardes
- ✅ Gérer les utilisateurs et permissions
- ✅ Surveiller les performances

### Exemple : Voir tous les produits

```sql
SELECT * FROM products ORDER BY created_at DESC;
```

### Exemple : Ajouter un produit

```sql
INSERT INTO products (name, description, category, price, status, "stockQuantity", materials)
VALUES ('New Product', 'Description', 'wall-hanging', 299.99, 'draft', 5, 'Wool');
```

## 🔒 Sécurité

### Recommandations

1. **Mot de passe fort** : Utilisez un mot de passe complexe pour pgAdmin
2. **Accès restreint** : Envisagez d'ajouter une authentification basique Traefik
3. **Sauvegardes régulières** : Utilisez pgAdmin pour créer des sauvegardes

### Middleware d'authentification Traefik (optionnel)

Pour ajouter une couche de sécurité supplémentaire, vous pouvez créer un middleware d'authentification basique.

## 🛠️ Commandes utiles

### Arrêter pgAdmin

```bash
sudo docker stop atelier-kaisla-pgadmin-prod
```

### Redémarrer pgAdmin

```bash
sudo docker restart atelier-kaisla-pgadmin-prod
```

### Supprimer pgAdmin

```bash
sudo docker compose -f docker-compose.prod.yml down pgadmin
sudo docker volume rm atelier-kaisla-frontend-wcr1nx_pgadmin_data
```

## 🆘 Dépannage

### pgAdmin ne démarre pas

```bash
# Vérifier les logs
sudo docker logs atelier-kaisla-pgadmin-prod --tail=50

# Recréer le conteneur
sudo docker compose -f docker-compose.prod.yml up -d --force-recreate pgadmin
```

### Impossible de se connecter à PostgreSQL

- Vérifiez que `postgres` est bien le nom d'hôte (pas `localhost`)
- Vérifiez les credentials dans `.env`
- Assurez-vous que les deux conteneurs sont sur le même réseau (`atelier-network`)

### Certificat SSL non valide

Attendez quelques minutes que Let's Encrypt génère le certificat, puis testez :

```bash
curl https://pgadmin.lebowvsky.com
```

## 🎯 Alternative légère : Adminer

Si pgAdmin est trop lourd, vous pouvez utiliser Adminer (beaucoup plus léger) :

```yaml
# Remplacer le service pgadmin par :
adminer:
  image: adminer:latest
  container_name: atelier-kaisla-adminer-prod
  restart: always
  expose:
    - "8080"
  networks:
    - atelier-network
    - dokploy-network
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.adminer-secure.rule=Host(`db.lebowvsky.com`)"
    - "traefik.http.services.adminer.loadbalancer.server.port=8080"
```

Adminer est accessible sur une seule page et ne nécessite pas de configuration initiale.
