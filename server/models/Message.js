const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  username: { type: String, default: 'Anonymous' },
  text: { type: String, required: true },
  ts: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
