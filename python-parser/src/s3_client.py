from __future__ import annotations

import boto3
import httpx

from . import config


class S3Client:
    def __init__(self) -> None:
        self._s3 = boto3.client(
            "s3",
            endpoint_url=config.minio_endpoint(),
            aws_access_key_id=config.minio_access_key(),
            aws_secret_access_key=config.minio_secret_key(),
            region_name=config.minio_region(),
        )
        self._bucket = config.minio_bucket()

    def download_to_bytes(self, key: str) -> bytes:
        resp = self._s3.get_object(Bucket=self._bucket, Key=key)
        return resp["Body"].read()

    def upload_bytes(
        self,
        key: str,
        data: bytes,
        content_type: str = "application/octet-stream",
    ) -> None:
        self._s3.put_object(Bucket=self._bucket, Key=key, Body=data, ContentType=content_type)

    @staticmethod
    def fetch_url_to_bytes(presigned_url: str, *, timeout: float = 30.0) -> bytes:
        """For presigned URLs handed in by Rails. Bypasses boto3 (no auth needed)."""
        with httpx.Client(timeout=timeout) as client:
            response = client.get(presigned_url)
            response.raise_for_status()
            return response.content
