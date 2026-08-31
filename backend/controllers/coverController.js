// backend/src/controllers/coverController.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const MediaGeneration = require('../models/MediaGeneration');

// ================================================================
// ENHANCE PROMPT WITH DEEPSEEK
// ================================================================

exports.enhancePrompt = async (req, res) => {
  try {
    const { prompt, productType, title, niche } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('📝 Enhancing prompt with DeepSeek...');

    const systemPrompt = `You are an expert prompt engineer for AI image generation. Enhance the user's prompt to create a professional book cover design.

IMPORTANT RULES:
- NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS in the image
- NO book titles, NO headings, NO subtitles
- NO watermarks, NO signatures, NO logos
- NO typography of any kind
- ONLY visual imagery, graphics, and illustrations
- Focus on composition, colors, style, mood
- Include specific visual elements, color palette, lighting, and composition
- Make it suitable for a book cover (portrait orientation)
- Leave negative space for text overlay

Product Details (if provided):
- Title: ${title || 'Not specified'}
- Type: ${productType || 'Not specified'}
- Niche: ${niche || 'Not specified'}

User's prompt: "${prompt}"

Return ONLY the enhanced prompt as a single string. No JSON, no explanation, no markdown.`;

    const response = await axios.post(
      process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Enhance this prompt to create a stunning book cover: "${prompt}"`
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let enhancedPrompt = response.data.choices[0].message.content.trim();
    enhancedPrompt = enhancedPrompt.replace(/```/g, '').replace(/["']/g, '').trim();

    console.log('✅ Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');

    res.json({
      success: true,
      data: {
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
      }
    });

  } catch (error) {
    console.error('❌ Enhance prompt failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// GENERATE COVER IMAGE WITH REPLICATE
// ================================================================

exports.generateCoverImage = async (req, res) => {
  try {
    const { prompt, aspectRatio = 'portrait', productId = null, type = 'cover' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🎨 Generating cover image with Replicate...');

    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'REPLICATE_API_KEY not configured'
      });
    }

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create MediaGeneration record
    const mediaRecord = new MediaGeneration({
      userId: req.user.id,
      generationId: generationId,
      type: type,
      prompt: prompt,
      status: 'pending',
      predictionId: '',
      metadata: {
        aspectRatio: aspectRatio,
        productId: productId,
        source: 'replicate',
        model: 'sdxl',
      }
    });

    await mediaRecord.save();
    console.log(`📝 Media record created: ${generationId}`);

    // Set dimensions based on aspect ratio
    let width = 768;
    let height = 1024;

    if (aspectRatio === 'square') {
      width = 1024;
      height = 1024;
    } else if (aspectRatio === 'wide') {
      width = 1024;
      height = 768;
    }

    const modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: modelVersion,
        input: {
          prompt: prompt,
          negative_prompt: "text, words, letters, numbers, typography, writing, watermark, signature, logo, branding, title, heading, subtitle, label, caption, any text, any writing, any letters, any numbers, low quality, blurry, ugly, deformed, distorted",
          width: width,
          height: height,
          num_outputs: 1,
          scheduler: "K_EULER_ANCESTRAL",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const predictionId = response.data.id;
    console.log(`  ✅ Prediction created: ${predictionId}`);

    mediaRecord.predictionId = predictionId;
    mediaRecord.status = 'processing';
    await mediaRecord.save();

    // Poll for completion
    const result = await pollForImage(predictionId);

    if (result.success) {
      // ✅ FIXED: Save to backend/public/images/generations/
      const savedPath = await saveImageToGenerations(result.imageUrl, generationId);

      mediaRecord.imagePath = savedPath;
      mediaRecord.status = 'completed';
      mediaRecord.completedAt = new Date();
      await mediaRecord.save();

      if (productId) {
        await Product.findByIdAndUpdate(productId, {
          coverImage: savedPath,
          tempCoverImage: savedPath,
        });
      }

      res.json({
        success: true,
        data: {
          generationId: generationId,
          predictionId: predictionId,
          imagePath: savedPath,
          imageUrl: result.imageUrl,
          status: 'completed',
        }
      });
    } else {
      mediaRecord.status = 'failed';
      mediaRecord.error = result.error || 'Generation failed';
      await mediaRecord.save();

      res.status(500).json({
        success: false,
        message: result.error || 'Image generation failed'
      });
    }

  } catch (error) {
    console.error('❌ Generate cover failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// POLL FOR IMAGE
// ================================================================

async function pollForImage(predictionId, maxAttempts = 60) {
  const apiKey = process.env.REPLICATE_API_KEY;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        }
      );

      const data = response.data;
      console.log(`    ⏳ Polling... (${i + 1}/${maxAttempts}) Status: ${data.status}`);

      if (data.status === 'succeeded') {
        const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
        return { success: true, imageUrl };
      } else if (data.status === 'failed') {
        return { success: false, error: data.error || 'Image generation failed' };
      }
    } catch (error) {
      if (i === maxAttempts - 1) {
        return { success: false, error: 'Polling timed out' };
      }
    }
  }

  return { success: false, error: 'Max attempts reached' };
}

// ================================================================
// ✅ FIXED: SAVE IMAGE TO backend/public/images/generations/
// ================================================================

async function saveImageToGenerations(imageUrl, generationId) {
  try {
    // Download image from Replicate URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    // ✅ CORRECT PATH: backend/public/images/generations/
    // __dirname = backend/src/controllers
    // Go up one level: backend/src -> backend (using '..')
    // Then go to public/images/generations
    const generationsDir = path.join(__dirname, '../public/images/generations');
    
    console.log(`📁 Saving to: ${generationsDir}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(generationsDir)) {
      fs.mkdirSync(generationsDir, { recursive: true });
      console.log(`📁 Created directory: ${generationsDir}`);
    }

    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `generation_${generationId}_${timestamp}_${random}.png`;
    const filePath = path.join(generationsDir, filename);

    // Save file to disk
    fs.writeFileSync(filePath, Buffer.from(response.data));
    console.log(`  💾 Image saved: ${filePath}`);

    // ✅ Return relative path: images/generations/filename.png
    const relativePath = `images/generations/${filename}`;
    console.log(`  📍 Relative path stored in DB: ${relativePath}`);

    return relativePath;
  } catch (error) {
    console.error('❌ Failed to save image:', error.message);
    return null;
  }
}

// ================================================================
// GET PREDICTION STATUS
// ================================================================

exports.getPredictionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.REPLICATE_API_KEY;

    const response = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Get prediction failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// SAVE COVER IMAGE
// ================================================================

exports.saveCoverImage = async (req, res) => {
  try {
    const { imageUrl, productId, generationId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // ✅ Save to backend/public/images/generations/
    const savedPath = await saveImageToGenerations(imageUrl, generationId || `save_${Date.now()}`);

    if (generationId) {
      await MediaGeneration.findOneAndUpdate(
        { generationId: generationId, userId: req.user.id },
        {
          imagePath: savedPath,
          status: 'saved',
          updatedAt: new Date(),
        }
      );
    }

    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        coverImage: savedPath,
        tempCoverImage: savedPath,
      });
    }

    res.json({
      success: true,
      data: {
        path: savedPath,
        url: `${process.env.SERVER_URL || 'http://localhost:5000'}/${savedPath}`,
      }
    });

  } catch (error) {
    console.error('❌ Save cover failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// GET USER'S GENERATIONS
// ================================================================

exports.getUserGenerations = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const userId = req.user.id;

    console.log(`📋 Fetching generations for user: ${userId}`);

    const query = { userId };
    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const generations = await MediaGeneration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MediaGeneration.countDocuments(query);

    console.log(`✅ Found ${generations.length} generations`);

    res.json({
      success: true,
      data: {
        generations: generations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit)),
        }
      }
    });

  } catch (error) {
    console.error('❌ Get generations failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// GET GENERATION BY ID
// ================================================================

exports.getGenerationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const generation = await MediaGeneration.findOne({ generationId: id, userId });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    res.json({
      success: true,
      data: generation
    });

  } catch (error) {
    console.error('❌ Get generation failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================================================
// DELETE GENERATION
// ================================================================

exports.deleteGeneration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const generation = await MediaGeneration.findOne({ generationId: id, userId });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    // ✅ Delete file from backend/public/images/generations/
    if (generation.imagePath) {
      try {
        const fullPath = path.join(__dirname, '../public', generation.imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`🗑️ Deleted file: ${fullPath}`);
        }
      } catch (error) {
        console.warn('Could not delete file:', error.message);
      }
    }

    await generation.deleteOne();

    res.json({
      success: true,
      message: 'Generation deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete generation failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};