#!/bin/bash

# Script de vérification de l'intégrité des données
# Usage: ./scripts/verify-data.sh [dev|prod]

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Déterminer l'environnement
ENV=${1:-dev}

if [ "$ENV" = "prod" ]; then
  CONTAINER="atelier-kaisla-postgres-prod"
  DB="atelier_kaisla_prod"
  echo -e "${YELLOW}Vérification de la base de données PRODUCTION${NC}"
else
  CONTAINER="atelier-kaisla-postgres-dev"
  DB="atelier_kaisla_dev"
  echo -e "${GREEN}Vérification de la base de données DÉVELOPPEMENT${NC}"
fi

echo "========================================="
echo "  Vérification de l'intégrité des données"
echo "========================================="
echo ""

# Vérifier que le conteneur existe et est en cours d'exécution
if ! docker ps | grep -q $CONTAINER; then
  echo -e "${RED}❌ Erreur: Le conteneur $CONTAINER n'est pas en cours d'exécution${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Conteneur PostgreSQL actif${NC}"
echo ""

# 1. Compter le nombre total de produits
echo "1️⃣  Nombre total de produits:"
docker exec $CONTAINER psql -U postgres -d $DB -t -c "SELECT COUNT(*) FROM products;" | xargs
echo ""

# 2. Répartition par catégorie
echo "2️⃣  Répartition par catégorie:"
docker exec $CONTAINER psql -U postgres -d $DB -c "
  SELECT
    category,
    COUNT(*) as count
  FROM products
  GROUP BY category
  ORDER BY category;
"
echo ""

# 3. Répartition par statut
echo "3️⃣  Répartition par statut:"
docker exec $CONTAINER psql -U postgres -d $DB -c "
  SELECT
    status,
    COUNT(*) as count
  FROM products
  GROUP BY status
  ORDER BY status;
"
echo ""

# 4. Produits sans images
echo "4️⃣  Produits sans images:"
NO_IMAGES=$(docker exec $CONTAINER psql -U postgres -d $DB -t -c "
  SELECT COUNT(*)
  FROM products
  WHERE images IS NULL OR array_length(images, 1) = 0 OR array_length(images, 1) IS NULL;
" | xargs)
if [ "$NO_IMAGES" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $NO_IMAGES produit(s) sans images${NC}"
else
  echo -e "${GREEN}✓ Tous les produits ont des images${NC}"
fi
echo ""

# 5. Produits avec prix invalide
echo "5️⃣  Produits avec prix invalide (≤ 0):"
INVALID_PRICE=$(docker exec $CONTAINER psql -U postgres -d $DB -t -c "
  SELECT COUNT(*)
  FROM products
  WHERE price <= 0;
" | xargs)
if [ "$INVALID_PRICE" -gt 0 ]; then
  echo -e "${RED}❌ $INVALID_PRICE produit(s) avec prix invalide${NC}"
  docker exec $CONTAINER psql -U postgres -d $DB -c "
    SELECT id, name, price
    FROM products
    WHERE price <= 0;
  "
else
  echo -e "${GREEN}✓ Tous les produits ont un prix valide${NC}"
fi
echo ""

# 6. Produits sans nom
echo "6️⃣  Produits sans nom:"
NO_NAME=$(docker exec $CONTAINER psql -U postgres -d $DB -t -c "
  SELECT COUNT(*)
  FROM products
  WHERE name IS NULL OR TRIM(name) = '';
" | xargs)
if [ "$NO_NAME" -gt 0 ]; then
  echo -e "${RED}❌ $NO_NAME produit(s) sans nom${NC}"
else
  echo -e "${GREEN}✓ Tous les produits ont un nom${NC}"
fi
echo ""

# 7. Produits avec stock négatif
echo "7️⃣  Produits avec stock négatif:"
NEGATIVE_STOCK=$(docker exec $CONTAINER psql -U postgres -d $DB -t -c "
  SELECT COUNT(*)
  FROM products
  WHERE \"stockQuantity\" < 0;
" | xargs)
if [ "$NEGATIVE_STOCK" -gt 0 ]; then
  echo -e "${RED}❌ $NEGATIVE_STOCK produit(s) avec stock négatif${NC}"
else
  echo -e "${GREEN}✓ Tous les produits ont un stock valide${NC}"
fi
echo ""

# 8. Statistiques de prix
echo "8️⃣  Statistiques de prix:"
docker exec $CONTAINER psql -U postgres -d $DB -c "
  SELECT
    MIN(price) as prix_min,
    MAX(price) as prix_max,
    ROUND(AVG(price), 2) as prix_moyen,
    ROUND(STDDEV(price), 2) as ecart_type
  FROM products;
"
echo ""

# 9. Top 5 des produits les plus chers
echo "9️⃣  Top 5 des produits les plus chers:"
docker exec $CONTAINER psql -U postgres -d $DB -c "
  SELECT
    name,
    category,
    price,
    status
  FROM products
  ORDER BY price DESC
  LIMIT 5;
"
echo ""

# 10. Dates de création
echo "🔟 Plage de dates de création:"
docker exec $CONTAINER psql -U postgres -d $DB -c "
  SELECT
    MIN(created_at)::date as premiere_creation,
    MAX(created_at)::date as derniere_creation,
    COUNT(*) as total
  FROM products;
"
echo ""

# Résumé final
echo "========================================="
echo "  Résumé de la vérification"
echo "========================================="

TOTAL=$(docker exec $CONTAINER psql -U postgres -d $DB -t -c "SELECT COUNT(*) FROM products;" | xargs)
ISSUES=0

if [ "$NO_IMAGES" -gt 0 ]; then ((ISSUES++)); fi
if [ "$INVALID_PRICE" -gt 0 ]; then ((ISSUES++)); fi
if [ "$NO_NAME" -gt 0 ]; then ((ISSUES++)); fi
if [ "$NEGATIVE_STOCK" -gt 0 ]; then ((ISSUES++)); fi

if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GREEN}✓ Aucun problème détecté${NC}"
  echo -e "${GREEN}✓ Total: $TOTAL produits${NC}"
else
  echo -e "${YELLOW}⚠️  $ISSUES problème(s) détecté(s)${NC}"
  echo -e "${YELLOW}Total: $TOTAL produits${NC}"
fi

echo "========================================="
echo ""
