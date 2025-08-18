import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface SupabaseProject {
  id: string
  created_at: string
  updated_at: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'not_started'
  priority: 'high' | 'medium' | 'low'
  start_date?: string
  due_date?: string
  client_name?: string
  budget?: number
  team_members?: string[]
  progress?: number
  tags?: string[]
}

export function useSupabaseProjects() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['supabase-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as SupabaseProject[]
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useSupabaseProject(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['supabase-project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as SupabaseProject
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useCreateSupabaseProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (project: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-projects'] })
      toast.success('Project created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })
}

export function useUpdateSupabaseProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...project }: Partial<SupabaseProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supabase-projects'] })
      queryClient.invalidateQueries({ queryKey: ['supabase-project', data.id] })
      toast.success('Project updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
}

export function useDeleteSupabaseProject() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })
}