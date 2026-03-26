from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from itertools import product
import re
import unicodedata

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.document_reader import UploadedDocument


STOPWORDS_PT = {
    "a",
    "ao",
    "aos",
    "as",
    "com",
    "como",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "entre",
    "era",
    "essa",
    "esse",
    "esta",
    "este",
    "foi",
    "ha",
    "isso",
    "isto",
    "ja",
    "mais",
    "mas",
    "na",
    "nas",
    "nao",
    "nem",
    "no",
    "nos",
    "o",
    "os",
    "ou",
    "para",
    "pela",
    "pelas",
    "pelo",
    "pelos",
    "por",
    "que",
    "se",
    "sem",
    "ser",
    "sua",
    "suas",
    "seu",
    "seus",
    "um",
    "uma",
}


TOKEN_PATTERN = re.compile(r"[a-z0-9]+", re.IGNORECASE)
SENTENCE_SPLIT_PATTERN = re.compile(r"(?<=[.!?])\s+|\n+")
PARAGRAPH_SPLIT_PATTERN = re.compile(r"\n\s*\n+")


@dataclass
class ProcessedDocument:
    filename: str
    raw_text: str
    normalized_text: str
    tokens: list[str]
    sentences: list[str]
    normalized_sentences: list[str]
    paragraphs: list[str]
    normalized_paragraphs: list[str]

    @property
    def characters(self) -> int:
        return len(self.raw_text)

    @property
    def word_estimate(self) -> int:
        return len(self.raw_text.split())

    @property
    def processed_tokens(self) -> int:
        return len(self.tokens)

    @property
    def unique_terms(self) -> int:
        return len(set(self.tokens))

    @property
    def sentence_count(self) -> int:
        return len(self.sentences)

    @property
    def paragraph_count(self) -> int:
        return len(self.paragraphs)


def _strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def normalize_text(text: str) -> str:
    lowered = _strip_accents(text.lower())
    without_symbols = re.sub(r"[^a-z0-9\s]", " ", lowered)
    return re.sub(r"\s+", " ", without_symbols).strip()


def tokenize_text(text: str) -> list[str]:
    normalized = normalize_text(text)
    tokens = [
        token
        for token in TOKEN_PATTERN.findall(normalized)
        if len(token) > 2 and token not in STOPWORDS_PT
    ]
    return tokens


def split_sentences(text: str) -> list[str]:
    normalized_breaks = text.replace("\r\n", "\n")
    sentences = [
        sentence.strip()
        for sentence in SENTENCE_SPLIT_PATTERN.split(normalized_breaks)
        if sentence.strip()
    ]
    return sentences


def split_paragraphs(text: str) -> list[str]:
    normalized_breaks = text.replace("\r\n", "\n")
    paragraphs = [
        paragraph.strip()
        for paragraph in PARAGRAPH_SPLIT_PATTERN.split(normalized_breaks)
        if paragraph.strip()
    ]
    if paragraphs:
        return paragraphs
    stripped = normalized_breaks.strip()
    return [stripped] if stripped else []


def build_processed_document(document: UploadedDocument) -> ProcessedDocument:
    tokens = tokenize_text(document.text)
    if not tokens:
        raise ValueError(
            f"O documento '{document.filename}' ficou sem termos uteis apos o preprocessamento."
        )

    sentences = split_sentences(document.text)
    paragraphs = split_paragraphs(document.text)
    normalized_sentences = [
        normalized_sentence
        for sentence in sentences
        if (normalized_sentence := normalize_text(sentence))
    ]
    normalized_paragraphs = [
        normalized_paragraph
        for paragraph in paragraphs
        if (normalized_paragraph := normalize_text(paragraph))
    ]

    return ProcessedDocument(
        filename=document.filename,
        raw_text=document.text,
        normalized_text=normalize_text(document.text),
        tokens=tokens,
        sentences=sentences,
        normalized_sentences=normalized_sentences,
        paragraphs=paragraphs,
        normalized_paragraphs=normalized_paragraphs,
    )


def cosine_score(text_a: str, text_b: str) -> float:
    try:
        matrix = TfidfVectorizer(ngram_range=(1, 2)).fit_transform([text_a, text_b])
        score = float(cosine_similarity(matrix)[0, 1])
        return max(0.0, min(1.0, round(score, 4)))
    except ValueError:
        return 0.0


def jaccard_score(tokens_a: list[str], tokens_b: list[str]) -> float:
    vocabulary_a = set(tokens_a)
    vocabulary_b = set(tokens_b)
    union = vocabulary_a | vocabulary_b
    if not union:
        return 0.0
    score = len(vocabulary_a & vocabulary_b) / len(union)
    return max(0.0, min(1.0, round(score, 4)))


def overlap_score(tokens_a: list[str], tokens_b: list[str]) -> float:
    vocabulary_a = set(tokens_a)
    vocabulary_b = set(tokens_b)
    denominator = min(len(vocabulary_a), len(vocabulary_b))
    if denominator == 0:
        return 0.0
    score = len(vocabulary_a & vocabulary_b) / denominator
    return max(0.0, min(1.0, round(score, 4)))


