.PHONY: up down seed logs build clean

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

seed:
	@echo "Running seed scripts..."
	@docker-compose exec user-service npm run seed || echo "User service seed failed or service not running"
	@docker-compose exec post-service npm run seed || echo "Post service seed failed or service not running"
	@docker-compose exec comment-service npm run seed || echo "Comment service seed failed or service not running"
	@echo "Seed scripts completed."

test-smoke:
	@echo "Running smoke tests..."
	@node scripts/smoke-test.js

test-load:
	@echo "Running load tests..."
	@node scripts/load-test.js

test-artillery:
	@echo "Running Artillery load tests..."
	@if command -v artillery >/dev/null 2>&1; then \
		artillery run artillery-config.yml; \
	else \
		echo "Artillery not found. Install with: npm install -g artillery"; \
		exit 1; \
	fi

clean:
	docker-compose down -v
	@echo "All containers and volumes removed."

