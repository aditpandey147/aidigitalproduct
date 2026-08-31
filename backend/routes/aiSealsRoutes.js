// backend/src/routes/aiSealsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiSealsController = require('../controllers/aiSealsController');

// ================================================================
// AI SEALS ROUTES
// ================================================================

// Generate listing materials (No DB save)
router.post('/generate', auth, aiSealsController.generateListingMaterials);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI Seals routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;