# Makefile pour simplifier les commandes Docker
.PHONY: help dev-up dev-down dev-logs dev-build prod-up prod-down prod-logs prod-build clean

# Couleurs pour les messages
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m # No Color

help: ## Afficher cette aide
	@echo "$(GREEN)Commandes disponibles :$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# Commandes de développement
dev-up: ## Démarrer l'environnement de développement
	@echo "$(GREEN)Démarrage de l'environnement de développement...$(NC)"
	docker compose -f docker-compose.dev.yml up

dev-up-d: ## Démarrer l'environnement de développement en arrière-plan
	@echo "$(GREEN)Démarrage de l'environnement de développement en arrière-plan...$(NC)"
	docker compose -f docker-compose.dev.yml up -d

dev-down: ## Arrêter l'environnement de développement
	@echo "$(YELLOW)Arrêt de l'environnement de développement...$(NC)"
	docker compose -f docker-compose.dev.yml down

dev-logs: ## Afficher les logs de développement
	docker compose -f docker-compose.dev.yml logs -f

dev-build: ## Reconstruire les images de développement
	@echo "$(GREEN)Reconstruction des images de développement...$(NC)"
	docker compose -f docker-compose.dev.yml build

dev-rebuild: ## Reconstruire sans cache et redémarrer
	@echo "$(GREEN)Reconstruction complète...$(NC)"
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up -d

dev-frontend-fix: ## Fix frontend sass-embedded (clean rebuild avec suppression des volumes)
	@echo "$(YELLOW)Correction du problème sass-embedded du frontend...$(NC)"
	@echo "$(YELLOW)1. Arrêt du frontend...$(NC)"
	docker compose -f docker-compose.dev.yml stop frontend
	@echo "$(YELLOW)2. Suppression du conteneur...$(NC)"
	docker compose -f docker-compose.dev.yml rm -f frontend
	@echo "$(YELLOW)3. Nettoyage des volumes anonymes...$(NC)"
	-docker volume ls -q -f "dangling=true" | xargs docker volume rm 2>/dev/null || true
	@echo "$(GREEN)4. Reconstruction du frontend sans cache...$(NC)"
	docker compose -f docker-compose.dev.yml build --no-cache frontend
	@echo "$(GREEN)5. Démarrage du frontend...$(NC)"
	docker compose -f docker-compose.dev.yml up -d frontend
	@echo "$(GREEN)✓ Frontend reconstruit avec succès !$(NC)"
	@echo "$(GREEN)Vérifiez les logs avec: make dev-logs-frontend$(NC)"

dev-logs-frontend: ## Afficher uniquement les logs du frontend
	docker compose -f docker-compose.dev.yml logs -f frontend

dev-logs-backend: ## Afficher uniquement les logs du backend
	docker compose -f docker-compose.dev.yml logs -f backend

dev-logs-backoffice: ## Afficher uniquement les logs du backoffice
	docker compose -f docker-compose.dev.yml logs -f backoffice

# Commandes de production
prod-up: ## Démarrer l'environnement de production
	@echo "$(GREEN)Démarrage de l'environnement de production...$(NC)"
	docker compose -f docker-compose.prod.yml up -d

prod-down: ## Arrêter l'environnement de production
	@echo "$(YELLOW)Arrêt de l'environnement de production...$(NC)"
	docker compose -f docker-compose.prod.yml down

prod-logs: ## Afficher les logs de production
	docker compose -f docker-compose.prod.yml logs -f

prod-build: ## Reconstruire les images de production
	@echo "$(GREEN)Reconstruction des images de production...$(NC)"
	docker compose -f docker-compose.prod.yml build

# Commandes de nettoyage
clean: ## Nettoyer tous les conteneurs, volumes et images
	@echo "$(YELLOW)Nettoyage complet...$(NC)"
	docker compose -f docker-compose.dev.yml down -v --rmi all
	docker compose -f docker-compose.prod.yml down -v --rmi all

