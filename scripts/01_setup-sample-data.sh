#!/bin/bash
# =============================================================================
# MarmotData Sample Data Setup Script
# =============================================================================
# Loads sample data from data/sample/*.json into a running Marmot instance.
#
# Data files:
#   data/sample/assets.json         - Asset definitions
#   data/sample/glossary.json       - Glossary terms with hierarchy
#   data/sample/lineage.json        - Lineage edges
#   data/sample/documentation.json  - Asset documentation (markdown)
#   data/sample/term_links.json     - Asset ↔ glossary term links
#
# Prerequisites:
#   - Marmot server running and healthy
#   - API key created (run 00_init-api-key.sh first)
#   - curl and jq installed
#
# Usage:
#   chmod +x scripts/01_setup-sample-data.sh
#   ./scripts/01_setup-sample-data.sh
# =============================================================================

set -e

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="${PROJECT_DIR}/data/sample"

MARMOT_URL="${MARMOT_URL:-http://localhost:8080}"
API_BASE="${MARMOT_URL}/api/v1"
ENV_FILE="${PROJECT_DIR}/.env"

PIPELINE="portaljs-sample-data"
SOURCE="sample-generator"

# ---------------------------------------------------------------------------
# Load API key
# ---------------------------------------------------------------------------
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^\s*$' | xargs)
fi
API_KEY="${DMS_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "Error: DMS_API_KEY not set. Run 00_init-api-key.sh first."
    exit 1
