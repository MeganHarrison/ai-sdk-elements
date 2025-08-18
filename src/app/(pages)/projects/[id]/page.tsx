"use client"

import { useParams, useRouter } from "next/navigation"
import { useSupabaseProject, type SupabaseProject } from "@/hooks/use-supabase-projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Building2,
  DollarSign,
  Hash,
  Briefcase,
  Target,
  FileText,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Edit
} from "lucide-react"
import { format } from "date-fns"

// Placeholder types for future implementation
interface ProjectInsight {
  id: string
  project_id: string
  category: 'general_info' | 'positive_feedback' | 'risks_negative_feedback' | 'action_items'
  text: string
  confidence_score: number
  created_at: string
}

interface Meeting {
  id: string
  title: string
  date_time: string
  duration: number
  participants: string
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // Fetch project data from Supabase
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError 
  } = useSupabaseProject(projectId)

  // Placeholder data for insights and meetings - will be replaced with actual data
  const insights: ProjectInsight[] = []
  const meetings: Meeting[] = []

  // Group insights by category
  const insightsByCategory = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = []
    }
    acc[insight.category].push(insight)
    return acc
  }, {} as Record<string, ProjectInsight[]>)

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'on_hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'not_started': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }

  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    }
    return priorityColors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'general_info': FileText,
      'positive_feedback': TrendingUp,
      'risks_negative_feedback': AlertTriangle,
      'action_items': CheckCircle,
    }
    return icons[category as keyof typeof icons] || FileText
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'general_info': 'text-blue-600',
      'positive_feedback': 'text-green-600',
      'risks_negative_feedback': 'text-red-600',
      'action_items': 'text-purple-600',
    }
    return colors[category as keyof typeof colors] || 'text-gray-600'
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      'general_info': 'General Information',
      'positive_feedback': 'Positive Feedback',
      'risks_negative_feedback': 'Risks & Concerns',
      'action_items': 'Action Items',
    }
    return labels[category as keyof typeof labels] || category
  }

  if (projectLoading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4 pb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/projects')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {projectError ? (projectError as Error).message : 'Project not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate project progress based on dates
  const progress = project.progress || (project.start_date && project.due_date ? (() => {
    const startDate = new Date(project.start_date)
    const dueDate = new Date(project.due_date)
    const today = new Date()
    const totalDays = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
  })() : 0)

  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#DB802D' }}>
              {project.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
              <Badge variant="outline" className={getPriorityColor(project.priority)}>
                {project.priority} Priority
              </Badge>
              {project.tags && project.tags.length > 0 && project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with AI
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {project.client_name || 'Not specified'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {project.team_members?.length || 0} members
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Budget Information */}
              {project.budget && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Budget Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="font-medium">${project.budget.toLocaleString()}</p>
                    </div>
                    {/* Add more budget details here when available */}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Project Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="general_info">General</TabsTrigger>
                  <TabsTrigger value="positive_feedback">Positive</TabsTrigger>
                  <TabsTrigger value="risks_negative_feedback">Risks</TabsTrigger>
                  <TabsTrigger value="action_items">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-4">
                  {insights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No insights generated yet</p>
                      <p className="text-sm mt-1">Insights will appear here once meetings are processed</p>
                    </div>
                  ) : (
                    insights.map((insight) => {
                      const Icon = getCategoryIcon(insight.category)
                      return (
                        <div key={insight.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getCategoryColor(insight.category)}`} />
                          <div className="flex-1">
                            <p className="text-sm">{insight.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(insight.category)}
                              </Badge>
                              <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </TabsContent>

                {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
                  <TabsContent key={category} value={category} className="mt-4 space-y-4">
                    {categoryInsights.map((insight) => {
                      const Icon = getCategoryIcon(category)
                      return (
                        <div key={insight.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getCategoryColor(category)}`} />
                          <div className="flex-1">
                            <p className="text-sm">{insight.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                              <span>{format(new Date(insight.created_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{project.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{project.priority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Size</span>
                <span className="font-medium">{project.team_members?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          {project.team_members && project.team_members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.team_members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {member.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{member}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Activity tracking coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}