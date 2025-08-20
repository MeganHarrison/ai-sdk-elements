import type { 
  InsightGenerationResult,
  InsightCategory,
  InsightPriority
} from './types';

export class MockInsightsGenerator {
  async generateInsightsFromTranscript(
    transcript: string,
    meetingId: string,
    projectId: number,
    meetingTitle?: string,
    participants?: string[]
  ): Promise<InsightGenerationResult> {
    // Extract some basic patterns from the transcript
    const hasScheduleDiscussion = /deadline|schedule|timeline|date|when/i.test(transcript);
    const hasBudgetDiscussion = /budget|cost|expense|dollar|\$/i.test(transcript);
    const hasRiskDiscussion = /risk|concern|issue|problem|block/i.test(transcript);
    const hasDecision = /decided|will|going to|agreed/i.test(transcript);
    const hasActionItems = /need to|will|must|should|action|task/i.test(transcript);
    
    // Generate mock insights based on transcript content
    const insights = [];
    
    // Always add a general info insight
    insights.push({
      meeting_id: meetingId,
      project_id: projectId,
      category: 'general_info' as InsightCategory,
      text: `Meeting "${meetingTitle || 'Untitled'}" discussed project progress and coordination`,
      confidence_score: 0.9,
      priority: 'medium' as InsightPriority,
      extracted_from: transcript.substring(0, 200),
      related_participants: participants?.slice(0, 2),
      tags: ['meeting', 'coordination']
    });
    
    if (hasScheduleDiscussion) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'timeline_update' as InsightCategory,
        text: 'Timeline and scheduling matters were discussed during the meeting',
        confidence_score: 0.85,
        priority: 'high' as InsightPriority,
        tags: ['timeline', 'schedule']
      });
    }
    
    if (hasBudgetDiscussion) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'budget_update' as InsightCategory,
        text: 'Budget or cost-related topics were covered in the discussion',
        confidence_score: 0.8,
        priority: 'high' as InsightPriority,
        tags: ['budget', 'financial']
      });
    }
    
    if (hasRiskDiscussion) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'risk_negative' as InsightCategory,
        text: 'Potential risks or concerns were identified and discussed',
        confidence_score: 0.75,
        priority: 'critical' as InsightPriority,
        tags: ['risk', 'concern']
      });
    }
    
    if (hasDecision) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'decision' as InsightCategory,
        text: 'Key decisions were made during the meeting',
        confidence_score: 0.82,
        priority: 'high' as InsightPriority,
        tags: ['decision', 'agreement']
      });
    }
    
    if (hasActionItems) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'action_item' as InsightCategory,
        text: 'Action items were identified for follow-up',
        confidence_score: 0.88,
        priority: 'high' as InsightPriority,
        tags: ['action', 'todo']
      });
    }
    
    // Add a positive feedback if meeting seems productive
    if (insights.length > 3) {
      insights.push({
        meeting_id: meetingId,
        project_id: projectId,
        category: 'positive_feedback' as InsightCategory,
        text: 'Meeting was productive with multiple important topics covered',
        confidence_score: 0.7,
        priority: 'low' as InsightPriority,
        tags: ['progress', 'productive']
      });
    }
    
    // Generate mock action items
    const actionItems = [];
    if (hasActionItems) {
      actionItems.push({
        description: 'Review and follow up on discussed items',
        owner: participants?.[0],
        priority: 'medium' as InsightPriority,
        status: 'pending' as const
      });
      
      if (hasScheduleDiscussion) {
        actionItems.push({
          description: 'Update project timeline based on discussion',
          owner: participants?.[1],
          priority: 'high' as InsightPriority,
          status: 'pending' as const
        });
      }
    }
    
    // Generate mock risks
    const risks = [];
    if (hasRiskDiscussion) {
      risks.push({
        description: 'Potential project risks identified during meeting',
        impact: 'medium' as const,
        likelihood: 'medium' as const,
        mitigation: 'Team to review and develop mitigation strategies'
      });
    }
    
    // Generate summary
    const summary = `Meeting covered ${insights.length} key topics including ${
      insights.map(i => categoryToLabel(i.category)).join(', ')
    }. ${participants?.length || 0} participants attended.`;
    
    // Generate key decisions
    const keyDecisions = [];
    if (hasDecision) {
      keyDecisions.push('Team agreed on next steps for project progression');
    }
    if (hasScheduleDiscussion) {
      keyDecisions.push('Timeline adjustments were discussed');
    }
    
    // Calculate sentiment (mock - based on insight types)
    const positiveCount = insights.filter(i => 
      i.category === 'positive_feedback' || i.category === 'milestone'
    ).length;
    const negativeCount = insights.filter(i => 
      i.category === 'risk_negative' || i.category === 'blocker'
    ).length;
    const sentimentScore = (positiveCount - negativeCount) / Math.max(insights.length, 1);
    
    return {
      meeting_id: meetingId,
      project_id: projectId,
      insights,
      summary,
      key_decisions: keyDecisions,
      action_items: actionItems,
      risks,
      sentiment_score: Math.max(-1, Math.min(1, sentimentScore))
    };
  }

  async generateInsightsFromChunks(
    chunks: string[],
    meetingId: string,
    projectId: number,
    meetingTitle?: string
  ): Promise<InsightGenerationResult> {
    const transcript = chunks.join('\n\n');
    return this.generateInsightsFromTranscript(
      transcript,
      meetingId,
      projectId,
      meetingTitle
    );
  }
}

function categoryToLabel(category: InsightCategory): string {
  const labels: Record<InsightCategory, string> = {
    general_info: 'general information',
    positive_feedback: 'positive progress',
    risk_negative: 'risks',
    action_item: 'action items',
    decision: 'decisions',
    milestone: 'milestones',
    blocker: 'blockers',
    resource_need: 'resource needs',
    timeline_update: 'timeline updates',
    budget_update: 'budget discussions'
  };
  return labels[category] || category;
}