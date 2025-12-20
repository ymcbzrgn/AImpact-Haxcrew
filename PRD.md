# DeckMate - Product Requirements Document (PRD)

## Teknik Gereksinim Dökümanı

**Versiyon:** 1.0  
**Tarih:** 20 Aralık 2025  
**Durum:** MVP Development  
**Hackathon:** AImpact 2025 (20-24 Aralık)

---

## 1. Kod Standartları ve Conventions

### 1.1 Naming Conventions

#### 1.1.1 Genel Kurallar

| Alan | Convention | Örnek |
|------|------------|-------|
| **Değişkenler (JS/TS)** | camelCase | `userName`, `fitScore`, `isVerified` |
| **Fonksiyonlar (JS/TS)** | camelCase | `calculateFitScore()`, `getUserById()` |
| **React Components** | PascalCase | `StartupCard`, `DeckViewer`, `FitScoreBadge` |
| **React Hooks** | camelCase (use prefix) | `useAuth`, `useDeckAnalysis`, `useFitScore` |
| **TypeScript Interfaces** | PascalCase (I prefix yok) | `StartupProfile`, `InvestorData` |
| **TypeScript Types** | PascalCase | `UserRole`, `VisibilityOption` |
| **TypeScript Enums** | PascalCase (members UPPER_SNAKE) | `enum Stage { PRE_SEED, SEED }` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| **CSS Classes** | kebab-case | `startup-card`, `fit-score-badge` |
| **Tailwind Custom** | kebab-case | `bg-accent-baseline`, `text-neutral-default` |
| **Dosya isimleri (Components)** | PascalCase.tsx | `StartupCard.tsx`, `DeckViewer.tsx` |
| **Dosya isimleri (Utilities)** | camelCase.ts | `formatDate.ts`, `calculateScore.ts` |
| **Dosya isimleri (Hooks)** | camelCase.ts | `useAuth.ts`, `useDeckUpload.ts` |
| **Klasör isimleri** | kebab-case | `deck-viewer/`, `fit-score/` |
| **Python değişkenler** | snake_case | `user_name`, `fit_score`, `is_verified` |
| **Python fonksiyonlar** | snake_case | `calculate_fit_score()`, `get_user_by_id()` |
| **Python class** | PascalCase | `StartupService`, `DeckAnalyzer` |
| **Python constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `GEMINI_MODEL` |
| **DB tablo isimleri** | snake_case (çoğul) | `users`, `startups`, `pitch_decks` |
| **DB kolon isimleri** | snake_case | `user_id`, `created_at`, `fit_score` |
| **API endpoints** | kebab-case | `/api/startup/deck-analysis`, `/api/investor/fit-score` |
| **API query params** | camelCase | `?sortBy=fitScore&filterStage=seed` |
| **JSON keys (response)** | camelCase | `{ "fitScore": 85, "userName": "..." }` |
| **Environment variables** | UPPER_SNAKE_CASE | `SUPABASE_URL`, `GEMINI_API_KEY` |

#### 1.1.2 Monorepo Yapısı (KISS - Paralel Çalışma İçin Optimize)

```
deckmate/
├── .gitignore
├── .env.example
├── README.md
│
├── frontend/                     # FRONTEND TEAM (Bekir + Bartın)
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js        # PRD renk paleti
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Bekir
│       │   ├── page.tsx          # Landing - Bekir
│       │   ├── globals.css
│       │   ├── auth/             # Bekir
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── startup/          # Bartın
│       │   │   ├── dashboard/
│       │   │   ├── deck/
│       │   │   └── profile/
│       │   └── investor/         # Bartın
│       │       ├── dashboard/
│       │       ├── discover/
│       │       └── saved/
│       ├── components/
│       │   ├── ui/               # Bekir - shadcn/ui
│       │   ├── layout/           # Bekir
│       │   ├── startup/          # Bartın
│       │   └── investor/         # Bartın
│       └── lib/
│           ├── supabase.ts
│           └── utils.ts
│
├── backend/                      # BACKEND TEAM (Yamaç + Nisa)
│   ├── requirements.txt          # Yamaç
│   ├── .env.example              # Yamaç
│   └── app/
│       ├── __init__.py
│       ├── main.py               # Yamaç - Entry + CORS
│       ├── config.py             # Yamaç - Pydantic settings
│       ├── routers/              # Nisa
│       │   ├── __init__.py
│       │   ├── health.py
│       │   ├── auth.py
│       │   ├── startup.py
│       │   ├── investor.py
│       │   └── deck.py
│       ├── services/             # Nisa
│       │   └── __init__.py
│       └── schemas/              # Nisa
│           └── __init__.py
│
├── ai/                           # AI TEAM (Sinem + Melisa)
│   ├── requirements.txt          # Sinem
│   ├── .env.example              # Sinem
│   └── app/
│       ├── __init__.py
│       ├── main.py               # Sinem - Entry + CORS
│       ├── config.py             # Sinem - Gemini settings
│       ├── routers/              # Sinem
│       │   ├── __init__.py
│       │   ├── health.py
│       │   ├── analyze.py
│       │   └── fit.py
│       ├── services/             # Sinem
│       │   ├── deck_analyzer.py
│       │   └── fit_calculator.py
│       └── prompts/              # Melisa
│           ├── __init__.py
│           ├── deck_analysis.py
│           └── fit_scoring.py
│
└── database/                     # YAMAÇ
    └── migrations/
        └── 001_initial_schema.sql
```

**Dosya Sahipliği (Merge Conflict Önleme):**

