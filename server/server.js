require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

io.on('connection', socket => {
  console.log('socket connected:', socket.id);

  // send recent messages (last 200)
  Message.find().sort({ ts: 1 }).limit(200).lean().exec()
    .then(history => {
      socket.emit('history', history.map(m => ({ id: m._id, username: m.username, text: m.text, ts: m.ts })));
    }).catch(err => {
      console.error('Failed to load history', err);
      socket.emit('history', []);
    });

  socket.on('join', (username) => {
    socket.data.username = username || 'Anonymous';
    socket.broadcast.emit('system', `${socket.data.username} joined the chat.`);
  });

  socket.on('sendMessage', async (payload) => {
    const text = (payload && payload.text) ? payload.text : '';
    if (!text || typeof text !== 'string') return;
    const msgDoc = new Message({
      username: socket.data.username || 'Anonymous',
      text: text,
      ts: new Date()
    });
    try {
      const saved = await msgDoc.save();
      const msg = { id: saved._id, username: saved.username, text: saved.text, ts: saved.ts };
      // trim to last 200 messages in DB (optional maintenance)
      // emit to everyone
      io.emit('message', msg);
    } catch (err) {
      console.error('Failed to save message', err);
    }
  });

  socket.on('disconnect', (reason) => {
    if (socket.data.username) {
      socket.broadcast.emit('system', `${socket.data.username} left the chat.`);
    }
    console.log('socket disconnected:', socket.id, reason);
  });
});

app.get('/', (req, res) => res.send({ status: 'ok', timestamp: new Date().toISOString() }));

server.listen(PORT, () => console.log(`Chat server running on port ${PORT}`));
