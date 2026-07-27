const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  seoScore: {
    type: Number,
    required: true,
  },
  securityScore: {
    type: Number,
    required: true,
  },
  complianceScore: {
    type: Number,
    required: true,
  },
  performanceScore: {
    type: Number,
    required: true,
  },
  issues: {
    type: Array,
    default: [],
  },
  pagesScanned: {
    type: Number,
    default: 1,
  },
  totalPagesFound: {
    type: Number,
    default: 0,
  },
  pageDetails: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ScanResult', scanResultSchema);