| Kişi | Sahip Olduğu Dosyalar |
|------|----------------------|
| **Yamaç** | Root files, `backend/app/main.py`, `backend/app/config.py`, `database/*` |
| **Nisa** | `backend/app/routers/*`, `backend/app/services/*`, `backend/app/schemas/*` |
| **Bekir** | `frontend/` root, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/auth/*`, `src/components/ui/*`, `src/lib/*` |
| **Bartın** | `src/app/startup/*`, `src/app/investor/*`, `src/components/startup/*`, `src/components/investor/*` |
| **Sinem** | `ai/` root, `ai/app/main.py`, `ai/app/config.py`, `ai/app/routers/*`, `ai/app/services/*` |
| **Melisa** | `ai/app/prompts/*` |

#### 1.1.3 Import Sıralaması

**TypeScript/JavaScript:**
```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// 3. Internal components
import { Button } from '@/components/ui/Button';
import { StartupCard } from '@/components/startup/StartupCard';

// 4. Hooks
import { useAuth } from '@/hooks/useAuth';

// 5. Utils/Lib
import { formatDate } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';

// 6. Types
import type { StartupProfile } from '@/types/startup';

// 7. Styles (if any)
import styles from './Component.module.css';
```

**Python:**
```python
# 1. Standard library
import os
from datetime import datetime
from typing import Optional, List

# 2. Third-party
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

# 3. Local imports
from app.config import settings
from app.services.startup_service import StartupService
from app.models.startup import Startup
```

### 1.2 Code Style

#### 1.2.1 TypeScript/JavaScript

```typescript
// ✅ DOĞRU: Interface tanımlama
interface StartupProfile {
  id: string;
  companyName: string;
  sector: string;
  stage: Stage;
  fitScore?: number;
  createdAt: Date;
}

// ✅ DOĞRU: Enum tanımlama
enum Stage {
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
}

// ✅ DOĞRU: Function component
interface StartupCardProps {
  startup: StartupProfile;
  onSave?: (id: string) => void;
  showFitScore?: boolean;
}

export const StartupCard: React.FC<StartupCardProps> = ({
  startup,
  onSave,
  showFitScore = true,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = useCallback(() => {
    setIsSaved(true);
    onSave?.(startup.id);
  }, [startup.id, onSave]);

  return (
    <div className="startup-card bg-canvas rounded-lg p-4">
      <h3 className="text-neutral-default font-semibold">
        {startup.companyName}
      </h3>
      {showFitScore && startup.fitScore && (
        <FitScoreBadge score={startup.fitScore} />
      )}
    </div>
  );
};

// ✅ DOĞRU: Custom hook
export const useFitScore = (startupId: string, investorId: string) => {
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/investor/discover/${startupId}/fit`
        );
        const data = await response.json();
        setScore(data.fitScore);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScore();
  }, [startupId, investorId]);

  return { score, isLoading, error };
};
```

#### 1.2.2 Python

```python
# ✅ DOĞRU: Pydantic schema
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Stage(str, Enum):
    PRE_SEED = "pre_seed"
    SEED = "seed"
    SERIES_A = "series_a"
    SERIES_B = "series_b"


class StartupCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    sector: str
    stage: Stage
    tagline: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "TechStartup",
                "sector": "fintech",
                "stage": "seed",
            }
        }


class StartupResponse(BaseModel):
    id: str
    company_name: str
    sector: str
    stage: Stage
    fit_score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
        # JSON response'da camelCase kullan
        alias_generator = lambda s: ''.join(
            word.capitalize() if i else word 
            for i, word in enumerate(s.split('_'))
        )
        populate_by_name = True


# ✅ DOĞRU: Service class
class StartupService:
    def __init__(self, db: Session):
        self.db = db

    async def get_startup_by_id(self, startup_id: str) -> Optional[Startup]:
        """Startup'ı ID ile getir."""
        return await self.db.query(Startup).filter(
            Startup.id == startup_id,
            Startup.deleted_at.is_(None)
        ).first()

    async def calculate_profile_completion(self, startup: Startup) -> int:
        """Profil tamamlanma yüzdesini hesapla."""
        required_fields = [
            startup.company_name,
            startup.sector,
            startup.stage,
            startup.description,
            startup.current_deck_id,
        ]
        filled = sum(1 for f in required_fields if f)
        return int((filled / len(required_fields)) * 100)


# ✅ DOĞRU: Router endpoint
@router.get(
    "/startup/{startup_id}",
    response_model=StartupResponse,
    summary="Get startup by ID",
)
async def get_startup(
    startup_id: str,
    current_user: User = Depends(get_current_user),
    startup_service: StartupService = Depends(get_startup_service),
):
    """
    Startup detaylarını getir.
    
    - **startup_id**: Startup UUID
    """
    startup = await startup_service.get_startup_by_id(startup_id)
    
    if not startup:
        raise HTTPException(
            status_code=404,
            detail="Startup not found"
        )
    
    return startup
```

#### 1.2.3 SQL

```sql
-- ✅ DOĞRU: Tablo oluşturma
CREATE TABLE startup_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Temel bilgiler
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    stage VARCHAR(50),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_stage CHECK (
        stage IN ('pre_seed', 'seed', 'series_a', 'series_b', 'growth')
    )
);

-- ✅ DOĞRU: Index isimlendirme
CREATE INDEX idx_startup_profiles_user_id ON startup_profiles(user_id);
CREATE INDEX idx_startup_profiles_sector ON startup_profiles(sector);
CREATE INDEX idx_startup_profiles_stage ON startup_profiles(stage);

-- ✅ DOĞRU: Foreign key isimlendirme
ALTER TABLE pitch_decks
    ADD CONSTRAINT fk_pitch_decks_startup_id
    FOREIGN KEY (startup_id) REFERENCES startups(id);
```

### 1.3 API Response Format

#### 1.3.1 Başarılı Response

```json
// Tek kayıt
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "companyName": "TechStartup",
    "sector": "fintech",
    "stage": "seed",
    "fitScore": 85,
    "createdAt": "2025-12-20T10:30:00Z"
  }
}

// Liste
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

#### 1.3.2 Hata Response

```json
{
  "success": false,
  "error": {
    "code": "STARTUP_NOT_FOUND",
    "message": "Startup with given ID not found",
    "details": {
      "startupId": "invalid-uuid"
    }
  }
}
```

#### 1.3.3 Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "companyName": "Company name is required",
        "sector": "Invalid sector value"
      }
    }
  }
}
```

---

## 2. Design System

### 2.1 Renk Paleti

#### 2.1.1 Ana Renkler

| Token | Hex | Opacity | Kullanım |
|-------|-----|---------|----------|
| `accent-baseline` | `#A5683B` | 100% | Primary accent, CTA buttons, highlights |
| `accent-default` | `#74492A` | 100% | Links, active states, secondary buttons |
| `accent-subdued` | `#74492A` | 81% | Hover states, subtle accents |
| `canvas` | `#FBF7F4` | 100% | Page background |
| `neutral-default` | `#2D1C10` | 100% | Primary text, headings |
| `neutral-subdued` | `#2D1C10` | 62% | Secondary text, placeholders, captions |

#### 2.1.2 Semantic Colors

| Token | Hex | Kullanım |
|-------|-----|----------|
| `success` | `#2E7D32` | Başarı mesajları, onay, pozitif skorlar |
| `warning` | `#ED6C02` | Uyarılar, dikkat gerektiren durumlar |
| `error` | `#D32F2F` | Hatalar, kritik uyarılar |
| `info` | `#0288D1` | Bilgi mesajları, ipuçları |

#### 2.1.3 Tailwind Config

```javascript
// frontend/tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Trust & Professionalism
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Main primary
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Secondary - Energy & Growth
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Main secondary
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Accent - Innovation & Creativity
        accent: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF', // Main accent
          600: '#C026D3',
          700: '#A21CAF',
          800: '#86198F',
          900: '#701A75',
        },
        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Fit Score Colors
        fit: {
          high: '#10B981',    // 80-100
          medium: '#F59E0B',  // 50-79
          low: '#EF4444',     // 0-49
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

#### 2.1.4 CSS Variables

```css
/* frontend/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Colors */
  --color-accent-baseline: #A5683B;
  --color-accent-default: #74492A;
  --color-accent-subdued: rgba(116, 73, 42, 0.81);
  --color-canvas: #FBF7F4;
  --color-neutral-default: #2D1C10;
  --color-neutral-subdued: rgba(45, 28, 16, 0.62);
  
  /* Semantic */
  --color-success: #2E7D32;
  --color-warning: #ED6C02;
  --color-error: #D32F2F;
  --color-info: #0288D1;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(45, 28, 16, 0.05);
  --shadow-md: 0 4px 6px rgba(45, 28, 16, 0.1);
  --shadow-lg: 0 10px 15px rgba(45, 28, 16, 0.1);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}

