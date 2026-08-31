// backend/controllers/platformController.js
const ProductPlatform = require('../models/ProductPlatform');

// ================================================================
// GET TRENDING BY PLATFORM
// ================================================================

exports.getTrendingByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const trending = await ProductPlatform.find({
      platform: platform,
      isActive: true,
      isPublished: true
    })
    .sort({ salesCount: -1 })
    .limit(20)
    .select('title description price rating reviewCount salesCount coverUrl productType platform');

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('❌ Get trending failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// GET ALL PLATFORMS
// ================================================================

exports.getAllPlatforms = async (req, res) => {
  try {
    const platforms = ['books', 'gumroad', 'payhip', 'etsy', 'shopify', 'selz', 'ko-fi'];
    
    const result = {};
    const allProducts = [];
    
    for (const platform of platforms) {
      const trending = await ProductPlatform.find({
        platform: platform,
        isActive: true,
        isPublished: true
      })
      .sort({ salesCount: -1 })
      .limit(10)
      .select('title description price rating reviewCount salesCount coverUrl productType platform');
      
      result[platform] = trending;
      
      if (Array.isArray(trending)) {
        allProducts.push(...trending);
      }
    }

    allProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

    res.json({
      success: true,
      data: {
        byPlatform: result,
        all: allProducts
      }
    });
  } catch (error) {
    console.error('❌ Get platforms failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// ✅ GET ALL TRENDING PRODUCTS (NEW)
// ================================================================

exports.getAllTrending = async (req, res) => {
  try {
    const trending = await ProductPlatform.find({
      isActive: true,
      isPublished: true
    })
    .sort({ salesCount: -1 })
    .limit(50)
    .select('title description price rating reviewCount salesCount coverUrl productType platform');

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('❌ Get all trending failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// ✅ GET FEATURED PRODUCTS (NEW)
// ================================================================

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await ProductPlatform.find({
      isActive: true,
      isPublished: true,
      rating: { $gte: 4.5 }
    })
    .sort({ salesCount: -1, rating: -1 })
    .limit(6)
    .select('title description price rating reviewCount salesCount coverUrl productType platform');

    res.json({
      success: true,
      data: featured
    });
  } catch (error) {
    console.error('❌ Get featured failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};