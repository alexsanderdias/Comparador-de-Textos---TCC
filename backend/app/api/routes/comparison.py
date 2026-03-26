from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, Query, Response, UploadFile

from app.core.config import get_settings
from app.schemas.comparison import ComparisonResponse
from app.services.comparison_service import run_comparison
from app.services.document_reader import DocumentReadError, read_uploaded_document
from app.services.report_service import (
    build_pdf_report,
    build_report_filename,
    build_text_report,
)

router = APIRouter(tags=["comparison"])
ReportFormat = Literal["json", "txt", "pdf"]


def _build_file_response(
    *,
    content: str | bytes,
    media_type: str,
    title: str,
    extension: str,
) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{build_report_filename(title, extension)}"'
            )
        },
    )


async def _process_comparison(
    file_a: UploadFile,
    file_b: UploadFile,
    title: str | None,
) -> ComparisonResponse:
    settings = get_settings()

    try:
        document_a = await read_uploaded_document(file_a, settings)
        document_b = await read_uploaded_document(file_b, settings)
        result = run_comparison(document_a, document_b, title=title)
        return ComparisonResponse.model_validate(result)
    except DocumentReadError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/compare", response_model=ComparisonResponse)
async def compare_uploaded_documents(
    file_a: UploadFile = File(..., description="Primeiro documento"),
    file_b: UploadFile = File(..., description="Segundo documento"),
    title: str | None = Form(default=None, description="Título opcional da comparação"),
) -> ComparisonResponse:
    return await _process_comparison(file_a=file_a, file_b=file_b, title=title)


@router.post("/compare/report")
async def export_comparison_report(
    file_a: UploadFile = File(..., description="Primeiro documento"),
    file_b: UploadFile = File(..., description="Segundo documento"),
    title: str | None = Form(default=None, description="Título opcional da comparação"),
    format: ReportFormat = Query(default="json"),
) -> Response:
    result = await _process_comparison(file_a=file_a, file_b=file_b, title=title)
    payload = result.model_dump(mode="json")

    if format == "pdf":
        return _build_file_response(
            content=build_pdf_report(payload),
            media_type="application/pdf",
            title=result.title,
            extension="pdf",
        )

    if format == "txt":
        return _build_file_response(
            content=build_text_report(payload),
            media_type="text/plain; charset=utf-8",
            title=result.title,
            extension="txt",
        )

    return _build_file_response(
        content=result.model_dump_json(indent=2),
        media_type="application/json",
        title=result.title,
        extension="json",
    )
