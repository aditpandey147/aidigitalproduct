const Alert = require('../models/Alert');

// Get all alerts for the user
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    
    console.log(`📋 Found ${alerts.length} alerts for user ${req.user.id}`);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread alerts count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark single alert as read
exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert marked as read', alert });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all alerts as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Alert.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete all alerts
exports.deleteAllAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({ userId: req.user.id });
    res.json({ message: 'All alerts deleted' });
  } catch (error) {
    console.error('Delete all alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create alert (internal function)
const createAlert = async (userId, websiteId, message, severity) => {
  try {
    const alert = new Alert({
      userId,
      websiteId,
      message,
      severity,
      isRead: false,
      createdAt: new Date()
    });
    await alert.save();
    console.log(`🔔 Alert created: ${severity} - ${message.substring(0, 50)}...`);
    return alert;
  } catch (error) {
    console.error('Create alert error:', error);
    return null;
  }
};

// Test endpoint - Create sample alerts
exports.createTestAlerts = async (req, res) => {
  try {
    // Clear old test alerts first (optional)
    // await Alert.deleteMany({ userId: req.user.id, message: { $regex: 'Test alert' } });
    
    const sampleAlerts = [
      {
        userId: req.user.id,
        websiteId: null,
        message: '🔴 CRITICAL: SSL certificate will expire in 3 days! Renew immediately to avoid security warnings.',
        severity: 'Critical',
        isRead: false
      },
      {
        userId: req.user.id,
        websiteId: null,
        message: '🟡 WARNING: Missing meta description on homepage - This affects SEO rankings.',
        severity: 'Warning',
        isRead: false
      },
      {
        userId: req.user.id,
        websiteId: null,
        message: '🔵 INFO: Cookie banner not detected - GDPR compliance recommended.',
        severity: 'Info',
        isRead: false
      },
      {
        userId: req.user.id,
        websiteId: null,
        message: '✅ Scan completed: No critical issues found on your website.',
        severity: 'Info',
        isRead: false
      },
      {
        userId: req.user.id,
        websiteId: null,
        message: '🔴 CRITICAL: Security headers missing (CSP, HSTS) - Your website is vulnerable.',
        severity: 'Critical',
        isRead: false
      }
    ];
    
    const created = [];
    for (const alert of sampleAlerts) {
      const newAlert = new Alert(alert);
      await newAlert.save();
      created.push(newAlert);
    }
    
    console.log(`✅ Created ${created.length} test alerts for user ${req.user.id}`);
    res.json({ 
      success: true, 
      message: `Created ${created.length} test alerts`,
      alerts: created 
    });
  } catch (error) {
    console.error('Create test alerts error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAlerts: exports.getAlerts,
  getUnreadCount: exports.getUnreadCount,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead,
  deleteAlert: exports.deleteAlert,
  deleteAllAlerts: exports.deleteAllAlerts,
  createTestAlerts: exports.createTestAlerts,
  createAlert
};