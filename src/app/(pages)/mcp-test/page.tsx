'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, Table, Code, AlertCircle, CheckCircle } from 'lucide-react';

export default function MCPTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 5');
  const [activeTab, setActiveTab] = useState('info');

  const testEndpoint = async (action: string, queryParam?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          query: queryParam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testGetInfo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    { label: 'List Users', query: 'SELECT * FROM users LIMIT 5' },
    { label: 'List Projects', query: 'SELECT * FROM projects LIMIT 5' },
    { label: 'List Resources', query: 'SELECT * FROM resources LIMIT 5' },
    { label: 'Count Users', query: 'SELECT COUNT(*) as total FROM users' },
    { label: 'Recent Resources', query: 'SELECT * FROM resources ORDER BY created_at DESC LIMIT 10' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MCP Supabase Test Suite</h1>
        <p className="text-muted-foreground">
          Test the Model Context Protocol integration with Supabase
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">API Info</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Endpoint Information
              </CardTitle>
              <CardDescription>
                Test the GET endpoint to retrieve API capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testGetInfo}
                disabled={loading}
                className="mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test GET Endpoint'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Database Tables
              </CardTitle>
              <CardDescription>
                Retrieve a list of all available tables in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testEndpoint('getTables')}
                disabled={loading}
                className="mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Tables...
                  </>
                ) : (
                  'Get Tables'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Schema
              </CardTitle>
              <CardDescription>
                Retrieve the complete schema for all tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testEndpoint('getSchema')}
                disabled={loading}
                className="mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Schema...
                  </>
                ) : (
                  'Get Schema'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                SQL Query Executor
              </CardTitle>
              <CardDescription>
                Execute SELECT queries against the database (read-only mode)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample Queries:</label>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.map((sample) => (
                    <Button
                      key={sample.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(sample.query)}
                    >
                      {sample.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="query" className="text-sm font-medium">
                  SQL Query:
                </label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SELECT query..."
                  className="font-mono text-sm h-32"
                />
              </div>

              <Button 
                onClick={() => testEndpoint('query', query)}
                disabled={loading || !query.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing Query...
                  </>
                ) : (
                  'Execute Query'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      <div className="mt-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              {Array.isArray(result) && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {result.length} row(s) returned
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}