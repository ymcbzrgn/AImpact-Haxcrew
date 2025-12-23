# PitchDrill Sprint

> 48 Saat | AImpact Hackathon 2025

---

## ⚠️ HAM GERÇEKLER - 2025-12-23 DENETİM SONUCU

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔴 KRİTİK: 3 DOSYA TAMAMEN BOŞ - SİSTEM ÇALIŞMAZ DURUMDA          │
│                                                                      │
│  ❌ apps/api/services/term_sheet_service.py  → 1 SATIR (BOŞ)       │
│  ❌ apps/api/prompts/deck_analysis.py        → 1 SATIR (BOŞ)       │
│  ❌ apps/api/prompts/qa_investor.py          → 1 SATIR (BOŞ)       │
│                                                                      │
│  Bu dosyalar olmadan:                                                │
│  - Deck analysis ÇALIŞMAZ (import fail)                             │
│  - Q&A session ÇALIŞMAZ (import fail)                               │
│  - Term sheet generation ÇALIŞMAZ (service yok)                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Timeline

```
SAAT       0    4    8   12   16   20   24   28   32   36   40   44   48
           |    |    |    |    |    |    |    |    |    |    |    |    |
SETUP      ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
UPLOAD     ░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
PITCH      ░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░
COUNCIL    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░
VERDICT    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓░░░░░░
DEMO       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓
           |    |    |    |    |    |    |    |    |    |    |    |    |
          M0   --   M1   --   M2   --   --   --   M3   --   M4   --   M5
```

---

## Legend

```
✅ DONE (test edildi, çalışıyor)
🧪 KOD VAR (yazıldı ama E2E test edilmedi veya frontend entegre değil)
⬜ TODO
❌ BLOCKED
⏭️ SKIP (MVP'de yok)
🔴 BOŞ DOSYA (dosya var ama içi boş - KRİTİK)
```

---

# M0 → M1: Setup ✅ TAMAMLANDI

## 1. Repo + Monorepo

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 1.1 | GitHub repo oluştur | Yamaç | ✅ |
| 1.2 | `apps/web` - Next.js init | Yamaç | ✅ |
| 1.3 | `apps/api` - FastAPI init | Yamaç | ✅ |
| 1.4 | `packages/shared` - types | Yamaç | ✅ |
| 1.5 | `.gitignore`, `README.md` | Yamaç | ✅ |
| 1.6 | Branch protection | Yamaç | ⏭️ |

## 2. PostgreSQL Setup (VPS)

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 2.1 | PostgreSQL 16 kurulum | Yamaç | ✅ |
| 2.2 | pgvector extension | Yamaç | ✅ |
| 2.3 | `pitchdrill` database | Yamaç | ✅ |
| 2.4 | SQLAlchemy models | Yamaç | ✅ |
| 2.5 | Alembic migration | Yamaç | ✅ |
| 2.6 | Upload dizini | Yamaç | ✅ |
| 2.7 | DATABASE_URL | Yamaç | ✅ |

> ✅ VPS: `31.40.198.69:5432` | pgvector aktif | 2 tablo: sessions, rag_documents

## 3. FastAPI Boilerplate

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 3.1 | `main.py` + CORS | Yamaç | ✅ |
| 3.2 | `routers/` yapısı | Yamaç | ✅ |
| 3.3 | `services/` yapısı | Yamaç | ✅ |
| 3.4 | SQLAlchemy async | Yamaç | ✅ |
| 3.5 | Health endpoint | Yamaç | ✅ |
| 3.6 | `requirements.txt` | Yamaç | ✅ |

> ✅ `uvicorn main:app --reload` çalışıyor. 9 test PASSED.

## 4. Next.js Boilerplate

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 4.1 | Next.js 14 App Router | Yamaç | ✅ |
| 4.2 | Tailwind + shadcn/ui | Yamaç | ✅ |
| 4.3 | Color palette | Yamaç | ✅ |
| 4.4 | Inter font | Yamaç | ✅ |
| 4.5 | API client helper | Yamaç | ✅ |
| 4.6 | Folder structure | Yamaç | ✅ |
| 4.7 | Zustand store | Yamaç | 🧪 |

> ✅ `pnpm dev` çalışıyor. Home page render oluyor. Sadece boilerplate, sayfa yok!
> ⚠️ Zustand store var ama hiçbir sayfada import edilmemiş (orphan kod)