/* Base styles */
body {
  background-color: var(--color-canvas);
  color: var(--color-neutral-default);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 2.2 Typography

| Token | Size | Weight | Line Height | Kullanım |
|-------|------|--------|-------------|----------|
| `text-xs` | 12px | 400 | 1.5 | Captions, labels |
| `text-sm` | 14px | 400 | 1.5 | Secondary text |
| `text-base` | 16px | 400 | 1.5 | Body text |
| `text-lg` | 18px | 500 | 1.4 | Lead text |
| `text-xl` | 20px | 600 | 1.3 | Card titles |
| `text-2xl` | 24px | 600 | 1.3 | Section headers |
| `text-3xl` | 30px | 700 | 1.2 | Page titles |
| `text-4xl` | 36px | 700 | 1.2 | Hero titles |

### 2.3 Spacing

4px base unit sistemi:

| Token | Value | Kullanım |
|-------|-------|----------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Compact spacing |
| `space-3` | 12px | Default gap |
| `space-4` | 16px | Section padding |
| `space-6` | 24px | Large gap |
| `space-8` | 32px | Section margin |

### 2.4 Component Patterns

#### Button Variants

```tsx
// Primary Button
<button className="bg-accent-baseline text-canvas hover:bg-accent-default px-4 py-2 rounded-md font-medium transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="bg-transparent text-accent-default border border-accent-default hover:bg-accent-subdued/10 px-4 py-2 rounded-md font-medium transition-colors">
  Secondary Action
</button>
```

#### Card Pattern

```tsx
<div className="bg-white border border-neutral-subdued/20 rounded-lg shadow-md p-5">
  <h3 className="text-xl text-neutral font-semibold mb-2">Card Title</h3>
  <p className="text-base text-neutral-subdued">Card description.</p>
</div>
```

#### Score Badge Pattern

```tsx
const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 80 ? 'bg-success' : score >= 60 ? 'bg-accent-baseline' : score >= 40 ? 'bg-warning' : 'bg-error';
  return (
    <span className={`${color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
      {score}
    </span>
  );
};
```

---

## 3. Genel Bakış

### 3.1 Ürün Özeti

DeckMate, network'ü zayıf startup'larla yatırımcıları güvenli ve veriye dayalı şekilde buluşturan iki taraflı karar destek platformu.

### 1.2 Temel Prensipler

- **İki taraflı koruma:** Hem startup hem yatırımcı güvende
- **Aşamalı paylaşım:** Bilgi kontrollü açılır
- **AI destekli içgörü:** Ham veri → anlamlı bilgi
- **Flexible mimari:** Sonradan genişletilebilir yapı

---

## 4. Teknoloji Stack

### 4.1 Frontend

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 14.x | React framework, App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | UI component library |
| React Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| PDF.js | 3.x | PDF görüntüleme (opsiyonel) |

### 4.2 Backend

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| FastAPI | 0.104+ | Python web framework |
| Python | 3.11+ | Backend runtime |
| Pydantic | 2.x | Data validation |
| SQLAlchemy | 2.x | ORM (opsiyonel, Supabase client de kullanılabilir) |
| python-multipart | latest | File upload handling |
| PyPDF2 / pdfplumber | latest | PDF text extraction |

### 4.3 Database & Auth

| Teknoloji | Kullanım |
|-----------|----------|
| Supabase | PostgreSQL + Auth + Storage + Realtime |
| PostgreSQL | Ana veritabanı (Supabase managed) |
| Supabase Auth | Kimlik doğrulama |
| Supabase Storage | Pitch deck dosya depolama |
| Row Level Security | Veri erişim kontrolü |

### 4.4 AI

| Teknoloji | Model | Kullanım |
|-----------|-------|----------|
| Google Gemini | 1.5 Pro | Deck analizi, derin içgörü |
| Google Gemini | 1.5 Flash | Hızlı skorlama, fit analizi |

### 4.5 Deployment

| Platform | Servis | URL Pattern |
|----------|--------|-------------|
| Vercel | Frontend (Next.js) | `deckmate.vercel.app` |
| Railway | Backend (FastAPI) | `deckmate-backend.railway.app` |
| Railway | AI Service (FastAPI) | `deckmate-ai.railway.app` |
| Supabase Cloud | Database & Storage | Supabase dashboard |

**Railway Yapısı (Tek Hesap, Çoklu Servis):**
```
Railway Project: deckmate
├── Service 1: backend    → Port 8000
├── Service 2: ai         → Port 8001
└── Environment Variables → Shared across services
```

**Free Tier Limitleri:**
- Railway: 500 saat/ay (sleep mode ile hackathon için yeterli)
- Vercel: Unlimited (hobby tier)
- Supabase: 500MB DB, 1GB storage

---

## 5. Sistem Mimarisi

### 5.1 Genel Mimari (3 Ayrı Servis)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend (Vercel)                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐             │  │
│  │  │  Startup    │  │  Investor   │  │     Shared      │             │  │
│  │  │  Dashboard  │  │  Dashboard  │  │   Components    │             │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│     BACKEND SERVICE          │    │     AI SERVICE               │
│     (Railway :8000)          │    │     (Railway :8001)          │
│  ┌────────────────────────┐  │    │  ┌────────────────────────┐  │
│  │  FastAPI Backend       │  │───▶│  │  FastAPI AI            │  │
│  │  ┌──────┐ ┌──────────┐ │  │    │  │  ┌──────┐ ┌─────────┐  │  │
│  │  │ Auth │ │ Startup  │ │  │    │  │  │Analyze│ │Fit Score│  │  │
│  │  │Routes│ │ Investor │ │  │    │  │  │Routes │ │ Routes  │  │  │
│  │  └──────┘ │  Routes  │ │  │    │  │  └──────┘ └─────────┘  │  │
│  │           └──────────┘ │  │    │  └────────────────────────┘  │
│  └────────────────────────┘  │    └──────────────────────────────┘
└──────────────────────────────┘                    │
                │                                   ▼
                ▼                    ┌──────────────────────────────┐
┌──────────────────────────────┐    │        GEMINI API            │
│         SUPABASE             │    │     (Google Cloud)           │
│  ┌──────────┐ ┌───────────┐  │    └──────────────────────────────┘
│  │PostgreSQL│ │  Storage  │  │
│  │    DB    │ │  (Files)  │  │
│  └──────────┘ └───────────┘  │
└──────────────────────────────┘

Service Communication:
─────────────────────
Frontend  → Backend:  API calls (REST)
Backend   → AI:       Internal HTTP calls
Backend   → Supabase: Database queries
Frontend  → Supabase: Auth (client-side)
```

