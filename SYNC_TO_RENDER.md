# 🔄 Syncing Your Local Data to Render

## What Gets Synced Automatically

✅ **Code Changes** - YES, automatically synced via Git
- All your code changes are in GitHub
- Render automatically deploys when you push to GitHub
- All features and fixes are included

❌ **Database Data (Ideas/Apps)** - NO, needs manual sync
- Your local database is separate from Render's database
- Ideas you created locally are NOT automatically on Render
- You need to export from localhost and import to Render

---

## How to Sync Your Ideas/Apps to Render

### Step 1: Export Ideas from Localhost

Make sure your local server is running, then run:

```bash
bash export-local-ideas.sh
```

This creates `ideas-export.json` with all your local ideas.

### Step 2: Get Your Render URL

1. Go to https://dashboard.render.com
2. Click on your `iotd-reskin` service
3. Find your service URL (e.g., `https://iotd-reskin.onrender.com`)

### Step 3: Import to Render

```bash
bash import-to-render.sh https://your-render-url.onrender.com
```

Replace `https://your-render-url.onrender.com` with your actual Render URL.

---

## What's Already on Render

- ✅ All your code (from GitHub)
- ✅ Database schema (created automatically on first deploy)
- ✅ Environment variables (you just added them)
- ❌ Your ideas/apps (need to import)

---

## Quick Check

To see how many ideas you have locally:
```bash
curl http://localhost:4000/api/ideas?limit=1 | jq '.total'
```

---

## After Import

Once you import your ideas, Render will have:
- ✅ All your code
- ✅ All your ideas/apps
- ✅ All your features
- ✅ Everything from localhost!
