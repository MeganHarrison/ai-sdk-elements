import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    
    // MOCK DATA FOR TESTING - Remove this block when Supabase table is ready
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
    
    // Filter mock data based on query params
    let filteredData = [...mockProjects]
    if (status) {
      filteredData = filteredData.filter(p => p.status === status)
    }
    if (priority) {
      filteredData = filteredData.filter(p => p.priority === priority)
    }
    
    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit)
    
    // Return mock data
    return NextResponse.json({
      success: true,
      data: paginatedData,
      total: filteredData.length,
      limit,
      offset,
      mock: true // Indicator that this is mock data
    })
    
    // ORIGINAL SUPABASE CODE - Uncomment when table is ready
    /*
    const supabase = await createClient()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (priority) {
      query = query.eq('priority', priority)
    }
    
    const { data, error, count } = await query.select('*', { count: 'exact' })
    */
    
    /* Commented out error handling - uncomment with Supabase code above
    if (error) {
      console.error('Error fetching projects:', error)
      
      if (error.code === '42P01' || error.code === 'PGRST204') {
        return NextResponse.json(
          { 
            error: 'Projects table not found',
            message: 'The projects table does not exist in your Supabase database. Please run the SQL migration from supabase/migrations/create_projects_table.sql in your Supabase SQL Editor.',
            code: error.code,
            instructions: [
              '1. Go to https://supabase.com/dashboard',
              '2. Select your project',
              '3. Navigate to SQL Editor',
              '4. Copy the SQL from supabase/migrations/create_projects_table.sql',
              '5. Run the SQL to create the table with sample data'
            ]
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch projects',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }
    
    const transformedData = data?.map(project => ({
      id: project.id,
      name: project.name || project.title,
      title: project.title || project.name,
      description: project.description,
      status: project.status || 'active',
      priority: project.priority || 'medium',
      start_date: project.start_date,
      due_date: project.due_date,
      created_at: project.created_at,
      updated_at: project.updated_at,
      budget: project.budget,
      team_members: project.team_members || [],
      progress: project.progress || 0,
      client_name: project.client_name,
      tags: project.tags || [],
      metadata: project.metadata || {}
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedData || [],
      total: count || 0,
      limit,
      offset
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create project',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
      id: data?.id
    }, { status: 201 })
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }
    
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting project:', error)
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