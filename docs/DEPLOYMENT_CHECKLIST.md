# 🚀 Deployment Checklist & Known Issues

## ⚠️ Critical Issues Encountered During Last Deployment

### 1. **Authentication/401 Errors**
- **Issue**: Initial deployment URLs returned 401 Unauthorized
- **Cause**: Vercel preview deployments have authentication enabled by default
- **Solution**: Use the main production alias URL (e.g., `https://ai-sdk-elements.vercel.app`)

### 2. **Testing Protocol Violations**
- **Issue**: Marked deployment as complete without browser testing
- **Cause**: Did not follow CLAUDE.md mandatory Playwright testing requirements
- **Solution**: ALWAYS run Playwright tests before marking any task complete

### 3. **False Positive Test Failures**
- **Issue**: Tests failed because page content contained "500" in revenue values ($500)
- **Cause**: Overly broad error detection in tests
- **Solution**: Use specific error patterns like "500 Internal Server Error"

### 4. **Console Error False Positives**
- **Issue**: Tests failed due to non-critical console errors
- **Cause**: React 19 warnings and session fetch errors
- **Solution**: Filter out known non-critical errors in tests

### 5. **Protected Route Redirects**
- **Issue**: Tests expected protected pages to load but they redirected to login
- **Cause**: Authentication middleware protecting routes
- **Solution**: Test for either successful load OR redirect to login

## ✅ Pre-Deployment Checklist

### Phase 1: Local Verification
```bash
# 1. Run type checking
npm run typecheck

# 2. Run linting
npm run lint

# 3. Build locally
npm run build

# 4. Start local server and manually test
npm run dev
# Test: Home page, Login, Sign-up, Protected routes
```

### Phase 2: Test Suite
```bash
# 5. Write/Update Playwright tests for changes
# tests/e2e/[feature-name].spec.ts

# 6. Run tests in headed mode to SEE them work
npm run test:headed

# 7. Run full test suite
npm run test

# 8. Check test report
npm run test:report

# 9. Run enforcement check
npm run test:enforce
```

### Phase 3: Environment Variables
```bash
# 10. Verify all required env vars are set in Vercel
# Check .env.example for required variables
# Verify in Vercel dashboard: Settings > Environment Variables
```

### Phase 4: Deploy
```bash
# 11. Deploy to preview first (automatic on push)
git push origin feature-branch

# 12. Test preview URL thoroughly
# Check console for errors
# Test all critical paths

# 13. Deploy to production
npm run deploy
# OR
npx vercel --prod
```

### Phase 5: Post-Deployment Verification
```bash
# 14. Run Playwright tests against production
npm run test -- --grep "deployment"

# 15. Check production URLs
# Main: https://ai-sdk-elements.vercel.app
# Check redirects work
# Check API endpoints respond

# 16. Monitor logs
npx vercel logs https://ai-sdk-elements.vercel.app
```

## 🤖 Automated Pre-Deployment Script

Create this script to run before every deployment:

```typescript
// scripts/pre-deploy.ts
import { execSync } from 'child_process';
import chalk from 'chalk';

interface CheckResult {
  name: string;
  passed: boolean;
  error?: string;
}

class PreDeploymentChecker {
  private checks: CheckResult[] = [];

  async runAllChecks(): Promise<boolean> {
    console.log(chalk.blue('\n🔍 Running Pre-Deployment Checks...\n'));

    // 1. Type checking
    this.runCheck('TypeScript', 'npm run typecheck');
    
    // 2. Linting
    this.runCheck('ESLint', 'npm run lint');
    
    // 3. Build
    this.runCheck('Build', 'npm run build');
    
    // 4. Tests
    this.runCheck('Playwright Tests', 'npm run test');
    
    // 5. Environment variables
    this.checkEnvVars();
    
    // Report results
    this.reportResults();
    
    return this.checks.every(c => c.passed);
  }

  private runCheck(name: string, command: string): void {
    try {
      console.log(chalk.yellow(`Running ${name}...`));
      execSync(command, { stdio: 'pipe' });
      this.checks.push({ name, passed: true });
      console.log(chalk.green(`✅ ${name} passed\n`));
    } catch (error: any) {
      this.checks.push({ 
        name, 
        passed: false, 
        error: error.message 
      });
      console.log(chalk.red(`❌ ${name} failed\n`));
    }
  }

  private checkEnvVars(): void {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      this.checks.push({
        name: 'Environment Variables',
        passed: false,
        error: `Missing: ${missing.join(', ')}`
      });
      console.log(chalk.red(`❌ Missing env vars: ${missing.join(', ')}\n`));
    } else {
      this.checks.push({
        name: 'Environment Variables',
        passed: true
      });
      console.log(chalk.green('✅ Environment variables configured\n'));
    }
  }

  private reportResults(): void {
    console.log(chalk.blue('\n📊 Pre-Deployment Check Results:\n'));
    
    this.checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      const color = check.passed ? chalk.green : chalk.red;
      console.log(color(`${icon} ${check.name}`));
      if (check.error) {
        console.log(chalk.gray(`   Error: ${check.error}`));
      }
    });

    const passed = this.checks.filter(c => c.passed).length;
    const total = this.checks.length;
    
    console.log(chalk.blue(`\nPassed: ${passed}/${total}\n`));
    
    if (passed === total) {
      console.log(chalk.green('🎉 All checks passed! Ready to deploy.\n'));
    } else {
      console.log(chalk.red('⚠️  Fix issues before deploying!\n'));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new PreDeploymentChecker();
  checker.runAllChecks().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { PreDeploymentChecker };
```

## 🔴 Common Vercel Issues & Solutions

### Issue: Build Timeouts
```bash
# Solution: Increase function timeout in vercel.json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 60
  }
}
```

### Issue: Environment Variable Not Available
```bash
# Solution: Add to Vercel dashboard
# Settings > Environment Variables > Add New
# Select: Production, Preview, Development
```

### Issue: CORS Errors
```typescript
// Solution: Add CORS headers in middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

### Issue: Hydration Errors
```typescript
// Solution: Ensure server and client render same content
// Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, []);
```

## 📝 Deployment Command Reference

```bash
# Deploy to production
npx vercel --prod

# Deploy to preview
npx vercel

# List deployments
npx vercel ls

# Check deployment logs
npx vercel logs [deployment-url]

# Rollback deployment
npx vercel rollback [deployment-url]

# List domains
npx vercel domains ls

# List aliases
npx vercel alias ls

# Add custom domain
npx vercel domains add [domain]

# Remove deployment
npx vercel rm [deployment-url]
```

## 🚨 NEVER FORGET

1. **ALWAYS run Playwright tests before marking deployment complete**
2. **Test the ACTUAL production URL, not preview URLs**
3. **Check for console errors in browser DevTools**
4. **Verify all environment variables are set in Vercel**
5. **Run `npm run build` locally first to catch errors early**
6. **Use the main production alias URL for testing**

## 🤖 Instructions for Claude/Subagents

When deploying, you MUST:

1. First run `npm run build` locally
2. Create/update Playwright tests for any new features
3. Run `npm run test:headed` to visually verify tests
4. Run `npm run test` for full test suite
5. Only proceed with deployment if ALL tests pass
6. After deployment, test the production URL with Playwright
7. Document any new issues in this file

**CRITICAL**: Never mark a deployment task as complete without running and passing Playwright tests against the production URL.