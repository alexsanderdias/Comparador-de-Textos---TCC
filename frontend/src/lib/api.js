export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const BACKEND_HINT_URL = import.meta.env.VITE_API_HINT_URL || "http://127.0.0.1:8000";
export const BACKEND_UNAVAILABLE_MESSAGE = (
  `Backend indisponível. Verifique se a API está rodando em ${BACKEND_HINT_URL}.`
);

export function apiPath(path) {
  return `${API_BASE_URL}${path}`;
}

function parseJsonSafely(rawText) {
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function buildApiErrorMessage({ status, rawText, fallbackMessage }) {
  const payload = parseJsonSafely(rawText);

  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  const normalizedText = (rawText || "").toLowerCase();

  if (status >= 500) {
    const looksLikeProxyFailure = (
      !normalizedText
      || normalizedText.includes("proxy")
      || normalizedText.includes("econnrefused")
      || normalizedText.includes("socket hang up")
      || normalizedText.includes("failed to connect")
      || normalizedText.includes("127.0.0.1:8000")
    );

    if (looksLikeProxyFailure) {
      return BACKEND_UNAVAILABLE_MESSAGE;
    }

    return "O backend encontrou um erro interno ao processar a solicitação.";
  }

  return fallbackMessage;
}

export async function extractApiErrorMessage(response, fallbackMessage) {
  const rawText = await response.text();
  return buildApiErrorMessage({
    status: response.status,
    rawText,
    fallbackMessage,
  });
}

export function compareDocuments(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", apiPath("/api/v1/compare"));

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      const payload = parseJsonSafely(request.responseText);

      if (request.status >= 200 && request.status < 300) {
        if (payload && typeof payload === "object") {
          resolve(payload);
          return;
        }

        reject(new Error("Resposta inválida do backend."));
        return;
      }

      reject(new Error(buildApiErrorMessage({
        status: request.status,
        rawText: request.responseText,
        fallbackMessage: "Não foi possível concluir a comparação.",
      })));
    };

    request.onerror = () => {
      reject(new Error(BACKEND_UNAVAILABLE_MESSAGE));
    };

    request.onabort = () => {
      reject(new Error("A solicitação foi interrompida antes da resposta."));
    };

    request.send(formData);
  });
}

export async function requestBackendReport({ fileA, fileB, title, format }) {
  const formData = new FormData();
  formData.append("file_a", fileA);
  formData.append("file_b", fileB);
  if (title?.trim()) {
    formData.append("title", title.trim());
  }

  const response = await fetch(apiPath(`/api/v1/compare/report?format=${format}`), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(
      response,
      "Não foi possível exportar o relatório.",
    ));
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename=\"([^\"]+)\"/i);
  const filename = filenameMatch?.[1] ?? `comparacao.${format}`;

  return {
    blob,
    filename,
  };
}
