# Database Viewer Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Patterns & Best Practices](#code-patterns--best-practices)
6. [Testing Guide](#testing-guide)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)

## Architecture Overview

The Database Viewer is a full-stack application for browsing Cloudflare D1 databases:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Next.js App    │────▶│ Cloudflare       │────▶│  D1 Database    │
│  (Frontend)     │     │ Workers (API)    │     │                 │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                         │
        ▼                         ▼
   Vercel Deploy           CF Deploy
```

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **UI Components**: shadcn/ui, Radix UI
- **Deployment**: Vercel (frontend), Cloudflare (backend)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account with D1 database
- Vercel account (for frontend deployment)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-elements-chatbot.git
   cd ai-elements-chatbot
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   pnpm install

   # Backend dependencies
   cd alleato-backend
   npm install
   ```

3. **Configure environment variables**

   Frontend (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8787
   ```

   Backend (`alleato-backend/.env`):
   ```env
   ENVIRONMENT=development
   ```

4. **Set up D1 database**
   ```bash
   cd alleato-backend
   
   # Create database
   wrangler d1 create alleato
   
   # Run migrations
   wrangler d1 execute alleato --local --file=./migrations/0001_init.sql
   wrangler d1 execute alleato --local --file=./migrations/0002_add_meetings.sql
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd alleato-backend
   npm run dev

   # Terminal 2: Frontend
   pnpm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8787
   - Database Viewer: http://localhost:3000/data/database

## Project Structure

```
ai-elements-chatbot/
├── src/
│   ├── app/
│   │   └── data/
│   │       └── database/
│   │           ├── page.tsx              # Database list view
│   │           └── [tableName]/
│   │               └── page.tsx          # Table data view
│   ├── components/
│   │   └── ui/                          # Reusable UI components
│   └── lib/
│       └── api-client.ts                # API client with database methods
├── alleato-backend/
│   ├── src/
│   │   ├── index.ts                     # Main entry point
│   │   └── routes/
│   │       └── database.ts              # Database API routes
│   ├── migrations/                      # D1 schema migrations
│   └── wrangler.toml                    # Cloudflare config
└── docs/
    ├── api/
    │   └── database-viewer.md           # API documentation
    └── guides/
        └── database-viewer-developer-guide.md
```

### Key Files Explained

#### Frontend

**`/src/app/data/database/page.tsx`**
- Lists all available tables
- Handles loading states and errors
- Navigates to individual table views

**`/src/app/data/database/[tableName]/page.tsx`**
- Displays table data with pagination
- Implements sorting and search
- Formats data based on column types

**`/src/lib/api-client.ts`**
- Centralized API client
- Type-safe database methods
- Error handling

#### Backend

**`/alleato-backend/src/routes/database.ts`**
- RESTful API endpoints
- SQL query construction
- Input validation
- Response formatting

## Development Workflow

### Adding a New Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/export-csv
   ```

2. **Update the API (if needed)**
   ```typescript
   // alleato-backend/src/routes/database.ts
   databaseRoutes.get('/tables/:tableName/export', async (c) => {
     // Implementation
   });
   ```

3. **Update the API client**
   ```typescript
   // src/lib/api-client.ts
   database: {
     // ... existing methods
     exportTable: async (tableName: string, format: 'csv' | 'json') => {
       const response = await fetch(`${API_URL}/database/tables/${tableName}/export?format=${format}`);
       return response.blob();
     }
   }
   ```

4. **Implement UI changes**
   ```typescript
   // Add export button to table view
   <Button onClick={() => handleExport('csv')}>
     <Download className="h-4 w-4 mr-2" />
     Export CSV
   </Button>
   ```

5. **Test locally**
   - Manual testing
   - Add unit tests (when implemented)
   - Check error scenarios

6. **Submit PR**
   ```bash
   git add .
   git commit -m "feat: add CSV export functionality"
   git push origin feature/export-csv
   ```

### Code Style Guidelines

- Use TypeScript strictly (avoid `any`)
- Follow React best practices (hooks, functional components)
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use descriptive variable names
- Add JSDoc comments for complex functions

## Code Patterns & Best Practices

### 1. API Error Handling

```typescript
// ❌ Bad
try {
  const data = await fetch('/api/data');
  return data.json();
} catch (e) {
  console.log('Error');
}

// ✅ Good
try {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Unknown error');
  }
  
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Show user-friendly error
  throw new Error('Failed to load data. Please try again.');
}
```

### 2. Component Structure

```typescript
// ✅ Good component structure
export default function TableDataView() {
  // 1. Hooks first
  const params = useParams();
  const [data, setData] = useState([]);
  
  // 2. Derived state
  const isEmpty = data.length === 0;
  
  // 3. Effects
  useEffect(() => {
    loadData();
  }, [params.tableName]);
  
  // 4. Handlers
  const handleSort = (column: string) => {
    // Implementation
  };
  
  // 5. Early returns
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  // 6. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### 3. Type Safety

```typescript
// ❌ Bad
const formatValue = (value: any) => {
  return value?.toString() || 'N/A';
};

// ✅ Good
type SqlValue = string | number | boolean | null;

const formatValue = (value: SqlValue): string => {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return String(value);
};
```

### 4. SQL Query Building

```typescript
// ❌ Bad - SQL Injection vulnerable
const query = `SELECT * FROM ${tableName} WHERE name LIKE '%${search}%'`;

// ✅ Good - Safe but still needs improvement
const tableName = validateTableName(params.tableName);
const query = c.env.DB.prepare(
  `SELECT * FROM ${tableName} WHERE name LIKE ?`
).bind(`%${search}%`);
```

## Testing Guide

> ⚠️ **Note**: Testing infrastructure is not yet implemented. This section describes the planned approach.

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

### Writing Tests

#### Component Tests

```typescript
// __tests__/components/DatabaseList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import DatabaseList from '@/app/data/database/page';

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    database: {
      getTables: jest.fn()
    }
  }
}));

describe('DatabaseList', () => {
  it('displays loading state initially', () => {
    render(<DatabaseList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays tables after loading', async () => {
    const mockTables = [
      { name: 'users', sql: 'CREATE TABLE users...' },
      { name: 'posts', sql: 'CREATE TABLE posts...' }
    ];
    
    apiClient.database.getTables.mockResolvedValue({
      success: true,
      tables: mockTables
    });

    render(<DatabaseList />);
    
    await waitFor(() => {
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('posts')).toBeInTheDocument();
    });
  });
});
```

#### API Tests

```typescript
// alleato-backend/src/routes/__tests__/database.test.ts
import { testClient } from 'hono/testing';
import { databaseRoutes } from '../database';

describe('Database API', () => {
  it('validates table names', async () => {
    const client = testClient(databaseRoutes);
    
    const response = await client.tables[':tableName'].data.$get({
      param: { tableName: 'users; DROP TABLE users;--' }
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid table name');
  });
});
```

## Deployment Guide

### Frontend (Vercel)

1. **Connect GitHub repository**
   - Go to vercel.com
   - Import repository
   - Configure build settings:
     - Framework: Next.js
     - Build command: `pnpm build`
     - Output directory: `.next`

2. **Set environment variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-api.workers.dev
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Backend (Cloudflare Workers)

1. **Configure production database**
   ```bash
   # Create production database
   wrangler d1 create alleato --env production
   
   # Update wrangler.toml with database ID
   ```

2. **Run migrations**
   ```bash
   wrangler d1 execute alleato --env production --file=./migrations/0001_init.sql
   wrangler d1 execute alleato --env production --file=./migrations/0002_add_meetings.sql
   ```

3. **Deploy**
   ```bash
   cd alleato-backend
   npm run deploy
   ```

### Environment Configuration

#### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:8787
- Database: Local D1 instance

#### Production
- Frontend: https://your-app.vercel.app
- Backend: https://your-api.workers.dev
- Database: Production D1 instance

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch tables" error

**Cause**: Backend API is not running or CORS issue
**Solution**: 
- Ensure backend is running: `cd alleato-backend && npm run dev`
- Check NEXT_PUBLIC_API_URL in frontend
- Verify CORS headers in backend

#### 2. "Invalid table name" error

**Cause**: Table name contains special characters
**Solution**: Only use alphanumeric characters and underscores

#### 3. Build fails with missing dependencies

**Cause**: Package manager mismatch
**Solution**: 
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. D1 Database connection issues

**Cause**: Database not configured properly
**Solution**:
- Check wrangler.toml configuration
- Verify database bindings
- Ensure migrations have run

### Debug Mode

Enable debug logging:

```typescript
// Frontend
localStorage.setItem('DEBUG', 'true');

// Backend
ENVIRONMENT=development npm run dev
```

## Contributing

### Before Starting

1. Read the [Code of Conduct](../CODE_OF_CONDUCT.md)
2. Check existing issues and PRs
3. Discuss major changes in an issue first

### Pull Request Process

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following code style
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Run linting**: `pnpm lint`
7. **Commit with conventional commits**:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation
   - `refactor:` Code refactoring
   - `test:` Test additions
   - `chore:` Maintenance
8. **Push and create PR**

### Development Tips

1. **Use the Todo system**
   ```typescript
   // When working on complex features
   TodoWrite({
     content: "Implement CSV export",
     status: "in_progress",
     priority: "medium"
   });
   ```

2. **Check browser console** for API errors
3. **Use React DevTools** for component debugging
4. **Monitor Network tab** for API calls
5. **Test with different data sizes**

### Getting Help

- Create an issue for bugs
- Start a discussion for features
- Check existing documentation
- Ask in PR comments

## Security Notes

> ⚠️ **Critical**: The current implementation has security vulnerabilities. Do not use in production without implementing:

1. **Authentication & Authorization**
2. **Parameterized Queries** (prevent SQL injection)
3. **Rate Limiting**
4. **Input Validation**
5. **Audit Logging**

See [SECURITY_AUDIT_DATABASE_VIEWER.md](../SECURITY_AUDIT_DATABASE_VIEWER.md) for details.

---

Last updated: January 2024
Version: 1.0.0