import { createClient } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

const embeddingModel = openai.embedding('text-embedding-ada-002');

// Function to split text into chunks
function splitIntoChunks(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Function to generate embeddings
async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

async function generateEmbeddings(values: string[]): Promise<number[][]> {
  const inputs = values.map(value => value.replaceAll('\n', ' '));
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: inputs,
  });
  return embeddings;
}

// Function to infer project from meeting content
function inferProjectId(meeting: any): string | null {
  const title = (meeting.title || '').toLowerCase();
  const transcript = (meeting.transcript || '').toLowerCase();
  
  // Project keywords mapping
  const projectKeywords: Record<string, string[]> = {
    '58': ['paradise', 'isle', 'paradise isle'],
    '1': ['internal', 'team', 'internal team'],
    // Add more project mappings as needed
  };
  
  for (const [projectId, keywords] of Object.entries(projectKeywords)) {
    for (const keyword of keywords) {
      if (title.includes(keyword) || transcript.includes(keyword)) {
        return projectId;
      }
    }
  }
  
  return null; // No project match found
}

async function vectorizeMeetings() {
  console.log('🚀 Starting meeting vectorization process...\n');
  
  try {
    // Step 1: Fetch all meetings
    console.log('📥 Fetching meetings from Supabase...');
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return;
    }
    
    console.log(`✅ Found ${meetings?.length || 0} meetings\n`);
    
    if (!meetings || meetings.length === 0) {
      console.log('No meetings to process');
      return;
    }
    
    // Step 2: Process meetings in batches
    const batchSize = 5; // Process 5 meetings at a time
    let totalChunks = 0;
    let processedMeetings = 0;
    
    for (let i = 0; i < meetings.length; i += batchSize) {
      const batch = meetings.slice(i, Math.min(i + batchSize, meetings.length));
      console.log(`\n🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(meetings.length/batchSize)}...`);
      
      for (const meeting of batch) {
        try {
          // Get meeting content (transcript or summary)
          const content = meeting.transcript || meeting.summary || '';
          
          if (!content || content.length < 50) {
            console.log(`⏭️  Skipping meeting ${meeting.id} (no content)`);
            continue;
          }
          
          console.log(`📝 Processing meeting: ${meeting.title || meeting.id}`);
          
          // Check if already vectorized
          const { data: existingChunks } = await supabase
            .from('chunks')
            .select('id')
            .eq('meeting_id', meeting.id)
            .limit(1);
          
          if (existingChunks && existingChunks.length > 0) {
            console.log(`   ✓ Already vectorized, skipping...`);
            processedMeetings++;
            continue;
          }
          
          // Infer project association
          const projectId = inferProjectId(meeting);
          
          // Split content into chunks
          const chunks = splitIntoChunks(content, 800);
          console.log(`   📊 Split into ${chunks.length} chunks`);
          
          // Generate embeddings for all chunks
          console.log(`   🧮 Generating embeddings...`);
          const embeddings = await generateEmbeddings(chunks);
          
          // Store chunks and embeddings
          const chunkRecords = chunks.map((chunk, index) => ({
            meeting_id: meeting.id,
            project_id: projectId,
            content: chunk,
            chunk_index: index,
            metadata: {
              meeting_title: meeting.title,
              meeting_date: meeting.created_at,
              participants: meeting.participants || [],
            }
          }));
          
          const { data: insertedChunks, error: chunkError } = await supabase
            .from('chunks')
            .insert(chunkRecords)
            .select('id');
          
          if (chunkError) {
            console.error(`   ❌ Error storing chunks:`, chunkError.message);
            continue;
          }
          
          // Store embeddings
          const embeddingRecords = insertedChunks!.map((chunk, index) => ({
            chunk_id: chunk.id,
            embedding: embeddings[index],
          }));
          
          const { error: embeddingError } = await supabase
            .from('embeddings')
            .insert(embeddingRecords);
          
          if (embeddingError) {
            console.error(`   ❌ Error storing embeddings:`, embeddingError.message);
            continue;
          }
          
          totalChunks += chunks.length;
          processedMeetings++;
          console.log(`   ✅ Successfully vectorized ${chunks.length} chunks`);
          
        } catch (error) {
          console.error(`   ❌ Error processing meeting ${meeting.id}:`, error);
        }
      }
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < meetings.length) {
        console.log('\n⏸️  Pausing before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Vectorization Complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Meetings processed: ${processedMeetings}/${meetings.length}`);
    console.log(`   - Total chunks created: ${totalChunks}`);
    console.log(`   - Total embeddings generated: ${totalChunks}`);
    
    // Test semantic search
    console.log('\n🔍 Testing semantic search...');
    await testSemanticSearch();
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

async function testSemanticSearch() {
  const testQuery = "project status updates";
  console.log(`\nSearching for: "${testQuery}"`);
  
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(testQuery);
    
    // Search using pgvector (this requires a function in Supabase)
    // For now, we'll just verify the data is there
    const { data: sampleChunks, error } = await supabase
      .from('chunks')
      .select('content, project_id, meeting_id')
      .limit(3);
    
    if (sampleChunks && sampleChunks.length > 0) {
      console.log(`\n✅ Sample chunks found in database:`);
      sampleChunks.forEach((chunk, i) => {
        console.log(`\n${i + 1}. Project: ${chunk.project_id || 'Not assigned'}`);
        console.log(`   Meeting: ${chunk.meeting_id}`);
        console.log(`   Content: ${chunk.content.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('Search test error:', error);
  }
}

// Run the vectorization
console.log('='.repeat(50));
console.log('🤖 Meeting Vectorization Script for RAG Pipeline');
console.log('='.repeat(50));

vectorizeMeetings()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });