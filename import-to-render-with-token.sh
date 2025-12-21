#!/bin/bash
# Import ideas from JSON file to Render using import token

RENDER_URL="${1}"
EXPORT_FILE="${2:-ideas-export.json}"
IMPORT_TOKEN="iotd-initial-sync-2024-12-17"

if [ -z "$RENDER_URL" ]; then
    echo "ERROR: Render URL required"
    echo "Usage: ./import-to-render-with-token.sh <render-url> [export-file.json]"
    echo ""
    echo "To find your Render URL:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click on your 'iotd-reskin' service"
    echo "3. Copy the URL (e.g., https://iotd-reskin-xxxx.onrender.com)"
    exit 1
fi

if [ ! -f "$EXPORT_FILE" ]; then
    echo "ERROR: Export file not found: $EXPORT_FILE"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "  IMPORTING IDEAS TO RENDER"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Render URL: $RENDER_URL"
echo "Export file: $EXPORT_FILE"
echo "File size: $(du -h "$EXPORT_FILE" | cut -f1)"
echo ""

# Check if file is valid JSON
if ! python3 -c "import json; json.load(open('$EXPORT_FILE'))" 2>/dev/null; then
    echo "ERROR: Invalid JSON file"
    exit 1
fi

echo "Uploading and importing ideas..."
echo "Note: This may take several minutes for 800+ ideas..."
echo ""

# Use the import token to bypass auth requirement
curl -X POST "$RENDER_URL/api/admin/import-ideas?importToken=$IMPORT_TOKEN" \
  -F "file=@$EXPORT_FILE" \
  --fail-with-body \
  -w "\nHTTP Status: %{http_code}\n" \
  2>&1 | tee /tmp/import-response.json

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import complete!"
    echo "Check the response above for details."
else
    echo ""
    echo "❌ Import failed. Check the error message above."
    echo ""
    echo "Common issues:"
    echo "1. Make sure your Render URL is correct"
    echo "2. Make sure Render service is running"
    echo "3. Check Render logs for errors"
fi

