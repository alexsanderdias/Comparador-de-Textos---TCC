import { startTransition, useEffect, useState } from "react";

import { AuthPanel } from "./features/auth/AuthPanel";
import { ComparisonForm } from "./features/comparison/ComparisonForm";
import { DashboardPanel } from "./features/dashboard/DashboardPanel";
import { MetricsGuidePanel } from "./features/guide/MetricsGuidePanel";
import { HeroSection } from "./features/health/HeroSection";
import { HistoryPanel } from "./features/history/HistoryPanel";
import { PageHub, PageToolbar } from "./features/navigation/PageNavigation";
import { ResultPanel } from "./features/results/ResultPanel";
import {
  apiPath,
  BACKEND_UNAVAILABLE_MESSAGE,
  compareDocuments,
  extractApiErrorMessage,
  requestBackendReport,
} from "./lib/api";
import { HISTORY_LIMIT, initialAuthForm, initialHealth } from "./lib/constants";
import { buildTextExport, downloadBlob, slugify } from "./lib/formatters";
import {
  buildHistoryEntry,
  buildHistorySummary,
  buildHistoryTrend,
  loadHistory,
  mapSupabaseRowToHistoryEntry,
  saveHistory,
} from "./lib/history";
import { buildMetricEntries } from "./lib/metrics";
import {
  getCurrentSession,
  isSupabaseConfigured,
  subscribeToAuthChanges,
  supabase,
} from "./lib/supabase";

const PAGE_IDS = new Set(["home", "auth", "compare", "dashboard", "history", "results", "guide"]);

