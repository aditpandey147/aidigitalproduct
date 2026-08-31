// backend/src/routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// ✅ Import controller - Make sure the path is correct
const templateController = require('../controllers/templateController');

// ================================================================
// TEMPLATE ROUTES
// ================================================================

// Get all templates (with optional filters)
router.get('/', auth, templateController.getTemplates);


// Get template categories
router.get('/categories', auth, templateController.getCategories);

// Get single template
router.get('/:id', auth, templateController.getTemplate);

// Download template
router.get('/:id/download', auth, templateController.downloadTemplate);

// Preview template
router.get('/:id/preview', auth, templateController.previewTemplate);

module.exports = router;