import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use DATABASE_URL or fall back to Supabase URL
const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'postgresql://postgres.').replace('.supabase.co', `.supabase.co:5432/postgres?password=${process.env.SUPABASE_SERVICE_ROLE_KEY}`);

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set');
}

// For query purposes
const queryClient = postgres(DATABASE_URL);
export const db = drizzle(queryClient, { schema });

// For migrations
const migrationClient = postgres(DATABASE_URL, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema });