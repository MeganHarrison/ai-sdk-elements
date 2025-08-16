export interface Env {
  // Database
  DB: D1Database;
  
  // Storage
  R2: R2Bucket;
  
  // KV Namespaces
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  
  // Secrets
  OPENAI_API_KEY: string;
  PERPLEXITY_API_KEY?: string;
  
  // Environment
  ENVIRONMENT: 'development' | 'staging' | 'production';
}