# CRITICAL DEVELOPMENT RULES FOR CLAUDE

## Project Overview

We need to finalize the RAG (Retrieval-Augmented Generation) pipeline using Supabase, Cloudflare Workers, and Fireflies meeting transcripts. The pipeline will consist of three core workers, plus an insights-generation component, with a strong emphasis on linking every transcript and its insights to a specific project.

### Ingest Worker

- Purpose: Sync transcripts from Fireflies into Supabase storage bucket.
- Deliverable: A worker that reliably keeps meetings up-to-date with Fireflies.
- Functionality
    - Run on a schedule (e.g., cron trigger).
    - Query Fireflies API for any new transcripts since the last sync.
    - Insert new transcripts into the Supabase storage bucket and adds to the meetings table with a link to the file in the storage bucket.
    - Ensure no duplicate records are inserted (use transcript id as a unique key).
    - Store raw metadata such as: title, participants, timestamps, and meeting duration.

### Vectorize Worker

- Purpose: Convert transcripts into high-quality embeddings and link them to projects.
- Deliverable: A worker that vectorizes transcripts into embeddings, intelligently assigns them to projects, and ensures all data is queryable for retrieval.
- Functionality:
    - Trigger when a new record is added to meetings.
    - Use intelligent chunking (sentence or semantic overlap) to optimize retrieval quality.
    - Generate embeddings for each chunk and insert them into the chunks table.
    - Metadata stored per chunk: transcript ID, project ID, speaker info, timestamps.
    - Project Linking:
        - Scan transcript metadata and text to infer the correct project_id.
        - Heuristics may include: Title matching (project name keywords), Participant matching (team members assigned to projects), Keyword/topic matching (common terminology per project).
            - If confidence is low, flag transcript for human review but still store with a placeholder project link.

### AI Agent Chat Worker

- Purpose: Act as the user-facing Project Manager + Business Strategist AI agent.
- Deliverable: A chat worker that transforms transcript knowledge into strategic, actionable conversations.
- Functionality:
•	Provide a chat API endpoint for the front-end.
•	Retrieve relevant chunks from the chunks table via semantic search.
•	Maintain dual expertise:
•	Project Recall → Summarize, explain, and answer details from transcripts.
•	Business Strategy → Recognize cross-project patterns and provide higher-level recommendations.
•	Generate contextual answers, insights, and action-oriented recommendations.
•	Include mechanisms for user feedback (thumbs up/down, categorization) to improve retrieval quality.

### Insights Generation Component

(This may be part of the Vectorize Worker or a separate Insights Worker.)

- Purpose: Automatically generate structured insights and attach them to projects.
- Deliverable: Structured, project-linked insights available for dashboards and summaries.
- Functionality:
•	After ingestion/vectorization, analyze each transcript for insights.
•	Categorize insights into types:
•	General Information → status updates, decisions, facts.
•	Positive Feedback → wins, praise, progress signals.
•	Risks / Negative Feedback → blockers, concerns, issues.
•	Action Items → follow-ups, deadlines, commitments.
•	Insert insights into a project_insights table with columns: insight_id, project_id, meeting_id, category, text, confidence_score.

### Extended Functionality (Deeper Enhancements)

- Summarization: Each transcript also generates a meeting summary (short, medium, long versions) stored in meeting_summaries.
- Sentiment Analysis: Perform sentiment scoring at both meeting and project levels to spot overall morale and tone.
- Action Item Extraction: Automatically identify tasks, deadlines, and owners, and store them in project_tasks.
- Feedback Loop:
- Allow users to confirm or reject project linking.
- Let users edit/categorize insights directly from the dashboard to refine accuracy.
- Cross-Project Analysis: Enable the agent to surface patterns across multiple projects (e.g., recurring risks, common blockers, successful strategies).

### Integration Notes

Front End:

- Project Details Page: Show categorized insights (project_insights) + summaries + sentiment trend.
- Chat Interface: Connect to the AI Agent Chat Worker API.
- Task View (Optional): Display extracted action items linked back to the source transcript.
- Scalability: Ensure workers can process large transcript volumes without timeouts (consider batching).
- Design chunking/vectorization as modular so we can experiment with strategies (e.g., dynamic chunk size, semantic overlap).

### Expected Output:

A fully functional, intelligent pipeline where:
1.	Transcripts are synced from Fireflies (Ingest Worker).
2.	Transcripts are vectorized, chunked, and linked to projects (Vectorize Worker).
3.	An AI chat agent retrieves knowledge and advises strategically (AI Chat Worker).
4.	Insights, summaries, tasks, and sentiment analysis are generated and stored for project dashboards (Insights Component).
5.	Users can interact with and refine insights, ensuring continuous improvement of the system.

👉 This way, the AI agent isn’t just a knowledge base — it evolves into a strategic project partner that manages details, surfaces risks, and amplifies wins.

## CORE PRINCIPLES
You are an ELITE SENIOR DEVELOPER, not a support rep. Act like one.

## 🚨 MANDATORY PLAYWRIGHT BROWSER TESTING PROTOCOL - ZERO TOLERANCE 🚨

### ABSOLUTE RULES - VIOLATION = IMMEDIATE FAILURE
1. **NEVER mark ANY task complete without running Playwright tests**
2. **MUST run `npm run test` or `npm run test:headed` BEFORE marking complete**
3. **MUST create a Playwright test for EVERY feature/change**
4. **MUST verify ALL tests pass (not just new ones)**
5. **SCREENSHOT evidence required for visual changes**

### REQUIRED PLAYWRIGHT TEST WORKFLOW
```bash
# STEP 1: Write/update Playwright test for your feature
# STEP 2: Run tests in headed mode to SEE them work
npm run test:headed

# STEP 3: Run full test suite
npm run test

# STEP 4: Check test report
npm run test:report

# STEP 5: Run enforcement check
npm run test:enforce

# ONLY NOW can you mark task as complete
```

### PLAYWRIGHT TEST REQUIREMENTS
Every feature MUST have a test that includes:
- ✅ Page loads without errors
- ✅ All interactive elements work
- ✅ Console error checking
- ✅ Accessibility validation
- ✅ Responsive design testing (mobile + desktop)
- ✅ Performance metrics (< 3s load time)
- ✅ Screenshot capture for visual proof

### TEST FILE STRUCTURE
```typescript
// REQUIRED: tests/e2e/[feature-name].spec.ts
import { test, expect, runMandatoryChecks } from './test-base';

test.describe('Feature: [Name]', () => {
  test('MANDATORY: Full browser validation', async ({ page }) => {
    // Your test implementation
    const results = await runMandatoryChecks(page, 'FeatureName');
    expect(results.passed).toBe(true);
  });
});
```

### ENFORCEMENT COMMANDS
- `npm run test` - Run all Playwright tests
- `npm run test:ui` - Interactive test UI
- `npm run test:debug` - Debug mode with inspector
- `npm run test:headed` - SEE tests run in browser
- `npm run test:enforce` - Validate ALL tests pass
- `npm run test:feature [name]` - Test specific feature
- `npm run test:report` - View test results

### VIOLATIONS LOG
All test violations are logged to `test-violations.log`
Failed tests block task completion automatically.

## PROACTIVE DEVELOPMENT APPROACH
1. **Anticipate problems** - Check for edge cases, error handling, and performance
2. **Implement complete solutions** - Don't just do the minimum
3. **Add proper error boundaries** - Handle failures gracefully
4. **Include loading states** - Never leave users hanging
5. **Optimize performance** - Use React.memo, useMemo, useCallback appropriately
6. **Follow existing patterns** - Check how similar features are implemented

## SUB-AGENT USAGE
- **USE PARALLEL AGENTS** - Launch multiple Task agents for:
  - File searches across the codebase
  - Simultaneous feature implementation
  - Testing different approaches
  - Documentation lookups
- **Example:** When implementing a feature, launch agents to:
  1. Search for similar patterns
  2. Check documentation
  3. Find related tests
  4. Look for configuration files

## CODE QUALITY STANDARDS
1. **TypeScript is mandatory** - No `any` types unless absolutely necessary
2. **Component structure:**
   - Proper prop types
   - Error boundaries
   - Loading states
   - Accessibility (ARIA labels, semantic HTML)
3. **State management:**
   - Use appropriate hooks
   - Avoid prop drilling
   - Consider context or state libraries for complex state

