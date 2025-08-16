# Alleato Backend - Cloudflare Workers

This is the backend API for the Alleato AI Chat application, running on Cloudflare Workers.

## Features

- **Chat API**: Stream AI responses using OpenAI models
- **Citation Generation**: Generate content with proper citations
- **RAG Pipeline**: Simple retrieval-augmented generation for contextual responses
- **Edge Deployment**: Global distribution with Cloudflare Workers

## Setup

1. Install dependencies:
```bash
cd alleato-backend
npm install
```

2. Configure Cloudflare credentials:
```bash
npx wrangler login
```

3. Create KV namespaces:
```bash
npx wrangler kv:namespace create "SESSIONS"
npx wrangler kv:namespace create "CACHE"
npx wrangler kv:namespace create "RATE_LIMIT"
```

4. Create D1 database:
```bash
npx wrangler d1 create alleato
```

5. Update `wrangler.toml` with the IDs from the previous commands.

6. Set secrets:
```bash
npx wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

## Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:8787`

## API Endpoints

### Chat
- `POST /api/v1/chat` - Send messages and receive AI responses

### Citations
- `POST /api/v1/citation` - Generate content with citations

### RAG (Retrieval-Augmented Generation)
- `POST /api/v1/rag/query` - Query with context retrieval
- `POST /api/v1/rag/documents` - Upload documents
- `GET /api/v1/rag/documents` - List documents

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

For staging deployment:
```bash
npx wrangler deploy --env staging
```

## Environment Variables

The following secrets need to be configured:
- `OPENAI_API_KEY` - Your OpenAI API key
- `PERPLEXITY_API_KEY` (optional) - For web search functionality

## Testing

Test the deployed API:
```bash
# Health check
curl https://your-worker.workers.dev/health

# Chat endpoint
curl -X POST https://your-worker.workers.dev/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4o",
    "webSearch": false
  }'
```