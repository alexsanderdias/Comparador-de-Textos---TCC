export function StatCard({ title, stats }) {
  return (
    <section className="panel panel--soft">
      <div className="panel__header">
        <h3>{title}</h3>
        <span className="file-chip">{stats.filename}</span>
      </div>
      <dl className="stats-grid">
        <div>
          <dt>Caracteres</dt>
          <dd>{stats.characters}</dd>
        </div>
        <div>
          <dt>Palavras estimadas</dt>
          <dd>{stats.word_estimate}</dd>
        </div>
        <div>
          <dt>Tokens processados</dt>
          <dd>{stats.processed_tokens}</dd>
        </div>
        <div>
          <dt>Termos únicos</dt>
          <dd>{stats.unique_terms}</dd>
        </div>
        <div>
          <dt>Sentenças</dt>
          <dd>{stats.sentence_count}</dd>
        </div>
        <div>
          <dt>Parágrafos</dt>
          <dd>{stats.paragraph_count}</dd>
        </div>
      </dl>
    </section>
  );
}
