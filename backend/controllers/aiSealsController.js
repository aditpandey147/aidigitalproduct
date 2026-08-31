// backend/src/controllers/aiSealsController.js
const axios = require('axios');
const Product = require('../models/Product');

// ================================================================
// GENERATE LISTING MATERIALS (No DB Save)
// ================================================================

exports.generateListingMaterials = async (req, res) => {
  try {
    const { productId, platform = 'amazon', language = 'en' } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    console.log(`🔍 Generating listing materials for product: ${productId}`);

    // Get product from database
    const product = await Product.findOne({ 
      _id: productId, 
      userId: req.user.id 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`📦 Product found: ${product.title}`);

    // Generate materials based on product data
    const materials = await generateAIMaterials(product, platform, language);

    // ✅ Return materials - NOT saving to database
    res.json({
      success: true,
      data: {
        productId: product._id,
        productTitle: product.title,
        productNiche: product.niche || 'Not specified',
        productCategory: product.category || 'Not specified',
        coverImage: product.coverImage || product.tempCoverImage || null,
        platform: platform,
        language: language,
        generatedAt: new Date().toISOString(),
        materials: materials
      }
    });

  } catch (error) {
    console.error('❌ Generate listing materials failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// GENERATE AI MATERIALS
// ================================================================

async function generateAIMaterials(product, platform, language) {
  const prompt = buildPrompt(product, platform, language);

  console.log('📝 Sending prompt to AI...');

  try {
    // Try using DeepSeek API first
    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert e-commerce copywriter and SEO specialist. Generate complete product listing materials for ${platform}. 
            Return ONLY valid JSON. No markdown, no explanation, no code blocks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let result = response.data.choices[0].message.content.trim();
    
    // Clean the response if it contains markdown
    result = cleanAIResponse(result);
    
    const parsedResult = JSON.parse(result);
    return parsedResult;

  } catch (error) {
    console.error('❌ AI generation failed:', error.message);
    
    // Fallback to mock data if API fails
    return generateMockMaterials(product, platform);
  }
}

// ================================================================
// BUILD PROMPT
// ================================================================

function buildPrompt(product, platform, language) {
  return `
Generate complete product listing materials for the following product:

PRODUCT INFORMATION:
- Title: ${product.title || 'Not specified'}
- Description: ${product.description || 'Not specified'}
- Niche: ${product.niche || 'Not specified'}
- Category: ${product.category || 'Not specified'}
- Target Audience: ${product.targetAudience || 'Not specified'}
- Price: ${product.price || 'Not specified'}
- Platform: ${platform}
- Language: ${language}

Please generate the following listing materials in JSON format:

{
  "title": "An SEO-optimized, click-worthy title (max 150 characters)",
  "subtitle": "A compelling subtitle or tagline (max 100 characters)",
  "bulletPoints": [
    "Bullet point 1 - Key benefit",
    "Bullet point 2 - Feature",
    "Bullet point 3 - Advantage",
    "Bullet point 4 - Result",
    "Bullet point 5 - Guarantee"
  ],
  "description": "A detailed, persuasive product description (300-500 words) that tells a story, addresses pain points, and highlights benefits.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "targetAudience": ["Audience segment 1", "Audience segment 2", "Audience segment 3"],
  "seoTitle": "SEO-optimized title for search engines (max 60 characters)",
  "seoDescription": "SEO meta description (max 160 characters)",
  "productSpecs": {
    "format": "e.g., Digital Download, PDF, eBook",
    "fileSize": "e.g., 5 MB",
    "pages": "Number of pages if applicable",
    "language": "${language}"
  },
  "pricing": {
    "regularPrice": "Original price",
    "salePrice": "Discounted price if applicable",
    "currency": "USD"
  },
  "upsell": ["Upsell product 1", "Upsell product 2"],
  "testimonials": [
    {
      "name": "Customer Name",
      "rating": 5,
      "review": "Testimonial text"
    },
    {
      "name": "Customer Name",
      "rating": 5,
      "review": "Testimonial text"
    }
  ],
  "faq": [
    {
      "question": "Frequently asked question 1",
      "answer": "Answer to question 1"
    },
    {
      "question": "Frequently asked question 2",
      "answer": "Answer to question 2"
    }
  ]
}

Make the content persuasive, SEO-optimized, and tailored specifically for ${platform}. Use ${language} language.
The content should convert visitors into buyers. Focus on benefits, solve problems, and build trust.
`;
}

// ================================================================
// CLEAN AI RESPONSE
// ================================================================

function cleanAIResponse(response) {
  // Remove markdown code blocks
  response = response.replace(/```json/g, '');
  response = response.replace(/```javascript/g, '');
  response = response.replace(/```/g, '');
  
  // Remove any leading/trailing whitespace
  response = response.trim();
  
  // Find JSON object if there's extra text
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    response = jsonMatch[0];
  }
  
  return response;
}

// ================================================================
// GENERATE MOCK MATERIALS (Fallback)
// ================================================================

function generateMockMaterials(product, platform) {
  const title = product.title || 'Amazing Product';
  const niche = product.niche || 'success';
  
  return {
    title: `${title} - The Ultimate Solution for Your ${niche} Journey`,
    subtitle: `Transform Your ${niche} with This Powerful ${product.category || 'Tool'}`,
    bulletPoints: [
      `✅ Achieve remarkable results with our proven ${title} system`,
      `✅ Simple and easy to use - get started in minutes`,
      `✅ Backed by years of research and development`,
      `✅ Trusted by thousands of satisfied customers worldwide`,
      `✅ 100% money-back guarantee - risk-free purchase`
    ],
    description: `Discover the power of ${title} and transform your ${niche} today. 
    
After years of research and testing, we've developed the ultimate solution to help you achieve your goals faster and easier than ever before.

With ${title}, you'll be able to:
• Solve your biggest challenges with ease
• Achieve results you never thought possible
• Join thousands of satisfied customers

Don't wait - start your journey to success today!`,
    keywords: [niche, 'solution', 'success', 'transform', 'results', 'benefits', 'improve', 'achieve', 'excellence', 'quality'],
    benefits: [
      'Save time and effort with our proven system',
      'Achieve better results faster than ever before',
      'Reduce stress and anxiety with our simple approach',
      'Increase your productivity and efficiency',
      'Get more value for your money'
    ],
    features: [
      'User-friendly interface - no experience needed',
      'Professional quality that exceeds expectations',
      'Instant download access - get started immediately',
      'Lifetime updates and improvements included',
      'Expert support team ready to help you'
    ],
    targetAudience: [
      'Beginners looking for an easy solution',
      'Professionals seeking to improve results',
      'Anyone wanting to achieve their goals'
    ],
    seoTitle: `${title} | Ultimate ${niche} Solution for Success`,
    seoDescription: `Discover the best ${title} for ${niche}. Get started today and transform your ${niche} with our proven system.`,
    productSpecs: {
      format: 'Digital Download (PDF + Resources)',
      fileSize: '15 MB',
      pages: '150+ pages of valuable content',
      language: 'English'
    },
    pricing: {
      regularPrice: '$47.00',
      salePrice: '$27.00',
      currency: 'USD'
    },
    upsell: [
      'Premium Guide + Workbook Bundle',
      'One-on-One Coaching Session',
      'Complete Video Course Library'
    ],
    testimonials: [
      {
        name: 'Sarah Johnson',
        rating: 5,
        review: 'This product completely changed my life! I can\'t believe I waited so long to try it. Highly recommended!'
      },
      {
        name: 'Michael Chen',
        rating: 5,
        review: 'Absolutely incredible results. I\'ve recommended this to all my friends and family. Best investment ever!'
      }
    ],
    faq: [
      {
        question: 'How long does it take to see results?',
        answer: 'Most customers start seeing results within the first week of using our product. However, individual results may vary based on application.'
      },
      {
        question: 'Is there a money-back guarantee?',
        answer: 'Yes! We offer a 100% money-back guarantee for 60 days. If you\'re not completely satisfied, we\'ll refund your purchase no questions asked.'
      }
    ]
  };
}