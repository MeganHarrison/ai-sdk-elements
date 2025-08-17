# Alleato Backend API Reference

## Overview

The Alleato backend provides REST APIs for various features including database management, authentication, projects, and meetings. Built on Cloudflare Workers with Hono framework.

## Base Configuration

```typescript
// Base URL
Development: http://localhost:8787
Production: https://your-domain.workers.dev

// API Versioning
/api/v1/*
```

## Available APIs

### 1. Database API
Full documentation: [Database Viewer API](../docs/api/database-viewer.md)

**Endpoints:**
- `GET /api/v1/database/tables` - List all tables
- `GET /api/v1/database/tables/:tableName/schema` - Get table schema
- `GET /api/v1/database/tables/:tableName/data` - Get table data
- `GET /api/v1/database/tables/:tableName/columns/:columnName/values` - Get distinct values

### 2. Authentication API

**Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/user` - Get current user

### 3. Projects API

**Endpoints:**
- `GET /api/v1/projects` - List user projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### 4. Meetings API

**Endpoints:**
- `GET /api/v1/meetings` - List meetings
- `POST /api/v1/meetings` - Create meeting
- `GET /api/v1/meetings/:id` - Get meeting details
- `PUT /api/v1/meetings/:id` - Update meeting
- `DELETE /api/v1/meetings/:id` - Delete meeting

## Environment Variables

```env
# Required
ENVIRONMENT=development|production

# Database Bindings (in wrangler.toml)
[[d1_databases]]
binding = "DB"
database_name = "alleato"
database_id = "your-database-id"

# KV Namespaces
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-kv-id"

[[kv_namespaces]]
binding = "CACHE"
id = "your-cache-kv-id"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your-rate-limit-kv-id"

# R2 Bucket
[[r2_buckets]]
binding = "R2"
bucket_name = "alleato-files"
```

## Error Handling

All APIs follow consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": {} // Optional additional context
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Security Headers

All responses include security headers:

```typescript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

## Rate Limiting

> ⚠️ Not currently implemented

Planned rate limits:
- Authentication endpoints: 5 requests/minute
- API endpoints: 100 requests/minute
- Database queries: 50 requests/minute

## CORS Configuration

```typescript
cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
})
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run with specific port
npm run dev -- --port 8787
```

### Database Migrations

```bash
# Create new migration
wrangler d1 migrations create alleato "migration_name"

# Apply migrations locally
wrangler d1 execute alleato --local --file=./migrations/0001_init.sql

# Apply to production
wrangler d1 execute alleato --env production --file=./migrations/0001_init.sql
```

### Testing API Endpoints

```bash
# List tables
curl http://localhost:8787/api/v1/database/tables

# Get table data
curl "http://localhost:8787/api/v1/database/tables/users/data?limit=10"

# With authentication (when implemented)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8787/api/v1/projects
```

## Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Deploy to specific environment
npm run deploy -- --env production
```

## Monitoring

Check Worker analytics in Cloudflare dashboard:
- Request count
- Error rate
- Response times
- CPU time usage

## Known Issues

1. **No Authentication** - Currently all endpoints are public
2. **SQL Injection Risk** - Table names not fully parameterized
3. **No Rate Limiting** - Vulnerable to abuse
4. **No Request Validation** - Missing schema validation

## Future Enhancements

- [ ] JWT Authentication
- [ ] Request validation with Zod
- [ ] Rate limiting with Cloudflare Rate Limiting
- [ ] Websocket support for real-time features
- [ ] GraphQL API option
- [ ] OpenAPI/Swagger documentation
- [ ] API versioning strategy

---

For detailed database API documentation, see [Database Viewer API](../docs/api/database-viewer.md)