### 5.2 Frontend Routing Yapısı

```
/                           → Landing page
/auth/login                 → Giriş
/auth/register              → Kayıt (rol seçimi)
/auth/register/startup      → Startup kayıt formu
/auth/register/investor     → Investor kayıt formu

/startup/                   → Startup dashboard (redirect)
/startup/dashboard          → Ana dashboard
/startup/profile            → Profil düzenleme
/startup/deck               → Deck yönetimi
/startup/deck/upload        → Deck yükleme
/startup/deck/analysis      → AI analiz sonuçları
/startup/visibility         → Görünürlük ayarları
/startup/viewers            → Kim baktı? (anonim)
/startup/settings           → Ayarlar

/investor/                  → Investor dashboard (redirect)
/investor/dashboard         → Ana dashboard
/investor/discover          → Startup keşfet
/investor/startup/[id]      → Startup detay (teaser/full)
/investor/saved             → Kaydedilenler
/investor/requests          → Gönderilen talepler
/investor/news              → Haber akışı
/investor/settings          → Ayarlar

/shared/deck-viewer/[id]    → Güvenli deck görüntüleyici
```

---

## 6. Veritabanı Şeması

### 6.1 Şema Tasarım Prensipleri

- **Flexible:** Gelecek genişlemeler için rezerv kolonlar
- **Audit-ready:** created_at, updated_at, deleted_at her tabloda
- **Soft delete:** Veri silinmez, işaretlenir
- **JSONB:** Esnek metadata depolama

### 6.2 Tablolar

#### 6.2.1 users

Ana kullanıcı tablosu (Supabase Auth ile entegre).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Temel bilgiler
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    
    -- Rol sistemi
    role VARCHAR(50) NOT NULL DEFAULT 'startup', -- 'startup', 'investor', 'admin'
    role_verified BOOLEAN DEFAULT FALSE,
    role_verified_at TIMESTAMP,
    
    -- Gelecek roller için (V2)
    investor_type VARCHAR(50), -- 'vc', 'angel', 'syndicate_lead' (NULL if startup)
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'pending_verification'
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Trust & Scoring (Gelecek için)
    trust_score INTEGER DEFAULT 50, -- 0-100
    tier INTEGER DEFAULT 1, -- 1-5 yıldız
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    
    -- Rezerv alanlar (gelecek için)
    reserved_1 VARCHAR(255),
    reserved_2 VARCHAR(255),
    reserved_3 TEXT,
    reserved_int_1 INTEGER,
    reserved_int_2 INTEGER,
    reserved_json JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_role CHECK (role IN ('startup', 'investor', 'admin')),
    CONSTRAINT valid_investor_type CHECK (
        investor_type IS NULL OR 
        investor_type IN ('vc', 'angel', 'syndicate_lead')
    )
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);
```

#### 6.2.2 startups

Startup profil bilgileri.

```sql
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Temel bilgiler
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    tagline VARCHAR(500),
    description TEXT,
    
    -- Sektör & Aşama
    sector VARCHAR(100),
    sub_sector VARCHAR(100),
    stage VARCHAR(50), -- 'idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth'
    
    -- Şirket detayları
    founded_year INTEGER,
    team_size INTEGER,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    website_url TEXT,
    linkedin_url TEXT,
    
    -- Kurucular (JSONB array)
    founders JSONB DEFAULT '[]', -- [{name, role, linkedin_url}]
    
    -- Finansal bilgiler (opsiyonel)
    funding_raised DECIMAL(15,2),
    funding_currency VARCHAR(10) DEFAULT 'USD',
    funding_target DECIMAL(15,2),
    mrr DECIMAL(15,2),
    arr DECIMAL(15,2),
    
    -- Pitch deck
    current_deck_id UUID, -- En güncel deck referansı
    
    -- Görünürlük ayarları
    visibility VARCHAR(50) DEFAULT 'verified_only', -- 'public', 'verified_only', 'vc_only', 'whitelist', 'private'
    visibility_settings JSONB DEFAULT '{}',
    
    -- AI skorları (cached)
    readiness_score INTEGER, -- 0-100
    last_analysis_at TIMESTAMP,
    analysis_summary JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'inactive', 'suspended'
    profile_completion INTEGER DEFAULT 0, -- 0-100
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    
    -- Rezerv alanlar
    reserved_1 VARCHAR(255),
    reserved_2 VARCHAR(255),
    reserved_3 TEXT,
    reserved_int_1 INTEGER,
    reserved_int_2 INTEGER,
    reserved_json JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_stage CHECK (
        stage IN ('idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth')
    ),
    CONSTRAINT valid_visibility CHECK (
        visibility IN ('public', 'verified_only', 'vc_only', 'whitelist', 'private')
    )
);

