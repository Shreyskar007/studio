import os
import re
import httpx
import asyncio
from datetime import date, timedelta, datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from annotated_types import Gt
from typing import Annotated

load_dotenv()

app = FastAPI(title="MeetFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
HF_MODEL_URL = "https://api-inference.huggingface.co/models/knkarthick/MEETING-SUMMARY-BART-LARGE-XSUM-SAMSUM-DIALOGSUM"

# MongoDB client
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ─────────────────────── Models ───────────────────────

class TranscriptRequest(BaseModel):
    content: str
    input_type: str  # "vtt", "txt", "text"
    custom_instructions: Optional[str] = ""

class ActionItem(BaseModel):
    assignee: str
    assigner: str
    action: str
    due_date: str

class ProcessResult(BaseModel):
    summary: str
    action_items: List[ActionItem]
    key_decisions: List[str]

# ─────────────────────── VTT Cleaner ───────────────────────

def clean_webvtt(content: str) -> str:
    """Clean VTT subtitle content to plain text."""
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    # Remove WEBVTT header
    if lines and lines[0].upper() == "WEBVTT":
        lines = lines[1:]
    # Remove numeric cue identifiers
    lines = [l for l in lines if not l.isdigit()]
    # Remove UUID-style identifiers
    pattern = r'[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\/\d+-\d'
    lines = [l for l in lines if not re.match(pattern, l)]
    # Remove timestamp lines
    pattern = r"^\d{2}:\d{2}:\d{2}[.,]\d{3}.*\d{2}:\d{2}:\d{2}[.,]\d{3}$"
    lines = [l for l in lines if not re.match(pattern, l)]
    # Remove <v Speaker> tags but keep content
    lines = [re.sub(r'<v\s[^>]*>', '', l) for l in lines]
    lines = [re.sub(r'</v>', '', l) for l in lines]
    text = " ".join(lines)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    # Fix punctuation spacing
    text = re.sub(r"([.!?])(\w)", r"\1 \2", text)
    return text.strip()

# ─────────────────────── Chunking ───────────────────────

def chunk_text(text: str, max_words: int = 400) -> List[str]:
    """Split text into chunks by word count."""
    words = text.split()
    if len(words) <= max_words:
        return [text]
    chunks = []
    for i in range(0, len(words), max_words):
        chunk = " ".join(words[i:i + max_words])
        chunks.append(chunk)
    return chunks

# ─────────────────────── HuggingFace API ───────────────────────

async def summarize_with_hf(text: str, retries: int = 3) -> str:
    """Call HuggingFace Inference API for BART summarization."""
    headers = {}
    if HF_API_TOKEN and HF_API_TOKEN != "your_huggingface_token_here":
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"

    payload = {
        "inputs": text,
        "parameters": {
            "max_length": 500,
            "min_length": 50,
            "early_stopping": True
        },
        "options": {"wait_for_model": True}
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        for attempt in range(retries):
            try:
                response = await client.post(HF_MODEL_URL, json=payload, headers=headers)
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and result:
                        return result[0].get("summary_text", "")
                    return ""
                elif response.status_code == 503:
                    # Model loading - wait and retry
                    await asyncio.sleep(10)
                    continue
                else:
                    print(f"HF API error {response.status_code}: {response.text}")
                    return ""
            except Exception as e:
                print(f"HF API attempt {attempt+1} failed: {e}")
                if attempt < retries - 1:
                    await asyncio.sleep(5)
    return ""

async def summarize_full_transcript(text: str) -> str:
    """Summarize a full transcript by chunking and combining."""
    chunks = chunk_text(text, max_words=400)
    if len(chunks) == 1:
        return await summarize_with_hf(text)

    # Summarize chunks in parallel
    tasks = [summarize_with_hf(chunk) for chunk in chunks]
    chunk_summaries = await asyncio.gather(*tasks)
    combined = " ".join(s for s in chunk_summaries if s)

    # If combined summary is too long, summarize again
    if len(combined.split()) > 400:
        return await summarize_with_hf(combined)
    return combined

# ─────────────────────── Action Item Extraction ───────────────────────

def extract_due_date(text: str) -> str:
    """Extract due date from text, returning ISO format string."""
    today = date.today()
    text_lower = text.lower()

    if "today" in text_lower or "end of day" in text_lower or "eod" in text_lower:
        return today.strftime("%Y-%m-%d")
    if "tomorrow" in text_lower:
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")
    if "day after tomorrow" in text_lower:
        return (today + timedelta(days=2)).strftime("%Y-%m-%d")
    if "end of week" in text_lower or "eow" in text_lower:
        days_ahead = 4 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    if "next week" in text_lower:
        return (today + timedelta(days=7)).strftime("%Y-%m-%d")

    # Look for "coming <weekday>"
    coming_match = re.search(r"coming\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", text_lower)
    if coming_match:
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        target = weekdays.index(coming_match.group(1))
        days_ahead = (target - today.weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        return (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

    # Default: 3 days from today
    return (today + timedelta(days=3)).strftime("%Y-%m-%d")

def extract_action_items(summary: str, original_text: str = "") -> List[ActionItem]:
    """Extract action items using multiple patterns on summary and original text."""
    items = []
    seen = set()
    
    combined = f"{summary} {original_text}"
    sentences = re.split(r'(?<=[.!?])\s+', combined)

    # Pattern 1: "X asks Y to Z" (original pattern)
    p1 = re.compile(r"(.+?)\s+asks?\s+(.+?)\s+to\s+(.+?)(?:\.|$)", re.IGNORECASE)
    # Pattern 2: "X will/should/needs to Z"
    p2 = re.compile(r"([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+(?:will|should|needs? to|is going to|must)\s+(.+?)(?:\.|$)", re.IGNORECASE)
    # Pattern 3: "X is responsible for Z"
    p3 = re.compile(r"([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+is responsible for\s+(.+?)(?:\.|$)", re.IGNORECASE)
    # Pattern 4: "Action items?: X to Z" or "X: complete Z"
    p4 = re.compile(r"([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+(?:to|:)\s+(.+?)(?:\.|$)", re.IGNORECASE)

    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 10:
            continue

        # Pattern 1
        for m in p1.finditer(sentence):
            assigner = m.group(1).strip()
            assignee = m.group(2).strip()
            action = m.group(3).strip()
            key = f"{assignee}:{action[:30]}"
            if key not in seen and len(action) > 5:
                seen.add(key)
                items.append(ActionItem(
                    assignee=assignee,
                    assigner=assigner,
                    action=action,
                    due_date=extract_due_date(action)
                ))

        # Pattern 2
        for m in p2.finditer(sentence):
            assignee = m.group(1).strip()
            action = m.group(2).strip()
            key = f"{assignee}:{action[:30]}"
            if key not in seen and len(action) > 5:
                seen.add(key)
                items.append(ActionItem(
                    assignee=assignee,
                    assigner="Meeting",
                    action=action,
                    due_date=extract_due_date(sentence)
                ))

    return items[:20]  # Limit to 20 action items

def extract_key_decisions(summary: str) -> List[str]:
    """Extract key decisions from summary text."""
    decisions = []
    sentences = re.split(r'(?<=[.!?])\s+', summary)

    decision_keywords = [
        r'\bdecided?\b', r'\bagreed?\b', r'\bapproved?\b', r'\bchose?\b',
        r'\bselected?\b', r'\bwill\b', r'\bshall\b', r'\bgoing to\b',
        r'\bcommitted?\b', r'\bconfirmed?\b', r'\bconcluded?\b',
        r'\brecommend\b', r'\bplanned?\b'
    ]
    pattern = re.compile('|'.join(decision_keywords), re.IGNORECASE)

    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 20 and pattern.search(sentence):
            decisions.append(sentence)

    # If no decisions found with keywords, use first few sentences of summary
    if not decisions and summary:
        all_sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', summary) if len(s.strip()) > 20]
        decisions = all_sentences[:5]

    return decisions[:10]

# ─────────────────────── API Endpoints ───────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "hf_configured": bool(HF_API_TOKEN and HF_API_TOKEN != "your_huggingface_token_here")}

@app.post("/api/process", response_model=ProcessResult)
async def process_transcript(request: TranscriptRequest):
    """Process meeting transcript: clean → summarize → extract action items & decisions."""
    if not request.content or not request.content.strip():
        raise HTTPException(status_code=400, detail="Transcript content is required")

    # Step 1: Clean input
    if request.input_type == "vtt":
        clean_text = clean_webvtt(request.content)
    else:
        clean_text = request.content.strip()

    if not clean_text:
        raise HTTPException(status_code=400, detail="No text found after cleaning")

    # Step 2: Summarize using BART model
    summary = await summarize_full_transcript(clean_text)

    # Fallback: if HF fails, use first portion of clean text as summary
    if not summary:
        words = clean_text.split()
        summary = " ".join(words[:200]) + ("..." if len(words) > 200 else "")

    # Step 3: Extract action items
    action_items = extract_action_items(summary, clean_text)

    # Step 4: Extract key decisions
    key_decisions = extract_key_decisions(summary)

    # Optional: store in MongoDB
    try:
        await db.transcripts.insert_one({
            "input_type": request.input_type,
            "summary": summary,
            "action_items": [item.dict() for item in action_items],
            "key_decisions": key_decisions,
            "created_at": datetime.now(timezone.utc)
        })
    except Exception:
        pass  # Non-blocking

    return ProcessResult(
        summary=summary,
        action_items=action_items,
        key_decisions=key_decisions
    )
