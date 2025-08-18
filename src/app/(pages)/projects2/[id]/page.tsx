import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch project details from Supabase
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Transform the data to match the expected format
  const transformedProject = {
    id: project.id,
    title: project.title || project.name || "Untitled Project",
    description: project.description || "No description available",
    status: project.status || "not_started",
    priority: project.priority || "medium",
    startDate: project.start_date,
    dueDate: project.due_date,
    budget: project.budget,
    progress: project.progress || 0,
    metadata: project.metadata || {},
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };

  // For now, we'll use mock meetings data
  // In production, this would come from a meetings table
  const mockMeetings = [
    {
      id: "1",
      title: "Project Kickoff Meeting",
      summary: "Initial project planning and requirements gathering",
      category: "Planning",
      date: "2024-01-15",
      participants: ["John Smith", "Sarah Johnson"],
    },
    {
      id: "2",
      title: "Weekly Status Update",
      summary: "Review of progress and upcoming milestones",
      category: "Status",
      date: "2024-01-22",
      participants: ["Mike Chen", "Emily Davis"],
    },
    {
      id: "3",
      title: "Technical Architecture Review",
      summary: "Discussion of system design and technology choices",
      category: "Technical",
      date: "2024-01-25",
      participants: ["Alice Brown", "Bob Wilson"],
    },
  ];

  return (
    <ProjectDetailClient 
      project={transformedProject} 
      meetings={mockMeetings}
    />
  );
}