fi

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
call_api() {
    local method="$1" path="$2" data="$3"
    if [ "$method" = "GET" ]; then
        curl -s -X GET "${API_BASE}${path}" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "${API_BASE}${path}" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

check_file() {
    if [ ! -f "$1" ]; then
        echo "  ⚠ File not found: $1 — skipping"
        return 1
    fi
    return 0
}

# ---------------------------------------------------------------------------
# Declare an associative array for term name → ID mapping
# ---------------------------------------------------------------------------
declare -A TERM_IDS

echo "=============================================="
echo " MarmotData Sample Data Setup"
echo "=============================================="
echo ""

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
echo "Checking MarmotData server..."
if ! curl -s "${MARMOT_URL}/health" >/dev/null 2>&1; then
    echo "Error: MarmotData server is not reachable at ${MARMOT_URL}"
    exit 1
fi
echo "✓ Server is healthy"
echo "  Data directory: ${DATA_DIR}"
echo ""

# =====================================================================
# Phase 1: Assets (via Runs API)
# =====================================================================
echo "=== Phase 1: Creating assets ==="

if check_file "${DATA_DIR}/assets.json"; then
    # Read the JSON arrays for the batch request
    ASSETS_JSON=$(cat "${DATA_DIR}/assets.json")
    LINEAGE_JSON="[]"
    DOCS_JSON="[]"

    if [ -f "${DATA_DIR}/lineage.json" ]; then
        LINEAGE_JSON=$(cat "${DATA_DIR}/lineage.json")
    fi
    if [ -f "${DATA_DIR}/documentation.json" ]; then
        DOCS_JSON=$(cat "${DATA_DIR}/documentation.json")
    fi

    # Start a run
    START_RESP=$(call_api POST "/runs/start" \
        "$(jq -n --arg p "$PIPELINE" --arg s "$SOURCE" \
        '{pipeline_name: $p, source_name: $s}')")
    RUN_ID=$(echo "$START_RESP" | jq -r '.run_id // .id // empty')

    if [ -z "$RUN_ID" ]; then
        echo "  ⚠ Could not start run: $START_RESP"
        RUN_ID="fallback-$(date +%s)"
    fi
    echo "  Run ID: ${RUN_ID}"

    # Build batch payload using jq (avoids shell escaping issues)
    BATCH_PAYLOAD=$(jq -n \
        --arg pipeline "$PIPELINE" \
        --arg run_id "$RUN_ID" \
        --arg source "$SOURCE" \
        --argjson assets "$ASSETS_JSON" \
        --argjson lineage "$LINEAGE_JSON" \
        --argjson docs "$DOCS_JSON" \
        '{
            pipeline_name: $pipeline,
            run_id: $run_id,
            source_name: $source,
            assets: $assets,
            lineage: $lineage,
            documentation: $docs
        }')

    BATCH_RESP=$(call_api POST "/runs/assets/batch" "$BATCH_PAYLOAD")
    ASSET_COUNT=$(echo "$BATCH_RESP" | jq '.assets | length' 2>/dev/null || echo "0")
    ERRORS=$(echo "$BATCH_RESP" | jq '[.assets[] | select(.status == "error")] | length' 2>/dev/null || echo "0")

    echo "  ✓ Assets created: ${ASSET_COUNT}"
    [ "$ERRORS" != "0" ] && echo "$BATCH_RESP" | jq -r '.assets[] | select(.status == "error") | "  ⚠ \(.name): \(.error)"' 2>/dev/null

    LINEAGE_COUNT=$(echo "$BATCH_RESP" | jq '.lineage | length' 2>/dev/null || echo "0")
    DOCS_COUNT=$(echo "$BATCH_RESP" | jq '.documentation | length' 2>/dev/null || echo "0")
    echo "  ✓ Lineage edges: ${LINEAGE_COUNT}"
    echo "  ✓ Documentation: ${DOCS_COUNT}"

    # Complete the run
    call_api POST "/runs/complete" \
        "$(jq -n --arg rid "$RUN_ID" '{run_id: $rid, status: "completed"}')" \
        >/dev/null 2>&1
    echo "  ✓ Run completed"
fi

echo ""

# =====================================================================
# Phase 2: Glossary terms
# =====================================================================
echo "=== Phase 2: Creating glossary terms ==="

if check_file "${DATA_DIR}/glossary.json"; then
    TERM_COUNT=0
    TOTAL_TERMS=$(jq '.terms | length' "${DATA_DIR}/glossary.json")

    # Process terms in order (parents before children)
    for i in $(seq 0 $((TOTAL_TERMS - 1))); do
        TERM_NAME=$(jq -r ".terms[$i].name" "${DATA_DIR}/glossary.json")
        TERM_DEF=$(jq -r ".terms[$i].definition" "${DATA_DIR}/glossary.json")
        PARENT_NAME=$(jq -r ".terms[$i].parent // empty" "${DATA_DIR}/glossary.json")

        # Build payload using jq to avoid escaping issues
        if [ -n "$PARENT_NAME" ] && [ -n "${TERM_IDS[$PARENT_NAME]}" ]; then
            PAYLOAD=$(jq -n \
                --arg n "$TERM_NAME" \
                --arg d "$TERM_DEF" \
                --arg p "${TERM_IDS[$PARENT_NAME]}" \
                '{name: $n, definition: $d, parent_term_id: $p}')
        else
            PAYLOAD=$(jq -n \
                --arg n "$TERM_NAME" \
                --arg d "$TERM_DEF" \
                '{name: $n, definition: $d}')
        fi

        RESP=$(call_api POST "/glossary/" "$PAYLOAD")
        TERM_ID=$(echo "$RESP" | jq -r '.id // empty')

        if [ -n "$TERM_ID" ]; then
            TERM_IDS["$TERM_NAME"]="$TERM_ID"
            TERM_COUNT=$((TERM_COUNT + 1))
            if [ -n "$PARENT_NAME" ]; then
                echo "  ✓ ${TERM_NAME}  (child of ${PARENT_NAME})"
            else
                echo "  ✓ ${TERM_NAME}"
            fi
        else
            echo "  ⚠ Failed: ${TERM_NAME}"
        fi
    done

    echo "  Total: ${TERM_COUNT}/${TOTAL_TERMS} terms created"
fi

echo ""

# =====================================================================
# Phase 3: Link glossary terms to assets
# =====================================================================
echo "=== Phase 3: Linking terms to assets ==="

if check_file "${DATA_DIR}/term_links.json"; then
    # Get all assets for name → ID lookup
    SEARCH_RESP=$(call_api GET "/assets/search?limit=100")

    # Also get all glossary terms from the API as fallback lookup
    GLOSSARY_RESP=$(call_api GET "/glossary/list?limit=200")

    LINK_COUNT=0

    while IFS='|' read -r ASSET_NAME TERM_NAMES; do
        # Resolve asset name → ID
        ASSET_ID=$(echo "$SEARCH_RESP" | jq -r --arg n "$ASSET_NAME" '.assets[] | select(.name == $n) | .id' 2>/dev/null)

        if [ -z "$ASSET_ID" ] || [ "$ASSET_ID" = "null" ]; then
            echo "  ⚠ Asset not found: ${ASSET_NAME}"
            continue
        fi

        # Resolve term names → IDs
        RESOLVED_IDS="[]"
        IFS=',' read -ra NAMES <<< "$TERM_NAMES"
        for TNAME in "${NAMES[@]}"; do
            TNAME=$(echo "$TNAME" | tr -d '\r')
            # Try in-memory map first, fall back to API response
            TID="${TERM_IDS[$TNAME]}"
            if [ -z "$TID" ]; then
                TID=$(echo "$GLOSSARY_RESP" | jq -r --arg n "$TNAME" '.terms[] | select(.name == $n) | .id' 2>/dev/null | head -1)
            fi
            if [ -n "$TID" ] && [ "$TID" != "null" ]; then
                RESOLVED_IDS=$(echo "$RESOLVED_IDS" | jq --arg id "$TID" '. + [$id]')
            else
                echo "  ⚠ Term not found: ${TNAME}"
            fi
        done

        # Link terms to asset
        if [ "$(echo "$RESOLVED_IDS" | jq 'length')" -gt 0 ]; then
            call_api POST "/assets/${ASSET_ID}/terms" \
                "$(jq -n --argjson ids "$RESOLVED_IDS" '{term_ids: $ids}')" \
                >/dev/null 2>&1
            echo "  ✓ ${ASSET_NAME} ← $(echo "$TERM_NAMES" | tr ',' ', ')"
            LINK_COUNT=$((LINK_COUNT + 1))
        fi
    done < <(jq -r '.links | to_entries[] | "\(.key)|\(.value | join(","))"' "${DATA_DIR}/term_links.json")

    echo "  Total: ${LINK_COUNT} assets linked"
fi

echo ""

# =====================================================================
# Summary
# =====================================================================
echo "=============================================="
echo " Sample Data Setup Complete!"
echo "=============================================="
echo ""

FINAL_ASSETS=$(call_api GET "/assets/search?limit=1" | jq '.total // 0' 2>/dev/null)
FINAL_TERMS=$(call_api GET "/glossary/list?limit=1" | jq '.total // 0' 2>/dev/null)

echo "  Assets:          ${FINAL_ASSETS}"
echo "  Glossary Terms:  ${FINAL_TERMS}"
echo ""
echo "You can now browse the data at:"
echo "  Marmot UI:  ${MARMOT_URL}"
echo "  PortalJS:   http://localhost:3000"
echo ""
