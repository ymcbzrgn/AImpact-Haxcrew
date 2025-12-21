# PitchDrill - Technical Specification

> AI-Powered Pitch Simulation & VC Council

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 16 + pgvector (Self-hosted, KVKK uyumlu) |
| ORM | SQLAlchemy 2.0 (async) + Alembic |
| AI | Gemini 3 Pro/Flash + Gemini 2.5 Live API |
| Embeddings | Gemini text-embedding-004 (768-dim) |
| OCR | Tesseract (fallback only) |
| State | Zustand |
| UI | shadcn/ui + Tailwind |
| Font | Inter |
| File Storage | VPS disk (/data/uploads/) |
| Hosting | Vercel (FE) + Bulutova VPS (BE + DB) |

> 🇹🇷 **KVKK Uyumlu:** Tüm veriler Türkiye'deki VPS'te saklanır. 3rd party bağımlılığı yok.

---

## Color Palette (Light Mode Only)

```css
:root {
  --canvas: #FBF7F4;
  --accent-baseline: #A5683B;
  --accent-default: #74492A;
  --accent-subdued: rgba(116, 73, 42, 0.81);
  --neutral-default: #2D1C10;
  --neutral-subdued: rgba(45, 28, 16, 0.62);
}
```

**Tailwind Config:**
```js
// tailwind.config.js
colors: {
  canvas: '#FBF7F4',
  accent: {
    baseline: '#A5683B',
    DEFAULT: '#74492A',
    subdued: '#74492ACC',
  },
  neutral: {
    DEFAULT: '#2D1C10',
    subdued: '#2D1C109E',
  }
}
```

---

## Naming Conventions

### Frontend (TypeScript)

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PitchRoom.tsx` |
| Hooks | camelCase + use | `useSession.ts` |
| Utils | camelCase | `formatTime.ts` |
| Types/Interfaces | PascalCase | `SessionStatus` |
| Constants | SCREAMING_SNAKE | `MAX_PITCH_DURATION` |
| Variables | camelCase | `sessionId` |
| CSS Classes | kebab-case | `pitch-room-container` |

### Backend (Python)

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `deck_analyzer.py` |
| Functions | snake_case | `analyze_deck()` |
| Classes | PascalCase | `GeminiLiveService` |
| Constants | SCREAMING_SNAKE | `CHUNK_SIZE` |
| Variables | snake_case | `session_id` |

---

## Project Structure

```
pitchdrill/
├── apps/
│   ├── web/                      # Next.js
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── upload/
│   │   │   ├── session/[id]/
│   │   │   └── verdict/[id]/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn
│   │   │   ├── pitch-room.tsx
│   │   │   ├── council-view.tsx
│   │   │   ├── realtime-note.tsx
│   │   │   └── timer.tsx
│   │   ├── hooks/
│   │   ├── stores/               # Zustand
│   │   └── lib/
│   │
│   └── api/                      # FastAPI
│       ├── main.py
│       ├── routers/
│       │   ├── session.py
│       │   └── websocket.py
│       ├── services/
│       │   ├── gemini_live.py
│       │   ├── deck_analyzer.py
│       │   ├── ocr_service.py
│       │   ├── rag_pipeline.py
│       │   └── council.py
│       └── prompts/
│           ├── deck_analysis.py
│           ├── realtime_notes.py
│           └── council/
│
├── packages/
│   └── shared/
│
└── data/
    └── rag_documents/
```

---

## Import Ordering

```typescript
// 1. React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External
import { motion } from 'framer-motion'

// 3. Internal (absolute)
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/stores/session'

// 4. Local (relative)
import { formatTime } from './utils'

// 5. Types
import type { Session } from '@/types'
```

---

## API Response Format

**Success:**
```json
{
  "success": true,
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "DECK_TOO_LARGE",
    "message": "File size exceeds 50MB limit"
  }
}
```

---

## REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Create session |
| POST | `/api/session/{id}/upload` | Upload deck |
| GET | `/api/session/{id}` | Get session status |
| POST | `/api/session/{id}/start` | Start pitch |
| GET | `/api/session/{id}/verdict` | Get verdict |

---

## WebSocket Events

**Client → Server:**

| Event | Payload |
|-------|---------|
| `audio_chunk` | `{audio: base64, timestamp}` |
| `end_pitch` | `{}` |
| `answer_complete` | `{}` |

**Server → Client:**

| Event | Payload |
|-------|---------|
| `phase_change` | `{phase: 'pitch' \| 'qa' \| 'council'}` |
| `timer_update` | `{remaining_seconds, phase}` |
| `realtime_note` | `{note, type: 'tip' \| 'warning' \| 'positive'}` |
| `ai_speaking` | `{audio: base64, text, is_question}` |
| `council_message` | `{character, message, audio}` |
| `session_complete` | `{final_score, verdict_url}` |

---

## Database Schema (PostgreSQL + SQLAlchemy)

> 📍 Tüm tablolar Alembic migration ile yönetilir: `apps/api/alembic/`

### sessions

```python
# apps/api/models/session.py
class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    status: Mapped[str] = mapped_column(String(20), default="uploading")
    deck_path: Mapped[str] = mapped_column(Text, nullable=True)  # Local path
    deck_format: Mapped[str] = mapped_column(String(10), nullable=True)
    deck_analysis: Mapped[dict] = mapped_column(JSONB, nullable=True)
    slide_contents: Mapped[list] = mapped_column(JSONB, nullable=True)
    pitch_transcript: Mapped[str] = mapped_column(Text, nullable=True)
    qa_transcript: Mapped[list] = mapped_column(JSONB, nullable=True)
    realtime_notes: Mapped[list] = mapped_column(JSONB, nullable=True)
    council_dialog: Mapped[list] = mapped_column(JSONB, nullable=True)
    final_score: Mapped[int] = mapped_column(Integer, nullable=True)
    verdict: Mapped[dict] = mapped_column(JSONB, nullable=True)
    investor_mode: Mapped[str] = mapped_column(String(20), default="friendly")
    created_at: Mapped[datetime] = mapped_column(default=func.now())
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| status | VARCHAR(20) | `uploading \| processing \| ready \| pitching \| qa \| council \| completed` |
| deck_path | TEXT | Local file path (e.g., `/data/uploads/abc123.pdf`) |
| deck_format | VARCHAR(10) | `pdf \| pptx \| images` |
| deck_analysis | JSONB | Scores + summary |
| slide_contents | JSONB | `[{slide_number, content}]` |
| pitch_transcript | TEXT | |
| qa_transcript | JSONB | `[{q, a, timestamp}]` |
| realtime_notes | JSONB | `[{note, type, timestamp}]` |
| council_dialog | JSONB | `[{character, message, vote}]` |
| final_score | INTEGER | 0-100 |
| verdict | JSONB | `{decision, term_sheet?, feedback}` |
| investor_mode | VARCHAR(20) | `shark \| friendly \| analyst` |
| created_at | TIMESTAMP | |

