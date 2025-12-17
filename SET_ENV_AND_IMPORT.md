# Quick Steps to Enable Import on Render

## Step 1: Set Environment Variable (2 minutes)

1. Go to: https://dashboard.render.com
2. Click on service: **iotd-reskin**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `ALLOW_BULK_IMPORT`
   - **Value**: `true`
6. Click **Save Changes**
7. Wait ~30 seconds for service to restart

## Step 2: I'll Import Automatically

Once you've set the env var, tell me and I'll immediately run the import command again.

Or you can run it yourself:
```bash
curl -X POST "https://iotd-reskin.onrender.com/api/admin/import-ideas" \
  -F "file=@ideas-export.json" \
  --progress-bar
```

## Alternative: Quick Import Script

If you prefer, I can create a script that checks if the env var is set and imports automatically.

