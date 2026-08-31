// backend/src/services/ai/replicateService.js
const Replicate = require('replicate');

class ReplicateService {
  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!this.apiToken) {
      console.log('⚠️⚠️⚠️ REPLICATE_API_TOKEN NOT SET ⚠️⚠️⚠️');
      console.log('Please add REPLICATE_API_TOKEN to your .env file');
      console.log('Get your token from: https://replicate.com/account/api-tokens');
    } else {
      console.log('✅ Replicate API token found');
      this.replicate = new Replicate({
        auth: this.apiToken,
      });
    }
  }

  // ================================================================
  // 🎨 GENERATE IMAGES WITH ERROR HANDLING
  // ================================================================
  async generateProductImages(prompt, options = {}) {
    // If no API token, return placeholder images
    if (!this.apiToken) {
      console.log('⚠️ No Replicate API token, returning placeholder images');
      return this.getPlaceholderImages(options.numOutputs || 1);
    }

    try {
      console.log(`🎨 Generating image with prompt: ${prompt.substring(0, 80)}...`);

      const output = await this.replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            width: options.width || 1024,
            height: options.height || 768,
            num_outputs: options.numOutputs || 1,
            guidance_scale: 3.5,
            num_inference_steps: 4,
          }
        }
      );

      console.log('📦 Replicate output type:', typeof output);
      console.log('📦 Replicate output:', JSON.stringify(output).substring(0, 200));

      // Parse the output
      let imageUrls = [];
      
      if (Array.isArray(output)) {
        imageUrls = output.filter(url => typeof url === 'string' && url.startsWith('http'));
      } else if (typeof output === 'string' && output.startsWith('http')) {
        imageUrls = [output];
      } else if (output && typeof output === 'object') {
        if (Array.isArray(output.output)) {
          imageUrls = output.output.filter(url => typeof url === 'string');
        } else if (output.url) {
          imageUrls = [output.url];
        } else if (output.image_url) {
          imageUrls = [output.image_url];
        }
      }

      if (imageUrls.length === 0) {
        console.log('⚠️ No image URLs found in output, using placeholders');
        return this.getPlaceholderImages(options.numOutputs || 1);
      }

      console.log(`✅ Generated ${imageUrls.length} images`);
      return imageUrls;
      
    } catch (error) {
      console.error('❌ Replicate API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return this.getPlaceholderImages(options.numOutputs || 1);
    }
  }

  // ================================================================
  // 🖼️ PLACEHOLDER IMAGES
  // ================================================================
  getPlaceholderImages(count = 1) {
    const images = [];
    const placeholders = [
      'https://via.placeholder.com/400x600/FACC15/111111?text=Cover+Image',
      'https://via.placeholder.com/400x600/111111/FACC15?text=Cover+Image+2',
      'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Cover+Image+3',
      'https://via.placeholder.com/400x600/10B981/FFFFFF?text=Cover+Image+4'
    ];
    
    for (let i = 0; i < count; i++) {
      images.push(placeholders[i % placeholders.length]);
    }
    return images;
  }

  // ================================================================
  // 🎨 GENERATE COVER IMAGE (ONLY 1)
  // ================================================================
  async generateCover(productData) {
    const prompt = `Professional ebook cover design for "${productData.title}" in the ${productData.niche} niche. 
    Modern, eye-catching design with bold typography, clean layout, ${productData.tone} style, 
    yellow and dark color scheme, high quality, professional book cover, beautiful composition.`;

    console.log('🎨 Generating cover image...');
    const images = await this.generateProductImages(prompt, { 
      width: 1024, 
      height: 768, 
      numOutputs: 1 
    });
    
    return images;
  }

  // ================================================================
  // 🎨 GENERATE MOCKUP IMAGE (ONLY 1)
  // ================================================================
  async generateMockup(productData) {
    const prompt = `3D product mockup showing a ${productData.type} about "${productData.title}" 
    on a modern desk with laptop, coffee cup, and plants. Professional photography style, 
    studio lighting, clean and minimal, yellow and dark theme, realistic 3D render, 
    lifestyle photography, high quality, product presentation.`;

    console.log('🎨 Generating mockup image...');
    const images = await this.generateProductImages(prompt, { 
      width: 1024, 
      height: 768, 
      numOutputs: 1 
    });
    
    return images;
  }

  // ================================================================
  // 🎨 GENERATE ALL IMAGES (7 TYPES, 1 EACH)
  // ================================================================
  async generateAllImages(productData) {
    console.log('🎨 Generating all images for:', productData.title);
    
    const results = {
      cover: [],
      mockup: [],
      preview: [],
      social: [],
      pinterest: [],
      youtube: [],
      promo: []
    };

    // If no API token, return placeholders for all
    if (!this.apiToken) {
      console.log('⚠️ No Replicate API token, using placeholder images');
      const placeholder = this.getPlaceholderImages(1);
      Object.keys(results).forEach(key => {
        results[key] = placeholder;
      });
      return results;
    }

    try {
      // Generate cover
      console.log('  🎨 Generating cover...');
      results.cover = await this.generateCover(productData);
      console.log(`  ✅ Cover: ${results.cover.length} images`);

      // Generate mockup
      console.log('  🎨 Generating mockup...');
      results.mockup = await this.generateMockup(productData);
      console.log(`  ✅ Mockup: ${results.mockup.length} images`);

      // Generate other images with simplified prompts
      const otherPrompts = {
        preview: `Product preview image for "${productData.title}" on a tablet, lifestyle photography, bright and clean, yellow theme.`,
        social: `Social media graphic for "${productData.title}", bold text, motivational design, yellow and black theme, Instagram style.`,
        pinterest: `Vertical Pinterest pin for "${productData.title}", bold text overlay, beautiful background, yellow accents.`,
        youtube: `YouTube thumbnail for "${productData.title}", dramatic lighting, bold text, yellow and dark theme, high contrast.`,
        promo: `Promotional banner for "${productData.title}", professional design, bold call to action, yellow and dark theme.`
      };

      for (const [key, prompt] of Object.entries(otherPrompts)) {
        console.log(`  🎨 Generating ${key}...`);
        results[key] = await this.generateProductImages(prompt, { width: 1024, height: 768, numOutputs: 1 });
        console.log(`  ✅ ${key}: ${results[key].length} images`);
      }

      console.log('✅ All images generated successfully');
      return results;
      
    } catch (error) {
      console.error('❌ Image generation error:', error);
      // Return placeholders
      const placeholder = this.getPlaceholderImages(1);
      Object.keys(results).forEach(key => {
        results[key] = placeholder;
      });
      return results;
    }
  }
}

module.exports = new ReplicateService();