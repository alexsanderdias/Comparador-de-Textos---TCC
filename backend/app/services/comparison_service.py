from datetime import UTC, datetime

from app.services.document_reader import UploadedDocument
from app.services.text_pipeline import (
    build_processed_document,
    cosine_score,
    find_matching_excerpts,
    find_matching_paragraphs,
    jaccard_score,
    keyword_density_match,
    length_balance_score,
    overlap_score,
    paragraph_alignment_score,
    sentence_alignment_score,
    shared_terms,
)


def _build_title(
    document_a: UploadedDocument,
    document_b: UploadedDocument,
    title: str | None,
) -> str:
    if title and title.strip():
        return title.strip()
    return f"Comparação entre {document_a.filename} e {document_b.filename}"


def _classify(score: float) -> str:
    if score >= 0.75:
        return "alta"
    if score >= 0.45:
        return "media"
    return "baixa"


def _build_summary(
    score: float,
    classification: str,
    shared_keywords: list[str],
    matching_excerpts: list[dict[str, object]],
    matching_paragraphs: list[dict[str, object]],
) -> str:
    percentage = round(score * 100, 2)
    sentence_note = (
        f"Foram encontrados {len(matching_excerpts)} trechos com proximidade relevante. "
        if matching_excerpts
        else ""
    )
    paragraph_note = (
        f"{len(matching_paragraphs)} parágrafos apresentaram alinhamento forte. "
        if matching_paragraphs
        else ""
    )
    if shared_keywords:
        preview = ", ".join(shared_keywords[:5])
        return (
            f"A comparação aponta correlação {classification} ({percentage}%). "
            f"{sentence_note}{paragraph_note}Termos em comum mais fortes: {preview}."
        )
    return (
        f"A comparação aponta correlação {classification} ({percentage}%). "
        f"{sentence_note}{paragraph_note}"
    ).strip()


def _build_highlights(
    metrics: dict[str, float],
    shared_keywords: list[str],
    matching_excerpts: list[dict[str, object]],
    matching_paragraphs: list[dict[str, object]],
) -> list[dict[str, str]]:
    highlights: list[dict[str, str]] = []

    if metrics["sentence_alignment_score"] >= 0.55:
        highlights.append(
            {
                "title": "Alinhamento estrutural forte",
                "description": (
                    "As sentenças dos documentos apresentam boa aproximação, "
                    "o que sugere proximidade de argumentos ou construções."
                ),
                "tone": "strong",
            }
        )
    elif metrics["sentence_alignment_score"] >= 0.3:
        highlights.append(
            {
                "title": "Alinhamento estrutural parcial",
                "description": (
                    "Há proximidade em algumas sentenças, mas a organização "
                    "do conteúdo ainda difere em pontos importantes."
                ),
                "tone": "moderate",
            }
        )
    else:
        highlights.append(
            {
                "title": "Estrutura textual distante",
                "description": (
                    "Os documentos não mostram forte alinhamento por sentenças, "
                    "o que indica abordagens ou redações mais diferentes."
                ),
                "tone": "attention",
            }
        )

    if metrics["paragraph_alignment_score"] >= 0.52:
        highlights.append(
            {
                "title": "Parágrafos com boa convergência",
                "description": (
                    "Os parágrafos centrais apresentam proximidade de tema e "
                    "organização, o que fortalece o indício de correlação."
                ),
                "tone": "strong",
            }
        )
    elif matching_paragraphs:
        highlights.append(
            {
                "title": "Parágrafos relacionados",
                "description": (
                    "Há blocos de texto com alinhamento perceptível, mesmo que a "
                    "similaridade global ainda não seja dominante."
                ),
                "tone": "moderate",
            }
        )

    if shared_keywords:
        preview = ", ".join(shared_keywords[:4])
        highlights.append(
            {
                "title": "Vocabulário recorrente",
                "description": (
                    f"Os termos mais recorrentes em comum foram: {preview}. "
                    "Isso ajuda a explicar parte da correlação encontrada."
                ),
                "tone": "moderate" if len(shared_keywords) < 4 else "strong",
            }
        )

    if matching_excerpts:
        strongest_match = matching_excerpts[0]
        highlights.append(
            {
                "title": "Trecho mais próximo",
                "description": (
                    f"O melhor pareamento entre trechos atingiu "
                    f"{strongest_match['similarity']:.2%} de similaridade."
                ),
                "tone": "strong" if strongest_match["similarity"] >= 0.5 else "moderate",
            }
        )

    if matching_paragraphs:
        strongest_paragraph = matching_paragraphs[0]
        highlights.append(
            {
                "title": "Bloco mais alinhado",
                "description": (
                    f"O melhor pareamento entre parágrafos chegou a "
                    f"{strongest_paragraph['similarity']:.2%}."
                ),
                "tone": "strong" if strongest_paragraph["similarity"] >= 0.45 else "moderate",
            }
        )

    if metrics["length_balance_score"] < 0.45:
        highlights.append(
            {
                "title": "Tamanhos diferentes",
                "description": (
                    "Os documentos possuem extensões bem diferentes. Isso pode "
                    "reduzir a proximidade geral mesmo com tópicos parecidos."
                ),
                "tone": "attention",
            }
        )

    return highlights


