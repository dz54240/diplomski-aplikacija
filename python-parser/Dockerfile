# Production-only Dockerfile. In dev we run uvicorn on the host
# (`make dev-python`). CI builds this image as a sanity check.

FROM python:3.12-slim

WORKDIR /app

# System deps: libmagic1 for python-magic mime sniffing.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install uv (Astral) — small, fast, lock-aware Python package manager.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

ENV UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev || uv sync --no-dev

COPY src ./src

ENV PATH="/opt/venv/bin:${PATH}"

# Marker model warmup is intentionally not baked into the image: it doubles
# image size to ~2.5 GB, takes ~5 min on CI, and fails on cache-path mismatches
# (Marker writes to the datalab cache, not HF_HOME). For local dev,
# `make warmup-marker` warms the host cache once, which Marker reuses across
# uvicorn restarts.

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
