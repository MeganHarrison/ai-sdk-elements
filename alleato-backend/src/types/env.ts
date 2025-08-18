export interface Env {
  // Database
  DB: D1Database;
  
  // Storage
  R2: R2Bucket;
  
  // KV Namespaces
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  
  // Hyperdrive for PostgreSQL connection
  HYPERDRIVE?: Hyperdrive;
  
  // Analytics (optional)
  ANALYTICS?: AnalyticsEngineDataset;
  
  // Durable Objects (optional)
  QUERY_SESSION?: DurableObjectNamespace;
  
  // Queues (optional)
  CACHE_QUEUE?: Queue;
  
  // Secrets
  OPENAI_API_KEY: string;
  PERPLEXITY_API_KEY?: string;
  FIREFLIES_API_KEY?: string;
  
  // Worker URLs
  AI_AGENT_URL?: string;
  FIREFLIES_INGEST_URL?: string;
  
  // Environment
  ENVIRONMENT: 'development' | 'staging' | 'production';
}