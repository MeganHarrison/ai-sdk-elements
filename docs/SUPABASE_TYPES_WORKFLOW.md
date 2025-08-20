# Supabase Types GitHub Workflows

This project includes automated GitHub workflows for managing Supabase database types. These workflows ensure your TypeScript types always match your database schema.

## 📋 Available Workflows

### 1. Update Supabase Types (PR-based)
**File:** `.github/workflows/update-supabase-types.yml`

Automatically creates a Pull Request when database types change.

**Triggers:**
- Manual dispatch via GitHub Actions UI
- Daily schedule (2 AM UTC)
- Push to main with migration changes

**Features:**
- Creates PR with type changes
- Assigns to triggering user
- Auto-labels PR
- Optional auto-merge for scheduled runs

### 2. Update Supabase Types (Direct Commit)
**File:** `.github/workflows/update-supabase-types-direct.yml`

Commits type updates directly to main branch.

**Triggers:**
- Manual dispatch
- After successful migration deployment
- Repository dispatch webhook

**Features:**
- Direct commit to main
- Skip CI to avoid loops
- Detailed job summary

### 3. Database Migrations
**File:** `.github/workflows/database-migrations.yml`

Deploys database migrations to Supabase.

**Triggers:**
- Push to main with migration files
- Manual dispatch with environment selection

**Features:**
- Environment-specific deployments
- Automatic type update trigger
- Migration report generation

### 4. CI/CD Pipeline
**File:** `.github/workflows/ci.yml`

Complete CI/CD pipeline with type checking.

**Triggers:**
- Push to main/develop
- Pull requests
- Manual dispatch

**Features:**
- TypeScript type checking
- Supabase types verification
- Playwright testing
- Build and deployment

## 🚀 Setup Instructions

### 1. Required Secrets

Add these secrets to your GitHub repository:

```yaml
SUPABASE_ACCESS_TOKEN    # Supabase CLI access token
SUPABASE_DB_PASSWORD     # Database password (for migrations)
NEXT_PUBLIC_SUPABASE_URL # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
```

### 2. Getting Supabase Access Token

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Get your access token
cat ~/.supabase/access-token
```

### 3. Configure Project ID

Update the project ID in all workflows:
- Current: `lgveqfnpkxvzbnnwuled`
- Replace with your project ID from Supabase dashboard

## 📝 Local Development

### Update Types Locally

```bash
# Using npm script
npm run update-types

# Check if types are up-to-date
npm run types:check

# Generate types directly
npm run types:generate
```

### Manual Script

```bash
# Make script executable (first time only)
chmod +x scripts/update-types.sh

# Run the script
./scripts/update-types.sh
```

## 🔄 Workflow Usage

### Manual Trigger via GitHub UI

1. Go to Actions tab in GitHub
2. Select workflow (e.g., "Update Supabase Types")
3. Click "Run workflow"
4. Select branch and options
5. Click "Run workflow" button

### Trigger via GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Trigger workflow
gh workflow run update-supabase-types.yml

# With inputs
gh workflow run database-migrations.yml -f environment=staging
```

### Trigger via API

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/update-supabase-types.yml/dispatches \
  -d '{"ref":"main"}'
```

## 🔍 Monitoring

### Check Workflow Status

```bash
# List recent workflow runs
gh run list --workflow=update-supabase-types.yml

# View specific run
gh run view RUN_ID

# Watch run in real-time
gh run watch RUN_ID
```

### View Logs

```bash
# Download logs
gh run download RUN_ID

# View logs in terminal
gh run view RUN_ID --log
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Types not updating
- Check SUPABASE_ACCESS_TOKEN is valid
- Verify project ID is correct
- Ensure you have proper permissions

#### 2. Workflow failing
- Check Actions tab for error logs
- Verify all secrets are set
- Check Supabase project status

#### 3. PR not created
- Ensure GitHub token has PR permissions
- Check branch protection rules
- Verify no existing PR for types

### Debug Commands

```bash
# Test Supabase connection
npx supabase projects list

# Test type generation locally
SUPABASE_ACCESS_TOKEN=your_token \
  npx supabase gen types typescript \
  --project-id lgveqfnpkxvzbnnwuled

# Check current types
cat database.types.ts | head -20
```

## 🔐 Security Best Practices

1. **Never commit tokens** - Use GitHub secrets
2. **Rotate tokens regularly** - Update quarterly
3. **Use environment protection** - For production deployments
4. **Review PR changes** - Don't auto-merge without review
5. **Audit workflow permissions** - Use minimal required permissions

## 📊 Workflow Matrix

| Workflow | Auto-run | Manual | Creates PR | Direct Commit | Env Support |
|----------|----------|--------|------------|---------------|-------------|
| update-supabase-types | ✅ Daily | ✅ | ✅ | ❌ | ❌ |
| update-supabase-types-direct | ✅ On migration | ✅ | ❌ | ✅ | ❌ |
| database-migrations | ✅ On push | ✅ | ❌ | ❌ | ✅ |
| ci | ✅ On PR/push | ✅ | ❌ | ❌ | ✅ |

## 🎯 Best Practices

1. **Use PR workflow for production** - Review changes before merging
2. **Use direct commit for development** - Faster iteration
3. **Always test locally first** - Run `npm run types:check`
4. **Monitor workflow runs** - Set up notifications
5. **Document schema changes** - Add migration notes

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Note:** Remember to update the project ID (`lgveqfnpkxvzbnnwuled`) in all files to match your Supabase project.