'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

interface PostItProps {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  timer?: number;
  onDelete: () => void;
  onUpdate: (updates: Partial<PostItProps>) => void;
}

export function PostIt({
  id,
  x,
  y,
  content,
  color,
  timer,
  onDelete,
  onUpdate,
}: PostItProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [timeLeft, setTimeLeft] = useState(timer);
  const [isActive, setIsActive] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x, y });

  useEffect(() => {
    currentPosition.current = { x, y };
    setPosition({ x, y });
  }, [x, y]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 0) {
            const newTime = prev - 1;
            if (newTime === 0) onDelete();
            return newTime;
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, onDelete]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;
    
    setIsDragging(true);
    setIsActive(true);
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      dragStart.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && noteRef.current) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      currentPosition.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });
      console.log('Moving to position:', { newX, newY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const finalPosition = currentPosition.current;
      
      console.log('Drag ended. Original position:', { x, y }, 'Final position:', finalPosition);
      
      // Only update if position actually changed
      if (Math.abs(finalPosition.x - x) > 1 || Math.abs(finalPosition.y - y) > 1) {
        console.log('Position changed, sending update for note:', id);
        onUpdate({
          x: finalPosition.x,
          y: finalPosition.y
        });
      } else {
        console.log('Position unchanged, skipping update');
      }
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNoteClick = (e: React.MouseEvent) => {
    if (!isDragging && textareaRef.current && !(e.target instanceof HTMLButtonElement)) {
      setIsActive(true);
      textareaRef.current.focus();
      if (!hasBeenFocused && !content) {
        textareaRef.current.select();
      } else {
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }
    }
  };

  return (
    <div
      ref={noteRef}
      className={`absolute flex flex-col w-40 h-40 p-2 shadow-lg cursor-move transition-shadow ${isActive ? 'shadow-xl' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        backgroundColor: color,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isActive ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleNoteClick}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-medium">
          {timeLeft ? `${timeLeft}s` : ''}
        </div>
        <button
          className="p-1 hover:bg-black/10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="flex-1 w-full bg-transparent resize-none focus:outline-none"
        value={content}
        placeholder={!hasBeenFocused ? "Enter text here" : ""}
        onChange={(e) => {
          onUpdate({ content: e.target.value });
          setHasBeenFocused(true);
        }}
        onFocus={() => setIsActive(true)}
      />
    </div>
  );
} 