'use client';

import { useState, useEffect } from 'react';

interface Block {
  id: string;
  streamId: string;
  type: 'markdown' | 'prompt';
  content: string;
  order: number;
  inContext: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stream {
  id: string;
  name: string;
  blocks: Block[];
}

interface StreamViewProps {
  streamId: string;
}

export default function StreamView({ streamId }: StreamViewProps) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (streamId) {
      loadStream();
    }
  }, [streamId]);

  const loadStream = async () => {
    try {
      console.log('[StreamView] Loading stream:', streamId);
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/streams/${streamId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load stream');
      }

      const data = await response.json();
      console.log('[StreamView] Loaded stream with', data.blocks.length, 'blocks');
      setStream(data);
    } catch (err) {
      console.error('[StreamView] Error loading stream:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stream');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (type: 'markdown' | 'prompt') => {
    try {
      console.log('[StreamView] Adding', type, 'block to stream:', streamId);
      
      const newOrder = stream?.blocks.length || 0;
      const defaultContent = type === 'markdown' ? '' : '';

      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          type,
          content: defaultContent,
          order: newOrder,
          inContext: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create block');
      }

      const newBlock = await response.json();
      console.log('[StreamView] Created block:', newBlock.id);

      // Reload stream to get updated data
      await loadStream();
    } catch (err) {
      console.error('[StreamView] Error adding block:', err);
      alert(err instanceof Error ? err.message : 'Failed to add block');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return;
    }

    try {
      console.log('[StreamView] Deleting block:', blockId);

      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete block');
      }

      console.log('[StreamView] Deleted block:', blockId);
      await loadStream();
    } catch (err) {
      console.error('[StreamView] Error deleting block:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete block');
    }
  };

  const handleToggleInContext = async (blockId: string, currentValue: boolean) => {
    try {
      console.log('[StreamView] Toggling inContext for block:', blockId, 'from', currentValue, 'to', !currentValue);

      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inContext: !currentValue })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update block');
      }

      console.log('[StreamView] Updated block inContext');
      await loadStream();
    } catch (err) {
      console.error('[StreamView] Error toggling inContext:', err);
      alert(err instanceof Error ? err.message : 'Failed to update block');
    }
  };

  const handleMoveBlock = async (blockId: string, direction: 'up' | 'down') => {
    if (!stream) return;

    const blockIndex = stream.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    if (direction === 'up' && blockIndex === 0) return;
    if (direction === 'down' && blockIndex === stream.blocks.length - 1) return;

    try {
      console.log('[StreamView] Moving block:', blockId, direction);

      const newBlocks = [...stream.blocks];
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

      // Swap blocks
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];

      // Update orders
      const updates = newBlocks.map((block, index) => ({
        id: block.id,
        order: index
      }));

      const response = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder blocks');
      }

      console.log('[StreamView] Reordered blocks');
      await loadStream();
    } catch (err) {
      console.error('[StreamView] Error moving block:', err);
      alert(err instanceof Error ? err.message : 'Failed to move block');
    }
  };

  if (!streamId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Select a stream to view its blocks</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading stream...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error: {error}</div>
          <button
            onClick={loadStream}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Stream not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">{stream.name}</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAddBlock('markdown')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Markdown
            </button>
            <button
              onClick={() => handleAddBlock('prompt')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Prompt
            </button>
          </div>
        </div>

        {stream.blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No blocks yet. Add a Markdown or Prompt block to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {stream.blocks.map((block, index) => (
              <div
                key={block.id}
                className={`border rounded-lg p-4 ${
                  block.inContext ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      block.type === 'markdown' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                    }`}>
                      {block.type.toUpperCase()}
                    </span>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={block.inContext}
                        onChange={() => handleToggleInContext(block.id, block.inContext)}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700">In Context</span>
                    </label>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveBlock(block.id, 'up')}
                      disabled={index === 0}
                      className={`px-2 py-1 text-sm rounded ${
                        index === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveBlock(block.id, 'down')}
                      disabled={index === stream.blocks.length - 1}
                      className={`px-2 py-1 text-sm rounded ${
                        index === stream.blocks.length - 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  {block.content ? (
                    <div className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                      {block.content}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-sm">
                      Empty {block.type} block
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Order: {block.order} | Created: {new Date(block.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
