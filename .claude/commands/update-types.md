# /update-types - Update Supabase Database Types

## Description
Triggers the GitHub workflow to update TypeScript types from the Supabase database schema.

## Usage
```
/update-types [option]
```

## Options
- `(no option)` - Run the direct commit workflow
- `pr` - Create a pull request with type changes
- `local` - Update types locally using npm script
- `check` - Check if types are up-to-date
- `status` - Check the status of recent workflow runs

## Examples

### Update types directly to main branch
```
/update-types
```

### Create a PR with type updates
```
/update-types pr
```

### Update types locally
```
/update-types local
```

### Check workflow status
```
/update-types status
```

## Implementation

When this command is called, Claude should:

1. For `/update-types` (default):
   ```bash
   gh workflow run "Update Supabase Types (Direct Commit)" --ref main
   ```

2. For `/update-types pr`:
   ```bash
   gh workflow run "Update Supabase Types" --ref main
   ```

3. For `/update-types local`:
   ```bash
   npm run update-types
   ```

4. For `/update-types check`:
   ```bash
   npm run types:check
   ```

5. For `/update-types status`:
   ```bash
   gh run list --workflow="update-supabase-types-direct.yml" --limit 5
   ```

## Requirements
- GitHub CLI must be authenticated
- SUPABASE_ACCESS_TOKEN must be set in GitHub secrets
- For local updates, Supabase CLI must be installed

## Troubleshooting

If the workflow fails:
1. Check if SUPABASE_ACCESS_TOKEN is set correctly (should start with `sbp_`)
2. Verify GitHub CLI is authenticated: `gh auth status`
3. Check workflow logs: `gh run view [RUN_ID] --log`

## Related Commands
- `/deploy` - Deploy to production
- `/test` - Run Playwright tests
- `/commit` - Create a git commit