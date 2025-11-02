import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// POST /api/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] POST /api/blocks - Creating block with data:', body);
    
    const { streamId, type, content, order } = body;
    
    // Validation
    if (!streamId || typeof streamId !== 'string') {
      console.error('[API] POST /api/blocks - Invalid streamId:', streamId);
      return NextResponse.json(
        { error: 'streamId is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!type || !['markdown', 'prompt'].includes(type)) {
      console.error('[API] POST /api/blocks - Invalid type:', type);
      return NextResponse.json(
        { error: 'type is required and must be either "markdown" or "prompt"' },
        { status: 400 }
      );
    }
    
    if (content === undefined || content === null) {
      console.error('[API] POST /api/blocks - Missing content');
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }
    
    if (order === undefined || typeof order !== 'number') {
      console.error('[API] POST /api/blocks - Invalid order:', order);
      return NextResponse.json(
        { error: 'order is required and must be a number' },
        { status: 400 }
      );
    }
    
    // Check if stream exists
    const stream = await prisma.stream.findUnique({
      where: { id: streamId }
    });
    
    if (!stream) {
      console.error('[API] POST /api/blocks - Stream not found:', streamId);
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    const block = await prisma.block.create({
      data: {
        streamId,
        type,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        order,
        inContext: body.inContext !== undefined ? body.inContext : true
      }
    });
    
    console.log('[API] POST /api/blocks - Created block:', block.id, block.type);
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/blocks - Error:', error);
    return NextResponse.json(
      { error: 'Failed to create block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
