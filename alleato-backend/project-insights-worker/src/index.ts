import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Environment variables (configure in Cloudflare dashboard)
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  OPENAI_API_KEY: string;
}

// Types for our insights
interface ProjectInsight {
  title: string;
  description: string;
  insight_type: 'risk' | 'opportunity' | 'decision' | 'action_item' | 'technical' | 'strategic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
}

interface ProjectContext {
  project_id: number | null;
  project_name: string | null;
  confidence: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Add test endpoint
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Worker is running',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process insights endpoint with limit parameter
    if (url.pathname === '/process') {
      const limit = parseInt(url.searchParams.get('limit') || '2');
      
      try {
        // Get recent meetings that haven't been fully processed for insights
        const { data: recentMeetings, error: meetingsError } = await supabase
          .from('meetings')
          .select(`
            id,
            title,
            date,
            project_id,
            participants,
            summary,
            raw_metadata,
            duration_minutes,
            category
          `)
          .order('date', { ascending: false })
          .limit(limit);

      if (meetingsError) throw meetingsError;

      const processedInsights: Array<{
        meeting_id: string;
        project_id: number | null;
        insights: ProjectInsight[];
      }> = [];

      // Process each meeting
      for (const meeting of recentMeetings || []) {
        // Check if we already have recent insights for this meeting
        const { data: existingInsights } = await supabase
          .from('ai_insights')
          .select('id')
          .eq('meeting_id', meeting.id)
          .limit(1);

        // Skip if already processed (unless forced)
        if (existingInsights && existingInsights.length > 0) {
          continue;
        }

        // Get ALL chunks for this meeting to build complete context
        const { data: chunks, error: chunksError } = await supabase
          .from('meeting_chunks')
          .select('content, chunk_type, speaker_info, start_timestamp, end_timestamp')
          .eq('meeting_id', meeting.id)
          .order('chunk_index', { ascending: true });

        if (chunksError) {
          console.error(`Error fetching chunks for meeting ${meeting.id}:`, chunksError);
          continue;
        }

        if (!chunks || chunks.length === 0) {
          console.log(`No chunks found for meeting ${meeting.id}`);
          continue;
        }

        // Combine all chunks to get full meeting transcript
        const fullTranscript = chunks.map(chunk => {
          const speaker = chunk.speaker_info ? 
            (typeof chunk.speaker_info === 'object' && 'name' in chunk.speaker_info ? 
              chunk.speaker_info.name : 'Speaker') : 'Speaker';
          return `${speaker}: ${chunk.content}`;
        }).join('\n');

        // Determine project context from full meeting content
        const projectContext = await determineProjectContext(
          meeting,
          fullTranscript,
          supabase
        );

        // Generate insights from complete meeting
        const meetingInsights = await generateMeetingInsights(
          fullTranscript,
          meeting,
          projectContext,
          env.OPENAI_API_KEY
        );

        // Store insights in database
        for (const insight of meetingInsights) {
          const { error: insertError } = await supabase
            .from('ai_insights')
            .insert({
              title: insight.title,
              description: insight.description,
              insight_type: insight.insight_type,
              severity: insight.severity,
              confidence_score: insight.confidence_score,
              meeting_id: meeting.id,
              project_id: projectContext.project_id,
              source_meetings: meeting.id, // Single meeting as source
              resolved: 0
            });

          if (insertError) {
            console.error('Error inserting insight:', insertError);
          }
        }

        processedInsights.push({
          meeting_id: meeting.id,
          project_id: projectContext.project_id,
          insights: meetingInsights
        });
      }

      // After processing individual meetings, look for cross-meeting patterns
      if (processedInsights.length > 0) {
        await generateCrossReferenceInsights(supabase, env.OPENAI_API_KEY);
      }

        return new Response(JSON.stringify({
          success: true,
          processed_meetings: processedInsights.length,
          total_insights: processedInsights.reduce((acc, m) => acc + m.insights.length, 0),
          details: processedInsights
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Worker error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Default response for unknown paths
    return new Response(JSON.stringify({
      success: false,
      error: 'Not found',
      availableEndpoints: ['/test', '/process?limit=2']
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Run every hour to process new meetings
    ctx.waitUntil(this.fetch(new Request('https://worker.local'), env));
  }
};

async function determineProjectContext(
  meeting: any,
  fullTranscript: string,
  supabase: any
): Promise<ProjectContext> {
  // If meeting already has a project_id, use it with high confidence
  if (meeting.project_id) {
    return {
      project_id: meeting.project_id,
      project_name: null,
      confidence: 0.95
    };
  }

  // Extract potential project indicators
  const indicators: Set<string> = new Set();
  
  // Add meeting title
  if (meeting.title) {
    indicators.add(meeting.title.toLowerCase());
  }
  
  // Extract from participants (company names from email domains)
  if (meeting.participants && Array.isArray(meeting.participants)) {
    meeting.participants.forEach((email: string) => {
      indicators.add(email.toLowerCase());
      // Extract domain/company from email
      const domain = email.split('@')[1]?.split('.')[0];
      if (domain) {
        indicators.add(domain.toLowerCase());
      }
    });
  }
  
  // Look for project indicators in transcript
  const projectPatterns = [
    /project\s+["']?([^"'\n]+?)["']?\s/gi,
    /job\s+(?:number|#)\s*:?\s*([A-Z0-9\-]+)/gi,
    /client\s+["']?([^"'\n]+?)["']?\s/gi,
    /working\s+on\s+["']?([^"'\n]+?)["']?\s/gi,
    /regarding\s+["']?([^"'\n]+?)["']?\s+project/gi,
    /(\d{3,6})\s+(?:project|job)/gi, // Job numbers
  ];
  
  const transcriptSample = fullTranscript.substring(0, 5000); // First part of transcript
  projectPatterns.forEach(pattern => {
    const matches = transcriptSample.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        indicators.add(match[1].toLowerCase().trim());
      }
    }
  });

  // Query projects and clients for matching
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, 
      name, 
      job number,
      address,
      client_id,
      clients (
        name,
        company_id
      )
    `)
    .limit(100);

  let bestMatch: { project_id: number | null; confidence: number; matched_on: string } = {
    project_id: null,
    confidence: 0,
    matched_on: ''
  };

  if (projects) {
    for (const project of projects) {
      let matchScore = 0;
      let matchedOn = [];
      
      // Check project name
      if (project.name) {
        const projectName = project.name.toLowerCase();
        for (const indicator of indicators) {
          if (indicator.includes(projectName) || projectName.includes(indicator)) {
            matchScore += 0.4;
            matchedOn.push(`name: ${project.name}`);
            break;
          }
        }
      }
      
      // Check job number (highest confidence)
      if (project['job number']) {
        const jobNum = project['job number'].toLowerCase();
        for (const indicator of indicators) {
          if (indicator === jobNum || indicator.includes(jobNum)) {
            matchScore += 0.6;
            matchedOn.push(`job#: ${project['job number']}`);
            break;
          }
        }
      }
      
      // Check address
      if (project.address) {
        const addressParts = project.address.toLowerCase().split(/[\s,]+/);
        for (const part of addressParts) {
          if (part.length > 3) { // Skip short words
            for (const indicator of indicators) {
              if (indicator.includes(part)) {
                matchScore += 0.2;
                matchedOn.push(`address: ${part}`);
                break;
              }
            }
          }
        }
      }
      
      // Check client name
      if (project.clients && project.clients.name) {
        const clientName = project.clients.name.toLowerCase();
        for (const indicator of indicators) {
          if (indicator.includes(clientName) || clientName.includes(indicator)) {
            matchScore += 0.3;
            matchedOn.push(`client: ${project.clients.name}`);
            break;
          }
        }
      }
      
      if (matchScore > bestMatch.confidence) {
        bestMatch = {
          project_id: project.id,
          confidence: Math.min(matchScore, 1),
          matched_on: matchedOn.join(', ')
        };
      }
    }
  }

  console.log(`Project match for meeting: ${meeting.title || meeting.id}`, bestMatch);

  return {
    project_id: bestMatch.confidence > 0.3 ? bestMatch.project_id : null,
    project_name: null,
    confidence: bestMatch.confidence
  };
}

async function generateMeetingInsights(
  fullTranscript: string,
  meeting: any,
  projectContext: ProjectContext,
  openaiKey: string
): Promise<ProjectInsight[]> {
  // Prepare meeting context
  const meetingContext = {
    title: meeting.title || 'Untitled Meeting',
    date: meeting.date,
    duration: meeting.duration_minutes ? `${meeting.duration_minutes} minutes` : 'Unknown',
    participants: meeting.participants?.join(', ') || 'Unknown',
    category: meeting.category || 'General',
    hasProject: projectContext.project_id !== null,
    projectConfidence: projectContext.confidence
  };

  // Truncate transcript if too long for API
  const maxLength = 12000;
  const transcriptForAnalysis = fullTranscript.length > maxLength ? 
    fullTranscript.substring(0, maxLength) + '\n...[transcript truncated]' : 
    fullTranscript;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert project analyst extracting actionable insights from meeting transcripts.
            
            Focus on identifying:
            1. RISKS: Issues that could delay, block, or increase costs
            2. OPPORTUNITIES: Chances for improvement, optimization, or growth
            3. DECISIONS: Important choices that were made or need to be made
            4. ACTION_ITEMS: Specific tasks that need to be completed with clear owners
            5. TECHNICAL: Architecture decisions, technical debt, implementation challenges
            6. STRATEGIC: Business pivots, market changes, competitive positioning
            
            Each insight should be:
            - Specific and actionable
            - Include context about WHY it matters
            - Reference specific quotes or discussions when relevant
            - Assign appropriate severity based on potential impact
            
            Return as JSON object with structure:
            {
              "insights": [
                {
                  "title": "Brief, clear title (max 100 chars)",
                  "description": "Detailed description with context, implications, and recommendations (200-500 chars)",
                  "insight_type": "risk|opportunity|decision|action_item|technical|strategic",
                  "severity": "low|medium|high|critical",
                  "confidence_score": 0.0-1.0
                }
              ]
            }
            
            Severity guidelines:
            - critical: Immediate action needed, major impact on project success
            - high: Significant impact, needs attention soon
            - medium: Important but not urgent, standard priority
            - low: Minor issue or nice-to-have improvement`
          },
          {
            role: 'user',
            content: `Analyze this meeting and extract key project insights:

Meeting Context:
- Title: ${meetingContext.title}
- Date: ${meetingContext.date}
- Duration: ${meetingContext.duration}
- Participants: ${meetingContext.participants}
- Category: ${meetingContext.category}

Meeting Transcript:
${transcriptForAnalysis}

Extract 3-8 key insights from this meeting. Focus on the most important and actionable items.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return [];
    }

