from __future__ import annotations

from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import config

_bearer = HTTPBearer(auto_error=False)


def verify_service_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            config.jwt_secret(),
            algorithms=["HS256"],
            audience=config.jwt_audience(),
            issuer=config.jwt_issuer(),
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"invalid token: {exc.__class__.__name__}",
        ) from exc


async def require_service_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),  # noqa: B008  (FastAPI idiom)
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="missing bearer token")
    return verify_service_token(credentials.credentials)
