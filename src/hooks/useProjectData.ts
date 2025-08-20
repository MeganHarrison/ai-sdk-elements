// hooks/useProjectData.ts
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AIInsight, Meeting } from "@/types";

export const useProjectInsights = (projectId: number) => {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("ai_insights_with_project")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setInsights(data || []);
            }
            setLoading(false);
        };

        fetchInsights();
    }, [projectId]);

    return { insights, loading, error };
};

export const useProjectMeetings = (projectId: number) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("meetings_with_project")
                .select("*")
                .eq("project_id", projectId)
                .order("date", { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setMeetings(data || []);
            }
            setLoading(false);
        };

        fetchMeetings();
    }, [projectId]);

    return { meetings, loading, error };
};
