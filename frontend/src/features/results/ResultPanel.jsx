import { MetricCard } from "../../components/metrics/MetricCard";
import { ExcerptList } from "../../components/results/ExcerptList";
import { StatCard } from "../../components/results/StatCard";
import { formatDateTime, formatPercentage } from "../../lib/formatters";

const classificationTone = {
  alta: "Alta aderência",
  media: "Atenção moderada",
  baixa: "Baixa proximidade",
};

export function ResultPanel({
  result,
  exportFeedback,
  onExportJson,
  onExportText,
  onExportPdf,
  onStartNewComparison,
  onOpenDashboard,
}) {
  return (
    <section className="panel results-panel">
      <div className="panel__header">
        <div>
          <h2>Resultado</h2>
          <p className="panel__lede">
            Relatório principal da análise com indicadores, trechos e documentos comparados.
          </p>
        </div>
        <span className="support-label">{result ? result.classification : "aguardando envio"}</span>
      </div>
      {result ? (
        <div className="results-stack">
          <div className="result-rail">
            <span className="result-rail__item">Resumo</span>
            <span className="result-rail__item">Métricas</span>
            <span className="result-rail__item">Insights</span>
            <span className="result-rail__item">Trechos</span>
            <span className="result-rail__item">Documentos</span>
          </div>

          <div className="result-next-steps">
            <div>
              <strong>Próximos passos</strong>
              <p>
                Exporte o relatório, revise os trechos mais próximos ou siga para o dashboard
                para comparar este resultado com o histórico.
              </p>
            </div>
            <div className="result-next-steps__actions">
              <button className="ghost-button ghost-button--small" type="button" onClick={onStartNewComparison}>
                Nova comparação
              </button>
              <button className="ghost-button ghost-button--small" type="button" onClick={onOpenDashboard}>
                Abrir dashboard
              </button>
            </div>
          </div>

          <div className="summary-card">
            <p className="summary-card__eyebrow">{result.title}</p>
            <h3>{formatPercentage(result.correlation_index)}</h3>
            <p>{result.summary}</p>
            <div className="summary-card__stats">
              <div className="summary-stat">
                <span>Classificação</span>
                <strong>{result.classification}</strong>
              </div>
              <div className="summary-stat">
                <span>Leitura sugerida</span>
                <strong>{classificationTone[result.classification] ?? "Em análise"}</strong>
              </div>
              <div className="summary-stat">
                <span>Trechos fortes</span>
                <strong>{result.matching_excerpts.length}</strong>
              </div>
              <div className="summary-stat">
                <span>Parágrafos alinhados</span>
                <strong>{result.matching_paragraphs.length}</strong>
              </div>
              <div className="summary-stat">
                <span>Termos em comum</span>
                <strong>{result.shared_terms.length}</strong>
              </div>
              <div className="summary-stat">
                <span>Gerado em</span>
                <strong>{formatDateTime(result.created_at)}</strong>
              </div>
            </div>
            <div className="summary-card__meta">
              <span>Você pode exportar agora ou seguir para uma nova análise.</span>
              <div className="summary-card__actions">
                <button className="secondary-button" type="button" onClick={onExportJson}>
                  Exportar JSON
                </button>
                <button className="secondary-button" type="button" onClick={onExportText}>
                  Exportar TXT
                </button>
                <button className="secondary-button" type="button" onClick={onExportPdf}>
                  Exportar PDF
                </button>
              </div>
            </div>
            {exportFeedback ? <p className="summary-card__feedback">{exportFeedback}</p> : null}
          </div>

          <div className="metrics-grid metrics-grid--wide">
            <MetricCard metricKey="correlation_index" value={result.correlation_index} />
            <MetricCard metricKey="cosine_score" value={result.metrics.cosine_score} />
            <MetricCard metricKey="jaccard_score" value={result.metrics.jaccard_score} />
            <MetricCard metricKey="overlap_score" value={result.metrics.overlap_score} />
            <MetricCard
              metricKey="keyword_density_match"
              value={result.metrics.keyword_density_match}
            />
            <MetricCard
              metricKey="sentence_alignment_score"
              value={result.metrics.sentence_alignment_score}
            />
            <MetricCard
              metricKey="paragraph_alignment_score"
              value={result.metrics.paragraph_alignment_score}
            />
            <MetricCard
              metricKey="length_balance_score"
              value={result.metrics.length_balance_score}
            />
          </div>

          <div className="insight-grid">
            <section className="panel panel--soft">
              <div className="panel__header">
                <h3>Destaques da análise</h3>
                <span className="support-label">{result.highlights.length} sinais</span>
              </div>
              <div className="highlights-grid">
                {result.highlights.map((highlight) => (
                  <article
                    className={`highlight-card highlight-card--${highlight.tone}`}
                    key={`${highlight.title}-${highlight.description}`}
                  >
                    <strong>{highlight.title}</strong>
                    <p>{highlight.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel panel--soft">
              <div className="panel__header">
                <h3>Termos em comum</h3>
                <span className="support-label">{result.shared_terms.length} encontrados</span>
              </div>
              <div className="tags-wrap">
                {result.shared_terms.length ? (
                  result.shared_terms.map((term) => <span className="tag" key={term}>{term}</span>)
                ) : (
                  <p className="muted-text">Nenhum termo em comum relevante.</p>
                )}
              </div>
            </section>
          </div>

          <section className="panel panel--soft">
            <div className="panel__header">
              <h3>Parágrafos relacionados</h3>
              <span className="support-label">{result.matching_paragraphs.length} correspondências</span>
            </div>
            <ExcerptList
              items={result.matching_paragraphs}
              emptyText="Ainda não apareceu um pareamento forte de parágrafos relacionados para esta comparação."
              itemLabel="Parágrafo"
              indexKeys={["paragraph_index_a", "paragraph_index_b"]}
              paragraphVariant
            />
          </section>

          <section className="panel panel--soft">
            <div className="panel__header">
              <h3>Trechos semelhantes</h3>
              <span className="support-label">{result.matching_excerpts.length} correspondências</span>
            </div>
            <ExcerptList
              items={result.matching_excerpts}
              emptyText="Ainda não apareceu um pareamento forte de trechos semelhantes para esta comparação."
              itemLabel="Par"
              indexKeys={["sentence_index_a", "sentence_index_b"]}
            />
          </section>

          <div className="documents-grid">
            <StatCard title="Documento A" stats={result.document_a} />
            <StatCard title="Documento B" stats={result.document_b} />
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>O resultado da comparação vai aparecer aqui.</p>
          <span>
            Quando os dois arquivos forem enviados, você verá dashboard, métricas detalhadas,
            parágrafos relacionados, trechos semelhantes e exportação de relatório.
          </span>
          <button className="ghost-button ghost-button--small" type="button" onClick={onStartNewComparison}>
            Ir para comparação
          </button>
        </div>
      )}
    </section>
  );
}
