import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://lgveqfnpkxvzbnnwuled.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndmVxZm5wa3h2emJubnd1bGVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1NDE2NiwiZXhwIjoyMDcwODMwMTY2fQ.kIFo_ZSwO1uwpttYXxjSnYbBpUhwZhkW-ZGaiQLhKmA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateSampleInsights() {
  console.log('Checking for existing insights...');
  
  // Check if there are any insights
  const { data: existingInsights, error: checkError } = await supabase
    .from('ai_insights')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error('Error checking insights:', checkError);
    return;
  }
  
  if (existingInsights && existingInsights.length > 0) {
    console.log(`Found ${existingInsights.length} existing insights.`);
    
    // Get all insights to display
    const { data: allInsights, count } = await supabase
      .from('ai_insights')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log(`Total insights in database: ${count}`);
    console.log('Sample insights:', allInsights);
    return;
  }
  
  console.log('No insights found. Creating sample insights...');
  
  // Get a sample meeting and project
  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title')
    .limit(1);
  
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .limit(1);
  
  const meetingId = meetings?.[0]?.id || null;
  const projectId = projects?.[0]?.id || null;
  
  console.log('Using meeting:', meetings?.[0]);
  console.log('Using project:', projects?.[0]);
  
  // Create sample insights
  const sampleInsights = [
    {
      title: 'Critical Budget Overrun Risk',
      description: 'Project expenses are tracking 25% over budget due to unexpected material costs and additional labor requirements. Immediate cost control measures needed.',
      insight_type: 'risk',
      severity: 'high',
      confidence_score: 0.85,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    },
    {
      title: 'Client Satisfaction Milestone',
      description: 'Client expressed strong satisfaction with Phase 1 deliverables. Positive feedback on quality and timeline adherence presents opportunity for contract expansion.',
      insight_type: 'positive_feedback',
      severity: 'low',
      confidence_score: 0.92,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    },
    {
      title: 'Permit Approval Required',
      description: 'Building permit application needs submission by end of week to maintain schedule. John Smith assigned as owner with Friday deadline.',
      insight_type: 'action_item',
      severity: 'medium',
      confidence_score: 0.95,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    },
    {
      title: 'Technology Stack Decision',
      description: 'Team decided to proceed with React Native for mobile development based on team expertise and client requirements for cross-platform support.',
      insight_type: 'decision',
      severity: 'medium',
      confidence_score: 0.88,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    },
    {
      title: 'API Performance Bottleneck',
      description: 'Database queries taking 3+ seconds on production. Need to implement caching layer and optimize SQL queries to meet performance SLA.',
      insight_type: 'technical',
      severity: 'high',
      confidence_score: 0.78,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    },
    {
      title: 'Market Expansion Opportunity',
      description: 'Competitor analysis reveals gap in Southeast region. Strategic positioning could capture 15% market share within 6 months.',
      insight_type: 'strategic',
      severity: 'medium',
      confidence_score: 0.72,
      meeting_id: meetingId,
      project_id: projectId,
      resolved: 0
    }
  ];
  
  // Insert sample insights
  const { data: insertedInsights, error: insertError } = await supabase
    .from('ai_insights')
    .insert(sampleInsights)
    .select();
  
  if (insertError) {
    console.error('Error inserting insights:', insertError);
  } else {
    console.log(`Successfully created ${insertedInsights.length} sample insights!`);
    console.log('Insights:', insertedInsights);
  }
}

// Run the script
populateSampleInsights()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });