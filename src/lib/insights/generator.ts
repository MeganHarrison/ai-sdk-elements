import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import type { 
  MeetingInsight, 
  InsightCategory, 
  InsightPriority,
  InsightGenerationResult,
  ActionItem,
  Risk
} from './types';

// Schema for structured insight extraction
const insightSchema = z.object({
  insights: z.array(z.object({
    category: z.enum([
      'general_info',
      'positive_feedback',
      'risk_negative',
      'action_item',
      'decision',
      'milestone',
      'blocker',
      'resource_need',
      'timeline_update',
      'budget_update'
    ]),
    text: z.string(),
    confidence_score: z.number().min(0).max(1),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    extracted_from: z.string().optional(),
    related_participants: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })),
  summary: z.string(),
  key_decisions: z.array(z.string()),
  action_items: z.array(z.object({
    description: z.string(),
    owner: z.string().optional(),
    deadline: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional()
  })),
  risks: z.array(z.object({
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    likelihood: z.enum(['low', 'medium', 'high']),
    mitigation: z.string().optional()
  })),
  sentiment_score: z.number().min(-1).max(1)
});

export class InsightsGenerator {
  private openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!
  });
  private model = this.openai('gpt-4o-mini');

  async generateInsightsFromTranscript(
    transcript: string,
    meetingId: string,
    projectId: number,
    meetingTitle?: string,
    participants?: string[]
  ): Promise<InsightGenerationResult> {
    const systemPrompt = `You are an expert project manager and business analyst. 
    Analyze meeting transcripts to extract actionable insights, decisions, and risks.
    
    Focus on:
    1. Key decisions made
    2. Action items with clear owners and deadlines
    3. Project risks and blockers
    4. Positive progress and wins
    5. Resource needs and budget discussions
    6. Timeline updates
    7. Important general information
    
    For each insight:
    - Be specific and actionable
    - Include context when relevant
    - Assign appropriate priority levels
    - Extract participant names when they're assigned tasks
    - Identify tags for easier categorization
    
    Sentiment score should reflect overall meeting tone (-1 very negative to 1 very positive).`;

    const userPrompt = `Analyze this meeting transcript and extract insights:
    
    Meeting: ${meetingTitle || 'Untitled Meeting'}
    Participants: ${participants?.join(', ') || 'Unknown'}
    
    Transcript:
    ${transcript}
    
    Extract all valuable insights, categorizing them appropriately.`;

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: insightSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.3,
        max_tokens: 4000
      });

      // Add meeting and project IDs to each insight
      const enrichedInsights = object.insights.map(insight => ({
        ...insight,
        meeting_id: meetingId,
        project_id: projectId
      }));

      return {
        meeting_id: meetingId,
        project_id: projectId,
        insights: enrichedInsights,
        summary: object.summary,
        key_decisions: object.key_decisions,
        action_items: object.action_items,
        risks: object.risks,
        sentiment_score: object.sentiment_score
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  async generateInsightsFromChunks(
    chunks: string[],
    meetingId: string,
    projectId: number,
    meetingTitle?: string
  ): Promise<InsightGenerationResult> {
    // Combine chunks into a single transcript
    const transcript = chunks.join('\n\n');
    return this.generateInsightsFromTranscript(
      transcript,
      meetingId,
      projectId,
      meetingTitle
    );
  }

  async categorizeInsight(text: string): Promise<InsightCategory> {
    const prompt = `Categorize this insight into one of these categories:
    - general_info: General project information or updates
    - positive_feedback: Wins, progress, positive feedback
    - risk_negative: Risks, concerns, negative feedback
    - action_item: Tasks that need to be done
    - decision: Decisions that were made
    - milestone: Project milestones reached or planned
    - blocker: Things blocking progress
    - resource_need: Resource requirements
    - timeline_update: Schedule or deadline changes
    - budget_update: Budget or cost discussions
    
    Insight: "${text}"
    
    Return only the category name.`;

    const { text: category } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.1,
      maxTokens: 20
    });

    return category.trim().toLowerCase() as InsightCategory;
  }

  async prioritizeInsight(text: string, category: InsightCategory): Promise<InsightPriority> {
    const prompt = `Assess the priority of this ${category} insight:
    "${text}"
    
    Consider:
    - Impact on project success
    - Urgency of action required
    - Risk level
    - Stakeholder importance
    
    Return only one of: low, medium, high, critical`;

    const { text: priority } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.1,
      maxTokens: 10
    });

    const cleanPriority = priority.trim().toLowerCase();
    if (['low', 'medium', 'high', 'critical'].includes(cleanPriority)) {
      return cleanPriority as InsightPriority;
    }
    return 'medium'; // Default fallback
  }

  async summarizeMeeting(transcript: string): Promise<string> {
    const { text } = await generateText({
      model: this.model,
      prompt: `Provide a concise 2-3 sentence summary of this meeting transcript:
      
      ${transcript}
      
      Focus on key topics discussed and main outcomes.`,
      temperature: 0.3,
      maxTokens: 200
    });

    return text.trim();
  }

  extractParticipants(transcript: string): string[] {
    // Extract speaker names from transcript format
    const speakerPattern = /\*\*([^:*]+)\*\*:/g;
    const speakers = new Set<string>();
    
    let match;
    while ((match = speakerPattern.exec(transcript)) !== null) {
      speakers.add(match[1]);
    }
    
    return Array.from(speakers);
  }

  calculateConfidenceScore(text: string, context: string): number {
    // Simple heuristic for confidence scoring
    const hasSpecificDetails = /\d+|\$|%|date|deadline|by\s+\w+/i.test(text);
    const hasActionVerbs = /will|must|should|need to|have to|going to/i.test(text);
    const isQuoted = context.includes('"') || context.includes("'");
    
    let score = 0.5; // Base score
    
    if (hasSpecificDetails) score += 0.2;
    if (hasActionVerbs) score += 0.15;
    if (isQuoted) score += 0.15;
    
    return Math.min(score, 1.0);
  }
}