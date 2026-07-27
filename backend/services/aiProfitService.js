const axios = require('axios');

/**
 * Call AI with agent context using DeepSeek API
 */
async function callAIWithAgent(agent, messages) {
  try {
    const systemPrompt = `${agent.thinking_pattern}

Your role: ${agent.role}
Your expertise: ${agent.description}

Important guidelines:
1. Provide actionable, specific advice
2. Include examples when helpful
3. Focus on profit generation and business growth
4. Be professional but conversational
5. If asked about specific numbers, give realistic estimates
6. Always encourage taking action
7. Be engaging and ask follow-up questions
8. Provide step-by-step guidance when appropriate
9. Format responses with clear headings, bullet points, and bold text for emphasis
10. Keep responses structured and easy to read`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || [])
    ];

    // DeepSeek API Call
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat', // or 'deepseek-reasoner' for deeper reasoning
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 4096,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    return "I'm sorry, I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return getRateLimitResponse(agent);
    }
    
    return getFallbackResponse(agent, messages);
  }
}

/**
 * Rate limit response
 */
function getRateLimitResponse(agent) {
  return `⏳ **API Rate Limit Reached**

I'm currently experiencing high demand. Please try again in a few moments.

While you wait, here's a quick tip for ${agent.name}:

**Quick Action Tip:**
1. Start with a small test before scaling
2. Track your results systematically
3. Iterate based on what works

Try again in 30 seconds! 🚀`;
}

/**
 * Fallback responses when DeepSeek API fails
 */
