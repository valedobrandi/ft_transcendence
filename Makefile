# Variables
DOCKER_COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yml
COMPOSE_FILE_PROD = docker-compose.production.yml
PROJECT_NAME = ft_transcendence

# COLORS
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m

.PHONY: all stop clean fclean re logs

production.build: 
	docker compose -f $(COMPOSE_FILE_PROD) build
	@echo "$(GREEN)Production Docker images built successfully.$(NC)"

production.up: 
	docker compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "$(GREEN)Production Docker containers are up and running.$(NC)"

production.down:
	docker compose -f $(COMPOSE_FILE_PROD) down --volumes --remove-orphans


build:
	docker compose build
	@echo "$(GREEN)Docker images built successfully.$(NC)"

up: 
	docker compose up -d
	@echo "$(GREEN)Docker containers are up and running.$(NC)"

down:
	docker compose down --volumes --remove-orphans
	@echo "$(GREEN)Docker containers are stopped and removed.$(NC)"

# --- build & run ---
all:
	@echo "🔼 Lancement des services avec build..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d #--build

# --- stop services ---
stop:
	@echo "🛑 Arrêt des services..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT_NAME) stop

restart:
	@echo "🔄 Redémarrage des services..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart

# --- remove containers but keep images ---
clean: stop
	@echo "🧹 Suppression des conteneurs, volumes et réseaux orphelins..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down --volumes --remove-orphans

# --- full reset (⚠️ supprime aussi volumes + cache images inutilisées) ---
fclean: clean
	@echo "🧼 Nettoyage complet du système Docker (⚠️ volumes et cache supprimés)"
	docker system prune -af --volumes 2>/dev/null || true

# --- rebuild ---
re: fclean all

# --- logs ---
logs:
	@echo "📜 Affichage des logs..."
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f
