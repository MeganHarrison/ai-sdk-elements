-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create chunks table for storing meeting segments
CREATE TABLE IF NOT EXISTS public.chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL,
  project_id TEXT,
  content TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create embeddings table for vector storage
CREATE TABLE IF NOT EXISTS public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES public.chunks(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chunks_meeting_id ON public.chunks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_chunks_project_id ON public.chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON public.embeddings(chunk_id);

-- Create HNSW index for similarity search (pgvector)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON public.embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create resources table (optional, for non-meeting documents)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  url TEXT,
  type TEXT DEFAULT 'document',
  project_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function for semantic search
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  content TEXT,
  project_id TEXT,
  meeting_id TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as chunk_id,
    c.content,
    c.project_id,
    c.meeting_id,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM embeddings e
  JOIN chunks c ON e.chunk_id = c.id
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add RLS policies if needed
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
CREATE POLICY "Service role can manage chunks" ON public.chunks
  FOR ALL USING (true);

CREATE POLICY "Service role can manage embeddings" ON public.embeddings
  FOR ALL USING (true);

CREATE POLICY "Service role can manage resources" ON public.resources
  FOR ALL USING (true);

-- Add comment
COMMENT ON TABLE public.chunks IS 'Stores text chunks from meetings for RAG pipeline';
COMMENT ON TABLE public.embeddings IS 'Stores vector embeddings for semantic search';
COMMENT ON TABLE public.resources IS 'Stores additional documents and resources';
COMMENT ON FUNCTION search_similar_chunks IS 'Performs semantic similarity search on chunks';

-- Grant permissions
GRANT ALL ON public.chunks TO authenticated;
GRANT ALL ON public.embeddings TO authenticated;
GRANT ALL ON public.resources TO authenticated;
GRANT EXECUTE ON FUNCTION search_similar_chunks TO authenticated;