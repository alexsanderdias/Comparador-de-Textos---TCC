import { METRIC_META } from "./constants";

export function buildMetricEntries(result) {
  if (!result) {
    return [];
  }

  return [
    ["correlation_index", result.correlation_index],
    ["cosine_score", result.metrics.cosine_score],
    ["jaccard_score", result.metrics.jaccard_score],
    ["overlap_score", result.metrics.overlap_score],
    ["keyword_density_match", result.metrics.keyword_density_match],
    ["sentence_alignment_score", result.metrics.sentence_alignment_score],
    ["paragraph_alignment_score", result.metrics.paragraph_alignment_score],
    ["length_balance_score", result.metrics.length_balance_score],
  ].map(([metricKey, value]) => ({
    key: metricKey,
    value,
    ...METRIC_META[metricKey],
  }));
}
