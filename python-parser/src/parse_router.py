from __future__ import annotations

from fastapi import APIRouter, Depends

from .auth import require_service_token
from .marker_runner import run_marker
from .s3_client import S3Client
from .schemas import ParseRequest, ParseResponse

router = APIRouter()


@router.post("/parse", response_model=ParseResponse)
def parse(
    req: ParseRequest,
    _claims: dict = Depends(require_service_token),  # noqa: B008  (FastAPI idiom)
) -> ParseResponse:
    pdf_bytes = S3Client.fetch_url_to_bytes(req.source_url)
    return run_marker(pdf_bytes, document_id=str(req.document_id))
