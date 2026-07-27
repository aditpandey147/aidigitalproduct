const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  scanType: {
    type: String,
    enum: ['automated', 'manual'],
    default: 'automated'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'running'],
    default: 'running'
  },
  issuesFound: {
    type: Number,
    default: 0
  },
  criticalIssues: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('AutomationLog', automationLogSchema);