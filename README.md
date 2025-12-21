# PitchDrill

AI-Powered Pitch Simulation & VC Council

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pnpm

### Setup

1. Clone and install dependencies
```bash
git clone <repo-url>
cd pitchdrill
pnpm install
```

2. Setup Frontend
```bash
cd apps/web
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Setup Backend
```bash
cd apps/api
cp .env.example .env
# Edit .env with your credentials
source venv/bin/activate
```

4. Run Development
```bash
# Terminal 1 - Frontend
pnpm dev:web

# Terminal 2 - Backend
pnpm dev:api
```

## Project Structure

```
pitchdrill/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # FastAPI backend
├── packages/
│   └── shared/       # Shared types
└── data/
    └── rag_documents/
```

## Tech Stack

- **Frontend:** Next.js 14, Tailwind, shadcn/ui, Zustand
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0, Alembic
- **Database:** PostgreSQL 16 + pgvector (Self-hosted, KVKK uyumlu 🇹🇷)
- **AI:** Gemini 2.5 Flash + Gemini Live

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session` | Create session |
| POST | `/api/session/{id}/upload` | Upload deck |
| GET | `/api/session/{id}` | Get session status |
| POST | `/api/session/{id}/start` | Start pitch |
| GET | `/api/session/{id}/verdict` | Get verdict |
| WS | `/ws/{id}` | WebSocket connection |

## Documentation

- [Technical Spec](./TECHNICAL.md)
- [Sprint Plan](./SPRINT.md)
- [AI Protocol](./AI_PROTOCOL.md)
