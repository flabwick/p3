import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/streams - List all streams
export async function GET() {
  try {
    console.log('[API] GET /api/streams - Fetching all streams');
    
    const streams = await prisma.stream.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { blocks: true }
        }
      }
    });
    
    console.log(`[API] GET /api/streams - Found ${streams.length} streams`);
    return NextResponse.json(streams);
  } catch (error) {
    console.error('[API] GET /api/streams - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/streams - Create a new stream
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] POST /api/streams - Creating stream with data:', body);
    
    const { name } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('[API] POST /api/streams - Invalid name:', name);
      return NextResponse.json(
        { error: 'Stream name is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const stream = await prisma.stream.create({
      data: { name: name.trim() },
      include: {
        _count: {
          select: { blocks: true }
        }
      }
    });
    
    console.log('[API] POST /api/streams - Created stream:', stream.id, stream.name);
    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/streams - Error:', error);
    return NextResponse.json(
      { error: 'Failed to create stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
