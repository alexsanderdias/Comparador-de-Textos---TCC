import { METRIC_META } from "../../lib/constants";

export function MetricsGuidePanel() {
  return (
    <section className="panel panel--soft">
      <div className="panel__header">
        <h2>Como ler as métricas</h2>
      </div>
      <div className="guide-list">
        {Object.entries(METRIC_META).map(([metricKey, metric]) => (
          <article className="guide-item" key={metricKey}>
            <strong>{metric.label}</strong>
            <p>{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