### rag_documents

```python
# apps/api/models/rag_document.py
class RAGDocument(Base):
    __tablename__ = "rag_documents"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[Vector] = mapped_column(Vector(768))  # pgvector
    category: Mapped[str] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(Text)
    character: Mapped[str] = mapped_column(String(50), nullable=True)
```

| Column | Type |
|--------|------|
| id | UUID |
| content | TEXT |
| embedding | vector(768) | pgvector extension |
| category | VARCHAR(50) |
| source | TEXT |
| character | VARCHAR(50) (nullable) |

### pgvector Setup

```sql
-- VPS'te bir kez çalıştır
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## File Upload

**Supported Formats:**
- PDF
- PPTX / PPT
- PNG / JPG / JPEG

**Limits:**
- Max size: 50MB
- Max slides: 30

**Processing Flow:**
```
Upload
  │
  ├─ PPTX → python-pptx (direct text extraction)
  │
  ├─ PDF → PyMuPDF (text extraction)
  │         └─ Empty text? → Tesseract OCR (fallback)
  │
  └─ Images → Tesseract OCR
```

**Why Tesseract:**
- Lightweight (~30MB vs 1GB)
- Fast on CPU (1-2s/page)
- Native deck text covers 90% of cases
- OCR is fallback only

---

## RAG Categories

| Category | Description |
|----------|-------------|
| `pitch_structure` | Deck templates, slide ordering |
| `traction` | Metrics, cohort analysis |
| `market` | TAM/SAM/SOM, sizing |
| `team` | Founder evaluation |
| `financials` | Unit economics, runway |
| `qa_common` | Common VC questions |
| `turkey_specific` | Local ecosystem |

**Retrieval:** Eager loading at session start. Zero runtime latency.

---

## Council Characters

| Character | Role | Focus |
|-----------|------|-------|
| Sarah Chen | YC Partner | PMF, velocity |
| Marcus Thompson | a16z Analyst | Market, data |
| Elif Yılmaz | TR Angel | Founder, local |
| David Park | Tiger Global | Scale, unit eco |

---

## Git Workflow

**Branches:**
```
main (production)
└── dev
    ├── feat/upload-flow
    ├── feat/pitch-room
    └── fix/audio-sync
```

**Commit Format:**
```
feat: add pitch room timer
fix: audio sync issue  
docs: update README
refactor: extract audio utils
```

---

## Environment Variables

**Backend (.env):**
```
# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pitchdrill

# AI
GEMINI_API_KEY=

# Server
HOST=0.0.0.0
PORT=8000

# File Storage
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE=52428800
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

> **Not:** Supabase kaldırıldı. Tüm veri PostgreSQL'de, dosyalar VPS disk'te.

---

## AI Models (Gemini 3)

> 🚀 **En Güncel:** Gemini 3 ailesini kullanıyoruz - Google'ın en yeni modelleri!

| Model | Use Case | RPM | TPM |
|-------|----------|-----|-----|
| `gemini-3-pro-preview` | Deck Analysis, Council, Q&A | 25 | 1M |
| `gemini-3-flash-preview` | Realtime Notes, Quick responses | 1K | 1M |
| `gemini-3-pro-image-preview` | Slide image analysis | 20 | 100K |
| `gemini-2.5-flash` | Fallback (stable) | 1K | 1M |
| `gemini-2.5-flash-native-audio-dialog` | Live Audio (pitch session) | **∞** | 1M |
| `gemini-2.5-flash-preview-tts` | Text-to-Speech | 10 | 10K |
| `text-embedding-004` | RAG embeddings (768-dim) | - | - |

### Model Kullanımı

```python
# services/gemini_service.py

# Yüksek kalite (deck analysis, council)
await generate_text_pro(prompt, system_instruction)

# Hızlı (realtime notes)
await generate_text_flash(prompt, system_instruction)

# Görsel analiz (slide)
await analyze_image(image_data, prompt)

# Embedding (RAG)
await generate_embedding(text)  # → 768-dim vector
```

### Free Trial Credits

- **₺12,735.45** kredi mevcut
- Hackathon boyunca yeterli
- Rate limit'ler yüksek (1K RPM flash!)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Upload → Analysis | < 30s |
| WebSocket latency | < 100ms |
| Gemini Live response | < 500ms |
| Total session | ~7-8 min |

---

## Checklist Before PR

- [ ] No console.log / print statements
- [ ] Types defined (no `any`)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Conventional commit message
- [ ] Tested locally
