# Backend Quick Reference

Commandes rapides pour travailler avec le backend NestJS et TypeORM.

## Démarrage Rapide

```bash
# Démarrer tout l'environnement Docker
make dev-up-d

# Voir les logs du backend
make dev-logs-backend

# Accéder au shell du backend
make backend-shell

# Accéder à PostgreSQL
make db-shell
```

## URLs Importantes

- **API Backend**: http://localhost:4000
- **Documentation Swagger**: http://localhost:4000/api/docs
- **PostgreSQL**: localhost:5432
- **Database**: atelier_kaisla_dev

## Migrations TypeORM

### Dans Docker (Recommandé)

```bash
# Voir le statut des migrations
docker exec atelier-kaisla-backend-dev npm run migration:show

# Générer une nouvelle migration (à partir des changements d'entités)
docker exec atelier-kaisla-backend-dev npm run migration:generate -- src/database/migrations/NomMigration

# Créer une migration vide
docker exec atelier-kaisla-backend-dev npm run migration:create -- src/database/migrations/NomMigration

# Exécuter les migrations en attente
docker exec atelier-kaisla-backend-dev npm run migration:run

# Annuler la dernière migration
docker exec atelier-kaisla-backend-dev npm run migration:revert
```

### Localement (sans Docker)

```bash
cd apps/backend

npm run migration:show
npm run migration:generate -- src/database/migrations/NomMigration
npm run migration:create -- src/database/migrations/NomMigration
npm run migration:run
npm run migration:revert
```

## Tests

```bash
# Dans Docker
docker exec atelier-kaisla-backend-dev npm test
docker exec atelier-kaisla-backend-dev npm run test:watch
docker exec atelier-kaisla-backend-dev npm run test:cov

# Localement
cd apps/backend
npm test
npm run test:watch
npm run test:cov
```

## PostgreSQL

```bash
# Accéder à psql
docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev

# Commandes psql utiles
\dt                    # Lister les tables
\d products            # Décrire la table products
\di                    # Lister les index
SELECT * FROM products;
SELECT * FROM migrations_history;

# Depuis le terminal
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "\dt"
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT * FROM products"
```

## API Testing

```bash
# Tester l'endpoint root
curl http://localhost:4000/

# Obtenir tous les produits
curl http://localhost:4000/products | jq

# Créer un produit (voir API-EXAMPLES.md pour plus d'exemples)
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d @product.json

# Statistiques
curl http://localhost:4000/products/statistics | jq
```

## Development Workflow

### Créer une nouvelle entité

```bash
# 1. Créer l'entité dans src/entities/
# 2. Générer la migration
docker exec atelier-kaisla-backend-dev npm run migration:generate -- src/database/migrations/CreateEntityName

# 3. Vérifier la migration générée
cat apps/backend/src/database/migrations/[timestamp]-CreateEntityName.ts

# 4. Exécuter la migration
docker exec atelier-kaisla-backend-dev npm run migration:run
```

### Créer un nouveau module

```bash
# 1. Créer la structure de dossiers
mkdir -p apps/backend/src/modules/module-name/dto

# 2. Créer les fichiers
# - module-name.module.ts
# - module-name.controller.ts
# - module-name.service.ts
# - dto/create-module-name.dto.ts
# - dto/update-module-name.dto.ts

# 3. Importer le module dans app.module.ts

# 4. Redémarrer le backend (auto avec hot reload)
```

## Logs et Debugging

```bash
# Logs en temps réel
docker logs -f atelier-kaisla-backend-dev

# Dernières 50 lignes
docker logs atelier-kaisla-backend-dev --tail 50

# Logs avec timestamp
docker logs atelier-kaisla-backend-dev --timestamps

# Filtrer les logs
docker logs atelier-kaisla-backend-dev 2>&1 | grep ERROR
docker logs atelier-kaisla-backend-dev 2>&1 | grep "query:"
```

## Gestion des Dépendances

```bash
# Installer une nouvelle dépendance
docker exec atelier-kaisla-backend-dev npm install package-name

# Installer une dépendance de développement
docker exec atelier-kaisla-backend-dev npm install -D package-name

# Mettre à jour les dépendances
docker exec atelier-kaisla-backend-dev npm update

# Vérifier les vulnérabilités
docker exec atelier-kaisla-backend-dev npm audit
docker exec atelier-kaisla-backend-dev npm audit fix
```

## Troubleshooting

### Le backend ne démarre pas

