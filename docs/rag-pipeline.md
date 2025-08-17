# RAG Pipeline Documentation

## Overview

The RAG (Retrieval-Augmented Generation) pipeline is a sophisticated system for processing Fireflies meeting transcripts and providing intelligent, context-aware responses through an AI agent. The pipeline consists of multiple Cloudflare Workers that work together to ingest, process, and query meeting data.

## Architecture

### Workers

1. **Fireflies Ingest Worker** (`fireflies-ingest-worker`)
   - Syncs transcripts from Fireflies API
   - Stores meeting data in D1 database
   - Queues processing tasks
   - Runs on a 30-minute schedule

2. **Vectorize Worker** (`vectorize-worker`)
   - Processes queued transcripts
   - Creates semantic chunks
   - Generates embeddings using Cloudflare AI
   - Links transcripts to projects intelligently
   - Extracts insights and action items

3. **AI Agent Worker** (`ai-agent-worker`)
   - Provides chat API for users
   - Retrieves relevant context using vector search
   - Generates strategic responses
   - Maintains chat sessions
   - Supports multiple modes: recall, strategy, balanced

### Data Flow

```
Fireflies API → Ingest Worker → D1 Database → Processing Queue
                                                       ↓
                                              Vectorize Worker
                                                       ↓
                                          Embeddings & Insights
                                                       ↓
                                              AI Agent Worker
                                                       ↓
                                              User Interface
```

## Database Schema

### Core Tables

- `meetings` - Meeting records from Fireflies
- `document_chunks` - Vectorized text chunks
- `project_insights` - Categorized insights
- `meeting_summaries` - AI-generated summaries
- `project_tasks` - Extracted action items
- `rag_queries` - Query history and feedback

## API Endpoints

### Main Backend Routes (`/api/v1/ai-agent/`)

#### Chat Endpoint
```
POST /api/v1/ai-agent/chat
{
  "query": "What were the key decisions in yesterday's meeting?",
  "projectId": "project-123",  // optional
  "sessionId": "session-456",  // optional
  "mode": "balanced"          // recall | strategy | balanced
}
```

#### Project Summary
```
GET /api/v1/ai-agent/project/{projectId}/summary
```

#### Feedback
```
POST /api/v1/ai-agent/feedback
{
  "queryId": "query-123",
  "rating": 5,
  "feedback": "Very helpful response"
}
```

#### Manual Sync
```
POST /api/v1/ai-agent/sync/fireflies
```

## Features

### 1. Intelligent Project Linking
The system automatically matches meetings to projects based on:
- Title similarity
- Participant matching
- Keyword analysis
- Previous assignments

### 2. Multi-Level Insights
Insights are categorized into:
- **General Information** - Status updates, facts
- **Positive Feedback** - Wins, achievements
- **Risks** - Concerns, blockers
- **Action Items** - Tasks and commitments

### 3. Semantic Search
- Uses vector embeddings for accurate retrieval
- Considers recency and relevance
- Supports project-scoped searches

### 4. Strategic Analysis
The AI agent can:
- Identify patterns across projects
- Track sentiment trends
- Provide business recommendations
- Surface recurring issues

## Deployment

### Prerequisites
- Cloudflare account with Workers enabled
- D1 database created
- Wrangler CLI installed
- Node.js and npm

### Quick Deploy
```bash
# Run the deployment script
./scripts/deploy-rag-pipeline.sh

# Set required secrets
wrangler secret put FIREFLIES_API_KEY
wrangler secret put OPENAI_API_KEY  # Optional, for better quality
```

### Manual Deployment
```bash
# 1. Apply database migrations
cd alleato-backend
wrangler d1 migrations apply alleato

# 2. Deploy each worker
cd ../workers/fireflies-ingest-worker
npm install && wrangler deploy

cd ../vectorize-worker
npm install && wrangler deploy

cd ../ai-agent-worker
npm install && wrangler deploy

# 3. Update main backend
cd ../../alleato-backend
wrangler deploy
```

## Configuration

### Environment Variables

#### Fireflies Ingest Worker
- `FIREFLIES_API_KEY` - API key from Fireflies
- `FIREFLIES_API_URL` - GraphQL endpoint (default: https://api.fireflies.ai/graphql)

#### AI Agent Worker
- `OPENAI_API_KEY` - Optional, for GPT-4 responses

#### Main Backend
- `AI_AGENT_URL` - AI Agent Worker URL
- `FIREFLIES_INGEST_URL` - Ingest Worker URL

### Cron Schedule
Edit `wrangler.toml` in fireflies-ingest-worker:
```toml
[triggers]
crons = ["*/30 * * * *"]  # Every 30 minutes
```

## Usage Examples

### Basic Chat Query
```javascript
const response = await fetch('/api/v1/ai-agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the current blockers for Project Alpha?",
    projectId: "proj_123"
  })
});
```

### Strategic Analysis
```javascript
const response = await fetch('/api/v1/ai-agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Compare risk patterns across all active projects",
    mode: "strategy"
  })
});
```

### Project Dashboard Data
```javascript
const summary = await fetch('/api/v1/ai-agent/project/proj_123/summary');
const data = await summary.json();
// Returns: sentiment, tasks, insights, recent meetings
```

## Monitoring

### Check Worker Status
```bash
# View logs
wrangler tail fireflies-ingest-worker
wrangler tail vectorize-worker
wrangler tail ai-agent-worker

# Check sync status
curl https://your-backend.workers.dev/api/v1/ai-agent/sync/status
```

### Performance Metrics
- Processing queue depth
- Vectorization success rate
- Query response times
- Cache hit rates

## Troubleshooting

### Common Issues

1. **Sync Not Working**
   - Check FIREFLIES_API_KEY is set
   - Verify cron trigger is configured
   - Check worker logs for errors

2. **No Results in Chat**
   - Ensure meetings are vectorized
   - Check vector index exists
   - Verify project linking

3. **Slow Responses**
   - Consider enabling caching
   - Reduce chunk size
   - Optimize vector search parameters

### Debug Commands
```bash
# Check database
wrangler d1 execute alleato --command "SELECT COUNT(*) FROM meetings"

# Trigger manual sync
curl -X POST https://your-backend.workers.dev/api/v1/ai-agent/sync/fireflies

# View processing queue
wrangler d1 execute alleato --command "SELECT * FROM processing_queue WHERE status='pending'"
```

## Security Considerations

1. **API Keys** - Store as encrypted secrets
2. **Rate Limiting** - Implemented on all endpoints
3. **Access Control** - Implement authentication before production
4. **Data Privacy** - Ensure compliance with data policies

## Future Enhancements

1. **Real-time Processing** - WebSocket support
2. **Multi-language Support** - Transcript translation
3. **Advanced Analytics** - Meeting efficiency metrics
4. **Integration Expansion** - Slack, Teams notifications
5. **Custom Models** - Fine-tuned embeddings

## Support

For issues or questions:
1. Check worker logs
2. Review this documentation
3. Open an issue in the repository
4. Contact the development team