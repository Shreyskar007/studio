# MeetFlow - PRD

## Problem Statement
Build a full-stack app that takes meeting transcripts (.vtt / .txt / raw text), processes them with a BART ML model, and returns:
- Meeting Summary
- Action Items (assignee, assigner, action, due date)
- Key Decisions
Export to CSV and PDF. Dark modern UI. Deploy on free hosting.

## Architecture
- **Frontend**: React CRA → deploy to Netlify/Vercel
- **Backend**: FastAPI → deploy to Render.com (free tier)
- **ML Model**: `knkarthick/MEETING-SUMMARY-BART-LARGE-XSUM-SAMSUM-DIALOGSUM` via HuggingFace Inference API (free, no install needed)
- **Storage**: MongoDB (optional logging of results)

## Core Requirements (Static)
- Accept .vtt, .txt, or pasted raw text
- Clean VTT format (strip timestamps, metadata, speaker tags)
- Chunk long transcripts (400-word chunks)
- Summarize using BART via HuggingFace Inference API
- Extract action items using multi-pattern regex
- Extract key decisions from summary
- Export results as CSV or PDF
- Dark modern UI (Performance Pro theme - Deep Obsidian #020817 + Vivid Indigo #6366f1)

## What's Been Implemented (Feb 2026)

### Backend (`/app/backend/server.py`)
- FastAPI with CORS
- `GET /api/health` - health check + HF config status
- `POST /api/process` - full pipeline: clean → chunk → summarize → extract
- VTT cleaner (`clean_webvtt`) - removes timestamps, UUIDs, speaker tags
- Text chunker (400-word chunks, async parallel summarization)
- HuggingFace Inference API client with retry logic (3 attempts, 503 handling for cold starts)
- Multi-pattern action item extractor:
  - Pattern 1: "X asks Y to Z"
  - Pattern 2: "X will/should/needs to Z"
  - Pattern 3: "X is responsible for Z"
- Due date extractor (today, tomorrow, end of week, coming weekday, etc.)
- Key decisions extractor (keyword-based sentence filtering)
- MongoDB logging (non-blocking)
- Fallback: if HF fails, uses first 200 words as summary

### Frontend (`/app/frontend/src/App.js`)
- Dark modern UI - Performance Pro theme
- Upload File tab (drag-and-drop zone, .vtt / .txt)
- Paste Text tab (textarea)
- Custom instructions input
- Generate Minutes button with progress bar animation
- Results section:
  - Summary card with copy button
  - Action Items table (Assignee, Assigner, Action, Due Date)
  - Key Decisions list
- Export CSV (native Blob download)
- Export PDF (jsPDF + jspdf-autotable v5)
- Error handling, loading skeletons, clear button

## User Persona
Business professionals, project managers, team leads who have meeting recordings/transcripts and want automated action item extraction.

## Prioritized Backlog

### P0 (Critical - blocks usage)
- [ ] Configure HuggingFace API token (user must provide from hf.co)

### P1 (High value)
- [ ] Improve action item extraction accuracy with better NLP patterns
- [ ] Add support for .srt files
- [ ] History page - save past transcripts to MongoDB and view them

### P2 (Nice to have)
- [ ] Auth/login for personal history
- [ ] Batch processing (multiple files)
- [ ] Email results

## Deployment Guide
### Render.com (Backend)
1. Push backend to GitHub
2. Create new Web Service on render.com (free tier)
3. Set `HF_API_TOKEN` env var
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Netlify (Frontend)
1. Build: `yarn build` in /app/frontend
2. Deploy `build/` folder to Netlify
3. Set env var `REACT_APP_BACKEND_URL` to your Render.com URL

## Env Variables
- Backend: `HF_API_TOKEN` (free HuggingFace account → Settings → Access Tokens)
- Backend: `MONGO_URL`, `DB_NAME`
- Frontend: `REACT_APP_BACKEND_URL`
