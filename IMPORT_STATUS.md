# Import Status

## Current Issue
Render's database is missing the `preview_url` column, causing import to fail.

## Fix Applied
✅ Code updated to exclude `previewUrl` from import (line 4572 in `server/routes.ts`)
✅ Code pushed to GitHub (commit: d203837)

## Next Steps

### Option 1: Wait for Auto-Deploy (Recommended)
Render should auto-deploy from GitHub. Wait 2-3 minutes, then try import again:
```bash
bash import-to-render-with-token.sh https://iotd-reskin.onrender.com
```

### Option 2: Manual Deploy
1. Go to: https://dashboard.render.com
2. Click on `iotd-reskin` service
3. Click "Manual Deploy" → "Clear build cache & deploy"

### Option 3: Add Column Manually (Quick Fix)
If you have database access, run:
```sql
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS preview_url VARCHAR;
```

Then run migrations to sync schema:
```bash
# In Render shell or locally with Render DATABASE_URL
npx drizzle-kit push
```

---

## After Fix
Once the code is deployed OR the column is added, run:
```bash
bash import-to-render-with-token.sh https://iotd-reskin.onrender.com
```

This will import all 809 ideas from your local database to Render.

