// backend/services/generation/marketingKitGenerator.js
const axios = require("axios");

class MarketingKitGenerator {
  constructor(productData) {
    this.productData = productData;
    this.kit = {
      emails: [],
      social: [],
      ads: [],
      seo: {},
    };
  }

  // ================================================================
  // HELPER: Clean and parse JSON from DeepSeek response
  // ================================================================

  _cleanAndParseJSON(content) {
    // Step 1: Remove markdown code blocks
    let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Step 2: Extract JSON array or object
    let jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    cleaned = jsonMatch[0];

    // Step 3: Fix single quotes to double quotes
    cleaned = cleaned.replace(/'([^']*)':/g, '"$1":');
    cleaned = cleaned.replace(/: '([^']*)'/g, ': "$1"');

    // Step 4: Remove trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

    // Step 5: Remove comments
    cleaned = cleaned.replace(/\/\/.*$/gm, "");
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");

    // Step 6: Fix unescaped quotes inside strings
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/"(.*?)"/g, (match, p1) => {
      const fixed = p1.replace(/"/g, '\\"');
      return `"${fixed}"`;
    });

    // Step 7: Parse the cleaned JSON
    return JSON.parse(cleaned);
  }

  async generateMarketingKit() {
    console.log("📣 Generating Marketing Kit...");

    try {
      await this._generateEmails();
      await this._generateSocialPosts();
      await this._generateAdCopy();
      await this._generateSEO();

      // ✅ Ensure all fields exist
      if (!Array.isArray(this.kit.emails)) this.kit.emails = [];
      if (!Array.isArray(this.kit.social)) this.kit.social = [];
      if (!Array.isArray(this.kit.ads)) this.kit.ads = [];
      if (typeof this.kit.seo !== "object" || this.kit.seo === null) {
        this.kit.seo = {};
      }

      console.log("  ✅ Marketing Kit generated");
      console.log(`  📧 Emails: ${this.kit.emails.length}`);
      console.log(`  📱 Social: ${this.kit.social.length}`);
      console.log(`  📢 Ads: ${this.kit.ads.length}`);
      console.log(`  🔍 SEO: ${Object.keys(this.kit.seo).length} fields`);

      return this.kit;
    } catch (error) {
      console.error("❌ Marketing Kit generation failed:", error.message);
      return this._getFallbackKit();
    }
  }

  // ================================================================
  // GENERATE EMAILS
  // ================================================================

  async _generateEmails() {
    console.log("  📧 Generating emails...");

    const { title, niche, audience, problem, outcome, productType } =
      this.productData;

    const prompt = `Generate marketing emails for a digital product.

Product: ${title}
Type: ${productType}
Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate 3 emails:
1. Launch Email - Announce the product launch
2. Promotion Email - Special offer or discount
3. Follow-up Email - Check-in and upsell

Format as JSON array with:
- type: "launch" | "promotion" | "followup"
- subject: Email subject line
- body: Full email body

IMPORTANT: Return ONLY the JSON array. Use double quotes. No markdown.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert email marketer. Return ONLY valid JSON array. Use double quotes. No markdown. No code blocks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      console.log("  📝 Raw email response length:", content.length);

      // ✅ Use the helper to clean and parse
      const parsed = this._cleanAndParseJSON(content);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validEmails = parsed.filter(
          (email) => email.type && email.subject && email.body,
        );

        if (validEmails.length > 0) {
          this.kit.emails = validEmails;
          console.log(
            `    ✅ Generated ${this.kit.emails.length} valid emails`,
          );
          return;
        }
      }

      console.warn("⚠️ No valid emails found, using fallback");
      this.kit.emails = this._getFallbackEmails();
    } catch (error) {
      console.error("❌ Email generation failed:", error.message);

      // Retry with simpler prompt
      try {
        console.log("  📧 Retrying with simpler prompt...");
        const simplePrompt = `Generate 3 marketing emails as JSON array. Each email has type, subject, and body. Return ONLY valid JSON.`;

        const retryResponse = await axios.post(
          process.env.DEEPSEEK_API_URL ||
            "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "Return ONLY valid JSON array. No other text.",
              },
              { role: "user", content: simplePrompt },
            ],
            temperature: 0.5,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = this._cleanAndParseJSON(
          retryResponse.data.choices[0].message.content,
        );
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.kit.emails = parsed;
          console.log(
            `    ✅ Generated ${this.kit.emails.length} emails on retry`,
          );
          return;
        }
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }

      console.log("  📧 Using fallback emails");
      this.kit.emails = this._getFallbackEmails();
    }
  }

  // ================================================================
  // GENERATE SOCIAL POSTS
  // ================================================================

  async _generateSocialPosts() {
    console.log("  📱 Generating social posts...");

    const { title, niche, audience, problem, outcome, productType } =
      this.productData;

    const prompt = `Generate social media posts for a digital product.

Product: ${title}
Type: ${productType}
Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate posts for:
1. Instagram - Visual-focused, engaging caption with hashtags
2. Facebook - Conversational, community-focused
3. X (Twitter) - Short, punchy, with hashtags
4. Pinterest - Visual-focused, SEO-friendly description

Format as JSON array with:
- platform: "instagram" | "facebook" | "x" | "pinterest"
- content: The post content
- hashtags: Array of hashtags

IMPORTANT: Return ONLY valid JSON array. Use double quotes. No markdown.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert social media marketer. Return ONLY valid JSON array. Use double quotes. No markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const parsed = this._cleanAndParseJSON(
        response.data.choices[0].message.content,
      );

      if (Array.isArray(parsed) && parsed.length > 0) {
        this.kit.social = parsed;
        console.log(`    ✅ Generated ${this.kit.social.length} social posts`);
      } else {
        console.warn("⚠️ Unexpected social format, using fallback");
        this.kit.social = this._getFallbackSocial();
      }
    } catch (error) {
      console.error("❌ Social posts generation failed:", error.message);

      // Retry with simpler prompt
      try {
        console.log("  📱 Retrying social posts...");
        const simplePrompt = `Generate 4 social media posts as JSON array. Each has platform (instagram/facebook/x/pinterest), content, and hashtags. Return ONLY valid JSON.`;

        const retryResponse = await axios.post(
          process.env.DEEPSEEK_API_URL ||
            "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "Return ONLY valid JSON array. No other text.",
              },
              { role: "user", content: simplePrompt },
            ],
            temperature: 0.5,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = this._cleanAndParseJSON(
          retryResponse.data.choices[0].message.content,
        );
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.kit.social = parsed;
          console.log(
            `    ✅ Generated ${this.kit.social.length} social posts on retry`,
          );
          return;
        }
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }

      this.kit.social = this._getFallbackSocial();
    }
  }

  // ================================================================
  // GENERATE AD COPY
  // ================================================================

  async _generateAdCopy() {
    console.log("  📢 Generating ad copy...");

    const { title, niche, audience, problem, outcome, productType } =
      this.productData;

    const prompt = `Generate ad copy for a digital product.

Product: ${title}
Type: ${productType}
Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate 3 ad variations:
1. Headline-focused ad
2. Problem-solution ad
3. Social proof ad

Format as JSON array with:
- type: "headline" | "problem-solution" | "social-proof"
- headline: The ad headline
- body: The ad body text
- cta: Call to action

IMPORTANT: Return ONLY valid JSON array. Use double quotes. No markdown.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an expert copywriter. Return ONLY valid JSON array. Use double quotes. No markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const parsed = this._cleanAndParseJSON(
        response.data.choices[0].message.content,
      );

      if (Array.isArray(parsed) && parsed.length > 0) {
        this.kit.ads = parsed;
        console.log(`    ✅ Generated ${this.kit.ads.length} ad variations`);
      } else {
        console.warn("⚠️ Unexpected ads format, using fallback");
        this.kit.ads = this._getFallbackAds();
      }
    } catch (error) {
      console.error("❌ Ad copy generation failed:", error.message);

      try {
        console.log("  📢 Retrying ad copy...");
        const simplePrompt = `Generate 3 ad variations as JSON array. Each has type, headline, body, and cta. Return ONLY valid JSON.`;

        const retryResponse = await axios.post(
          process.env.DEEPSEEK_API_URL ||
            "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "Return ONLY valid JSON array. No other text.",
              },
              { role: "user", content: simplePrompt },
            ],
            temperature: 0.5,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = this._cleanAndParseJSON(
          retryResponse.data.choices[0].message.content,
        );
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.kit.ads = parsed;
          console.log(`    ✅ Generated ${this.kit.ads.length} ads on retry`);
          return;
        }
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }

      this.kit.ads = this._getFallbackAds();
    }
  }

  // ================================================================
  // GENERATE SEO
  // ================================================================

  async _generateSEO() {
    console.log("  🔍 Generating SEO content...");

    const { title, niche, audience, problem, outcome, productType } =
      this.productData;

    const prompt = `Generate SEO content for a digital product.

Product: ${title}
Type: ${productType}
Niche: ${niche}
Target Audience: ${audience}
Problem Solved: ${problem}
Desired Outcome: ${outcome}

Generate:
1. Meta Title (60 characters max)
2. Meta Description (160 characters max)
3. 10 SEO Keywords
4. 5 Blog Post Ideas

Format as JSON object with:
- metaTitle: string
- metaDescription: string
- keywords: array of strings
- blogIdeas: array of strings

IMPORTANT: Return ONLY valid JSON object. Use double quotes. No markdown.`;

    try {
      const response = await axios.post(
        process.env.DEEPSEEK_API_URL ||
          "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an SEO expert. Return ONLY valid JSON object. Use double quotes. No markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const parsed = this._cleanAndParseJSON(
        response.data.choices[0].message.content,
      );

      if (typeof parsed === "object" && parsed !== null) {
        this.kit.seo = parsed;
        console.log("    ✅ SEO content generated");
      } else {
        console.warn("⚠️ Unexpected SEO format, using fallback");
        this.kit.seo = this._getFallbackSEO();
      }
    } catch (error) {
      console.error("❌ SEO generation failed:", error.message);

      try {
        console.log("  🔍 Retrying SEO...");
        const simplePrompt = `Generate SEO content as JSON object with metaTitle, metaDescription, keywords (array), and blogIdeas (array). Return ONLY valid JSON.`;

        const retryResponse = await axios.post(
          process.env.DEEPSEEK_API_URL ||
            "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "Return ONLY valid JSON object. No other text.",
              },
              { role: "user", content: simplePrompt },
            ],
            temperature: 0.5,
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = this._cleanAndParseJSON(
          retryResponse.data.choices[0].message.content,
        );
        if (typeof parsed === "object" && parsed !== null) {
          this.kit.seo = parsed;
          console.log("    ✅ SEO content generated on retry");
          return;
        }
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }

      this.kit.seo = this._getFallbackSEO();
    }
  }

  // backend/services/generation/htmlToPdfConverter.js

  async _downloadImage(url) {
    try {
      // ✅ Handle local file paths
      if (
        url &&
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("data:")
      ) {
        // It's a local file path
        const fullPath = path.join(__dirname, "../../", url);
        if (fs.existsSync(fullPath)) {
          console.log(`  📁 Reading local image: ${fullPath}`);
          return fs.readFileSync(fullPath);
        } else {
          console.warn(`  ⚠️ Local image not found: ${fullPath}`);
          throw new Error("Local image not found");
        }
      }

      // Handle remote URLs
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error("❌ Image load failed:", error.message);
      throw error;
    }
  }

  // ================================================================
  // FALLBACKS
  // ================================================================

  _getFallbackEmails() {
    const { title, outcome } = this.productData;
    return [
      {
        type: "launch",
        subject: `🚀 Introducing ${title}`,
        body: `Dear [Customer],\n\nI'm thrilled to announce the launch of ${title}!\n\n${title} is designed to help you ${outcome}.\n\nGet started today!\n\nBest regards,\n[Your Name]`,
      },
      {
        type: "promotion",
        subject: `🎯 Special Offer: ${title}`,
        body: `Hi there,\n\nFor a limited time, get ${title} at a special price.\n\nDon't miss out on this opportunity to ${outcome}.\n\n[CTA Button: Claim Your Discount]`,
      },
      {
        type: "followup",
        subject: `💡 How is ${title} working for you?`,
        body: `Hello,\n\nI hope you're enjoying ${title}.\n\nI'd love to hear about your progress and answer any questions you might have.\n\nReply to this email and let me know how it's going!\n\nBest regards,\n[Your Name]`,
      },
    ];
  }

  _getFallbackSocial() {
    const { title, outcome } = this.productData;
    return [
      {
        platform: "instagram",
        content: `🚀 Ready to ${outcome}? Introducing ${title}! Get started today and transform your life. ✨\n\n#productlaunch #success #newproduct #motivation #goals`,
        hashtags: [
          "#productlaunch",
          "#success",
          "#newproduct",
          "#motivation",
          "#goals",
        ],
      },
      {
        platform: "facebook",
        content: `Join thousands of satisfied customers using ${title} to ${outcome}. Learn more now and start your journey today!\n\n[Link in comments]`,
        hashtags: [],
      },
      {
        platform: "x",
        content: `🚀 Just launched ${title}! Transform your life and ${outcome}. Get started today! #productlaunch #success`,
        hashtags: ["#productlaunch", "#success"],
      },
      {
        platform: "pinterest",
        content: `Transform your life with ${title}. ${outcome}. Perfect for beginners looking to make a change.`,
        hashtags: [],
      },
    ];
  }

  _getFallbackAds() {
    const { title, problem, outcome } = this.productData;
    return [
      {
        type: "headline",
        headline: `Transform Your Life with ${title}`,
        body: `Discover the secret to ${outcome}. Join thousands of satisfied customers who have already transformed their lives. Get started today!`,
        cta: "Get Started Now",
      },
      {
        type: "problem-solution",
        headline: `Tired of ${problem}?`,
        body: `${title} is the solution you've been looking for. Simple, effective, and proven to work. Start your journey today.`,
        cta: "Learn More",
      },
      {
        type: "social-proof",
        headline: `Join 10,000+ Happy Customers`,
        body: `Don't just take our word for it. See what others are saying about ${title} and how it helped them ${outcome}.`,
        cta: "Join Now",
      },
    ];
  }

  _getFallbackSEO() {
    const { title, niche, audience } = this.productData;
    return {
      metaTitle: `${title} - The Ultimate ${niche} Guide for ${audience}`,
      metaDescription: `Discover ${title}. Perfect for ${audience} looking to transform their ${niche} journey. Get started today!`,
      keywords: [
        title,
        niche,
        `${niche} guide`,
        `${niche} for beginners`,
        `${audience} ${niche}`,
        `how to ${niche}`,
        `${niche} tips`,
        `${niche} success`,
        `${niche} transformation`,
        `${niche} journey`,
      ],
      blogIdeas: [
        `10 Reasons Why ${title} is the Best ${niche} Guide`,
        `How to ${niche} in 30 Days: A Beginner's Guide`,
        `The Ultimate ${niche} Checklist for ${audience}`,
        `5 Common ${niche} Mistakes and How to Avoid Them`,
        `${title} Review: Is It Worth It?`,
      ],
    };
  }

  _getFallbackKit() {
    return {
      emails: this._getFallbackEmails(),
      social: this._getFallbackSocial(),
      ads: this._getFallbackAds(),
      seo: this._getFallbackSEO(),
    };
  }
}

module.exports = MarketingKitGenerator;
