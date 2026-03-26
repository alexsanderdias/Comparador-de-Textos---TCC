import { METRIC_META } from "../../lib/constants";
import { formatPercentage } from "../../lib/formatters";

export function MetricCard({ metricKey, value }) {
  const meta = METRIC_META[metricKey];

  return (
    <article className={`metric-card metric-card--${meta.tone}`}>
      <span className="metric-card__label">{meta.label}</span>
      <strong className="metric-card__value">{formatPercentage(value)}</strong>
      <p className="metric-card__description">{meta.description}</p>
    </article>
  );
}
