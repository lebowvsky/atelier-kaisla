#!/bin/bash

# Script de correction rapide des erreurs 500 en production
# Ce script applique les corrections sans rebuild complet

set -e  # Exit on error

echo "🔧 Correction des erreurs 500 en production"
echo "==========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un message d'erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher un message d'info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

success "Docker détecté"

# Vérifier que le conteneur backend existe
if ! docker ps -a | grep -q atelier-kaisla-backend-prod; then
    error "Le conteneur backend (atelier-kaisla-backend-prod) n'existe pas"
    error "Assurez-vous que docker-compose.prod.yml a été démarré au moins une fois"
    exit 1
fi

success "Conteneur backend trouvé"

# Vérifier que le conteneur postgres existe
if ! docker ps -a | grep -q atelier-kaisla-postgres-prod; then
    error "Le conteneur PostgreSQL (atelier-kaisla-postgres-prod) n'existe pas"
    exit 1
fi

success "Conteneur PostgreSQL trouvé"

echo ""
info "Étape 1/5: Vérification de l'état des conteneurs"
echo "================================================"

# Vérifier l'état de PostgreSQL
POSTGRES_STATUS=$(docker inspect -f '{{.State.Health.Status}}' atelier-kaisla-postgres-prod 2>/dev/null || echo "unknown")
if [ "$POSTGRES_STATUS" == "healthy" ]; then
    success "PostgreSQL est healthy"
elif [ "$POSTGRES_STATUS" == "unhealthy" ]; then
    error "PostgreSQL est unhealthy - redémarrage..."
    docker restart atelier-kaisla-postgres-prod
    info "Attente de 10 secondes pour le démarrage de PostgreSQL..."
    sleep 10
else
    info "État PostgreSQL: $POSTGRES_STATUS"
fi

# Vérifier l'état du backend
BACKEND_STATUS=$(docker inspect -f '{{.State.Health.Status}}' atelier-kaisla-backend-prod 2>/dev/null || echo "unknown")
info "État du backend: $BACKEND_STATUS"

echo ""
info "Étape 2/5: Création du répertoire uploads"
echo "=========================================="

# Créer le répertoire uploads s'il n'existe pas
if docker exec atelier-kaisla-backend-prod test -d /app/uploads; then
    success "Le répertoire /app/uploads existe déjà"
else
    info "Création du répertoire /app/uploads..."
    docker exec atelier-kaisla-backend-prod mkdir -p /app/uploads
    success "Répertoire /app/uploads créé"
fi

# Vérifier et corriger les permissions
info "Vérification des permissions..."
docker exec atelier-kaisla-backend-prod chown -R nestjs:nodejs /app/uploads 2>/dev/null || true
success "Permissions configurées"

echo ""
info "Étape 3/5: Vérification de la base de données"
echo "=============================================="

# Déterminer les credentials de la base de données
DB_USER="${POSTGRES_USER:-kaisla_admin}"
DB_NAME="${POSTGRES_DB:-atelier_kaisla_prod}"

info "Utilisateur DB: $DB_USER"
info "Base de données: $DB_NAME"

# Vérifier si la table products existe
TABLE_EXISTS=$(docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products');" 2>/dev/null || echo "false")

if [ "$TABLE_EXISTS" == "t" ]; then
    success "La table products existe"
else
    info "La table products n'existe pas - création..."

    # Créer la table products
    docker exec -i atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" << 'EOF'
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(20) NOT NULL CHECK (category IN ('wall-hanging', 'rug')),
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('available', 'sold', 'draft')),
    stock_quantity INT DEFAULT 0,
    images TEXT,
    dimensions JSON,
    materials TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EOF

    if [ $? -eq 0 ]; then
        success "Table products créée avec succès"
    else
        error "Échec de la création de la table products"
        error "Vérifiez les logs PostgreSQL: docker logs atelier-kaisla-postgres-prod"
        exit 1
    fi
fi

# Compter le nombre de produits
PRODUCT_COUNT=$(docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
info "Nombre de produits en base: $PRODUCT_COUNT"

echo ""
info "Étape 4/5: Redémarrage du backend"
echo "=================================="

docker restart atelier-kaisla-backend-prod
success "Backend redémarré"

info "Attente de 15 secondes pour le démarrage complet..."
sleep 15

echo ""
info "Étape 5/5: Tests de vérification"
echo "================================="

# Test du health check interne
info "Test du health check interne..."
if docker exec atelier-kaisla-backend-prod wget --spider -q http://localhost:4000/health; then
    success "Health check interne: OK"
else
    error "Health check interne: ÉCHEC"
fi

# Test de l'API publique (si accessible)
info "Test de l'API publique..."
if curl -f -s -o /dev/null https://api.lebowvsky.com/api/health; then
    success "API publique health check: OK"
else
    error "API publique health check: ÉCHEC"
    info "Cela peut être normal si Traefik n'est pas encore configuré"
fi

# Test de l'endpoint products
info "Test de l'endpoint /api/products..."
if curl -f -s -o /dev/null https://api.lebowvsky.com/api/products; then
    success "Endpoint /api/products: OK"
else
    error "Endpoint /api/products: ÉCHEC"
    info "Vérifiez les logs: docker logs atelier-kaisla-backend-prod"
fi

echo ""
echo "========================================="
success "Corrections appliquées avec succès!"
echo "========================================="
echo ""
info "Prochaines étapes:"
echo "  1. Vérifier les logs du backend:"
echo "     docker logs -f atelier-kaisla-backend-prod"
echo ""
echo "  2. Tester l'API depuis le navigateur:"
echo "     https://api.lebowvsky.com/api/health"
echo "     https://api.lebowvsky.com/api/products"
echo ""
echo "  3. Vérifier le frontend:"
echo "     https://kaisla.lebowvsky.com"
echo ""
info "Pour plus de détails, consultez:"
echo "  - PRODUCTION-TROUBLESHOOTING.md"
echo "  - PRODUCTION-FIXES.md"
echo ""
