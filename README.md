# Alleato AI Chat

An AI-powered chat application with RAG capabilities, built with Next.js frontend and Cloudflare Workers backend.

## Architecture

This project consists of two separate deployments:
- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Cloudflare Workers API providing AI chat, citations, and RAG functionality

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (for frontend)
- npm (for backend)
- Cloudflare account (for backend deployment)
- OpenAI API key

### Frontend Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env.local`:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. Run the development server:
```bash
pnpm dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. Navigate to backend directory:
```bash
cd alleato-backend
npm install
```

2. Configure Cloudflare:
```bash
npx wrangler login
```

3. Set up resources (see alleato-backend/README.md for details)

4. Run the backend development server:
```bash
npm run dev
```

The backend API will be available at [http://localhost:8787](http://localhost:8787)

## Features

- **AI Chat**: Multiple model support (GPT-4o, DeepSeek R1, etc.)
- **Web Search**: Perplexity integration for web-powered responses
- **Citations**: Generate content with proper citations
- **RAG Pipeline**: Upload documents and query with context
- **Streaming**: Real-time response streaming
- **AI Elements**: Pre-built UI components for common AI patterns

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Cloudflare Workers)
```bash
cd alleato-backend
npm run deploy
```

## Project Structure

```
ai-elements-chatbot/
├── src/                    # Frontend source
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── lib/              # Utilities and API client
├── alleato-backend/       # Backend source
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   └── wrangler.toml     # Cloudflare config
└── docs/                  # Architecture documentation
```

## API Endpoints

- `POST /api/v1/chat` - Send chat messages
- `POST /api/v1/citation` - Generate citations
- `POST /api/v1/rag/query` - RAG query
- `POST /api/v1/rag/documents` - Upload documents
- `GET /api/v1/rag/documents` - List documents

## Development

Both frontend and backend support hot reloading during development. 

To test the full stack locally:
1. Start the backend: `cd alleato-backend && npm run dev`
2. Start the frontend: `pnpm dev`
3. Ensure `NEXT_PUBLIC_BACKEND_URL=http://localhost:8787` is set

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT