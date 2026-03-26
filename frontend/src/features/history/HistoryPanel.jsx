import { formatDateTime, formatPercentage } from "../../lib/formatters";

export function HistoryPanel({
  session,
  historyView,
  setHistoryView,
  historyLoading,
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
          <div className="tab-row">
            <button
              className={`tab-chip ${historyView === "local" ? "tab-chip--active" : ""}`}
              type="button"
              onClick={() => setHistoryView("local")}
            >
              Local
            </button>
            <button
              className={`tab-chip ${historyView === "supabase" ? "tab-chip--active" : ""}`}
              type="button"
              onClick={() => setHistoryView("supabase")}
              disabled={!session?.user}
            >
              Supabase
            </button>
          </div>
          <button
            className="ghost-button ghost-button--small"
            type="button"
            onClick={onClearLocalHistory}
          >
            Limpar local
          </button>
        </div>
      </div>
      {historyLoading && historyView === "supabase" ? (
        <p className="muted-text">Carregando histórico persistente...</p>
      ) : null}
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
              <small>{formatDateTime(entry.savedAt)} - fonte {entry.source}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="muted-text">
          {historyView === "supabase"
            ? "Nenhuma comparação persistida ainda."
            : "As comparações feitas aqui ficam salvas no navegador."}
        </p>
      )}
    </section>
  );
}
