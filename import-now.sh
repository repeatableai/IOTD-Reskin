#!/bin/bash
# Import ideas to Render with automatic retry

RENDER_URL="https://iotd-reskin.onrender.com"
EXPORT_FILE="ideas-export.json"
IMPORT_TOKEN="iotd-initial-sync-2024-12-17"

echo "🚀 Importing 809 ideas to Render"
echo "================================"
echo ""

# Wait for deployment and retry
for attempt in {1..5}; do
    echo "📤 Attempt $attempt: Uploading ideas..."
    
    result=$(curl -s -X POST "$RENDER_URL/api/admin/import-ideas?importToken=$IMPORT_TOKEN" \
        -F "file=@$EXPORT_FILE" \
        --max-time 600 \
        -w "\n%{http_code}")
    
    http_code=$(echo "$result" | tail -1)
    response=$(echo "$result" | head -n -1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅✅ SUCCESS! Import completed!"
        echo ""
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        exit 0
    elif echo "$response" | grep -q "ALLOW_BULK_IMPORT"; then
        echo "⏳ Code not deployed yet (or token not working). Waiting 45 seconds..."
        sleep 45
    else
        echo "❌ Error (HTTP $http_code):"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        exit 1
    fi
done

echo "❌ Max attempts reached. Please check Render deployment status."

