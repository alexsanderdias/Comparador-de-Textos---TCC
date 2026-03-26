import { HISTORY_STORAGE_KEY } from "./constants";
import { slugify } from "./formatters";

export function loadHistory() {
  try {
    const rawHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!rawHistory) {
      return [];
    }

    const parsed = JSON.parse(rawHistory);
    return Array.isArray(parsed)
      ? parsed.map((entry) => ({
          ...entry,
          result: normalizeResultPayload(entry.result),
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveHistory(historyEntries) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries));
}

export function buildHistoryEntry(result, source = "local", id = null, savedAt = null) {
  const normalizedResult = normalizeResultPayload(result);
  return {
    id: id ?? `${source}-${normalizedResult.created_at}-${slugify(normalizedResult.title)}`,
    source,
    savedAt: savedAt ?? new Date().toISOString(),
    result: normalizedResult,
  };
}

export function mapSupabaseRowToHistoryEntry(row) {
  return buildHistoryEntry(
    {
      title: row.title,
      created_at: row.created_at,
      correlation_index: row.correlation_index,
      classification: row.classification,
      summary: row.summary,
      metrics: row.metrics,
      shared_terms: row.shared_terms ?? [],
      matching_excerpts: row.matching_excerpts ?? [],
      matching_paragraphs: row.matching_paragraphs ?? [],
      highlights: row.highlights ?? [],
      document_a: row.document_a,
      document_b: row.document_b,
    },
    "supabase",
    row.id,
    row.created_at,
  );
}

export function normalizeResultPayload(result) {
  const fallbackMetrics = {
    cosine_score: 0,
    jaccard_score: 0,
    overlap_score: 0,
    keyword_density_match: 0,
    sentence_alignment_score: 0,
    paragraph_alignment_score: 0,
    length_balance_score: 0,
  };

  return {
    ...result,
    metrics: {
      ...fallbackMetrics,
      ...(result?.metrics ?? {}),
    },
    shared_terms: result?.shared_terms ?? [],
    matching_excerpts: result?.matching_excerpts ?? [],
    matching_paragraphs: result?.matching_paragraphs ?? [],
    highlights: result?.highlights ?? [],
    document_a: {
      sentence_count: 0,
      paragraph_count: 0,
      ...(result?.document_a ?? {}),
    },
    document_b: {
      sentence_count: 0,
      paragraph_count: 0,
      ...(result?.document_b ?? {}),
    },
  };
}

export function buildHistorySummary(historyEntries) {
  if (!historyEntries.length) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      classificationCounts: { alta: 0, media: 0, baixa: 0 },
    };
  }

  const classificationCounts = { alta: 0, media: 0, baixa: 0 };
  let totalCorrelation = 0;
  let highest = 0;

  for (const entry of historyEntries) {
    const correlation = entry.result.correlation_index;
    totalCorrelation += correlation;
    highest = Math.max(highest, correlation);
    if (classificationCounts[entry.result.classification] !== undefined) {
      classificationCounts[entry.result.classification] += 1;
    }
  }

  return {
    total: historyEntries.length,
    average: totalCorrelation / historyEntries.length,
    highest,
    classificationCounts,
  };
}

export function buildHistoryTrend(historyEntries) {
  return [...historyEntries]
    .slice(0, 6)
    .reverse()
    .map((entry, index) => ({
      id: entry.id,
      label: `${index + 1}`,
      value: entry.result.correlation_index,
      title: entry.result.title,
      classification: entry.result.classification,
    }));
}