CREATE INDEX idx_startups_user_id ON startups(user_id);
CREATE INDEX idx_startups_sector ON startups(sector);
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_startups_status ON startups(status);
CREATE INDEX idx_startups_visibility ON startups(visibility);
```

#### 6.2.3 investors

Yatırımcı profil bilgileri.

```sql
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Temel bilgiler
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    bio TEXT,
    
    -- Kurum bilgileri (VC için)
    organization_name VARCHAR(255),
    organization_type VARCHAR(50), -- 'vc_fund', 'family_office', 'corporate_vc', 'angel_group', 'individual'
    organization_website TEXT,
    
    -- Yatırım tercihleri
    preferred_sectors JSONB DEFAULT '[]', -- ['fintech', 'healthtech', ...]
    preferred_stages JSONB DEFAULT '[]', -- ['seed', 'series_a', ...]
    preferred_locations JSONB DEFAULT '[]', -- ['TR', 'EU', ...]
    
    -- Ticket size
    ticket_size_min DECIMAL(15,2),
    ticket_size_max DECIMAL(15,2),
    ticket_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Co-invest tercihi
    co_invest_interest BOOLEAN DEFAULT TRUE,
    lead_investor_interest BOOLEAN DEFAULT FALSE,
    
    -- Doğrulama
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verification_notes TEXT,
    verified_at TIMESTAMP,
    verified_by UUID,
    
    -- LinkedIn & Sosyal
    linkedin_url TEXT,
    twitter_url TEXT,
    crunchbase_url TEXT,
    
    -- Yatırım geçmişi (opsiyonel, self-reported)
    portfolio_count INTEGER,
    notable_investments JSONB DEFAULT '[]',
    
    -- Davranış & Trust (Gelecek için)
    behavior_score INTEGER DEFAULT 50, -- 0-100
    total_views INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    
    -- Rezerv alanlar
    reserved_1 VARCHAR(255),
    reserved_2 VARCHAR(255),
    reserved_3 TEXT,
    reserved_int_1 INTEGER,
    reserved_int_2 INTEGER,
    reserved_json JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_investors_user_id ON investors(user_id);
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_investors_verification ON investors(verification_status);
```

#### 6.2.4 pitch_decks

Pitch deck dosyaları ve analiz sonuçları.

```sql
CREATE TABLE pitch_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    
    -- Dosya bilgileri
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_size INTEGER,
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    page_count INTEGER,
    
    -- Versiyon
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- AI Analiz sonuçları
    analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    analysis_started_at TIMESTAMP,
    analysis_completed_at TIMESTAMP,
    
    -- Skorlar
    overall_score INTEGER, -- 0-100
    category_scores JSONB DEFAULT '{}', -- {problem: 85, solution: 72, ...}
    
    -- İçgörüler
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]', -- [{priority, category, suggestion, example}]
    
    -- AI çıktıları
    ai_summary TEXT,
    ai_raw_response JSONB,
    suggested_stage VARCHAR(50),
    investor_readiness_grade VARCHAR(10), -- 'A+', 'A', 'B+', ...
    
    -- Extracted text (arama için)
    extracted_text TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'deleted'
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Rezerv alanlar
    reserved_1 VARCHAR(255),
    reserved_json JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_pitch_decks_startup_id ON pitch_decks(startup_id);
CREATE INDEX idx_pitch_decks_is_current ON pitch_decks(is_current);
CREATE INDEX idx_pitch_decks_analysis_status ON pitch_decks(analysis_status);
```

#### 6.2.5 deck_views (Audit Log)

Deck görüntüleme kayıtları.

```sql
CREATE TABLE deck_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
    
    -- Görüntüleme detayları
    view_type VARCHAR(50) DEFAULT 'teaser', -- 'teaser', 'full', 'download_attempt'
    pages_viewed JSONB DEFAULT '[]', -- [1, 2, 3, 5]
    total_pages_viewed INTEGER DEFAULT 0,
    view_duration_seconds INTEGER,
    
    -- Session bilgileri
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    
    -- Watermark
    watermark_id VARCHAR(255), -- Unique watermark identifier
    
    -- Şüpheli aktivite flag'leri
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Index için
    view_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
);

CREATE INDEX idx_deck_views_deck_id ON deck_views(deck_id);
CREATE INDEX idx_deck_views_startup_id ON deck_views(startup_id);
CREATE INDEX idx_deck_views_viewer_user_id ON deck_views(viewer_user_id);
CREATE INDEX idx_deck_views_created_at ON deck_views(created_at);
CREATE INDEX idx_deck_views_view_date ON deck_views(view_date);
```

#### 6.2.6 profile_views

Startup profil görüntüleme kayıtları (anonim bildirim için).

```sql
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
    
    -- Viewer bilgileri (anonim aggregation için)
    viewer_tier INTEGER, -- 1-5 yıldız
    viewer_type VARCHAR(50), -- 'vc', 'angel', 'syndicate_lead'
    viewer_verified BOOLEAN,
    
    -- Session
    session_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    view_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
);

CREATE INDEX idx_profile_views_startup_id ON profile_views(startup_id);
CREATE INDEX idx_profile_views_created_at ON profile_views(created_at);
CREATE INDEX idx_profile_views_view_date ON profile_views(view_date);
```

#### 6.2.7 access_requests

Aşama geçiş talepleri.

```sql
CREATE TABLE access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    requester_user_id UUID REFERENCES users(id),
    
    -- Talep detayları
    request_type VARCHAR(50) NOT NULL, -- 'stage_2', 'stage_3_call', 'full_deck', 'contact'
    current_stage INTEGER DEFAULT 1,
    requested_stage INTEGER DEFAULT 2,
    
    -- Mesaj
    request_message TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    responded_at TIMESTAMP,
    response_message TEXT,
    
    -- Expiry
    expires_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_requests_startup_id ON access_requests(startup_id);
CREATE INDEX idx_access_requests_investor_id ON access_requests(investor_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
```

#### 6.2.8 fit_scores

AI tarafından hesaplanan uyum skorları.

```sql
CREATE TABLE fit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    
    -- Skorlar
    overall_score INTEGER, -- 0-100
    sector_match INTEGER, -- 0-100
    stage_match INTEGER, -- 0-100
    location_match INTEGER, -- 0-100
    ticket_match INTEGER, -- 0-100
    
    -- AI açıklaması
    match_reasons JSONB DEFAULT '[]',
    concerns JSONB DEFAULT '[]',
    ai_summary TEXT,
    
    -- Cache control
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_stale BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(startup_id, investor_id)
);

CREATE INDEX idx_fit_scores_startup_id ON fit_scores(startup_id);
CREATE INDEX idx_fit_scores_investor_id ON fit_scores(investor_id);
CREATE INDEX idx_fit_scores_overall ON fit_scores(overall_score);
```

#### 6.2.9 news_items

Yatırım haberleri.

```sql
CREATE TABLE news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İçerik
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    source_url TEXT,
    source_name VARCHAR(255),
    
    -- Kategorilendirme
    news_type VARCHAR(50) DEFAULT 'funding', -- 'funding', 'exit', 'partnership', 'other'
    sectors JSONB DEFAULT '[]',
    regions JSONB DEFAULT '[]',
    
    -- Yatırım detayları (funding news için)
    company_name VARCHAR(255),
    investor_names JSONB DEFAULT '[]',
    funding_amount DECIMAL(15,2),
    funding_currency VARCHAR(10),
    funding_stage VARCHAR(50),
    
    -- AI özeti
    ai_summary TEXT,
    ai_insights JSONB,
    
    -- Görsel
    image_url TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Dates
    published_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_items_news_type ON news_items(news_type);
CREATE INDEX idx_news_items_published_at ON news_items(published_at);
CREATE INDEX idx_news_items_status ON news_items(status);
```

#### 6.2.10 saved_startups

Yatırımcının kaydettiği startup'lar.

```sql
CREATE TABLE saved_startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    
    -- Kategorilendirme
    folder VARCHAR(100) DEFAULT 'default',
    notes TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(investor_id, startup_id)
);

