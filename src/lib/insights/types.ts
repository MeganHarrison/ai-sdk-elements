export type InsightCategory = 
  | 'general_info'
  | 'positive_feedback'
  | 'risk_negative'
  | 'action_item'
  | 'decision'
  | 'milestone'
  | 'blocker'
  | 'resource_need'
  | 'timeline_update'
  | 'budget_update';

export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MeetingInsight {
  id?: string;
  meeting_id: string;
  project_id: number;
  category: InsightCategory;
  text: string;
  confidence_score: number;
  priority: InsightPriority;
  extracted_from?: string; // The specific part of transcript this came from
  related_participants?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface InsightGenerationResult {
  meeting_id: string;
  project_id: number;
  insights: MeetingInsight[];
  summary: string;
  key_decisions: string[];
  action_items: ActionItem[];
  risks: Risk[];
  sentiment_score: number;
}

export interface ActionItem {
  description: string;
  owner?: string;
  deadline?: string;
  priority: InsightPriority;
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface Risk {
  description: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface MeetingSentiment {
  overall: number; // -1 to 1
  positive_moments: string[];
  negative_moments: string[];
  neutral_percentage: number;
}