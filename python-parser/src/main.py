from __future__ import annotations

from fastapi import FastAPI

from .parse_router import router as parse_router

app = FastAPI(title="python-parser", version="0.2.0")

app.include_router(parse_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-parser"}
