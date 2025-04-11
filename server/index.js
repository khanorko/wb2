const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Allow all origins in development
const isDev = process.env.NODE_ENV === 'development';
const corsOptions = {
  origin: isDev ? true : ['http://localhost:3000', 'http://localhost:3004'],
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// In-memory storage for notes when MongoDB is not available
let notes = [];

// Note Schema
const noteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  content: { type: String, default: '' },
  color: { type: String, required: true },
  timer: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// MongoDB connection with better error handling and retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('Connected to MongoDB');
    
    // If connection successful, load notes from MongoDB to memory
    const savedNotes = await Note.find({});
    notes = savedNotes;
    console.log(`Loaded ${notes.length} notes from MongoDB`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Using in-memory storage instead');
  }
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: corsOptions.origin
}));
app.use(express.json());

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send all existing notes to the newly connected client
  socket.emit('init-notes', notes);

  socket.on('add-note', async (note) => {
    try {
      if (mongoose.connection.readyState === 1) {
        // Save to MongoDB
        const newNote = new Note(note);
        await newNote.save();
        console.log('Note saved to MongoDB:', note.id);
      }
      // Add to in-memory storage
      notes.push(note);
      io.emit('note-added', note);
    } catch (err) {
      console.error('Error saving note:', err);
      // Still add to in-memory storage and emit event
      notes.push(note);
      io.emit('note-added', note);
    }
  });

  socket.on('update-note', async ({ id, ...updates }) => {
    try {
      console.log('Received note update request:', { id, updates });

      // Validate the note exists
      const existingNote = notes.find(note => note.id === id);
      if (!existingNote) {
        console.error('Note not found for update:', id);
        socket.emit('error', { message: 'Note not found' });
        return;
      }

      // Validate position updates if present
      if ('x' in updates || 'y' in updates) {
        const oldPos = { x: existingNote.x, y: existingNote.y };
        const newPos = { 
          x: updates.x ?? existingNote.x,
          y: updates.y ?? existingNote.y
        };
        
        console.log('Position update:', {
          noteId: id,
          from: oldPos,
          to: newPos,
          delta: {
            x: newPos.x - oldPos.x,
            y: newPos.y - oldPos.y
          }
        });
      }

      // Create the updated note with all fields
      const updatedNote = {
        ...existingNote,
        ...updates,
        id  // Ensure id is preserved
      };

      // Update in MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        const result = await Note.findOneAndUpdate(
          { id },
          { $set: updates },
          { new: true }
        );
        console.log('MongoDB update result:', result ? 'success' : 'failed');
      }

      // Update in-memory storage
      const noteIndex = notes.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        notes[noteIndex] = updatedNote;
      }

      // Broadcast the update to all clients
      io.emit('note-updated', updatedNote);
      console.log('Update broadcast complete for note:', id);
    } catch (err) {
      console.error('Error updating note:', id, err);
      socket.emit('error', { message: 'Failed to update note', error: err.message });
    }
  });

  socket.on('delete-note', async (noteId) => {
    try {
      if (mongoose.connection.readyState === 1) {
        // Delete from MongoDB
        await Note.findOneAndDelete({ id: noteId });
        console.log('Note deleted from MongoDB:', noteId);
      }
      // Delete from in-memory storage
      notes = notes.filter(note => note.id !== noteId);
      io.emit('note-deleted', noteId);
    } catch (err) {
      console.error('Error deleting note:', err);
      // Still delete from in-memory storage and emit event
      notes = notes.filter(note => note.id !== noteId);
      io.emit('note-deleted', noteId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Clean up expired notes (older than 24 hours)
setInterval(async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (mongoose.connection.readyState === 1) {
      // Clean up in MongoDB
      await Note.deleteMany({ 
        createdAt: { $lt: twentyFourHoursAgo },
        timer: { $exists: true, $ne: null }  // Only delete notes with timers
      });
    }
    
    // Clean up in-memory storage
    notes = notes.filter(note => {
      if (!note.timer) return true; // Keep notes without timers
      return new Date(note.createdAt) > twentyFourHoursAgo;
    });
    
  } catch (err) {
    console.error('Error cleaning up expired notes:', err);
  }
}, 60 * 60 * 1000); // Check every hour

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 