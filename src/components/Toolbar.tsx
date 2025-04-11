'use client';

import { useState } from 'react';
import { FiPlus, FiMinus, FiShare2, FiTrash2 } from 'react-icons/fi';

interface ToolbarProps {
  onAddPostIt?: () => void;
  onShareLocation?: () => void;
  onClearAll?: () => void;
  onZoomChange?: (zoom: number) => void;
  initialZoom?: number;
}

export default function Toolbar({ 
  onAddPostIt, 
  onShareLocation, 
  onClearAll,
  onZoomChange,
  initialZoom = 100 
}: ToolbarProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  return (
    <div className="flex items-center gap-2 bg-white border-b border-gray-200 p-2">
      <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleZoomOut}
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{zoom}%</span>
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={handleZoomIn}
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      <button
        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-sm font-medium rounded"
        onClick={onAddPostIt}
      >
        Add Post-it
      </button>

      <button
        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded flex items-center gap-1"
        onClick={onShareLocation}
      >
        <FiShare2 className="w-4 h-4" />
        Share View
      </button>

      <button
        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded flex items-center gap-1"
        onClick={onClearAll}
      >
        <FiTrash2 className="w-4 h-4" />
        Clear All
      </button>

      <div className="ml-auto text-sm text-gray-500">
        X: {coordinates.x}, Y: {coordinates.y}
      </div>
    </div>
  );
} 