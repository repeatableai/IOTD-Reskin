# 🚀 How to Add Environment Variables to Render (Simple Guide)

## Quick Link
**👉 https://dashboard.render.com/web/iotd-reskin/env**

This link takes you directly to where you add environment variables.

---

## Step-by-Step Instructions

### Step 1: Get Your Environment Variables

Run this command in your terminal:
```bash
bash scripts/copy-env-to-render.sh
```

This will show you all your environment variable values.

---

### Step 2: Go to Render Dashboard

Click this link: **https://dashboard.render.com/web/iotd-reskin/env**

You should see a page that looks like this:
- A list of existing environment variables (if any)
- A button that says **"Add Environment Variable"** or **"Add"**

---

### Step 3: Add Each Variable

For **EACH** variable shown by the script, do this:

1. **Click the "Add Environment Variable" button**

2. **In the "Key" field**, paste the variable name:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `SERP_API_KEY`
   - `UNSPLASH_ACCESS_KEY`

3. **In the "Value" field**, paste the value from the script output

4. **Click "Save Changes"** (or "Add")

5. **Repeat** for the next variable

---

### Step 4: Verify

After adding all variables, you should see them listed on the page.

Render will automatically redeploy your app when you save environment variables.

---

## Example

If the script shows:
```
Variable 1: ANTHROPIC_API_KEY
Value: sk-ant-api03-abc123...
```

Then in Render:
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: `sk-ant-api03-abc123...`
- Click Save

---

## Troubleshooting

**Q: I don't see the "Add Environment Variable" button**
- Make sure you're logged into Render
- Make sure you're on the right service (`iotd-reskin`)

**Q: The link doesn't work**
- Go to https://dashboard.render.com
- Click on your `iotd-reskin` service
- Click on "Environment" in the left sidebar

**Q: I can't find my .env file**
- It should be in the root of your project: `/Users/steen/ai-voice-agent/IOTD-Reskin/.env`
- If it's not there, check if it's hidden (files starting with `.` are hidden)

---

## Quick Reference

**Direct Link**: https://dashboard.render.com/web/iotd-reskin/env

**Variables to Add**:
1. `ANTHROPIC_API_KEY` (Required)
2. `OPENAI_API_KEY` (Optional)
3. `SERP_API_KEY` (Optional)
4. `UNSPLASH_ACCESS_KEY` (Optional)

**Script to Run**: `bash scripts/copy-env-to-render.sh`

