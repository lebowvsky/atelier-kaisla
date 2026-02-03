# Guide rapide de seeding - Atelier Kaisla

Guide de référence rapide pour seeder la base de données. Pour le guide complet, consultez [SEEDING_GUIDE.md](./SEEDING_GUIDE.md).

## Commandes essentielles

### Développement

```bash
# Seeder la base (simple, ajoute aux données existantes)
make seed-docker

# Seeder avec nettoyage (supprime puis recrée)
make seed-docker-clean

# Seeder amélioré (évite les doublons, met à jour si existe)
make seed-enhanced-docker

# Vérifier les données
make verify-data-dev
```

### Production

```bash
# 1. TOUJOURS faire un backup d'abord!
make backup-prod

# 2. Seeder (recommandé: utilise la version améliorée)
make seed-enhanced-prod

# 3. Vérifier les données
make verify-data-prod

# 4. Tester l'API
curl http://localhost:4000/api/products | jq '.'
```

## Différence entre les seeders

### Seeder standard (`seed`)
- ✅ Simple et rapide
- ❌ Peut créer des doublons si exécuté plusieurs fois
- Usage: Première initialisation, développement

### Seeder amélioré (`seed:enhanced`)
- ✅ Évite les doublons (vérifie par nom de produit)
- ✅ Met à jour les produits existants
- ✅ Affiche des statistiques détaillées
- ⚠️ Légèrement plus lent (vérifie chaque produit)
- Usage: Production, plusieurs exécutions

## Scénarios courants

### Initialiser une nouvelle base de données

```bash
# Dev
make dev-up-d
make seed-docker

# Prod
make prod-up
make backup-prod  # Même si vide, créer l'habitude
make seed-prod
```

### Ajouter des données sans supprimer

```bash
# Dev
make seed-docker

# Prod (avec protection contre doublons)
make seed-enhanced-prod
```

### Réinitialiser complètement la base

```bash
# Dev
make seed-docker-clean

# Prod (ATTENTION!)
make backup-prod
make seed-prod-clean  # Demande une double confirmation
```

### Mettre à jour les données existantes

```bash
# Dev
make seed-enhanced-docker

# Prod
make seed-enhanced-prod
```

## Vérification rapide

```bash
# Compter les produits
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT COUNT(*) FROM products;"

# Voir la répartition
docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT category, status, COUNT(*) FROM products GROUP BY category, status;"

# Via l'API
curl http://localhost:4000/api/products | jq 'length'
```

## Données seedées par défaut

Le seeder crée **18 produits**:
- **8 Wall Hangings** (tapisseries murales)
  - 5 available, 1 sold, 2 draft
  - Prix: 89€ - 349€

- **10 Rugs** (tapis)
  - 7 available, 1 sold, 2 draft
  - Prix: 149€ - 599€

Chaque produit inclut:
- Nom et description réalistes
- Prix, dimensions, matériaux
- Images (URLs Unsplash)
- Stock quantity
- Dates de création/mise à jour

## En cas de problème

### Base de données non accessible
```bash
# Vérifier que les conteneurs sont actifs
docker compose -f docker-compose.dev.yml ps

# Redémarrer
make dev-down
make dev-up-d
```

### Migrations non exécutées
```bash
make migration-run-docker
```

### Doublons de produits
```bash
# Utiliser le seeder amélioré
make seed-enhanced-docker-clean
```

### Voir les logs
```bash
make dev-logs-backend
```

## Commandes complètes disponibles

### Seeding - Dev
- `make seed` - Seeder depuis le host
- `make seed-clean` - Seeder avec nettoyage depuis le host
- `make seed-docker` - Seeder dans Docker
- `make seed-docker-clean` - Seeder avec nettoyage dans Docker
- `make seed-enhanced` - Seeder amélioré depuis le host
- `make seed-enhanced-docker` - Seeder amélioré dans Docker
- `make seed-enhanced-clean` - Seeder amélioré avec nettoyage
- `make seed-enhanced-docker-clean` - Seeder amélioré avec nettoyage dans Docker

### Seeding - Prod
- `make seed-prod` - Seeder en production (avec confirmation)
- `make seed-prod-clean` - Seeder avec nettoyage en production (double confirmation)
- `make seed-enhanced-prod` - Seeder amélioré en production (avec confirmation)

### Backup
- `make backup-dev` - Backup développement
- `make backup-prod` - Backup production
- `make restore-prod FILE=backup.sql` - Restaurer un backup en production

### Vérification
- `make verify-data-dev` - Vérification complète développement
- `make verify-data-prod` - Vérification complète production
- `make verify-quick-dev` - Vérification rapide développement
- `make verify-quick-prod` - Vérification rapide production

### Migrations
- `make migration-run-docker` - Exécuter les migrations dans Docker
- `make migration-generate NAME=MyMigration` - Générer une migration

### Accès direct
- `make backend-shell` - Accéder au shell du backend
- `make db-shell` - Accéder à PostgreSQL

## Documentation complète

Pour plus de détails, consultez:
- [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) - Guide complet
- [src/database/seeds/README.md](./src/database/seeds/README.md) - Documentation technique
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Architecture du projet
