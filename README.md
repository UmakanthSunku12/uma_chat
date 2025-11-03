# Chat App (MongoDB) - Package

This archive contains a full-stack chat app with persistent storage using MongoDB.

## Contents
- server/  — Express + Socket.IO + Mongoose server
- client/  — React (Vite) + Socket.IO client
- docker-compose.yml — optional: bring up a local MongoDB quickly

## Quick start (local)

1. Start MongoDB (use docker-compose or your own):
```bash
docker-compose up -d
```

2. Start server:
```bash
cd server
cp .env.example .env
# edit .env if necessary (MONGODB_URI)
npm install
npm run dev
```

3. Start client:
```bash
cd client
npm install
npm run dev
```

Open the client (Vite) in the browser (usually http://localhost:5173).

## Notes
- The server will persist messages into MongoDB (collection `messages`).
- Socket.IO is used for real-time messaging.
- For production, secure CORS/origins, add authentication, and use a managed MongoDB or Atlas.