clean-dev: ## Nettoyer uniquement l'environnement de développement
	@echo "$(YELLOW)Nettoyage de l'environnement de développement...$(NC)"
	docker compose -f docker-compose.dev.yml down -v

clean-prod: ## Nettoyer uniquement l'environnement de production
	@echo "$(YELLOW)Nettoyage de l'environnement de production...$(NC)"
	docker compose -f docker-compose.prod.yml down -v

# Commandes de statut
ps: ## Afficher le statut des conteneurs
	docker compose -f docker-compose.dev.yml ps

stats: ## Afficher l'utilisation des ressources
	docker stats

# Commandes d'accès aux conteneurs
backend-shell: ## Accéder au shell du backend
	docker exec -it atelier-kaisla-backend-dev sh

frontend-shell: ## Accéder au shell du frontend
	docker exec -it atelier-kaisla-frontend-dev sh

backoffice-shell: ## Accéder au shell du backoffice
	docker exec -it atelier-kaisla-backoffice-dev sh

db-shell: ## Accéder à PostgreSQL
	docker exec -it atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev

# Commandes de base de données - Développement
seed: ## Exécuter les seeders (depuis le host - nécessite .env avec POSTGRES_HOST=localhost)
	@echo "$(GREEN)Exécution des seeders depuis le host...$(NC)"
	@cd apps/backend && npm run seed

seed-clean: ## Exécuter les seeders en mode clean (supprime les données existantes)
	@echo "$(YELLOW)Exécution des seeders en mode clean...$(NC)"
	@cd apps/backend && npm run seed:clean

seed-docker: ## Exécuter les seeders dans le conteneur Docker (dev)
	@echo "$(GREEN)Exécution des seeders dans Docker...$(NC)"
	docker exec atelier-kaisla-backend-dev npm run seed

seed-docker-clean: ## Exécuter les seeders en mode clean dans Docker (dev)
	@echo "$(YELLOW)Exécution des seeders en mode clean dans Docker...$(NC)"
	docker exec atelier-kaisla-backend-dev npm run seed:clean

seed-enhanced: ## Exécuter le seeder amélioré (évite les doublons) - dev
	@echo "$(GREEN)Exécution du seeder amélioré (depuis le host)...$(NC)"
	@cd apps/backend && npm run seed:enhanced

seed-enhanced-docker: ## Exécuter le seeder amélioré dans Docker - dev
	@echo "$(GREEN)Exécution du seeder amélioré dans Docker...$(NC)"
	docker exec atelier-kaisla-backend-dev npm run seed:enhanced

seed-enhanced-clean: ## Exécuter le seeder amélioré en mode clean - dev
	@echo "$(YELLOW)Exécution du seeder amélioré en mode clean...$(NC)"
	@cd apps/backend && npm run seed:enhanced:clean

seed-enhanced-docker-clean: ## Exécuter le seeder amélioré en mode clean dans Docker - dev
	@echo "$(YELLOW)Exécution du seeder amélioré en mode clean dans Docker...$(NC)"
	docker exec atelier-kaisla-backend-dev npm run seed:enhanced:clean

# Commandes de base de données - Production
seed-prod: ## Exécuter les seeders en production (ATTENTION: ajoute des données)
	@echo "$(YELLOW)⚠️  ATTENTION: Vous allez ajouter des données en PRODUCTION$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Exécution des seeders en production...$(NC)"; \
		docker exec atelier-kaisla-backend-prod npm run seed; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

