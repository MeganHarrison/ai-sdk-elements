"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  Users,
  AlertCircle,
  ArrowRight,
  Activity,
  RefreshCcw,
  Building2,
  DollarSign,
  Plus
} from "lucide-react"
import { format } from "date-fns"

interface Project {
  id: string
  name: string
  title?: string
  description?: string
  status: string
  priority?: string
  start_date?: string
  due_date?: string
  created_at: string
  updated_at: string
  metadata?: {
    tags?: string[]
    budget?: number
    team_members?: any[]
    progress?: number
    client_name?: string
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await fetch('/api/v1/projects')
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }
      const data = await response.json()
      setProjects(data.data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const refetch = fetchProjects

  const navigateToProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`)
  }, [router])

  const getStatusColor = useCallback((status: string) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'on_hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'not_started': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }, [])

  const getPriorityColor = useCallback((priority: string) => {
    const priorityColors: Record<string, string> = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    }
    return priorityColors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }, [])

  // Memoize project cards to prevent unnecessary re-renders
  const projectCards = useMemo(() => 
    projects.map((project: SupabaseProject) => {
      const hasBudget = project.budget
      const hasTeam = project.team_members && project.team_members.length > 0
      
      return (
        <Card 
          key={project.id} 
          className="group cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden border-muted"
          onClick={() => navigateToProject(project.id)}
        >
          <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {project.title}
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 flex-shrink-0 mt-1" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
              {project.tags && project.tags.length > 0 && project.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-muted-foreground">
              {project.description && (
                <p className="text-xs line-clamp-2">{project.description}</p>
              )}
              
              <div className="flex items-center gap-4">
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {project.due_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(project.due_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {hasTeam && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project.team_members!.length} members</span>
                  </div>
                )}
                {hasBudget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${project.budget!.toLocaleString()}</span>
                  </div>
                )}
                {project.progress !== undefined && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>{project.progress}%</span>
                  </div>
                )}
              </div>

              {project.client_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="text-xs">{project.client_name}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  navigateToProject(project.id)
                }}
              >
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }),
    [projects, navigateToProject, getStatusColor, getPriorityColor]
  )

  if (isLoading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Projects</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Loading projects...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="h-2" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Projects</h1>
          <p className="text-muted-foreground mt-2">Failed to load projects</p>
        </div>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {(error as Error).message}
            {(error as any)?.code === '42P01' && (
              <div className="mt-2">
                <p className="font-medium">The projects table doesn't exist in Supabase.</p>
                <p className="text-sm mt-1">Please create the projects table in your Supabase dashboard with the required columns.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="w-fit">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      <div className="pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: '#DB802D' }}>Projects</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">
                Manage and track all your projects
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{isFetching ? 'Updating...' : 'Live'}</span>
                <span className="text-muted-foreground/50">•</span>
                <Building2 className="h-3 w-3" />
                <span>{projects.length} projects</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/projects/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create your first project to get started</p>
          <Button onClick={() => router.push('/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectCards}
        </div>
      )}
    </div>
  )
}