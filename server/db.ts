import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using Neon (for Replit) or standard PostgreSQL (for Render/local)
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // Use Neon serverless for Replit/Neon hosting
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle: drizzleNeonServerless } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');

  neonConfig.webSocketConstructor = ws.default;

  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeonServerless({ client: pool, schema });
} else {
  // Use standard pg for Render, Railway, local development, etc.
  const pg = await import('pg');
  const { drizzle: drizzleNodePostgres } = await import('drizzle-orm/node-postgres');

  pool = new pg.default.Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  db = drizzleNodePostgres(pool, { schema });
}

export { pool, db };
