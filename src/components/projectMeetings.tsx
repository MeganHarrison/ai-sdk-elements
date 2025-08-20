// components/ProjectMeetings.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Database } from "../../database.types";

// Define Meeting type from database schema
type Meeting = Database['public']['Tables']['meetings']['Row'] & {
  project_name?: string; // Added for joined data
};

export default function ProjectMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("meetings")
        .select(`
          *,
          projects:project_id(
            id,
            name
          )
        `)
        .order("date", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching meetings:", error);
      } else {
        // Map the data to include project_name
        const mappedMeetings = (data || []).map(meeting => ({
          ...meeting,
          project_name: meeting.projects?.name
        }));
        setMeetings(mappedMeetings);
      }
      setLoading(false);
    };

    fetchMeetings();
  }, []);

  if (loading) return <div>Loading meetings...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Meetings</h2>
      {meetings.map((meeting) => (
        <div key={meeting.id} className="p-4 bg-white shadow rounded-lg">
          <h3 className="font-semibold text-lg">{meeting.title}</h3>
          <p className="text-sm text-gray-600">
            Project: {meeting.project_name || "Unassigned"}
          </p>
          <p className="text-sm">
            Date: {format(new Date(meeting.date), "PPpp")}
          </p>
          {meeting.summary && (
            <p className="mt-2 text-gray-700">{meeting.summary}</p>
          )}
        </div>
      ))}
    </div>
  );
}
