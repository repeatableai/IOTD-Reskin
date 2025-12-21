#!/usr/bin/env node
/**
 * Script to add preview_url column to Render database
 * Usage: DATABASE_URL=<render-db-url> node scripts/add-preview-url-column.js
 */

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  DATABASE_URL="postgresql://..." node scripts/add-preview-url-column.js');
  console.error('');
  console.error('To get your Render DATABASE_URL:');
  console.error('  1. Go to https://dashboard.render.com');
  console.error('  2. Click on your database (iotd-db)');
  console.error('  3. Copy the "Internal Database URL" or "Connection String"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function addColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database');
    console.log('📋 Checking if preview_url column exists...');
    
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ideas' AND column_name = 'preview_url';
    `;
    
    const result = await client.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Column preview_url already exists!');
      return;
    }
    
    console.log('➕ Adding preview_url column...');
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE ideas 
      ADD COLUMN preview_url VARCHAR;
    `;
    
    await client.query(addColumnQuery);
    
    console.log('✅ Successfully added preview_url column!');
    
    // Verify it was added
    const verifyResult = await client.query(checkQuery);
    if (verifyResult.rows.length > 0) {
      console.log('✅ Verification: Column exists in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumn();

