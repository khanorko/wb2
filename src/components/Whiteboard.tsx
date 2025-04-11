'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from 'react';
import { PostIt } from './PostIt';
import { socket, socketEvents } from '@/lib/socket';

interface Note {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  timer: number;
}

export interface WhiteboardRef {
  handleAddNote: (x: number, y: number) => void;
  getCurrentView: () => { x: number; y: number };
  handleZoom: (newZoom: number) => void;
}

const Whiteboard = forwardRef<WhiteboardRef, {}>((props, ref) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [zoom, setZoom] = useState(100);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleAddNote = (x: number, y: number) => {
    console.log('Adding note at:', x, y);
    const newNote: Note = {
      id: Date.now().toString(),
      x,
      y,
      content: '',
      color: getRandomColor(),
      timer: 20, // 20 seconds lifetime
    };
    console.log('Emitting new note:', newNote);
    socket.emit(socketEvents.ADD_NOTE, newNote);
  };

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
  };

  useImperativeHandle(ref, () => ({
    handleAddNote,
    getCurrentView: () => {
      if (boardRef.current) {
        return {
          x: boardRef.current.scrollLeft,
          y: boardRef.current.scrollTop
        };
      }
      return { x: 0, y: 0 };
    },
    handleZoom
  }));

  useEffect(() => {
    console.log('Setting up socket listeners');
    
    // Initialize socket event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    socket.on(socketEvents.INIT_NOTES, (initialNotes: Note[]) => {
      console.log('Received initial notes:', initialNotes);
      setNotes(initialNotes);
    });

    socket.on(socketEvents.NOTE_ADDED, (note: Note) => {
      console.log('Note added:', note);
      setNotes(prev => [...prev, note]);
    });

    socket.on(socketEvents.NOTE_UPDATED, (updatedNote: Note) => {
      console.log('Note updated:', updatedNote);
      setNotes(prev =>
        prev.map(note => (note.id === updatedNote.id ? updatedNote : note))
      );
    });

    socket.on(socketEvents.NOTE_DELETED, (noteId: string) => {
      console.log('Note deleted:', noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    });

    // Check for view position in URL and scroll to it
    const urlParams = new URLSearchParams(window.location.search);
    const scrollX = parseInt(urlParams.get('x') || '0');
    const scrollY = parseInt(urlParams.get('y') || '0');
    if (boardRef.current && (scrollX || scrollY)) {
      boardRef.current.scrollTo(scrollX, scrollY);
    }

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect');
      socket.off('connect_error');
      socket.off(socketEvents.INIT_NOTES);
      socket.off(socketEvents.NOTE_ADDED);
      socket.off(socketEvents.NOTE_UPDATED);
      socket.off(socketEvents.NOTE_DELETED);
    };
  }, []);

  const handleDeleteNote = (id: string) => {
    console.log('Deleting note:', id);
    socket.emit(socketEvents.DELETE_NOTE, id);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    console.log('Updating note:', id, updates);
    socket.emit(socketEvents.UPDATE_NOTE, { id, ...updates });
  };

  const getRandomColor = () => {
    const colors = ['#FFB3B3', '#B3FFB3', '#B3B3FF', '#FFE4B3'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      ref={boardRef}
      className="relative w-full h-screen overflow-auto bg-white"
      style={{
        backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
        backgroundSize: `${20 * (zoom/100)}px ${20 * (zoom/100)}px`,
        width: '200vw',
        height: '200vh',
        transform: `scale(${zoom/100})`,
        transformOrigin: '0 0'
      }}
    >
      {notes.map(note => (
        <PostIt
          key={note.id}
          {...note}
          onDelete={() => handleDeleteNote(note.id)}
          onUpdate={(updates: Partial<Note>) => handleUpdateNote(note.id, updates)}
        />
      ))}
    </div>
  );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard; 