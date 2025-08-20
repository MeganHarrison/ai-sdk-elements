// components/ProjectInsights.tsx
"use client";

import { useState, useEffect } from "react";
import type { Database } from "../../database.types";

// Define AIInsight type from database schema
type AIInsight = Database["public"]["Tables"]["ai_insights"]["Row"] & {
  project_name?: string; // Added for joined data from view
};

export default function ProjectInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Use the API endpoint we created
        const response = await fetch('/api/insights?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        
        const data = await response.json();
        // Map the response to include project_name from nested projects object
        const mappedInsights = (data.insights || []).map((insight: any) => ({
          ...insight,
          project_name: insight.projects?.name
        }));
        
        setInsights(mappedInsights);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <div>Loading insights...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent AI Insights</h2>
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`p-4 rounded-lg ${
            insight.severity === "high"
              ? "bg-red-100"
              : insight.severity === "medium"
              ? "bg-yellow-100"
              : "bg-green-100"
          }`}
        >
          <h3 className="font-semibold text-lg">{insight.title}</h3>
          <p className="text-sm text-gray-600">
            Project: {insight.project_name || "Unassigned"}
          </p>
          <p>{insight.description}</p>
          <span className="text-xs text-gray-500">
            Severity: {insight.severity}
          </span>
        </div>
      ))}
    </div>
  );
}