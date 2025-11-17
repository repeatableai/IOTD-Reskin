import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using local PostgreSQL or Neon
const isLocalPostgres = process.env.DATABASE_URL.includes('localhost') ||
                         process.env.DATABASE_URL.includes('127.0.0.1');

let pool: any;
let db: any;

if (isLocalPostgres) {
  // Use standard pg for local development
  const pg = await import('pg');
  const { drizzle: drizzleNodePostgres } = await import('drizzle-orm/node-postgres');

  pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNodePostgres(pool, { schema });
} else {
  // Use Neon serverless for production
  const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle: drizzleNeonServerless } = await import('drizzle-orm/neon-serverless');
  const ws = await import('ws');

  neonConfig.webSocketConstructor = ws.default;

  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeonServerless({ client: pool, schema });
}

export { pool, db };
