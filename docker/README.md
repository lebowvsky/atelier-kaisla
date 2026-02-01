# Documentation Docker - Atelier Kaisla

## Architecture

Ce projet utilise Docker Compose pour orchestrer 4 services :

1. **Frontend** (Nuxt 4) - Port 3000
2. **Backoffice** (Nuxt 4) - Port 3001
3. **Backend** (NestJS) - Port 4000
4. **PostgreSQL** - Port 5432

## Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+

## Configuration

### Environnement de développement

1. Copier le fichier d'environnement :
```bash
cp .env.dev.example .env
```

2. Modifier les variables si nécessaire dans `.env`

### Environnement de production

1. Copier le fichier d'environnement :
```bash
cp .env.prod.example .env
```

2. **IMPORTANT** : Modifier `POSTGRES_PASSWORD` avec un mot de passe sécurisé

## Commandes Docker

### Développement (avec hot reloading)

```bash
# Démarrer tous les services
docker compose -f docker compose.dev.yml up

# Démarrer en arrière-plan
docker compose -f docker compose.dev.yml up -d

# Voir les logs
docker compose -f docker compose.dev.yml logs -f

# Voir les logs d'un service spécifique
docker compose -f docker compose.dev.yml logs -f frontend
docker compose -f docker compose.dev.yml logs -f backend
docker compose -f docker compose.dev.yml logs -f backoffice

# Arrêter les services
docker compose -f docker compose.dev.yml down

# Arrêter et supprimer les volumes (⚠️ supprime la base de données)
docker compose -f docker compose.dev.yml down -v

# Reconstruire les images
docker compose -f docker compose.dev.yml build

# Reconstruire sans cache
docker compose -f docker compose.dev.yml build --no-cache
```

### Production

```bash
# Démarrer tous les services
docker compose -f docker compose.prod.yml up -d

# Voir les logs
docker compose -f docker compose.prod.yml logs -f

# Arrêter les services
docker compose -f docker compose.prod.yml down

# Reconstruire et redémarrer
docker compose -f docker compose.prod.yml up -d --build
```

### Commandes utiles

```bash
# Accéder au shell d'un conteneur
docker exec -it atelier-kaisla-backend-dev sh
docker exec -it atelier-kaisla-frontend-dev sh

# Accéder à PostgreSQL
docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev

# Voir l'état des conteneurs
docker compose -f docker compose.dev.yml ps

# Voir l'utilisation des ressources
docker stats
```

## URLs des applications

### Développement
- Frontend : http://localhost:3002
- Backoffice : http://localhost:3001
- Backend API : http://localhost:4000
- PostgreSQL : localhost:5432

### Production
- Frontend : http://localhost:3002
- Backoffice : http://localhost:3001
- Backend API : http://localhost:4000

## Hot Reloading (Développement)

En mode développement, toutes les applications supportent le hot reloading :

- **Frontend & Backoffice** : Les volumes Docker sont montés pour synchroniser le code source. Toute modification sera automatiquement détectée et rechargée.
- **Backend** : Utilise `npm run start:dev` de NestJS qui inclut le watch mode.

## Volumes

### Développement
- `postgres_data_dev` : Données PostgreSQL persistantes

### Production
- `postgres_data_prod` : Données PostgreSQL persistantes

## Réseau

Tous les services communiquent via le réseau Docker `atelier-network`.

## Troubleshooting

### Les conteneurs ne démarrent pas

1. Vérifier que les ports ne sont pas déjà utilisés :
```bash
lsof -i :3000
lsof -i :3001
lsof -i :4000
lsof -i :5432
```

2. Vérifier les logs :
```bash
docker compose -f docker compose.dev.yml logs
```

### Hot reloading ne fonctionne pas

1. Vérifier que les volumes sont bien montés :
```bash
docker compose -f docker compose.dev.yml config
```

2. Redémarrer les conteneurs :
```bash
docker compose -f docker compose.dev.yml restart
```

### Erreur de connexion à la base de données

1. Vérifier que PostgreSQL est prêt :
```bash
docker compose -f docker compose.dev.yml logs postgres
```

2. Le backend attend automatiquement que PostgreSQL soit healthy grâce au `depends_on` avec condition.

### Réinitialiser complètement l'environnement

```bash
# Arrêter tout
docker compose -f docker compose.dev.yml down -v

# Supprimer les images
docker compose -f docker compose.dev.yml down --rmi all

# Reconstruire et redémarrer
docker compose -f docker compose.dev.yml up --build
```

## Sécurité (Production)

- ✅ Les conteneurs utilisent des utilisateurs non-root
- ✅ Les images sont basées sur Alpine Linux (légères et sécurisées)
- ✅ Multi-stage builds pour réduire la surface d'attaque
- ✅ Health checks configurés
- ⚠️ Changez toujours les mots de passe par défaut
- ⚠️ Utilisez des secrets Docker en production réelle
- ⚠️ Configurez un reverse proxy (nginx/traefik) avec HTTPS

## Optimisations

### Taille des images

Les images utilisent des multi-stage builds :
- Stage `development` : Inclut tous les outils de développement
- Stage `builder` : Compile le code
- Stage `production` : Image minimale avec seulement le code compilé

### Cache Docker

Pour optimiser les builds, les fichiers sont copiés dans cet ordre :
1. `package*.json` (changent rarement)
2. Installation des dépendances
3. Code source (change souvent)

Cela permet de réutiliser le cache Docker des dépendances.
