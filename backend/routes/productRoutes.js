// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// ================================================================
// PRODUCT CRUD OPERATIONS
// ================================================================

// Create product
router.post('/', productController.createProduct);

// Get user's products
router.get('/', productController.getUserProducts);

// Get product by ID
router.get('/:id', productController.getProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

// ================================================================
// GENERATION ENDPOINTS
// ================================================================

// Start generation
router.post('/:id/generate', productController.startGeneration);

// Get generation progress
router.get('/:id/progress', productController.getProgress);

// Regenerate product
router.post('/:id/regenerate', productController.regenerateProduct);

// Download PDF
router.get('/:id/download', productController.downloadPDF);


// Get marketing content
router.get('/:id/marketing', productController.getMarketingContent);


// Generate cover image
router.post('/:id/generate-cover', productController.generateCoverImage);

// Merge cover with PDF
router.post('/:id/merge-cover', productController.mergeCoverWithPdf);


module.exports = router;