CREATE INDEX idx_saved_startups_investor_id ON saved_startups(investor_id);
```

---

## 7. API Endpoints

### 7.1 Auth Endpoints

```
POST   /api/auth/register          - Yeni kayıt
POST   /api/auth/login             - Giriş
POST   /api/auth/logout            - Çıkış
POST   /api/auth/refresh           - Token yenileme
GET    /api/auth/me                - Mevcut kullanıcı bilgisi
PUT    /api/auth/me                - Profil güncelleme
POST   /api/auth/password/reset    - Şifre sıfırlama talebi
POST   /api/auth/password/change   - Şifre değiştirme
```

### 7.2 Startup Endpoints

```
# Profil
GET    /api/startup/profile              - Profil bilgilerini getir
PUT    /api/startup/profile              - Profil güncelle
GET    /api/startup/profile/completion   - Profil tamamlanma durumu

# Pitch Deck
GET    /api/startup/decks                - Deck listesi
POST   /api/startup/decks/upload         - Yeni deck yükle
GET    /api/startup/decks/:id            - Deck detay
DELETE /api/startup/decks/:id            - Deck sil
POST   /api/startup/decks/:id/analyze    - AI analizi başlat
GET    /api/startup/decks/:id/analysis   - Analiz sonuçları

# Görünürlük
GET    /api/startup/visibility           - Görünürlük ayarları
PUT    /api/startup/visibility           - Görünürlük güncelle

# Görüntülenmeler
GET    /api/startup/views                - Profil görüntülenmeleri (anonim)
GET    /api/startup/views/stats          - Görüntülenme istatistikleri

# Erişim talepleri
GET    /api/startup/requests             - Gelen talepler
PUT    /api/startup/requests/:id         - Talep yanıtla (approve/reject)
```

### 7.3 Investor Endpoints

```
# Profil
GET    /api/investor/profile             - Profil bilgilerini getir
PUT    /api/investor/profile             - Profil güncelle

# Keşif
GET    /api/investor/discover            - Startup keşfet (filtreleme)
GET    /api/investor/discover/:id        - Startup teaser profil
GET    /api/investor/discover/:id/fit    - Fit skoru

# Detay erişimi
POST   /api/investor/requests            - Detay talebi gönder
GET    /api/investor/requests            - Gönderilen talepler
GET    /api/investor/requests/:id        - Talep durumu

# Kaydedilenler
GET    /api/investor/saved               - Kaydedilen startup'lar
POST   /api/investor/saved               - Startup kaydet
DELETE /api/investor/saved/:id           - Kaydı kaldır

# Deck görüntüleme
GET    /api/investor/deck/:id/view       - Deck görüntüleme token al
```

### 7.4 Shared Endpoints

```
# News
GET    /api/news                         - Haber listesi
GET    /api/news/:id                     - Haber detay

# Deck Viewer
GET    /api/viewer/deck/:token           - Güvenli deck erişimi (watermarked)

# Lookup
GET    /api/lookup/sectors               - Sektör listesi
GET    /api/lookup/stages                - Aşama listesi
GET    /api/lookup/locations             - Lokasyon listesi
```

### 7.5 AI Endpoints

```
POST   /api/ai/analyze-deck              - Deck analizi (internal)
POST   /api/ai/calculate-fit             - Fit skoru hesapla (internal)
POST   /api/ai/summarize-news            - Haber özeti (internal)
```

---

## 8. Güvenlik Stratejisi (Demo-Safe Mode)

> **ÖNEMLİ:** Hackathon MVP'si için "Demo-Safe" güvenlik stratejisi uygulanmaktadır.
> Bu strateji, hızlı geliştirme ve minimum debug süresini hedefler.
> Production'a geçişte bu bölüm tamamen revize edilmelidir.

### 8.0 Demo-Safe Güvenlik Kuralları

| Katman | Demo-Safe Ayar | Production'da |
|--------|----------------|---------------|
| **CORS** | `*` (wildcard) | Spesifik origin'ler |
| **RLS** | Kapalı | Detaylı policy'ler |
| **Auth** | Supabase Auth (basit) | Email verify + 2FA |
| **Email Verification** | Kapalı | Açık |
| **Rate Limiting** | Yok | Aktif |
| **Input Validation** | Sadece file size | Tüm alanlar |

#### Supabase Auth Ayarları (Demo için)
```
Supabase Dashboard > Authentication > Providers > Email:
- Enable Email Signup: ON
- Confirm Email: OFF (Demo için kapalı!)
- Secure Email Change: OFF
- Double confirm email changes: OFF
```

#### CORS Ayarları (Demo için)
```python
# backend/app/main.py ve ai/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Demo: Wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### RLS Durumu (Demo için)
```sql
-- Demo için RLS KAPALI
-- Production'da aktif edilecek
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_startups DISABLE ROW LEVEL SECURITY;
```

#### Neden Bu Strateji?
1. **Hız:** Güvenlik debug'u zaman kaybı
2. **Basitlik:** Daha az moving part = daha az hata
3. **Demo Odaklı:** Jüri güvenlik test etmeyecek
4. **Reversible:** Production'da kolayca aktif edilir

---

### 8.1 Deck Viewer Güvenliği (Basitleştirilmiş)

#### Watermark Implementasyonu (CSS Overlay)

```typescript
// components/DeckViewer.tsx

interface DeckViewerProps {
  deckUrl: string;
  watermarkText: string; // "User ID: xxx | Date: xxx | Session: xxx"
}

const DeckViewer: React.FC<DeckViewerProps> = ({ deckUrl, watermarkText }) => {
  return (
    <div className="relative w-full h-full select-none">
      {/* PDF iframe */}
      <iframe
        src={deckUrl}
        className="w-full h-full pointer-events-none"
        style={{ userSelect: 'none' }}
      />
      
      {/* Watermark overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 100px,
            rgba(0,0,0,0.03) 100px,
            rgba(0,0,0,0.03) 200px
          )`
        }}
      >
        {/* Repeating watermark pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-gray-400 text-opacity-20 text-lg font-mono transform -rotate-45"
            style={{
              textShadow: '0 0 5px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap'
            }}
          >
            {watermarkText}
          </span>
        </div>
      </div>
      
      {/* Anti-screenshot overlay (optional) */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(255,255,255,0.02) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
};
```

#### Güvenlik Özellikleri

```typescript
// Deck view token generation
interface DeckViewToken {
  deckId: string;
  viewerId: string;
  viewerType: 'investor' | 'startup';
  watermarkId: string;
  expiresAt: number; // Unix timestamp
  permissions: {
    canViewFull: boolean;
    maxPages?: number;
  };
}

// Generate time-limited token
function generateDeckViewToken(params: DeckViewToken): string {
  // JWT with short expiry (e.g., 30 minutes)
  return jwt.sign(params, SECRET_KEY, { expiresIn: '30m' });
}
```

### 8.2 Row Level Security (RLS) - Production Reference

> **NOT:** Demo-Safe mode'da RLS kapalıdır.
> Aşağıdaki policy'ler production referansı içindir.

<details>
<summary>Production RLS Policies (Collapsed)</summary>

```sql
-- Startup kendi profilini görebilir
CREATE POLICY "Users can view own startup" ON startups
    FOR SELECT USING (user_id = auth.uid());

