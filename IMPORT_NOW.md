# 🚀 Import 809 Ideas to Render - Quick Guide

## ✅ Prerequisites Check

- [x] Code pushed to GitHub ✓
- [x] 809 ideas exported to `ideas-export.json` ✓
- [ ] Render service deployed (check Render dashboard)
- [ ] `ALLOW_BULK_IMPORT=true` set in Render environment variables

## 📋 Step-by-Step Instructions

### Step 1: Set Environment Variable on Render

1. Go to https://dashboard.render.com
2. Click on your service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `ALLOW_BULK_IMPORT`
   - **Value**: `true`
6. Click **Save Changes**
7. Wait for service to restart (check Events tab)

### Step 2: Get Your Render URL

Your Render URL should look like: `https://your-app-name.onrender.com`

Find it in:
- Render dashboard → Your service → Settings → URL
- Or check the "Live" link in your service

### Step 3: Import Ideas

**Option A: Using the bash script (easiest)**

```bash
# Replace YOUR_RENDER_URL with your actual Render URL
./import-to-render.sh https://YOUR_RENDER_URL.onrender.com
```

**Option B: Using curl (if script doesn't work)**

```bash
# Replace YOUR_RENDER_URL with your actual Render URL
curl -X POST "https://YOUR_RENDER_URL.onrender.com/api/admin/import-ideas" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@ideas-export.json" \
  --progress-bar \
  -o import-result.json

# Check result
cat import-result.json | python3 -m json.tool
```

**Option C: Using Node.js script**

```bash
# Install form-data if needed
npm install form-data

# Run import (replace YOUR_RENDER_URL)
node import-to-render.js https://YOUR_RENDER_URL.onrender.com
```

### Step 4: Verify Import

1. Check Render logs (should show import progress)
2. Visit your Render app
3. You should see all 809 ideas!

## ⏱️ Expected Time

- **Import duration**: 5-10 minutes for 809 ideas
- **Progress**: Logged every 50 ideas in Render logs

## 🐛 Troubleshooting

**403 Forbidden:**
```
Make sure ALLOW_BULK_IMPORT=true is set in Render environment variables
```

**401 Unauthorized:**
```
In production, you need to be logged in. Try:
1. Visit your Render app in browser
2. Log in
3. Then run the import script
```

**Connection timeout:**
```
Render might be spinning down. Try:
1. Visit your Render app first (wakes it up)
2. Wait 30 seconds
3. Run import again
```

**Import seems stuck:**
```
Check Render logs - it shows progress every 50 ideas
Large imports take 5-10 minutes, be patient!
```

## 📊 What You'll See

After successful import:
- ✅ 809 ideas in your Render app
- ✅ All tags and relationships
- ✅ All community signals
- ✅ All metadata preserved

## 🎯 Quick Command

```bash
# Just replace YOUR_RENDER_URL with your actual URL:
./import-to-render.sh https://YOUR_RENDER_URL.onrender.com
```

That's it! Your Render app will have all 809 ideas matching localhost.

