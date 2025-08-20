import { NextRequest, NextResponse } from 'next/server';
import { InsightsService } from '@/lib/insights/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, meetingId, projectId } = body;

    const service = new InsightsService();

    switch (action) {
      case 'processMeeting':
        if (!meetingId) {
          return NextResponse.json(
            { error: 'Meeting ID is required' },
            { status: 400 }
          );
        }
        const meetingResult = await service.processMeeting(meetingId);
        return NextResponse.json({
          success: true,
          data: meetingResult
        });

      case 'processAllMeetings':
        await service.processAllMeetings();
        return NextResponse.json({
          success: true,
          message: 'All meetings processed successfully'
        });

      case 'getProjectInsights':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        const insights = await service.getProjectInsights(projectId);
        return NextResponse.json({
          success: true,
          data: insights
        });

      case 'getHighPriorityInsights':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        const highPriority = await service.getHighPriorityInsights(projectId);
        return NextResponse.json({
          success: true,
          data: highPriority
        });

      case 'getRecentInsights':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        const recent = await service.getRecentInsights(projectId, body.limit || 10);
        return NextResponse.json({
          success: true,
          data: recent
        });

      case 'getInsightsByCategory':
        if (!projectId || !body.category) {
          return NextResponse.json(
            { error: 'Project ID and category are required' },
            { status: 400 }
          );
        }
        const categoryInsights = await service.getInsightsByCategory(projectId, body.category);
        return NextResponse.json({
          success: true,
          data: categoryInsights
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  const limit = searchParams.get('limit');

  try {
    const service = new InsightsService();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    let insights;

    if (category) {
      insights = await service.getInsightsByCategory(parseInt(projectId), category);
    } else if (priority === 'high') {
      insights = await service.getHighPriorityInsights(parseInt(projectId));
    } else if (limit) {
      insights = await service.getRecentInsights(parseInt(projectId), parseInt(limit));
    } else {
      insights = await service.getProjectInsights(parseInt(projectId));
    }

    return NextResponse.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Insights GET Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}