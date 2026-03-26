function formatFileSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "";
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadCard({
  title,
  hint,
  file,
  dragActive,
  onFileChange,
  onDragStart,
  onDragEnd,
  onDropFile,
}) {
  const fileSize = file ? formatFileSize(file.size) : "";

  return (
    <label
      className={`upload-card ${dragActive ? "upload-card--active" : ""}`}
      onDragEnter={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragStart();
      }}
      onDragLeave={onDragEnd}
      onDrop={(event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0] ?? null;
        onDropFile(droppedFile);
        onDragEnd();
      }}
    >
      <span className="upload-card__title">{title}</span>
      <span className="upload-card__hint">{hint}</span>
      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      <div className="upload-card__file">
        <strong>{file ? file.name : "Nenhum arquivo selecionado"}</strong>
        <span className={`upload-card__status ${file ? "upload-card__status--ready" : ""}`}>
          {file ? `Arquivo pronto${fileSize ? ` • ${fileSize}` : ""}` : "Aguardando envio"}
        </span>
      </div>
      <span className="upload-card__dropzone">
        Arraste e solte aqui ou use o seletor acima.
      </span>
    </label>
  );
}
