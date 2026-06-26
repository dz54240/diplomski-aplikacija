from __future__ import annotations

from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ALLOWED_MIME_TYPES = {"application/pdf"}


class BlockType(StrEnum):
    TEXT = "text"
    FIGURE = "figure"
    TABLE = "table"
    FORMULA = "formula"


class ParseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_id: str
    source_url: str = Field(min_length=1)
    mime_type: str
    language: Literal["hr", "en", "mixed"] = "mixed"

    @field_validator("document_id")
    @classmethod
    def _validate_uuid(cls, v: str) -> str:
        # Raises ValueError if not a valid UUID — Pydantic wraps it as ValidationError.
        UUID(v)
        return v

    @model_validator(mode="after")
    def _check_mime(self) -> ParseRequest:
        if self.mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError(
                f"mime_type {self.mime_type!r} not supported "
                f"(allowed: {sorted(ALLOWED_MIME_TYPES)})"
            )
        return self


class Block(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: BlockType
    page: int = Field(ge=1)
    section_path: list[str] = Field(default_factory=list)

    md: str | None = None
    md_table: str | None = None
    latex: str | None = None
    image_id: str | None = None
    surrounding_text: str | None = None
    bbox: list[float] | None = None

    @model_validator(mode="after")
    def _check_type_payload(self) -> Block:
        match self.type:
            case BlockType.TEXT:
                if not self.md:
                    raise ValueError("Block(type=text) requires `md`")
            case BlockType.FIGURE:
                if not self.image_id:
                    raise ValueError("Block(type=figure) requires `image_id`")
            case BlockType.TABLE:
                if not self.md_table:
                    raise ValueError("Block(type=table) requires `md_table`")
            case BlockType.FORMULA:
                if not self.latex:
                    raise ValueError("Block(type=formula) requires `latex`")
        return self


class ParseResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_id: str
    pages: int = Field(ge=0)
    parser: Literal["marker"] = "marker"
    parser_version: str
    language_detected: str | None = None
    took_ms: int = Field(ge=0)
    blocks: list[Block]

    @field_validator("document_id")
    @classmethod
    def _validate_uuid(cls, v: str) -> str:
        UUID(v)
        return v