-- Startup kendi profilini güncelleyebilir
CREATE POLICY "Users can update own startup" ON startups
    FOR UPDATE USING (user_id = auth.uid());

-- Yatırımcılar görünür startup'ları görebilir (teaser)
CREATE POLICY "Investors can view visible startups" ON startups
    FOR SELECT USING (
        visibility = 'public'
        OR (visibility = 'verified_only' AND EXISTS (
            SELECT 1 FROM investors
            WHERE user_id = auth.uid()
            AND verification_status = 'verified'
        ))
    );

-- Deck views sadece ilgili taraflara görünür
CREATE POLICY "Deck views visible to startup owner" ON deck_views
    FOR SELECT USING (
        startup_id IN (SELECT id FROM startups WHERE user_id = auth.uid())
    );
```

</details>

---

## 9. AI Entegrasyonu

### 9.1 Gemini Konfigürasyonu

```python
# config/ai.py

import google.generativeai as genai
from typing import Optional

class GeminiConfig:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Deck analizi için Pro model
        self.pro_model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={
                "temperature": 0.3,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
        
        # Hızlı işlemler için Flash model
        self.flash_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.2,
                "top_p": 0.9,
                "max_output_tokens": 4096,
            }
        )
```

### 9.2 Deck Analiz Prompt

```python
# services/ai/deck_analyzer.py

DECK_ANALYSIS_PROMPT = """
Sen bir yatırım analisti olarak pitch deck değerlendirmesi yapıyorsun.

Aşağıdaki pitch deck içeriğini analiz et ve JSON formatında yanıt ver.

## Değerlendirme Kategorileri ve Ağırlıkları:
1. Çözüm & Ürün (20%): Unique value proposition, ürün netliği
2. Problem Tanımı (15%): Gerçek acı noktası, hedef kitle netliği
3. Pazar Büyüklüğü (15%): TAM/SAM/SOM, kaynak güvenilirliği
4. İş Modeli (15%): Monetizasyon, unit economics
5. Traction (15%): Kanıtlanmış ilerleme, metrikler
6. Takım (10%): Relevant deneyim, eksik roller
7. Finansal Talep (10%): Miktar netliği, kullanım planı

## Çıktı Formatı (JSON):
{
  "overall_score": 0-100,
  "category_scores": {
    "solution": 0-100,
    "problem": 0-100,
    "market": 0-100,
    "business_model": 0-100,
    "traction": 0-100,
    "team": 0-100,
    "financials": 0-100
  },
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "improvements": [
    {
      "priority": "critical|high|medium|low",
      "category": "...",
      "suggestion": "...",
      "example": "..."
    }
  ],
  "investor_readiness": "A+|A|B+|B|C+|C|D",
  "suggested_stage": "pre_seed|seed|series_a",
  "summary": "2-3 cümlelik özet"
}

## Pitch Deck İçeriği:
{deck_content}
"""
```

### 9.3 Fit Skoru Hesaplama

```python
# services/ai/fit_calculator.py

def calculate_fit_score(startup: dict, investor: dict) -> dict:
    """
    Startup-Investor uyum skoru hesapla.
    Rule-based + AI hybrid yaklaşım.
    """
    
    scores = {
        "sector_match": 0,
        "stage_match": 0,
        "location_match": 0,
        "ticket_match": 0
    }
    
    # Sektör eşleşmesi
    if startup["sector"] in investor["preferred_sectors"]:
        scores["sector_match"] = 100
    elif startup["sub_sector"] in investor["preferred_sectors"]:
        scores["sector_match"] = 70
    
    # Aşama eşleşmesi
    if startup["stage"] in investor["preferred_stages"]:
        scores["stage_match"] = 100
    
    # Lokasyon eşleşmesi
    if startup["location_country"] in investor["preferred_locations"]:
        scores["location_match"] = 100
    
    # Ticket size eşleşmesi
    if investor["ticket_size_min"] and investor["ticket_size_max"]:
        if startup["funding_target"]:
            target = startup["funding_target"]
            if investor["ticket_size_min"] <= target <= investor["ticket_size_max"]:
                scores["ticket_match"] = 100
            elif target < investor["ticket_size_min"]:
                scores["ticket_match"] = 50
    
    # Overall hesapla (weighted average)
    weights = {
        "sector_match": 0.35,
        "stage_match": 0.25,
        "location_match": 0.15,
        "ticket_match": 0.25
    }
    
    overall = sum(scores[k] * weights[k] for k in scores)
    
    return {
        "overall_score": int(overall),
        **scores,
        "match_reasons": generate_match_reasons(scores, startup, investor),
        "concerns": generate_concerns(scores, startup, investor)
    }
```

---

## 10. Frontend Sayfa Yapıları

### 10.1 Startup Dashboard

```typescript
// app/startup/dashboard/page.tsx

interface DashboardData {
  profile: StartupProfile;
  deck: PitchDeck | null;
  analysisScore: number | null;
  viewsToday: number;
  viewsThisWeek: number;
  pendingRequests: number;
  recentViewers: AnonymousViewer[];
}

// Dashboard bileşenleri:
// - ProfileCompletionCard
// - DeckStatusCard (upload/analysis durumu)
// - ReadinessScoreCard
// - ViewersCard (anonim görüntülenmeler)
// - PendingRequestsCard
// - QuickActionsCard
```

### 10.2 Investor Discover

```typescript
// app/investor/discover/page.tsx

interface DiscoverFilters {
  sectors: string[];
  stages: string[];
  locations: string[];
  minScore: number;
  sortBy: 'fit_score' | 'readiness_score' | 'newest';
}

interface StartupTeaser {
  id: string;
  companyName: string;
  tagline: string;
  sector: string;
  stage: string;
  location: string;
  readinessScore: number;
  fitScore: number;
  hasDeck: boolean;
}

