// lib/supabase/project-utils.ts
import { createClient } from "./client";
import { AIInsight, Meeting } from "@/types";

export const fetchInsightsByProject = async (
    projectId: number,
): Promise<AIInsight[] | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("ai_insights_with_project")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching project insights:", error);
        return null;
    }

    return data;
};

export const fetchMeetingsByProject = async (
    projectId: number,
): Promise<Meeting[] | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("meetings_with_project")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching project meetings:", error);
        return null;
    }

    return data;
};