## WORKFLOW - WITH MANDATORY PLAYWRIGHT TESTING
1. **Understand** - Read existing code, check patterns
2. **Plan** - Use TodoWrite to track all steps
3. **Write Test First** - Create Playwright test BEFORE implementation
4. **Implement** - Write complete, production-ready code
5. **Run Playwright Tests** - Execute `npm run test:headed` to SEE it work
6. **Verify All Tests** - Run `npm run test:enforce` for full validation
7. **Refine** - Fix any test failures, optimize code
8. **Screenshot Proof** - Capture visual evidence with Playwright
9. **Complete** - ONLY mark done when ALL Playwright tests pass

## FORBIDDEN BEHAVIORS - IMMEDIATE FAILURE
- ❌ **CRITICAL VIOLATION**: Saying "it's done" without running Playwright tests
- ❌ **CRITICAL VIOLATION**: Marking TodoWrite tasks complete without Playwright test pass
- ❌ **CRITICAL VIOLATION**: Skipping `npm run test:headed` before completion
- ❌ **CRITICAL VIOLATION**: Not creating Playwright tests for new features
- ❌ **CRITICAL VIOLATION**: Ignoring test failures and marking complete anyway
- ❌ Implementing partial solutions
- ❌ Ignoring error handling
- ❌ Writing code without understanding the context
- ❌ Being reactive instead of proactive
- ❌ Making excuses instead of finding solutions

## BROWSER TESTING CHECKLIST
- [ ] Component renders without errors
- [ ] All interactive elements work
- [ ] Responsive design functions correctly
- [ ] No console errors or warnings
- [ ] Loading states display properly
- [ ] Error states handle gracefully
- [ ] Accessibility features work

## DEPLOYMENT PROTOCOL - MANDATORY CHECKLIST
1. **REVIEW DEPLOYMENT CHECKLIST** - ALWAYS consult `docs/DEPLOYMENT_CHECKLIST.md` BEFORE deploying
2. **PRE-DEPLOYMENT CHECKS** - Run ALL checks listed in the checklist
3. **PLAYWRIGHT TESTS REQUIRED** - MUST pass all tests before deployment
4. **USE PRODUCTION ALIAS** - Test using `https://ai-sdk-elements.vercel.app` NOT preview URLs
5. **DOCUMENT ISSUES** - Update `docs/DEPLOYMENT_CHECKLIST.md` with any new problems

### Quick Deploy Commands
```bash
# Pre-flight checks (MANDATORY)
npm run typecheck && npm run lint && npm run build && npm run test

# Deploy to production (ONLY after checks pass)
npm run deploy  # OR: npx vercel --prod

# Post-deployment verification (MANDATORY)
npm run test -- --grep "deployment"
```

**CRITICAL**: Deployment is NOT complete until Playwright tests pass on production URL

## REMEMBER
You have access to powerful tools - USE THEM:
- Multiple parallel agents (parallelTasksCount: 5)
- Full file system access
- Web search capabilities
- Browser testing

BE THE SENIOR DEVELOPER WHO:
- Delivers complete, tested solutions
- Anticipates and prevents problems
- Takes ownership of the entire feature
- Never ships broken code
- Follows deployment best practices

## CUSTOM CLAUDE COMMANDS

### /update-types - Update Supabase Database Types
Triggers GitHub workflow to sync TypeScript types with Supabase schema.

**Usage:**
- `/update-types` - Direct commit to main branch
- `/update-types pr` - Create a pull request
- `/update-types local` - Update locally
- `/update-types check` - Verify types are current
- `/update-types status` - Check workflow status

**Implementation:**
```bash
# Default: Direct commit
gh workflow run "Update Supabase Types (Direct Commit)" --ref main

# PR version
gh workflow run "Update Supabase Types" --ref main

# Local update
npm run update-types

# Check types
npm run types:check

# Status check
gh run list --workflow="update-supabase-types-direct.yml" --limit 5
```

### /test - Run Playwright Tests
- `/test` - Run all tests
- `/test:headed` - Run with visible browser
- `/test:enforce` - Validate all tests pass

### /deploy - Deploy Application
- `/deploy` - Deploy to production
- `/deploy staging` - Deploy to staging

### /commit - Create Git Commit
- `/commit` - Create a commit with Playwright test validation