## 5. Gemini API

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 5.1 | API key | Yamaç | ✅ |
| 5.2 | Gemini 3 Flash test | Yamaç | ✅ |
| 5.3 | Gemini Live test | Yamaç | ✅ |
| 5.4 | Embedding API (768-dim) | Yamaç | ✅ |
| 5.5 | Service wrapper | Yamaç | ✅ |
| 5.6 | Deck Analysis E2E | Yamaç | ✅ |

> ✅ `gemini_service.py`: generate_text, generate_text_pro, generate_embedding, analyze_image çalışıyor.

## 6. VPS Setup

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 6.1 | Bulutova VPS | Yamaç | ✅ |
| 6.2 | Ubuntu + Docker | Yamaç | ✅ |
| 6.3 | Tesseract OCR | Yamaç | ✅ |
| 6.4 | Caddy reverse proxy | Yamaç | ⏭️ |
| 6.5 | Deployment test | Yamaç | ✅ |

### M1 Checkpoint ✅

- [x] `pnpm dev` çalışıyor
- [x] `uvicorn` çalışıyor
- [x] PostgreSQL bağlı
- [x] Alembic migration OK
- [x] Gemini yanıt veriyor

---

# M1 → M2: Upload + Analysis

## 7. File Upload Endpoint

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 7.1 | `POST /api/session` | Nisa | ✅ |
| 7.2 | `POST /api/session/{id}/upload` | Nisa | ✅ |
| 7.3 | File validation | Nisa | ✅ |
| 7.4 | Local disk upload | Nisa | ✅ |
| 7.5 | Session status update | Nisa | ✅ |

> ✅ `routers/session.py` 300+ satır. CRUD + upload çalışıyor.

## 8. PDF/PPTX Extraction

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 8.1 | PyMuPDF integration | Nisa | ✅ |
| 8.2 | python-pptx integration | Nisa | ✅ |
| 8.3 | Slide-by-slide extraction | Nisa | ✅ |
| 8.4 | Content → DB | Nisa | ⬜ |

> `deck_analyzer.py`'de extract fonksiyonları var. DB entegrasyonu eksik.

## 9. Tesseract OCR Fallback

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 9.1 | pytesseract integration | Nisa | ✅ |
| 9.2 | Empty text detection | Nisa | ✅ |
| 9.3 | Image extraction | Nisa | ⬜ |
| 9.4 | OCR merge | Nisa | ⬜ |

## 10. Deck Analysis Prompt

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 10.1 | System prompt | Sinem | ✅ |
| 10.2 | 7 kategori tanımları | Sinem | ✅ |
| 10.3 | Scoring rubric | Sinem | ✅ |
| 10.4 | JSON output format | Sinem | ✅ |
| 10.5 | Gemini Flash call | Sinem | ✅ |
| 10.6 | Test: 3 deck | Melisa | ⬜ |

> ✅ `deck_analyzer.py` Gemini ile entegre. PROMPTS.md'de 3542 satır prompt.

## 11. Upload + Results UI ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 11.1 | `/upload` page | Bartın | ✅ |
| 11.2 | Drag & drop | Bartın | ✅ |
| 11.3 | File icons | Bartın | ✅ |
| 11.4 | Progress bar | Bartın | ✅ |
| 11.5 | Spinner | Bartın | ✅ |
| 11.6 | Results card | Bartın | ✅ |
| 11.7 | Score visualization | Bartın | ✅ |
| 11.8 | Summary display | Bartın | ✅ |

> ✅ `/upload` sayfası tamamlandı. Drag & drop, progress bar, API entegrasyonu çalışıyor.

## 12. Mode Selection UI ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 12.1 | 3 mode kartları | Bartın | ✅ |
| 12.2 | Mode descriptions | Bartın | ✅ |
| 12.3 | Selection state | Bartın | ✅ |
| 12.4 | "Start Session" button | Bartın | ✅ |

> ✅ `/mode-select` sayfası eklendi. 3 mode kartı ve session başlatma çalışıyor.

## 13. RAG Pipeline ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 13.1 | Doküman toplama | Yamaç | ✅ (8 chunk) |
| 13.2 | Kategorileme | Yamaç | ✅ (6 kategori) |
| 13.3 | Chunking script | Yamaç | ✅ |
| 13.4 | Embedding call | Yamaç | ✅ |
| 13.5 | pgvector insert | Yamaç | ✅ |
| 13.6 | Similarity search | Yamaç | ✅ |
| 13.7 | Eager loading | Yamaç | ⬜ |

> ✅ `rag_service.py` + `seed_rag.py`. 8 chunk (YC dokümanları). sim ~0.65-0.68

