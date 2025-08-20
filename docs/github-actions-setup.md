# GitHub Actions Setup Guide

## Update Database Types Workflow

The `.github/workflows/update-types.yml` workflow automatically generates TypeScript types from your Supabase database schema.

### How It Works

1. **Schedule**: Runs daily at midnight UTC (configurable via cron)
2. **Process**: 
   - Fetches latest schema from Supabase
   - Generates TypeScript types
   - Commits changes if any types have changed
   - Pushes updates to the repository

### Prerequisites

#### 1. Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `ACCESS_TOKEN` | Supabase Access Token | Generate from [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) |
| `GITHUB_TOKEN` | GitHub Token (auto-provided) | Automatically available in GitHub Actions |

#### 2. Project Configuration

The workflow is configured with your Supabase project reference:
```yaml
PROJECT_REF: lgveqfnpkxvzbnnwuled
```

### Setting Up GitHub Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the `ACCESS_TOKEN`:
   - Name: `ACCESS_TOKEN`
   - Value: Your Supabase access token

### Getting Your Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Give it a name (e.g., "GitHub Actions")
4. Select the following scopes:
   - `projects:read` - To read project information
   - `sql:execute` - To access database schema
5. Copy the generated token
6. Add it to GitHub Secrets as described above

### Testing the Workflow

#### Local Testing
```bash
# Test type generation locally
npm run update-types

# Check generated types
cat database.types.ts
```

#### Manual Trigger
To manually trigger the workflow:

1. Go to **Actions** tab in your GitHub repository
2. Select **Update database types** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### Workflow Configuration

```yaml
name: Update database types

on:
  schedule:
    # Runs daily at midnight UTC
    - cron: "0 0 * * *"
  workflow_dispatch: # Allows manual triggering

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
      PROJECT_REF: lgveqfnpkxvzbnnwuled
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm run update-types
      - name: Check for changes and commit
        # ... commit logic
```

### Customizing the Schedule

The workflow uses cron syntax. Common schedules:

- `"0 0 * * *"` - Daily at midnight UTC
- `"0 */6 * * *"` - Every 6 hours
- `"0 0 * * 0"` - Weekly on Sunday
- `"0 0 1 * *"` - Monthly on the 1st

### Troubleshooting

#### Workflow Not Running
- Check if `ACCESS_TOKEN` secret is configured
- Verify the cron schedule is correct
- Check workflow permissions in repository settings

#### Types Not Updating
- Ensure Supabase CLI is working locally
- Verify project reference is correct
- Check Supabase access token has correct permissions

#### Permission Errors
- Ensure workflow has `contents: write` permission
- Check branch protection rules don't block automated commits

### Benefits

1. **Always Up-to-Date**: Types automatically reflect database changes
2. **Type Safety**: Catch schema mismatches during development
3. **No Manual Work**: Automated daily updates
4. **Version Control**: Changes tracked in git history

### Related Files

- `.github/workflows/update-types.yml` - Workflow configuration
- `database.types.ts` - Generated TypeScript types
- `package.json` - Contains `update-types` script

### Security Notes

- Never commit access tokens directly
- Use GitHub Secrets for sensitive data
- Regularly rotate access tokens
- Limit token permissions to minimum required