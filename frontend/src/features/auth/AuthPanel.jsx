export function AuthPanel({
  session,
  authBusy,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authMessage,
  isSupabaseConfigured,
  onSubmit,
  onSignOut,
}) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>Autenticação</h2>
          <p className="panel__lede">Acesso opcional para salvar comparações fora do navegador.</p>
        </div>
        <span className="support-label">{session?.user ? "conectado" : "opcional"}</span>
      </div>
      {session?.user ? (
        <div className="auth-card">
          <p className="muted-text">
            Sessão ativa com <strong>{session.user.email}</strong>.
          </p>
          <button
            className="ghost-button"
            type="button"
            onClick={onSignOut}
            disabled={authBusy}
          >
            {authBusy ? "Saindo..." : "Encerrar sessão"}
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="tab-row">
            <button
              className={`tab-chip ${authMode === "signin" ? "tab-chip--active" : ""}`}
              type="button"
              onClick={() => setAuthMode("signin")}
            >
              Entrar
            </button>
            <button
              className={`tab-chip ${authMode === "signup" ? "tab-chip--active" : ""}`}
              type="button"
              onClick={() => setAuthMode("signup")}
            >
              Criar conta
            </button>
          </div>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="voce@exemplo.com"
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Mínimo de 6 caracteres"
            />
          </label>
          <button className="primary-button" type="submit" disabled={authBusy}>
            {authBusy ? "Processando..." : authMode === "signup" ? "Criar conta" : "Entrar"}
          </button>
        </form>
      )}
      {authMessage ? <p className="feedback feedback--info">{authMessage}</p> : null}
      {!isSupabaseConfigured ? (
        <p className="muted-text">
          Preencha <code>VITE_SUPABASE_URL</code> e{" "}
          <code>VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code> para ativar
          autenticação e histórico persistente.
        </p>
      ) : null}
    </section>
  );
}
