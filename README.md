# Análise Textual TCC

Projeto de TCC para comparação de documentos textuais, com backend em FastAPI, frontend em React e persistência opcional com Supabase.

## Objetivo

O sistema compara dois documentos e gera uma análise textual com foco em similaridade de conteúdo, estrutura e vocabulário.

## Funcionalidades atuais

- Upload de arquivos `.txt`, `.pdf` e `.docx`
- Extração e pré-processamento do conteúdo textual
- Cálculo de métricas de similaridade
- Comparação por sentenças e por parágrafos
- Identificação de termos em comum e destaques automáticos
- Exportação dos resultados em `JSON`, `TXT` e `PDF`
- Dashboard de métricas no frontend
- Histórico local no navegador
- Autenticação e histórico persistente com Supabase

## Estrutura do projeto

```text
analise-textual-tcc/
  backend/
    app/
      api/
      core/
      schemas/
      services/
    tests/
    .env.example
    requirements.txt
    requirements-dev.txt
  frontend/
    src/
      components/
      features/
      lib/
      test/
    .env.example
    package.json
    package-lock.json
    vite.config.js
  docs/
    arquitetura-tecnica.md
  requirements.txt
```

## Como executar

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Documentação interativa:

- `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Se o PowerShell bloquear `npm`, use:

```bash
cmd /c npm install
cmd /c npm run dev
```

Aplicação local:

- `http://127.0.0.1:5173`

## Endpoints principais

- `GET /api/v1/health`
- `POST /api/v1/compare`
- `POST /api/v1/compare/report?format=json`
- `POST /api/v1/compare/report?format=txt`
- `POST /api/v1/compare/report?format=pdf`

## Configuração do Supabase

O projeto já está preparado para:

- autenticação com email e senha
- histórico persistente de comparações
- isolamento de dados por usuário com RLS

### Passos

1. Crie um projeto no Supabase.
2. Execute o SQL de `supabase/schema.sql` no SQL Editor.
3. Copie `frontend/.env.example` para `frontend/.env`.
4. Preencha as variáveis:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

5. Reinicie o frontend.

## Testes

### Backend

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests -q
```

### Frontend

```bash
cd frontend
npm run test
```

## Publicação no Git

- O repositório já está preparado para ignorar ambientes virtuais, `node_modules`, `dist`, logs e arquivos temporários.
- O arquivo [`requirements.txt`](./requirements.txt) na raiz aponta para as dependências do backend.
- O `package-lock.json` do frontend deve permanecer versionado.
