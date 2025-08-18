import { NextResponse } from 'next/server';
import { generateInsightFromTranscript } from '@/utils/insights';

export async function POST(req: Request) {
  const { query } = await req.json();
  const insight = await generateInsightFromTranscript(query);
  return NextResponse.json({ insight });
}