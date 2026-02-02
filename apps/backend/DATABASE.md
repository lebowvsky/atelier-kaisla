# TypeORM Configuration Guide

## Overview

Le backend utilise TypeORM comme ORM pour interagir avec PostgreSQL. Cette configuration suit les meilleures pratiques NestJS et TypeORM.

## Configuration

### Variables d'environnement

Le backend supporte **deux conventions de nommage** pour la compatibilité Docker:

1. **POSTGRES_*** - Utilisé dans le fichier `.env` à la racine du projet monorepo
2. **DATABASE_*** - Utilisé par Docker Compose dans les variables d'environnement du conteneur

**Fichier `.env` à la racine du projet:**

```env
# Application
NODE_ENV=development
PORT=4000

# PostgreSQL Database
# Note: Use "localhost" when running commands locally (migrations, seeds)
#       Use "postgres" when running inside Docker containers
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=atelier_kaisla_dev

# TypeORM Options (optionnel)
TYPEORM_SYNC=false
```

**Note**: Le fichier `.env` doit être à la **racine du monorepo** (`/atelier-kaisla/.env`), pas dans `apps/backend/`.

**Important**:
- Utilisez `POSTGRES_HOST=localhost` pour exécuter les migrations/seeders depuis votre machine (en dehors de Docker)
- Docker Compose surcharge automatiquement cette valeur avec `DATABASE_HOST=postgres` à l'intérieur des conteneurs
- Pour exécuter des commandes dans Docker, utilisez les commandes `*-docker` du Makefile

### Structure des fichiers

```
src/
├── config/
│   ├── database.config.ts          # Configuration TypeORM
│   └── environment.validation.ts   # Validation des variables d'env
├── database/
│   ├── data-source.ts             # DataSource pour migrations
│   └── migrations/                # Fichiers de migration
├── entities/
│   └── *.entity.ts                # Entités TypeORM
└── app.module.ts                  # Module principal avec TypeORM
```

## Utilisation des Seeders

Les seeders permettent de peupler la base de données avec des données initiales ou de test.

### Exécuter les seeders (depuis le host)

Assurez-vous que votre `.env` contient `POSTGRES_HOST=localhost`:

```bash
# Ajouter des données (sans supprimer l'existant)
make seed
# ou
cd apps/backend && npm run seed

# Mode clean (supprime puis recrée les données)
make seed-clean
# ou
cd apps/backend && npm run seed:clean
```

### Exécuter les seeders (dans Docker)

```bash
# Ajouter des données
make seed-docker

# Mode clean
make seed-docker-clean
```

### Créer un nouveau seeder

1. Créez une classe seeder dans `src/database/seeds/`:

```typescript
// src/database/seeds/user.seeder.ts
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';

export class UserSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(clean: boolean = false): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    if (clean) {
      console.log('Cleaning existing users...');
      await userRepository.clear();
    }

    console.log('Running User Seeder...');

    const users = [
      { email: 'admin@example.com', name: 'Admin' },
      { email: 'user@example.com', name: 'User' },
    ];

    await userRepository.save(users);

    console.log(`✓ User seeder completed: ${users.length} users seeded`);
  }
}
```

2. Importez et exécutez dans `src/database/seeds/seed.ts`:

```typescript
import { UserSeeder } from './user.seeder';
import { User } from '../../entities/user.entity';

// Ajoutez User au tableau des entités
entities: [Product, User],

// Exécutez le seeder
const userSeeder = new UserSeeder(dataSource);
await userSeeder.run(cleanFlag);
```

## Utilisation des Migrations

### Créer une migration vide

```bash
npm run migration:create -- src/database/migrations/MigrationName
```

### Générer une migration à partir des entités

```bash
# Depuis le host (POSTGRES_HOST=localhost dans .env)
make migration-generate NAME=MigrationName
# ou
cd apps/backend && npm run migration:generate -- src/database/migrations/MigrationName

# Depuis Docker
docker exec -it atelier-kaisla-backend-dev npm run migration:generate -- src/database/migrations/MigrationName
```

Cette commande compare les entités TypeORM avec le schéma de la base de données et génère automatiquement les modifications nécessaires.

### Exécuter les migrations

```bash
# Depuis le host (POSTGRES_HOST=localhost dans .env)
make migration-run
# ou
cd apps/backend && npm run migration:run

# Depuis Docker
make migration-run-docker
# ou
docker exec -it atelier-kaisla-backend-dev npm run migration:run
```

### Annuler la dernière migration

```bash
npm run migration:revert
```

### Voir les migrations

```bash
npm run migration:show
```

## Créer une nouvelle entité

