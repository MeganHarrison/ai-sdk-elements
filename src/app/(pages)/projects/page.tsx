"use client"

import { useState, useEffect, useCallback } from "react"
import { ProjectsDataTable } from "@/components/projects-data-table"
import { SectionCards } from "@/components/section-cards"
import type { Project } from "@/components/projects-data-table"

const WORKER_URL = process.env.NEXT_PUBLIC_AI_WORKER_URL || 'https://ai-agent-supabase-worker.megan-d14.workers.dev';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      // Fetch directly from the worker endpoint
      const response = await fetch(`${WORKER_URL}/projects`)
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }
      const data = await response.json()
      setProjects(data.projects || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to fetch projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>
            Projects Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage projects with AI-powered insights from meeting transcripts
          </p>
        </div>
        
        {/* Optional: Add section cards for metrics */}
        <SectionCards />
        
        {/* Projects Data Table */}
        <ProjectsDataTable 
          data={projects} 
          isLoading={isLoading}
          onRefresh={fetchProjects}
        />
        
        {error && (
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Error loading projects: {error.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}