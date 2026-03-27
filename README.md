# Comparador de Textos - TCC

Sistema desenvolvido para o Trabalho de Conclusão de Curso com foco em comparação de documentos textuais, cálculo de similaridade e geração de relatórios.

## Visão geral

O projeto recebe dois documentos, extrai o conteúdo textual e produz uma análise com base em vocabulário, estrutura e proximidade semântica. A aplicação foi organizada para separar claramente interface, processamento e visualização dos resultados.

## Principais funcionalidades

- Upload de arquivos `.txt`, `.pdf` e `.docx`
- Pré-processamento e normalização do texto
- Cálculo de métricas de similaridade textual
- Comparação por sentenças e por parágrafos
- Identificação de termos em comum e trechos relacionados
- Exportação dos resultados em `JSON`, `TXT` e `PDF`
- Dashboard de métricas no frontend
- Histórico local no navegador

## Tecnologias utilizadas

- Backend: FastAPI
- Frontend: React + Vite
- Processamento textual: scikit-learn
- Leitura de arquivos: PyPDF2 e python-docx

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

## Como executar localmente

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Swagger:

- `http://127.0.0.1:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Se o PowerShell bloquear `npm`:

```bash
cmd /c npm install
cmd /c npm run dev
```

Aplicação:

- `http://127.0.0.1:5173`

## Endpoints principais

- `GET /api/v1/health`
- `POST /api/v1/compare`
- `POST /api/v1/compare/report?format=json`
- `POST /api/v1/compare/report?format=txt`
- `POST /api/v1/compare/report?format=pdf`

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

## Documentação

- Arquitetura técnica: [`docs/arquitetura-tecnica.md`](./docs/arquitetura-tecnica.md)

## Publicação no Git

- O repositório ignora ambientes virtuais, `node_modules`, `dist`, logs e arquivos temporários.
- O [`requirements.txt`](./requirements.txt) da raiz aponta para o backend.
- O `package-lock.json` do frontend permanece versionado para reprodutibilidade.
