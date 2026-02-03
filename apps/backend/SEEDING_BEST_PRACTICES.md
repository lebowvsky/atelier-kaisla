# Bonnes pratiques de seeding - Atelier Kaisla

Ce document décrit les meilleures pratiques pour gérer les données mockées et le seeding en développement et en production.

## Principes généraux

### 1. Backups obligatoires en production

**Règle d'or**: Toujours faire un backup avant toute opération de seeding en production.

```bash
# Créer un backup daté automatiquement
make backup-prod

# Le backup sera créé dans: backups/backup_prod_YYYYMMDD_HHMMSS.sql
```

**Pourquoi?**
- Protection contre les erreurs humaines
- Possibilité de restaurer rapidement
- Traçabilité des modifications

### 2. Utiliser le bon seeder selon le contexte

| Scénario | Seeder à utiliser | Raison |
|----------|-------------------|---------|
| Première initialisation | `seed` standard | Plus rapide, base vide |
| Ajout de données en prod | `seed:enhanced` | Évite les doublons |
| Mise à jour de données | `seed:enhanced` | Met à jour l'existant |
| Développement rapide | `seed` standard | Rapidité |
| Tests répétés | `seed:enhanced` | Idempotence |

### 3. Vérifier avant et après

```bash
# Avant le seeding
make verify-data-prod

# Seeding
make seed-enhanced-prod

# Après le seeding
make verify-data-prod
```

## Stratégies de seeding

### Développement

#### Option A: Base propre à chaque fois

```bash
# Réinitialiser complètement
make clean-dev
make init
make seed-docker
```

**Avantages**:
- État connu et reproductible
- Pas de données corrompues

**Inconvénients**:
- Perte des modifications manuelles
- Plus lent

#### Option B: Ajout incrémental

```bash
# Ajouter sans supprimer
make seed-enhanced-docker
```

**Avantages**:
- Conserve les modifications
- Rapide

**Inconvénients**:
- Peut créer des incohérences
- Base de données peut devenir lourde

### Production

#### Stratégie recommandée: Seeding progressif

1. **Phase 1: Initialisation** (une seule fois)
   ```bash
   make backup-prod
   make seed-prod
   ```

2. **Phase 2: Mise à jour** (régulièrement)
   ```bash
   make backup-prod
   make seed-enhanced-prod
   ```

3. **Phase 3: Nettoyage** (uniquement si nécessaire)
   ```bash
   make backup-prod
   make verify-data-prod
   # Supprimer manuellement les données obsolètes via SQL ou backoffice
   ```

## Gestion des données de test vs production

### Marquage des données seedées

#### Option 1: Flag booléen (recommandé)

Ajouter un champ à l'entité:

```typescript
@Column({ type: 'boolean', default: false, name: 'is_seed_data' })
isSeedData: boolean;
```

Modification du seeder:

```typescript
const product = repository.create({
  ...item,
  isSeedData: true, // Marquer comme donnée de seed
});
```

**Avantages**:
- Facile à requêter
- Permet de filtrer/supprimer les données de test
- Peut être masqué dans le backoffice

**Usage**:
```sql
-- Voir uniquement les vraies données
SELECT * FROM products WHERE is_seed_data = false;

-- Supprimer les données de test
DELETE FROM products WHERE is_seed_data = true;
```

#### Option 2: Tags/labels

Utiliser un système de tags:

```typescript
@Column({ type: 'simple-array', nullable: true })
tags?: string[];
```

```typescript
const product = repository.create({
  ...item,
  tags: ['seed', 'test', 'demo'],
});
```

**Avantages**:
- Plus flexible
- Peut combiner plusieurs tags
- Utile pour d'autres cas d'usage

### Environnements séparés

#### Seeders par environnement

```
seeds/
├── seed.ts                    # Script principal
├── product.seeder.ts          # Seeder générique
├── product.seeder.enhanced.ts # Seeder avec prévention doublons
├── environments/
│   ├── development.seeder.ts  # Données dev (nombreuses, variées)
│   ├── staging.seeder.ts      # Données staging (réalistes)
│   └── production.seeder.ts   # Données prod (minimes, démo)
└── data/
    ├── products.data.dev.ts   # Beaucoup de produits
    ├── products.data.staging.ts
    └── products.data.prod.ts  # Quelques produits de démo
```

