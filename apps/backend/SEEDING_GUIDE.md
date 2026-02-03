# Guide complet de seeding de la base de données

Ce guide explique comment seeder la base de données avec des données mockées, que ce soit en développement ou en production.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Seeding en développement](#seeding-en-développement)
3. [Seeding en production](#seeding-en-production)
4. [Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)
5. [Vérification des données](#vérification-des-données)
6. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

Le système de seeding permet de peupler la base de données avec des données de test réalistes. Il comprend actuellement:

- **18 produits au total**
  - 8 Wall Hangings (tapisseries murales)
  - 10 Rugs (tapis)
- **Statuts variés**: available, sold, draft
- **Données complètes**: prix, dimensions, matériaux, images, stock

### Fichiers concernés

```
apps/backend/src/database/seeds/
├── seed.ts                   # Script principal d'exécution
├── product.seeder.ts         # Seeder des produits
├── data/
│   └── products.data.ts      # Données mockées des produits
└── README.md                 # Documentation technique
```

---

## Seeding en développement

### Option 1: Depuis le host (sans Docker)

#### Configuration requise

Assurez-vous que votre `.env` contient:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=atelier_kaisla_dev
```

#### Commandes disponibles

```bash
# Depuis la racine du projet

# Seeder la base (ajoute aux données existantes)
make seed

# Seeder avec nettoyage (supprime puis recrée)
make seed-clean
```

Ou directement depuis `apps/backend/`:

```bash
cd apps/backend

# Seeder (append)
npm run seed

# Seeder avec nettoyage
npm run seed:clean
```

### Option 2: Dans le conteneur Docker (recommandé)

#### Commandes disponibles

```bash
# Depuis la racine du projet

# Seeder dans Docker (ajoute aux données existantes)
make seed-docker

# Seeder avec nettoyage dans Docker
make seed-docker-clean
```

#### Alternative via shell

```bash
# Accéder au shell du backend
make backend-shell

# Puis exécuter le seeder
npm run seed
# ou
npm run seed:clean

# Quitter le shell
exit
```

### Vérification rapide en dev

```bash
# Voir les logs du backend
make dev-logs-backend

# Accéder à PostgreSQL
make db-shell

# Dans psql, vérifier les produits
SELECT id, name, category, status, price FROM products;

# Compter les produits
SELECT category, status, COUNT(*) FROM products GROUP BY category, status;

# Quitter psql
\q
```

---

## Seeding en production

### Important: Considérations de sécurité

Le seeding en production doit être effectué avec précaution:

1. **Backup obligatoire** avant toute opération
2. **Jamais de `--clean`** en production (sauf si vous êtes sûr)
3. **Vérifier l'environnement** avant d'exécuter
4. **Protéger les données réelles** existantes

### Étape 1: Préparation

#### 1.1 Vérifier l'environnement de production

```bash
# Depuis la racine du projet

# Vérifier que vous utilisez le bon .env
cat .env | grep NODE_ENV
# Devrait afficher: NODE_ENV=production

# Vérifier la connexion à la base de données
cat .env | grep POSTGRES
```

#### 1.2 Faire un backup de la base de données

```bash
# Créer un répertoire pour les backups
mkdir -p backups

# Backup de la base de production
docker exec atelier-kaisla-postgres-prod pg_dump \
  -U postgres \
  -d atelier_kaisla_prod \
  -F c \
  -f /tmp/backup_$(date +%Y%m%d_%H%M%S).dump

# Copier le backup depuis le conteneur
docker cp atelier-kaisla-postgres-prod:/tmp/backup_*.dump ./backups/

# Vérifier que le backup existe
ls -lh backups/
```

### Étape 2: Vérification des données existantes

```bash
# Accéder à la base de production
docker exec -it atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod

# Vérifier le nombre de produits existants
SELECT COUNT(*) as total_products FROM products;

# Voir la répartition par catégorie
SELECT category, COUNT(*) as count FROM products GROUP BY category;

# Voir la répartition par statut
SELECT status, COUNT(*) as count FROM products GROUP BY status;

# Quitter
\q
```

### Étape 3: Seeding en production

#### Option A: Ajouter des données (append mode)

Cette option est **sûre** car elle n'efface rien.

```bash
# Depuis la racine du projet

# Méthode 1: Via Makefile (à créer, voir section suivante)
make seed-prod

# Méthode 2: Via docker exec directement
docker exec atelier-kaisla-backend-prod npm run seed
```

#### Option B: Remplacer toutes les données (DANGER!)

**ATTENTION**: Cette option supprime TOUTES les données de la table products!

```bash
# Uniquement si vous êtes sûr et avez un backup!
docker exec atelier-kaisla-backend-prod npm run seed:clean
```

### Étape 4: Vérification post-seeding

```bash
# Accéder à la base de production
docker exec -it atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod

# Vérifier que les données sont bien présentes
SELECT COUNT(*) as total_products FROM products;

# Vérifier les catégories
SELECT category, COUNT(*) FROM products GROUP BY category;

# Vérifier les statuts
SELECT status, COUNT(*) FROM products GROUP BY status;

# Voir quelques exemples
SELECT id, name, category, status, price FROM products LIMIT 5;

# Quitter
\q
```

### Étape 5: Tester l'API

```bash
# Tester l'endpoint API
curl http://localhost:4000/api/products

# Avec formatage (si jq est installé)
curl http://localhost:4000/api/products | jq '.'

# Compter les produits via l'API
curl http://localhost:4000/api/products | jq 'length'
```

---

## Sécurité et bonnes pratiques

### Protection contre les accidents

Le seeder actuel n'a pas de protection spécifique contre l'exécution en production. Voici comment l'améliorer:

#### 1. Ajouter une confirmation pour le mode clean en production

Je vais créer une version améliorée du seeder avec protection:

```typescript
// Dans seed.ts, ajouter une confirmation interactive
if (cleanFlag && process.env.NODE_ENV === 'production') {
  console.log('\n⚠️  WARNING: You are about to DELETE all data in PRODUCTION!');
  console.log('This action is IRREVERSIBLE.\n');

  // Nécessite une confirmation manuelle
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('Type "DELETE ALL PRODUCTION DATA" to confirm: ', resolve);
  });

  readline.close();

  if (answer !== 'DELETE ALL PRODUCTION DATA') {
    console.log('❌ Operation cancelled.');
    process.exit(0);
  }
}
```

#### 2. Variables d'environnement de protection

Ajouter dans `.env.prod`:

```env
# Protection contre le seeding accidentel
ALLOW_SEEDING=false
ALLOW_CLEAN_SEEDING=false
```

### Différencier données de test et données de production

#### Option 1: Marqueur dans les données

Ajouter un champ `is_seed_data` aux entités:

```typescript
@Column({ type: 'boolean', default: false })
isSeedData: boolean;
```

#### Option 2: Utiliser des tags

```typescript
@Column({ type: 'simple-array', nullable: true })
tags?: string[]; // ['seed', 'test', 'demo']
```

#### Option 3: Seeders différents par environnement

```
seeds/
├── seed.ts
├── development/
│   └── product.seeder.dev.ts    # Données de dev
└── production/
    └── product.seeder.prod.ts    # Données de démo production
```

### Limiter l'accès au seeding

#### Via endpoint API protégé (approche alternative)

Créer un endpoint admin protégé:

```typescript
// seed.controller.ts (à créer)
@Controller('admin/seed')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SeedController {
  @Post('run')
  async runSeeder(@Query('clean') clean: boolean) {
    if (process.env.NODE_ENV === 'production' && clean) {
      throw new ForbiddenException('Clean seeding not allowed in production');
    }
    // Exécuter le seeder
  }
}
```

---

## Vérification des données

### Script de vérification automatique

Créer un script pour vérifier l'intégrité des données:

```bash
# Créer: apps/backend/scripts/verify-data.sh

#!/bin/bash

echo "Verifying database data..."

# Connexion info
if [ "$NODE_ENV" = "production" ]; then
  CONTAINER="atelier-kaisla-postgres-prod"
  DB="atelier_kaisla_prod"
else
  CONTAINER="atelier-kaisla-postgres-dev"
  DB="atelier_kaisla_dev"
fi

# Vérifications
echo "1. Total products:"
docker exec $CONTAINER psql -U postgres -d $DB -c "SELECT COUNT(*) FROM products;"

echo "2. Products by category:"
docker exec $CONTAINER psql -U postgres -d $DB -c "SELECT category, COUNT(*) FROM products GROUP BY category;"

echo "3. Products by status:"
docker exec $CONTAINER psql -U postgres -d $DB -c "SELECT status, COUNT(*) FROM products GROUP BY status;"

echo "4. Products without images:"
docker exec $CONTAINER psql -U postgres -d $DB -c "SELECT COUNT(*) FROM products WHERE images IS NULL OR array_length(images, 1) = 0;"

echo "5. Products with invalid prices:"
docker exec $CONTAINER psql -U postgres -d $DB -c "SELECT COUNT(*) FROM products WHERE price <= 0;"

echo "Verification complete!"
```

Utilisation:

```bash
# Rendre le script exécutable
chmod +x apps/backend/scripts/verify-data.sh

# Exécuter
./apps/backend/scripts/verify-data.sh
```

### Vérification via l'API

```bash
# Vérifier que l'API retourne les données
curl http://localhost:4000/api/products

# Vérifier une catégorie spécifique
curl "http://localhost:4000/api/products?category=wall-hanging"

# Vérifier un statut spécifique
curl "http://localhost:4000/api/products?status=available"
```

---

## Troubleshooting

### Problème: "Connection refused" lors du seeding

**Cause**: Le seeder ne peut pas se connecter à PostgreSQL.

**Solutions**:

```bash
# 1. Vérifier que PostgreSQL est en cours d'exécution
docker compose -f docker-compose.dev.yml ps postgres
# ou en production:
docker compose -f docker-compose.prod.yml ps postgres

# 2. Vérifier les logs de PostgreSQL
docker logs atelier-kaisla-postgres-dev
# ou:
docker logs atelier-kaisla-postgres-prod

# 3. Vérifier la configuration dans .env
cat .env | grep POSTGRES

# 4. Tester la connexion manuellement
docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT 1;"
```

### Problème: "Database does not exist"

**Solutions**:

```bash
# 1. Créer la base de données manuellement
docker exec -it atelier-kaisla-postgres-dev psql -U postgres -c "CREATE DATABASE atelier_kaisla_dev;"

# 2. Ou relancer l'initialisation avec les scripts init
make clean-dev
make init
```

### Problème: "Table 'products' does not exist"

**Cause**: Les migrations n'ont pas été exécutées.

**Solutions**:

```bash
# Exécuter les migrations en dev
make migration-run-docker

# Exécuter les migrations en production
docker exec atelier-kaisla-backend-prod npm run migration:run
```

### Problème: Données dupliquées après plusieurs seedings

**Cause**: Le seeder en mode append ajoute les données à chaque fois.

**Solutions**:

```bash
# Option 1: Utiliser le mode clean
npm run seed:clean

# Option 2: Supprimer manuellement les produits
docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev
DELETE FROM products;
\q

# Option 3: Ajouter une vérification dans le seeder pour éviter les doublons
# (Voir la section suivante)
```

### Problème: Permission denied lors de l'exécution

**Solutions**:

```bash
# Rendre le script exécutable
chmod +x apps/backend/src/database/seeds/seed.ts

# Vérifier les permissions dans Docker
docker exec atelier-kaisla-backend-dev ls -la /app/src/database/seeds/
```

### Problème: TypeScript ou module resolution errors

**Solutions**:

```bash
# 1. Rebuild le projet backend
cd apps/backend
npm run build

# 2. Réinstaller les dépendances
npm ci

# 3. Vérifier le tsconfig.json
cat tsconfig.json
```

---

## Amélioration: Prévenir les doublons

Pour éviter de créer des doublons lors de seedings multiples, vous pouvez modifier le seeder:

### Option 1: Vérifier l'existence avant d'insérer

```typescript
// Dans product.seeder.ts
private async seedProducts(
  repository: Repository<Product>,
  data: any[],
): Promise<Product[]> {
  const results: Product[] = [];

  for (const item of data) {
    // Vérifier si le produit existe déjà (par nom)
    const existing = await repository.findOne({
      where: { name: item.name }
    });

    if (existing) {
      this.logger.log(`Product "${item.name}" already exists, skipping...`);
      results.push(existing);
    } else {
      const product = repository.create(item);
      const saved = await repository.save(product);
      results.push(saved);
    }
  }

  return results;
}
```

### Option 2: Utiliser upsert

```typescript
// Insérer ou mettre à jour
await repository.upsert(data, ['name']); // 'name' comme clé unique
```

---

## Commandes rapides (cheat sheet)

### Développement

```bash
# Démarrer l'environnement
make dev-up-d

# Seeder la base
make seed-docker

# Seeder avec nettoyage
make seed-docker-clean

# Vérifier les données
make db-shell
SELECT COUNT(*) FROM products;
\q
```

### Production

```bash
# Backup
docker exec atelier-kaisla-postgres-prod pg_dump -U postgres -d atelier_kaisla_prod > backup.sql

# Seeder (append)
docker exec atelier-kaisla-backend-prod npm run seed

# Vérifier
docker exec -it atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod -c "SELECT COUNT(*) FROM products;"

# Tester l'API
curl http://localhost:4000/api/products
```

---

## Prochaines étapes recommandées

1. **Ajouter une protection interactive** pour le mode clean en production
2. **Créer des seeders spécifiques** pour la production vs développement
3. **Implémenter la détection de doublons** dans le seeder
4. **Ajouter un endpoint API admin** pour seeder depuis le backoffice
5. **Créer un script de vérification automatique** des données
6. **Ajouter des logs détaillés** de seeding dans un fichier

---

## Support

Si vous rencontrez des problèmes non couverts par ce guide:

1. Vérifier les logs: `make dev-logs-backend` ou `make prod-logs`
2. Vérifier la connexion DB: `make db-shell`
3. Vérifier les migrations: `make migration-run-docker`
4. Consulter la documentation technique: `apps/backend/src/database/seeds/README.md`
