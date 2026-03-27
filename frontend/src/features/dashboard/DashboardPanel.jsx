import { HistoryTrend } from "../../components/charts/HistoryTrend";
import { MetricGraph } from "../../components/charts/MetricGraph";
import { formatPercentage } from "../../lib/formatters";

export function DashboardPanel({
  historySummary,
  historyTrend,
  metricEntries,
  result,
}) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Dashboard</h2>
          <p className="panel__lede">
            Leitura consolidada do volume de análises e da qualidade média das comparações.
          </p>
        </div>
        <span className="support-label">histórico local</span>
      </div>
      <div className="dashboard-intro">
        <div className="dashboard-intro__copy">
          <span className="dashboard-intro__eyebrow">Panorama</span>
          <p>
            Os cards resumem rapidamente quantidade, média e pico de correlação,
            enquanto os gráficos mostram o comportamento recente do projeto.
          </p>
        </div>
        <div className="dashboard-intro__badge">
          <span>Origem ativa</span>
          <strong>Histórico local</strong>
        </div>
      </div>
      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-card--accent">
          <div className="dashboard-card__top">
            <span className="dashboard-card__eyebrow">Volume</span>
            <span className="dashboard-card__orb" />
          </div>
          <span>Total de comparações</span>
          <strong>{historySummary.total}</strong>
          <small>Base visível no painel atual.</small>
        </article>
        <article className="dashboard-card dashboard-card--cool">
          <div className="dashboard-card__top">
            <span className="dashboard-card__eyebrow">Qualidade</span>
            <span className="dashboard-card__orb" />
          </div>
          <span>Média de correlação</span>
          <strong>{formatPercentage(historySummary.average)}</strong>
          <small>Ritmo médio das comparações recentes.</small>
        </article>
        <article className="dashboard-card dashboard-card--warm">
          <div className="dashboard-card__top">
            <span className="dashboard-card__eyebrow">Pico</span>
            <span className="dashboard-card__orb" />
          </div>
          <span>Maior correlação</span>
          <strong>{formatPercentage(historySummary.highest)}</strong>
          <small>Melhor resultado encontrado até agora.</small>
        </article>
      </div>
      <div className="dashboard-panels">
        <section className="panel panel--soft">
          <div className="panel__header">
            <h3>Gráfico das métricas</h3>
            <span className="support-label">
              {result ? "comparação atual" : "aguardando análise"}
            </span>
          </div>
          <MetricGraph entries={metricEntries} />
        </section>
        <section className="panel panel--soft">
          <div className="panel__header">
            <h3>Evolução recente</h3>
            <span className="support-label">{historyTrend.length} pontos</span>
          </div>
          <HistoryTrend trend={historyTrend} />
        </section>
      </div>
      <section className="panel panel--soft">
        <div className="panel__header">
          <h3>Distribuição por classificação</h3>
        </div>
        <div className="classification-strip">
          <div className="classification-pill classification-pill--alta">
            <strong>{historySummary.classificationCounts.alta}</strong>
            <span>Alta</span>
          </div>
          <div className="classification-pill classification-pill--media">
            <strong>{historySummary.classificationCounts.media}</strong>
            <span>Média</span>
          </div>
          <div className="classification-pill classification-pill--baixa">
            <strong>{historySummary.classificationCounts.baixa}</strong>
            <span>Baixa</span>
          </div>
        </div>
      </section>
    </section>
  );
}
