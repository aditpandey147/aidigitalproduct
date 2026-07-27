const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');

// Initialize NVIDIA OpenAI client with GLM 4.7 model
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'AI route is working!',
    model: 'z-ai/glm4.7',
    status: 'active'
  });
});

// AI Chat endpoint with streaming support
router.post('/chat', auth, async (req, res) => {
  const { messages, websiteUrl } = req.body;
  const userMessage = messages?.[messages.length - 1]?.content || '';
  
  console.log('=== AI CHAT REQUEST ===');
  console.log('User message:', userMessage);
  console.log('Website:', websiteUrl);
  
  try {
    // System prompt for website security assistant
    const systemPrompt = `You are "ComplyZo AI", an expert website security and optimization assistant. 
You help users fix website issues related to SEO, security, compliance, and performance.
Provide detailed, actionable solutions with code examples when relevant.
Be friendly, professional, and conversational - like ChatGPT.
Keep responses well-formatted with bullet points and clear sections.
Current website being discussed: ${websiteUrl || 'customer website'}

Important: You are a helpful AI assistant for website owners. Be engaging and informative.`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || [])
    ];

    console.log('Calling NVIDIA API with GLM 4.7 model...');

    // Call NVIDIA API with GLM 4.7
    const completion = await openai.chat.completions.create({
      model: "z-ai/glm4.7",
      messages: apiMessages,
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 4096,
      stream: false
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response from AI';
    
    console.log('✅ AI Response received, length:', aiResponse.length);
    
    res.json({ 
      success: true, 
      response: aiResponse,
      mode: 'glm4.7'
    });
    
  } catch (error) {
    console.error('❌ NVIDIA API Error:', error.message);
    
    // Intelligent fallback response
    const fallbackResponse = getIntelligentResponse(userMessage);
    
    res.json({ 
      success: true, 
      response: fallbackResponse,
      mode: 'fallback'
    });
  }
});

