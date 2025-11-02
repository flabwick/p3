'use client';

import { useState } from 'react';
import StreamsSidebar from '../components/StreamsSidebar';
import StreamView from '../components/StreamView';

export default function Home() {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <StreamsSidebar 
        onSelectStream={setSelectedStreamId} 
        selectedStreamId={selectedStreamId}
      />
      <StreamView streamId={selectedStreamId || ''} />
    </div>
  );
}
