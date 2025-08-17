#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Helper functions for colored output
const success = (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const warning = (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
const error = (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`);
const info = (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);

// Environment variable categories
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
];

const productionVars = [
  'JWT_SECRET'
];

const optionalVars = [
  'NEXT_PUBLIC_BACKEND_URL',
  'NOTION_TOKEN',
  'NOTION_PROJECTS_DB_ID',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'OPENAI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'POSTGRES_URL'
];

// Check results
let hasErrors = false;
let hasWarnings = false;

console.log('\n🏥 Running environment health check...\n');

// Check Node version
console.log('=== Node.js Version ===');
const nodeVersion = process.version;
const requiredNodeVersion = '20.0.0';
const currentMajorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
const requiredMajorVersion = parseInt(requiredNodeVersion.split('.')[0]);

if (currentMajorVersion >= requiredMajorVersion) {
  success(`Node.js ${nodeVersion} (meets requirement >= ${requiredMajorVersion}.x)`);
} else {
  error(`Node.js ${nodeVersion} (requires >= ${requiredMajorVersion}.x)`);
  hasErrors = true;
}

// Check package manager
console.log('\n=== Package Manager ===');
const packageLockExists = fs.existsSync('package-lock.json');
const pnpmLockExists = fs.existsSync('pnpm-lock.yaml');
const yarnLockExists = fs.existsSync('yarn.lock');

if (packageLockExists) {
  success('Using npm (package-lock.json found)');
} else if (pnpmLockExists) {
  warning('Found pnpm-lock.yaml but project uses npm. Consider removing it.');
  hasWarnings = true;
} else if (yarnLockExists) {
  warning('Found yarn.lock but project uses npm. Consider removing it.');
  hasWarnings = true;
} else {
  error('No lock file found! Run "npm install" to create package-lock.json');
  hasErrors = true;
}

// Check .env files
console.log('\n=== Environment Files ===');
const envLocalExists = fs.existsSync('.env.local');
const envExampleExists = fs.existsSync('.env.example');

if (envLocalExists) {
  success('.env.local file exists');
} else {
  warning('.env.local file not found. Copy .env.example to .env.local and configure it.');
  hasWarnings = true;
}

if (envExampleExists) {
  success('.env.example file exists');
} else {
  error('.env.example file not found!');
  hasErrors = true;
}

// Check required environment variables
console.log('\n=== Required Environment Variables ===');
const missingRequired: string[] = [];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    success(`${varName} is set`);
  } else {
    error(`${varName} is NOT set`);
    missingRequired.push(varName);
    hasErrors = true;
  }
});

// Check production environment variables (if in production)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  console.log('\n=== Production Environment Variables ===');
  productionVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} is set`);
    } else {
      error(`${varName} is NOT set (required for production)`);
      missingRequired.push(varName);
      hasErrors = true;
    }
  });
}

// Check optional environment variables
console.log('\n=== Optional Environment Variables ===');
const missingOptional: string[] = [];

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    success(`${varName} is set`);
  } else {
    info(`${varName} is not set (optional)`);
    missingOptional.push(varName);
  }
});

// Check backend URL configuration
if (process.env.NEXT_PUBLIC_BACKEND_URL) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    warning('NEXT_PUBLIC_BACKEND_URL points to localhost in production environment!');
    hasWarnings = true;
  }
} else {
  info('NEXT_PUBLIC_BACKEND_URL not set, will use default: http://localhost:8787');
}

// Check Vercel configuration
console.log('\n=== Vercel Configuration ===');
const vercelJsonExists = fs.existsSync('vercel.json');
const vercelDirExists = fs.existsSync('.vercel');

if (vercelJsonExists) {
  success('vercel.json configuration found');
} else {
  warning('vercel.json not found (will be created during deployment)');
  hasWarnings = true;
}

if (vercelDirExists) {
  const projectJsonPath = path.join('.vercel', 'project.json');
  if (fs.existsSync(projectJsonPath)) {
    success('Vercel project is linked');
  } else {
    info('Vercel directory exists but project not linked. Run "vercel link" to connect.');
  }
} else {
  info('Project not linked to Vercel. Run "vercel link" before deploying.');
}

// Summary
console.log('\n=== Summary ===');
if (hasErrors) {
  error(`Environment check failed with ${missingRequired.length} critical issues.`);
  if (missingRequired.length > 0) {
    console.log('\nMissing required variables:');
    missingRequired.forEach(v => console.log(`  - ${v}`));
  }
  console.log('\nTo fix:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Fill in the required environment variables');
  console.log('3. Run this check again: npm run doctor\n');
  process.exit(1);
} else if (hasWarnings) {
  warning('Environment check passed with warnings.');
  console.log('\nConsider addressing the warnings above for a smoother deployment experience.\n');
  process.exit(0);
} else {
  success('Environment check passed! Your project is ready for deployment. 🚀\n');
  process.exit(0);
}