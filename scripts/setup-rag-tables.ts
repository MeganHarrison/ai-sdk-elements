import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

async function setupTables() {
  console.log('📦 Setting up RAG tables...\n');
  
  // Test if tables exist by trying to query them
  const tables = ['chunks', 'embeddings', 'resources'];
  const tableStatus: Record<string, boolean> = {};
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1);
    
    tableStatus[table] = !error || error.code !== '42P01';
    console.log(`${tableStatus[table] ? '✅' : '❌'} Table '${table}': ${tableStatus[table] ? 'exists' : 'not found'}`);
  }
  
  const allTablesExist = Object.values(tableStatus).every(status => status);
  
  if (!allTablesExist) {
    console.log('\n⚠️  Some tables are missing!');
    console.log('\n📝 Instructions to create tables:');
    console.log('=====================================');
    console.log('1. Copy the SQL from: supabase/migrations/create_rag_tables.sql');
    console.log('2. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and run the SQL');
    console.log('\nOr run this SQL directly:\n');
    
    // Output simplified SQL for manual execution
    console.log(`
-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create chunks table
CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL,
  project_id TEXT,
  content TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create embeddings table
CREATE TABLE public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES public.chunks(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chunks_meeting_id ON public.chunks(meeting_id);
CREATE INDEX idx_chunks_project_id ON public.chunks(project_id);
    `);
    
    return false;
  }
  
  console.log('\n🎉 All tables exist and are ready!');
  return true;
}

async function testVectorization() {
  console.log('\n🧪 Testing vectorization setup...\n');
  
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY not set in .env file');
      console.log('   Add: OPENAI_API_KEY=your-key-here');
      return false;
    }
    console.log('✅ OpenAI API key configured');
    
    // Check meeting count
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Found ${meetingCount || 0} meetings ready for vectorization`);
    
    // Check if any chunks already exist
    const { count: chunkCount } = await supabase
      .from('chunks')
      .select('*', { count: 'exact', head: true });
    
    if (chunkCount && chunkCount > 0) {
      console.log(`✅ Found ${chunkCount} existing chunks`);
      
      // Check embeddings
      const { count: embeddingCount } = await supabase
        .from('embeddings')
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ Found ${embeddingCount || 0} existing embeddings`);
    } else {
      console.log('📝 No chunks created yet - ready to start vectorization');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('🚀 RAG Pipeline Setup Script');
  console.log('='.repeat(50));
  
  const tablesReady = await setupTables();
  
  if (tablesReady) {
    await testVectorization();
    
    console.log('\n' + '='.repeat(50));
    console.log('📚 Next Steps:');
    console.log('='.repeat(50));
    console.log('\n1. If tables are created, run vectorization:');
    console.log('   npx tsx scripts/vectorize-meetings.ts');
    console.log('\n2. To test semantic search after vectorization:');
    console.log('   Use the /chat endpoint with your queries');
    console.log('\n3. To view vectorized data:');
    console.log('   Check Supabase Dashboard > Table Editor > chunks/embeddings');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });