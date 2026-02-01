# 🚀 Démarrage Rapide Docker - Atelier Kaisla

## Installation Express

### 1. Prérequis
- Docker Desktop installé
- 8 Go de RAM disponible minimum

### 2. Initialisation

```bash
# Initialiser le projet en une commande
make init
```

Cette commande va :
- Créer le fichier `.env` depuis `.env.dev.example`
- Démarrer tous les services (frontend, backoffice, backend, PostgreSQL)
- Configurer le hot reloading pour le développement

### 3. Accéder aux applications

Une fois démarré, vos applications seront disponibles à :

- **Frontend** : http://localhost:3002
- **Backoffice** : http://localhost:3001
- **Backend API** : http://localhost:4000
- **PostgreSQL** : localhost:5432

## Commandes Essentielles

```bash
# Démarrer en développement
make dev-up-d

# Voir les logs
make dev-logs

# Arrêter
make dev-down

# Reconstruire tout
make dev-rebuild

# Accéder au shell backend
make backend-shell

# Accéder à la base de données
make db-shell

# Voir toutes les commandes disponibles
make help
```

## Sans Makefile

Si vous préférez utiliser Docker Compose directement :

```bash
# Copier le fichier d'environnement
cp .env.dev.example .env

# Démarrer
docker compose -f docker compose.dev.yml up -d

# Voir les logs
docker compose -f docker compose.dev.yml logs -f

# Arrêter
docker compose -f docker compose.dev.yml down
```

## Hot Reloading ♨️

En mode développement, **toutes les applications** supportent le hot reloading :

- ✅ **Frontend (Nuxt 4)** : Modifications détectées automatiquement
- ✅ **Backoffice (Nuxt 4)** : Modifications détectées automatiquement
- ✅ **Backend (NestJS)** : Rechargement automatique avec `--watch`

Modifiez votre code et voyez les changements instantanément, sans rebuild !

## Production

```bash
# Copier le fichier d'environnement de production
cp .env.prod.example .env

# ⚠️ IMPORTANT : Modifier le mot de passe PostgreSQL dans .env

# Démarrer en production
make prod-up
```

## Troubleshooting

### Port déjà utilisé
```bash
# Vérifier quel processus utilise le port
lsof -i :3002
lsof -i :4000

# Tuer le processus si nécessaire
kill -9 <PID>
```

### Réinitialiser complètement
```bash
make clean
make init
```

### Les logs ne s'affichent pas
```bash
# Logs d'un service spécifique
docker compose -f docker compose.dev.yml logs -f frontend
docker compose -f docker compose.dev.yml logs -f backend
```

## Documentation Complète

Pour plus de détails, consultez [docker/README.md](docker/README.md)

## Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Network (atelier-network)   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌──────────────┐         │
│  │  Frontend   │  │  Backoffice  │         │
│  │  (Nuxt 4)   │  │  (Nuxt 4)    │         │
│  │  :3002      │  │  :3001       │         │
│  └──────┬──────┘  └──────┬───────┘         │
│         │                │                  │
│         └────────┬───────┘                  │
│                  │                          │
│         ┌────────▼────────┐                 │
│         │    Backend      │                 │
│         │    (NestJS)     │                 │
│         │    :4000        │                 │
│         └────────┬────────┘                 │
│                  │                          │
│         ┌────────▼────────┐                 │
│         │   PostgreSQL    │                 │
│         │    :5432        │                 │
│         └─────────────────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

## Prochaines Étapes

1. ✅ Démarrer les services : `make init`
2. 🔧 Configurer votre backend dans `apps/backend/src`
3. 🎨 Développer votre frontend dans `apps/frontend`
4. 🖥️ Développer votre backoffice dans `apps/backoffice`
5. 🗄️ Ajouter vos migrations de base de données dans `docker/postgres/init-scripts`

Bon développement ! 🎉
