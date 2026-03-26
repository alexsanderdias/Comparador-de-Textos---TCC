import { UploadCard } from "../../components/comparison/UploadCard";

export function ComparisonForm({
  title,
  setTitle,
  fileA,
  fileB,
  dragTarget,
  setDragTarget,
  setFileA,
  setFileB,
  submitting,
  progress,
  error,
  persistMessage,
  onSubmit,
}) {
  const selectedFiles = [fileA, fileB].filter(Boolean).length;
  const titleState = title.trim() ? "Título definido" : "Título opcional";

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel__header">
        <div>
          <h2>Nova comparação</h2>
          <p className="panel__lede">
            Monte a análise com dois arquivos e acompanhe o resultado no painel.
          </p>
        </div>
        <span className="support-label">TXT, PDF e DOCX</span>
      </div>

      <div className="form-steps">
        <div className="form-step">
          <span>01</span>
          <strong>Escolha os arquivos</strong>
        </div>
        <div className="form-step">
          <span>02</span>
          <strong>Defina o contexto</strong>
        </div>
        <div className="form-step">
          <span>03</span>
          <strong>Envie para análise</strong>
        </div>
      </div>

      <div className="comparison-overview">
        <div className="comparison-overview__item">
          <span>Arquivos prontos</span>
          <strong>{selectedFiles}/2</strong>
        </div>
        <div className="comparison-overview__item">
          <span>Contexto</span>
          <strong>{titleState}</strong>
        </div>
        <div className="comparison-overview__item">
          <span>Formatos aceitos</span>
          <strong>Texto e documentos</strong>
        </div>
      </div>

      <label className="field">
        <span>Título opcional</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex: Introdução vs Revisão teórica"
        />
      </label>

      <div className="upload-grid">
        <UploadCard
          title="Documento A"
          hint="Primeiro arquivo da comparação."
          file={fileA}
          dragActive={dragTarget === "A"}
          onFileChange={setFileA}
          onDragStart={() => setDragTarget("A")}
          onDragEnd={() => setDragTarget(null)}
          onDropFile={setFileA}
        />
        <UploadCard
          title="Documento B"
          hint="Segundo arquivo da comparação."
          file={fileB}
          dragActive={dragTarget === "B"}
          onFileChange={setFileB}
          onDragStart={() => setDragTarget("B")}
          onDragEnd={() => setDragTarget(null)}
          onDropFile={setFileB}
        />
      </div>

      <div className="comparison-hints">
        <span className="comparison-hint">Arraste arquivos diretamente para os cards.</span>
        <span className="comparison-hint">Use um título curto para facilitar o histórico.</span>
        <span className="comparison-hint">O PDF é gerado pelo backend usando os arquivos atuais.</span>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? "Analisando documentos..." : "Comparar documentos"}
      </button>

      {submitting ? (
        <div className="progress-panel">
          <div className="progress-panel__meta">
            <strong>Enviando e processando a comparação</strong>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-panel__hint">
            O sistema lê os documentos, cruza métricas e prepara os destaques.
          </p>
        </div>
      ) : null}

      {error ? <p className="feedback feedback--error">{error}</p> : null}
      {persistMessage ? <p className="feedback feedback--success">{persistMessage}</p> : null}
    </form>
  );
}
