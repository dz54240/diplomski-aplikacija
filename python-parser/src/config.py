from __future__ import annotations

import os


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def jwt_audience() -> str:
    return os.environ.get("JWT_AUDIENCE", "python-parser")


def jwt_issuer() -> str:
    return os.environ.get("JWT_ISSUER", "rails-api")


def minio_endpoint() -> str:
    return os.environ.get("MINIO_ENDPOINT", "http://127.0.0.1:9000")


def minio_access_key() -> str:
    return os.environ["MINIO_ROOT_USER"]


def minio_secret_key() -> str:
    return os.environ["MINIO_ROOT_PASSWORD"]


def minio_region() -> str:
    return os.environ.get("MINIO_REGION", "us-east-1")


def minio_bucket() -> str:
    return os.environ.get("MINIO_BUCKET", "study-materials")
