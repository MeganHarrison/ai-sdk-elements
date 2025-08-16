#!/bin/bash

echo "🔍 Testing installed services..."

# Test GitHub CLI
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI installed"
    echo "   Current user: $(gh api user --jq .login 2>/dev/null || echo 'Not authenticated')"
else
    echo "❌ GitHub CLI not found"
fi

# Test Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed"
    supabase --version
else
    echo "❌ Supabase CLI not found"
fi

# Test Wrangler CLI
if command -v wrangler &> /dev/null; then
    echo "✅ Wrangler CLI installed"
    wrangler --version
else
    echo "❌ Wrangler CLI not found"
fi

# Test Playwright
if [ -f "node_modules/.bin/playwright" ]; then
    echo "✅ Playwright installed"
    npx playwright --version
else
    echo "❌ Playwright not found"
fi

echo ""
echo "📝 Quick commands:"
echo "  - GitHub: gh api user"
echo "  - Supabase: supabase init"
echo "  - Cloudflare: wrangler whoami"
echo "  - Playwright: npx playwright test"