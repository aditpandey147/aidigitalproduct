// backend/src/routes/coverRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const coverController = require('../controllers/coverController');

// ================================================================
// COVER DESIGN ROUTES
// ================================================================

// Enhance prompt with DeepSeek
router.post('/enhance', auth, coverController.enhancePrompt);

// Generate cover image with Replicate
router.post('/generate', auth, coverController.generateCoverImage);

// Get prediction status
router.get('/status/:id', auth, coverController.getPredictionStatus);

// Save cover image
router.post('/save', auth, coverController.saveCoverImage);

// ================================================================
// MEDIA GENERATION MANAGEMENT
// ================================================================

// Get user's generations
router.get('/generations', auth, coverController.getUserGenerations);

// Get generation by ID
router.get('/generations/:id', auth, coverController.getGenerationById);

// Delete generation
router.delete('/generations/:id', auth, coverController.deleteGeneration);

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cover routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;