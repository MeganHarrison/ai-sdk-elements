import { DataTable } from "@/components/data-table"
import { apiClient } from "@/lib/api-client"

// Sample meetings data matching the schema
const sampleMeetings = [
  {
    id: "1",
    title: "Weekly Team Standup",
    type: "Team Meeting",
    status: "completed",
    date: "2025-08-16",
    time: "09:00",
    duration: 30,
    location: "Conference Room A",
    organizer: "John Doe",
    attendees: JSON.stringify(["Alice", "Bob", "Charlie"]),
    agenda: "Review progress, discuss blockers",
    notes: "Discussed deployment timeline",
    action_items: JSON.stringify([]),
    recording_url: null
  },
  {
    id: "2",
    title: "Project Kickoff",
    type: "Planning",
    status: "scheduled",
    date: "2025-08-20",
    time: "14:00",
    duration: 60,
    location: "Virtual - Zoom",
    organizer: "Sarah Chen",
    attendees: JSON.stringify(["Team Alpha", "Team Beta"]),
    agenda: "Project overview, timeline, deliverables",
    notes: "",
    action_items: JSON.stringify([]),
    recording_url: null
  },
  {
    id: "3",
    title: "Client Review",
    type: "Client Meeting",
    status: "scheduled",
    date: "2025-08-18",
    time: "15:30",
    duration: 45,
    location: "Client Office",
    organizer: "Mike Johnson",
    attendees: JSON.stringify(["Client Team", "Sales Team"]),
    agenda: "Demo new features, gather feedback",
    notes: "",
    action_items: JSON.stringify([]),
    recording_url: null
  }
];

async function getMeetings() {
  try {
    const { meetings } = await apiClient.meetings.list();
    // If we get meetings from the database, use them
    if (meetings && meetings.length > 0) {
      return meetings;
    }
    // Otherwise use sample data
    return sampleMeetings;
  } catch (error) {
    console.error("Failed to fetch meetings from API, using sample data:", error);
    // If the API fails, show sample meetings data
    return sampleMeetings;
  }
}

export default async function Page() {
  const meetings = await getMeetings();
  
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <DataTable data={meetings} />
    </div>
  )
}
