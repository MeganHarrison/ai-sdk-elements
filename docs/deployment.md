# Deployment Guide

This guide provides a complete reference for deploying the AI Elements Chatbot application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [One-Command Deploy](#one-command-deploy)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Multi-Service Architecture](#multi-service-architecture)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

- **Node.js**: Version 20.x or higher
- **npm**: Comes with Node.js
- **Vercel CLI**: Installed automatically during deployment

### Supported Versions

```
Node.js: >= 20.0.0
npm: >= 10.0.0
```

To check your versions:
```bash
node -v
npm -v
```

## Environment Setup

### 1. Copy Environment Variables

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` and add your values:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url

# Required for production
JWT_SECRET=your_secure_jwt_secret
```

### 3. Verify Environment

Run the doctor script to check your setup:

```bash
npm run doctor
```

This will verify:
- Node.js version
- Environment variables
- Package manager setup
- Vercel configuration

## One-Command Deploy

Deploy to production with a single command:

```bash
npm run deploy
```

This command will:
1. Run preflight checks
2. Install dependencies
3. Run linting and type checking
4. Build the application
5. Deploy to Vercel

### Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Install dependencies
npm ci

# 2. Run quality checks
npm run lint
npm run typecheck

# 3. Build the project
npm run build

# 4. Deploy to Vercel
vercel --prod
```

## CI/CD Pipeline

### GitHub Actions

The project includes automated deployment via GitHub Actions:

- **Push to main**: Automatically deploys to production
- **Pull requests**: Creates preview deployments

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_BACKEND_URL
```

To get Vercel credentials:
```bash
# Link your project first
vercel link

# Get your token from
# https://vercel.com/account/tokens

# Get org and project IDs from .vercel/project.json
cat .vercel/project.json
```

## Multi-Service Architecture

This application consists of two main services:

### 1. Frontend (Next.js on Vercel)

- **Location**: Root directory
- **Deploy**: `npm run deploy`
- **Environment**: Vercel

### 2. Backend (Cloudflare Workers)

- **Location**: `alleato-backend/` directory
- **Deploy**: 
  ```bash
  cd alleato-backend
  npm run deploy
  ```
- **Environment**: Cloudflare Workers

### Service Dependencies

```
Frontend (Vercel) → Backend (Cloudflare Workers) → Supabase
                                                 → D1 Database
                                                 → R2 Storage
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Set

**Error**: "Missing required environment variables"

**Solution**:
```bash
# Check which variables are missing
npm run doctor

# Copy example and configure
cp .env.example .env.local
# Edit .env.local with your values
```

#### 2. Build Failures

**Error**: "Build failed with type errors"

**Solution**:
```bash
# Run type checking locally
npm run typecheck

# Fix any type errors before deploying
```

#### 3. Vercel Not Linked

**Error**: "Project not linked to Vercel"

**Solution**:
```bash
# Link your project
vercel link

# Follow the prompts to select your project
```

#### 4. Node Version Mismatch

**Error**: "Node version X does not meet requirement"

**Solution**:
```bash
# If using nvm
nvm install 20
nvm use 20

# Verify version
node -v
```

### Deployment Logs

View deployment logs:
```bash
# Vercel logs
vercel logs

# Or in Vercel dashboard
# https://vercel.com/[your-org]/[your-project]/deployments
```

## Rollback Procedures

### Immediate Rollback

1. **Via Vercel Dashboard**:
   - Go to your project's deployments
   - Find the last working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**:
   ```bash
   # List recent deployments
   vercel ls

   # Rollback to specific deployment
   vercel rollback [deployment-url]
   ```

3. **Via Git**:
   ```bash
   # Revert the problematic commit
   git revert HEAD
   git push origin main
   # This triggers a new deployment with the reverted code
   ```

### Database Rollbacks

If database schema changes cause issues:

1. **Supabase**:
   - Use Supabase dashboard to revert migrations
   - Or restore from a backup

2. **Cloudflare D1**:
   - Use Wrangler to manage D1 migrations
   - Restore from D1 backups if needed

## Best Practices

1. **Always run checks locally first**:
   ```bash
   npm run doctor
   npm run build
   ```

2. **Use preview deployments** for testing:
   - Create a PR to get a preview URL
   - Test thoroughly before merging

3. **Monitor deployments**:
   - Check Vercel dashboard after deployment
   - Set up alerts for errors

4. **Keep secrets secure**:
   - Never commit `.env.local`
   - Use GitHub Secrets for CI/CD
   - Rotate keys regularly

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Run `npm run doctor` for environment diagnostics
3. Check Vercel status: https://www.vercel-status.com/
4. Review deployment logs in Vercel dashboard

## Quick Reference

```bash
# Check environment
npm run doctor

# Deploy to production
npm run deploy

# View logs
vercel logs

# Rollback
vercel rollback [deployment-url]
```

Remember: When in doubt, run `npm run doctor` first!