#!/usr/bin/env tsx

import { execSync } from 'child_process';

interface CheckResult {
  name: string;
  passed: boolean;
  error?: string;
}

class PreDeploymentChecker {
  private checks: CheckResult[] = [];

  async runAllChecks(): Promise<boolean> {
    console.log('\n🔍 Running Pre-Deployment Checks...\n');

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
      console.log(`Running ${name}...`);
      execSync(command, { stdio: 'pipe' });
      this.checks.push({ name, passed: true });
      console.log(`✅ ${name} passed\n`);
    } catch (error: any) {
      this.checks.push({ 
        name, 
        passed: false, 
        error: error.message 
      });
      console.log(`❌ ${name} failed\n`);
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
      console.log(`❌ Missing env vars: ${missing.join(', ')}\n`);
    } else {
      this.checks.push({
        name: 'Environment Variables',
        passed: true
      });
      console.log('✅ Environment variables configured\n');
    }
  }

  private reportResults(): void {
    console.log('\n📊 Pre-Deployment Check Results:\n');
    
    this.checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
    });

    const passed = this.checks.filter(c => c.passed).length;
    const total = this.checks.length;
    
    console.log(`\nPassed: ${passed}/${total}\n`);
    
    if (passed === total) {
      console.log('🎉 All checks passed! Ready to deploy.\n');
      console.log('Run deployment with: npx vercel --prod\n');
    } else {
      console.log('⚠️  Fix issues before deploying!\n');
      console.log('See docs/DEPLOYMENT_CHECKLIST.md for troubleshooting.\n');
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