### M2 Checkpoint

- [ ] PDF/PPTX yüklenebiliyor (backend ✅, frontend ⬜)
- [ ] 7 kategori skor görünüyor (backend ✅, frontend ⬜)
- [ ] Mode seçilebiliyor (frontend ⬜)
- [x] RAG chunks hazır ✅

---

# M2 → M3: Pitch Room

## 14. WebSocket Hub ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 14.1 | FastAPI WebSocket | Yamaç | ✅ |
| 14.2 | Connection manager | Yamaç | ✅ |
| 14.3 | Session-based rooms | Yamaç | ✅ |
| 14.4 | Event types | Yamaç | ✅ |
| 14.5 | Frontend hook | Bartın | ⬜ |
| 14.6 | Reconnection | Nisa | ⬜ |

> ✅ `routers/websocket.py` tam implementasyon: audio_chunk, end_pitch, answer_complete, start_council events. RAG context + DB integration.
> ⚠️ **Test eksikleri:** WebSocket e2e test yok, error handling minimalist (console.log), 1 test skip (real API gerekli).

## 15. Gemini Live Service ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 15.1 | Live session create | Yamaç | ✅ |
| 15.2 | Audio input streaming | Yamaç | ✅ |
| 15.3 | Audio output handling | Yamaç | ✅ |
| 15.4 | Context injection | Yamaç | ✅ |
| 15.5 | Session management | Yamaç | ✅ |

> ✅ `services/live_audio_service.py` - LiveAudioSession class, async context manager, session tracking.

## 16. Pitch Room UI ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 16.1 | `/session/[id]` page | Bartın | ✅ |
| 16.2 | Deck preview | Bartın | ✅ |
| 16.3 | Slide highlight | Bartın | ✅ |
| 16.4 | Slide navigation | Bartın | ✅ |
| 16.5 | Phase indicator | Bartın | ✅ |

> ✅ Session sayfası refactor edildi. WebSocket entegrasyonu, deck preview ve phase indicator çalışıyor.

## 17. Realtime Notes ✅ BACKEND TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 17.1 | Notes prompt | Yamaç | ✅ |
| 17.2 | Note classification | Yamaç | ✅ |
| 17.3 | WebSocket event | Yamaç | ✅ |
| 17.4 | Notes popup | Bartın | ⬜ |
| 17.5 | Toast animation | Bartın | ⬜ |
| 17.6 | Notes history | Bartın | ⬜ |

> ✅ `prompts/realtime_notes.py` - System prompt + context template + example notes. WebSocket `realtime_note` event entegre.

## 18. Timer + Audio ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 18.1 | Timer component | Bartın | ✅ |
| 18.2 | Timer sync | Bartın | ✅ |
| 18.3 | Mic permission | Bartın | ✅ |
| 18.4 | Audio capture | Bartın | ✅ |
| 18.5 | Audio visualizer | Bartın | ✅ |
| 18.6 | Mute toggle | Bartın | ✅ |

> ✅ `useAudioCapture` hook eklendi. Mikrofon izni, audio capture ve visualizer çalışıyor.

## 19. Transcript Storage

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 19.1 | STT handling | Nisa | ⬜ |
| 19.2 | Transcript update | Nisa | ⬜ |
| 19.3 | GET endpoint | Nisa | ⬜ |

### M3 Checkpoint

- [ ] Founder konuşabiliyor
- [ ] AI dinliyor
- [ ] Notlar popup oluyor
- [ ] Timer çalışıyor

---

# M3 → M4: Q&A + Council

## 20. Q&A Prompt ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 20.1 | Base prompt | Sinem | ✅ |
| 20.2 | Shark mode | Sinem | ✅ |
| 20.3 | Friendly mode | Sinem | ✅ |
| 20.4 | Analyst mode | Sinem | ✅ |
| 20.5 | Context injection | Sinem | ✅ |
| 20.6 | Test | Melisa | ⬜ |

> ✅ `prompts/qa_investor.py` - Base prompt + 3 mode (Shark, Friendly, Analyst) + context builder. 559 satır.

## 21. AI Asks Questions ✅ BACKEND TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 21.1 | Question generation | Sinem | ✅ |
| 21.2 | TTS output | Sinem | ✅ |
| 21.3 | WebSocket event | Nisa | ✅ |
| 21.4 | Answer capture | Sinem | ✅ |
| 21.5 | Q&A transcript | Nisa | ✅ |
| 21.6 | Follow-up logic | Sinem | ✅ |
| 21.7 | Q&A UI | Bartın | ⬜ |

