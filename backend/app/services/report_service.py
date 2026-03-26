from __future__ import annotations

import re
import textwrap
import unicodedata


def build_report_filename(title: str, extension: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", title.strip().lower()).strip("-")
    safe_title = normalized or "comparacao-textual"
    return f"{safe_title}.{extension}"


def _format_percentage(value: float) -> str:
    return f"{value:.2%}"


def _normalize_for_pdf(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def _wrap_report_lines(text: str, width: int = 92) -> list[str]:
    if not text:
        return [""]
    wrapped = textwrap.wrap(text, width=width, replace_whitespace=False)
    return wrapped or [text]


def _build_report_lines(result: dict[str, object]) -> list[str]:
    metrics = result["metrics"]
    shared_terms = result["shared_terms"]
    matching_excerpts = result["matching_excerpts"]
    matching_paragraphs = result["matching_paragraphs"]
    highlights = result["highlights"]
    document_a = result["document_a"]
    document_b = result["document_b"]

    lines = [
        "RELATÓRIO DE COMPARAÇÃO TEXTUAL",
        "",
        f"Título: {result['title']}",
        f"Gerado em: {result['created_at']}",
        f"Classificação: {result['classification']}",
        f"Correlação geral: {_format_percentage(result['correlation_index'])}",
        "",
        "RESUMO",
        result["summary"],
        "",
        "MÉTRICAS",
        f"- Similaridade cosseno: {_format_percentage(metrics['cosine_score'])}",
        f"- Jaccard: {_format_percentage(metrics['jaccard_score'])}",
        f"- Sobreposição de termos: {_format_percentage(metrics['overlap_score'])}",
        f"- Densidade de palavras-chave: {_format_percentage(metrics['keyword_density_match'])}",
        f"- Alinhamento por sentenças: {_format_percentage(metrics['sentence_alignment_score'])}",
        f"- Alinhamento por parágrafos: {_format_percentage(metrics['paragraph_alignment_score'])}",
        f"- Equilíbrio de tamanho: {_format_percentage(metrics['length_balance_score'])}",
        "",
        "TERMOS EM COMUM",
        ", ".join(shared_terms) if shared_terms else "Nenhum termo relevante encontrado.",
        "",
        "ESTATÍSTICAS DOS DOCUMENTOS",
        (
            f"- Documento A ({document_a['filename']}): "
            f"{document_a['word_estimate']} palavras, "
            f"{document_a['sentence_count']} sentenças, "
            f"{document_a['paragraph_count']} parágrafos."
        ),
        (
            f"- Documento B ({document_b['filename']}): "
            f"{document_b['word_estimate']} palavras, "
            f"{document_b['sentence_count']} sentenças, "
            f"{document_b['paragraph_count']} parágrafos."
        ),
        "",
        "DESTAQUES",
    ]

    if highlights:
        lines.extend([f"- {highlight['title']}: {highlight['description']}" for highlight in highlights])
    else:
        lines.append("- Nenhum destaque adicional gerado.")

    lines.extend(["", "TRECHOS SEMELHANTES"])
    if matching_excerpts:
        for index, excerpt in enumerate(matching_excerpts, start=1):
            lines.extend(
                [
                    f"{index}. Similaridade: {_format_percentage(excerpt['similarity'])}",
                    f"   A: {excerpt['excerpt_a']}",
                    f"   B: {excerpt['excerpt_b']}",
                ]
            )
    else:
        lines.append("Nenhum trecho semelhante forte foi encontrado.")

    lines.extend(["", "PARÁGRAFOS RELACIONADOS"])
    if matching_paragraphs:
        for index, paragraph in enumerate(matching_paragraphs, start=1):
            lines.extend(
                [
                    f"{index}. Similaridade: {_format_percentage(paragraph['similarity'])}",
                    f"   A: {paragraph['excerpt_a']}",
                    f"   B: {paragraph['excerpt_b']}",
                ]
            )
    else:
        lines.append("Nenhum parágrafo com alinhamento forte foi encontrado.")

    expanded_lines: list[str] = []
    for line in lines:
        expanded_lines.extend(_wrap_report_lines(str(line)))

    return expanded_lines


def build_text_report(result: dict[str, object]) -> str:
    return "\n".join(_build_report_lines(result))


def build_pdf_report(result: dict[str, object]) -> bytes:
    lines = _build_report_lines(result)
    lines_per_page = 42
    page_chunks = [
        lines[index : index + lines_per_page]
        for index in range(0, len(lines), lines_per_page)
    ] or [[]]
    total_pages = len(page_chunks)

    page_content_objects: list[bytes] = []
    page_objects: list[bytes] = []
    page_references: list[str] = []
    next_object_number = 4

    for page_number, chunk in enumerate(page_chunks, start=1):
        page_object_number = next_object_number
        content_object_number = next_object_number + 1
        next_object_number += 2
        page_references.append(f"{page_object_number} 0 R")

        content_lines = [
            "BT",
            "/F1 10 Tf",
            "14 TL",
            "48 796 Td",
        ]

        page_text_lines = chunk + ["", f"Pagina {page_number}/{total_pages}"]
        for line in page_text_lines:
            sanitized = _normalize_for_pdf(line)
            sanitized = sanitized.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            content_lines.append(f"({sanitized}) Tj")
            content_lines.append("T*")
        content_lines.append("ET")

        content_stream = "\n".join(content_lines).encode("latin-1", "replace")
        page_content_objects.append(
            (
                f"{content_object_number} 0 obj\n"
                f"<< /Length {len(content_stream)} >>\n"
                "stream\n"
            ).encode("ascii")
            + content_stream
            + b"\nendstream\nendobj\n"
        )
        page_objects.append(
            (
                f"{page_object_number} 0 obj\n"
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                f"/Resources << /Font << /F1 3 0 R >> >> /Contents {content_object_number} 0 R >>\n"
                "endobj\n"
            ).encode("ascii")
        )

    pdf_objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        (
            f"2 0 obj\n<< /Type /Pages /Kids [{' '.join(page_references)}] "
            f"/Count {total_pages} >>\nendobj\n"
        ).encode("ascii"),
        b"3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    ]

    for page_object, page_content in zip(page_objects, page_content_objects, strict=True):
        pdf_objects.extend([page_object, page_content])

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for obj in pdf_objects:
        offsets.append(len(output))
        output.extend(obj)

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(pdf_objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        (
            f"trailer\n<< /Size {len(pdf_objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode("ascii")
    )
    return bytes(output)
