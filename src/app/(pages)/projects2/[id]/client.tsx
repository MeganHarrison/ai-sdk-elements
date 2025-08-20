"use client";

import { useState } from "react";
import { ProjectInsights } from "@/components/insights/project-insights";
import { ProjectChat } from "@/components/chat/project-chat";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  budget?: string;
  progress: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface Meeting {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  participants: string[];
}

interface ProjectDetailClientProps {
  project: Project;
  meetings: Meeting[];
}

export default function ProjectDetailClient({ project, meetings }: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState("Chat");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const formatCurrency = (amount?: string | number) => {
    if (!amount) return "Not set";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "completed": return "text-blue-600";
      case "on_hold": return "text-yellow-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const tabs = [
    "Insights",
    "Chat",
    "Meetings",
    "Files",
    "Expenses",
    "Subs",
    "Change Orders",
    "Schedule",
    "Reports",
    "Risks",
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header with title and progress */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-orange-600 uppercase">
          {project.title}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Progress</div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="text-sm font-semibold">{project.progress}%</div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase mb-3">Overview</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`capitalize ${getStatusColor(project.status)}`}>
                {project.status.replace("_", " ")}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Priority:</span>
              <span className={`capitalize ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Start Date:</span>
              <span className="text-sm">{formatDate(project.startDate)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Due Date:</span>
              <span className="text-sm">{formatDate(project.dueDate)}</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase mb-3">Project Team</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium">Owner:</span>
              <span>{project.metadata?.owner || "Not assigned"}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">PM:</span>
              <span>{project.metadata?.pm || "Not assigned"}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Team Size:</span>
              <span>{project.metadata?.team_members?.length || 0} members</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Client:</span>
              <span>{project.metadata?.client_name || "Not specified"}</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase mb-3">Financials</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium">Budget:</span>
              <span className="font-semibold">{formatCurrency(project.budget)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Spent:</span>
              <span>{formatCurrency(project.metadata?.spent || 0)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Remaining:</span>
              <span>{formatCurrency(
                project.budget ? parseFloat(project.budget.toString()) - (project.metadata?.spent || 0) : 0
              )}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-green-600">On Budget</span>
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Project Overview</h2>
          <p className="text-gray-700">
            {project.description || "No description available for this project."}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Project Insights</h2>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-600">✓</span>
              <p className="text-gray-700">Project is currently {project.progress}% complete</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">ℹ</span>
              <p className="text-gray-700">
                {meetings.length} meetings recorded for this project
              </p>
            </div>
            {project.dueDate && (
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">⚠</span>
                <p className="text-gray-700">
                  Due date: {formatDate(project.dueDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-700 hover:text-black border-b-2 border-transparent hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Insights" && (
        <ProjectInsights projectId={parseInt(project.id)} />
      )}
      
      {activeTab === "Chat" && (
        <ProjectChat projectId={project.id} projectTitle={project.title} />
      )}
      
      {activeTab === "Meetings" && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-sm text-left">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 font-medium text-gray-700">Title</th>
                <th className="px-6 py-4 font-medium text-gray-700">Summary</th>
                <th className="px-6 py-4 font-medium text-gray-700">Category</th>
                <th className="px-6 py-4 font-medium text-gray-700">Participants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {meetings.length > 0 ? (
                meetings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 font-medium">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.summary}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.participants.join(", ")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No meetings found for this project
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab !== "Meetings" && activeTab !== "Chat" && activeTab !== "Insights" && (
        <div className="bg-white shadow rounded-lg p-12">
          <p className="text-center text-gray-500">
            {activeTab} data will be displayed here
          </p>
        </div>
      )}

    </div>
  );
}