seed-prod-clean: ## Exécuter les seeders en mode clean en production (DANGER!)
	@echo "$(YELLOW)⚠️  DANGER: Vous allez SUPPRIMER toutes les données en PRODUCTION$(NC)"
	@echo "$(YELLOW)⚠️  Cette action est IRRÉVERSIBLE!$(NC)"
	@read -p "Avez-vous fait un backup? [y/N] " -n 1 -r; \
	echo; \
	if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)Opération annulée. Faites d'abord un backup avec: make backup-prod$(NC)"; \
		exit 1; \
	fi; \
	read -p "Tapez 'DELETE ALL PRODUCTION DATA' pour confirmer: " confirm; \
	if [ "$$confirm" = "DELETE ALL PRODUCTION DATA" ]; then \
		echo "$(GREEN)Exécution des seeders en mode clean en production...$(NC)"; \
		docker exec atelier-kaisla-backend-prod npm run seed:clean; \
	else \
		echo "$(YELLOW)Confirmation incorrecte. Opération annulée.$(NC)"; \
	fi

seed-auth-prod: ## Créer l'utilisateur admin en production (lit ADMIN_USERNAME et ADMIN_PASSWORD)
	@echo "$(YELLOW)⚠️  Création de l'utilisateur admin en PRODUCTION$(NC)"
	@echo "$(YELLOW)Variables d'env utilisées : ADMIN_USERNAME, ADMIN_PASSWORD$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Création de l'utilisateur admin...$(NC)"; \
		sudo docker exec atelier-kaisla-backend-prod npm run seed:auth:prod; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

seed-enhanced-prod: ## Exécuter le seeder amélioré en production (évite les doublons)
	@echo "$(YELLOW)⚠️  ATTENTION: Seeding en PRODUCTION avec prévention des doublons$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Exécution du seeder amélioré en production...$(NC)"; \
		docker exec atelier-kaisla-backend-prod npm run seed:enhanced; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

# Commandes de backup
backup-prod: ## Créer un backup de la base de données de production
	@echo "$(GREEN)Création d'un backup de la base de production...$(NC)"
	@mkdir -p backups
	@BACKUP_FILE="backups/backup_prod_$$(date +%Y%m%d_%H%M%S).sql"; \
	docker exec atelier-kaisla-postgres-prod pg_dump -U postgres -d atelier_kaisla_prod > $$BACKUP_FILE; \
	echo "$(GREEN)✓ Backup créé: $$BACKUP_FILE$(NC)"; \
	ls -lh $$BACKUP_FILE

backup-dev: ## Créer un backup de la base de données de développement
	@echo "$(GREEN)Création d'un backup de la base de dev...$(NC)"
	@mkdir -p backups
	@BACKUP_FILE="backups/backup_dev_$$(date +%Y%m%d_%H%M%S).sql"; \
	docker exec atelier-kaisla-postgres-dev pg_dump -U postgres -d atelier_kaisla_dev > $$BACKUP_FILE; \
	echo "$(GREEN)✓ Backup créé: $$BACKUP_FILE$(NC)"; \
	ls -lh $$BACKUP_FILE

restore-prod: ## Restaurer un backup en production (usage: make restore-prod FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(YELLOW)Usage: make restore-prod FILE=backups/backup_xxx.sql$(NC)"; \
		echo "$(YELLOW)Backups disponibles:$(NC)"; \
		ls -1 backups/*.sql 2>/dev/null || echo "Aucun backup trouvé"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  Restauration du backup: $(FILE)$(NC)"
	@read -p "Êtes-vous sûr? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cat $(FILE) | docker exec -i atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod; \
		echo "$(GREEN)✓ Backup restauré avec succès$(NC)"; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

# Commandes de vérification
verify-data-dev: ## Vérifier les données en développement (complet)
	@bash apps/backend/scripts/verify-data.sh dev

verify-data-prod: ## Vérifier les données en production (complet)
	@bash apps/backend/scripts/verify-data.sh prod

verify-quick-dev: ## Vérification rapide des données en développement
	@echo "$(GREEN)Vérification rapide des données de développement...$(NC)"
	@docker exec atelier-kaisla-postgres-dev psql -U postgres -d atelier_kaisla_dev -c "SELECT 'Total products:' as info, COUNT(*)::text as count FROM products UNION ALL SELECT 'Wall hangings:', COUNT(*)::text FROM products WHERE category='wall-hanging' UNION ALL SELECT 'Rugs:', COUNT(*)::text FROM products WHERE category='rug' UNION ALL SELECT 'Available:', COUNT(*)::text FROM products WHERE status='available';"

verify-quick-prod: ## Vérification rapide des données en production
	@echo "$(GREEN)Vérification rapide des données de production...$(NC)"
	@docker exec atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod -c "SELECT 'Total products:' as info, COUNT(*)::text as count FROM products UNION ALL SELECT 'Wall hangings:', COUNT(*)::text FROM products WHERE category='wall-hanging' UNION ALL SELECT 'Rugs:', COUNT(*)::text FROM products WHERE category='rug' UNION ALL SELECT 'Available:', COUNT(*)::text FROM products WHERE status='available';"

migration-run: ## Exécuter les migrations (depuis le host)
	@echo "$(GREEN)Exécution des migrations depuis le host...$(NC)"
	@cd apps/backend && npm run migration:run

migration-run-docker: ## Exécuter les migrations dans Docker
	@echo "$(GREEN)Exécution des migrations dans Docker...$(NC)"
	docker exec atelier-kaisla-backend-dev npm run migration:run

migration-generate: ## Générer une nouvelle migration (usage: make migration-generate NAME=NomDeLaMigration)
	@echo "$(GREEN)Génération de la migration...$(NC)"
	@cd apps/backend && npm run migration:generate -- src/database/migrations/$(NAME)

# Commandes de migration - Production
migration-run-prod: ## Exécuter les migrations en production
	@echo "$(YELLOW)⚠️  Exécution des migrations en PRODUCTION$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Exécution des migrations...$(NC)"; \
		docker exec atelier-kaisla-backend-prod npm run migration:run:prod; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

migration-show-prod: ## Afficher le statut des migrations en production
	@echo "$(GREEN)Statut des migrations en production :$(NC)"
	docker exec atelier-kaisla-backend-prod npm run migration:show:prod

migration-baseline-prod: ## Marquer les migrations existantes comme exécutées (première fois seulement)
	@echo "$(YELLOW)⚠️  Baseline : marque l'InitialSchema comme déjà exécutée en PRODUCTION$(NC)"
	@echo "$(YELLOW)À utiliser UNIQUEMENT si la base a été créée par les scripts SQL init$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Création de la table migrations_history et insertion du baseline...$(NC)"; \
		docker exec atelier-kaisla-postgres-prod psql -U postgres -d atelier_kaisla_prod -c " \
			CREATE TABLE IF NOT EXISTS migrations_history ( \
				id SERIAL PRIMARY KEY, \
				timestamp BIGINT NOT NULL, \
				name VARCHAR NOT NULL \
			); \
			INSERT INTO migrations_history (timestamp, name) \
				SELECT 1770072119289, 'InitialSchema1770072119289' \
				WHERE NOT EXISTS ( \
					SELECT 1 FROM migrations_history WHERE name = 'InitialSchema1770072119289' \
				); \
		"; \
		echo "$(GREEN)✓ Baseline effectué. Vous pouvez maintenant lancer: make migration-run-prod$(NC)"; \
	else \
		echo "$(YELLOW)Opération annulée.$(NC)"; \
	fi

# Commandes d'initialisation
init: ## Initialiser le projet (copier .env et démarrer)
	@echo "$(GREEN)Initialisation du projet...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.dev.example .env; \
		echo "$(GREEN)Fichier .env créé depuis .env.dev.example$(NC)"; \
	else \
		echo "$(YELLOW)Le fichier .env existe déjà$(NC)"; \
	fi
	@echo "$(GREEN)Démarrage des services...$(NC)"
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Projet initialisé avec succès !$(NC)"
	@echo "$(GREEN)Frontend: http://localhost:3000$(NC)"
	@echo "$(GREEN)Backoffice: http://localhost:3001$(NC)"
	@echo "$(GREEN)Backend: http://localhost:4000$(NC)"
