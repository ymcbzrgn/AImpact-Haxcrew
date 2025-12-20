# DeckMate - Hackathon Roadmap

> **AImpact 2025** | 20-24 Aralık | Kanban Style

---

## 📊 Kanban Board

### ✅ DONE
| Feature | Owner | Tamamlanma |
|---------|-------|------------|
| Boilerplate Setup | Yamaç | 20 Aralık |
| Database Migration | Yamaç | 20 Aralık |

### 🔄 IN PROGRESS
| Feature | Owner | Bağımlılık | Durum |
|---------|-------|------------|-------|
| - | - | - | - |

### 📋 TODO - Gün 1 (20 Aralık)
| Feature | UI | Backend/AI | Bağımlılık |
|---------|-----|------------|------------|
| Supabase Setup | - | Yamaç | - |
| Auth (Login/Register) | Bekir | Yamaç | - |
| Landing Page | Bartın | - | - |
| Gemini Setup | - | Sinem | - |
| Prompt Drafts | - | Melisa | - |
| Backend Structure | - | Nisa | - |

### 📋 TODO - Gün 2 (21 Aralık)
| Feature | UI | Backend/AI | Bağımlılık |
|---------|-----|------------|------------|
| Startup Onboarding | Bekir | Nisa | Auth ✓ |
| Investor Onboarding | Bartın | Nisa | Auth ✓ |
| Deck Upload | Bekir | Yamaç | Startup ✓ |
| AI Deck Analysis | - | Sinem + Melisa | Deck Upload ✓ |

### 📋 TODO - Gün 3 (22 Aralık)
| Feature | UI | Backend/AI | Bağımlılık |
|---------|-----|------------|------------|
| Fit Score | - | Sinem | Investor ✓ |
| Discover | Bartın | Nisa | Fit Score ✓ |
| Deck Viewer | Bekir | Yamaç | AI Analysis ✓ |
| Analiz Sonuç UI | Bekir | - | AI Analysis ✓ |

### 📋 TODO - Gün 4 (23 Aralık)
| Feature | Owner | Not |
|---------|-------|-----|
| Bug Fix & Polish | Herkes | - |
| Demo Data (Seed) | Melisa | Mock startups |
| Demo Script | Sinem + Melisa | - |
| Final UI Polish | Bekir + Bartın | - |
| Deployment Check | Yamaç | Railway + Vercel |

### ⭐ NICE TO HAVE
| Feature | Owner | Bağımlılık |
|---------|-------|------------|
| Anonim Görüntülenme | Sinem | Deck Viewer ✓ |
| Haber Akışı (Mock) | Bartın | - |

---

## 🔗 Bağımlılık Grafiği

```
AUTH ──┬──► STARTUP ONBOARDING ──► DECK UPLOAD ──► AI ANALYSIS ──► DECK VIEWER
       │
       └──► INVESTOR ONBOARDING ──► FIT SCORE ──► DISCOVER
```

---

## 👥 Ekip Sorumlulukları

| Kişi | Rol | Ana Sorumluluklar |
|------|-----|-------------------|
| **Yamaç** | Tech Lead | Supabase, Storage, Deck Viewer backend, DevOps |
| **Nisa** | Backend | API endpoints (Startup, Investor, Discover) |
| **Bekir** | Frontend | Auth UI, Startup flows, Deck UI |
| **Bartın** | Frontend | Landing, Investor flows, Discover UI |
| **Sinem** | AI | Gemini setup, AI Analysis, Fit Score |
| **Melisa** | AI + Demo | Prompts, Demo data, Demo script |

---

## 📈 İlerleme

| Gün | Tarih | Hedef | Durum |
|-----|-------|-------|-------|
| 1 | 20 Aralık | Setup & Auth | 🔄 |
| 2 | 21 Aralık | Core Features | ⏳ |
| 3 | 22 Aralık | Feature Complete | ⏳ |
| 4 | 23 Aralık | Polish & Demo | ⏳ |
| 5 | 24 Aralık | Sunum | ⏳ |

**Legend:** ✅ Done | 🔄 In Progress | ⏳ Pending

---

*Son güncelleme: 20 Aralık 2025*
