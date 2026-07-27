const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Simple test endpoint first
router.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Image analyzer route is working!',
    time: new Date().toISOString()
  });
});

// Analyze website for missing alt text
router.post('/analyze-images', auth, async (req, res) => {
  console.log('=== IMAGE ANALYZER HIT ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user.id);
  
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  try {
    // Fetch the website
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ComplyZoBot/1.0)'
      }
    });
    
    const html = response.data;
    
    // Find all images
    const imgRegex = /<img[^>]+>/gi;
    const altRegex = /alt=["']([^"']*)["']/i;
    const srcRegex = /src=["']([^"']*)["']/i;
    
    const images = [];
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(srcRegex);
      const altMatch = imgTag.match(altRegex);
      
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const hasAlt = alt !== undefined && alt !== '';
      
      // Generate suggested alt text
      let suggestedAlt = '';
      if (src) {
        const filename = src.split('/').pop().split('.')[0];
        suggestedAlt = filename.replace(/[-_]/g, ' ').toLowerCase();
        suggestedAlt = suggestedAlt.charAt(0).toUpperCase() + suggestedAlt.slice(1);
      }
      
      if (!suggestedAlt || suggestedAlt === '') {
        suggestedAlt = 'Image needs description';
      }
      
      images.push({
        src: src,
        alt: alt || '',
        hasAlt: hasAlt,
        suggestedAlt: suggestedAlt,
        severity: !hasAlt ? 'Critical' : 'Good'
      });
    }
    
    const missingAltImages = images.filter(img => !img.hasAlt);
    
    console.log(`Found ${images.length} images, ${missingAltImages.length} missing alt text`);
    
    res.json({
      success: true,
      url: url,
      totalImages: images.length,
      missingAltCount: missingAltImages.length,
      images: missingAltImages,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to analyze website. Please check the URL.'
    });
  }
});

module.exports = router;