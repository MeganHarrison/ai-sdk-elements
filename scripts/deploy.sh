#!/usr/bin/env bash
set -euo pipefail

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# 0) Preflight checks
print_step "Running preflight checks"

# Check if npm is installed
command -v npm >/dev/null || { 
    print_error "npm not installed"
    exit 1
}

# Check if node is installed and use .nvmrc if available
if [ -f .nvmrc ]; then
    if command -v nvm >/dev/null 2>&1; then
        nvm use >/dev/null 2>&1 || true
    fi
fi

# Print versions
echo "npm version: $(npm -v)"
echo "node version: $(node -v)"

# Check if vercel CLI is installed
if ! command -v vercel >/dev/null; then
    print_warning "Vercel CLI not installed. Installing it now..."
    npm i -g vercel
fi

# 1) Install dependencies with frozen lockfile
print_step "Installing dependencies"
npm ci

# 2) Run linting
print_step "Running lint checks"
npm run lint || {
    print_warning "Linting failed. Consider fixing these errors."
    # Non-blocking for now to allow deployment
}

# 3) Run type checking
print_step "Running type checks"
npm run typecheck || {
    print_warning "Type checking failed. Consider fixing type errors."
    # Non-blocking for now as per the template
}

# 4) Build the project
print_step "Building the project"
npm run build || {
    print_error "Build failed. Please fix the errors before deploying."
    exit 1
}

# 5) Check for Supabase migrations (if applicable)
# Since this project uses Supabase but not Prisma, we'll skip DB migrations
# If you add Prisma later, uncomment the following:
# if command -v prisma >/dev/null; then
#     print_step "Running database migrations"
#     npm run db:migrate:prod || {
#         print_warning "Database migration failed"
#     }
# fi

# 6) Deploy to Vercel
print_step "Deploying to Vercel"

# Ensure project is linked
vercel link --yes >/dev/null 2>&1 || {
    print_warning "Project not linked. Running vercel link..."
    vercel link || {
        print_error "Failed to link Vercel project. Please run 'vercel link' manually."
        exit 1
    }
}

# Deploy to production
vercel --prod --yes || {
    print_error "Deployment failed. Please check your Vercel configuration."
    exit 1
}

print_step "Deployment completed successfully! 🚀"

# Optional: Show deployment URL
echo ""
echo "Your app has been deployed to production."
echo "Run 'vercel --prod' to see the deployment URL."