# MeetFlow — PRD (Updated Feb 2026)

## Problem Statement
Build a full-stack meeting transcript processor using the user's own BART ML model.
Input: .vtt, .txt, or pasted raw text. Output: Meeting Summary + Action Items (Assignee, Assigner, Action, Due Date) + Key Decisions. Export to CSV and PDF. Dark modern UI. Deploy on free hosting.

## Architecture
- **Frontend**: React CRA at /app/frontend → deploy Netlify/Vercel
- **Backend**: FastAPI at /app/backend → deploy Render.com (needs ≥2GB RAM for BART)
- **ML Model**: `knkarthick/MEETING-SUMMARY-BART-LARGE-XSUM-SAMSUM-DIALOGSUM` — loaded LOCALLY at FastAPI startup via transformers pipeline (no external API calls)
- **Storage**: MongoDB (optional result logging)

## Key Decisions Made
- Model runs **locally** in FastAPI (not via HuggingFace Inference API), as per user request
- Model loaded **once at startup** via FastAPI `lifespan` context — not per-request (10-15x speed improvement)
- All processing **in-memory** — no temp disk writes
- Original logic preserved, adapted to FastAPI + JSON response

## What's Been Implemented (Feb 2026 — updated)

### Session 3 additions
- **History Page** (`/api/history` GET/DELETE + frontend HistoryPage + HistoryCard components)
  - Lists past transcripts newest-first, TEXT/VTT badge, timestamp, word count, processing time
  - Expand/collapse per card to show full Summary, Action Items table, Key Decisions
  - Per-card CSV + PDF export
  - Delete button with confirmation
  - Back navigation to Process page
- **Processing Time Estimate** (TimeEstimateBadge + smart progress bar)
  - Formula: `chunks = ceil(words/400)`, `estimated_s = chunks * 12 + 3`
  - Badge shows below input field as soon as text is present (amber "Estimated: ~Xs · Y words")
  - Progress bar now ticks proportionally to estimated time
  - Progress message shows estimate while processing
  - ExportBar shows actual processing_time_s after completion
- **`/api/process` response** now includes `processing_time_s` and `word_count`

### Backend (`/app/backend/server.py`)
- FastAPI with CORS, lifespan startup
- BART model loaded once globally (`_summarizer`) at startup
- `GET /api/health` — returns model load status
- `POST /api/process` — full pipeline:
  1. Clean VTT (strip ALL XML tags with `<[^>]+>`, timestamps, UUIDs)
  2. Extract speaker names from `<v ...>` tags
  3. NLTK word_tokenize → 500-token chunks
  4. Sequential BART summarization (dynamic max_length per chunk)
  5. Final re-summarization if combined summary > 500 words
  6. Multi-pattern action item extraction:
     - P1: "X asks Y to Z" (original)
     - P2: "X will/should/needs to/must Z" (new)
     - P3: "X is responsible for Z" (new)
  7. Dedup by normalized first-15-char key
  8. Due date extraction (today/tomorrow/EOW/next week/coming weekday)
  9. Key decisions via keyword filter on summary sentences
  10. MongoDB logging (non-blocking)

### Frontend (`/app/frontend/src/App.js`)
- Dark "Performance Pro" theme (Deep Obsidian #020817 + Vivid Indigo #6366f1)
- Upload File tab (drag-and-drop, .vtt/.txt)
- Paste Text tab (textarea)
- Custom instructions input
- Generate Minutes button + animated progress bar
- Results: Summary card (with copy), Action Items table, Key Decisions list
- Export CSV (Blob download) + Export PDF (jsPDF + autotable v5)
- Error handling, loading skeletons, clear button

## Optimizations Applied vs Original API
| # | Original Issue | Fix Applied |
|---|---------------|-------------|
| 1 | Model reloaded per chunk (~10-15x slower) | Load once at startup via FastAPI lifespan |
| 2 | ThreadPoolExecutor loaded model per thread | Single model instance, sequential chunks |
| 3 | Hardcoded Windows paths | Removed all file I/O, process in memory |
| 4 | 4-5 disk writes per request | Pure in-memory pipeline |
| 5 | `http.server` (single-threaded, no CORS) | FastAPI with async + CORS middleware |
| 6 | Only returned action items (no summary) | Returns summary + action_items + key_decisions |
| 7 | Single action item pattern | 3 patterns for better coverage |
| 8 | Plain text response | Structured JSON |
| 9 | VTT tags not fully stripped | `<[^>]+>` strips all XML tags |
| 10 | Duplicate action items | Normalized 15-char dedup key |

## Test Results (iteration_2)
- Backend: 6/6 tests pass (100%)
- Frontend: 100% pass
- Real BART inference confirmed (~5-15s per request on CPU)

## Deployment Guide
### Render.com (Backend — needs ≥2GB RAM tier)
1. Push /app/backend to GitHub
2. Create Web Service on render.com (Standard tier for 2GB RAM)
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. First deploy downloads BART model (~1.6GB) — may take 5-10 min

### Netlify (Frontend — free tier)
1. Build: `REACT_APP_BACKEND_URL=<render-url> yarn build`
2. Deploy `build/` folder to Netlify
3. Set env var `REACT_APP_BACKEND_URL` to Render.com backend URL

## Environment Variables
- Backend: `MONGO_URL`, `DB_NAME` (from Emergent)
- Frontend: `REACT_APP_BACKEND_URL`

## Prioritized Backlog
### P1
- [ ] History page — view past transcript results from MongoDB
- [ ] Improve key decisions extraction coverage
- [ ] Support .srt subtitle format

### P2
- [ ] Auth for personal history
- [ ] Batch upload (multiple files)
- [ ] Email results
