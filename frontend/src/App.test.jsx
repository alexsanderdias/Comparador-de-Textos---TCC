import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./lib/supabase", () => ({
  getCurrentSession: vi.fn(async () => null),
  isSupabaseConfigured: false,
  subscribeToAuthChanges: vi.fn(() => () => {}),
  supabase: null,
}));

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = "";
    window.scrollTo = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        project: "Análise Textual TCC",
      }),
    });
  });

  it("renderiza o título principal e o status do backend", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /Comparador textual com dashboard, histórico e autenticação/i,
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Backend online: Análise Textual TCC/i)).toBeInTheDocument();
    });
  });

  it("mostra erro quando o usuário tenta comparar sem selecionar arquivos", async () => {
    render(<App />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /Nova comparação/i,
      })[0],
    );

    fireEvent.click(screen.getByRole("button", { name: /Comparar documentos/i }));

    expect(
      await screen.findByText(/Selecione os dois arquivos antes de comparar\./i),
    ).toBeInTheDocument();
  });
});
