# ResearchLens — redesigned frontend

A React + Vite frontend prototype for a research-paper workspace.

## Requirements
- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Included frontend interactions
- Responsive sidebar with its own vertical scrolling; the Personal section and sidebar footer remain reachable on short screens.
- Mobile navigation drawer with backdrop and Escape-key close.
- Page navigation between Overview, Discover papers, My library, Paper analysis, Compare papers, Knowledge graph, Saved papers and Settings.
- Search and topic filtering over the included demo-paper collection.
- Save/remove papers, with the saved list persisted in this browser using local storage.
- CSV export of saved paper metadata.
- Side-by-side metadata comparison for up to three selected papers.
- Knowledge graph from title and author metadata returned by the PDF upload API.
- Demo paper Q&A interaction in the analysis view.
- PDF upload, text extraction, and Gemini analysis through the local FastAPI backend.
- Backend reproducibility checklist and reporting-completeness result for uploaded PDFs.
- Browser-local saved uploaded papers and analysis history, with reopen and delete controls.
- Recharts publication-year and topic charts labelled as sample data; method and dataset charts show empty states when metadata is absent.

## Important prototype limitations
This ZIP is a frontend prototype, not a connected production research platform. PDF extraction and Gemini analysis require the local FastAPI backend to be running. The frontend displays the structured `analysis` response, backend reproducibility checklist, and backend reporting-completeness result. Completeness measures reporting, not guaranteed reproducibility. Related-paper recommendations are unavailable because the API provides no related-paper records. The knowledge graph links only title and author values returned in PDF metadata; methods, datasets, and citations are not inferred. Real academic search, Supabase authentication/database and cloud persistence are not configured.

Saved papers and analysis history are stored only in the current browser. Clearing browser site data will clear them. Large PDFs or analysis responses can exceed browser localStorage capacity.

## PDF analysis integration
The Paper analysis page uploads a PDF to `http://127.0.0.1:8000/api/pdf/upload` using multipart field `file`. It sends the returned `full_text` and `pages` (`page_number`, `text`) to `http://127.0.0.1:8000/api/analysis/` as JSON fields `paper_text` and `pages`. The analysis endpoint returns `{ "message": "...", "analysis": { ... } }`; checklist items and `reporting_completeness` are in `analysis`. Start the FastAPI backend locally before using this flow; the backend must allow CORS requests from `http://localhost:5173`.
