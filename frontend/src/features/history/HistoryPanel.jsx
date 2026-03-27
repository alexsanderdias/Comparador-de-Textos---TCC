import { formatDateTime, formatPercentage } from "../../lib/formatters";

export function HistoryPanel({
  displayedHistory,
  onRestoreEntry,
  onClearLocalHistory,
}) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Comparações anteriores</h2>
          <p className="panel__lede">Recupere análises salvas e reabra um resultado com um clique.</p>
        </div>
        <div className="panel__actions">
          <span className="support-label">histórico local</span>
          <button
            className="ghost-button ghost-button--small"
            type="button"
            onClick={onClearLocalHistory}
          >
            Limpar histórico
          </button>
        </div>
      </div>
      {displayedHistory.length ? (
        <div className="history-list">
          {displayedHistory.map((entry) => (
            <button
              className="history-item"
              key={entry.id}
              type="button"
              onClick={() => onRestoreEntry(entry)}
            >
              <div className="history-item__meta">
                <strong>{entry.result.title}</strong>
                <span className={`badge badge--${entry.result.classification}`}>
                  {entry.result.classification}
                </span>
              </div>
              <span>{formatPercentage(entry.result.correlation_index)}</span>
              <small>{formatDateTime(entry.savedAt)} - fonte local</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="muted-text">
          As comparações feitas aqui ficam salvas no navegador.
        </p>
      )}
    </section>
  );
}
