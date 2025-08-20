'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { MeetingInsight, InsightCategory, InsightPriority } from '@/lib/insights/types';

interface ProjectInsightsProps {
  projectId: number;
  className?: string;
}

const categoryIcons: Record<InsightCategory, React.ReactNode> = {
  general_info: <Info className="h-4 w-4" />,
  positive_feedback: <CheckCircle className="h-4 w-4 text-green-500" />,
  risk_negative: <AlertTriangle className="h-4 w-4 text-red-500" />,
  action_item: <Target className="h-4 w-4 text-blue-500" />,
  decision: <CheckCircle className="h-4 w-4 text-purple-500" />,
  milestone: <TrendingUp className="h-4 w-4 text-green-500" />,
  blocker: <AlertCircle className="h-4 w-4 text-red-500" />,
  resource_need: <Users className="h-4 w-4 text-orange-500" />,
  timeline_update: <Calendar className="h-4 w-4 text-blue-500" />,
  budget_update: <DollarSign className="h-4 w-4 text-yellow-500" />
};

const categoryLabels: Record<InsightCategory, string> = {
  general_info: 'General Info',
  positive_feedback: 'Positive',
  risk_negative: 'Risks',
  action_item: 'Action Items',
  decision: 'Decisions',
  milestone: 'Milestones',
  blocker: 'Blockers',
  resource_need: 'Resources',
  timeline_update: 'Timeline',
  budget_update: 'Budget'
};

const priorityColors: Record<InsightPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

export function ProjectInsights({ projectId, className }: ProjectInsightsProps) {
  const [insights, setInsights] = useState<MeetingInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | InsightCategory>('all');
  const [processingMeetings, setProcessingMeetings] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, process all meetings to generate insights
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getProjectInsights',
          projectId: projectId 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // If no insights exist, try to generate them from meetings
        if (data.error?.includes('no insights')) {
          await processMeetings();
          return;
        }
        throw new Error(data.error || 'Failed to fetch insights');
      }
      
      // Handle both array and object response
      if (data.data?.insights) {
        setInsights(data.data.insights);
      } else if (Array.isArray(data.data)) {
        setInsights(data.data);
      } else {
        setInsights([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const processMeetings = async () => {
    setProcessingMeetings(true);
    setError(null);
    
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'processAllMeetings' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process meetings');
      }
      
      // Refresh insights after processing
      await fetchInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingMeetings(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  const filterInsightsByCategory = (category: InsightCategory | 'all') => {
    if (category === 'all') return insights;
    return insights.filter(insight => insight.category === category);
  };

  const groupInsightsByCategory = () => {
    const grouped: Record<InsightCategory, MeetingInsight[]> = {} as any;
    insights.forEach(insight => {
      if (!grouped[insight.category]) {
        grouped[insight.category] = [];
      }
      grouped[insight.category].push(insight);
    });
    return grouped;
  };

  const highPriorityInsights = insights.filter(
    i => i.priority === 'high' || i.priority === 'critical'
  );

  const actionItems = insights.filter(i => i.category === 'action_item');
  const risks = insights.filter(i => i.category === 'risk_negative');
  const blockers = insights.filter(i => i.category === 'blocker');

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Insights</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={processMeetings}
            disabled={processingMeetings}
          >
            {processingMeetings ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Generate New Insights'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{actionItems.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risks & Blockers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {risks.length + blockers.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {highPriorityInsights.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Alerts */}
      {highPriorityInsights.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{highPriorityInsights.length} high priority items</strong> require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Insights Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Insights</CardTitle>
          <CardDescription>
            Insights extracted from meeting transcripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-6 lg:grid-cols-11 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.keys(categoryLabels).map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {categoryLabels[cat as InsightCategory]}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value={activeTab} className="space-y-3">
                {filterInsightsByCategory(activeTab).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No insights in this category
                  </div>
                ) : (
                  filterInsightsByCategory(activeTab).map((insight, idx) => (
                    <Card key={insight.id || idx} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {categoryIcons[insight.category]}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[insight.category]}
                            </Badge>
                            <Badge className={`text-xs ${priorityColors[insight.priority]}`}>
                              {insight.priority}
                            </Badge>
                            {insight.confidence_score && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(insight.confidence_score * 100)}% confidence
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{insight.text}</p>
                          {insight.related_participants && insight.related_participants.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {insight.related_participants.join(', ')}
                            </div>
                          )}
                          {insight.tags && insight.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {insight.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}