function getFallbackResponse(agent, messages) {
  const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || '';
  
  // Agent-specific fallback responses
  const fallbacks = {
    'seo-profit-maximizer': `📈 **SEO Profit Strategies**

Based on your question, here are 5 proven tactics to increase SEO revenue:

**1. Create Pillar Content**
- Write comprehensive guides (3000+ words)
- Target high-volume, high-intent keywords
- Update content regularly with new data

**2. Optimize for Featured Snippets**
- Answer "how to" questions directly
- Use structured data markup
- Create FAQ sections on pages

**3. Internal Linking Strategy**
- Link related posts to keep users on site
- Use descriptive anchor text
- Create topic clusters

**4. Refresh Old Content**
- Update top-performing posts with new data
- Add new sections and examples
- Improve readability and structure

**5. Target Buyer Intent Keywords**
- Focus on "best" and "review" keywords
- Create comparison content
- Add call-to-actions

**Need specific help with any of these strategies?** Just ask!`,

    'ecommerce-product-scout': `🛒 **Product Research Framework**

Here's my proven system for finding profitable products:

**Step 1: Market Analysis**
- Use Google Trends for demand patterns
- Check Amazon Bestsellers for proven markets
- Monitor social media trends

**Step 2: Supplier Research**
- Alibaba for manufacturing quotes
- Oberlo for dropshipping options
- Check shipping times and costs

**Step 3: Validation**
- Run small Facebook Ad tests ($50 budget)
- Check engagement and conversion rates
- Validate with customer feedback

**Step 4: Profit Calculation**
- Product cost + shipping + fees
- Calculate 3x markup minimum
- Factor in marketing costs

**Step 5: Launch Strategy**
- Start with one product
- Test different marketing angles
- Scale winners, cut losers

**Which step would you like to dive deeper into?**`,

    'affiliate-profit-strategist': `💰 **Affiliate Marketing Profit System**

**Top 3 High-Converting Niches:**
1. Software/SaaS - 20-50% commissions
2. Online Courses - $50-500 per sale
3. Physical Products - Recurring purchases

**Best Practices for Success:**

**Content Strategy:**
- Review products you actually use
- Create detailed comparison posts
- Include pros and cons
- Add personal experience

**Traffic Generation:**
- SEO optimized blog posts
- YouTube video reviews
- Email list promotions
- Social media content

**Conversion Optimization:**
- Use strong CTAs
- Add bonus offers
- Create urgency
- Build trust with testimonials

**Which niche or strategy interests you most?** I can provide detailed guidance!`,

    'social-media-monetization': `📱 **Social Media Monetization Guide**

**Platform-Specific Strategies:**

**YouTube**
- Ad revenue (RPM: $3-5)
- Sponsorships ($500-10,000+)
- Channel memberships
- Super Chat during streams

**Instagram**
- Brand deals ($100-5,000+)
- Affiliate marketing (5-30% commission)
- Selling digital products
- Consulting services

**TikTok**
- Creator fund ($0.02-0.04 per view)
- Brand partnerships
- Live stream gifts
- Shop integration

**LinkedIn**
- Professional services
- Consulting packages
- Course sales
- Speaking engagements

**Key Success Factors:**
1. ✅ Consistent posting schedule
2. ✅ High-quality, value-driven content
3. ✅ Engage with your audience
4. ✅ Build a personal brand
5. ✅ Diversify income streams
6. ✅ Track your metrics

**Which platform are you focusing on?** Tell me and I'll give specific strategies!`,

    'email-list-profit-expert': `📧 **Email List Profit System**

**Lead Magnet Ideas:**
- Free checklist or cheat sheet
- Mini-course or video series
- Resource library access
- Free consultation call
- Discount coupon
- Industry report

**Monetization Strategies:**

**1. Welcome Sequence**
- Email 1: Welcome + free resource
- Email 2: Value content
- Email 3: Soft sell / offer
- Email 4: Case study
- Email 5: Hard sell with urgency

**2. Educational Content**
- Weekly newsletters
- Tips and strategies
- Industry insights
- Behind-the-scenes

**3. Promotional Emails**
- Product launches
- Limited time offers
- Seasonal campaigns
- Referral programs

**4. Re-engagement**
- Win-back campaigns
- Feedback requests
- Exclusive content
- Special offers

**What type of lead magnet would work best for your audience?** I can help you create it!`,

    'content-monetization-strategist': `✍️ **Content Monetization Framework**

**Multiple Revenue Streams:**

**1. Subscriptions**
- Monthly memberships ($5-50/mo)
- Premium content access
- Community access
- Exclusive resources

**2. Advertising**
- Display ads (Google AdSense)
- Sponsored content ($500-5000+)
- Affiliate marketing
- Native advertising

**3. Digital Products**
- E-books ($10-50)
- Templates ($20-100)
- Courses ($100-1000)
- Printables ($5-20)

**4. Services**
- Consulting ($100-500/hr)
- Coaching ($500-2000/mo)
- Done-for-you services
- Audit services

**5. Events**
- Webinars (free/paid)
- Workshops ($50-500)
- Conferences
- Live streams

**Content Strategy:**
- Create pillar content
- Repurpose across platforms
- Build an email list
- Engage with community

**Which revenue stream aligns with your content?** Let's build a strategy!`,

    'paid-ads-profit-optimizer': `🎯 **Paid Advertising Optimization**

**Google Ads Strategy:**

**Campaign Structure:**
1. Search campaigns
2. Display campaigns
3. Shopping campaigns
4. Video campaigns

**Optimization Tactics:**

**1. Keyword Strategy**
- Use exact match for high-intent
- Negative keywords daily
- Long-tail keywords for lower CPC
- Competitor keywords analysis

**2. Ad Copy Optimization**
- Test multiple headlines
- Include CTAs
- Highlight unique value
- Use ad extensions

**3. Landing Page**
- Match ad copy to page
- Clear CTA above fold
- Testimonials and trust signals
- Mobile optimization

**4. Bid Management**
- Automated bidding strategies
- Target CPA/ROAS
- Budget allocation by performance
- Schedule adjustments

**5. Audience Targeting**
- Remarketing lists
- In-market audiences
- Custom intent audiences
- Similar audiences

**Facebook/Meta Ads:**

**Structure:**
1. Awareness campaign
2. Consideration campaign
3. Conversion campaign

**Creative Strategy:**
- Video vs image tests
- Headline variations
- CTA testing
- Ad format testing

**What's your current ad spend?** I can help optimize your campaigns!`,

    'funnel-optimization-profit': `🌀 **Sales Funnel Optimization**

**Awareness Stage:**
- Blog content
- Social media
- Paid ads
- SEO traffic

**Interest Stage:**
- Lead magnets
- Email opt-ins
- Free resources
- Webinars

**Decision Stage:**
- Case studies
- Testimonials
- Comparison pages
- Free consultations

**Action Stage:**
- Clear CTAs
- Checkout optimization
- Payment options
- Post-purchase follow-up

**Retention Stage:**
- Onboarding emails
- Customer success
- Upsell offers
- Referral programs

**Optimization Checklist:**
✅ Clear value proposition
✅ Mobile-responsive pages
✅ Fast loading speed
✅ Trust signals and social proof
✅ Exit-intent popups
✅ Email sequence automation
✅ A/B testing culture

**Which stage needs the most improvement?** I'll give you specific fixes!`,

    'course-creation-profit': `🎓 **Course Creation & Monetization**

**Step 1: Market Research**
- Identify your audience
- Research competitors
- Find course gaps
- Validate demand

**Step 2: Content Planning**
- Outline course structure
- Create module breakdowns
- Plan content formats (video, text, quizzes)
- Set learning objectives

**Step 3: Production**
- Record video lessons
- Create worksheets and templates
- Design slides and visuals
- Record audio and refine

**Step 4: Platform Setup**
- Choose hosting platform
- Set up payment processing
- Design sales page
- Create email sequence

**Step 5: Launch Strategy**
- Build anticipation
- Pre-sale offers
- Launch email sequence
- Early bird discounts
- Referral incentives

**Step 6: Monetization**
- One-time payment ($100-1000)
- Subscription model ($20-100/mo)
- Membership tiers
- Bundle with coaching

**Pricing Strategy:**
- Tier 1: Course only ($100-500)
- Tier 2: Course + community ($200-800)
- Tier 3: Course + coaching ($500-2000)

**What topic are you thinking of teaching?** Let me help you structure it!`,

    'lead-generation-profit': `🎯 **Lead Generation System**

**Strategy 1: Content Marketing**
- Blog posts targeting pain points
- SEO-optimized content
- Guest posting on industry blogs
- Case studies and success stories

**Strategy 2: Paid Advertising**
- Targeted Google Ads
- Facebook/Instagram ads
- LinkedIn advertising
- Retargeting campaigns

**Strategy 3: Social Media**
- LinkedIn networking
- Twitter/X engagement
- Facebook groups
- Instagram DMs

**Strategy 4: Email Outreach**
- Cold email sequences
- Personalization at scale
- Follow-up automation
- Referral requests

**Strategy 5: Partnerships**
- Joint ventures
- Affiliate programs
- Cross-promotions
- Referral networks

**Lead Magnet Ideas:**
1. Free consultation call
2. Industry report/study
3. Checklist or template
4. Mini-course or training
5. Tool or software trial

**Conversion Optimization:**
- Lead capture pages
- Exit-intent popups
- Chat bot qualification
- Multi-step forms

**What type of leads are you looking for?** B2B or B2C?`,

    'sales-copywriting-profit': `✍️ **Sales Copywriting Framework**

**The 5-Step Copy Formula:**

**1. Hook (Headline)**
- Curiosity
- Problem statement
- Promise or benefit
- Question or challenge

**2. Empathy (Understanding)**
- Acknowledge the problem
- Show you understand their pain
- Validate their feelings
- Establish connection

**3. Solution (Your Offer)**
- Present your solution
- Explain how it works
- Show benefits, not features
- Use social proof

**4. Evidence (Proof)**
- Testimonials
- Case studies
- Statistics and data
- Before/after examples

**5. Call to Action**
- Clear instruction
- Create urgency
- Offer guarantee
- Remove friction

**Copywriting Best Practices:**
✅ Write for ONE person
✅ Use "you" and "your"
✅ Short paragraphs
✅ Use bullet points
✅ Tell stories
✅ Create emotional connection
✅ Focus on outcomes
✅ Include guarantee

**Types of Copy:**
- Sales pages
- Email sequences
- Ad copy
- Landing pages
- Product descriptions

**What type of copy are you writing?** I'll help you craft it!`,

    'consulting-profit-accelerator': `💼 **Consulting Business Acceleration**

**Step 1: Define Your Niche**
- Identify your expertise
- Research market demand
- Choose a specific audience
- Create a unique value proposition

**Step 2: Package Your Services**
- Offer levels (Basic, Pro, Premium)
- One-off consulting sessions
- Monthly retainer packages
- Workshop and training options

**Step 3: Build Your Brand**
- Professional website
- LinkedIn optimization
- Case studies portfolio
- Client testimonials

**Step 4: Client Acquisition**
- Referral program
- Content marketing
- Networking events
- Cold outreach
- Partnerships

**Step 5: Pricing Strategy**
**Hourly:** $100-500/hour
**Day Rate:** $1,000-5,000/day
**Monthly Retainer:** $3,000-20,000/mo
**Project-based:** $5,000-50,000+

**Step 6: Delivery Excellence**
- Client onboarding process
- Structured frameworks
- Regular communication
- Results tracking
- Client feedback loop

**Step 7: Scale**
- Hire associates
- Create courses
- Build a team
- Automate processes

**What type of consulting do you offer?** I'll help you build your practice!`,

    'dropshipping-profit-system': `🚚 **Dropshipping Profit System**

**Step 1: Market Research**
- Find trending products
- Analyze competition
- Check profit margins
- Validate demand

**Step 2: Choose Products**
**Winning Product Criteria:**
- Under $50 (impulse buy)
- Problem-solving product
- High perceived value
- Good profit margin (3x markup)

**Step 3: Find Suppliers**
- Alibaba/AliExpress
- DSers for automation
- CJ Dropshipping
- USA-based suppliers

**Step 4: Build Store**
- Shopify or WooCommerce
- Mobile-responsive theme
- Professional product images
- Compelling descriptions

**Step 5: Marketing**
- Facebook/Instagram ads
- TikTok organic content
- Influencer partnerships
- Email marketing
- SEO for long-term traffic

**Step 6: Optimize**
- A/B test ad creatives
- Upsell and cross-sell
- Customer retention
- Build a brand

**Step 7: Scale**
- Test new products
- Expand to new markets
- Automate fulfillment
- Build a team

**What product category are you interested in?** I'll help you get started!`,

    'youtube-monetization-profit': `🎬 **YouTube Monetization System**

**Step 1: Channel Strategy**
- Choose a profitable niche
- Define target audience
- Create channel branding
- Plan content calendar

**Step 2: Content Creation**
- High-quality production
- Engaging thumbnails
- SEO-optimized titles
- Compelling hooks (first 10 seconds)
- Clear CTAs

**Step 3: Growth Tactics**
- Consistent posting schedule
- YouTube SEO optimization
- Collaboration with creators
- Engage with community
- Promote on other platforms

**Step 4: Monetization**

**Ad Revenue:**
- $3-5 RPM (RPM = revenue per 1000 views)
- $1,000-5,000 per million views
- Optimize for watch time

**Sponsorships:**
- $500-10,000+ per video
- Affiliate products
- Brand deals
- Integration with content

**Other Revenue:**
- YouTube Memberships
- Super Chat (live streams)
- Selling merchandise
- Courses and coaching
- Affiliate marketing

**Step 5: Diversify**
- Build email list
- Create digital products
- Offer consulting
- Start a podcast

**What's your content niche?** I'll help you build a monetization strategy!`,

    'consulting-profit-accelerator': `💼 **Consulting Business Acceleration**

**Step 1: Position Yourself as the Expert**
- Create a strong personal brand
- Share your knowledge freely
- Build a portfolio of case studies
- Get testimonials from early clients

**Step 2: Package Your Services**

**Entry Level:**
- Strategy session ($200-500)
- Website audit ($500-1000)

**Mid Level:**
- Monthly consulting ($2,000-5,000)
- Project-based ($5,000-20,000)

**Premium Level:**
- Annual retainer ($20,000-100,000+)
- Done-for-you execution

**Step 3: Client Acquisition**
- Referral system with bonuses
- Content marketing (blog, video, podcast)
- Speaking engagements
- LinkedIn outreach
- Partnerships

**Step 4: Scale**
- Create a team of associates
- Build systems and processes
- Create productized offers
- Develop a training academy

**Quick Wins Strategy:**
1. Offer free consultations
2. Deliver massive value
3. Ask for testimonials
4. Request referrals
5. Stay in touch

**What's your consulting specialty?** I'll create a tailored growth plan!`
  };

  // Try to find a fallback based on keywords in the last message
  let fallbackResponse = fallbacks[agent.slug];
  
  if (!fallbackResponse) {
    // Generic fallback with some personalization
    fallbackResponse = `🤖 **${agent.name}**

I'm here to help you with ${agent.description.toLowerCase()}.

**Here's what I can help you with:**
- Strategy development
- Problem-solving
- Growth tactics
- Action plans

**Quick Tips to Get Started:**
1. Define your specific goal
2. Identify your biggest challenge
3. Take action on the first step

**What specific question do you have about ${agent.role.toLowerCase()}?** 

I'll give you detailed, actionable advice! 💪`;
  }

  return fallbackResponse;
}

module.exports = { callAIWithAgent };