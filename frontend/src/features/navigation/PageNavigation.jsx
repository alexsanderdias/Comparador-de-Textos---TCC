export function PageHub({ items, onNavigate }) {
  return (
    <section className="hub-shell">
      <div className="hub-shell__header">
        <div>
          <p className="hub-shell__eyebrow">Funções do sistema</p>
          <h2>Escolha uma área para continuar</h2>
          <p className="hub-shell__text">
            Cada card leva para uma função principal do produto, deixando a
            navegação mais clara e organizada.
          </p>
        </div>
      </div>
      <div className="hub-grid">
        {items.map((item) => (
          <button
            className={`hub-card hub-card--${item.tone}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <div className="hub-card__top">
              <span className="hub-card__eyebrow">{item.eyebrow}</span>
              <span className="hub-card__badge">{item.meta}</span>
            </div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span className="hub-card__cta">Abrir função</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function PageToolbar({ currentPage, items, onNavigate }) {
  return (
    <div className="page-toolbar">
      <button className="page-toolbar__home" type="button" onClick={() => onNavigate("home")}>
        <span className="page-toolbar__home-icon" aria-hidden="true">←</span>
        <span>Voltar ao hub</span>
      </button>
      <div className="page-toolbar__tabs">
        {items.map((item) => (
          <button
            className={`page-tab ${currentPage === item.id ? "page-tab--active" : ""}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
