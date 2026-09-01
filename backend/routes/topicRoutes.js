// backend/routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateTopics } = require('../controllers/topicController');

// ================================================================
// TOPIC ROUTES
// ================================================================

// Generate topics
router.post('/generate', auth, generateTopics);

module.exports = router;