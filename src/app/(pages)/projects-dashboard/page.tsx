// app/dashboard/page.tsx
import ProjectInsights from "@/components/ProjectInsights";
import ProjectMeetings from "@/components/ProjectMeetings";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid md:grid-cols-2 gap-6">
      <ProjectInsights />
      <ProjectMeetings />
    </div>
  );
}
