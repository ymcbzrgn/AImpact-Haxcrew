-- DeckMate Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('startup', 'investor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STARTUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    website TEXT,
    industry TEXT,
    stage TEXT CHECK (stage IN ('idea', 'mvp', 'early', 'growth', 'scale')),
    funding_stage TEXT CHECK (funding_stage IN ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c+')),
    funding_ask DECIMAL(15, 2),
    team_size INTEGER,
    founded_year INTEGER,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- INVESTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    firm_name TEXT,
    investor_type TEXT CHECK (investor_type IN ('angel', 'vc', 'corporate', 'family-office')),
    check_size_min DECIMAL(15, 2),
    check_size_max DECIMAL(15, 2),
    preferred_stages TEXT[], -- Array of stages
    preferred_industries TEXT[], -- Array of industries
    location TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- PITCH DECKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pitch_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    ai_analysis JSONB,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FIT SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.fit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    breakdown JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(startup_id, investor_id)
);

-- ============================================
-- SAVED STARTUPS (Investor Bookmarks)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investor_id, startup_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DEMO-SAFE MODE
-- ============================================
-- NOT: Hackathon için RLS KAPALI!
-- Production'da aşağıdaki policy'leri aktif edin.

-- Demo için RLS kapalı bırak (hızlı geliştirme)
-- Supabase Dashboard'dan da kapatılabilir

/*
-- PRODUCTION'DA AKTİF EDİLECEK:

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Startups are viewable by everyone" ON public.startups
    FOR SELECT USING (true);

CREATE POLICY "Startups are editable by owner" ON public.startups
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Investors are viewable by everyone" ON public.investors
    FOR SELECT USING (true);

CREATE POLICY "Investors are editable by owner" ON public.investors
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Pitch decks viewable by authenticated" ON public.pitch_decks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Pitch decks editable by startup owner" ON public.pitch_decks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.startups
            WHERE startups.id = pitch_decks.startup_id
            AND startups.user_id = auth.uid()
        )
    );

CREATE POLICY "Fit scores viewable by related users" ON public.fit_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.startups WHERE startups.id = fit_scores.startup_id AND startups.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.investors WHERE investors.id = fit_scores.investor_id AND investors.user_id = auth.uid()
        )
    );

CREATE POLICY "Saved startups viewable by investor" ON public.saved_startups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.investors
            WHERE investors.id = saved_startups.investor_id
            AND investors.user_id = auth.uid()
        )
    );
*/

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON public.startups(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON public.investors(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_startup_id ON public.pitch_decks(startup_id);
CREATE INDEX IF NOT EXISTS idx_fit_scores_startup_id ON public.fit_scores(startup_id);
CREATE INDEX IF NOT EXISTS idx_fit_scores_investor_id ON public.fit_scores(investor_id);
CREATE INDEX IF NOT EXISTS idx_fit_scores_score ON public.fit_scores(score DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
    BEFORE UPDATE ON public.startups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON public.investors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitch_decks_updated_at
    BEFORE UPDATE ON public.pitch_decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
