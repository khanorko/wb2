'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from '../components/Toolbar';
import type { WhiteboardRef } from '../components/Whiteboard';

// Dynamically import the Whiteboard component to avoid SSR issues
const Whiteboard = dynamic(() => import('../components/Whiteboard'), {
  ssr: false,
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const whiteboardRef = useRef<WhiteboardRef>(null);

  useEffect(() => {
    setMounted(true);
    console.log('Page mounted');
  }, []);

  const handleAddPostIt = () => {
    console.log('Add Post-it clicked');
    if (whiteboardRef.current) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      console.log('Adding post-it at center:', { centerX, centerY });
      whiteboardRef.current.handleAddNote(centerX, centerY);
    } else {
      console.error('Whiteboard ref not available');
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (whiteboardRef.current) {
      whiteboardRef.current.handleZoom(newZoom);
    }
  };

  const handleShareView = () => {
    console.log('Share view clicked');
    if (whiteboardRef.current) {
      const { x, y } = whiteboardRef.current.getCurrentView();
      const url = new URL(window.location.href);
      url.searchParams.set('x', x.toString());
      url.searchParams.set('y', y.toString());
      url.searchParams.set('zoom', zoom.toString());
      
      navigator.clipboard.writeText(url.toString())
        .then(() => {
          alert('View URL copied to clipboard!');
        })
        .catch(() => {
          alert('Failed to copy URL. Your current view position is: ' + url.toString());
        });
    }
  };

  const handleClearAll = () => {
    // TODO: Implement clear all
    console.log('Clear all clicked');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Toolbar 
          onAddPostIt={handleAddPostIt}
          onShareLocation={handleShareView}
          onClearAll={handleClearAll}
          onZoomChange={handleZoomChange}
          initialZoom={zoom}
        />
      </div>
      <Whiteboard ref={whiteboardRef} />
    </main>
  );
}
