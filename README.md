# diplomski-aplikacija

Sustav za učenje temeljen na višeagentnoj arhitekturi i RAG tehnologiji.

3 funkcionalnosti: **Q&A agent**, **Quiz Generator**, **Tutor agent**, sve nad korisnikovim materijalima (PDF, mješoviti hrvatski/engleski).

**Repozitorij:** https://github.com/dz54240/diplomski-aplikacija

## Repo layout

```
diplomski-aplikacija/
├── rails-api/          # Auth + CRUD + Sidekiq jobs (port 3000)
├── node-agent/         # Vercel AI SDK agent runtime (port 4000)
├── python-parser/      # FastAPI document parsing service (port 8000)
├── client/             # React 19 + TanStack + Vite (port 5173)
├── db/init/            # SQL koji pgvector image izvrši na prvom boot-u
├── docker-compose.yml  # Infra only: postgres, redis, minio
└── Makefile            # `make infra`, `make dev-*`, `make health`, ...
```

## Dev model: hybrid (infra u Dockeru, servisi lokalno)

Infrastruktura (Postgres + pgvector, Redis, MinIO) živi u Dockeru, pokrene se jednom i ne dira. Aplikacijski servisi (Rails, Node, Python parser, Vite client) pokreću se lokalno zbog brzog hot-reloada, IDE/debugger integracije i bind-mount performansi na Macu. Dockerfile-ovi po servisu postoje radi build provjere.

## Pre-requisites

- **Docker Desktop**
- **Ruby 3.4.7** (`rails-api/.ruby-version`; preporuka: `rbenv install 3.4.7`)
- **Node.js** ≥ 22 (preporuka: nvm/asdf)
- **pnpm** ≥ 10 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Python 3.12** + [`uv`](https://docs.astral.sh/uv/) (`brew install uv`)
- `make`, `git`

## Quick start

```bash
cp .env.example .env

# Start infra (Postgres + pgvector, Redis, MinIO).
# Volume-ovi su persistentni, `make clean` ih briše.
make infra
```

> **Secrets:** Rails čita sve tajne isključivo iz ENV-a (nema `config/credentials.yml.enc` ni `master.key`). `dotenv-rails` automatski učita `.env` za dev/test.

### First-time bootstrap (svaki servis jednom, infra mora biti gore)

```bash
# Rails: gems + dev/test baze
cd rails-api && bundle install && bin/rails db:prepare && cd ..

# Node agent: pnpm deps
cd node-agent && pnpm install && cd ..

# Python parser: uv sync (kreira .venv)
cd python-parser && uv sync --extra dev && cd ..

# Client: pnpm deps
cd client && pnpm install && cd ..
```

### Start dev (5 paralelnih terminala)

```bash
make dev-rails     # :3000
make dev-sidekiq   # worker za parsanje dokumenata
make dev-node      # :4000
make dev-python    # :8000
make dev-client    # :5173
```

### Verify

```bash
make health        # 3 backend health endpointa
open http://localhost:5173
```

| Service | URL |
|---|---|
| React client | http://localhost:5173 |
| Rails API health | http://localhost:3000/health |
| Node agent health | http://localhost:4000/health |
| Python parser health | http://localhost:8000/health |
| MinIO console | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| Postgres | `localhost:5433` (`studyapp` / `studyapp`) — 5433 da ne sukobljava sa system Postgres-om na 5432 |

`make help` pokaže sve targete. `make clean` ruši infra stack uključujući volume-ove (drop dev DB).

## Lint + build

```bash
make lint          # eslint (node + client) / ruff (python)
make build         # docker build za sva 4 servisa
```