1. Créez un fichier dans `src/entities/` avec l'extension `.entity.ts`
2. Définissez votre entité avec les décorateurs TypeORM:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('table_name')
@Index(['field1', 'field2']) // Index composite
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  @Index() // Index simple
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

3. TypeORM chargera automatiquement l'entité grâce à `autoLoadEntities: true`

## Bonnes pratiques

### Indexes

- Ajoutez des index sur les colonnes fréquemment utilisées dans les WHERE, JOIN, ORDER BY
- Utilisez `@Index()` pour les index simples
- Utilisez `@Index(['col1', 'col2'])` au niveau de la classe pour les index composites

### Types de colonnes

- `uuid` pour les clés primaires (meilleure performance que les entiers auto-incrémentés)
- `enum` pour les valeurs fixes
- `decimal` pour les montants financiers
- `json` pour les données structurées flexibles
- `simple-array` pour les tableaux simples

### Timestamps

Utilisez toujours `@CreateDateColumn()` et `@UpdateDateColumn()` pour l'audit.

### Migrations vs Synchronize

- **Développement**: Utilisez migrations (recommandé) ou `TYPEORM_SYNC=true` pour prototypage rapide
- **Production**: `synchronize: false` + migrations uniquement (OBLIGATOIRE)

⚠️ **IMPORTANT**: Ne JAMAIS utiliser `synchronize: true` en production! Cela supprime et recrée les tables à chaque redémarrage.

**Activer le mode synchronize en développement:**
```env
TYPEORM_SYNC=true
NODE_ENV=development
```

## Connexion à la base de données

### Via Docker

```bash
# Accéder au shell PostgreSQL
make db-shell

# Ou directement
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d atelier_kaisla_dev
```

### Via CLI local

```bash
psql -h localhost -p 5432 -U postgres -d atelier_kaisla_dev
```

## Dépannage

### Erreur: `getaddrinfo ENOTFOUND postgres`

Cette erreur se produit lorsque vous essayez de vous connecter à l'hôte `postgres` (nom du service Docker) depuis l'extérieur de Docker.

**Solution:** Mettez à jour `POSTGRES_HOST=localhost` dans votre fichier `.env`:

```bash
# Éditez le fichier .env
POSTGRES_HOST=localhost
```

Puis relancez votre commande:

```bash
make seed
```

**Alternative:** Exécutez la commande dans Docker où le hostname `postgres` est valide:

```bash
make seed-docker
```

### Erreur: Connection refused sur le port 5432

PostgreSQL n'est pas lancé ou n'est pas accessible sur le port spécifié.

**Vérifiez que PostgreSQL est démarré:**

```bash
# Vérifier le statut des conteneurs
make ps

# Ou manuellement
docker compose -f docker-compose.dev.yml ps
```

**Démarrer PostgreSQL si nécessaire:**

```bash
make dev-up-d
```

**Vérifier que PostgreSQL est en bonne santé:**

```bash
# Voir les logs PostgreSQL
docker compose -f docker-compose.dev.yml logs postgres

# Accéder au shell PostgreSQL
make db-shell
```

### Erreur: Authentication failed for user "postgres"

Vérifiez le mot de passe dans le fichier `.env`:

```bash
POSTGRES_PASSWORD=postgres
```

### Port 5432 déjà utilisé

Si vous avez PostgreSQL installé localement sur votre machine:

**Option 1:** Arrêter PostgreSQL local:

```bash
# macOS
brew services stop postgresql

# Linux (systemd)
sudo systemctl stop postgresql
```

**Option 2:** Changer le port dans `.env` et `docker-compose.dev.yml`:

```bash
# .env
POSTGRES_PORT=5433

# docker-compose.dev.yml (service postgres)
ports:
  - "5433:5432"
```

### Erreur de connexion

1. Vérifiez que PostgreSQL est démarré:
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. Vérifiez les variables d'environnement:
   ```bash
   cat .env
   ```

3. Vérifiez les logs du backend:
   ```bash
   make dev-logs-backend
   ```

### Migration échoue

1. Vérifiez que la base de données est accessible
2. Vérifiez que toutes les migrations précédentes ont été exécutées
3. Consultez la table `migrations_history` pour voir l'état

### Synchronize ne fonctionne pas

Si vous utilisez des migrations, `synchronize` doit être à `false`. Utilisez les commandes de migration pour mettre à jour le schéma.

## Exemples de requêtes

### Dans un service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { status: 'available' },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return await this.productRepository.save(product);
  }
}
```

## Ressources

- [Documentation TypeORM](https://typeorm.io/)
- [Documentation NestJS TypeORM](https://docs.nestjs.com/techniques/database)
- [Guide des migrations TypeORM](https://typeorm.io/migrations)
