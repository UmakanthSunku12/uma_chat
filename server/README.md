# Chat Server (MongoDB)

This server uses Express + Socket.IO + Mongoose to persist messages in MongoDB.

## Setup

1. Copy `.env.example` to `.env` and edit `MONGODB_URI` if needed.

2. Install dependencies:
```bash
cd server
npm install
```

3. Start a local MongoDB (or use Atlas). Example using Docker:
```bash
docker run -d -p 27017:27017 --name chat-mongo mongo:6
```

4. Run the server:
```bash
npm run dev   # requires nodemon
# or
npm start
```

The server listens on `PORT` (default 4000). Socket.IO endpoint is the same origin (e.g. http://localhost:4000).
