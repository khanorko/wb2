'use client';

import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['polling', 'websocket']
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error: Error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason: string) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

export const socketEvents = {
  INIT_NOTES: 'init-notes',
  ADD_NOTE: 'add-note',
  NOTE_ADDED: 'note-added',
  UPDATE_NOTE: 'update-note',
  NOTE_UPDATED: 'note-updated',
  DELETE_NOTE: 'delete-note',
  NOTE_DELETED: 'note-deleted',
}; 