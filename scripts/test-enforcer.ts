#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  passed: boolean;
  testFile: string;
  feature: string;
  browserTests: boolean;
  errors: string[];
}

class TestEnforcer {
  private testResults: TestResult[] = [];
  private testsRequired = true;

  constructor() {
    this.checkEnvironment();
  }

  private checkEnvironment() {
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
    } catch {
      console.error('❌ Playwright not installed! Run: npm install -D @playwright/test');
      process.exit(1);
    }
  }

  async enforceTest(feature: string, testFile?: string): Promise<boolean> {
    console.log(`\n🔍 ENFORCING BROWSER TEST FOR: ${feature}`);
    console.log('═'.repeat(60));

    const testPath = testFile || this.findTestFile(feature);
    
    if (!testPath) {
      console.error(`❌ NO TEST FILE FOUND for ${feature}`);
      console.error('CREATE A TEST FILE FIRST!');
      this.logViolation(feature, 'No test file found');
      return false;
    }

    const result = await this.runBrowserTest(testPath, feature);
    
    if (!result.passed) {
      this.logViolation(feature, result.errors.join('\n'));
      return false;
    }

    console.log(`✅ BROWSER TEST PASSED for ${feature}`);
    return true;
  }

  private findTestFile(feature: string): string | null {
    const testDirs = ['tests/e2e', 'tests', 'e2e', '__tests__'];
    
    for (const dir of testDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        const testFile = files.find(f => 
          f.includes(feature.toLowerCase()) || 
          f.includes('test') || 
          f.includes('spec')
        );
        if (testFile) {
          return path.join(fullPath, testFile);
        }
      }
    }
    return null;
  }

  private async runBrowserTest(testPath: string, feature: string): Promise<TestResult> {
    const result: TestResult = {
      passed: false,
      testFile: testPath,
      feature,
      browserTests: true,
      errors: []
    };

    try {
      console.log(`📊 Running browser test: ${testPath}`);
      
      // Run Playwright test
      const output = execSync(
        `npx playwright test ${testPath} --reporter=json`,
        { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );

      const testResults = JSON.parse(output);
      
      if (testResults.status === 'passed') {
        result.passed = true;
        console.log('✅ All browser tests passed!');
      } else {
        result.errors.push(`Test failed: ${testResults.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      result.errors.push(`Test execution failed: ${error.message}`);
      
      // Try to parse error output
      if (error.stdout) {
        try {
          const errorOutput = JSON.parse(error.stdout);
          if (errorOutput.errors) {
            result.errors.push(...errorOutput.errors);
          }
        } catch {
          result.errors.push(error.stdout);
        }
      }
    }

    this.testResults.push(result);
    return result;
  }

  private logViolation(feature: string, error: string) {
    const violationLog = path.join(process.cwd(), 'test-violations.log');
    const timestamp = new Date().toISOString();
    const violation = `[${timestamp}] VIOLATION: ${feature}\n${error}\n${'─'.repeat(40)}\n`;
    
    fs.appendFileSync(violationLog, violation);
    
    console.error('\n🚨 TEST VIOLATION LOGGED 🚨');
    console.error('Feature marked as INCOMPLETE until tests pass!');
    console.error(`Check ${violationLog} for details`);
  }

  async validateAllTests(): Promise<boolean> {
    console.log('\n🔍 VALIDATING ALL BROWSER TESTS');
    console.log('═'.repeat(60));

    try {
      const output = execSync('npx playwright test', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      console.log('✅ ALL BROWSER TESTS PASSED!');
      return true;
    } catch (error: any) {
      console.error('❌ BROWSER TESTS FAILED!');
      console.error(error.message);
      return false;
    }
  }

  generateReport() {
    const reportPath = path.join(process.cwd(), 'test-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.passed).length,
      failed: this.testResults.filter(r => !r.passed).length,
      results: this.testResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 TEST REPORT GENERATED');
    console.log(`Total: ${report.totalTests}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    
    if (report.failed > 0) {
      console.error('\n❌ TESTS FAILED - DO NOT MARK AS COMPLETE!');
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const enforcer = new TestEnforcer();
  const args = process.argv.slice(2);
  
  if (args[0] === '--validate-all') {
    enforcer.validateAllTests().then(passed => {
      if (!passed) process.exit(1);
    });
  } else if (args[0] === '--test') {
    const feature = args[1] || 'default';
    const testFile = args[2];
    
    enforcer.enforceTest(feature, testFile).then(passed => {
      enforcer.generateReport();
      if (!passed) process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  tsx scripts/test-enforcer.ts --test <feature> [testFile]');
    console.log('  tsx scripts/test-enforcer.ts --validate-all');
  }
}

export { TestEnforcer };