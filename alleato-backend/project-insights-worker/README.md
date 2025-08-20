# Project Insights Worker

A Cloudflare Worker that automatically generates AI-powered insights from meeting transcripts stored in Supabase.

## Features

- **Automatic Insights Generation**: Processes meeting transcripts to extract actionable insights
- **Project Intelligence**: Automatically infers project associations using multiple strategies
- **Pattern Detection**: Identifies cross-meeting patterns and trends
- **Categorized Insights**: Classifies insights as risks, opportunities, decisions, action items, technical, or strategic
- **Severity Scoring**: Assigns severity levels (low/medium/high/critical) based on impact
- **Confidence Scoring**: Provides confidence scores for each insight

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account
- Supabase project with meeting data
- OpenAI API key

### Installation

```bash
npm install
```

### Configuration

Update `wrangler.toml` with your credentials:

```toml
[vars]
SUPABASE_URL = "your-supabase-url"
SUPABASE_SERVICE_KEY = "your-service-key"
OPENAI_API_KEY = "your-openai-key"
```

**Important**: For production, use Cloudflare secrets instead of vars for sensitive keys:

```bash
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put OPENAI_API_KEY
```

## Development

### Local Testing

```bash
npm run dev
```

This starts the worker locally on `http://localhost:8788`

### Available Endpoints

- `GET /test` - Health check endpoint
- `GET /process?limit=N` - Process N meetings (default: 2)

### Test the Worker

```bash
# Health check
curl http://localhost:8788/test

# Process 1 meeting
curl "http://localhost:8788/process?limit=1"
```

## Deployment

### Deploy to Cloudflare

```bash
npm run deploy
```

This deploys the worker to your Cloudflare account.

### Scheduled Processing

The worker is configured to run automatically every hour via cron trigger:

```toml
[triggers]
crons = ["0 * * * *"]  # Every hour
```

## How It Works

### 1. Meeting Processing

The worker fetches recent meetings from Supabase that haven't been processed for insights.

### 2. Project Inference

Uses multiple strategies to determine project association:
- Meeting title matching
- Job number detection
- Participant email domain matching
- Client-project relationships
- Content analysis for project mentions

### 3. Insight Generation

For each meeting:
- Combines all chunks to get full transcript
- Uses GPT-4 to extract categorized insights
- Assigns severity and confidence scores
- Stores insights in `ai_insights` table

### 4. Pattern Detection

After processing individual meetings:
- Groups insights by project
- Identifies recurring themes
- Detects escalating issues
- Creates meta-insights for patterns

## Database Schema

The worker expects these Supabase tables:

- `meetings` - Meeting records with metadata
- `meeting_chunks` - Transcript chunks with embeddings
- `ai_insights` - Generated insights
- `projects` - Project definitions
- `clients` - Client information

## Insight Categories

- **Risk**: Issues that could delay or block projects
- **Opportunity**: Chances for improvement or growth
- **Decision**: Important choices made or needed
- **Action Item**: Specific tasks with clear owners
- **Technical**: Architecture and implementation details
- **Strategic**: Business pivots and positioning

## Monitoring

Check worker logs in Cloudflare dashboard:

```bash
wrangler tail
```

## Troubleshooting

### Worker Timeout

If processing many meetings, reduce the limit:
```bash
curl "http://localhost:8788/process?limit=1"
```

### Missing Insights

Check if meetings have chunks:
- Meetings without chunks will be skipped
- Verify `meeting_chunks` table has data

### Project Not Assigned

Improve project inference by:
- Adding job numbers to project records
- Ensuring client associations are set
- Including project names in meeting titles

## Security

- Use Cloudflare secrets for production
- Service key has full database access - handle carefully
- OpenAI API key should have appropriate spending limits
- Worker has CORS enabled for development - restrict in production

## Performance

- Default limit: 2 meetings per run
- Scheduled hourly to avoid timeouts
- Chunks are combined for full context
- Transcripts truncated at 12,000 chars for API limits

## Future Enhancements

- [ ] Webhook support for real-time processing
- [ ] Batch processing optimization
- [ ] Custom insight templates per project
- [ ] Email notifications for critical insights
- [ ] Dashboard for insight analytics