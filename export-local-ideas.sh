#!/bin/bash
# Export all ideas from localhost to JSON file

echo "Exporting ideas from localhost..."
echo "Make sure your local server is running on http://localhost:4000"

# Check if server is running
if ! curl -s http://localhost:4000/api/auth/user > /dev/null 2>&1; then
    echo "ERROR: Server is not running on localhost:4000"
    echo "Please start your server first: npm run dev"
    exit 1
fi

# Export ideas (you'll need to be authenticated)
echo "Downloading ideas..."
curl -X GET "http://localhost:4000/api/admin/export-ideas" \
  -H "Cookie: $(cat ~/.local-cookie 2>/dev/null || echo '')" \
  -o ideas-export.json \
  --fail-with-body

if [ $? -eq 0 ]; then
    echo "✅ Export complete! File saved to: ideas-export.json"
    echo "📊 File size: $(du -h ideas-export.json | cut -f1)"
else
    echo "❌ Export failed. You may need to:"
    echo "   1. Set ALLOW_BULK_EXPORT=true in your .env file"
    echo "   2. Make sure you're authenticated (logged in)"
    echo "   3. Check server logs for errors"
fi