**Utilisation**:

```typescript
// Dans seed.ts
const nodeEnv = process.env.NODE_ENV || 'development';

let seederData;
if (nodeEnv === 'production') {
  seederData = require('./data/products.data.prod');
} else if (nodeEnv === 'staging') {
  seederData = require('./data/products.data.staging');
} else {
  seederData = require('./data/products.data.dev');
}
```

## Protection en production

### Niveau 1: Variables d'environnement

Ajouter dans `.env.prod`:

```env
# Sécurité seeding
ALLOW_SEEDING=true
ALLOW_CLEAN_SEEDING=false
REQUIRE_SEEDING_CONFIRMATION=true
```

Vérifier dans le seeder:

```typescript
if (process.env.ALLOW_SEEDING !== 'true') {
  console.error('Seeding is disabled in this environment');
  process.exit(1);
}

if (cleanFlag && process.env.ALLOW_CLEAN_SEEDING !== 'true') {
  console.error('Clean seeding is disabled in production');
  process.exit(1);
}
```

### Niveau 2: Endpoint API protégé

Créer un endpoint admin pour seeder depuis le backoffice:

```typescript
// src/admin/seed.controller.ts
import { Controller, Post, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/seed')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class SeedController {
  @Post('products')
  async seedProducts(
    @Query('clean') clean: string,
    @Query('enhanced') enhanced: string,
  ) {
    const isClean = clean === 'true';
    const isEnhanced = enhanced === 'true';

    // Protection production
    if (process.env.NODE_ENV === 'production' && isClean) {
      throw new ForbiddenException('Clean seeding not allowed in production via API');
    }

    // Exécuter le seeder approprié
    // ...

    return {
      success: true,
      message: 'Seeding completed',
    };
  }

  @Get('products/stats')
  async getProductStats() {
    // Retourner les statistiques
  }
}
```

**Avantages**:
- Interface utilisateur depuis le backoffice
- Contrôle d'accès strict
- Logs d'audit intégrés
- Pas besoin d'accès SSH

### Niveau 3: Logs d'audit

Enregistrer chaque opération de seeding:

```typescript
// src/database/seeds/audit.logger.ts
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class SeedAuditLogger {
  private static logFile = path.join(__dirname, '../../../logs/seeding-audit.log');

  static log(operation: string, details: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      operation,
      details,
      user: process.env.USER || 'system',
    };

    const logLine = JSON.stringify(entry) + '\n';

    // Créer le répertoire si nécessaire
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Ajouter au fichier de log
    fs.appendFileSync(this.logFile, logLine);

    // Afficher aussi dans la console
    const logger = new Logger('SeedAudit');
    logger.log(`${operation}: ${JSON.stringify(details)}`);
  }
}
```

Utilisation dans le seeder:

```typescript
// Avant le seeding
SeedAuditLogger.log('seeding_started', {
  cleanMode: cleanFlag,
  preventDuplicates,
  database: dbName,
});

// Après le seeding
SeedAuditLogger.log('seeding_completed', {
  created: wallHangings.created + rugs.created,
  updated: wallHangings.updated + rugs.updated,
  total: stats.total,
});
```

## Gestion des images et assets

### Problème: Images seedées

Les seeders actuels utilisent des URLs Unsplash pour les images. En production, vous voudrez peut-être:

### Solution 1: URLs permanentes

```typescript
// Dans products.data.ts
images: [
  'https://votre-cdn.com/products/wall-hanging-1.jpg',
  'https://votre-cdn.com/products/wall-hanging-1-detail.jpg',
]
```

### Solution 2: Upload automatique

Créer un script pour uploader les images lors du seeding:

```typescript
async function uploadAndGetUrl(localPath: string): Promise<string> {
  // Upload vers S3, Cloudinary, etc.
  return uploadedUrl;
}

// Dans le seeder
for (const product of products) {
  if (product.images) {
    product.images = await Promise.all(
      product.images.map(img => uploadAndGetUrl(img))
    );
  }
}
```

