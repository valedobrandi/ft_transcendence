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
	docker compose -f $(COMPOSE_FILE_PROD) down -v --remove-orphans
	docker compose -f $(COMPOSE_FILE_PROD) up --build -d hardhat
	@echo "$(GREEN)WAITING TO HARDHAT TO BE HEALTHY$(NC)"
	until curl -s http://localhost:8545 > /dev/null; do sleep 1; done
	@echo "$(GREEN)HARDHAT IS READY$(NC)"
	docker exec -it hardhat-node rm -rf /app/ignition/deployments/chain-31337
	docker exec -it hardhat-node npx hardhat ignition deploy ignition/modules/TournamentScores.js --network localhost
	until [ -s hardhat/ignition/deployments/chain-31337/deployed_addresses.json ]; do sleep 1; done
	@echo "$(GREEN)TournamentScores contract OK.$(NC)"
	docker compose -f $(COMPOSE_FILE_PROD) up --build -d pong-backend nginx

production.down:
	docker compose -f $(COMPOSE_FILE_PROD) down --volumes --remove-orphans

build:
	docker compose up --build -d hardhat
	# Wait for Hardhat to be healthy
	until curl -s http://localhost:8545 > /dev/null; do sleep 1; done
	@echo "$(GREEN)Hardhat is healthy. Deploying TournamentScores contract...$(NC)"
	docker exec -it hardhat-node npx hardhat ignition deploy ignition/modules/TournamentScores.js --network localhost
	until [ -s hardhat/ignition/deployments/chain-31337/deployed_addresses.json ]; do sleep 1; done
	@echo "$(GREEN)TournamentScores contract deployed.$(NC)"
	docker compose up --build -d pong-backend pong-frontend

up: 
	docker compose up -d hardhat
	# Wait for Hardhat to be healthy
	until curl -s http://localhost:8545 > /dev/null; do sleep 1; done
	@echo "$(GREEN)Hardhat is healthy. Deploying TournamentScores contract...$(NC)"
	docker exec -it hardhat-node npx hardhat ignition deploy ignition/modules/TournamentScores.js --network localhost
	until [ -s hardhat/ignition/deployments/chain-31337/deployed_addresses.json ]; do sleep 1; done
	@echo "$(GREEN)TournamentScores contract deployed.$(NC)"
	docker compose up -d pong-backend pong-frontend

down:
	docker compose down --volumes --remove-orphans

start:
	npm run up

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