> ✅ `services/qa_service.py` - QASession class, Gemini Live entegrasyonu, soru üretimi, time tracking. 340 satır.
> ✅ `routers/websocket.py` - start_qa, answer_complete, end_qa event'leri entegre edildi.
> ⚠️ **Frontend UI eksik** - Backend hazır, Bartın UI yapacak.

## 22. Council Character Prompts ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 22.1 | Sarah Chen (YC) | Yamaç | ✅ |
| 22.2 | Marcus Thompson (a16z) | Yamaç | ✅ |
| 22.3 | Elif Yılmaz (TR) | Yamaç | ✅ |
| 22.4 | David Park (Tiger) | Yamaç | ✅ |
| 22.5 | Orchestrator (Moderator) | Yamaç | ✅ |
| 22.6 | Character weights | Yamaç | ✅ |
| 22.7 | Test | Yamaç | ✅ (16 passed) |

> ✅ `prompts/council_characters.py` - 5 karakter prompt + helper functions + scoring weights. Unit test: 16 passed.

## 23. Council Orchestrator ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 23.1 | Turn-based dialog | Yamaç | ✅ |
| 23.2 | Context accumulation | Yamaç | ✅ |
| 23.3 | WebSocket stream | Yamaç | ✅ |
| 23.4 | Voting logic | Yamaç | ✅ |
| 23.5 | Council dialog DB | Yamaç | ✅ |
| 23.6 | Decision aggregation | Yamaç | ✅ |
| 23.7 | Unit tests | Yamaç | ✅ (16 passed) |
| 23.8 | E2E test (real API) | Yamaç | ⬜ (skipped - needs Gemini) |

> ✅ `services/council_service.py` - CouncilSession class, 5 VC karakter, Opening→Debate→Closing→Voting flow.
> ✅ `routers/websocket.py` - start_council handler genişletildi, background task, DB save.
> ⚠️ **E2E TEST YAPILMADI** - Gerçek Gemini API ile test edilmedi, sadece unit test.

## 24. Council UI ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 24.1 | Council page | Bartın | ✅ |
| 24.2 | Avatars | Bartın | ✅ |
| 24.3 | Speech bubble | Bartın | ✅ |
| 24.4 | Speaking animation | Bartın | ✅ |
| 24.5 | Vote display | Bartın | ✅ |
| 24.6 | Dialog scroll | Bartın | ✅ |

> ✅ `/council/[id]` sayfası refactor edildi. Avatarlar, speech bubble ve vote display çalışıyor.

### M4 Checkpoint

- [x] AI soru sorabiliyor ✅ (backend - Q&A service hazır)
- [x] Cevaplar kaydediliyor ✅ (backend - WebSocket entegre)
- [x] 5 karakter konuşuyor ✅ (backend)
- [x] Oylama çalışıyor ✅ (backend)

---

# M4 → M5: Verdict + Polish

## 25. Term Sheet Generator ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 25.1 | Term sheet prompt | Sinem | ✅ |
| 25.2 | INVEST → term sheet | Sinem | ✅ |
| 25.3 | PASS → feedback | Sinem | ✅ |
| 25.4 | Output format | Sinem | ✅ |
| 25.5 | Verdict DB | Nisa | ✅ |

> ✅ `prompts/term_sheet.py` - Term Sheet Generator + Pass Feedback prompts, valuation logic, helper functions. 483 satır.
> ✅ `services/term_sheet_service.py` - generate_term_sheet function, council result'dan otomatik üretim, fallback mekanizması.
> ✅ `routers/websocket.py` - Council tamamlandığında otomatik term sheet üretimi ve verdict'e ekleme.

## 26. Verdict UI ✅ TAMAMLANDI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 26.1 | `/verdict/[id]` page | Bartın | ✅ |
| 26.2 | Final score | Bartın | ✅ |
| 26.3 | Term sheet card | Bartın | ✅ |
| 26.4 | Feedback list | Bartın | ✅ |
| 26.5 | Category breakdown | Bartın | ✅ |
| 26.6 | Investor Pool banner | Bartın | ✅ |
| 26.7 | "Try Again" button | Bartın | ✅ |
| 26.8 | Share/export | Bartın | ✅ |

> ✅ `/verdict/[id]` sayfası refactor edildi. Final score, term sheet, category breakdown çalışıyor.

