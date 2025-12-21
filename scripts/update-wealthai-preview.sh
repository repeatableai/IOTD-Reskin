#!/bin/bash
# Update WealthAI Pro previewUrl

curl -X POST "https://iotd-reskin.onrender.com/api/admin/update-preview-urls?importToken=iotd-initial-sync-2024-12-17" \
  -F "file=@ideas-export.json" \
  2>&1 | python3 -m json.tool

echo ""
echo "Now updating WealthAI Pro specifically..."

# We'll need to create an endpoint for this or use a direct SQL update
# For now, let's check if the update worked

