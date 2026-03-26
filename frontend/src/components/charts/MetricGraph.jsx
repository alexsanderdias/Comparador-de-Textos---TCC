import { formatPercentage } from "../../lib/formatters";

export function MetricGraph({ entries }) {
  if (!entries.length) {
    return (
      <p className="muted-text">
        Execute uma comparação para visualizar o gráfico das métricas.
      </p>
    );
  }

  return (
    <div className="chart-bars">
      {entries.map((entry) => (
        <article className="chart-bar" key={entry.key}>
          <div className="chart-bar__rail">
            <div
              className={`chart-bar__fill chart-bar__fill--${entry.tone}`}
              style={{ height: `${Math.max(entry.value * 100, 6)}%` }}
            />
          </div>
          <strong>{formatPercentage(entry.value)}</strong>
          <span>{entry.label}</span>
        </article>
      ))}
    </div>
  );
}
