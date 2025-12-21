#!/usr/bin/env node
/**
 * Fix collaboration tables schema by adding missing columns
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('[Schema Fix] DATABASE_URL not set, skipping schema fix');
  process.exit(0);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('render.com') ? {
    rejectUnauthorized: false
  } : undefined
});

async function fixCollaborationSchema() {
  const client = await pool.connect();
  try {
    console.log('[Schema Fix] 🔌 Connected to database');
    
    // Check if collaboration_messages table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'collaboration_messages'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('[Schema Fix] 📝 Creating collaboration_messages table...');
      await client.query(`
        CREATE TABLE collaboration_messages (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          idea_id VARCHAR NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
          user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('[Schema Fix] ✅ Created collaboration_messages table');
    } else {
      // Check if created_at column exists
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'collaboration_messages' AND column_name = 'created_at';
      `);
      
      if (columnCheck.rows.length === 0) {
        console.log('[Schema Fix] ➕ Adding created_at column to collaboration_messages...');
        await client.query(`
          ALTER TABLE collaboration_messages 
          ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        `);
        console.log('[Schema Fix] ✅ Added created_at column');
      } else {
        console.log('[Schema Fix] ✓ created_at column already exists');
        // Double-check by listing all columns
        const allColumns = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'collaboration_messages'
          ORDER BY ordinal_position;
        `);
        console.log('[Schema Fix] All columns in collaboration_messages:', allColumns.rows.map(r => r.column_name).join(', '));
      }
    }
    
    // Check if collaboration_sessions table exists
    const sessionsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'collaboration_sessions'
      );
    `);
    
    if (!sessionsTableCheck.rows[0].exists) {
      console.log('[Schema Fix] 📝 Creating collaboration_sessions table...');
      await client.query(`
        CREATE TABLE collaboration_sessions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          idea_id VARCHAR NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
          user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('[Schema Fix] ✅ Created collaboration_sessions table');
    } else {
      // Check if socket_id column exists and make it nullable if it does
      const socketIdCheck = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'collaboration_sessions' AND column_name = 'socket_id';
      `);
      
      if (socketIdCheck.rows.length > 0 && socketIdCheck.rows[0].is_nullable === 'NO') {
        console.log('[Schema Fix] 🔧 Making socket_id column nullable...');
        await client.query(`
          ALTER TABLE collaboration_sessions 
          ALTER COLUMN socket_id DROP NOT NULL;
        `);
        console.log('[Schema Fix] ✅ Made socket_id nullable');
      } else if (socketIdCheck.rows.length === 0) {
        console.log('[Schema Fix] ℹ️ socket_id column does not exist (this is fine)');
      } else {
        console.log('[Schema Fix] ✓ socket_id is already nullable');
      }
      
      // Check if created_at column exists
      const sessionsColumnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'collaboration_sessions' AND column_name = 'created_at';
      `);
      
      if (sessionsColumnCheck.rows.length === 0) {
        console.log('[Schema Fix] ➕ Adding created_at column to collaboration_sessions...');
        await client.query(`
          ALTER TABLE collaboration_sessions 
          ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        `);
        console.log('[Schema Fix] ✅ Added created_at column');
      } else {
        console.log('[Schema Fix] ✓ created_at column already exists in collaboration_sessions');
      }
    }
    
    console.log('[Schema Fix] ✅ Collaboration schema fix complete!');
  } catch (error) {
    console.error('[Schema Fix] ❌ Error fixing collaboration schema:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixCollaborationSchema()
  .then(() => {
    console.log('[Schema Fix] ✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Schema Fix] ❌ Failed:', error);
    process.exit(1);
  });

