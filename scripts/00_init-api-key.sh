#!/bin/bash
# =============================================================================
# Marmot API Key Initialization Script
# =============================================================================
# This script creates an API key in Marmot and updates the .env file
# for PortalJS to use.
#
# Prerequisites:
#   - Marmot server must be running and healthy
#   - curl and jq must be installed
#
# Usage:
#   chmod +x scripts/00_init-api-key.sh
#   ./scripts/00_init-api-key.sh
# =============================================================================

set -e

# Configuration
MARMOT_URL="${MARMOT_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
API_KEY_NAME="${API_KEY_NAME:-portaljs}"
ENV_FILE=".env"

echo "=============================================="
echo " Marmot API Key Initialization"
echo "=============================================="
echo ""

# Check dependencies
command -v curl >/dev/null 2>&1 || { echo "Error: curl is required but not installed."; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "Error: jq is required but not installed."; exit 1; }

# Wait for Marmot to be ready
echo "Checking Marmot server status..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "${MARMOT_URL}/health" >/dev/null 2>&1; then
        echo "✓ Marmot server is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Waiting for Marmot... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Marmot server did not become ready in time."
    exit 1
fi

# Login and get session token
echo ""
echo "Authenticating as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${MARMOT_URL}/api/v1/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASSWORD}\"}")

SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // .token // empty')

if [ -z "$SESSION_TOKEN" ]; then
    echo "Error: Failed to authenticate. Response:"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo "✓ Authentication successful!"

# Create API key
echo ""
echo "Creating API key '${API_KEY_NAME}'..."
APIKEY_RESPONSE=$(curl -s -X POST "${MARMOT_URL}/api/v1/users/apikeys" \
    -H "Authorization: Bearer ${SESSION_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${API_KEY_NAME}\",\"expires_in_days\":365}")

API_KEY=$(echo "$APIKEY_RESPONSE" | jq -r '.key // .api_key // empty')

if [ -z "$API_KEY" ]; then
    echo "Warning: Could not extract API key from response."
    echo "Response: $APIKEY_RESPONSE"
    echo ""
    echo "You may need to create the API key manually:"
    echo "  1. Open ${MARMOT_URL} in your browser"
    echo "  2. Log in as admin"
    echo "  3. Go to Settings > API Keys"
    echo "  4. Create a new API key"
    echo "  5. Copy the key to your .env file as DMS_API_KEY=<key>"
    exit 1
fi

echo "✓ API key created successfully!"

# Update .env file
echo ""
echo "Updating ${ENV_FILE}..."
if [ ! -f "$ENV_FILE" ]; then
    cp .env.example "$ENV_FILE" 2>/dev/null || echo "DMS_API_KEY=" > "$ENV_FILE"
fi

# Update or add DMS_API_KEY
if grep -q "^DMS_API_KEY=" "$ENV_FILE"; then
    sed -i "s|^DMS_API_KEY=.*|DMS_API_KEY=${API_KEY}|" "$ENV_FILE"
else
    echo "DMS_API_KEY=${API_KEY}" >> "$ENV_FILE"
fi

echo "✓ API key saved to ${ENV_FILE}"

# Summary
echo ""
echo "=============================================="
echo " Setup Complete!"
echo "=============================================="
echo ""
echo "API Key Name:  ${API_KEY_NAME}"
echo "API Key:       ${API_KEY:0:20}..."
echo ""
echo "The API key has been saved to ${ENV_FILE}"
echo ""
echo "To apply the new key, restart PortalJS:"
echo "  docker compose up -d --build portaljs"
echo ""
