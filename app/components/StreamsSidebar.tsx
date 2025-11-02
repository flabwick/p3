'use client';

import { useState, useEffect } from 'react';

interface Stream {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    blocks: number;
  };
}

interface StreamsSidebarProps {
  onSelectStream: (streamId: string) => void;
  selectedStreamId: string | null;
}

export default function StreamsSidebar({ onSelectStream, selectedStreamId }: StreamsSidebarProps) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      console.log('[StreamsSidebar] Loading streams...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/streams');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load streams');
      }
      
      const data = await response.json();
      console.log('[StreamsSidebar] Loaded streams:', data.length);
      setStreams(data);
    } catch (err) {
      console.error('[StreamsSidebar] Error loading streams:', err);
      setError(err instanceof Error ? err.message : 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!newStreamName.trim()) {
      alert('Please enter a stream name');
      return;
    }

    try {
      console.log('[StreamsSidebar] Creating stream:', newStreamName);
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStreamName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create stream');
      }

      const newStream = await response.json();
      console.log('[StreamsSidebar] Created stream:', newStream.id);
      
      setStreams([newStream, ...streams]);
      setNewStreamName('');
      setIsCreating(false);
      onSelectStream(newStream.id);
    } catch (err) {
      console.error('[StreamsSidebar] Error creating stream:', err);
      alert(err instanceof Error ? err.message : 'Failed to create stream');
    }
  };

  const handleRenameStream = async (id: string) => {
    if (!editingName.trim()) {
      alert('Please enter a stream name');
      return;
    }

    try {
      console.log('[StreamsSidebar] Renaming stream:', id, 'to', editingName);
      const response = await fetch(`/api/streams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rename stream');
      }

      const updatedStream = await response.json();
      console.log('[StreamsSidebar] Renamed stream:', updatedStream.id);
      
      setStreams(streams.map(s => s.id === id ? updatedStream : s));
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      console.error('[StreamsSidebar] Error renaming stream:', err);
      alert(err instanceof Error ? err.message : 'Failed to rename stream');
    }
  };

  const handleDeleteStream = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all its blocks.`)) {
      return;
    }

    try {
      console.log('[StreamsSidebar] Deleting stream:', id);
      const response = await fetch(`/api/streams/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete stream');
      }

      console.log('[StreamsSidebar] Deleted stream:', id);
      setStreams(streams.filter(s => s.id !== id));
      
      if (selectedStreamId === id) {
        onSelectStream(streams.find(s => s.id !== id)?.id || '');
      }
    } catch (err) {
      console.error('[StreamsSidebar] Error deleting stream:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete stream');
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-500">Loading streams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-red-500 text-sm mb-2">Error: {error}</div>
        <button
          onClick={loadStreams}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col h-screen">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Streams</h2>
        
        {isCreating ? (
          <div className="mb-2">
            <input
              type="text"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateStream();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewStreamName('');
                }
              }}
              placeholder="Stream name..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleCreateStream}
                className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewStreamName('');
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Stream
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {streams.length === 0 ? (
          <div className="text-sm text-gray-500">No streams yet. Create one to get started!</div>
        ) : (
          <div className="space-y-1">
            {streams.map(stream => (
              <div
                key={stream.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedStreamId === stream.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-white border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {editingId === stream.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameStream(stream.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingName('');
                        }
                      }}
                      className="w-full px-1 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleRenameStream(stream.id)}
                        className="flex-1 px-1 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="flex-1 px-1 py-0.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => onSelectStream(stream.id)}
                      className="font-medium text-sm mb-1"
                    >
                      {stream.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{stream._count?.blocks || 0} blocks</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(stream.id);
                            setEditingName(stream.name);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStream(stream.id, stream.name);
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
