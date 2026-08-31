// backend/services/generation/coverImageGenerator.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CoverImageGenerator {
  constructor(productData) {
    this.productData = productData;
    this.lastRequestTime = 0;
    this.minDelay = 3000;
  }

  // ================================================================
  // GENERATE ALL IMAGES - MAIN METHOD
  // ================================================================

  async generateAllImages() {
    console.log('🎨 Generating all images...');

    const prompts = await this._getAllPromptsFromDeepSeek();

    if (!prompts) {
      console.warn('⚠️ Failed to generate prompts from DeepSeek');
      return null;
    }

    console.log(`📝 Generated prompts`);

    const results = {
      coverImage: null,
      mockups: [],
      posters: [],
    };

    if (prompts.cover) {
      console.log('  🖼️ Generating cover image...');
      results.coverImage = await this._generateImageWithReplicate(
        prompts.cover,
        'portrait'
      );
      await this._waitForRateLimit();
    }

    for (let i = 0; i < Math.min(prompts.mockups?.length || 0, 2); i++) {
      console.log(`  📱 Generating mockup ${i + 1}...`);
      await this._waitForRateLimit();
      const imageUrl = await this._generateImageWithReplicate(
        prompts.mockups[i],
        'square'
      );
      if (imageUrl) {
        results.mockups.push({
          url: imageUrl,
          prompt: prompts.mockups[i],
          type: i === 0 ? 'device_mockup' : 'lifestyle_mockup'
        });
      }
    }

    for (let i = 0; i < Math.min(prompts.posters?.length || 0, 2); i++) {
      console.log(`  📢 Generating poster ${i + 1}...`);
      await this._waitForRateLimit();
      const imageUrl = await this._generateImageWithReplicate(
        prompts.posters[i],
        i === 0 ? 'square' : 'wide'
      );
      if (imageUrl) {
        results.posters.push({
          url: imageUrl,
          prompt: prompts.posters[i],
          type: i === 0 ? 'social_media' : 'banner_ad'
        });
      }
    }

    console.log(`✅ Generated: ${results.coverImage ? 'Cover, ' : ''}${results.mockups.length} mockups, ${results.posters.length} posters`);
    return results;
  }

  // ================================================================
  // WAIT FOR RATE LIMIT
  // ================================================================

  async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      console.log(`  ⏳ Waiting ${(waitTime / 1000).toFixed(1)}s for rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  // ================================================================
  // NICHE ART-DIRECTION GUIDE
  // Mirrors the color palette used in the PDF generator so the cover
  // image and the generated document feel like one cohesive brand.
  // ================================================================

  _getNicheStyleGuide() {
    const { niche } = this.productData;
    const guides = {
      fitness: {
        palette: 'warm orange and gold tones',
        mood: 'energetic, dynamic, motivating',
        elements: 'bold geometric shapes, sweeping diagonal light streaks, athletic silhouette forms',
      },
      health: {
        palette: 'fresh green and cyan tones',
        mood: 'calm, clean, restorative',
        elements: 'soft organic curves, gentle gradients, botanical or water-inspired abstract shapes',
      },
      marketing: {
        palette: 'indigo and violet tones',
        mood: 'modern, confident, dynamic',
        elements: 'abstract data-flow lines, layered geometric panels, subtle glow accents',
      },
      finance: {
        palette: 'deep navy with gold accents',
        mood: 'premium, trustworthy, authoritative',
        elements: 'sharp architectural lines, marble or metallic textures, minimal geometric grid',
      },
      technology: {
        palette: 'deep charcoal and electric blue tones',
        mood: 'sleek, futuristic, precise',
        elements: 'circuit-like abstract patterns, glowing edge lighting, layered translucent panels',
      },
      education: {
        palette: 'sky blue tones',
        mood: 'bright, approachable, optimistic',
        elements: 'soft rounded shapes, open negative space, gentle gradient sky-like backdrop',
      },
      business: {
        palette: 'charcoal with amber accents',
        mood: 'polished, professional, confident',
        elements: 'clean geometric blocks, subtle shadows, minimal corporate abstraction',
      },
      creativity: {
        palette: 'violet and pink tones',
        mood: 'playful, imaginative, expressive',
        elements: 'flowing paint-like swirls, layered color splashes, organic abstract forms',
      },
    };
    return (
      guides[niche?.toLowerCase()] || {
        palette: 'deep navy and coral accent tones',
        mood: 'polished, premium, contemporary',
        elements: 'abstract layered shapes with soft gradient lighting',
      }
    );
  }

  // ================================================================
  // GET ALL PROMPTS FROM DEEPSEEK
  // ================================================================

  async _getAllPromptsFromDeepSeek() {
    console.log('  🤖 Getting all image prompts from DeepSeek...');

    const { title, niche, audience, problem, outcome, productType, tone } = this.productData;
    const style = this._getNicheStyleGuide();

    const prompt = `Create detailed image prompts for a digital product marketing package.

Product Details:
- Title: ${title}
- Type: ${productType}
- Niche: ${niche}
- Target Audience: ${audience}
- Problem Solved: ${problem}
- Desired Outcome: ${outcome}
- Tone: ${tone}

Brand Art Direction (use this consistently across every prompt so the set feels like one cohesive brand):
- Palette: ${style.palette}
- Mood: ${style.mood}
- Visual elements to favor: ${style.elements}

⚠️ STRICT RULES FOR EVERY PROMPT (never break these):
- NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS anywhere in the image
- NO book titles, NO headings, NO subtitles, NO captions
- NO watermarks, NO signatures, NO logos, NO UI text, NO screen text
- ONLY visual imagery: shapes, color, light, texture, composition
- Each prompt must explicitly restate "no text, no words, no letters" at the end

⭐ QUALITY BAR: every prompt should read like an award-winning editorial or stock-photography brief — specify composition (rule of thirds, negative space, focal point), lighting (e.g. soft directional light, rim light, golden hour, studio softbox), depth (foreground/midground/background layering), and finish (sharp focus, high dynamic range, professional retouching). Avoid vague words like "nice" or "good" — be concrete.

Generate 5 prompts:

1. COVER IMAGE - A professional cover design WITHOUT any text
   - Portrait orientation (2:3 ratio), composed with a clear open area (upper-third or center) reserved for a text overlay to be added later
   - Should visually signal "${productType}" in the ${niche} niche through color and mood alone

2. MOCKUP 1 - Device Mockup
   - Product shown on a laptop/tablet/phone in a realistic, well-lit setting
   - Screen shows abstract UI shapes/blocks only, absolutely no legible text or icons with letters

3. MOCKUP 2 - Lifestyle Mockup
   - The product being used in a believable real-life moment for the target audience
   - No text visible anywhere, natural authentic photography style

4. POSTER 1 - Social Media Ad
   - Square format, bold and scroll-stopping
   - Clear focal point with generous negative space reserved for a future headline overlay

5. POSTER 2 - Banner Ad
   - Wide format, professional and polished
   - Clean composition with space reserved for a future headline overlay

Each prompt should be 40-60 words, highly specific about style, lighting, composition, and color.

Return as JSON:
{
  "cover": "prompt text",
  "mockups": ["prompt text", "prompt text"],
  "posters": ["prompt text", "prompt text"]
}

Return ONLY the JSON, no preamble, no markdown fences.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an award-winning creative director and prompt engineer for a premium stock-photography studio. Every image prompt you write produces polished, high-end visuals that contain ABSOLUTELY NO TEXT, WORDS, LETTERS, OR NUMBERS. Return only valid JSON, nothing else.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 1400,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let content = response.data.choices[0].message.content;
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

      // Belt-and-suspenders: guarantee the no-text instruction survives
      // even if the model drifts, since this is a hard product requirement.
      return this._enforceNoTextRule(parsed);
    } catch (error) {
      console.error('❌ DeepSeek prompts generation failed:', error.message);
      return this._getFallbackPrompts();
    }
  }

  // ================================================================
  // ENFORCE NO-TEXT RULE AT THE CODE LEVEL
  // Never trust the LLM alone for a hard constraint - always append
  // the enforcement suffix ourselves before the prompt reaches the
  // image model.
  // ================================================================

  _enforceNoTextRule(prompts) {
    const suffix = ', no text, no words, no letters, no numbers, no watermark, no logo, no signature, no captions';
    const clean = (p) => (typeof p === 'string' && p.trim() ? `${p.trim()}${suffix}` : p);

    return {
      cover: clean(prompts.cover),
      mockups: Array.isArray(prompts.mockups) ? prompts.mockups.map(clean) : [],
      posters: Array.isArray(prompts.posters) ? prompts.posters.map(clean) : [],
    };
  }

  // ================================================================
  // FALLBACK PROMPTS - niche-aware, quality-boosted
  // ================================================================

  _getFallbackPrompts() {
    const { title, niche, productType } = this.productData;
    const style = this._getNicheStyleGuide();

    const base = this._enforceNoTextRule({
      cover: `Premium ${productType} cover artwork for the ${niche} niche. ${style.mood} composition using ${style.palette} and ${style.elements}. Soft directional studio lighting, rule-of-thirds framing, generous open negative space in the upper third reserved for a future title overlay. Sharp focus, high dynamic range, editorial quality, 8k resolution.`,

      mockups: [
        `Realistic product mockup of a ${productType} displayed on a modern laptop in a bright, minimal workspace. Screen shows only abstract UI blocks and shapes, never legible characters. Soft natural window light, shallow depth of field, professional product photography.`,
        `Authentic lifestyle photo of a person engaging with a ${productType} on their phone in a natural everyday setting relevant to the ${niche} niche. Warm golden-hour lighting, candid framing, high-end editorial photography style.`,
      ],

      posters: [
        `Bold square social-media graphic for a ${productType} in the ${niche} niche. ${style.mood} feel using ${style.palette}. Strong focal point, layered ${style.elements}, generous negative space for a future headline overlay. Vibrant, scroll-stopping, professional graphic design.`,
        `Polished wide-format banner ad for a ${productType}. ${style.mood} atmosphere with ${style.palette} and ${style.elements}. Clean horizontal composition with balanced negative space reserved for a future headline overlay. High-end commercial design quality.`,
      ],
    });

    return base;
  }

  // ================================================================
  // GENERATE IMAGE WITH REPLICATE
  // ================================================================

  async _generateImageWithReplicate(prompt, aspectRatio = 'square') {
    console.log('  🖼️ Generating image with Replicate...');

    const apiKey = process.env.REPLICATE_API_KEY;

    if (!apiKey) {
      console.error('    ❌ REPLICATE_API_KEY not set in .env');
      return null;
    }

    const modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

    // SDXL was trained on specific resolution buckets - using an exact
    // bucket (instead of an arbitrary width/height) noticeably improves
    // composition quality and avoids stretching/distortion artifacts.
    let width = 1024;
    let height = 1024;

    if (aspectRatio === 'portrait') {
      width = 832;
      height = 1216; // ~2:3, native SDXL bucket
    } else if (aspectRatio === 'wide') {
      width = 1344;
      height = 768; // ~16:9, native SDXL bucket
    }

    // Quality suffix + hard no-text enforcement applied at the very last
    // mile, regardless of where the prompt came from (DeepSeek or fallback).
    const finalPrompt = `${prompt}, professional studio quality, sharp focus, highly detailed, cinematic lighting, 8k`;

    const negativePrompt =
      "text, words, letters, numbers, typography, writing, watermark, signature, logo, branding, " +
      "title, heading, subtitle, label, caption, stamp, seal, subtitles, embedded text, cropped text, " +
      "gibberish text, UI text, screen text, low quality, blurry, grainy, jpeg artifacts, ugly, deformed, " +
      "extra limbs, disfigured, oversaturated, oversharpened";

    try {
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: modelVersion,
          input: {
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            width: width,
            height: height,
            num_outputs: 1,
            scheduler: "K_EULER_ANCESTRAL",
            num_inference_steps: 40,
            guidance_scale: 7.5,
            apply_watermark: false,
          },
        },
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`    ✅ Prediction created: ${response.data.id}`);

      const imageUrl = await this._pollForImage(response.data.id);
      return imageUrl;

    } catch (error) {
      console.error('    ❌ Replicate API error:', error.response?.data?.detail || error.message);

      if (error.response?.status === 429) {
        console.log('    ⏳ Rate limited, waiting 10 seconds and retrying...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        return this._generateImageWithReplicate(prompt, aspectRatio);
      }

      return null;
    }
  }

  // ================================================================
  // POLL FOR IMAGE
  // ================================================================

  async _pollForImage(predictionId, maxAttempts = 60) {
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
          if (Array.isArray(data.output)) {
            return data.output[0];
          } else if (typeof data.output === 'string') {
            return data.output;
          }
          return null;
        } else if (data.status === 'failed') {
          console.error(`    ❌ Prediction failed: ${data.error || 'Unknown error'}`);
          return null;
        }
      } catch (error) {
        if (i === maxAttempts - 1) {
          console.warn('    ⚠️ Polling timed out');
        }
      }
    }

    return null;
  }
}

module.exports = CoverImageGenerator;
