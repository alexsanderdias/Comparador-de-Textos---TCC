from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class DocumentStats(BaseModel):
    filename: str
    characters: int = Field(..., ge=0)
    word_estimate: int = Field(..., ge=0)
    processed_tokens: int = Field(..., ge=0)
    unique_terms: int = Field(..., ge=0)
    sentence_count: int = Field(..., ge=0)
    paragraph_count: int = Field(..., ge=0)


class SimilarityMetrics(BaseModel):
    cosine_score: float = Field(..., ge=0, le=1)
    jaccard_score: float = Field(..., ge=0, le=1)
    overlap_score: float = Field(..., ge=0, le=1)
    keyword_density_match: float = Field(..., ge=0, le=1)
    sentence_alignment_score: float = Field(..., ge=0, le=1)
    paragraph_alignment_score: float = Field(..., ge=0, le=1)
    length_balance_score: float = Field(..., ge=0, le=1)


class MatchingExcerpt(BaseModel):
    excerpt_a: str
    excerpt_b: str
    similarity: float = Field(..., ge=0, le=1)
    sentence_index_a: int = Field(..., ge=0)
    sentence_index_b: int = Field(..., ge=0)


class MatchingParagraph(BaseModel):
    excerpt_a: str
    excerpt_b: str
    similarity: float = Field(..., ge=0, le=1)
    paragraph_index_a: int = Field(..., ge=0)
    paragraph_index_b: int = Field(..., ge=0)


class AnalysisHighlight(BaseModel):
    title: str
    description: str
    tone: Literal["strong", "moderate", "attention"]


class ComparisonResponse(BaseModel):
    title: str
    created_at: datetime
    correlation_index: float = Field(..., ge=0, le=1)
    classification: str
    summary: str
    metrics: SimilarityMetrics
    shared_terms: list[str] = Field(default_factory=list)
    matching_excerpts: list[MatchingExcerpt] = Field(default_factory=list)
    matching_paragraphs: list[MatchingParagraph] = Field(default_factory=list)
    highlights: list[AnalysisHighlight] = Field(default_factory=list)
    document_a: DocumentStats
    document_b: DocumentStats