    const result = await response.json();
    const parsedResponse = JSON.parse(result.choices[0].message.content);
    
    // Validate and return insights
    const insights = parsedResponse.insights || [];
    return insights.filter((insight: any) => 
      insight.title && 
      insight.description && 
      insight.insight_type && 
      insight.severity
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

async function generateCrossReferenceInsights(
  supabase: any,
  openaiKey: string
): Promise<void> {
  // Get insights from the last 7 days grouped by project
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentInsights, error } = await supabase
    .from('ai_insights')
    .select(`
      *,
      meetings (
        title,
        date
      )
    `)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error || !recentInsights || recentInsights.length < 5) return;

  // Group insights by project
  const projectInsights = new Map<number, any[]>();
  recentInsights.forEach(insight => {
    if (insight.project_id) {
      if (!projectInsights.has(insight.project_id)) {
        projectInsights.set(insight.project_id, []);
      }
      projectInsights.get(insight.project_id)!.push(insight);
    }
  });

  // Analyze patterns per project
  for (const [projectId, insights] of projectInsights) {
    if (insights.length < 3) continue; // Need multiple insights for pattern detection

    // Check if we already have a recent pattern insight for this project
    const { data: existingPattern } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('project_id', projectId)
      .like('title', '[PATTERN]%')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(1);

    if (existingPattern && existingPattern.length > 0) continue;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `Analyze multiple project insights to identify meta-patterns and trends.
              
              Look for:
              1. Recurring themes or problems appearing across meetings
              2. Escalating issues that are getting worse over time
              3. Interconnected problems that share root causes
              4. Strategic patterns indicating project trajectory
              
              Only return an insight if there's a significant pattern worth highlighting.
              The pattern should be actionable and more valuable than individual insights.
              
              Return JSON: {
                "has_pattern": true/false,
                "title": "Pattern title",
                "description": "Detailed pattern description with evidence and recommendations",
                "severity": "medium|high|critical"
              }`
            },
            {
              role: 'user',
              content: `Analyze these ${insights.length} insights from project ${projectId}:

${insights.map(i => 
  `[${i.severity}] ${i.title} (${i.meetings?.date || 'Unknown date'})
   ${i.description}`
).join('\n\n')}

Identify significant patterns or trends across these insights.`
            }
          ],
          temperature: 0.4,
          max_tokens: 800,
          response_format: { type: "json_object" }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const pattern = JSON.parse(result.choices[0].message.content);
        
        if (pattern.has_pattern) {
          // Collect unique meeting IDs
          const meetingIds = [...new Set(insights
            .map(i => i.meeting_id)
            .filter(Boolean))];

          await supabase
            .from('ai_insights')
            .insert({
              title: `[PATTERN] ${pattern.title}`,
              description: pattern.description,
              insight_type: 'strategic',
              severity: pattern.severity || 'high',
              confidence_score: 0.85,
              project_id: projectId,
              source_meetings: meetingIds.join(','),
              resolved: 0
            });

          console.log(`Created pattern insight for project ${projectId}`);
        }
      }
    } catch (error) {
      console.error(`Error generating pattern for project ${projectId}:`, error);
    }
  }
}