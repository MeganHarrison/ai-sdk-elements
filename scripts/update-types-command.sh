#!/bin/bash

# Claude /update-types command implementation
# Usage: ./scripts/update-types-command.sh [option]

set -e

OPTION=${1:-"default"}

case $OPTION in
  "default"|"")
    echo "🚀 Triggering Supabase types update (direct commit)..."
    gh workflow run "Update Supabase Types (Direct Commit)" --ref main
    echo "✅ Workflow triggered! Check status with: /update-types status"
    ;;
    
  "pr")
    echo "🚀 Creating PR with Supabase type updates..."
    gh workflow run "Update Supabase Types" --ref main
    echo "✅ Workflow triggered! A PR will be created if types changed."
    ;;
    
  "local")
    echo "🔄 Updating types locally..."
    npm run update-types
    ;;
    
  "check")
    echo "🔍 Checking if types are up-to-date..."
    npm run types:check && echo "✅ Types are up-to-date!" || echo "⚠️ Types need updating"
    ;;
    
  "status")
    echo "📊 Recent workflow runs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━"
    gh run list --workflow="update-supabase-types-direct.yml" --limit 5
    echo ""
    echo "To view details: gh run view [RUN_ID]"
    ;;
    
  "help")
    echo "📚 /update-types - Update Supabase Database Types"
    echo ""
    echo "Usage: /update-types [option]"
    echo ""
    echo "Options:"
    echo "  (default)  - Direct commit to main branch"
    echo "  pr         - Create a pull request"
    echo "  local      - Update locally"
    echo "  check      - Verify types are current"
    echo "  status     - Check workflow status"
    echo "  help       - Show this help message"
    ;;
    
  *)
    echo "❌ Unknown option: $OPTION"
    echo "Use '/update-types help' for available options"
    exit 1
    ;;
esac