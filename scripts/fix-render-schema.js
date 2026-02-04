#!/usr/bin/env node
/**
 * Fix Render database schema by adding missing columns
 * Uses a PostgreSQL DO block for atomic, idempotent column additions
 */
import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

if (!DATABASE_URL) {
  console.log('[Schema Fix] DATABASE_URL not set, skipping schema fix');
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectWithRetry(pool) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Schema Fix] Connection attempt ${attempt}/${MAX_RETRIES}...`);
      const client = await pool.connect();
      console.log('[Schema Fix] Connected to database');
      return client;
    } catch (error) {
      console.error(`[Schema Fix] Connection attempt ${attempt} failed:`, error.message);
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to connect after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      console.log(`[Schema Fix] Waiting ${RETRY_DELAY_MS}ms before retry...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

// SQL migration that adds all missing columns atomically
const MIGRATION_SQL = `
DO $$
BEGIN
    RAISE NOTICE '[Schema Fix] Starting column migration...';

    -- preview_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'preview_url') THEN
        ALTER TABLE ideas ADD COLUMN preview_url VARCHAR;
        RAISE NOTICE '[Schema Fix] Added column: preview_url';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: preview_url';
    END IF;

    -- offer_tiers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'offer_tiers') THEN
        ALTER TABLE ideas ADD COLUMN offer_tiers JSONB;
        RAISE NOTICE '[Schema Fix] Added column: offer_tiers';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: offer_tiers';
    END IF;

    -- why_now_analysis
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'why_now_analysis') THEN
        ALTER TABLE ideas ADD COLUMN why_now_analysis TEXT;
        RAISE NOTICE '[Schema Fix] Added column: why_now_analysis';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: why_now_analysis';
    END IF;

    -- proof_signals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'proof_signals') THEN
        ALTER TABLE ideas ADD COLUMN proof_signals TEXT;
        RAISE NOTICE '[Schema Fix] Added column: proof_signals';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: proof_signals';
    END IF;

    -- market_gap
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'market_gap') THEN
        ALTER TABLE ideas ADD COLUMN market_gap TEXT;
        RAISE NOTICE '[Schema Fix] Added column: market_gap';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: market_gap';
    END IF;

    -- execution_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'execution_plan') THEN
        ALTER TABLE ideas ADD COLUMN execution_plan TEXT;
        RAISE NOTICE '[Schema Fix] Added column: execution_plan';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: execution_plan';
    END IF;

    -- framework_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'framework_data') THEN
        ALTER TABLE ideas ADD COLUMN framework_data JSONB;
        RAISE NOTICE '[Schema Fix] Added column: framework_data';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: framework_data';
    END IF;

    -- trend_analysis
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'trend_analysis') THEN
        ALTER TABLE ideas ADD COLUMN trend_analysis TEXT;
        RAISE NOTICE '[Schema Fix] Added column: trend_analysis';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: trend_analysis';
    END IF;

    -- storytelling_narrative
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'storytelling_narrative') THEN
        ALTER TABLE ideas ADD COLUMN storytelling_narrative TEXT;
        RAISE NOTICE '[Schema Fix] Added column: storytelling_narrative';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: storytelling_narrative';
    END IF;

    -- keyword_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'keyword_data') THEN
        ALTER TABLE ideas ADD COLUMN keyword_data JSONB;
        RAISE NOTICE '[Schema Fix] Added column: keyword_data';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: keyword_data';
    END IF;

    -- builder_prompts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'builder_prompts') THEN
        ALTER TABLE ideas ADD COLUMN builder_prompts JSONB;
        RAISE NOTICE '[Schema Fix] Added column: builder_prompts';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: builder_prompts';
    END IF;

    -- community_signals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'community_signals') THEN
        ALTER TABLE ideas ADD COLUMN community_signals JSONB;
        RAISE NOTICE '[Schema Fix] Added column: community_signals';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: community_signals';
    END IF;

    -- signal_badges
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'signal_badges') THEN
        ALTER TABLE ideas ADD COLUMN signal_badges TEXT[];
        RAISE NOTICE '[Schema Fix] Added column: signal_badges';
    ELSE
        RAISE NOTICE '[Schema Fix] Column exists: signal_badges';
    END IF;

    RAISE NOTICE '[Schema Fix] Column migration complete';
END $$;
`;

async function fixSchema() {
  console.log('[Schema Fix] Starting schema fix script...');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  let client;
  try {
    client = await connectWithRetry(pool);

    // First check if ideas table exists
    console.log('[Schema Fix] Checking if ideas table exists...');
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'ideas';
    `);

    if (tableCheck.rows.length === 0) {
      console.log('[Schema Fix] ideas table does not exist yet - drizzle-kit push should create it');
      console.log('[Schema Fix] Skipping column additions (table will be created with all columns)');
      return;
    }

    console.log('[Schema Fix] ideas table found, running migration...');

    // Run the migration
    await client.query(MIGRATION_SQL);

    // Verify the storytelling_narrative column specifically
    const verifyResult = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ideas' AND column_name = 'storytelling_narrative';
    `);

    if (verifyResult.rows.length > 0) {
      console.log('[Schema Fix] VERIFIED: storytelling_narrative column exists');
    } else {
      throw new Error('CRITICAL: storytelling_narrative column was NOT added');
    }

    console.log('[Schema Fix] Schema fix complete');

  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

fixSchema().then(() => {
  console.log('[Schema Fix] Script finished successfully');
  process.exit(0);
}).catch((err) => {
  console.error('[Schema Fix] FATAL ERROR:', err.message);
  console.error('[Schema Fix] Stack:', err.stack);
  process.exit(1);
});
