from __future__ import annotations

import re
import time
from collections.abc import Iterable

from . import image_uploader
from .schemas import Block, BlockType, ParseResponse

IMAGE_PATTERN = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
# Marker emits HTML anchor spans for internal TOC/footnote navigation
# (e.g. `<span id="page-2-0"></span>`). They survive as visible text in
# react-markdown's default (HTML-escaped) rendering — strip them at source.
HTML_ANCHOR_SPAN_PATTERN = re.compile(r'<span\s+id="[^"]*"\s*></span>')
# With paginate_output=True Marker prefixes each page with `{N}----…----` on
# its own line (N is 0-indexed). We split by these markers to recover the
# 1-indexed page number for every emitted block.
PAGE_SEPARATOR_PATTERN = re.compile(r"\{(\d+)\}-{2,}")


def _convert_pdf_to_md(pdf_bytes: bytes) -> tuple[str, dict[str, bytes], dict]:
    # Imported lazily so this module loads without paying Marker's heavy import cost.
    import io

    from marker.converters.pdf import PdfConverter
    from marker.models import create_model_dict
    from marker.output import text_from_rendered

    converter = PdfConverter(
        artifact_dict=create_model_dict(),
        config={"paginate_output": True},
    )
    rendered = converter(io.BytesIO(pdf_bytes))
    markdown, _meta, images = text_from_rendered(rendered)
    # Marker emits per-page entries under `page_stats`; no top-level page count.
    pages = len(rendered.metadata.get("page_stats", []))
    return markdown, images, {"pages": pages}


def _to_png_bytes(data) -> bytes:
    """Marker 1.x returns PIL.Image.Image in the images dict; boto3 needs bytes."""
    if isinstance(data, (bytes, bytearray)):
        return bytes(data)
    import io
    buf = io.BytesIO()
    data.save(buf, format="PNG")
    return buf.getvalue()


def run_marker(pdf_bytes: bytes, *, document_id: str) -> ParseResponse:
    started = time.monotonic()
    markdown, images, meta = _convert_pdf_to_md(pdf_bytes)
    markdown = HTML_ANCHOR_SPAN_PATTERN.sub("", markdown)

    image_keys: dict[str, str] = {}
    for original_name, data in images.items():
        key = image_uploader.make_image_key(document_id, original_name)
        image_uploader.upload_image_bytes(key, _to_png_bytes(data))
        image_keys[original_name] = key

    blocks = list(_split_into_blocks(markdown, image_keys))
    took_ms = int((time.monotonic() - started) * 1000)

    import marker
    return ParseResponse(
        document_id=document_id,  # type: ignore[arg-type]
        pages=meta.get("pages", 0),
        parser="marker",
        parser_version=getattr(marker, "__version__", "unknown"),
        language_detected=meta.get("language"),
        took_ms=took_ms,
        blocks=blocks,
    )


def _split_into_blocks(markdown: str, image_keys: dict[str, str]) -> Iterable[Block]:
    segments: list[tuple[int, str]] = []
    cursor = 0
    current_page = 1
    for m in PAGE_SEPARATOR_PATTERN.finditer(markdown):
        prelude = markdown[cursor:m.start()]
        if prelude.strip():
            segments.append((current_page, prelude))
        current_page = int(m.group(1)) + 1
        cursor = m.end()
    tail = markdown[cursor:]
    if tail.strip():
        segments.append((current_page, tail))
    if not segments:
        segments = [(1, markdown)]

    for page, segment in segments:
        paragraphs = re.split(r"\n{2,}", segment.strip())
        for chunk in paragraphs:
            if not chunk.strip():
                continue

            m = IMAGE_PATTERN.search(chunk)
            if m and chunk.strip().startswith("!"):
                original = m.group(1)
                yield Block(
                    type=BlockType.FIGURE,
                    page=page,
                    image_id=image_keys.get(original, original),
                    surrounding_text=None,
                )
                continue

            yield Block(type=BlockType.TEXT, page=page, md=chunk.strip())
