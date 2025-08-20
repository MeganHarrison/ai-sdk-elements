import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

const sampleMeetings = [
  {
    title: 'RAG Pipeline Planning Meeting',
    summary: 'Discussion on implementing the RAG pipeline with Fireflies and Supabase integration',
    date: new Date('2024-03-15T10:00:00Z').toISOString(),
    participants: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
    tags: ['rag', 'pipeline', 'technical'],
    category: 'technical',
    project_id: 1,
    transcript_url: 'https://example.com/transcript-1',
    transcript_id: 'fireflies-meeting-1',
  },
  {
    title: 'Customer Portal Redesign Kickoff',
    summary: 'Initial meeting for customer portal redesign project with focus on UX improvements',
    date: new Date('2024-03-14T14:30:00Z').toISOString(),
    participants: ['Alice Brown', 'Bob Wilson', 'Carol Martinez', 'Client Rep'],
    tags: ['design', 'portal', 'kickoff'],
    category: 'planning',
    project_id: 2,
    transcript_url: 'https://example.com/transcript-2',
    transcript_id: 'fireflies-meeting-2',
  },
  {
    title: 'Weekly Project Status Update',
    summary: 'Weekly sync covering all active projects and identifying risks',
    date: new Date('2024-03-13T09:00:00Z').toISOString(),
    participants: ['Project Manager', 'Tech Lead', 'Product Owner'],
    tags: ['status', 'weekly', 'update'],
    category: 'status',
    project_id: 1,
    transcript_url: 'https://example.com/transcript-3',
    transcript_id: 'fireflies-meeting-3',
  }
];

const sampleProjects = [
  {
    id: 1,
    name: 'RAG Pipeline Implementation',
    description: 'Implement complete RAG pipeline with Supabase and Fireflies integration for intelligent meeting insights',
    "job number": 'JOB-2024-001',
    "start date": '2024-01-15',
    "est completion": '2024-06-30',
    "est revenue": 150000,
    "est profit": 45000,
    address: '123 Tech Park Dr, San Francisco, CA 94105',
    phase: 'Development',
    state: 'California',
  },
  {
    id: 2,
    name: 'Customer Portal Redesign',
    description: 'Complete redesign of customer portal with improved UX and mobile responsiveness',
    "job number": 'JOB-2024-002',
    "start date": '2024-02-01',
    "est completion": '2024-05-15',
    "est revenue": 75000,
    "est profit": 22500,
    address: '456 Business Ave, Los Angeles, CA 90028',
    phase: 'Design',
    state: 'California',
  },
  {
    id: 3,
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    "job number": 'JOB-2024-003',
    "start date": '2024-04-01',
    "est completion": '2024-09-30',
    "est revenue": 200000,
    "est profit": 60000,
    address: '789 Innovation Blvd, Austin, TX 78701',
    phase: 'Planning',
    state: 'Texas',
  }
];

// Sample meeting chunks that simulate vectorized content
const sampleChunks = [
  {
    meeting_id: null, // Will be set after meetings are created
    chunk_index: 0,
    content: 'Today we discussed the implementation of the RAG pipeline for our AI project management system. The main focus was on integrating Fireflies transcripts with Supabase and creating a vectorization system.',
    metadata: { 
      project_id: 1,
      speakers: ['John Smith'],
      topic: 'RAG Pipeline Overview'
    },
    speaker_info: { name: 'John Smith', role: 'Tech Lead' },
    start_timestamp: 0,
    end_timestamp: 30,
  },
  {
    meeting_id: null,
    chunk_index: 1,
    content: 'Key decisions made: We will use OpenAI text-embedding-ada-002 model for generating embeddings. Chunks will be limited to 800 characters for optimal retrieval. Each chunk will be linked to its source meeting and project.',
    metadata: { 
      project_id: 1,
      speakers: ['Sarah Johnson'],
      topic: 'Technical Decisions'
    },
    speaker_info: { name: 'Sarah Johnson', role: 'Product Manager' },
    start_timestamp: 30,
    end_timestamp: 60,
  },
  {
    meeting_id: null,
    chunk_index: 2,
    content: 'Action items: Set up the pgvector extension in Supabase. Create the chunks and embeddings tables. Implement the vectorization script. Test semantic search functionality.',
    metadata: { 
      project_id: 1,
      speakers: ['Mike Chen'],
      topic: 'Action Items'
    },
    speaker_info: { name: 'Mike Chen', role: 'Developer' },
    start_timestamp: 60,
    end_timestamp: 90,
  },
];

async function createSampleData() {
  console.log('🎯 Creating sample data for testing RAG pipeline...\n');
  
  try {
    // Create projects
    console.log('📁 Creating sample projects...');
    for (const project of sampleProjects) {
      const { error } = await supabase
        .from('projects')
        .upsert(project, { onConflict: 'id' });
      
      if (error) {
        console.log(`   ⚠️  Project ${project.id}: ${error.message}`);
      } else {
        console.log(`   ✅ Created project: ${project.name}`);
      }
    }
    
    // Create meetings and store their IDs
    console.log('\n📝 Creating sample meetings...');
    const meetingIds: string[] = [];
    
    for (const meeting of sampleMeetings) {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meeting)
        .select('id')
        .single();
      
      if (error) {
        console.log(`   ⚠️  Meeting: ${error.message}`);
      } else {
        console.log(`   ✅ Created meeting: ${meeting.title}`);
        if (data?.id) {
          meetingIds.push(data.id);
        }
      }
    }
    
    // Create meeting chunks
    if (meetingIds.length > 0) {
      console.log('\n🔤 Creating sample meeting chunks...');
      
      // Assign meeting IDs to chunks
      const chunksToInsert = sampleChunks.map((chunk, index) => ({
        ...chunk,
        meeting_id: meetingIds[0], // Assign all sample chunks to first meeting for demo
      }));
      
      for (const chunk of chunksToInsert) {
        const { error } = await supabase
          .from('meeting_chunks')
          .insert(chunk);
        
        if (error) {
          console.log(`   ⚠️  Chunk ${chunk.chunk_index}: ${error.message}`);
        } else {
          console.log(`   ✅ Created chunk ${chunk.chunk_index}: "${chunk.content.substring(0, 50)}..."`);
        }
      }
    }
    
    // Verify data
    console.log('\n📊 Verifying created data...');
    
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true });
    
    const { count: chunkCount } = await supabase
      .from('meeting_chunks')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Summary:`);
    console.log(`   - Projects: ${projectCount || 0} total`);
    console.log(`   - Meetings: ${meetingCount || 0} total`);
    console.log(`   - Meeting Chunks: ${chunkCount || 0} total`);
    
    if ((chunkCount || 0) > 0) {
      console.log('\n🚀 RAG Pipeline is ready!');
      console.log('   The existing vectorized chunks can now be searched');
      console.log('   Navigate to a project detail page to test the AI Chat feature');
    }
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData()
  .then(() => {
    console.log('\n✨ Sample data creation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });