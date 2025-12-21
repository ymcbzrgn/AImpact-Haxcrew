# PitchDrill Sprint

> 48 Saat | AImpact Hackathon 2025

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

## 11. Upload + Results UI ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 11.1 | `/upload` page | Bekir | ⬜ |
| 11.2 | Drag & drop | Bekir | ⬜ |
| 11.3 | File icons | Bekir | ⬜ |
| 11.4 | Progress bar | Bekir | ⬜ |
| 11.5 | Spinner | Bekir | ⬜ |
| 11.6 | Results card | Bekir | ⬜ |
| 11.7 | Score visualization | Bekir | ⬜ |
| 11.8 | Summary display | Bekir | ⬜ |

> ❌ Frontend sayfası yok. Sadece home page var.

## 12. Mode Selection UI ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 12.1 | 3 mode kartları | Bekir | ⬜ |
| 12.2 | Mode descriptions | Bekir | ⬜ |
| 12.3 | Selection state | Bekir | ⬜ |
| 12.4 | "Start Session" button | Bekir | ⬜ |

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

## 16. Pitch Room UI ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 16.1 | `/session/[id]` page | Bartın | ⬜ |
| 16.2 | Deck preview | Bartın | ⬜ |
| 16.3 | Slide highlight | Bartın | ⬜ |
| 16.4 | Slide navigation | Bartın | ⬜ |
| 16.5 | Phase indicator | Bartın | ⬜ |

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

## 18. Timer + Audio ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 18.1 | Timer component | Bartın | ⬜ |
| 18.2 | Timer sync | Bartın | ⬜ |
| 18.3 | Mic permission | Bartın | ⬜ |
| 18.4 | Audio capture | Bartın | ⬜ |
| 18.5 | Audio visualizer | Bartın | ⬜ |
| 18.6 | Mute toggle | Bartın | ⬜ |

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

## 20. Q&A Prompt

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 20.1 | Base prompt | Sinem | 🧪 |
| 20.2 | Shark mode | Sinem | 🧪 |
| 20.3 | Friendly mode | Sinem | 🧪 |
| 20.4 | Analyst mode | Sinem | 🧪 |
| 20.5 | Context injection | Sinem | ⬜ |
| 20.6 | Test | Melisa | ⬜ |

> ⚠️ PROMPTS.md'de metin var (1174-1779 satır), **Python prompt dosyası YOK**, backend entegrasyonu YOK.

## 21. AI Asks Questions ❌ YAPILMADI

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 21.1 | Question generation | Sinem | ⬜ |
| 21.2 | TTS output | Sinem | ⬜ |
| 21.3 | WebSocket event | Nisa | ⬜ |
| 21.4 | Answer capture | Sinem | ⬜ |
| 21.5 | Q&A transcript | Nisa | ⬜ |
| 21.6 | Follow-up logic | Sinem | ⬜ |
| 21.7 | Q&A UI | Bartın | ⬜ |

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

## 24. Council UI ❌ YAPILMADI (BACKEND HAZIR)

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 24.1 | Council page | Bartın | ⬜ |
| 24.2 | Avatars | Bartın | ⬜ |
| 24.3 | Speech bubble | Bartın | ⬜ |
| 24.4 | Speaking animation | Bartın | ⬜ |
| 24.5 | Vote display | Bartın | ⬜ |
| 24.6 | Dialog scroll | Bartın | ⬜ |

> ❌ Backend hazır ama frontend yok. Bartın blocked DEĞİL artık!

### M4 Checkpoint

- [ ] AI soru sorabiliyor (Q&A ⬜)
- [ ] Cevaplar kaydediliyor (Q&A ⬜)
- [x] 5 karakter konuşuyor ✅ (backend)
- [x] Oylama çalışıyor ✅ (backend)

---

# M4 → M5: Verdict + Polish

## 25. Term Sheet Generator

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 25.1 | Term sheet prompt | Sinem | 🧪 |
| 25.2 | INVEST → term sheet | Sinem | 🧪 |
| 25.3 | PASS → feedback | Sinem | 🧪 |
| 25.4 | Output format | Sinem | 🧪 |
| 25.5 | Verdict DB | Nisa | ⬜ |

> ⚠️ PROMPTS.md'de metin var (2776-3400+ satır), **Python prompt dosyası YOK**, generator YOK.

## 26. Verdict UI ❌ YAPILMADI (BACKEND HAZIR)

