import { createClient } from '@supabase/supabase-js';
import { InsightsGenerator } from './generator';
import { MockInsightsGenerator } from './mock-generator';
import type { InsightGenerationResult, MeetingInsight } from './types';

export class InsightsService {
  private supabase;
  private generator: MockInsightsGenerator; // Using mock for now due to API key issue

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    // Use mock generator for testing - switch to InsightsGenerator when API key is fixed
    this.generator = new MockInsightsGenerator();
  }

  async processAllMeetings(): Promise<void> {
    try {
      // Get all meetings that don't have insights yet
      const { data: meetings, error } = await this.supabase
        .from('meetings')
        .select('*')
        .is('insights', null);

      if (error) throw error;

      console.log(`Found ${meetings?.length || 0} meetings to process`);

      for (const meeting of meetings || []) {
        await this.processMeeting(meeting.id);
      }
    } catch (error) {
      console.error('Error processing all meetings:', error);
      throw error;
    }
  }

  async processMeeting(meetingId: string): Promise<InsightGenerationResult> {
    try {
      // Get meeting details
      const { data: meeting, error: meetingError } = await this.supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;

      // Fetch transcript from storage
      const transcript = await this.fetchTranscript(meeting.storage_bucket_path);
      
      if (!transcript) {
        throw new Error(`No transcript found for meeting ${meetingId}`);
      }

      // Generate insights
      const insights = await this.generator.generateInsightsFromTranscript(
        transcript,
        meetingId,
        meeting.project_id,
        meeting.title,
        meeting.participants
      );

      // Skip database storage for now due to schema issues
      // await this.storeInsights(insights);

      // Update meeting with summary
      const { error: updateError } = await this.supabase
        .from('meetings')
        .update({
          summary: insights.summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (updateError) {
        console.warn('Could not update meeting:', updateError);
      }

      console.log(`Processed meeting ${meetingId}: Generated ${insights.insights.length} insights`);

      return insights;
    } catch (error) {
      console.error(`Error processing meeting ${meetingId}:`, error);
      throw error;
    }
  }

  async fetchTranscript(storagePath: string): Promise<string | null> {
    try {
      const url = `https://lgveqfnpkxvzbnnwuled.supabase.co/storage/v1/object/public/meetings/${encodeURIComponent(storagePath)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch transcript: ${response.statusText}`);
        return null;
      }

      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }

  async storeInsights(result: InsightGenerationResult): Promise<void> {
    try {
      // Store individual insights in project_insights table
      if (result.insights.length > 0) {
        // Very simplified structure - we'll figure out the exact schema
        const insightsToStore = result.insights.map(insight => ({
          meeting_id: result.meeting_id,
          project_id: result.project_id,
          insight_type: insight.category,
          insight_text: insight.text,
          // Store everything else as JSON string
          details: JSON.stringify({
            priority: insight.priority,
            confidence_score: insight.confidence_score,
            extracted_from: insight.extracted_from,
            related_participants: insight.related_participants,
            tags: insight.tags,
            sentiment_score: result.sentiment_score,
            metadata: insight.metadata
          })
        }));

        const { error: insightsError } = await this.supabase
          .from('project_insights')
          .insert(insightsToStore);

        if (insightsError) {
          console.error('Error storing insights:', insightsError);
          throw insightsError;
        }
      }

      // Store action items if we have a separate table for them
      if (result.action_items.length > 0) {
        const actionItemsToStore = result.action_items.map(item => ({
          meeting_id: result.meeting_id,
          project_id: result.project_id,
          description: item.description,
          owner: item.owner,
          deadline: item.deadline,
          priority: item.priority,
          status: item.status || 'pending',
          created_at: new Date().toISOString()
        }));

        // Check if project_tasks table exists
        const { error: tasksError } = await this.supabase
          .from('project_tasks')
          .insert(actionItemsToStore);

        if (tasksError) {
          console.error('Error storing action items:', tasksError);
          // Don't throw here as the table might not exist
        }
      }

      // Store meeting summary if we have a summary table
      if (result.summary) {
        const summaryToStore = {
          meeting_id: result.meeting_id,
          project_id: result.project_id,
          summary: result.summary,
          key_decisions: result.key_decisions,
          sentiment_score: result.sentiment_score,
          created_at: new Date().toISOString()
        };

        const { error: summaryError } = await this.supabase
          .from('meeting_summaries')
          .insert(summaryToStore);

        if (summaryError) {
          console.error('Error storing summary:', summaryError);
          // Don't throw here as the table might not exist
        }
      }
    } catch (error) {
      console.error('Error storing insights:', error);
      throw error;
    }
  }

  async getProjectInsights(projectId: number): Promise<MeetingInsight[]> {
    try {
      // For now, generate insights on-demand from meetings
      const { data: meetings, error: meetingsError } = await this.supabase
        .from('meetings')
        .select('*')
        .eq('project_id', projectId);

      if (meetingsError) throw meetingsError;

      const allInsights: MeetingInsight[] = [];
      
      for (const meeting of meetings || []) {
        try {
          const result = await this.processMeeting(meeting.id);
          allInsights.push(...result.insights);
        } catch (err) {
          console.warn(`Could not process meeting ${meeting.id}:`, err);
        }
      }

      return allInsights;
    } catch (error) {
      console.error('Error fetching project insights:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  async getInsightsByCategory(projectId: number, category: string): Promise<MeetingInsight[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_insights')
        .select('*')
        .eq('project_id', projectId)
        .eq('category', category)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching insights by category:', error);
      throw error;
    }
  }

  async getHighPriorityInsights(projectId: number): Promise<MeetingInsight[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_insights')
        .select('*')
        .eq('project_id', projectId)
        .in('priority', ['high', 'critical'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching high priority insights:', error);
      throw error;
    }
  }

  async getRecentInsights(projectId: number, limit: number = 10): Promise<MeetingInsight[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_insights')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching recent insights:', error);
      throw error;
    }
  }
}