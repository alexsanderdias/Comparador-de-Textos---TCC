export function HeroSection({
  health,
  isSupabaseConfigured,
  onRefreshHealth,
  historyTotal,
}) {
  return (
    <section className="hero">
      <div className="hero__content">
        <div className="hero__copy">
          <p className="eyebrow">Plataforma de validação do TCC</p>
          <h1>Comparador textual com dashboard, histórico e autenticação</h1>
          <p className="hero__text">
            O frontend agora acompanha a evolução da análise com comparação por
            parágrafos, exportação em PDF, dashboard de métricas e histórico
            persistente no Supabase quando a integração estiver configurada.
          </p>
        </div>
        <div className="hero__feature-row">
          <article className="hero-stat">
            <span>Métricas em leitura</span>
            <strong>8 sinais</strong>
          </article>
          <article className="hero-stat">
            <span>Comparações no painel</span>
            <strong>{historyTotal}</strong>
          </article>
          <article className="hero-stat">
            <span>Relatórios disponíveis</span>
            <strong>PDF, TXT e JSON</strong>
          </article>
        </div>
        <div className="status-strip">
          <button className="ghost-button" type="button" onClick={onRefreshHealth}>
            Atualizar conexão
          </button>
          <div className={`status-pill ${health.ok ? "status-pill--ok" : "status-pill--off"}`}>
            <span className="status-pill__dot" />
            <span>{health.loading ? "Checando..." : health.message}</span>
          </div>
          <div
            className={`status-pill ${isSupabaseConfigured ? "status-pill--ok" : "status-pill--off"}`}
          >
            <span className="status-pill__dot" />
            <span>
              {isSupabaseConfigured
                ? "Supabase pronto para autenticar e persistir histórico"
                : "Supabase ainda não configurado no frontend"}
            </span>
          </div>
        </div>
      </div>
      <div className="hero__stage">
        <div className="hero-sheet hero-sheet--back" />
        <div className="hero-sheet hero-sheet--front" />
        <article className="hero-preview">
          <div className="hero-preview__header">
            <span className="hero-preview__eyebrow">Painel em foco</span>
            <span className="hero-preview__mode">
              {isSupabaseConfigured ? "persistência pronta" : "modo local"}
            </span>
          </div>
          <div className="hero-preview__score">
            <span>Correlação em destaque</span>
            <strong>82%</strong>
            <small>Leitura visual do resultado principal da comparação.</small>
          </div>
          <div className="hero-preview__bars">
            <div className="hero-preview__metric">
              <div className="hero-preview__metric-label">
                <span>Semântica</span>
                <strong>0.84</strong>
              </div>
              <div className="hero-preview__track">
                <div className="hero-preview__fill hero-preview__fill--semantic" />
              </div>
            </div>
            <div className="hero-preview__metric">
              <div className="hero-preview__metric-label">
                <span>Estrutura</span>
                <strong>0.73</strong>
              </div>
              <div className="hero-preview__track">
                <div className="hero-preview__fill hero-preview__fill--structure" />
              </div>
            </div>
            <div className="hero-preview__metric">
              <div className="hero-preview__metric-label">
                <span>Termos em comum</span>
                <strong>0.68</strong>
              </div>
              <div className="hero-preview__track">
                <div className="hero-preview__fill hero-preview__fill--terms" />
              </div>
            </div>
          </div>
        </article>
        <article className="hero-note hero-note--top">
          <span>Comparações</span>
          <strong>{historyTotal}</strong>
          <small>entradas acompanhadas no painel</small>
        </article>
        <article className="hero-note hero-note--bottom">
          <span>Exportação</span>
          <strong>3 formatos</strong>
          <small>prontos para compartilhar</small>
        </article>
      </div>
    </section>
  );
}
