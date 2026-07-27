const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAlerts,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteAlert,
  deleteAllAlerts,
  createTestAlerts
} = require('../controllers/alertController');

// Get all alerts
router.get('/', auth, getAlerts);

// Get unread count
router.get('/unread/count', auth, getUnreadCount);

// Mark alert as read
router.put('/:id/read', auth, markAsRead);

// Mark all alerts as read
router.put('/read/all', auth, markAllAsRead);

// Delete alert
router.delete('/:id', auth, deleteAlert);

// Delete all alerts
router.delete('/', auth, deleteAllAlerts);

// Test endpoint - Create sample alerts (remove in production)
router.post('/test-create', auth, createTestAlerts);

module.exports = router;