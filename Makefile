.PHONY: help infra infra-down infra-logs dev dev-rails dev-sidekiq dev-node dev-python dev-client clean logs health lint build warmup-marker re-ingest chat-smoke

COMPOSE := docker compose

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

# ──── Infrastructure (Docker) ────────────────────────────────────────────────

infra: ## Start infra (postgres, redis, minio) detached
	$(COMPOSE) up -d

infra-down: ## Stop infra
	$(COMPOSE) down

infra-logs: ## Tail infra logs
	$(COMPOSE) logs -f --tail=200

clean: ## Stop infra and DROP volumes (destroys dev DB + MinIO data)
	$(COMPOSE) down -v

logs: infra-logs ## Alias for infra-logs

# ──── Application services (local, one terminal each) ────────────────────────

dev-rails: ## Run Rails API locally on :3000
	cd rails-api && bin/rails s -p 3000

dev-sidekiq: ## Run Sidekiq worker (required for document parsing)
	cd rails-api && bundle exec sidekiq -q default

dev-node: ## Run Node agent locally on :4000
	cd node-agent && pnpm dev

dev-python: ## Run Python parser locally on :8000 (loads ../.env for JWT/MinIO)
	cd python-parser && uv run --env-file ../.env uvicorn src.main:app --reload --port 8000

dev-client: ## Run Vite dev server locally on :5173
	cd client && pnpm dev

dev: ## Reminder how to start the full dev stack
	@echo "Hybrid dev: 1 Docker stack + 5 local processes."
	@echo ""
	@echo "  1. make infra              # postgres, redis, minio in Docker"
	@echo "  2. open 5 terminals and run, one per terminal:"
	@echo "       make dev-rails"
	@echo "       make dev-sidekiq"
	@echo "       make dev-node"
	@echo "       make dev-python"
	@echo "       make dev-client"
	@echo ""
	@echo "Then:  make health           # verify all 3 backend services"
	@echo "       open http://localhost:5173"

# ──── Smoke + tooling ────────────────────────────────────────────────────────

health: ## Hit health endpoints on the 3 backend services
	@printf "rails-api:    "; curl -fsS http://localhost:3000/health && echo "" || echo "FAIL"
	@printf "node-agent:   "; curl -fsS http://localhost:4000/health && echo "" || echo "FAIL"
	@printf "python-parser:"; curl -fsS http://localhost:8000/health && echo "" || echo "FAIL"

lint: ## Run linters across all services
	cd node-agent && pnpm lint || true
	cd python-parser && uv run --extra dev ruff check . || true
	cd client && pnpm lint || true

build: ## Build all docker images (CI build check)
	cd rails-api     && docker build -t studyapp/rails-api .
	cd node-agent    && docker build -t studyapp/node-agent .
	cd python-parser && docker build -t studyapp/python-parser .
	cd client        && docker build -t studyapp/client .

warmup-marker: ## One-time download Marker models to ~/.cache/huggingface/ (~3 min, ~2GB)
	cd python-parser && uv run python -c "from marker.models import create_model_dict; create_model_dict(); print('Marker models cached at ~/.cache/huggingface/')"

re-ingest: ## Re-run /ingest on a document that already has parsed_output (skips Marker). Usage: make re-ingest DOC=<uuid>
	cd rails-api && bin/rails "rag:re_ingest[$(DOC)]"

chat-smoke: ## SSE smoke test of /chat (uses User.first + first subject). Usage: MSG="O cemu se radi?" make chat-smoke
	@bash -lc '\
	cd rails-api && \
	TOKEN=$$(bin/rails runner "u=User.first; s=u.sessions.create!; puts JsonWebTokenService.encode(user_id: u.id, session_id: s.id)"); \
	SUBJECT_ID=$$(bin/rails runner "puts User.first.subjects.first.id"); \
	cd .. && \
	curl -N -X POST http://localhost:4000/chat \
	  -H "Authorization: Bearer $$TOKEN" \
	  -H "Content-Type: application/json" \
	  -d "{\"subject_id\":\"$$SUBJECT_ID\",\"message\":\"$$MSG\"}"'