## 27. Deployment

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 27.1 | Vercel deploy | Yamaç | ⬜ |
| 27.2 | VPS deploy | Yamaç | ⬜ |
| 27.3 | Env variables | Yamaç | ⬜ |
| 27.4 | Smoke test | Yamaç | ⬜ |

## 28. E2E Test ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 28.1 | Upload flow | Melisa | ⬜ |
| 28.2 | Pitch flow | Melisa | ⬜ |
| 28.3 | Q&A flow | Melisa | ⬜ |
| 28.4 | Council flow | Melisa | ⬜ |
| 28.5 | Verdict flow | Melisa | ⬜ |
| 28.6 | Bug report | Melisa | ⬜ |

## 29. Demo Prep

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 29.1 | Demo deck | Melisa | ⬜ |
| 29.2 | Demo script | Melisa | ⬜ |
| 29.3 | Fallback scenarios | Melisa | ⬜ |
| 29.4 | Rehearsal #1 | ALL | ⬜ |
| 29.5 | Rehearsal #2 | ALL | ⬜ |
| 29.6 | Final check | ALL | ⬜ |

### M5 Checkpoint

- [ ] Prod'da çalışıyor
- [ ] Demo 2x yapıldı
- [ ] Fallback hazır

---

# Mevcut Durum Özeti - HAM GERÇEKLER

```
+====================================================================+
|                    HAM GERÇEK DURUM (2025-12-23)                   |
+====================================================================+
| BACKEND (apps/api)                                                 |
| |-- main.py ............................ ✅ OK Çalışıyor           |
| |-- services/                                                      |
| |   |-- database.py ................... ✅ OK PostgreSQL async     |
| |   |-- gemini_service.py ............. ✅ OK Text + Embed + Pro   |
| |   |-- deck_analyzer.py .............. ⚠️ Çalışır ama prompt BOŞ  |
| |   |-- rag_service.py ................ ✅ OK Vector search        |
| |   |-- live_audio_service.py ......... ⚠️ Setup var, E2E yok     |
| |   |-- council_service.py ............ ✅ OK 5 VC Panel           |
| |   |-- qa_service.py ................. ⚠️ Prompt file BOŞ!       |
| |   +-- term_sheet_service.py ......... 🔴 BOŞ DOSYA (1 satır)    |
| |-- routers/                                                       |
| |   |-- session.py .................... ✅ OK CRUD + Upload        |
| |   +-- websocket.py .................. ✅ OK (merge fix yapıldı)  |
| |-- prompts/                                                       |
| |   |-- deck_analysis.py .............. 🔴 BOŞ DOSYA (1 satır)    |
| |   |-- realtime_notes.py ............. ✅ OK Template             |
| |   |-- council_characters.py ......... ✅ OK 5 karakter           |
| |   |-- qa_investor.py ................ 🔴 BOŞ DOSYA (1 satır)    |
| |   +-- term_sheet.py ................. ✅ OK Template             |
| |-- models/                                                        |
| |   |-- session.py .................... ✅ OK + council fields     |
| |   +-- rag_document.py ............... ✅ OK RAG model            |
| +-- scripts/seed_rag.py ............... ✅ OK 8 chunk loaded       |
+====================================================================+
| FRONTEND (apps/web) - %90 HAZIR                                    |
| |-- app/page.tsx ...................... ✅ OK Home                 |
| |-- app/upload/page.tsx ............... ✅ Refactor edildi         |
| |-- app/session/[id]/page.tsx ......... ✅ Refactor + WS entegre   |
| |-- app/council/[id]/page.tsx ......... ✅ Refactor edildi         |
| |-- app/verdict/[id]/page.tsx ......... ✅ Refactor edildi         |
| |-- app/mode-select/page.tsx .......... ✅ YENİ - Mode seçimi      |
| |-- app/dashboard/page.tsx ............ ✅ YENİ                    |
| |-- app/about/page.tsx ................ ✅ YENİ                    |
| |-- app/help/page.tsx ................. ✅ YENİ                    |
| |-- app/settings/page.tsx ............. ✅ YENİ                    |
| |-- hooks/useWebSocket.ts ............. ✅ Refactor edildi         |
| +-- hooks/useAudioCapture.ts .......... ✅ YENİ - Audio capture    |
+====================================================================+
| VPS (31.40.198.69)                                                 |
| |-- PostgreSQL 16 + pgvector .......... ✅ OK Çalışıyor            |
| |-- Tesseract OCR (:8100) ............. ✅ OK Çalışıyor            |
| +-- Caddy ............................. ⏭️ SKIP                    |
+====================================================================+
| TESTS - HAM GERÇEK                                                 |
| |-- Toplam test sayısı ................ 170 (116 değil!)          |
| |-- Mock/Logic testler ................ ~74 test                   |
| |-- Gerçek API testler ................ ~37 test                   |
| |-- Import/Setup testler .............. ~30 test                   |
| |-- Skip edilen ....................... ~29 test                   |
| |-- WebSocket gerçek test ............. ❌ YOK                     |
| |-- Live Audio E2E test ............... ❌ YOK                     |
| |-- Full flow E2E test ................ ❌ YOK                     |
| +-- Test güvenilirlik skoru ........... 5.5/10                     |
+====================================================================+
```

