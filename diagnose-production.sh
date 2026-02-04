#!/bin/bash

# Script de diagnostic de l'environnement de production
# Ce script collecte des informations pour identifier les problèmes

set +e  # Continue on error to collect all info

echo "🔍 Diagnostic de l'environnement de production"
echo "=============================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher une section
section() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher une info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

success "Docker détecté: $(docker --version)"

# Section 1: État des conteneurs
section "1. État des Conteneurs"

echo "Conteneurs Atelier Kaisla:"
docker ps -a --filter "name=atelier-kaisla" --format "table {{.Names}}\t{{.Status}}\t{{.State}}" || error "Erreur lors de la récupération des conteneurs"

echo ""
echo "Health status des conteneurs:"
for container in atelier-kaisla-backend-prod atelier-kaisla-postgres-prod atelier-kaisla-frontend-prod atelier-kaisla-backoffice-prod; do
    if docker ps -a | grep -q "$container"; then
        HEALTH=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no healthcheck")
        if [ "$HEALTH" == "healthy" ]; then
            success "$container: $HEALTH"
        elif [ "$HEALTH" == "unhealthy" ]; then
            error "$container: $HEALTH"
        else
            info "$container: $HEALTH"
        fi
    else
        error "$container: NOT FOUND"
    fi
done

# Section 2: Logs du Backend
section "2. Logs du Backend (50 dernières lignes)"

if docker ps -a | grep -q "atelier-kaisla-backend-prod"; then
    docker logs --tail 50 atelier-kaisla-backend-prod
else
    error "Conteneur backend introuvable"
fi

# Section 3: Variables d'environnement du Backend
section "3. Variables d'Environnement du Backend"

if docker ps -a | grep -q "atelier-kaisla-backend-prod"; then
    echo "Variables importantes (mots de passe masqués):"
    docker exec atelier-kaisla-backend-prod env 2>/dev/null | grep -E "NODE_ENV|PORT|DATABASE|POSTGRES|FRONTEND|BACKOFFICE" | sed 's/PASSWORD=.*/PASSWORD=***MASKED***/g' || error "Impossible de récupérer les variables d'environnement"
else
    error "Conteneur backend introuvable"
fi

# Section 4: Base de données
section "4. État de la Base de Données"

if docker ps -a | grep -q "atelier-kaisla-postgres-prod"; then
    echo "Logs PostgreSQL (20 dernières lignes):"
    docker logs --tail 20 atelier-kaisla-postgres-prod

    echo ""
    echo "Test de connexion PostgreSQL:"
    DB_USER="${POSTGRES_USER:-kaisla_admin}"
    DB_NAME="${POSTGRES_DB:-atelier_kaisla_prod}"

    if docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
        success "Connexion PostgreSQL: OK"

        echo ""
        echo "Tables existantes:"
        docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null || error "Impossible de lister les tables"

        echo ""
        echo "Nombre de produits:"
        PRODUCT_COUNT=$(docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "ERROR")
        if [ "$PRODUCT_COUNT" == "ERROR" ]; then
            error "La table products n'existe pas ou est inaccessible"
        else
            success "Nombre de produits: $PRODUCT_COUNT"
        fi
    else
        error "Connexion PostgreSQL: ÉCHEC"
    fi
else
    error "Conteneur PostgreSQL introuvable"
fi

# Section 5: Répertoire uploads
section "5. Répertoire Uploads"

if docker ps | grep -q "atelier-kaisla-backend-prod"; then
    if docker exec atelier-kaisla-backend-prod test -d /app/uploads; then
        success "Répertoire /app/uploads existe"
        echo ""
        echo "Contenu du répertoire uploads:"
        docker exec atelier-kaisla-backend-prod ls -lah /app/uploads 2>/dev/null || error "Impossible de lister le répertoire"

        echo ""
        echo "Permissions du répertoire:"
        docker exec atelier-kaisla-backend-prod stat -c "%a %U:%G %n" /app/uploads 2>/dev/null || \
        docker exec atelier-kaisla-backend-prod ls -ld /app/uploads 2>/dev/null || \
        error "Impossible de vérifier les permissions"
    else
        error "Répertoire /app/uploads n'existe pas"
    fi
else
    error "Conteneur backend n'est pas en cours d'exécution"
fi

# Section 6: Tests de connectivité
section "6. Tests de Connectivité"

echo "Test du health check interne:"
if docker exec atelier-kaisla-backend-prod wget --spider -q http://localhost:4000/health 2>/dev/null; then
    success "Health check interne: OK"
else
    error "Health check interne: ÉCHEC"
fi