```bash
# Vérifier les logs
make dev-logs-backend

# Vérifier que PostgreSQL est healthy
docker ps | grep postgres

# Redémarrer le backend
docker restart atelier-kaisla-backend-dev

# Rebuild le backend
docker compose -f docker-compose.dev.yml up -d --build backend
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est accessible
docker exec atelier-kaisla-postgres-dev pg_isready -U postgres

# Vérifier les variables d'environnement
docker exec atelier-kaisla-backend-dev env | grep -E "POSTGRES|DATABASE"

# Tester la connexion depuis le backend
docker exec atelier-kaisla-backend-dev psql -h postgres -U postgres -d atelier_kaisla_dev -c "SELECT 1"
```

### Les migrations ne se génèrent pas

```bash
# Vérifier que les entités sont bien détectées
docker exec atelier-kaisla-backend-dev npm run typeorm -- entity:show

# Vérifier la configuration du DataSource
cat apps/backend/src/database/data-source.ts

# Forcer la synchronisation (DÉVELOPPEMENT UNIQUEMENT)
# Ajouter TYPEORM_SYNC=true dans .env et redémarrer
```

### Hot reload ne fonctionne pas

```bash
# Redémarrer le conteneur
docker restart atelier-kaisla-backend-dev

# Vérifier les volumes Docker
docker inspect atelier-kaisla-backend-dev | jq '.[0].Mounts'

# Rebuild complet
make dev-rebuild
```

## Lint et Format

```bash
# Lint
docker exec atelier-kaisla-backend-dev npm run lint

# Format avec Prettier
docker exec atelier-kaisla-backend-dev npm run format
```

## Build pour Production

```bash
# Build
docker exec atelier-kaisla-backend-dev npm run build

# Tester le build
docker exec atelier-kaisla-backend-dev npm run start:prod

# Production avec Docker Compose
docker compose -f docker-compose.prod.yml up -d
```

## Nettoyage

```bash
# Arrêter tous les conteneurs
make dev-down

# Supprimer les volumes (ATTENTION: supprime les données)
docker compose -f docker-compose.dev.yml down -v

# Nettoyer les images
docker system prune -a

# Rebuild from scratch
make clean-dev
make init
```

## Variables d'Environnement Importantes

```bash
NODE_ENV=development          # development, production, test
PORT=4000                     # Port du backend
POSTGRES_HOST=postgres        # Host PostgreSQL (Docker network)
POSTGRES_PORT=5432           # Port PostgreSQL
POSTGRES_USER=postgres       # Utilisateur PostgreSQL
POSTGRES_PASSWORD=postgres   # Mot de passe PostgreSQL
POSTGRES_DB=atelier_kaisla_dev  # Nom de la base de données
TYPEORM_SYNC=false           # true pour synchronisation auto (dev uniquement)
```

## Commandes Git (Migrations)

```bash
# Toujours commiter les migrations avec les entités
git add apps/backend/src/entities/
git add apps/backend/src/database/migrations/
git commit -m "feat: add Product entity and migration"
```

## Ressources

- [DATABASE.md](./DATABASE.md) - Documentation complète TypeORM
- [API-EXAMPLES.md](./API-EXAMPLES.md) - Exemples d'utilisation de l'API
- [TYPEORM-SETUP-SUMMARY.md](./TYPEORM-SETUP-SUMMARY.md) - Résumé de la configuration
- [Swagger UI](http://localhost:4000/api/docs) - Documentation interactive

## Raccourcis Utiles

```bash
# Alias à ajouter dans ~/.bashrc ou ~/.zshrc
alias be-shell='docker exec -it atelier-kaisla-backend-dev sh'
alias be-logs='docker logs -f atelier-kaisla-backend-dev'
alias be-restart='docker restart atelier-kaisla-backend-dev'
alias be-test='docker exec atelier-kaisla-backend-dev npm test'
alias db-shell='docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev'
alias migration-run='docker exec atelier-kaisla-backend-dev npm run migration:run'
alias migration-show='docker exec atelier-kaisla-backend-dev npm run migration:show'
```

## Performance Monitoring

```bash
# Vérifier l'utilisation des ressources
docker stats atelier-kaisla-backend-dev

# Vérifier les connexions PostgreSQL actives
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname='atelier_kaisla_dev';"

# Voir les requêtes lentes (si activé dans config)
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev \
  -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Support

En cas de problème:
1. Vérifier les logs: `make dev-logs-backend`
2. Vérifier le status: `docker ps`
3. Consulter DATABASE.md pour la documentation
4. Tester l'API avec Swagger UI
