import { formatPercentage } from "../../lib/formatters";

export function HistoryTrend({ trend }) {
  if (!trend.length) {
    return (
      <p className="muted-text">
        O gráfico de evolução aparece quando houver comparações salvas.
      </p>
    );
  }

  return (
    <div className="history-chart">
      {trend.map((entry) => (
        <div className="history-chart__item" key={entry.id} title={entry.title}>
          <div className="history-chart__rail">
            <div
              className={`history-chart__bar history-chart__bar--${entry.classification}`}
              style={{ height: `${Math.max(entry.value * 100, 8)}%` }}
            />
          </div>
          <strong>{formatPercentage(entry.value)}</strong>
          <span>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}
