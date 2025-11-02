import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// PATCH /api/blocks/:id - Update a block
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`[API] PATCH /api/blocks/${id} - Updating block with data:`, body);
    
    const updateData: any = {};
    
    if (body.content !== undefined) {
      updateData.content = typeof body.content === 'string' ? body.content : JSON.stringify(body.content);
    }
    
    if (body.inContext !== undefined) {
      if (typeof body.inContext !== 'boolean') {
        console.error(`[API] PATCH /api/blocks/${id} - Invalid inContext:`, body.inContext);
        return NextResponse.json(
          { error: 'inContext must be a boolean' },
          { status: 400 }
        );
      }
      updateData.inContext = body.inContext;
    }
    
    if (body.order !== undefined) {
      if (typeof body.order !== 'number') {
        console.error(`[API] PATCH /api/blocks/${id} - Invalid order:`, body.order);
        return NextResponse.json(
          { error: 'order must be a number' },
          { status: 400 }
        );
      }
      updateData.order = body.order;
    }
    
    if (Object.keys(updateData).length === 0) {
      console.error(`[API] PATCH /api/blocks/${id} - No valid fields to update`);
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const block = await prisma.block.update({
      where: { id },
      data: updateData
    });
    
    console.log(`[API] PATCH /api/blocks/${id} - Updated block successfully`);
    return NextResponse.json(block);
  } catch (error) {
    console.error(`[API] PATCH /api/blocks/:id - Error:`, error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/blocks/:id - Delete a block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] DELETE /api/blocks/${id} - Deleting block`);
    
    await prisma.block.delete({
      where: { id }
    });
    
    console.log(`[API] DELETE /api/blocks/${id} - Block deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API] DELETE /api/blocks/:id - Error:`, error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete block', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
