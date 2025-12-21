#!/bin/bash

# Simple script to show environment variables for copying to Render

echo "=========================================="
echo "🔐 YOUR ENVIRONMENT VARIABLES FOR RENDER"
echo "=========================================="
echo ""
echo "📋 STEP 1: Go to this link:"
echo "👉 https://dashboard.render.com/web/iotd-reskin/env"
echo ""
echo "📋 STEP 2: Copy each variable below and add it to Render:"
echo ""
echo "----------------------------------------"
echo ""

# Read .env file and extract variables
if [ -f .env ]; then
    # Extract ANTHROPIC_API_KEY
    if grep -q "ANTHROPIC_API_KEY" .env; then
        ANTHROPIC=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Variable 1: ANTHROPIC_API_KEY"
        echo "Value: $ANTHROPIC"
        echo ""
        echo "---"
        echo ""
    fi
    
    # Extract OPENAI_API_KEY
    if grep -q "OPENAI_API_KEY" .env; then
        OPENAI=$(grep "^OPENAI_API_KEY=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Variable 2: OPENAI_API_KEY"
        echo "Value: $OPENAI"
        echo ""
        echo "---"
        echo ""
    fi
    
    # Extract SERP_API_KEY
    if grep -q "SERP_API_KEY" .env; then
        SERP=$(grep "^SERP_API_KEY=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Variable 3: SERP_API_KEY"
        echo "Value: $SERP"
        echo ""
        echo "---"
        echo ""
    fi
    
    # Extract UNSPLASH_ACCESS_KEY
    if grep -q "UNSPLASH_ACCESS_KEY" .env; then
        UNSPLASH=$(grep "^UNSPLASH_ACCESS_KEY=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        echo "Variable 4: UNSPLASH_ACCESS_KEY"
        echo "Value: $UNSPLASH"
        echo ""
        echo "---"
        echo ""
    fi
else
    echo "❌ .env file not found!"
    exit 1
fi

echo ""
echo "=========================================="
echo "📝 INSTRUCTIONS:"
echo "=========================================="
echo ""
echo "1. Click this link: https://dashboard.render.com/web/iotd-reskin/env"
echo ""
echo "2. For EACH variable above:"
echo "   - Click 'Add Environment Variable' button"
echo "   - Paste the 'Variable X' name in the KEY field"
echo "   - Paste the 'Value' in the VALUE field"
echo "   - Click 'Save Changes'"
echo ""
echo "3. Repeat for all 4 variables"
echo ""
echo "4. Render will automatically redeploy when you save!"
echo ""