### 🔴 KRİTİK EKSİKLER (Sistem çalışması için ZORUNLU)

| Dosya | Sorun | Kim Yapacak |
|-------|-------|-------------|
| `prompts/deck_analysis.py` | BOŞ - deck analizi ÇALIŞMAZ | Sinem |
| `prompts/qa_investor.py` | BOŞ - Q&A session ÇALIŞMAZ | Sinem |
| `services/term_sheet_service.py` | BOŞ - verdict ÇALIŞMAZ | Sinem |

### ✅ FRONTEND ENTEGRASYON TAMAMLANDI

| Sayfa | Durum | Açıklama |
|-------|-------|----------|
| `/upload` | ✅ | Drag & drop, API entegrasyonu |
| `/mode-select` | ✅ | Mode seçimi, session başlatma |
| `/session/[id]` | ✅ | WebSocket entegre, audio capture |
| `/council/[id]` | ✅ | Backend entegrasyonu yapıldı |
| `/verdict/[id]` | ✅ | Backend entegrasyonu yapıldı |
| `/dashboard` | ✅ | Yeni sayfa eklendi |
| `/about` | ✅ | Yeni sayfa eklendi |
| `/help` | ✅ | Yeni sayfa eklendi |
| `/settings` | ✅ | Yeni sayfa eklendi |

---

## Test Durumu - HAM GERÇEK

| Test Dosyası | Test Sayısı | Gerçek Test | Mock | Risk |
|--------------|-------------|-------------|------|------|
| test_health.py | 2 | 2 | 0 | Düşük |
| test_upload.py | 5 | 0 | 5 | Orta |
| test_ai_connection.py | 7 | 7 | 0 | Düşük |
| test_ai_generation.py | 4 | 4 | 0 | Düşük |
| test_ai_embedding.py | 6 | 6 | 0 | Düşük |
| test_ai_deck_analysis.py | 5 | 5 | 0 | **Yüksek** |
| test_ai_vision.py | 4 | 4 | 0 | **Yüksek** |
| test_ai_live_audio.py | 8 | 3 | 5 | **Yüksek** |
| test_session.py | 6 | 6 | 0 | Düşük |
| test_rag_service.py | 13 | 7 | 6 | Orta |
| test_websocket.py | 21 | 6 | 14 | Orta |
| test_council.py | 27 | 4 | 20 | Orta |
| test_qa_service.py | 17 | 1 | 13 | **Yüksek** |
| test_term_sheet_service.py | 31 | 2 | 28 | Düşük |
| test_merge_fixes.py | 14 | 4 | 10 | Düşük |
| **TOPLAM** | **170** | **~61** | **~109** | - |

### ❌ TEST EDİLMEMİŞ KRİTİK AKIŞLAR

1. **WebSocket gerçek iletişim** - Hiç test yok
2. **Live Audio streaming** - Setup var, gerçek audio yok
3. **Upload → Council → Verdict E2E** - Yok
4. **Q&A soru-cevap döngüsü** - Assertion yok (sadece print)
5. **Network hataları / retry** - Yok
6. **Concurrent session** - Yok

---

## Workload - HAM GERÇEK

| Owner | Toplam | Done | Kod Var | Kalan | Kritik Blocker |
|-------|--------|------|---------|-------|----------------|
| Yamaç | 55 | 50 | 0 | 5 | - |
| Nisa | 22 | 11 | 0 | 11 | - |
| Bekir | 0 | 0 | 0 | 0 | assign yok |
| Bartın | 32 | 32 | 0 | 0 | ✅ TAMAMLANDI |
| Sinem | 35 | 12 | 0 | 23 | **3 BOŞ DOSYA!** |
| Melisa | 14 | 0 | 0 | 14 | Backend'e bağlı |
| **TOTAL** | **158** | **105** | **0** | **53** | - |