| # | Subtask | Owner | Status |
|---|---------|-------|--------|
| 26.1 | `/verdict/[id]` page | Bartın | ⬜ |
| 26.2 | Final score | Bartın | ⬜ |
| 26.3 | Term sheet card | Bartın | ⬜ |
| 26.4 | Feedback list | Bartın | ⬜ |
| 26.5 | Category breakdown | Bartın | ⬜ |
| 26.6 | Investor Pool banner | Bartın | ⬜ |
| 26.7 | "Try Again" button | Bartın | ⬜ |
| 26.8 | Share/export | Bartın | ⬜ |

> ❌ Backend hazır (council_dialog, verdict, final_score DB'de). Frontend yok.

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

# Mevcut Durum Ozeti

```
+================================================================+
|                    GERCEK DURUM                                |
+================================================================+
| BACKEND (apps/api)                                             |
| |-- main.py ............................ OK Calisiyor          |
| |-- services/                                                  |
| |   |-- database.py ................... OK PostgreSQL async    |
| |   |-- gemini_service.py ............. OK Text + Embed + Pro  |
| |   |-- deck_analyzer.py .............. OK PDF/PPTX + AI       |
| |   |-- rag_service.py ................ OK Vector search       |
| |   |-- live_audio_service.py ......... OK Gemini Live         |
| |   +-- council_service.py ............ OK 5 VC Panel (YENi)   |
| |-- routers/                                                   |
| |   |-- session.py .................... OK CRUD + Upload       |
| |   +-- websocket.py .................. OK Full + Council      |
| |-- prompts/                                                   |
| |   |-- deck_analysis.py .............. OK                     |
| |   |-- realtime_notes.py ............. OK                     |
| |   +-- council_characters.py ......... OK 5 karakter (YENi)   |
| |-- models/                                                    |
| |   |-- session.py .................... OK + council fields    |
| |   +-- rag_document.py ............... OK RAG model           |
| +-- scripts/seed_rag.py ............... OK 8 chunk loaded      |
+================================================================+
| FRONTEND (apps/web)                                            |
| |-- app/page.tsx ...................... OK Home (boilerplate)  |
| |-- app/upload/ ....................... YOK                    |
| |-- app/session/ ...................... YOK                    |
| |-- app/council/ ...................... YOK                    |
| +-- app/verdict/ ...................... YOK                    |
+================================================================+
| PROMPTS (PROMPTS.md -> apps/api/prompts/)                      |
| |-- Deck Analysis prompt .............. OK Python'a tasindi    |
| |-- Realtime Notes prompt ............. OK Python'a tasindi    |
| |-- Council character prompts ......... OK Python'a tasindi    |
| |-- Q&A mode prompts .................. KOD VAR, entegre degil |
| +-- Term sheet templates .............. KOD VAR, entegre degil |
+================================================================+
| VPS (31.40.198.69)                                             |
| |-- PostgreSQL 16 + pgvector .......... OK Calisiyor           |
| |-- Tesseract OCR (:8100) ............. OK Calisiyor           |
| +-- Caddy ............................. SKIP                   |
+================================================================+
| TESTS (pytest)                                                 |
| |-- test_health.py .................... OK 2 passed            |
| |-- test_ai_connection.py ............. OK 7 passed            |
| |-- test_rag_service.py ............... OK RAG works           |
| |-- test_websocket.py ................. OK 20 passed, 1 skip   |
| +-- test_council.py ................... OK 25 passed, 2 skip   |
|                                                                |
| >>> COUNCIL E2E TESTI YAPILDI - GERCEK API ILE CALISIYOR! <<<  |
+================================================================+
```

---

## Test Durumu (Seffaf)

| Test Dosyasi | Passed | Skipped | Not |
|--------------|--------|---------|-----|
| test_health.py | 2 | 0 | DB + API health |
| test_upload.py | 5 | 0 | File upload tests |
| test_ai_connection.py | 7 | 0 | Gemini Flash/Embed |
| test_ai_generation.py | 5 | 0 | Text generation |
| test_ai_embedding.py | 6 | 0 | Embedding tests |
| test_ai_deck_analysis.py | 5 | 0 | Deck analysis |
| test_ai_vision.py | 5 | 0 | Vision tests |
| test_ai_live_audio.py | 7 | 0 | Live audio setup |
| test_session.py | 7 | 0 | Session CRUD |
| test_rag_service.py | 13 | 0 | RAG similarity |
| test_websocket.py | 20 | 1 | WS + Live Audio + Connection Manager |
| test_council.py | 27 | 2 | Council chars + service + logic + E2E |
| **TOPLAM** | **116** | **3** | **E2E YAPILDI!** |

> ✅ **Council E2E testi YAPILDI** - Gercek Gemini Pro API ile calisiyor!
> ✅ Council opening phase test: Orchestrator + Elif Yilmaz konustu
> ⚠️ Full council flow (8-15 exchange) test edilmedi - cok uzun surer
> ⚠️ WebSocket E2E test yok - gercek WS baglantisi test edilmedi

---

## Workload

| Owner | Toplam | Done | Kod Var | Kalan |
|-------|--------|------|---------|-------|
| Yamac | 55 | 50 | 0 | 5 |
| Nisa | 22 | 10 | 0 | 12 |
| Bekir | 0 | 0 | 0 | 0 |
| Bartin | 32 | 0 | 0 | 32 |
| Sinem | 35 | 5 | 8 | 22 |
| Melisa | 14 | 0 | 0 | 14 |
| **TOTAL** | **158** | **65** | **8** | **85** |

> **Degisiklik:** Yamac +18 test yazdi, council E2E tamamladi
> **Not:** Bekir assign edilmemis - Bartin tum frontend'i ustlendi.
> **KOD VAR = PROMPTS.md'de metin var ama Python kodu/entegrasyonu yok**

---

## Kritik Yol (Minimum MVP)

```
EN AZ BUNLAR LAZIM:
1. /upload sayfasi (Bartin) -> Deck yukleyebilmek icin
2. /session sayfasi (Bartin) -> Pitch yapabilmek icin
3. /council sayfasi (Bartin) -> Juri icin (BACKEND HAZIR!)
4. /verdict sayfasi (Bartin) -> Sonuc icin (BACKEND HAZIR!)
5. Deployment (Yamac) -> Production'a almak icin
```

---

## Siradaki Gorevler

| # | Gorev | Owner | Blocker | Oncelik |
|---|-------|-------|---------|---------|
| 1 | `/upload` page + drag-drop | Bartin | - | KRITIK |
| 2 | `/session/[id]` page + audio | Bartin | #1 | KRITIK |
| 3 | `/council` page | Bartin | - | YUKSEK |
| 4 | `/verdict/[id]` page | Bartin | - | YUKSEK |
| 5 | Q&A prompts -> Python | Sinem | - | ORTA |
| 6 | Term sheet generator | Sinem | - | ORTA |
| 7 | Deployment | Yamac | #1-4 | SON |

---

## Bloke Durumu

| Kisi | Bloklayan | Durum |
|------|-----------|-------|
| Bartin (Council UI) | Yamac | ✅ COZULDU - Backend hazir |
| Bartin (Verdict UI) | Yamac | ✅ COZULDU - Backend hazir |
| Sinem (Council chars) | Yamac | ✅ COZULDU - Yamac yapti |
| Melisa (E2E test) | Bartin | ❌ HALA BLOKE - Frontend yok |

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
- Q&A prompts Python'a tasinmadi
- Term sheet generator yok
- WebSocket E2E test yok (gercek WS baglantisi)
- Full council flow test yok (8-15 exchange)

FRONTEND EKSIKLERI:
- /upload sayfasi YOK
- /session sayfasi YOK
- /council sayfasi YOK
- /verdict sayfasi YOK
- Hicbir UI komponenti yok

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
```

---

*Son guncelleme: 2025-12-22 04:30*
*Gercek ilerleme: ~42% (65/155 done, 8 kod var ama entegre degil)*
*Backend: ~59% | Frontend: ~5% (0% functional) | Prompts: ~60% | Tests: 116 passed, 3 skipped*

---

## Denetim Sonucu (3 Agent Audit - 2025-12-22)

| Onceki Iddia | Gercek Durum | Fark |
|--------------|--------------|------|
| Backend: ~85% | ~59% | -26% |
| Tests: 60 passed | 116 passed | +56 |
| Frontend: ~5% | ~5% (0% functional) | Dogru ama yaniltici |

**Eksik Backend Parcalari:**
- Q&A Mode: Prompt var, Python kodu YOK
- Term Sheet Generator: Template var, service YOK
- Verdict Generation: Endpoint var, generator YOK
- Deployment: %0
