# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI chatbot application built with Next.js 15, TypeScript, and the AI SDK. It features a conversational interface with support for multiple AI models (GPT-4o, Deepseek R1) and web search capabilities via Perplexity.

## Development Commands

```bash
# Install dependencies (supports npm, yarn, pnpm, or bun)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: Custom components based on shadcn/ui patterns
- **AI Integration**: Vercel AI SDK (@ai-sdk/react and ai packages)

### Project Structure
- `/src/app/` - Next.js App Router pages and API routes
  - `api/chat/route.ts` - Main chat endpoint handling streaming responses
  - `api/citation/route.ts` - Citation handling endpoint
- `/src/components/` - React components
  - `ai-elements/` - AI-specific UI components (conversation, message, prompt input, etc.)
  - `ui/` - Base UI components (button, input, etc.)
- `/src/lib/` - Utility functions

### Key Patterns

1. **Component Architecture**: Uses composition pattern with exported sub-components (e.g., `Conversation`, `ConversationContent`, `ConversationScrollButton`)

2. **AI Message Handling**: Messages contain parts with different types:
   - `text` - Regular message content
   - `reasoning` - Model reasoning/thinking process
   - `source-url` - Web search sources

3. **Streaming Responses**: Uses Vercel AI SDK's `streamText` with UI message stream responses, supporting up to 30-second streaming

4. **Model Selection**: Dynamic model switching between providers (OpenAI, Deepseek, Perplexity for web search)

5. **Import Aliases**: Uses `@/` prefix for absolute imports from `src/` directory

### Component Conventions
- Client components marked with `'use client'` directive
- Props types exported as `{ComponentName}Props`
- Consistent use of `cn()` utility for className merging
- Components accept and spread standard HTML props

### Dependencies to Note
- `use-stick-to-bottom` - Manages auto-scrolling conversation
- `harden-react-markdown` - Secure markdown rendering
- `react-syntax-highlighter` - Code block syntax highlighting
- Math rendering support via KaTeX

## Development Tips

- The app uses Tailwind CSS v4 with PostCSS configuration
- shadcn/ui components are configured in `components.json` with stone base color
- TypeScript path alias `@/*` maps to `./src/*`
- ESLint is configured for Next.js standards