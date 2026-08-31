// backend/routes/platformRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTrendingByPlatform,
  getAllPlatforms,
  getAllTrending,
  getFeaturedProducts
} = require('../controllers/platformController');

// ✅ Get all trending products
router.get('/trending/all', getAllTrending);

// ✅ Get featured products
router.get('/featured', getFeaturedProducts);

// Get all platforms with trending
router.get('/', getAllPlatforms);

// Get trending by specific platform
router.get('/:platform/trending', getTrendingByPlatform);

module.exports = router;