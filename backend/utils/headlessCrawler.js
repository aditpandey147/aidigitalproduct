const puppeteer = require('puppeteer');

class HeadlessCrawler {
  constructor() {
    this.browser = null;
    this.visited = new Set();
    this.pages = [];
    this.maxPages = 100;
    this.baseUrl = '';
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async crawlWebsite(url, options = {}) {
    const { maxPages = 100, waitTime = 2000 } = options;
    
    await this.init();
    this.maxPages = maxPages;
    this.visited.clear();
    this.pages = [];
    
    // Normalize URL
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    this.baseUrl = url;
    
    console.log(`🕷️ Starting headless crawl of ${url}`);
    console.log(`📄 Max pages: ${maxPages}`);
    
    await this.crawlPage(url, 0, waitTime);
    
    console.log(`✅ Crawl complete. Found ${this.pages.length} pages`);
    return this.pages;
  }

  async crawlPage(url, depth, waitTime) {
    if (this.visited.has(url) || this.pages.length >= this.maxPages) {
      return;
    }
    
    this.visited.add(url);
    
    const page = await this.browser.newPage();
    
    try {
      console.log(`📄 Crawling (${this.pages.length + 1}/${this.maxPages}): ${url}`);
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait for dynamic content
      await page.waitForTimeout(waitTime);
      
      // Get page title
      const title = await page.title();
      
      // Store page info
      this.pages.push({
        url: url,
        title: title,
        depth: depth,
        isHomepage: url === this.baseUrl
      });
      
      // Find all internal links
      const links = await this.extractInternalLinks(page);
      
      // Close the page to save memory
      await page.close();
      
      // Crawl found links
      for (const link of links) {
        if (!this.visited.has(link) && this.pages.length < this.maxPages) {
          await this.crawlPage(link, depth + 1, waitTime);
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to crawl ${url}:`, error.message);
      await page.close();
    }
  }

  async extractInternalLinks(page) {
    const baseHost = new URL(this.baseUrl).hostname;
    
    const links = await page.evaluate((baseHost) => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      const hrefs = anchors
        .map(a => a.href)
        .filter(href => {
          if (!href) return false;
          try {
            const url = new URL(href);
            // Only include internal links (same domain)
            const isInternal = url.hostname === baseHost;
            // Exclude non-html links
            const isHtml = !href.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|mp4|mp3|css|js|json|xml)$/i);
            // Exclude hash links and mailto/tel
            const isExcluded = href.includes('#') || href.startsWith('mailto:') || href.startsWith('tel:');
            return isInternal && isHtml && !isExcluded;
          } catch (e) {
            return false;
          }
        });
      
      // Remove duplicates and clean URLs
      const unique = [...new Set(hrefs)];
      return unique.map(u => u.split('#')[0].replace(/\/$/, ''));
    }, baseHost);
    
    return links;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = HeadlessCrawler;