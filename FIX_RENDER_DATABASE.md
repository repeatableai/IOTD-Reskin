# Fix Render Database Schema

## Problem
Render's database is missing the `preview_url` column, causing import to fail.

## Solution

Render should automatically run migrations on startup (via `start:migrate` command), but if the database was created before this column was added, you need to manually trigger migrations.

### Option 1: Restart Render Service (Recommended)

1. Go to: https://dashboard.render.com
2. Click on your `iotd-reskin` service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. This will restart the service and run migrations

### Option 2: Run Migrations Manually via Render Shell

1. Go to your Render service page
2. Click "Shell" tab (if available)
3. Run: `npx drizzle-kit push`

### Option 3: Add Column Manually (Quick Fix)

If you have database access, run this SQL:

```sql
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS preview_url VARCHAR;
```

---

## After Fixing

Once the database schema is updated, run the import again:

```bash
bash import-to-render-with-token.sh https://iotd-reskin.onrender.com
```

---

## Verify Schema

To check if the column exists, you can query Render's database or check the logs during startup for migration messages.

