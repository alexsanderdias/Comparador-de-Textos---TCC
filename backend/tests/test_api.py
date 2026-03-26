from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _build_files(
    text_a: str = (
        "Este trabalho analisa similaridade textual em documentos acadêmicos. "
        "A comparação observa estrutura, termos e proximidade de conteúdo."
    ),
    text_b: str = (
        "Este projeto compara documentos acadêmicos e mede similaridade textual. "
        "A análise considera termos, estrutura e trechos de conteúdo relacionados."
    ),
):
    return {
        "file_a": ("texto_a.txt", BytesIO(text_a.encode("utf-8")), "text/plain"),
        "file_b": ("texto_b.txt", BytesIO(text_b.encode("utf-8")), "text/plain"),
    }


def test_health_check_returns_ok():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_compare_returns_enriched_analysis():
    response = client.post(
        "/api/v1/compare",
        files=_build_files(),
        data={"title": "Teste de API"},
    )

    assert response.status_code == 200
    payload = response.json()

    assert payload["title"] == "Teste de API"
    assert "created_at" in payload
    assert "matching_excerpts" in payload
    assert "highlights" in payload
    assert "jaccard_score" in payload["metrics"]
    assert "sentence_alignment_score" in payload["metrics"]
    assert "paragraph_alignment_score" in payload["metrics"]
    assert "paragraph_count" in payload["document_a"]
    assert "matching_paragraphs" in payload
    assert payload["shared_terms"]


def test_compare_returns_paragraph_matches_for_multiline_texts():
    response = client.post(
        "/api/v1/compare",
        files=_build_files(
            text_a=(
                "Introdução sobre comparação textual em ambientes acadêmicos.\n\n"
                "O segundo parágrafo apresenta a metodologia de leitura, limpeza "
                "e cruzamento de termos para detectar semelhanças.\n\n"
                "Por fim, o sistema organiza os resultados em métricas e destaques."
            ),
            text_b=(
                "Este documento abre com uma introdução sobre análise textual "
                "para contextos acadêmicos.\n\n"
                "Na metodologia, o processo usa leitura, limpeza e cruzamento "
                "de termos para localizar proximidades entre os textos.\n\n"
                "Ao final, a plataforma apresenta métricas, parágrafos relacionados "
                "e destaques da comparação."
            ),
        ),
        data={"title": "Análise por parágrafos"},
    )

    assert response.status_code == 200
    payload = response.json()

    assert payload["document_a"]["paragraph_count"] == 3
    assert payload["document_b"]["paragraph_count"] == 3
    assert payload["matching_paragraphs"]
    assert payload["metrics"]["paragraph_alignment_score"] > 0


def test_compare_rejects_unsupported_extension():
    response = client.post(
        "/api/v1/compare",
        files={
            "file_a": ("texto_a.exe", BytesIO(b"invalido"), "application/octet-stream"),
            "file_b": ("texto_b.txt", BytesIO(b"conteudo valido"), "text/plain"),
        },
    )

    assert response.status_code == 400
    assert "Formato não suportado" in response.json()["detail"]


def test_compare_rejects_invalid_pdf_with_readable_message():
    response = client.post(
        "/api/v1/compare",
        files={
            "file_a": ("texto_a.pdf", BytesIO(b"%PDF-1.4 arquivo invalido"), "application/pdf"),
            "file_b": ("texto_b.txt", BytesIO(b"conteudo valido"), "text/plain"),
        },
    )

    assert response.status_code == 400
    assert "Não foi possível ler o PDF enviado" in response.json()["detail"]


def test_report_export_txt_returns_attachment():
    response = client.post(
        "/api/v1/compare/report?format=txt",
        files=_build_files(),
        data={"title": "Relatório local"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert "attachment;" in response.headers["content-disposition"]
    assert "RELATÓRIO DE COMPARAÇÃO TEXTUAL" in response.text


def test_report_export_pdf_returns_attachment():
    response = client.post(
        "/api/v1/compare/report?format=pdf",
        files=_build_files(),
        data={"title": "Relatório PDF"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert "attachment;" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")
