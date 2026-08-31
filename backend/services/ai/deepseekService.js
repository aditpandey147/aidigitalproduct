// backend/src/services/ai/deepseekService.js
const OpenAI = require('openai');

class DeepSeekService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }

  // Generate text with DeepSeek
  async generateText(prompt, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are a professional content creator and digital product expert. Generate high-quality, engaging content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.8,
        max_tokens: options.maxTokens || 4000,
        stream: false
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to generate content with DeepSeek');
    }
  }

  // ================================================================
  // 📚 GENERATE EBOOK OUTLINE
  // ================================================================
  async generateOutline(productData) {
    const prompt = `
      Create a detailed outline for a ${productData.type} titled "${productData.title}".
      
      Product Details:
      - Niche: ${productData.niche}
      - Target Audience: ${productData.audience}
      - Main Problem: ${productData.problem}
      - Desired Outcome: ${productData.outcome}
      - Tone: ${productData.tone}
      - Language: ${productData.language}
      - Length: ${productData.length}
      
      Please provide a complete outline with:
      1. A compelling introduction (2-3 paragraphs)
      2. 6-10 chapter titles with detailed descriptions
      3. 3-5 bonus materials with descriptions
      4. 3-5 worksheets with descriptions
      
      Format your response as a JSON object with this exact structure:
      {
        "introduction": "your introduction text here",
        "chapters": [
          { "title": "Chapter Title", "description": "Chapter description" }
        ],
        "bonus": [
          { "title": "Bonus Title", "description": "Bonus description" }
        ],
        "worksheets": [
          { "title": "Worksheet Title", "description": "Worksheet description" }
        ]
      }
    `;

    const response = await this.generateText(prompt, {
      systemPrompt: 'You are an expert book and course outline creator. Create structured, detailed, and engaging outlines. Return ONLY valid JSON.',
      temperature: 0.7,
      maxTokens: 2000
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse outline JSON:', error);
      return {
        introduction: `A comprehensive ${productData.type} about "${productData.title}" designed for ${productData.audience}. This guide will help you solve ${productData.problem} and achieve ${productData.outcome}.`,
        chapters: [
          { title: 'Introduction', description: `Getting started with ${productData.title}` },
          { title: 'Understanding the Basics', description: `Core concepts of ${productData.niche}` },
          { title: 'Building Your Foundation', description: 'Essential principles and practices' },
          { title: 'Advanced Strategies', description: 'Taking your knowledge to the next level' },
          { title: 'Practical Applications', description: `Applying ${productData.niche} principles` },
          { title: 'Common Challenges', description: 'Overcoming obstacles and staying on track' },
          { title: 'Next Steps', description: 'Continuing your journey and achieving mastery' }
        ],
        bonus: [
          { title: 'Quick Reference Guide', description: 'Key points summarized for quick access' },
          { title: 'Template Pack', description: 'Ready-to-use templates for implementation' },
          { title: 'Resource List', description: 'Curated resources for further learning' }
        ],
        worksheets: [
          { title: 'Goal Setting Worksheet', description: 'Define and track your goals' },
          { title: 'Progress Tracker', description: 'Monitor your daily progress' },
          { title: 'Action Plan', description: 'Step-by-step implementation plan' }
        ]
      };
    }
  }

  // ================================================================
  // ✍️ GENERATE CHAPTER CONTENT
  // ================================================================
  async generateChapterContent(chapter, productData) {
    const prompt = `
      Write detailed, engaging content for Chapter "${chapter.title}" of a ${productData.type} titled "${productData.title}".
      
      Chapter Description: ${chapter.description}
      Niche: ${productData.niche}
      Audience: ${productData.audience}
      Tone: ${productData.tone}
      
      Write comprehensive content that includes:
      - An engaging introduction to the chapter
      - 3-5 main sections with clear headings (use ## for section headings)
      - Practical examples and actionable advice
      - Key takeaways or summary at the end
      - Use bullet points where appropriate
      
      Make the content valuable, actionable, and engaging for the target audience.
      Write in a ${productData.tone.toLowerCase()} tone.
    `;

    return await this.generateText(prompt, {
      systemPrompt: 'You are a professional content writer. Write engaging, informative, and well-structured content that provides real value to readers.',
      temperature: 0.8,
      maxTokens: 3000
    });
  }

  // ================================================================
  // 🛒 GENERATE SALES CONTENT (JSON)
  // ================================================================
  async generateSalesPage(productData) {
    const prompt = `
      Create a complete, persuasive sales page content for a ${productData.type} titled "${productData.title}".
      
      Details:
      - Niche: ${productData.niche}
      - Audience: ${productData.audience}
      - Problem Solved: ${productData.problem}
      - Desired Outcome: ${productData.outcome}
      - Tone: ${productData.tone}
      
      Generate content for:
      1. A compelling headline (short and powerful)
      2. A persuasive subheadline
      3. Problem section - why they need this (2-3 paragraphs)
      4. Solution section - how this helps (2-3 paragraphs)  
      5. Benefits list (5-7 bullet points)
      6. What's included section (5-6 items)
      7. Who it's for section (3-4 items)
      8. Testimonials (3 placeholder testimonials)
      9. FAQ (5 questions with answers)
      10. Call to Action (persuasive text)
      11. Price section (normal price, offer price, value breakdown)
      
      Format as a JSON object.
    `;

    const response = await this.generateText(prompt, {
      systemPrompt: 'You are a professional copywriter specializing in high-converting sales pages. Write persuasive, compelling content. Return ONLY valid JSON.',
      temperature: 0.8,
      maxTokens: 3000
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found');
    } catch (error) {
      console.error('Failed to parse sales page JSON:', error);
      return {
        headline: `Transform Your ${productData.niche} with ${productData.title}`,
        subheadline: `The ${productData.type} designed specifically for ${productData.audience}`,
        problemSection: `Are you struggling with ${productData.problem}? You're not alone. Many ${productData.audience} face this challenge every day.`,
        solutionSection: `${productData.title} is the solution you've been looking for. This comprehensive ${productData.type} will guide you step by step to achieve ${productData.outcome}.`,
        benefitsList: [
          'Step-by-step guidance from industry experts',
          'Proven strategies that actually work',
          'Practical exercises to reinforce learning',
          'Time-saving templates and tools',
          'Lifetime access to all materials',
          'Support from a community of learners'
        ],
        whatsIncluded: [
          `Complete ${productData.type} with 7+ chapters`,
          'Bonus materials and resources',
          'Worksheets and templates',
          'Lifetime updates and support'
        ],
        whoItsFor: [
          `${productData.audience} looking for a comprehensive solution`,
          'Anyone struggling with related challenges',
          'Those who want to learn and grow'
        ],
        testimonials: [
          { name: 'John Doe', role: 'Student', content: 'This changed everything for me!' },
          { name: 'Jane Smith', role: 'Professional', content: 'Highly recommended for anyone in this space.' }
        ],
        faq: [
          { question: 'What exactly is included?', answer: `You get the complete ${productData.type}, bonus materials, worksheets, and lifetime updates.` },
          { question: 'How long does it take to complete?', answer: 'You can complete it at your own pace, typically 2-4 weeks.' },
          { question: 'Is there a money-back guarantee?', answer: 'Yes, 30-day money-back guarantee if you\'re not satisfied.' }
        ],
        callToAction: 'Get Started Now',
        priceSection: {
          normalPrice: '97',
          offerPrice: '47',
          valueBreakdown: {
            content: '47',
            templates: '27',
            bonuses: '47'
          }
        }
      };
    }
  }

  // ================================================================
  // 🌐 GENERATE COMPLETE SALES PAGE HTML WITH DEEPSEEK
  // ================================================================
  async generateSalesPageHTML(productData) {
    const prompt = `
      Create a complete, professional, and high-converting HTML sales page for a digital product.

      PRODUCT DETAILS:
      Title: ${productData.title}
      Type: ${productData.type}
      Niche: ${productData.niche}
      Audience: ${productData.audience}
      Main Problem: ${productData.problem}
      Desired Outcome: ${productData.outcome}
      Tone: ${productData.tone}
      Author: ${productData.authorName || 'Author'}

      SALES PAGE REQUIREMENTS:
      1. Complete HTML file with embedded CSS and JavaScript
      2. Professional, modern design with yellow (#FACC15) and dark (#111111) theme
      3. Mobile responsive (works on all devices)
      4. Include these sections:
         - Navigation/Header with CTA button
         - Hero Section with headline, subheadline, price, and CTA
         - Product image placeholder
         - Problem Section (explain the pain)
         - Solution Section (how this product solves it)
         - Benefits Grid (4-6 benefits with icons)
         - What's Included list
         - Who It's For section
         - Testimonials (3 placeholder testimonials)
         - FAQ (5 questions with answers)
         - Final CTA section with price and guarantee
         - Footer with copyright

      IMPORTANT:
      - Use yellow (#FACC15) as primary color
      - Use dark (#111111) as secondary color  
      - Use professional fonts (Inter, system fonts)
      - Include smooth animations and hover effects
      - Make it look premium and trustworthy
      - Include JavaScript for FAQ toggle and smooth scroll

      Return ONLY the complete HTML code. No explanations, no markdown, no code blocks.
      Just the raw HTML starting with <!DOCTYPE html> and ending with </html>.
    `;

    const response = await this.generateText(prompt, {
      systemPrompt: 'You are a professional web developer and copywriter. Create high-converting, beautifully designed sales pages. Return ONLY valid HTML code.',
      temperature: 0.7,
      maxTokens: 8000
    });

    // Clean the response - extract HTML if wrapped in markdown
    let html = response;
    html = html.replace(/```html\s*/g, '');
    html = html.replace(/```\s*/g, '');
    
    const htmlMatch = html.match(/<!DOCTYPE\s+html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      html = htmlMatch[0];
    }

    return html;
  }

  // ================================================================
  // 📣 GENERATE MARKETING CONTENT
  // ================================================================
  async generateMarketingContent(productData) {
    const prompt = `
      Create comprehensive marketing content for a ${productData.type} titled "${productData.title}".
      
      Details:
      - Niche: ${productData.niche}
      - Audience: ${productData.audience}
      - Problem: ${productData.problem}
      - Outcome: ${productData.outcome}
      
      Generate:
      1. Email campaign (welcome_email, value_email, urgency_email)
      2. Instagram posts (5 posts with caption and hashtags)
      3. Facebook posts (3 posts)
      4. Twitter/X posts (3 posts)
      5. LinkedIn posts (2 posts)
      6. Ad copy (3 versions)
      7. SEO title and meta description
      8. Keywords (15-20 keywords)
      
      Format as a JSON object with these exact keys:
      {
        "email_campaign": {
          "welcome_email": { "subject": "...", "body": "..." },
          "value_email": { "subject": "...", "body": "..." },
          "urgency_email": { "subject": "...", "body": "..." }
        },
        "instagram_posts": [
          { "caption": "...", "hashtags": "..." }
        ],
        "facebook_posts": [
          { "content": "..." }
        ],
        "x_twitter_posts": [
          { "content": "..." }
        ],
        "linkedin_posts": [
          { "content": "..." }
        ],
        "ad_copy": [
          { "headline": "...", "body": "..." }
        ],
        "seo_title": "...",
        "meta_description": "...",
        "keywords": ["keyword1", "keyword2", "..."]
      }
    `;

    const response = await this.generateText(prompt, {
      systemPrompt: 'You are a professional marketing strategist. Create compelling, high-converting marketing content. Return ONLY valid JSON.',
      temperature: 0.8,
      maxTokens: 4000
    });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found');
    } catch (error) {
      console.error('Failed to parse marketing JSON:', error);
      return {
        email_campaign: {
          welcome_email: { subject: `Welcome to ${productData.title}!`, body: `Welcome! This ${productData.type} will help you achieve ${productData.outcome}.` },
          value_email: { subject: `How to solve ${productData.problem}`, body: `Here's how ${productData.title} can help you...` },
          urgency_email: { subject: `Last chance for ${productData.title}`, body: `Don't miss out on this opportunity...` }
        },
        instagram_posts: [
          { caption: `🚀 Transform your ${productData.niche} with ${productData.title}!`, hashtags: `#${productData.niche.replace(/\s/g, '')} #digitalproduct` }
        ],
        facebook_posts: [
          { content: `Struggling with ${productData.problem}? ${productData.title} is the solution you need!` }
        ],
        x_twitter_posts: [
          { content: `🚀 New: ${productData.title} - The ultimate ${productData.type} for ${productData.audience}!` }
        ],
        linkedin_posts: [
          { content: `Excited to share ${productData.title} - a comprehensive ${productData.type} for ${productData.audience}.` }
        ],
        ad_copy: [
          { headline: `Solve ${productData.problem} Today`, body: `Get ${productData.title} now and start achieving ${productData.outcome}.` }
        ],
        seo_title: `${productData.title} - The Ultimate ${productData.type}`,
        meta_description: `Learn everything about ${productData.title} with our comprehensive ${productData.type}. Perfect for ${productData.audience}.`,
        keywords: [
          productData.title.toLowerCase(),
          productData.niche.toLowerCase(),
          'digital product',
          'guide',
          'tutorial'
        ]
      };
    }
  }

  // ================================================================
  // 🚀 GENERATE COMPLETE PRODUCT (All in One)
  // ================================================================
  async generateCompleteProduct(productData) {
    try {
      console.log('🚀 Starting complete product generation...');
      
      // Step 1: Generate outline
      console.log('📋 Generating outline...');
      const outline = await this.generateOutline(productData);
      
      // Step 2: Generate chapter content
      console.log('✍️ Generating chapter content...');
      const chapters = [];
      for (let i = 0; i < outline.chapters.length; i++) {
        const chapter = outline.chapters[i];
        console.log(`  Chapter ${i + 1}/${outline.chapters.length}: ${chapter.title}`);
        const content = await this.generateChapterContent(chapter, productData);
        chapters.push({
          title: chapter.title,
          content: content
        });
      }
      
      // Step 3: Generate sales page
      console.log('🛒 Generating sales page...');
      const salesPage = await this.generateSalesPage(productData);
      
      // Step 4: Generate sales page HTML
      console.log('🌐 Generating sales page HTML...');
      const salesPageHTML = await this.generateSalesPageHTML(productData);
      
      // Step 5: Generate marketing content
      console.log('📣 Generating marketing content...');
      const marketing = await this.generateMarketingContent(productData);
      
      console.log('✅ Complete product generation finished!');
      
      return {
        outline: outline,
        content: {
          chapters: chapters
        },
        salesPage: salesPage,
        salesPageHTML: salesPageHTML,
        marketing: marketing
      };
    } catch (error) {
      console.error('Complete product generation error:', error);
      throw error;
    }
  }
}

module.exports = new DeepSeekService();