function readPageFromHash(hash) {
  const normalized = hash.replace(/^#\/?/, "").trim().toLowerCase();
  return PAGE_IDS.has(normalized) ? normalized : "home";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => readPageFromHash(window.location.hash));
  const [title, setTitle] = useState("");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [health, setHealth] = useState(initialHealth);
  const [localHistory, setLocalHistory] = useState([]);
  const [remoteHistory, setRemoteHistory] = useState([]);
  const [historyView, setHistoryView] = useState("local");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authMode, setAuthMode] = useState("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [session, setSession] = useState(null);
  const [persistMessage, setPersistMessage] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");

  const displayedHistory = historyView === "supabase" ? remoteHistory : localHistory;
  const historySummary = buildHistorySummary(displayedHistory);
  const historyTrend = buildHistoryTrend(displayedHistory);
  const metricEntries = buildMetricEntries(result);
  const navigationItems = [
    {
      id: "auth",
      eyebrow: "Conta",
      title: "Autenticação",
      description: "Entrar, criar conta e conectar o histórico persistente.",
      meta: session?.user ? "Conectado" : isSupabaseConfigured ? "Disponível" : "Opcional",
      tone: "cool",
    },
    {
      id: "compare",
      eyebrow: "Fluxo",
      title: "Nova comparação",
      description: "Enviar os documentos e iniciar uma análise textual.",
      meta: "TXT, PDF, DOCX",
      tone: "accent",
    },
    {
      id: "dashboard",
      eyebrow: "Painel",
      title: "Dashboard",
      description: "Acompanhar volume, média e evolução das comparações.",
      meta: `${historySummary.total} registros`,
      tone: "neutral",
    },
    {
      id: "history",
      eyebrow: "Arquivo",
      title: "Histórico",
      description: "Reabrir comparações salvas no navegador ou no Supabase.",
      meta: historyView === "supabase" ? "Persistente" : "Local",
      tone: "warm",
    },
    {
      id: "results",
      eyebrow: "Relatório",
      title: "Resultado",
      description: "Visualizar métricas, trechos e exportações do último processamento.",
      meta: result ? result.classification : "Aguardando",
      tone: "cool",
    },
    {
      id: "guide",
      eyebrow: "Leitura",
      title: "Guia de métricas",
      description: "Entender como cada indicador deve ser interpretado no sistema.",
      meta: "8 sinais",
      tone: "accent",
    },
  ];

  useEffect(() => {
    function handleHashChange() {
      setCurrentPage(readPageFromHash(window.location.hash));
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigateTo(page) {
    const nextPage = PAGE_IDS.has(page) ? page : "home";
    const nextHash = nextPage === "home" ? "#/" : `#/${nextPage}`;
    setCurrentPage(nextPage);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Empty on purpose for environments without scroll support.
    }
  }

  async function checkHealth() {
    setHealth(initialHealth);

    try {
      const response = await fetch(apiPath("/api/v1/health"));
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(
          response,
          BACKEND_UNAVAILABLE_MESSAGE,
        ));
      }

      const data = await response.json();
      setHealth({
        loading: false,
        ok: true,
        message: `Backend online: ${data.project}`,
      });
    } catch (requestError) {
      setHealth({
        loading: false,
        ok: false,
        message: requestError.message || BACKEND_UNAVAILABLE_MESSAGE,
      });
    }
  }

  function updateLocalHistory(nextHistory) {
    const normalized = nextHistory.slice(0, HISTORY_LIMIT);
    setLocalHistory(normalized);
    saveHistory(normalized);
  }

  async function loadRemoteHistory(userId) {
    if (!supabase) {
      return;
    }

    setHistoryLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from("comparison_runs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT);

      if (queryError) {
        throw queryError;
      }

      startTransition(() => {
        setRemoteHistory((data ?? []).map(mapSupabaseRowToHistoryEntry));
      });
    } catch (requestError) {
      setPersistMessage(
        `Não foi possível ler o histórico do Supabase: ${requestError.message}`,
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function persistComparison(resultPayload, userId) {
    if (!supabase) {
      return;
    }

    const { data, error: insertError } = await supabase
      .from("comparison_runs")
      .insert({
        user_id: userId,
        title: resultPayload.title,
        created_at: resultPayload.created_at,
        classification: resultPayload.classification,
        correlation_index: resultPayload.correlation_index,
        summary: resultPayload.summary,
        metrics: resultPayload.metrics,
        shared_terms: resultPayload.shared_terms,
        matching_excerpts: resultPayload.matching_excerpts,
        matching_paragraphs: resultPayload.matching_paragraphs,
        highlights: resultPayload.highlights,
        document_a: resultPayload.document_a,
        document_b: resultPayload.document_b,
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    if (data) {
      setRemoteHistory((currentHistory) => [
        mapSupabaseRowToHistoryEntry(data),
        ...currentHistory,
      ].slice(0, HISTORY_LIMIT));
    }
  }

  useEffect(() => {
    checkHealth();
    setLocalHistory(loadHistory());

    if (!isSupabaseConfigured) {
      return undefined;
    }

    let unsubscribe = () => {};

    async function hydrateSupabaseSession() {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        if (currentSession?.user) {
          setHistoryView("supabase");
          await loadRemoteHistory(currentSession.user.id);
        }
      } catch (sessionError) {
        setAuthMessage(`Falha ao recuperar sessão: ${sessionError.message}`);
      }

      unsubscribe = subscribeToAuthChanges((nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          setHistoryView("supabase");
          loadRemoteHistory(nextSession.user.id);
          return;
        }

        setRemoteHistory([]);
        setHistoryView("local");
      });
    }

    hydrateSupabaseSession();
    return () => unsubscribe();
  }, []);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setAuthMessage(
        "Configure o Supabase no .env do frontend para habilitar autenticação.",
      );
      return;
    }

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthMessage("Preencha email e senha para continuar.");
      return;
    }

    try {
      setAuthBusy(true);
      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
        });
        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          setSession(data.session);
          setHistoryView("supabase");
          setAuthMessage("Conta criada e autenticada com sucesso.");
        } else {
          setAuthMessage(
            "Conta criada. Se a confirmação por email estiver ativa, finalize pelo link enviado.",
          );
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authForm.email.trim(),
          password: authForm.password,
        });
        if (signInError) {
          throw signInError;
        }

        setSession(data.session);
        setHistoryView("supabase");
        setAuthMessage("Login realizado com sucesso.");
      }

      setAuthForm(initialAuthForm);
    } catch (requestError) {
      setAuthMessage(requestError.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    try {
      setAuthBusy(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }

      setSession(null);
      setHistoryView("local");
      setAuthMessage("Sessão encerrada.");
    } catch (requestError) {
      setAuthMessage(requestError.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPersistMessage("");
    setExportFeedback("");
    setResult(null);
    setProgress(0);

    if (!fileA || !fileB) {
      setError("Selecione os dois arquivos antes de comparar.");
      return;
    }

    const formData = new FormData();
    formData.append("file_a", fileA);
    formData.append("file_b", fileB);
    if (title.trim()) {
      formData.append("title", title.trim());
    }

    try {
      setSubmitting(true);
      const data = await compareDocuments(formData, setProgress);
      setResult(data);

      updateLocalHistory([buildHistoryEntry(data), ...localHistory]);
      navigateTo("results");

      if (session?.user && supabase) {
        await persistComparison(data, session.user.id);
        setPersistMessage("Comparação salva no Supabase e no histórico local.");
      } else {
        setPersistMessage("Comparação salva apenas no histórico local do navegador.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportJson() {
    if (!result) {
      return;
    }

    setExportFeedback("");
    downloadBlob(
      JSON.stringify(result, null, 2),
      `${slugify(result.title || "comparacao")}.json`,
      "application/json",
    );
  }

  function handleExportText() {
    if (!result) {
      return;
    }

    setExportFeedback("");
    downloadBlob(
      buildTextExport(result),
      `${slugify(result.title || "comparacao")}.txt`,
      "text/plain;charset=utf-8",
    );
  }

  async function handleExportPdf() {
    if (!result) {
      return;
    }

    if (!fileA || !fileB) {
      setExportFeedback(
        "Para gerar o PDF pelo backend, selecione novamente os arquivos atuais.",
      );
      return;
    }

    try {
      setExportFeedback("Gerando PDF...");
      const { blob, filename } = await requestBackendReport({
        fileA,
        fileB,
        title: result.title,
        format: "pdf",
      });
      downloadBlob(blob, filename, "application/pdf");
      setExportFeedback("PDF gerado com sucesso.");
    } catch (requestError) {
      setExportFeedback(requestError.message);
    }
  }

  function restoreHistoryEntry(entry) {
    startTransition(() => {
      setResult(entry.result);
      setTitle(entry.result.title);
      setError("");
      setExportFeedback("");
    });
    navigateTo("results");
  }

  function startNewComparison() {
    setError("");
    setExportFeedback("");
    setPersistMessage("");
    navigateTo("compare");
  }

  function renderPageContent() {
    if (currentPage === "home") {
      return <PageHub items={navigationItems} onNavigate={navigateTo} />;
    }

    if (currentPage === "auth") {
      return (
        <div className="page-grid page-grid--single">
          <AuthPanel
            session={session}
            authBusy={authBusy}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            setAuthForm={setAuthForm}
            authMessage={authMessage}
            isSupabaseConfigured={isSupabaseConfigured}
            onSubmit={handleAuthSubmit}
            onSignOut={handleSignOut}
          />
        </div>
      );
    }

    if (currentPage === "compare") {
      return (
        <div className="page-grid page-grid--single">
          <ComparisonForm
            title={title}
            setTitle={setTitle}
            fileA={fileA}
            fileB={fileB}
            dragTarget={dragTarget}
            setDragTarget={setDragTarget}
            setFileA={setFileA}
            setFileB={setFileB}
            submitting={submitting}
            progress={progress}
            error={error}
            persistMessage={persistMessage}
            onSubmit={handleSubmit}
          />
        </div>
      );
    }

    if (currentPage === "dashboard") {
      return (
        <div className="page-grid page-grid--single">
          <DashboardPanel
            historyView={historyView}
            historySummary={historySummary}
            historyTrend={historyTrend}
            metricEntries={metricEntries}
            result={result}
          />
        </div>
      );
    }

    if (currentPage === "history") {
      return (
        <div className="page-grid page-grid--split">
          <HistoryPanel
            session={session}
            historyView={historyView}
            setHistoryView={setHistoryView}
            historyLoading={historyLoading}
            displayedHistory={displayedHistory}
            onRestoreEntry={restoreHistoryEntry}
            onClearLocalHistory={() => updateLocalHistory([])}
          />
          <MetricsGuidePanel />
        </div>
      );
    }

    if (currentPage === "guide") {
      return (
        <div className="page-grid page-grid--single">
          <MetricsGuidePanel />
        </div>
      );
    }

    return (
      <div className="page-grid page-grid--single">
        <ResultPanel
          result={result}
          exportFeedback={exportFeedback}
          onExportJson={handleExportJson}
          onExportText={handleExportText}
          onExportPdf={handleExportPdf}
          onStartNewComparison={startNewComparison}
          onOpenDashboard={() => navigateTo("dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="ambient ambient--top" />
      <div className="ambient ambient--side" />
      <main className="layout">
        <HeroSection
          health={health}
          isSupabaseConfigured={isSupabaseConfigured}
          onRefreshHealth={checkHealth}
          historyTotal={historySummary.total}
        />
        {currentPage === "home" ? null : (
          <PageToolbar currentPage={currentPage} items={navigationItems} onNavigate={navigateTo} />
        )}
        {renderPageContent()}
      </main>
    </div>
  );
}
