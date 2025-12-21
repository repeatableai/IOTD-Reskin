# How to Get Your Render Database URL

## Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in to your account

## Step 2: Find Your Database
1. Click "Databases" in the left sidebar
2. Click on your database (should be named `iotd-db`)

## Step 3: Get the Connection String
You'll see several connection options. Use one of these:

### Option A: Internal Database URL (Recommended)
- Look for "Internal Database URL" 
- Copy the entire connection string
- It looks like: `postgresql://iotd_user:password@dpg-xxxxx-a/iotd`

### Option B: External Connection String
- Look for "Connection String" or "External Connection"
- Copy the entire string
- It looks like: `postgresql://iotd_user:password@dpg-xxxxx-a.oregon-postgres.render.com/iotd`

## Step 4: Use It
Once you have the URL, run:
```bash
DATABASE_URL="your-copied-url-here" node scripts/add-preview-url-column.js
```

---

## Alternative: Quick Copy Method
1. In Render dashboard, click on `iotd-db`
2. Look for the connection string section
3. Click the copy button next to the URL
4. Paste it into the command above