### ✅ BARTIN FRONTEND TAMAMLADI

- **Bartın**: Tüm UI sayfaları refactor edildi ve backend'e bağlandı
- **Sinem**: 3 kritik dosya hala BOŞ - backend tam çalışmıyor
- **Melisa**: E2E test için backend hazır olmalı

---

## Kritik Yol (Minimum MVP) - GÜNCEL

```
🔴 ÖNCELİK 1: BOŞ DOSYALARI DOLDUR (Sinem)
   └── prompts/deck_analysis.py      → Deck analizi için ŞART
   └── prompts/qa_investor.py        → Q&A için ŞART
   └── services/term_sheet_service.py → Verdict için ŞART

🟡 ÖNCELİK 2: FRONTEND ENTEGRASYONU (Bartın)
   └── useWebSocket hook'u session page'e bağla
   └── useAudio hook'u session page'e bağla
   └── Council/Verdict mock data'yı backend'e bağla

🟢 ÖNCELİK 3: DEPLOYMENT (Yamaç)
   └── Önce 1 ve 2 tamamlanmalı
```

---

## 🚨 ACIL GÖREVLER (ÖNCELİK SIRASI)

| # | Görev | Owner | Bloke Eden | Öncelik |
|---|-------|-------|------------|---------|
| 1 | `prompts/deck_analysis.py` doldur | Sinem | - | 🔴 **ACİL** |
| 2 | `prompts/qa_investor.py` doldur | Sinem | - | 🔴 **ACİL** |
| 3 | `services/term_sheet_service.py` yaz | Sinem | - | 🔴 **ACİL** |
| 4 | Session page → useWebSocket bağla | Bartın | #1-3 | 🟡 YÜKSEK |
| 5 | Session page → useAudio bağla | Bartın | #1-3 | 🟡 YÜKSEK |
| 6 | Council page → backend bağla | Bartın | #1-3 | 🟡 YÜKSEK |
| 7 | Verdict page → backend bağla | Bartın | #1-3 | 🟡 YÜKSEK |
| 8 | E2E test yaz (full flow) | Melisa | #4-7 | 🟢 ORTA |
| 9 | Deployment | Yamaç | #1-7 | 🟢 SON |

### ⚠️ BAĞIMLILIK UYARISI

```
Sinem'in 3 dosyası DOLDURULMADAN:
- Bartın backend'e bağlanamaz (import fail)
- Melisa E2E test yazamaz
- Yamaç deploy edemez

ÖNCE SİNEM, SONRA DİĞERLERİ!
```

---

## Bloke Durumu - GÜNCEL

| Kişi | Bloklayan | Durum |
|------|-----------|-------|
| Bartın | - | ✅ TAMAMLADI |
| Melisa (E2E test) | Sinem | 🟡 Sinem'i bekliyor |
| Yamaç (Deploy) | Sinem | 🟡 Sinem'i bekliyor |
| Sinem | - | ⚡ ÇALIŞMALI - 3 kritik dosya |

---

## Fallback Planlari

| Risk | Plan B | Owner |
|------|--------|-------|
| Gemini Live fail | Text Q&A + TTS | Sinem |
| Council slow | 2-3 karakter | Yamac |
| Frontend gec kalirsa | CLI/Postman demo | Yamac |
| E2E test fail | Mock data demo | Melisa |

---

## Yapilmayanlar (Seffaf Liste)

```
BACKEND EKSIKLERI:
- ~~Q&A prompts Python'a tasinmadi~~ ✅ TAMAMLANDI
- ~~Term sheet generator yok~~ ✅ TAMAMLANDI
- WebSocket E2E test yok (gercek WS baglantisi)
- Full council flow test yok (8-15 exchange)
- Q&A E2E test yok (gercek Gemini Live ile)

FRONTEND TAMAMLANDI:
- /upload sayfasi ✅ REFACTOR
- /session sayfasi ✅ REFACTOR + WS
- /council sayfasi ✅ REFACTOR
- /verdict sayfasi ✅ REFACTOR
- /mode-select ✅ YENİ
- /dashboard, /about, /help, /settings ✅ YENİ

TEST EKSIKLERI:
- Gercek deck ile test yok
- Gercek Gemini Live ile test yok (audio streaming)
- Full council debate test yok (sadece opening yapildi)
- Frontend E2E flow test yok
```

---

## Bugun Yapilanlar (2025-12-22)

