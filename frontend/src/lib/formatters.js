export function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString("pt-BR");
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function downloadBlob(content, filename, contentType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildTextExport(result) {
  const lines = [
    "RELATÓRIO DE COMPARAÇÃO TEXTUAL",
    "",
    `Título: ${result.title}`,
    `Gerado em: ${formatDateTime(result.created_at)}`,
    `Classificação: ${result.classification}`,
    `Correlação geral: ${formatPercentage(result.correlation_index)}`,
    "",
    "RESUMO",
    result.summary,
    "",
    "MÉTRICAS",
    `- Similaridade cosseno: ${formatPercentage(result.metrics.cosine_score)}`,
    `- Jaccard: ${formatPercentage(result.metrics.jaccard_score)}`,
    `- Sobreposição de termos: ${formatPercentage(result.metrics.overlap_score)}`,
    `- Densidade de palavras-chave: ${formatPercentage(result.metrics.keyword_density_match)}`,
    `- Alinhamento por sentenças: ${formatPercentage(result.metrics.sentence_alignment_score)}`,
    `- Alinhamento por parágrafos: ${formatPercentage(result.metrics.paragraph_alignment_score)}`,
    `- Equilíbrio de tamanho: ${formatPercentage(result.metrics.length_balance_score)}`,
    "",
    "TERMOS EM COMUM",
    result.shared_terms.length
      ? result.shared_terms.join(", ")
      : "Nenhum termo relevante encontrado.",
    "",
    "PARÁGRAFOS RELACIONADOS",
  ];

  if (result.matching_paragraphs.length) {
    result.matching_paragraphs.forEach((paragraph, index) => {
      lines.push(`${index + 1}. Similaridade: ${formatPercentage(paragraph.similarity)}`);
      lines.push(`   A: ${paragraph.excerpt_a}`);
      lines.push(`   B: ${paragraph.excerpt_b}`);
    });
  } else {
    lines.push("Nenhum parágrafo relacionado forte foi encontrado.");
  }

  lines.push("", "TRECHOS SEMELHANTES");

  if (result.matching_excerpts.length) {
    result.matching_excerpts.forEach((excerpt, index) => {
      lines.push(`${index + 1}. Similaridade: ${formatPercentage(excerpt.similarity)}`);
      lines.push(`   A: ${excerpt.excerpt_a}`);
      lines.push(`   B: ${excerpt.excerpt_b}`);
    });
  } else {
    lines.push("Nenhum trecho semelhante forte foi encontrado.");
  }

  return lines.join("\n");
}
