# Drizzle ORM Setup Guide

## Overview
The AI SDK RAG template has been successfully integrated into the root project. Drizzle ORM is now configured to work with your PostgreSQL database (or Supabase).

## Configuration

### Database Connection
The database connection can be configured in two ways:

1. **Direct PostgreSQL**: Set `DATABASE_URL` in your `.env` file
2. **Supabase**: The system will automatically use your Supabase connection if `DATABASE_URL` is not set

### Drizzle Configuration
- **Config file**: `/drizzle.config.ts`
- **Schema location**: `/src/lib/db/schema/`
- **Migrations**: `/src/lib/db/migrations/`
- **Database client**: `/src/lib/db/index.ts`

## Database Schema

The following tables are configured:

### 1. Projects Table
- Complete project management schema
- Includes metadata as JSONB for flexible fields
- Status, priority, dates, budget tracking

### 2. Resources Table
- Stores documents/content for RAG
- Title, content, URL, type fields
- Timestamps for tracking

### 3. Embeddings Table
- Vector embeddings for semantic search
- Uses pgvector extension (1536 dimensions)
- Links to resources table
- HNSW index for fast similarity search

## Available Commands

```bash
# Generate migrations from schema
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema directly to database (dev only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Check migrations
npm run db:check

# Drop all tables (careful!)
npm run db:drop

# Pull schema from existing database
npm run db:pull
```

## Setting Up the Database

### Option 1: Using Supabase (Recommended)

1. Enable pgvector extension in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Run migrations:
```bash
npm run db:push
```

### Option 2: Using Direct PostgreSQL

1. Ensure PostgreSQL has pgvector installed
2. Set `DATABASE_URL` in `.env`
3. Run migrations:
```bash
npm run db:migrate
```

## Working with the RAG System

### Creating Resources with Embeddings

```typescript
import { createResource } from '@/lib/ai/embeddings';

// Add a document to the RAG system
const resource = await createResource(
  'Your document content here',
  'Document Title'
);
```

### Searching with Semantic Similarity

```typescript
import { findRelevantContent } from '@/lib/ai/embeddings';

// Find relevant content for a query
const results = await findRelevantContent('user query', 4);
```

## Project Integration

### Using Drizzle with Projects

```typescript
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

// Get all projects
const allProjects = await db.select().from(projects);

// Create a project
const [newProject] = await db.insert(projects).values({
  title: 'New Project',
  status: 'active',
  priority: 'high'
}).returning();

// Update a project
await db.update(projects)
  .set({ status: 'completed' })
  .where(eq(projects.id, projectId));
```

## Migration Status

✅ **Completed:**
- Drizzle ORM installed and configured
- Database schemas created
- Migration system set up
- AI embeddings functionality integrated
- Projects table with full schema

## Environment Variables

Add these to your `.env` file:

```env
# Option 1: Direct PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Option 2: Use existing Supabase (automatic fallback)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Required for embeddings
OPENAI_API_KEY=your-openai-key
```

## Troubleshooting

### Error: "vector type not found"
- Enable pgvector extension: `CREATE EXTENSION vector;`

### Error: "Cannot find module"
- Run: `npm install --legacy-peer-deps`

### Migration issues
- Check database connection
- Ensure proper permissions
- Try `npm run db:push` for development

## Next Steps

1. Run `npm run db:studio` to explore your database
2. Test the embeddings with sample content
3. Integrate with your existing Supabase tables
4. Set up proper environment variables for production