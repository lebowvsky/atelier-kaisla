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
