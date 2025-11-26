# Variables
DOCKER_COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = ft_transcendence

.PHONY: all stop clean fclean re logs

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