-- Add missing columns to ideas table
-- These columns may not exist in older database schemas

-- Add columns only if they don't exist (PostgreSQL 9.6+)
DO $$
BEGIN
    -- preview_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'preview_url') THEN
        ALTER TABLE ideas ADD COLUMN preview_url VARCHAR;
        RAISE NOTICE 'Added column: preview_url';
    END IF;

    -- offer_tiers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'offer_tiers') THEN
        ALTER TABLE ideas ADD COLUMN offer_tiers JSONB;
        RAISE NOTICE 'Added column: offer_tiers';
    END IF;

    -- why_now_analysis
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'why_now_analysis') THEN
        ALTER TABLE ideas ADD COLUMN why_now_analysis TEXT;
        RAISE NOTICE 'Added column: why_now_analysis';
    END IF;

    -- proof_signals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'proof_signals') THEN
        ALTER TABLE ideas ADD COLUMN proof_signals TEXT;
        RAISE NOTICE 'Added column: proof_signals';
    END IF;

    -- market_gap
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'market_gap') THEN
        ALTER TABLE ideas ADD COLUMN market_gap TEXT;
        RAISE NOTICE 'Added column: market_gap';
    END IF;

    -- execution_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'execution_plan') THEN
        ALTER TABLE ideas ADD COLUMN execution_plan TEXT;
        RAISE NOTICE 'Added column: execution_plan';
    END IF;

    -- framework_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'framework_data') THEN
        ALTER TABLE ideas ADD COLUMN framework_data JSONB;
        RAISE NOTICE 'Added column: framework_data';
    END IF;

    -- trend_analysis
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'trend_analysis') THEN
        ALTER TABLE ideas ADD COLUMN trend_analysis TEXT;
        RAISE NOTICE 'Added column: trend_analysis';
    END IF;

    -- storytelling_narrative
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'storytelling_narrative') THEN
        ALTER TABLE ideas ADD COLUMN storytelling_narrative TEXT;
        RAISE NOTICE 'Added column: storytelling_narrative';
    END IF;

    -- keyword_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'keyword_data') THEN
        ALTER TABLE ideas ADD COLUMN keyword_data JSONB;
        RAISE NOTICE 'Added column: keyword_data';
    END IF;

    -- builder_prompts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'builder_prompts') THEN
        ALTER TABLE ideas ADD COLUMN builder_prompts JSONB;
        RAISE NOTICE 'Added column: builder_prompts';
    END IF;

    -- community_signals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'community_signals') THEN
        ALTER TABLE ideas ADD COLUMN community_signals JSONB;
        RAISE NOTICE 'Added column: community_signals';
    END IF;

    -- signal_badges
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'signal_badges') THEN
        ALTER TABLE ideas ADD COLUMN signal_badges TEXT[];
        RAISE NOTICE 'Added column: signal_badges';
    END IF;
END $$;
