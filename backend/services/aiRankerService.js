// services/aiRankerService.js
const OpenAI = require('openai');

// Initialize DeepSeek OpenAI client
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here',
  baseURL: 'https://api.deepseek.com/v1',
});

const callAIWithRanker = async (agent, messages) => {
  try {
    // Build system prompt based on agent
    const systemPrompt = `You are "${agent.name}", an expert ${agent.role} specializing in ${agent.type.replace('_', ' ')}.

Your thinking pattern: ${agent.thinking_pattern}

Your expertise includes:
- SEO strategy and optimization
- Keyword research and analysis
- Content optimization for search engines
- Technical SEO audits
- Link building strategies
- Local SEO optimization
- E-commerce SEO
- Rank tracking and competitor analysis

Guidelines for your responses:
1. Be specific and actionable - provide clear steps
2. Use SEO best practices and industry standards
3. Include relevant metrics and KPIs when appropriate
4. Be conversational and engaging
5. Provide examples and case studies when helpful
6. Keep responses well-structured with bullet points and sections

Always maintain your role as ${agent.role} and focus on helping users improve their website ranking.`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // DeepSeek model
      messages: apiMessages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
      stream: false
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time. Please try again.';
    
  } catch (error) {
    console.error('❌ AI Ranker Service Error:', error);
    return getFallbackResponse(agent, messages);
  }
};

