import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // MOCK DATA FOR TESTING - Remove when Supabase is ready
    const mockProjects = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        title: 'RAG Pipeline Implementation',
        name: 'RAG Pipeline Implementation',
        description: 'Implement complete RAG pipeline with Supabase, Cloudflare Workers, and Fireflies integration for meeting transcript processing.',
        status: 'active',
        priority: 'high',
        start_date: '2024-01-15',
        due_date: '2024-03-31',
        client_name: 'Hyperdrive Solutions',
        budget: 75000,
        team_members: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis'],
        progress: 45,
        tags: ['AI', 'RAG', 'Supabase', 'Cloudflare'],
        metadata: {}
      },
      {
        id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        created_at: '2024-02-01T09:00:00Z',
        updated_at: '2024-02-15T14:00:00Z',
        title: 'Customer Portal Redesign',
        name: 'Customer Portal Redesign',
        description: 'Complete redesign of the customer portal with improved UX, modern UI components, and enhanced performance.',
        status: 'active',
        priority: 'medium',
        start_date: '2024-02-01',
        due_date: '2024-04-15',
        client_name: 'TechCorp Industries',
        budget: 50000,
        team_members: ['Alice Brown', 'Bob Wilson', 'Carol Martinez'],
        progress: 30,
        tags: ['Frontend', 'UX', 'React', 'Design'],
        metadata: {}
      },
      {
        id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        created_at: '2024-02-10T11:00:00Z',
        updated_at: '2024-02-10T11:00:00Z',
        title: 'Mobile App Development',
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android with real-time sync capabilities.',
        status: 'not_started',
        priority: 'high',
        start_date: '2024-03-01',
        due_date: '2024-06-30',
        client_name: 'StartupXYZ',
        budget: 120000,
        team_members: ['David Lee', 'Emma Thompson', 'Frank Garcia'],
        progress: 0,
        tags: ['Mobile', 'React Native', 'iOS', 'Android'],
        metadata: {}
      },
      {
        id: 'd4e5f6a7-b8c9-0123-defa-456789012345',
        created_at: '2024-01-20T08:30:00Z',
        updated_at: '2024-02-05T16:00:00Z',
        title: 'API Integration Suite',
        name: 'API Integration Suite',
        description: 'Build comprehensive API integration for third-party services including payments and shipping.',
        status: 'active',
        priority: 'high',
        start_date: '2024-02-15',
        due_date: '2024-05-15',
        client_name: 'E-Commerce Plus',
        budget: 85000,
        team_members: ['Ian Robinson', 'Julia Clark', 'Kevin Adams'],
        progress: 20,
        tags: ['API', 'Integration', 'Backend'],
        metadata: {}
      }
    ]
    
    const mockProject = mockProjects.find(p => p.id === id)
    
    if (mockProject) {
      return NextResponse.json({
        success: true,
        data: mockProject,
        mock: true
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Project not found',
          message: `No project found with ID: ${id}`,
          code: 'MOCK_404'
        },
        { status: 404 }
      )
    }
    
    // ORIGINAL CODE - Uncomment when Supabase is ready
    /*
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching project:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Project not found',
            message: `No project found with ID: ${id}`,
            code: error.code
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch project',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }
    
    const transformedData = data ? {
      id: data.id,
      name: data.name || data.title,
      title: data.title || data.name,
      description: data.description,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      start_date: data.start_date,
      due_date: data.due_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
      budget: data.budget,
      team_members: data.team_members || [],
      progress: data.progress || 0,
      client_name: data.client_name,
      tags: data.tags || [],
      metadata: data.metadata || {}
    } : null
    
    return NextResponse.json({
      success: true,
      data: transformedData
    })
    */
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating project:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Project not found',
            message: `No project found with ID: ${id}`,
            code: error.code
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to update project',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting project:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Project not found',
            message: `No project found with ID: ${id}`,
            code: error.code
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to delete project',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}