import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/streams/:id - Get a specific stream with its blocks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] GET /api/streams/${id} - Fetching stream`);
    
    const stream = await prisma.stream.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!stream) {
      console.error(`[API] GET /api/streams/${id} - Stream not found`);
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] GET /api/streams/${id} - Found stream with ${stream.blocks.length} blocks`);
    return NextResponse.json(stream);
  } catch (error) {
    console.error(`[API] GET /api/streams/:id - Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/streams/:id - Update stream (rename)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`[API] PATCH /api/streams/${id} - Updating stream with data:`, body);
    
    const { name } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error(`[API] PATCH /api/streams/${id} - Invalid name:`, name);
      return NextResponse.json(
        { error: 'Stream name is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const stream = await prisma.stream.update({
      where: { id },
      data: { name: name.trim() },
      include: {
        _count: {
          select: { blocks: true }
        }
      }
    });
    
    console.log(`[API] PATCH /api/streams/${id} - Updated stream:`, stream.name);
    return NextResponse.json(stream);
  } catch (error) {
    console.error(`[API] PATCH /api/streams/:id - Error:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/streams/:id - Delete a stream
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] DELETE /api/streams/${id} - Deleting stream`);
    
    await prisma.stream.delete({
      where: { id }
    });
    
    console.log(`[API] DELETE /api/streams/${id} - Stream deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API] DELETE /api/streams/:id - Error:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
