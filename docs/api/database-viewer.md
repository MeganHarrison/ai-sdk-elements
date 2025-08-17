# Database Viewer API Documentation

## Overview

The Database Viewer API provides REST endpoints for browsing and querying Cloudflare D1 databases. This API allows you to list tables, view table schemas, and query table data with pagination, sorting, and search capabilities.

> ⚠️ **Security Warning**: This API currently lacks authentication and authorization. Do not use in production without implementing proper security controls.

## Base URL

```
Development: http://localhost:8787/api/v1/database
Production: https://your-domain.com/api/v1/database
```

## Authentication

**🚨 Currently not implemented** - All endpoints are publicly accessible.

## Endpoints

### 1. List All Tables

Retrieves a list of all tables in the database.

```http
GET /tables
```

#### Response

```json
{
  "success": true,
  "tables": [
    {
      "name": "users",
      "sql": "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE)"
    },
    {
      "name": "projects",
      "sql": "CREATE TABLE projects (id INTEGER PRIMARY KEY, title TEXT NOT NULL)"
    }
  ]
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Failed to fetch tables"
}
```

### 2. Get Table Schema

Retrieves the schema information for a specific table.

```http
GET /tables/:tableName/schema
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| tableName | string | Name of the table (path parameter) |

#### Response

```json
{
  "success": true,
  "columns": [
    {
      "cid": 0,
      "name": "id",
      "type": "INTEGER",
      "notnull": 0,
      "dflt_value": null,
      "pk": 1
    },
    {
      "cid": 1,
      "name": "name",
      "type": "TEXT",
      "notnull": 1,
      "dflt_value": null,
      "pk": 0
    }
  ]
}
```

#### Error Responses

- `400 Bad Request` - Invalid table name
- `500 Internal Server Error` - Database error

### 3. Get Table Data

Retrieves paginated data from a specific table with optional sorting and search.

```http
GET /tables/:tableName/data
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| tableName | string | required | Name of the table (path parameter) |
| page | number | 1 | Page number (query parameter) |
| limit | number | 50 | Number of rows per page (query parameter) |
| sortBy | string | first column | Column name to sort by (query parameter) |
| sortOrder | string | "asc" | Sort direction: "asc" or "desc" (query parameter) |
| search | string | "" | Search term for text columns (query parameter) |

#### Example Request

```bash
curl "http://localhost:8787/api/v1/database/tables/users/data?page=2&limit=20&sortBy=created_at&sortOrder=desc&search=john"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "John Smith",
      "email": "johns@example.com",
      "created_at": "2024-01-14T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalCount": 156,
    "totalPages": 8
  }
}
```

#### Search Behavior

- Searches across all TEXT/VARCHAR columns
- Case-insensitive
- Uses SQL LIKE with wildcards (`%search%`)
- Multiple columns are searched with OR logic

#### Sort Behavior

- Can sort by any column
- Defaults to ascending order
- NULL values appear last

### 4. Get Distinct Column Values

Retrieves distinct values for a specific column (useful for filters).

```http
GET /tables/:tableName/columns/:columnName/values
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| tableName | string | Name of the table (path parameter) |
| columnName | string | Name of the column (path parameter) |

#### Response

```json
{
  "success": true,
  "values": ["admin", "user", "guest"],
  "count": 3
}
```

> Note: Limited to 100 distinct values for performance reasons.

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Table or column doesn't exist |
| 500 | Internal Server Error - Database or server error |

## Rate Limiting

**🚨 Currently not implemented** - No rate limiting is in place.

## Security Considerations

### Current Vulnerabilities

1. **No Authentication**: All data is publicly accessible
2. **SQL Injection Risk**: Table names are validated but not fully parameterized
3. **No Rate Limiting**: Vulnerable to DoS attacks
4. **No Audit Logging**: No tracking of who accesses what data

### Input Validation

Table names must match the pattern: `/^[a-zA-Z0-9_]+$/`
- Alphanumeric characters and underscores only
- No spaces or special characters
- Case-sensitive

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using the provided API client
import { apiClient } from '@/lib/api-client';

// List all tables
const tables = await apiClient.database.getTables();

// Get table schema
const schema = await apiClient.database.getTableSchema('users');

// Get paginated data
const data = await apiClient.database.getTableData('users', {
  page: 1,
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'desc',
  search: 'john'
});

// Get distinct values
const roles = await apiClient.database.getColumnValues('users', 'role');
```

### cURL

```bash
# List tables
curl http://localhost:8787/api/v1/database/tables

# Get table data with parameters
curl "http://localhost:8787/api/v1/database/tables/users/data?page=1&limit=10&sortBy=name&sortOrder=asc"

# Get distinct column values
curl http://localhost:8787/api/v1/database/tables/users/columns/status/values
```

## Performance Considerations

1. **Default Limit**: 50 rows per page (max 200)
2. **Search Performance**: Full table scan on text columns
3. **No Caching**: Every request hits the database
4. **No Connection Pooling**: New connection per request

## Future Improvements

1. **Authentication & Authorization**
   - JWT/OAuth2 implementation
   - Role-based access control
   - Table/column level permissions

2. **Performance**
   - Request caching
   - Database connection pooling
   - Search indexing
   - Query optimization

3. **Features**
   - Export functionality (CSV, JSON)
   - Advanced filtering
   - Aggregate functions
   - Join support

4. **Security**
   - Parameterized queries
   - Rate limiting
   - Audit logging
   - Input sanitization

## Changelog

### v1.0.0 (Current)
- Initial release
- Basic CRUD operations
- Pagination, sorting, and search
- No authentication (development only)