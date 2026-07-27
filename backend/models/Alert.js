// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Critical', 'Warning', 'Info'],
    default: 'Info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);