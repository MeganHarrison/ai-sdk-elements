'use client';

import { InsightsTable } from '@/components/insights-table';
import { useState } from 'react';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Insight {
  id: number;
  title: string;
  description: string;
  insight_type: 'general_info' | 'positive_feedback' | 'risk' | 'action_item';
  confidence_score: number | null;
  severity: 'low' | 'medium' | 'high' | null;
  project_id: number | null;
  meeting_id: string | null;
  created_at: string | null;
  resolved: number | null;
  meetings?: {
    id: string;
    title: string;
    date: string;
    participants: string[];
  };
  projects?: {
    id: number;
    name: string;
    'job number': string;
  };
}

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  // Set page title
  React.useEffect(() => {
    document.title = 'AI Insights Dashboard';
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Insights Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage AI-generated insights from all your meeting transcripts
        </p>
      </div>

      <InsightsTable
        showProjectColumn={true}
        limit={100}
        onInsightClick={(insight) => setSelectedInsight(insight)}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInsight?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {selectedInsight?.insight_type?.replace('_', ' ')}
                </Badge>
                {selectedInsight?.severity && (
                  <Badge variant="secondary">{selectedInsight.severity}</Badge>
                )}
                {selectedInsight?.confidence_score && (
                  <Badge variant="outline">
                    {(selectedInsight.confidence_score * 100).toFixed(0)}% confidence
                  </Badge>
                )}
                {selectedInsight?.resolved ? (
                  <Badge variant="outline" className="text-green-600">
                    Resolved
                  </Badge>
                ) : (
                  <Badge variant="outline">Open</Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {selectedInsight?.description}
              </p>
            </div>

            {selectedInsight?.projects && (
              <div>
                <h4 className="font-semibold mb-2">Project</h4>
                <p className="text-sm">
                  {selectedInsight.projects.name}
                  {selectedInsight.projects['job number'] && (
                    <span className="text-muted-foreground ml-2">
                      (#{selectedInsight.projects['job number']})
                    </span>
                  )}
                </p>
              </div>
            )}

            {selectedInsight?.meetings && (
              <div>
                <h4 className="font-semibold mb-2">Source Meeting</h4>
                <p className="text-sm">
                  {selectedInsight.meetings.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedInsight.meetings.date), 'MMMM d, yyyy')}
                </p>
                {selectedInsight.meetings.participants && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Participants:</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedInsight.meetings.participants.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedInsight?.created_at && (
              <div>
                <h4 className="font-semibold mb-2">Generated</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedInsight.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