// Fallback responses
const getFallbackResponse = (agent, messages) => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('keyword') || lastMessage.includes('keywords')) {
    return `🔍 **Keyword Research Strategy**

Here's a comprehensive approach to keyword research:

**1. Seed Keywords**
- Start with 5-10 broad terms related to your niche
- Use Google Autocomplete for suggestions
- Check "People also ask" sections

**2. Use Keyword Tools**
- Google Keyword Planner (Free)
- SEMrush (Paid)
- Ahrefs (Paid)
- Ubersuggest (Free/Paid)

**3. Analyze Search Intent**
- Informational: "how to", "what is"
- Navigational: Brand names
- Commercial: "best", "review"
- Transactional: "buy", "discount"

**4. Long-tail Keywords**
- Target 3-4 word phrases
- Lower competition, higher conversion
- Example: "best SEO tools for small business"

**5. Competitor Analysis**
- Check what keywords competitors rank for
- Identify gaps in their strategy
- Target keywords they're missing

**6. Keyword Difficulty**
- Check competition level
- Look at domain authority of ranking pages
- Start with low-difficulty keywords

**7. Group by Topic**
- Create topic clusters
- Map keywords to content pillars
- Build internal linking strategy

**Need help with specific keyword research?** Tell me your niche!`;
  }

  if (lastMessage.includes('audit') || lastMessage.includes('technical')) {
    return `🔧 **Technical SEO Audit Checklist**

**1. Crawlability**
- ✅ Check robots.txt configuration
- ✅ XML sitemap generation and submission
- ✅ Fix broken links (404 errors)
- ✅ Check for orphan pages

**2. Indexability**
- ✅ Noindex tags on proper pages
- ✅ Canonical tags implementation
- ✅ Meta robots tags

**3. Site Structure**
- ✅ Flat site architecture
- ✅ Internal linking strategy
- ✅ Breadcrumb navigation
- ✅ URL structure optimization

**4. Page Speed**
- ✅ Core Web Vitals optimization
- ✅ Image compression (WebP)
- ✅ Browser caching
- ✅ Minify CSS/JS/HTML
- ✅ CDN implementation

**5. Mobile Optimization**
- ✅ Responsive design
- ✅ Mobile-first indexing
- ✅ Viewport meta tag
- ✅ Touch-friendly buttons

**6. Security**
- ✅ SSL/HTTPS implementation
- ✅ Security headers (CSP, HSTS)
- ✅ Regular security scans

**7. Structured Data**
- ✅ Schema markup implementation
- ✅ JSON-LD format
- ✅ Review and FAQ schema

**Want a custom technical audit?** Share your website URL!`;
  }

  if (lastMessage.includes('content') || lastMessage.includes('article')) {
    return `📝 **Content Optimization Guide**

**1. Content Structure**
\`\`\`
H1 - Primary Topic (Only one per page)
  H2 - Main Sections
    H3 - Subsections
      H4 - Detailed points
\`\`\`

**2. SEO Elements**
- Title Tag: 50-60 characters, keyword at start
- Meta Description: 150-160 characters, include CTA
- URL: Short, descriptive, keyword-rich
- Image Alt Text: Descriptive with keywords

**3. Keyword Placement**
- ✅ In H1 (first 100 words)
- ✅ In H2/H3 headings
- ✅ In first paragraph (above the fold)
- ✅ In image alt text
- ✅ In meta description
- ✅ In URL
- ✅ In internal links

**4. Readability**
- Use short paragraphs (2-3 sentences)
- Use bullet points and lists
- Include transition words
- Maintain Flesch reading ease > 60

**5. Engagement**
- Include images and videos
- Add internal and external links
- Use quotes and statistics
- Add a CTA at the end

**6. Length Guidelines**
- Blog posts: 1500-2500 words
- Product pages: 500-800 words
- Category pages: 400-600 words
- Landing pages: 1000-2000 words

**Need help with content optimization?** Share your topic!`;
  }

  if (lastMessage.includes('local') || lastMessage.includes('maps')) {
    return `📍 **Local SEO Optimization Guide**

**1. Google Business Profile**
- Claim and verify your listing
- Complete all business information
- Add high-quality photos
- Select correct categories
- Add products and services

**2. Local Citations**
- Submit to major directories
- Maintain NAP consistency (Name, Address, Phone)
- Yelp, Yellow Pages, Bing Places
- Industry-specific directories

**3. Local Keywords**
- City/neighborhood + service
- "Near me" optimization
- Local landmarks references
- Zip code targeting

**4. Reviews**
- 5+ star rating target
- Respond to all reviews
- Address negative reviews
- Encourage positive reviews

**5. Local Content**
- Create location-specific pages
- Blog about local events
- Sponsor local events
- Partner with local businesses

**6. Local Schema**
- LocalBusiness schema
- Review schema
- Event schema

**7. Mobile Optimization**
- Click-to-call buttons
- Directions and maps
- Mobile-friendly site

**Need local SEO help?** Tell me your business type and location!`;
  }

  if (lastMessage.includes('link') || lastMessage.includes('backlink')) {
    return `🔗 **Link Building Strategy Guide**

**1. White-Hat Link Building**
- Guest posting on relevant sites
- Broken link building
- Resource page link building
- Skyscraper technique

**2. Content-Based Link Building**
- Create linkable assets (guides, tools, infographics)
- Original research and data
- Case studies
- Expert roundups

**3. Outreach Strategies**
- Personalize your outreach emails
- Find the right contact person
- Offer value before asking
- Follow up strategically

**4. Monitor Backlinks**
- Use tools like Ahrefs, SEMrush
- Track new and lost backlinks
- Disavow toxic links

**5. Internal Linking**
- Create topic clusters
- Link related content
- Use descriptive anchor text
- Fix broken internal links

**6. Competitor Analysis**
- Analyze competitors' backlink profiles
- Identify opportunities
- Replicate their best links

**Need help with link building?** Tell me your niche and industry!`;
  }

  if (lastMessage.includes('competitor') || lastMessage.includes('competitors')) {
    return `👀 **Competitor Analysis Guide**

**1. Identify Your Competitors**
- Direct competitors (same products/services)
- Indirect competitors (different products, same audience)
- SEO competitors (ranking for same keywords)

**2. Analyze Their SEO**
- Keywords they rank for
- Content strategy
- Backlink profile
- Site structure and UX

**3. Tools for Competitor Analysis**
- SEMrush
- Ahrefs
- SpyFu
- SimilarWeb

**4. What to Look For**
- Top-performing content
- Keywords driving traffic
- Backlink sources
- Social media presence
- Advertising strategies

**5. Find Opportunities**
- Keywords they're missing
- Content gaps
- Weak backlink profiles
- Better user experience

**6. Create a Strategy**
- Differentiate yourself
- Target underserved keywords
- Create better content
- Build better links

**Want to analyze specific competitors?** Share their URLs!`;
  }

  return `🤖 **${agent.name} - SEO & Ranking Expert**

I'm your dedicated AI assistant for improving website rankings and SEO performance.

**Here's how I can help you:**

🔍 **Keyword Research**
- Find high-value keywords
- Analyze search intent
- Discover long-tail opportunities
- Competitor keyword analysis

🔧 **Technical SEO**
- Full website audits
- Page speed optimization
- Mobile optimization
- Structured data implementation

📝 **Content Optimization**
- Title and meta tags
- Content structure
- Internal linking
- Image optimization

📍 **Local SEO**
- Google Business Profile
- Local citations
- Review management
- Local content strategy

📊 **Rank Tracking**
- Monitor keyword positions
- Track competitor rankings
- Performance reporting
- ROI analysis

🔗 **Link Building**
- Backlink strategies
- Guest posting opportunities
- Broken link building
- PR and outreach

👀 **Competitor Analysis**
- Identify competitors
- Analyze their strategies
- Find opportunities
- Outrank them

**What would you like to optimize today?** 

Just type your question naturally - I'm here to help you rank higher! 😊`;
};

module.exports = { callAIWithRanker };