import { createClient } from '@/lib/supabase/client';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const embeddingModel = openai.embedding('text-embedding-ada-002');

export interface SearchResult {
  chunk_id: string;
  meeting_id: string;
  content: string;
  chunk_index: number;
  metadata: any;
  similarity?: number;
}

/**
 * Generate embedding for a search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query.replaceAll('\n', ' '),
  });
  return embedding;
}

/**
 * Search for relevant chunks using the existing meeting_chunks table
 */
export async function searchMeetingChunks(
  query: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const supabase = createClient();
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Since the stored embeddings might be in a different format,
    // we'll first try to use Supabase's similarity search if available
    // Otherwise, we'll fall back to content-based search
    
    // Since we don't have embeddings yet, use text search
    console.log('Using text search for chunks...');
    const { data: textResults } = await supabase
      .from('meeting_chunks')
      .select('*')
      .textSearch('content', query)
      .limit(limit);
    
    if (textResults) {
      return textResults.map(chunk => ({
        chunk_id: chunk.id,
        meeting_id: chunk.meeting_id,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        metadata: chunk.metadata,
      }));
    }
    
    // Final fallback: Get chunks with relevant keywords
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    let queryBuilder = supabase
      .from('meeting_chunks')
      .select('*');
    
    // Add filters for each keyword
    for (const keyword of keywords.slice(0, 3)) { // Limit to 3 keywords
      queryBuilder = queryBuilder.ilike('content', `%${keyword}%`);
    }
    
    const { data: keywordResults } = await queryBuilder.limit(limit);
    
    return keywordResults?.map(chunk => ({
      chunk_id: chunk.id,
      meeting_id: chunk.meeting_id,
      content: chunk.content,
      chunk_index: chunk.chunk_index,
      metadata: chunk.metadata,
    })) || [];
    
  } catch (error) {
    console.error('Error searching chunks:', error);
    return [];
  }
}

/**
 * Get meeting context by retrieving surrounding chunks
 */
export async function getMeetingContext(
  meetingId: string,
  chunkIndex: number,
  contextSize: number = 2
): Promise<SearchResult[]> {
  const supabase = createClient();
  
  const { data: chunks } = await supabase
    .from('meeting_chunks')
    .select('*')
    .eq('meeting_id', meetingId)
    .gte('chunk_index', Math.max(0, chunkIndex - contextSize))
    .lte('chunk_index', chunkIndex + contextSize)
    .order('chunk_index', { ascending: true });
  
  return chunks?.map(chunk => ({
    chunk_id: chunk.id,
    meeting_id: chunk.meeting_id,
    content: chunk.content,
    chunk_index: chunk.chunk_index,
    metadata: chunk.metadata,
  })) || [];
}

/**
 * Get all chunks for a specific meeting
 */
export async function getMeetingChunks(meetingId: string): Promise<SearchResult[]> {
  const supabase = createClient();
  
  const { data: chunks } = await supabase
    .from('meeting_chunks')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('chunk_index', { ascending: true });
  
  return chunks?.map(chunk => ({
    chunk_id: chunk.id,
    meeting_id: chunk.meeting_id,
    content: chunk.content,
    chunk_index: chunk.chunk_index,
    metadata: chunk.metadata,
  })) || [];
}

/**
 * Search chunks related to a specific project
 * (Requires project_id in metadata or a separate project_chunks table)
 */
export async function searchProjectChunks(
  projectId: string,
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const supabase = createClient();
  
  // First, try to find chunks with project_id in metadata
  const { data: projectChunks } = await supabase
    .from('meeting_chunks')
    .select('*')
    .contains('metadata', { project_id: projectId })
    .textSearch('content', query)
    .limit(limit);
  
  if (projectChunks && projectChunks.length > 0) {
    return projectChunks.map(chunk => ({
      chunk_id: chunk.id,
      meeting_id: chunk.meeting_id,
      content: chunk.content,
      chunk_index: chunk.chunk_index,
      metadata: chunk.metadata,
    }));
  }
  
  // Fallback to general search
  return searchMeetingChunks(query, limit);
}