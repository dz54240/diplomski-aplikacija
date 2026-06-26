from __future__ import annotations

import mimetypes
from pathlib import PurePosixPath

from .s3_client import S3Client


def upload_image_bytes(key: str, data: bytes, content_type: str | None = None) -> None:
    ct = content_type or mimetypes.guess_type(key)[0] or "application/octet-stream"
    S3Client().upload_bytes(key, data, content_type=ct)


def make_image_key(document_id: str, original_name: str) -> str:
    safe = PurePosixPath(original_name).name  # strip any directories
    return f"documents/{document_id}/images/{safe}"