echo ""
echo "Test de l'API publique (health):"
if curl -f -s -o /dev/null https://api.lebowvsky.com/api/health 2>/dev/null; then
    success "API publique health: OK"
    HEALTH_RESPONSE=$(curl -s https://api.lebowvsky.com/api/health)
    echo "  Réponse: $HEALTH_RESPONSE"
else
    error "API publique health: ÉCHEC"
fi

echo ""
echo "Test de l'API publique (products):"
if curl -f -s -o /dev/null https://api.lebowvsky.com/api/products 2>/dev/null; then
    success "API publique products: OK"
    PRODUCTS_COUNT=$(curl -s https://api.lebowvsky.com/api/products | jq '. | length' 2>/dev/null || echo "?")
    echo "  Nombre de produits retournés: $PRODUCTS_COUNT"
else
    error "API publique products: ÉCHEC"
fi

echo ""
echo "Test du frontend:"
if curl -f -s -o /dev/null https://kaisla.lebowvsky.com 2>/dev/null; then
    success "Frontend accessible: OK"
else
    error "Frontend accessible: ÉCHEC"
fi

echo ""
echo "Test du backoffice:"
if curl -f -s -o /dev/null https://bokaisla.lebowvsky.com 2>/dev/null; then
    success "Backoffice accessible: OK"
else
    error "Backoffice accessible: ÉCHEC"
fi

# Section 7: Réseau Docker
section "7. Réseau Docker"

echo "Réseau atelier-network:"
docker network inspect atelier-network --format '{{json .Containers}}' 2>/dev/null | jq '.' 2>/dev/null || docker network inspect atelier-network 2>/dev/null || error "Réseau atelier-network introuvable"

# Section 8: Volumes Docker
section "8. Volumes Docker"

echo "Volumes Atelier Kaisla:"
docker volume ls | grep -E "postgres_data_prod|uploads_prod" || info "Aucun volume trouvé"

echo ""
for vol in postgres_data_prod uploads_prod; do
    if docker volume ls | grep -q "$vol"; then
        success "Volume $vol existe"
        docker volume inspect "$vol" --format 'Mountpoint: {{.Mountpoint}}' 2>/dev/null
    else
        error "Volume $vol n'existe pas"
    fi
done

# Section 9: Résumé et Recommandations
section "9. Résumé et Recommandations"

echo "Analyse automatique des problèmes détectés:"
echo ""

# Vérifier si le backend est en cours d'exécution
if ! docker ps | grep -q "atelier-kaisla-backend-prod"; then
    error "Le backend n'est pas en cours d'exécution"
    echo "  → Recommandation: docker restart atelier-kaisla-backend-prod"
fi

# Vérifier si le backend est healthy
BACKEND_HEALTH=$(docker inspect -f '{{.State.Health.Status}}' atelier-kaisla-backend-prod 2>/dev/null)
if [ "$BACKEND_HEALTH" == "unhealthy" ]; then
    error "Le backend est unhealthy"
    echo "  → Recommandation: Vérifier les logs avec 'docker logs atelier-kaisla-backend-prod'"
fi

# Vérifier si PostgreSQL est healthy
POSTGRES_HEALTH=$(docker inspect -f '{{.State.Health.Status}}' atelier-kaisla-postgres-prod 2>/dev/null)
if [ "$POSTGRES_HEALTH" != "healthy" ]; then
    error "PostgreSQL n'est pas healthy"
    echo "  → Recommandation: docker restart atelier-kaisla-postgres-prod"
fi

# Vérifier si la table products existe
if docker ps | grep -q "atelier-kaisla-postgres-prod"; then
    DB_USER="${POSTGRES_USER:-kaisla_admin}"
    DB_NAME="${POSTGRES_DB:-atelier_kaisla_prod}"
    TABLE_EXISTS=$(docker exec atelier-kaisla-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products');" 2>/dev/null || echo "false")

    if [ "$TABLE_EXISTS" != "t" ]; then
        error "La table products n'existe pas"
        echo "  → Recommandation: Exécuter './fix-production-500.sh'"
    fi
fi

# Vérifier si le répertoire uploads existe
if docker ps | grep -q "atelier-kaisla-backend-prod"; then
    if ! docker exec atelier-kaisla-backend-prod test -d /app/uploads 2>/dev/null; then
        error "Le répertoire /app/uploads n'existe pas"
        echo "  → Recommandation: Exécuter './fix-production-500.sh'"
    fi
fi

# Vérifier si l'API publique répond
if ! curl -f -s -o /dev/null https://api.lebowvsky.com/api/health 2>/dev/null; then
    error "L'API publique ne répond pas"
    echo "  → Vérifier la configuration Traefik"
    echo "  → Vérifier les logs Traefik"
    echo "  → Vérifier les labels Docker du conteneur backend"
fi

echo ""
section "Fin du Diagnostic"

echo ""
info "Pour appliquer les corrections automatiquement, exécutez:"
echo "  ./fix-production-500.sh"
echo ""
info "Pour plus de détails, consultez:"
echo "  - QUICK-FIX-PRODUCTION.md"
echo "  - PRODUCTION-TROUBLESHOOTING.md"
echo "  - PRODUCTION-FIXES.md"
echo ""