def run_comparison(
    document_a: UploadedDocument,
    document_b: UploadedDocument,
    title: str | None = None,
) -> dict[str, object]:
    processed_a = build_processed_document(document_a)
    processed_b = build_processed_document(document_b)

    cosine = cosine_score(processed_a.normalized_text, processed_b.normalized_text)
    jaccard = jaccard_score(processed_a.tokens, processed_b.tokens)
    overlap = overlap_score(processed_a.tokens, processed_b.tokens)
    density = keyword_density_match(processed_a.tokens, processed_b.tokens)
    sentence_alignment = sentence_alignment_score(processed_a, processed_b)
    paragraph_alignment = paragraph_alignment_score(processed_a, processed_b)
    length_balance = length_balance_score(processed_a.raw_text, processed_b.raw_text)
    matching_excerpts = find_matching_excerpts(processed_a, processed_b)
    matching_paragraphs = find_matching_paragraphs(processed_a, processed_b)
    correlation_index = round(
        (cosine * 0.30)
        + (jaccard * 0.14)
        + (overlap * 0.14)
        + (density * 0.12)
        + (sentence_alignment * 0.12)
        + (paragraph_alignment * 0.12)
        + (length_balance * 0.06),
        4,
    )
    classification = _classify(correlation_index)
    common_terms = shared_terms(processed_a.tokens, processed_b.tokens)
    metrics = {
        "cosine_score": cosine,
        "jaccard_score": jaccard,
        "overlap_score": overlap,
        "keyword_density_match": density,
        "sentence_alignment_score": sentence_alignment,
        "paragraph_alignment_score": paragraph_alignment,
        "length_balance_score": length_balance,
    }
    highlights = _build_highlights(
        metrics,
        common_terms,
        matching_excerpts,
        matching_paragraphs,
    )

    return {
        "title": _build_title(document_a, document_b, title),
        "created_at": datetime.now(UTC),
        "correlation_index": correlation_index,
        "classification": classification,
        "summary": _build_summary(
            correlation_index,
            classification,
            common_terms,
            matching_excerpts,
            matching_paragraphs,
        ),
        "metrics": metrics,
        "shared_terms": common_terms,
        "matching_excerpts": matching_excerpts,
        "matching_paragraphs": matching_paragraphs,
        "highlights": highlights,
        "document_a": {
            "filename": processed_a.filename,
            "characters": processed_a.characters,
            "word_estimate": processed_a.word_estimate,
            "processed_tokens": processed_a.processed_tokens,
            "unique_terms": processed_a.unique_terms,
            "sentence_count": processed_a.sentence_count,
            "paragraph_count": processed_a.paragraph_count,
        },
        "document_b": {
            "filename": processed_b.filename,
            "characters": processed_b.characters,
            "word_estimate": processed_b.word_estimate,
            "processed_tokens": processed_b.processed_tokens,
            "unique_terms": processed_b.unique_terms,
            "sentence_count": processed_b.sentence_count,
            "paragraph_count": processed_b.paragraph_count,
        },
    }