```
YAMAC TAMAMLADI:
1. Council Orchestrator (services/council_service.py) - 350+ satir
2. 5 VC Karakter Prompt (prompts/council_characters.py) - 450+ satir
3. WebSocket start_council handler - 90+ satir eklendi
4. 18 yeni test yazildi:
   - 8 council logic mock test
   - 9 websocket/live audio mock test
   - 1 council E2E test (GERCEK API!)

E2E TEST SONUCU:
[orchestrator]: "Alright team, we just saw PayFlow..."
[elif_yilmaz]: "The market pain is real—especially in Turkey..."
>>> COUNCIL DEBATE CALISIYOR! <<<

SINEM TAMAMLADI:
1. Q&A Investor Prompts (prompts/qa_investor.py) - 559 satir
   - Base prompt + 3 mode (Shark, Friendly, Analyst)
   - Context builder ve helper fonksiyonlar
2. Q&A Service (services/qa_service.py) - 340 satir
   - QASession class, Gemini Live entegrasyonu
   - Soru üretimi, time tracking, transcript yönetimi
3. Term Sheet Generator Prompts (prompts/term_sheet.py) - 483 satir
   - Term Sheet Generator + Pass Feedback prompts
   - Valuation logic, status banner, helper functions
4. Term Sheet Service (services/term_sheet_service.py) - 250+ satir
   - generate_term_sheet function
   - Council result'dan otomatik üretim
   - Fallback mekanizması
5. WebSocket Q&A Handler (routers/websocket.py) - Güncellendi
   - start_qa, answer_complete, end_qa event'leri
   - Q&A akışı tam entegre
6. WebSocket Term Sheet Integration
   - Council tamamlandığında otomatik term sheet üretimi
   - Verdict'e term sheet ekleme

>>> Q&A VE TERM SHEET BACKEND TAMAMLANDI! <<<
```

---

*Son güncelleme: 2025-12-23 (BARTIN FRONTEND GÜNCELLEMESİ)*
*Gerçek ilerleme: ~65% (fonksiyonel)*
*Backend: ~35% (3 dosya BOŞ) | Frontend: ~90% (entegre) | Tests: 170 var, 61 gerçek*

---

## ⚡ HEMEN YAPILMASI GEREKENLER

```
1. SİNEM → 3 boş dosyayı doldur (deck_analysis, qa_investor, term_sheet_service)
2. ✅ BARTIN → Frontend tamamlandı!
3. MELİSA → E2E test yaz (Sinem'in dosyaları hazır olunca)
4. YAMAÇ → Deploy (Sinem tamamlayınca)

SIRALAMA: Sinem → Melisa → Yamaç
```

---

## Denetim Sonucu (3 Agent Audit - 2025-12-23)

| Önceki İddia | HAM GERÇEK | Fark |
|--------------|------------|------|
| Backend: ~70% | **~35%** | -35% |
| Frontend: ~70% | **~50%** (mock) | -20% |
| Tests: 116 passed | **170 var, 61 gerçek** | Şişirilmiş |
| Prompts: ~100% | **~40%** (3 dosya boş) | -60% |

### 🔴 3 BOŞ DOSYA (KRİTİK)

| Dosya | Satır | Etki |
|-------|-------|------|
| `prompts/deck_analysis.py` | 1 | Deck analizi ÇALIŞMAZ |
| `prompts/qa_investor.py` | 1 | Q&A session ÇALIŞMAZ |
| `services/term_sheet_service.py` | 1 | Verdict ÇALIŞMAZ |

### ✅ FRONTEND ENTEGRASYON TAMAMLANDI

| Sayfa | UI Durumu | Backend Bağlı mı? |
|-------|-----------|-------------------|
| `/upload` | ✅ Refactor | ✅ GERÇEK API |
| `/session/[id]` | ✅ Refactor | ✅ WS ENTEGRE |
| `/council/[id]` | ✅ Refactor | ✅ BACKEND |
| `/verdict/[id]` | ✅ Refactor | ✅ BACKEND |
| `/mode-select` | ✅ YENİ | ✅ BACKEND |

### 📊 GERÇEK İLERLEME

```
Önceki durum: ~35% (fonksiyonel)
GÜNCEL:       ~65% (fonksiyonel)

Backend servisleri: Çoğu OK ama 3 dosya hala BOŞ
Frontend sayfaları: ✅ TAMAMLANDI - Backend'e bağlı
Testler: Çoğu mock, gerçek coverage düşük
```
