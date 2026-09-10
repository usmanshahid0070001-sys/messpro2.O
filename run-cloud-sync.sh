#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/scripts/backup"

echo "======================================================================"
echo "  MessPro 2.0 - Local to Cloud Database Synchronizer (Local -> Atlas)"
echo "======================================================================"
echo ""
echo "Choose Synchronization Mode:"
echo "  [1] Safe Upsert Sync (Recommended - updates/adds records by _id into Atlas)"
echo "  [2] Mirror Sync (Wipes cloud collection and replaces with local DB)"
echo ""
read -p "Enter choice (1 or 2, default: 1): " choice

if [ "$choice" = "2" ]; then
    echo ""
    echo "🚀 Starting Exact Mirror Sync (--drop)..."
    node syncLocalToCloud.js --drop
else
    echo ""
    echo "🚀 Starting Safe Upsert Sync..."
    node syncLocalToCloud.js
fi

echo ""
echo "======================================================================"
echo "  Synchronization process finished."
echo "======================================================================"
