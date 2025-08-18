# 🚀 Deployment Checklist for Vercel

## Pre-Deployment Checks

### 1. Build Test Locally
```bash
npm run build
```

### 2. Common Build Errors & Fixes

#### TypeScript Errors
- **File Extension Issues**: Ensure all React components use `.tsx` not `.ts`
- **Type Errors**: Run `npm run lint` to catch type issues
- **Import Errors**: Check all imports resolve correctly

#### Missing Dependencies
```bash
npm install
```

#### Environment Variables
Create `.env.production` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_API_URL=your_backend_url
```

### 3. Vercel-Specific Settings

#### Build Command
```
npm run build
```

#### Output Directory
```
.next
```

#### Install Command
```
npm install
```

### 4. Quick Fixes for Common Issues

#### Clear Build Cache
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Lock File Issues
- Remove duplicate lock files (keep only package-lock.json OR pnpm-lock.yaml, not both)

#### Module Resolution
- Check tsconfig.json paths match actual file structure
- Verify all @/ imports resolve correctly

### 5. Backend Deployment (Cloudflare Workers)

#### Deploy Backend
```bash
cd alleato-backend
wrangler deploy
```

#### Update Frontend API URL
Update `NEXT_PUBLIC_API_URL` in Vercel environment variables to point to deployed Worker URL.

## Post-Deployment Verification

1. ✅ Check all pages load
2. ✅ Test API connections
3. ✅ Verify environment variables
4. ✅ Monitor error logs

## Emergency Rollback

In Vercel dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"