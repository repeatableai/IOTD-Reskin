#!/bin/bash
# Auto-import script that checks if Render is ready and imports

RENDER_URL="${1:-https://iotd-reskin.onrender.com}"
EXPORT_FILE="${2:-ideas-export.json}"
MAX_RETRIES=10
RETRY_DELAY=30

echo "🚀 Auto-Import to Render"
echo "========================"
echo "Render URL: $RENDER_URL"
echo "Export file: $EXPORT_FILE"
echo ""

# Check if file exists
if [ ! -f "$EXPORT_FILE" ]; then
    echo "❌ ERROR: Export file not found: $EXPORT_FILE"
    exit 1
fi

echo "📦 File ready: $(du -h "$EXPORT_FILE" | cut -f1)"
echo ""

# Function to check if import is enabled
check_import_enabled() {
    local response=$(curl -s -X POST "$RENDER_URL/api/admin/import-ideas" \
        -F "file=@$EXPORT_FILE" 2>&1)
    
    if echo "$response" | grep -q "ALLOW_BULK_IMPORT"; then
        return 1  # Not enabled
    else
        return 0  # Enabled or different error
    fi
}

# Function to do the import
do_import() {
    echo "📤 Uploading and importing 809 ideas..."
    echo "⏳ This will take 5-10 minutes..."
    echo ""
    
    curl -X POST "$RENDER_URL/api/admin/import-ideas" \
        -F "file=@$EXPORT_FILE" \
        --max-time 600 \
        --progress-bar \
        -o /tmp/import-result.json
    
    return $?
}

# Try importing
echo "🔄 Attempting import..."
echo ""

if check_import_enabled; then
    echo "✅ Import endpoint is accessible!"
    do_import
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Import completed!"
        echo ""
        echo "Result:"
        cat /tmp/import-result.json | python3 -m json.tool 2>/dev/null || cat /tmp/import-result.json
    else
        echo ""
        echo "❌ Import failed. Check result above."
        cat /tmp/import-result.json
    fi
else
    echo "❌ Import is disabled. ALLOW_BULK_IMPORT=true needs to be set."
    echo ""
    echo "📋 To enable:"
    echo "   1. Go to https://dashboard.render.com"
    echo "   2. Select service: iotd-reskin"
    echo "   3. Go to Environment tab"
    echo "   4. Add: ALLOW_BULK_IMPORT = true"
    echo "   5. Save and wait 30 seconds"
    echo ""
    echo "🔄 This script will retry automatically..."
    echo ""
    
    # Retry loop
    for i in $(seq 1 $MAX_RETRIES); do
        echo "⏳ Waiting $RETRY_DELAY seconds before retry $i/$MAX_RETRIES..."
        sleep $RETRY_DELAY
        
        echo "🔄 Retrying..."
        if check_import_enabled; then
            echo "✅ Import enabled! Starting import..."
            do_import
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅✅ Import completed successfully!"
                echo ""
                echo "Result:"
                cat /tmp/import-result.json | python3 -m json.tool 2>/dev/null || cat /tmp/import-result.json
                exit 0
            fi
        else
            echo "⏸️  Still disabled. Will retry..."
        fi
    done
    
    echo ""
    echo "❌ Max retries reached. Please set ALLOW_BULK_IMPORT=true manually and run:"
    echo "   ./import-to-render.sh $RENDER_URL"
fi