// Discover bileşenleri:
// - FilterSidebar
// - StartupGrid / StartupList
// - StartupTeaserCard
// - FitScoreBadge
// - SaveButton
// - RequestAccessButton
```

---

## 11. MVP Sprint Planı (4 Gün)

### Gün 1: Setup & Altyapı (20 Aralık)

| Saat | Task | Sorumlu | Output |
|------|------|---------|--------|
| 09:00-12:00 | Repo setup, branch strategy, CI/CD | Yamaç | GitHub repo, Vercel/Railway connected |
| 09:00-12:00 | Supabase setup (DB + Auth + Storage) | Nisa | Supabase project, tables created |
| 09:00-12:00 | Next.js boilerplate + routing | Bekir | Frontend skeleton |
| 12:00-13:00 | Öğle arası | - | - |
| 13:00-18:00 | Auth flow (login/register) | Nisa + Bekir | Working auth |
| 13:00-18:00 | FastAPI boilerplate + Supabase client | Yamaç | Backend skeleton |
| 13:00-18:00 | Landing page | Bartın | Landing UI |
| 13:00-18:00 | Gemini setup + test | Sinem | AI connection verified |

### Gün 2: Core Development (21 Aralık)

| Saat | Task | Sorumlu | Output |
|------|------|---------|--------|
| 09:00-13:00 | Startup kayıt/profil form | Bekir | Onboarding flow |
| 09:00-13:00 | Startup API endpoints | Nisa | Profile CRUD |
| 09:00-13:00 | Deck upload + storage | Yamaç | Upload working |
| 09:00-13:00 | Investor kayıt/profil | Bartın | Investor onboarding |
| 13:00-14:00 | Öğle arası | - | - |
| 14:00-18:00 | Deck analiz prompt + integration | Sinem | AI analysis working |
| 14:00-18:00 | Startup dashboard UI | Bekir | Dashboard layout |
| 14:00-18:00 | Investor discover UI | Bartın | Discover layout |
| 14:00-18:00 | Fit skoru hesaplama | Melisa | Fit score logic |

### Gün 3: Feature Completion (22 Aralık)

| Saat | Task | Sorumlu | Output |
|------|------|---------|--------|
| 09:00-13:00 | Güvenli deck viewer + watermark | Yamaç | Viewer component |
| 09:00-13:00 | Analiz sonuç ekranı | Bekir | Analysis UI |
| 09:00-13:00 | Startup keşif + filtreleme | Bartın + Nisa | Discover working |
| 09:00-13:00 | Görünürlük ayarları (mock) | Melisa | Visibility UI |
| 13:00-14:00 | Öğle arası | - | - |
| 14:00-18:00 | Anonim görüntülenme bildirimi (mock) | Sinem | Viewers UI |
| 14:00-18:00 | Haber akışı (mock data) | Bartın | News feed |
| 14:00-18:00 | Aşama talep UI (mock) | Bekir | Request flow UI |
| 14:00-18:00 | End-to-end test | Yamaç + Nisa | Integration test |

### Gün 4: Polish & Demo (23 Aralık)

| Saat | Task | Sorumlu | Output |
|------|------|---------|--------|
| 09:00-12:00 | Bug fix & polish | Herkes | Stable product |
| 09:00-12:00 | Seed data (demo startup'lar, haberler) | Melisa | Demo data |
| 12:00-13:00 | Öğle arası | - | - |
| 13:00-15:00 | Demo script hazırlama | Sinem + Melisa | Demo script |
| 13:00-15:00 | Final UI polish | Bekir + Bartın | Polished UI |
| 15:00-17:00 | Pitch deck güncelleme | Melisa | Updated deck |
| 17:00-18:00 | Demo rehearsal | Herkes | 2x practice run |

### Gün 5: Sunum (24 Aralık)

- Demo & pitch
- Jüri Q&A

---

## 12. Ekip Dağılımı

| Kişi | Rol | Ana Sorumluluklar |
|------|-----|-------------------|
| **Yamaç** | Tech Lead + Backend + DevOps | Backend mimari, DB, deploy, code review |
| **Nisa** | Backend Developer | API endpoints, Auth, CRUD operations |
| **Bekir** | Frontend Developer | Startup dashboard, forms, deck viewer |
| **Bartın** | Frontend Developer | Investor dashboard, discover, news feed |
| **Sinem** | AI Engineer | Prompt engineering, deck analiz, fit skoru |
| **Melisa** | AI Engineer + Demo | AI output formatting, demo prep, pitch deck |

---

## 13. Risk Yönetimi

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| Gemini API rate limit | Düşük | Yüksek | Caching, fallback mock |
| Supabase free tier limit | Düşük | Orta | Optimize queries |
| Scope creep | Yüksek | Yüksek | MVP scope'a sadık kal |
| Auth karmaşıklığı | Orta | Orta | Supabase Auth kullan |
| Demo günü bug | Orta | Yüksek | Happy path odaklı test |

---

## 14. Başarı Kriterleri (Demo için)

### Must Have (Demo'da çalışmalı)
- [ ] Startup kayıt ve profil oluşturma
- [ ] Pitch deck yükleme
- [ ] AI deck analizi ve skor
- [ ] Investor kayıt
- [ ] Startup keşif ve filtreleme
- [ ] Teaser profil görüntüleme
- [ ] Fit skoru gösterimi
- [ ] Güvenli deck viewer (watermark)

### Nice to Have
- [ ] Anonim görüntülenme bildirimi
- [ ] Haber akışı
- [ ] Görünürlük ayarları
- [ ] Aşama talep UI

### Coming Soon (Sadece UI/Pitch)
- [ ] Angel Access Gate
- [ ] Post-deal raporlama
- [ ] Benchmark raporları

---

## 15. Deployment Checklist

### Supabase
- [ ] Production project oluştur
- [ ] `database/migrations/001_initial_schema.sql` çalıştır
- [ ] Storage bucket oluştur (pitch-decks)
- [ ] Auth settings (redirect URLs: localhost + production)

### Vercel (Frontend)
- [ ] GitHub repo bağla (`frontend/` klasörü)
- [ ] Root Directory: `frontend`
- [ ] Environment variables ekle

### Railway (Backend + AI - Tek Hesap)
```
Railway Project: deckmate
├── Service 1: backend
│   ├── Source: GitHub repo
│   ├── Root Directory: backend
│   ├── Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
│   └── Environment: Python 3.11
│
└── Service 2: ai
    ├── Source: GitHub repo
    ├── Root Directory: ai
    ├── Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    └── Environment: Python 3.11
```

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_API_URL=https://deckmate-backend.railway.app
NEXT_PUBLIC_AI_URL=https://deckmate-ai.railway.app
```

**Backend (.env):**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx
AI_SERVICE_URL=https://deckmate-ai.railway.app
FRONTEND_URL=https://deckmate.vercel.app
```

**AI Service (.env):**
```
GEMINI_API_KEY=xxx
BACKEND_URL=https://deckmate-backend.railway.app
```

---

## 16. Sonraki Adımlar (Post-Hackathon)

### V1.1 (Ocak 2026)
- Angel Access Gate implementasyonu
- Rol ayrımı (VC/Angel/Syndicate)
- Gerçek aşama geçiş akışı

### V1.2 (Şubat 2026)
- Benchmark raporları
- Pitch Deck Studio
- Email notifications

### V2 (Q2 2026)
- Post-deal raporlama
- Claim verification
- Mobile app (React Native)

---

*Bu PRD, DeckMate MVP geliştirmesi için teknik referans dökümanıdır.*
*Son güncelleme: 20 Aralık 2025*