def keyword_density_match(tokens_a: list[str], tokens_b: list[str]) -> float:
    counter_a = Counter(tokens_a)
    counter_b = Counter(tokens_b)
    shared_counts = counter_a & counter_b
    shared_mass = sum(shared_counts.values())
    total_mass = len(tokens_a) + len(tokens_b)
    if total_mass == 0:
        return 0.0
    score = (2 * shared_mass) / total_mass
    return max(0.0, min(1.0, round(score, 4)))


def shared_terms(tokens_a: list[str], tokens_b: list[str], limit: int = 8) -> list[str]:
    counter_a = Counter(tokens_a)
    counter_b = Counter(tokens_b)
    common = counter_a & counter_b
    return [term for term, _ in common.most_common(limit)]


def length_balance_score(text_a: str, text_b: str) -> float:
    length_a = len(text_a.split())
    length_b = len(text_b.split())
    longest = max(length_a, length_b)
    if longest == 0:
        return 0.0
    score = min(length_a, length_b) / longest
    return max(0.0, min(1.0, round(score, 4)))


def _segment_similarity(normalized_a: str, normalized_b: str) -> float:
    tokens_a = tokenize_text(normalized_a)
    tokens_b = tokenize_text(normalized_b)
    if not tokens_a or not tokens_b:
        return 0.0

    lexical = jaccard_score(tokens_a, tokens_b)
    semantic = cosine_score(normalized_a, normalized_b)
    return max(0.0, min(1.0, round((semantic * 0.65) + (lexical * 0.35), 4)))


def sentence_alignment_score(
    processed_a: ProcessedDocument,
    processed_b: ProcessedDocument,
) -> float:
    return segment_alignment_score(
        processed_a.normalized_sentences,
        processed_b.normalized_sentences,
    )


def segment_alignment_score(
    normalized_segments_a: list[str],
    normalized_segments_b: list[str],
) -> float:
    if not normalized_segments_a or not normalized_segments_b:
        return 0.0

    best_scores = []
    for segment_a in normalized_segments_a:
        score = max(
            _segment_similarity(segment_a, segment_b)
            for segment_b in normalized_segments_b
        )
        best_scores.append(score)

    if not best_scores:
        return 0.0

    average_score = sum(best_scores) / len(best_scores)
    return max(0.0, min(1.0, round(average_score, 4)))


def paragraph_alignment_score(
    processed_a: ProcessedDocument,
    processed_b: ProcessedDocument,
) -> float:
    return segment_alignment_score(
        processed_a.normalized_paragraphs,
        processed_b.normalized_paragraphs,
    )


def _truncate_excerpt(text: str, limit: int = 220) -> str:
    stripped = text.strip()
    if len(stripped) <= limit:
        return stripped
    return f"{stripped[:limit].rstrip()}..."


def find_matching_excerpts(
    processed_a: ProcessedDocument,
    processed_b: ProcessedDocument,
    limit: int = 5,
    threshold: float = 0.22,
) -> list[dict[str, object]]:
    return find_matching_segments(
        processed_a.sentences,
        processed_b.sentences,
        limit=limit,
        threshold=threshold,
        index_label="sentence",
    )


def find_matching_paragraphs(
    processed_a: ProcessedDocument,
    processed_b: ProcessedDocument,
    limit: int = 4,
    threshold: float = 0.18,
) -> list[dict[str, object]]:
    return find_matching_segments(
        processed_a.paragraphs,
        processed_b.paragraphs,
        limit=limit,
        threshold=threshold,
        index_label="paragraph",
        min_words=12,
        excerpt_limit=320,
    )


def find_matching_segments(
    segments_a: list[str],
    segments_b: list[str],
    *,
    limit: int,
    threshold: float,
    index_label: str,
    min_words: int = 4,
    excerpt_limit: int = 220,
) -> list[dict[str, object]]:
    scored_pairs: list[dict[str, object]] = []

    for index_a, index_b in product(
        range(len(segments_a)),
        range(len(segments_b)),
    ):
        segment_a = segments_a[index_a]
        segment_b = segments_b[index_b]
        normalized_a = normalize_text(segment_a)
        normalized_b = normalize_text(segment_b)

        if len(normalized_a.split()) < min_words or len(normalized_b.split()) < min_words:
            continue

        similarity = _segment_similarity(normalized_a, normalized_b)
        if similarity < threshold:
            continue

        scored_pairs.append(
            {
                "excerpt_a": _truncate_excerpt(segment_a, limit=excerpt_limit),
                "excerpt_b": _truncate_excerpt(segment_b, limit=excerpt_limit),
                "similarity": similarity,
                f"{index_label}_index_a": index_a,
                f"{index_label}_index_b": index_b,
            }
        )

    ranked_pairs = sorted(
        scored_pairs,
        key=lambda pair: pair["similarity"],
        reverse=True,
    )

    selected_pairs: list[dict[str, object]] = []
    used_a: set[int] = set()
    used_b: set[int] = set()
    for pair in ranked_pairs:
        index_a = int(pair[f"{index_label}_index_a"])
        index_b = int(pair[f"{index_label}_index_b"])
        if index_a in used_a or index_b in used_b:
            continue
        selected_pairs.append(pair)
        used_a.add(index_a)
        used_b.add(index_b)
        if len(selected_pairs) >= limit:
            break

    return selected_pairs
