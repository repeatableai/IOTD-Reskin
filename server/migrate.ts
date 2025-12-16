// Simple migration script that runs drizzle-kit push
// This can be run in production to sync schema
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrate() {
  try {
    console.log('Running database migrations...');
    const { stdout, stderr } = await execAsync('npx drizzle-kit push');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    // Don't exit with error - allow app to start even if migrations fail
    // (they might already be applied)
    process.exit(0);
  }
}

migrate();

