# Whiteboard App (wb2)

A real-time collaborative whiteboard application built with Next.js and Socket.IO. This application allows users to create, move, and share sticky notes in a collaborative workspace.

## Features

- Real-time collaboration using Socket.IO
- Create, move, and delete sticky notes
- Zoom functionality (50% - 200%)
- Share board view with others
- Persistent storage with MongoDB
- Responsive grid layout
- Auto-saving changes

## Tech Stack

- Frontend: Next.js 15.3.0, React 19
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB
- Styling: Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/khanorko/wb2.git
cd wb2
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in the root directory
- Copy `server/.env.example` to `server/.env`
- Update the MongoDB connection string and other variables as needed

4. Run the development servers:

```bash
# Start the frontend (in the root directory)
npm run dev

# Start the backend (in the server directory)
cd server
npm run dev
```

Open [http://localhost:3004](http://localhost:3004) with your browser to see the result.

## Development

- Frontend runs on port 3004 by default
- Backend runs on port 5001 by default
- WebSocket connection is automatically established
- MongoDB is used for persistent storage
- Changes are automatically saved and synchronized between clients

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

The application can be deployed using platforms like:
- [Vercel](https://vercel.com) for the frontend
- [Heroku](https://heroku.com) or similar for the backend
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for the database
