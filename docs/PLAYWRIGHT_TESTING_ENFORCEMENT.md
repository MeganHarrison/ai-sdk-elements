# 🚨 PLAYWRIGHT BROWSER TESTING ENFORCEMENT SYSTEM

## Overview
This project has **MANDATORY** Playwright browser testing. Every feature and change MUST be tested in a real browser using Playwright before marking any task as complete.

## Zero-Tolerance Policy
- **NO EXCEPTIONS**: All code changes require Playwright tests
- **AUTOMATIC ENFORCEMENT**: Pre-commit hooks block untested code
- **VIOLATION TRACKING**: All failures logged to `test-violations.log`

## Required Workflow

### Step 1: Write Test First (TDD)
```typescript
// tests/e2e/[feature-name].spec.ts
import { test, expect, runMandatoryChecks } from './test-base';

test.describe('Feature: [Name]', () => {
  test('MANDATORY: Full browser validation', async ({ page }) => {
    // Test implementation
    const results = await runMandatoryChecks(page, 'FeatureName');
    expect(results.passed).toBe(true);
  });
});
```

### Step 2: Run Tests in Headed Mode
```bash
npm run test:headed  # SEE the tests run in real browser
```

### Step 3: Run Full Test Suite
```bash
npm run test         # Run all tests
npm run test:enforce # Validate everything passes
```

### Step 4: Check Test Report
```bash
npm run test:report  # View detailed results
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all Playwright tests |
| `npm run test:ui` | Interactive test UI mode |
| `npm run test:debug` | Debug mode with DevTools |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:enforce` | Validate all tests pass |
| `npm run test:feature [name]` | Test specific feature |
| `npm run test:report` | View HTML test report |

## Mandatory Test Checklist

Every test MUST validate:
- ✅ Page loads without errors
- ✅ All interactive elements work
- ✅ No console errors
- ✅ Accessibility compliance
- ✅ Responsive design (mobile + desktop)
- ✅ Performance metrics (< 3s load)
- ✅ Screenshot evidence

## Test Structure

### Base Test Helper (`tests/e2e/test-base.ts`)
```typescript
export async function runMandatoryChecks(page: Page, featureName: string) {
  // Runs all required validations
  // Returns pass/fail status
}
```

### Example Test
```typescript
import { test, expect } from '@playwright/test';

test('feature works correctly', async ({ page }) => {
  await page.goto('/feature');
  
  // Test interactions
  await page.click('button#action');
  await expect(page.locator('#result')).toBeVisible();
  
  // Run mandatory checks
  const results = await runMandatoryChecks(page, 'MyFeature');
  expect(results.passed).toBe(true);
});
```

## Enforcement Mechanisms

### 1. Pre-Commit Hook (`.husky/pre-commit`)
Automatically runs before every commit:
- Lints code
- Checks types
- Runs all Playwright tests
- Blocks commit if tests fail

### 2. Test Enforcer (`scripts/test-enforcer.ts`)
Validates test execution:
- Checks for test files
- Runs browser tests
- Logs violations
- Generates reports

### 3. Violation Tracking
All test failures logged to:
- `test-violations.log` - Violation history
- `test-report.json` - Test results
- `test-results/` - Screenshots and videos

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Base URL**: Auto-detects dev server port
- **Reports**: HTML, JSON, List formats
- **Evidence**: Screenshots on failure, videos on retry

### Package.json Scripts
All test commands configured for easy access.

## Troubleshooting

### Dev Server Issues
If the dev server has errors:
1. Check `npm run dev` works standalone
2. Fix any Next.js compilation errors
3. Ensure port 3000/3003 is available

### Test Timeout Issues
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 30 * 1000, // 30 seconds
```

### Browser Installation
```bash
npx playwright install  # Install all browsers
npx playwright install chromium  # Install specific browser
```

## CRITICAL REMINDERS FOR CLAUDE

1. **NEVER** mark tasks complete without running `npm run test:headed`
2. **ALWAYS** create tests BEFORE implementation (TDD)
3. **MUST** verify all tests pass with `npm run test:enforce`
4. **SCREENSHOT** evidence required for visual changes
5. **VIOLATIONS** automatically block task completion

## Violation Consequences

If you violate testing rules:
1. Task marked as **INCOMPLETE**
2. Violation logged permanently
3. Cannot proceed until tests pass
4. Must fix all issues before continuing

## Success Criteria

Task is ONLY complete when:
- ✅ All Playwright tests written
- ✅ Tests run successfully in headed mode
- ✅ Full test suite passes
- ✅ No console errors
- ✅ Accessibility checks pass
- ✅ Performance metrics met
- ✅ Screenshots captured

---

**Remember**: This is not optional. It's MANDATORY. No exceptions.