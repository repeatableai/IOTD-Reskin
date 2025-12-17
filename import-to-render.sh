#!/bin/bash
# Import ideas from JSON file to Render

RENDER_URL="${1:-https://your-app.onrender.com}"
EXPORT_FILE="${2:-ideas-export.json}"

if [ ! -f "$EXPORT_FILE" ]; then
    echo "ERROR: Export file not found: $EXPORT_FILE"
    echo "Usage: ./import-to-render.sh <render-url> [export-file.json]"
    exit 1
fi

echo "Importing ideas to Render..."
echo "Render URL: $RENDER_URL"
echo "Export file: $EXPORT_FILE"
echo "File size: $(du -h "$EXPORT_FILE" | cut -f1)"
echo ""

# Check if file exists and is valid JSON
if ! python3 -c "import json; json.load(open('$EXPORT_FILE'))" 2>/dev/null; then
    echo "ERROR: Invalid JSON file"
    exit 1
fi

echo "Uploading and importing ideas..."
echo "Note: This may take several minutes for 800+ ideas..."
echo ""

curl -X POST "$RENDER_URL/api/admin/import-ideas" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@$EXPORT_FILE" \
  --fail-with-body \
  | python3 -m json.tool

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import complete!"
else
    echo ""
    echo "❌ Import failed. Make sure:"
    echo "   1. ALLOW_BULK_IMPORT=true is set in Render environment variables"
    echo "   2. You're authenticated (logged in) on Render"
    echo "   3. The Render URL is correct"
fi

