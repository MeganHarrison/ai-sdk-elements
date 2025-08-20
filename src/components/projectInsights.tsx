// components/ProjectInsights.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AIInsight } from "@/types";

export default function ProjectInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("ai_insights_with_project")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching insights:", error);
      } else {
        setInsights(data || []);
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