### Solution 3: Images locales

Stocker les images dans le projet:

```
public/
└── seed-images/
    ├── wall-hanging-1.jpg
    ├── wall-hanging-2.jpg
    └── rug-1.jpg
```

```typescript
images: [
  '/seed-images/wall-hanging-1.jpg',
]
```

## Automatisation

### CI/CD: Seeding automatique en staging

```yaml
# .github/workflows/deploy-staging.yml
- name: Run database migrations
  run: |
    docker exec atelier-kaisla-backend-staging npm run migration:run

- name: Seed database if empty
  run: |
    PRODUCT_COUNT=$(docker exec atelier-kaisla-postgres-staging psql -U postgres -d atelier_kaisla_staging -t -c "SELECT COUNT(*) FROM products;")
    if [ "$PRODUCT_COUNT" -eq "0" ]; then
      docker exec atelier-kaisla-backend-staging npm run seed:enhanced
    fi
```

### Cron job: Vérification périodique

```bash
# crontab -e
# Vérifier l'intégrité des données chaque jour à 2h
0 2 * * * /path/to/atelier-kaisla/apps/backend/scripts/verify-data.sh prod >> /var/log/data-verification.log 2>&1
```

## Checklist de seeding en production

Avant chaque seeding en production:

- [ ] Backup créé et vérifié
- [ ] Environnement confirmé (production)
- [ ] Bon seeder choisi (standard vs enhanced)
- [ ] Mode clean uniquement si nécessaire et confirmé
- [ ] Notification de l'équipe si impact attendu
- [ ] Fenêtre de maintenance si seeding important
- [ ] Plan de rollback préparé

Après chaque seeding en production:

- [ ] Vérification des données (`make verify-data-prod`)
- [ ] Test de l'API
- [ ] Vérification du frontend
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Backup post-seeding (optionnel)
- [ ] Documentation mise à jour si changements

## Migration vers des vraies données

### Étape 1: Identifier les données de test

```sql
-- Si vous avez ajouté is_seed_data
SELECT COUNT(*) FROM products WHERE is_seed_data = true;
```

### Étape 2: Ajouter de vraies données via le backoffice

Créer des produits réels via l'interface admin.

### Étape 3: Nettoyer les données de test (optionnel)

```sql
-- Vérifier avant
SELECT id, name FROM products WHERE is_seed_data = true;

-- Supprimer
DELETE FROM products WHERE is_seed_data = true;
```

### Étape 4: Désactiver le seeding automatique

Modifier `.env.prod`:

```env
ALLOW_SEEDING=false
```

## Quand NE PAS utiliser le seeding en production

Le seeding est utile pour:
- ✅ Initialisation d'une nouvelle instance
- ✅ Données de démonstration
- ✅ Tests de charge
- ✅ Environnements de staging

Le seeding n'est PAS approprié pour:
- ❌ Ajouter des produits réels (utiliser le backoffice)
- ❌ Mettre à jour des prix (utiliser l'API ou backoffice)
- ❌ Importer de grandes quantités de données réelles (utiliser un script d'import dédié)
- ❌ Modifier des données clients (utiliser des migrations)

## Alternatives au seeding en production

### 1. Fixtures managées

Créer des "produits de démonstration" permanents via le backoffice avec un flag spécifique.

### 2. Script d'import CSV

```typescript
// src/scripts/import-products-csv.ts
import * as fs from 'fs';
import * as csv from 'csv-parser';

async function importFromCSV(filePath: string) {
  const products = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => products.push(row))
    .on('end', async () => {
      // Importer dans la base
      for (const product of products) {
        await productRepository.save(product);
      }
    });
}
```

### 3. Interface d'import dans le backoffice

Créer une page dans le backoffice pour importer des produits via:
- Upload CSV
- Upload Excel
- API externe (ex: import depuis un ERP)

## Ressources

- [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) - Guide complet
- [SEEDING_QUICKSTART.md](./SEEDING_QUICKSTART.md) - Référence rapide
- [src/database/seeds/README.md](./src/database/seeds/README.md) - Documentation technique
