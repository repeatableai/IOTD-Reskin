# Add preview_url Column to Render Database

## Quick Steps

### 1. Get Your Render Database URL

1. Go to: **https://dashboard.render.com**
2. Click **"Databases"** in the left sidebar
3. Click on **`iotd-db`** (your database)
4. Find the **"Internal Database URL"** or **"Connection String"**
5. **Copy the entire URL** (it looks like: `postgresql://user:pass@host/dbname`)

### 2. Run the Script

Open your terminal and run:

```bash
cd /Users/steen/ai-voice-agent/IOTD-Reskin
DATABASE_URL="paste-your-render-db-url-here" node scripts/add-preview-url-column.js
```

**Replace `paste-your-render-db-url-here` with the URL you copied from Render.**

### 3. Verify Success

You should see:
```
🔌 Connected to database
📋 Checking if preview_url column exists...
➕ Adding preview_url column...
✅ Successfully added preview_url column!
✅ Verification: Column exists in database
```

---

## After Adding the Column

Once the column is added, run the import:

```bash
bash import-to-render-with-token.sh https://iotd-reskin.onrender.com
```

This will import all 809 ideas from your local database to Render!

---

## Troubleshooting

**If you get "connection refused":**
- Make sure you're using the **Internal Database URL** (not external)
- Check that your database is running in Render

**If you get "permission denied":**
- Make sure you copied the **entire** connection string including username and password
- The URL should start with `postgresql://`

**If the column already exists:**
- That's fine! The script will tell you and skip adding it
- You can proceed directly to the import step

