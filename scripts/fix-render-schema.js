#!/usr/bin/env node
/**
 * Fix Render database schema by adding missing columns
 * This ensures all required columns exist before seeding
 *
 * Robust version with:
 * - Retry logic for database connection
 * - Clear logging at each step
 * - Hard failure on errors (so they appear in Render logs)
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

// All columns that might be missing from older database schemas
const columnsToAdd = [
  { name: 'preview_url', type: 'VARCHAR' },
  { name: 'offer_tiers', type: 'JSONB' },
  { name: 'why_now_analysis', type: 'TEXT' },
  { name: 'proof_signals', type: 'TEXT' },
  { name: 'market_gap', type: 'TEXT' },
  { name: 'execution_plan', type: 'TEXT' },
  { name: 'framework_data', type: 'JSONB' },
  { name: 'trend_analysis', type: 'TEXT' },
  { name: 'storytelling_narrative', type: 'TEXT' },
  { name: 'keyword_data', type: 'JSONB' },
  { name: 'builder_prompts', type: 'JSONB' },
  { name: 'community_signals', type: 'JSONB' },
  { name: 'signal_badges', type: 'TEXT[]' },
];

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

async function verifyIdeasTableExists(client) {
  console.log('[Schema Fix] Verifying ideas table exists...');
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ideas';
  `);

  if (result.rows.length === 0) {
    throw new Error('ideas table does not exist - drizzle-kit push may not have completed');
  }
  console.log('[Schema Fix] ideas table verified');
}

async function addColumnIfMissing(client, col) {
  const checkQuery = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'ideas' AND column_name = $1;
  `;
  const result = await client.query(checkQuery, [col.name]);

  if (result.rows.length === 0) {
    console.log(`[Schema Fix] Adding column: ${col.name} (${col.type})`);
    await client.query(`ALTER TABLE ideas ADD COLUMN ${col.name} ${col.type};`);
    console.log(`[Schema Fix] Added ${col.name}`);
    return true;
  } else {
    console.log(`[Schema Fix] Column already exists: ${col.name}`);
    return false;
  }
}

async function fixSchema() {
  console.log('[Schema Fix] Starting schema fix script...');
  console.log(`[Schema Fix] Will add up to ${columnsToAdd.length} columns if missing`);

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render PostgreSQL
    }
  });

  let client;
  try {
    // Connect with retry logic
    client = await connectWithRetry(pool);

    // Verify the ideas table exists
    await verifyIdeasTableExists(client);

    // Add each missing column
    let addedCount = 0;
    let existingCount = 0;
    const errors = [];

    for (const col of columnsToAdd) {
      try {
        const wasAdded = await addColumnIfMissing(client, col);
        if (wasAdded) {
          addedCount++;
        } else {
          existingCount++;
        }
      } catch (error) {
        console.error(`[Schema Fix] ERROR adding ${col.name}:`, error.message);
        errors.push({ column: col.name, error: error.message });
      }
    }

    console.log(`[Schema Fix] Summary: Added ${addedCount} columns, ${existingCount} already existed`);

    if (errors.length > 0) {
      console.error(`[Schema Fix] ${errors.length} columns failed to add:`);
      errors.forEach(e => console.error(`  - ${e.column}: ${e.error}`));
      throw new Error(`Failed to add ${errors.length} columns`);
    }

    console.log('[Schema Fix] Schema fix complete');

  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the script
fixSchema().then(() => {
  console.log('[Schema Fix] Script finished successfully');
  process.exit(0);
}).catch((err) => {
  console.error('[Schema Fix] FATAL ERROR:', err.message);
  console.error('[Schema Fix] Stack:', err.stack);
  // Exit with error code so Render deployment shows failure
  process.exit(1);
});
