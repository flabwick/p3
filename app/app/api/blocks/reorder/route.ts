import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST /api/blocks/reorder - Batch update block orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] POST /api/blocks/reorder - Reordering blocks with data:', body);
    
    const { updates } = body;
    
    if (!Array.isArray(updates)) {
      console.error('[API] POST /api/blocks/reorder - Invalid updates:', updates);
      return NextResponse.json(
        { error: 'updates must be an array of {id, order} objects' },
        { status: 400 }
      );
    }
    
    // Validate all updates
    for (const update of updates) {
      if (!update.id || typeof update.id !== 'string') {
        console.error('[API] POST /api/blocks/reorder - Invalid id in update:', update);
        return NextResponse.json(
          { error: 'Each update must have a valid id string' },
          { status: 400 }
        );
      }
      if (typeof update.order !== 'number') {
        console.error('[API] POST /api/blocks/reorder - Invalid order in update:', update);
        return NextResponse.json(
          { error: 'Each update must have a valid order number' },
          { status: 400 }
        );
      }
    }
    
    // Perform batch update in a transaction
    const results = await prisma.$transaction(
      updates.map(update =>
        prisma.block.update({
          where: { id: update.id },
          data: { order: update.order }
        })
      )
    );
    
    console.log(`[API] POST /api/blocks/reorder - Reordered ${results.length} blocks successfully`);
    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('[API] POST /api/blocks/reorder - Error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder blocks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
