#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/scripts/backup"

echo "======================================================================"
echo "  MessPro 2.0 - Cloud to Local Database Synchronizer (Atlas -> Local)"
echo "======================================================================"
echo ""
echo "Choose Synchronization Mode:"
echo "  [1] Safe Upsert Sync (Recommended - updates/adds records by _id into local DB)"
echo "  [2] Mirror Sync (Wipes local collections and replaces with Atlas DB)"
echo ""
read -p "Enter choice (1 or 2, default: 1): " choice

if [ "$choice" = "2" ]; then
    echo ""
    echo "🚀 Starting Exact Mirror Sync (--drop)..."
    node syncCloudToLocal.js --drop
else
    echo ""
    echo "🚀 Starting Safe Upsert Sync..."
    node syncCloudToLocal.js
fi

echo ""
echo "======================================================================"
echo "  Synchronization process finished."
echo "======================================================================"
