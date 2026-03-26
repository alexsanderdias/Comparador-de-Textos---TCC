import { formatPercentage } from "../../lib/formatters";

export function ExcerptList({
  items,
  emptyText,
  itemLabel,
  indexKeys,
  paragraphVariant = false,
}) {
  if (!items.length) {
    return <p className="muted-text">{emptyText}</p>;
  }

  return (
    <div className="excerpt-list">
      {items.map((item, index) => (
        <article
          className={`excerpt-card ${paragraphVariant ? "excerpt-card--paragraph" : ""}`}
          key={`${item[indexKeys[0]]}-${item[indexKeys[1]]}`}
        >
          <div className="excerpt-card__header">
            <strong>{`${itemLabel} ${index + 1}`}</strong>
            <span>{formatPercentage(item.similarity)}</span>
          </div>
          <div className="excerpt-card__grid">
            <div>
              <span className="excerpt-card__label">Documento A</span>
              <p>{item.excerpt_a}</p>
            </div>
            <div>
              <span className="excerpt-card__label">Documento B</span>
              <p>{item.excerpt_b}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
