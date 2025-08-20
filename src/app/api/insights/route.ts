import { NextRequest, NextResponse } from 'next/server';
import { generateInsightFromTranscript } from '@/utils/insights';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const insightType = searchParams.get('type');
    
    let query = supabase
      .from('ai_insights')
      .select(`
        *,
        meetings:meeting_id(
          id,
          title,
          date,
          participants
        ),
        projects:project_id(
          id,
          name,
          "job number"
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (insightType && insightType !== 'all') {
      query = query.eq('insight_type', insightType);
    }
    
    const { data: insights, error, count } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch insights', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      insights: insights || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { query } = await req.json();
  const insight = await generateInsightFromTranscript(query);
  return NextResponse.json({ insight });
}