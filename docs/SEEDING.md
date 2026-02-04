# Guide de seeding - Atelier Kaisla

Guide rapide pour peupler la base de données avec des données mockées.

## Commandes essentielles

### Développement

```bash
# Seeding simple (ajoute des données)
make seed-docker

# Seeding avec nettoyage (supprime tout puis ajoute)
make seed-docker-clean

# Seeding intelligent (évite les doublons, met à jour si existe)
make seed-enhanced-docker

# Vérifier les données
make verify-data-dev
```

### Production

```bash
# 1. TOUJOURS faire un backup d'abord
make backup-prod

# 2. Seeder avec protection contre les doublons
make seed-enhanced-prod

# 3. Vérifier les données
make verify-data-prod

# 4. Tester l'API
curl http://localhost:4000/api/products
```

## Données seedées

Le système crée **18 produits réalistes**:
- **8 Wall Hangings** (tapisseries murales): 89€ - 349€
- **10 Rugs** (tapis): 149€ - 599€

Chaque produit inclut:
- Nom et description
- Prix, dimensions, matériaux
- Images (URLs)
- Stock et statut (available/sold/draft)

## Différence entre les seeders

| Seeder | Avantages | Usage |
|--------|-----------|-------|
| **Standard** (`seed`) | Rapide, simple | Première initialisation |
| **Enhanced** (`seed:enhanced`) | Évite les doublons, met à jour | Production, multiples exécutions |

## Scénarios courants

### Initialiser une nouvelle base

```bash
# Dev
make dev-up-d
make seed-docker

# Prod
make prod-up
make backup-prod
make seed-prod
```

### Ajouter des données sans supprimer

```bash
# Dev
make seed-enhanced-docker

# Prod
make seed-enhanced-prod
```

### Réinitialiser complètement

```bash
# Dev
make seed-docker-clean

# Prod (ATTENTION!)
make backup-prod
make seed-prod-clean  # Demande double confirmation
```

## Vérification rapide

```bash
# Compter les produits
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT COUNT(*) FROM products;"

# Via l'API
curl http://localhost:4000/api/products | jq 'length'

# Vérification complète
make verify-data-dev
```

## Toutes les commandes disponibles

### Seeding
- `make seed-docker` - Seeder en dev (Docker)
- `make seed-docker-clean` - Seeder avec nettoyage en dev
- `make seed-enhanced-docker` - Seeder intelligent en dev
- `make seed-prod` - Seeder en production (avec confirmation)
- `make seed-enhanced-prod` - Seeder intelligent en production

### Backup
- `make backup-dev` - Backup développement
- `make backup-prod` - Backup production
- `make restore-prod FILE=backup.sql` - Restaurer un backup

### Vérification
- `make verify-data-dev` - Vérification complète dev
- `make verify-data-prod` - Vérification complète prod
- `make verify-quick-dev` - Vérification rapide dev
- `make verify-quick-prod` - Vérification rapide prod

### Migrations
- `make migration-run-docker` - Exécuter les migrations
- `make migration-generate NAME=MyMigration` - Créer une migration

### Accès direct
- `make backend-shell` - Shell du backend
- `make db-shell` - Shell PostgreSQL

## En cas de problème

### Base de données non accessible
```bash
docker compose -f docker-compose.dev.yml ps
make dev-down
make dev-up-d
```

### Migrations non exécutées
```bash
make migration-run-docker
```

### Doublons de produits
```bash
make seed-enhanced-docker-clean
```

## Documentation complète

Pour plus de détails, consultez:

- **Backend**: `apps/backend/`
  - [SEEDING_QUICKSTART.md](./apps/backend/SEEDING_QUICKSTART.md) - Référence rapide
  - [SEEDING_GUIDE.md](./apps/backend/SEEDING_GUIDE.md) - Guide complet
  - [SEEDING_BEST_PRACTICES.md](./apps/backend/SEEDING_BEST_PRACTICES.md) - Bonnes pratiques
  - [src/database/seeds/README.md](./apps/backend/src/database/seeds/README.md) - Documentation technique

## Sécurité en production

Le système de seeding en production inclut:
- ✅ Confirmation interactive requise
- ✅ Protection contre le mode clean accidentel
- ✅ Vérification de l'environnement
- ✅ Backup recommandé avant toute opération
- ✅ Logs détaillés de chaque opération
- ✅ Prévention des doublons avec le seeder enhanced

## Support

Pour toute question, consultez:
1. Les logs: `make dev-logs-backend` ou `make prod-logs`
2. La base de données: `make db-shell`
3. Les migrations: `make migration-run-docker`
4. La documentation complète dans `apps/backend/SEEDING_GUIDE.md`
