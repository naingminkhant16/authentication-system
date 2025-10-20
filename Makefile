.PHONY: up down logs db-migrate db-migrate-dev

PROJECT_NAME := "Employee Authentication System"
DOCKER_COMPOSE_FILE := docker-compose.yml

# Start services using Docker Compose
up:
	@echo "Starting The System..."
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d --build
	@echo "Running Migration..."
	$(MAKE) db-migrate

# Stop and remove services and containers
down:
	@echo "Stopping The System..."
	docker compose -f $(DOCKER_COMPOSE_FILE) down

# View logs for all services
logs:
	docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

# Run migrations for the backend service (only need for the first time or migration file is modified)
db-migrate:
	@echo "Running Prisma migrations..."
	docker compose -f $(DOCKER_COMPOSE_FILE) run --rm backend npx prisma migrate deploy

# Execute commands inside the backend container
exec:
	docker compose -f $(DOCKER_COMPOSE_FILE) exec backend $(filter-out $@,$(MAKECMDGOALS))

# Run db migrations for the backend service
db-migrate-dev:
	@echo "Generating Prisma migration files..."
	docker compose -f $(DOCKER_COMPOSE_FILE) run --rm backend npx prisma migrate dev

# Run Department Seeder (only need for the first time)
db-seed-department:
	@echo  "Seeding Department Data..."
	docker compose -f $(DOCKER_COMPOSE_FILE) run --rm backend npm run seed:department
