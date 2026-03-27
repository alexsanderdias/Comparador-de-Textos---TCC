export const HISTORY_STORAGE_KEY = "analise-textual-tcc-history-v3";
export const HISTORY_LIMIT = 12;

export const initialHealth = {
  loading: true,
  ok: false,
  message: "Verificando backend...",
};

export const METRIC_META = {
  correlation_index: {
    label: "Correlação geral",
    description: "Índice consolidado com base nas demais métricas.",
    tone: "accent",
  },
  cosine_score: {
    label: "Similaridade cosseno",
    description: "Observa a proximidade global do vocabulário e do contexto.",
    tone: "warm",
  },
  jaccard_score: {
    label: "Jaccard",
    description: "Mede a interseção entre os conjuntos de termos dos textos.",
    tone: "cool",
  },
  overlap_score: {
    label: "Sobreposição de termos",
    description: "Mostra quanto o menor vocabulário está coberto pelo maior.",
    tone: "neutral",
  },
  keyword_density_match: {
    label: "Densidade de palavras-chave",
    description: "Compara a frequência relativa dos termos compartilhados.",
    tone: "warm",
  },
  sentence_alignment_score: {
    label: "Alinhamento por sentenças",
    description: "Estima o quanto os trechos se aproximam na estrutura textual.",
    tone: "cool",
  },
  paragraph_alignment_score: {
    label: "Alinhamento por parágrafos",
    description: "Mostra proximidade entre blocos mais longos do texto.",
    tone: "accent",
  },
  length_balance_score: {
    label: "Equilíbrio de tamanho",
    description: "Avalia o quanto os documentos têm extensões parecidas.",
    tone: "neutral",
  },
};