// Streaming version for real-time ChatGPT-like experience
router.post('/chat-stream', auth, async (req, res) => {
  const { messages, websiteUrl } = req.body;
  
  console.log('=== AI STREAMING CHAT REQUEST ===');
  
  try {
    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const systemPrompt = `You are "ComplyZo AI", an expert website security and optimization assistant. 
You help users fix website issues related to SEO, security, compliance, and performance.
Provide detailed, actionable solutions with code examples when relevant.
Be friendly, professional, and conversational - like ChatGPT.
Current website being discussed: ${websiteUrl || 'customer website'}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || [])
    ];

    // Call NVIDIA API with streaming
    const stream = await openai.chat.completions.create({
      model: "z-ai/glm4.7",
      messages: apiMessages,
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 4096,
      stream: true
    });

    for await (const chunk of stream) {
      const reasoning = chunk.choices[0]?.delta?.reasoning_content;
      const content = chunk.choices[0]?.delta?.content || '';
      
      if (reasoning) {
        // Send reasoning content if available
        res.write(`data: ${JSON.stringify({ type: 'reasoning', content: reasoning })}\n\n`);
      }
      if (content) {
        // Send actual content
        res.write(`data: ${JSON.stringify({ type: 'content', content: content })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ type: 'done', done: true })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('Streaming error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Intelligent fallback responses
function getIntelligentResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  
  // Greeting responses
  if (lowerMsg.match(/^(hi|hello|hey|hii|hiii|greetings|yo)/)) {
    return `👋 **Hello! I'm ComplyZo AI - Your Website Security Assistant**

I'm here to help you with all your website needs, just like ChatGPT! Here's what I can assist you with:

**🔒 Security Issues**
• SSL certificates and HTTPS configuration
• Security headers (CSP, HSTS, X-Frame-Options)
• Vulnerability scanning and fixes
• WordPress security hardening

**📈 SEO Optimization**
• Meta descriptions and title tags
• Heading structure (H1, H2, H3)
• Image alt text optimization
• Keyword research and placement
• XML sitemaps and robots.txt

**⚖️ Compliance & Legal**
• GDPR cookie consent implementation
• Privacy policy creation
• Terms of service drafting
• CCPA compliance
• Accessibility (WCAG) guidelines

**⚡ Performance Optimization**
• Website speed optimization
• Caching strategies (Browser, Server, CDN)
• Image compression (WebP, lazy loading)
• CSS/JS minification and bundling
• Database optimization

**💡 Also can help with:**
• WordPress issues and plugin conflicts
• Custom code solutions (HTML, CSS, JS, PHP)
• Website backup strategies
• Malware removal and cleanup
• Google Search Console setup

**What would you like help with today?** 

Just type your question naturally - I understand context and can have real conversations! 😊`;
  }
  
  // SSL/Security responses
  if (lowerMsg.includes('ssl') || lowerMsg.includes('certificate') || lowerMsg.includes('https')) {
    return `🔒 **SSL Certificate Complete Guide**

I'll help you fix SSL issues step by step:

**1. Get Free SSL Certificate (Let's Encrypt)**
\`\`\`bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
\`\`\`

**2. Force HTTPS Redirect (.htaccess for Apache)**
\`\`\`apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
\`\`\`

**3. Fix Mixed Content Warnings**
Add this to your HTML <head>:
\`\`\`html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
\`\`\`

**4. Update WordPress Settings**
- Go to Settings > General
- Change WordPress Address to https://
- Change Site Address to https://

**5. Update Database URLs** (WordPress)
\`\`\`sql
UPDATE wp_options SET option_value = REPLACE(option_value, 'http://', 'https://') WHERE option_name = 'home' OR option_name = 'siteurl';
\`\`\`

**Need help with a specific hosting provider?** (cPanel, Apache, Nginx, etc.) Let me know!`;
  }
  
  // SEO responses
  if (lowerMsg.includes('seo') || lowerMsg.includes('meta') || lowerMsg.includes('title')) {
    return `📈 **SEO Optimization: Complete Guide**

**1. Meta Description (150-160 characters)**
\`\`\`html
<meta name="description" content="Your compelling description with primary keyword naturally included. Call to action encouraged!">
\`\`\`

**2. Title Tag (50-60 characters)**
\`\`\`html
<title>Primary Keyword - Secondary Keyword | Brand Name</title>
\`\`\`

**3. Heading Structure**
\`\`\`html
<h1>Main Page Topic (Only ONE per page)</h1>
<h2>Main Section Title</h2>
<h3>Subsection Title</h3>
<p>Content here...</p>
<h2>Another Main Section</h2>
\`\`\`

**4. Image Alt Text**
\`\`\`html
<img src="product-image.jpg" alt="Red leather wallet with RFID blocking - Best gift for men">
\`\`\`

**5. URL Structure**
- Use hyphens, not underscores
- Keep URLs short and descriptive
- Include keywords naturally

**6. Internal Linking**
- Link related pages together
- Use descriptive anchor text
- Create a logical site structure

**7. Mobile Optimization**
- Responsive design
- Viewport meta tag
- Touch-friendly buttons

**8. Page Speed**
- Compress images
- Minify CSS/JS
- Enable caching
- Use CDN

**Want me to help you with a specific SEO issue?** Just ask!`;
  }
  
  // GDPR/Cookie responses
  if (lowerMsg.includes('gdpr') || lowerMsg.includes('cookie') || lowerMsg.includes('privacy')) {
    return `🍪 **GDPR Compliance: Complete Implementation Guide**

**1. Cookie Consent Banner (HTML/CSS/JS)**
\`\`\`html
<div id="cookieConsent" style="position:fixed;bottom:0;left:0;right:0;background:#2563EB;color:white;padding:15px;text-align:center;z-index:9999;">
  <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
    <span>🍪 We use cookies to enhance your experience, analyze traffic, and personalize content.</span>
    <div>
      <button onclick="acceptCookies()" style="background:white;color:#2563EB;padding:8px 20px;border:none;border-radius:5px;cursor:pointer;margin-right:10px;">Accept All</button>
      <button onclick="rejectCookies()" style="background:transparent;border:1px solid white;color:white;padding:8px 20px;border-radius:5px;cursor:pointer;">Reject Non-Essential</button>
      <a href="/privacy-policy" style="color:white;margin-left:10px;text-decoration:underline;">Privacy Policy</a>
    </div>
  </div>
</div>

<script>
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  document.getElementById('cookieConsent').style.display = 'none';
  // Load analytics and tracking scripts here
}

function rejectCookies() {
  localStorage.setItem('cookieConsent', 'rejected');
  document.getElementById('cookieConsent').style.display = 'none';
}

// Check if user already consented
if (localStorage.getItem('cookieConsent')) {
  document.getElementById('cookieConsent').style.display = 'none';
}
</script>
\`\`\`

**2. Privacy Policy Requirements**
- What data you collect (name, email, IP address, etc.)
- How you use the data (analytics, marketing, etc.)
- Legal basis for processing (GDPR Article 6)
- Data sharing with third parties (Google, Facebook, etc.)
- User rights (access, rectification, erasure, portability)
- Cookie usage and types
- Data retention period
- Contact information for privacy requests

**3. Terms of Service Requirements**
- User obligations and prohibited activities
- Intellectual property rights
- Disclaimer of warranties
- Limitation of liability
- Governing law and dispute resolution
- Account termination conditions

**4. Additional Requirements**
- ✅ Data Processing Agreement (if using third-party processors)
- ✅ Records of processing activities
- ✅ Data Protection Impact Assessment (for high-risk processing)
- ✅ Designate a Data Protection Officer (if required)

**5. WordPress GDPR Plugins (Easy Solution)**
- Complianz (Free)
- CookieYes (Free)
- GDPR Cookie Consent (Free)
- WP GDPR Compliance

**Need a custom privacy policy template?** I can help you create one!`;
  }
  
  // Performance/Speed responses
  if (lowerMsg.includes('speed') || lowerMsg.includes('slow') || lowerMsg.includes('performance')) {
    return `⚡ **Website Speed Optimization: Complete Guide**

**1. Image Optimization**
\`\`\`bash
# Convert to WebP (better compression)
cwebp -q 80 image.jpg -o image.webp

# Batch compress with ImageMagick
mogrify -quality 80 -resize 1200x *.jpg

# Using TinyPNG API (Node.js)
const tinify = require('tinify');
tinify.key = 'YOUR_API_KEY';
const source = tinify.fromFile('image.jpg');
source.toFile('optimized.jpg');
\`\`\`

**2. Browser Caching (.htaccess)**
\`\`\`apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Cache Control Headers
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable" "expr=! -z %{CONTENT_TYPE}"
</IfModule>
\`\`\`

**3. Enable Gzip/Brotli Compression**
\`\`\`apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
  SetOutputFilter DEFLATE
</IfModule>
\`\`\`

**4. Minify CSS/JS/HTML**
\`\`\`bash
# Using npm packages
npm install -g uglify-js clean-css-cli html-minifier

# Minify JavaScript
uglifyjs script.js -o script.min.js -c -m

# Minify CSS
cleancss -o style.min.css style.css

# Minify HTML
html-minifier --collapse-whitespace --remove-comments --minify-js true --minify-css true index.html -o index.min.html
\`\`\`

**5. Lazy Load Images**
\`\`\`html
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" alt="Description" class="lazy">

<script>
// Native lazy loading is supported in modern browsers
// For older browsers, use Intersection Observer
const images = document.querySelectorAll('.lazy');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
images.forEach(img => observer.observe(img));
</script>
\`\`\`

**6. CDN Setup (Cloudflare - Free)**
1. Sign up at Cloudflare.com
2. Add your website
3. Change nameservers to Cloudflare's
4. Enable caching rules
5. Enable Rocket Loader
6. Enable Auto Minify (CSS, JS, HTML)
7. Enable Brotli compression

**7. Database Optimization (WordPress)**
\`\`\`sql
-- Clean up post revisions
DELETE FROM wp_posts WHERE post_type = 'revision';

-- Delete spam comments
DELETE FROM wp_comments WHERE comment_approved = 'spam';

-- Optimize tables
OPTIMIZE TABLE wp_options, wp_posts, wp_postmeta, wp_comments;
\`\`\`

**8. Performance Testing Tools**
- Google PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/
- WebPageTest: https://www.webpagetest.org/
- Lighthouse (Chrome DevTools)

**Want specific optimization for your website?** Share your URL and I'll analyze it!`;
  }
  
  // WordPress specific
  if (lowerMsg.includes('wordpress')) {
    return `📝 **WordPress Optimization Guide**

**1. Essential Plugins for Performance**
- WP Rocket (caching)
- Smush (image compression)
- Yoast SEO (SEO optimization)
- Wordfence (security)
- WP Optimize (database cleanup)

**2. .htaccess Security Rules**
\`\`\`apache
# Block access to wp-config.php
<Files wp-config.php>
  Order Allow,Deny
  Deny from all
</Files>

# Block access to sensitive files
<FilesMatch "^\\.(htaccess|htpasswd|ini|log|sh|sql|bak|backup)$">
  Order Allow,Deny
  Deny from all
</FilesMatch>

# Disable directory browsing
Options -Indexes

# Protect wp-includes
<IfModule mod_rewrite.c>
  RewriteRule ^wp-admin/includes/ - [F,L]
  RewriteRule !^wp-includes/ - [S=3]
  RewriteRule ^wp-includes/[^/]+\.php$ - [F,L]
  RewriteRule ^wp-includes/js/tinymce/langs/.+\.php - [F,L]
  RewriteRule ^wp-includes/theme-compat/ - [F,L]
</IfModule>
\`\`\`

**3. wp-config.php Optimizations**
\`\`\`php
// Enable WordPress debug mode (development only)
define('WP_DEBUG', false);

// Disable post revisions
define('WP_POST_REVISIONS', false);

// Set autosave interval to 300 seconds
define('AUTOSAVE_INTERVAL', 300);

// Increase memory limit
define('WP_MEMORY_LIMIT', '256M');

// Disable automatic updates
define('AUTOMATIC_UPDATER_DISABLED', true);

// Enable database optimization
define('WP_ALLOW_REPAIR', true);
\`\`\`

Need help with specific WordPress issues?`;
  }
  
  // General catch-all response
  return `🤖 **Hello! I'm ComplyZo AI - Your Website Assistant**

I can help you with a wide range of website-related topics, just like ChatGPT!

**Here's what I specialize in:**

🔒 **Security**
- SSL certificates and HTTPS
- Security headers (CSP, HSTS, etc.)
- Firewall and malware protection
- Brute force prevention

📈 **SEO**
- Meta tags and descriptions
- Keyword research and optimization
- Site structure and internal linking
- XML sitemaps and robots.txt

⚖️ **Compliance**
- GDPR cookie consent
- Privacy policies
- Terms of service
- Accessibility (WCAG)

⚡ **Performance**
- Speed optimization
- Caching strategies
- Image compression
- CDN setup

💻 **Development**
- HTML, CSS, JavaScript
- PHP, WordPress hooks
- API integrations
- Database optimization

**Just ask me anything!** For example:
• "How do I fix my SSL certificate?"
• "Optimize my website for SEO"
• "Make my site GDPR compliant"
• "Speed up my WordPress site"
• "Add a contact form to my website"
• "Fix my 404 errors"

**I understand natural language - feel free to chat with me like you would with ChatGPT!** 😊

What would you like help with today?`;
}

module.exports = router;