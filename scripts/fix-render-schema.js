#!/usr/bin/env node
/**
 * Fix Render database schema by adding missing columns
 * This ensures all required columns exist before seeding
 */
import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('[Schema Fix] DATABASE_URL not set, skipping schema fix');
  process.exit(0);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

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
  { name: 'keyword_data', type: 'JSONB' },
  { name: 'builder_prompts', type: 'JSONB' },
  { name: 'community_signals', type: 'JSONB' },
  { name: 'signal_badges', type: 'TEXT[]' },
];

async function fixSchema() {
  const client = await pool.connect();
  try {
    console.log('[Schema Fix] 🔌 Connected to database');
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const col of columnsToAdd) {
      try {
        const checkQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'ideas' AND column_name = $1;
        `;
        const result = await client.query(checkQuery, [col.name]);
        
        if (result.rows.length === 0) {
          console.log(`[Schema Fix] ➕ Adding column: ${col.name} (${col.type})`);
          await client.query(`ALTER TABLE ideas ADD COLUMN ${col.name} ${col.type};`);
          console.log(`[Schema Fix] ✅ Added ${col.name}`);
          addedCount++;
        } else {
          existingCount++;
        }
      } catch (error) {
        console.error(`[Schema Fix] ❌ Error adding ${col.name}:`, error.message);
      }
    }
    
    // Fix collaboration_sessions socket_id column (make it nullable)
    try {
      const socketIdCheck = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'collaboration_sessions' AND column_name = 'socket_id';
      `);
      
      if (socketIdCheck.rows.length > 0 && socketIdCheck.rows[0].is_nullable === 'NO') {
        console.log(`[Schema Fix] 🔧 Making socket_id column nullable in collaboration_sessions...`);
        await client.query(`
          ALTER TABLE collaboration_sessions 
          ALTER COLUMN socket_id DROP NOT NULL;
        `);
        console.log(`[Schema Fix] ✅ Made socket_id nullable`);
      }
    } catch (error) {
      console.error(`[Schema Fix] ⚠️ Could not fix socket_id column:`, error.message);
    }
    
    console.log(`[Schema Fix] ✅ Schema fix complete! Added ${addedCount} columns, ${existingCount} already existed`);
  } catch (error) {
    console.error('[Schema Fix] ❌ Error fixing schema:', error.message);
    // Don't throw - allow server to start even if schema fix fails
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema();

