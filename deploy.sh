#!/bin/bash

# Deployment Script for Vercel
echo "🚀 Starting deployment process..."

# 1. Check for build issues
echo "📦 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # 2. Git status check
    echo "📝 Checking git status..."
    git status --porcelain
    
    # 3. Prompt for commit
    echo "💾 Ready to commit and deploy?"
    echo "Press Enter to continue or Ctrl+C to cancel"
    read
    
    # 4. Add all changes
    git add .
    
    # 5. Commit with timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    git commit -m "Deploy: $TIMESTAMP - Fixed deployment issues"
    
    # 6. Push to main
    echo "🔄 Pushing to GitHub..."
    git push origin main
    
    echo "✅ Deployment initiated! Check Vercel dashboard for status."
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi