const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const HeadlessCrawler = require('./headlessCrawler');
const BrokenLinkChecker = require('./brokenLinkChecker');

class WebsiteScanner {
  async scanWebsite(url, options = {}) {
    const { maxPages = 10, scanDepth = 3, useHeadless = true } = options;
    
    // Normalize URL
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    const results = {
      pagesScanned: 0,
      totalPagesFound: 0,
      pages: [],
      seoScore: 0,
      securityScore: 0,
      complianceScore: 0,
      performanceScore: 0,
      issues: [],
      pageDetails: []
    };
    
    try {
      let internalLinks = [];
      
      // Try headless crawling first for SPAs
      if (useHeadless) {
        console.log(`🕷️ Using headless crawler for ${url}`);
        const crawler = new HeadlessCrawler();
        const discoveredPages = await crawler.crawlWebsite(url, { maxPages, scanDepth });
        internalLinks = discoveredPages.map(p => p.url);
        await crawler.close();
      }
      
      // Fallback to traditional crawling if headless found nothing
      if (internalLinks.length === 0) {
        console.log(`📄 Using traditional crawler for ${url}`);
        internalLinks = await this.crawlWebsite(url, maxPages, scanDepth);
      }
      
      results.totalPagesFound = internalLinks.length;
      results.pagesScanned = internalLinks.length;
      
      console.log(`✅ Found ${internalLinks.length} pages to scan`);
      
      // If no pages found, at least scan the homepage
      if (internalLinks.length === 0) {
        internalLinks.push(url);
        results.totalPagesFound = 1;
        results.pagesScanned = 1;
      }
      
      // Scan each page
      let totalSeo = 0, totalSecurity = 0, totalCompliance = 0, totalPerformance = 0;
      let allIssues = [];
      
      for (let i = 0; i < internalLinks.length; i++) {
        const pageUrl = internalLinks[i];
        console.log(`📄 Scanning page ${i + 1}/${internalLinks.length}: ${pageUrl}`);
        
        const pageResult = await this.scanSinglePage(pageUrl);
        
        results.pages.push({
          url: pageUrl,
          ...pageResult
        });
        
        results.pageDetails.push({
          url: pageUrl,
          scores: {
            seo: pageResult.seoScore,
            security: pageResult.securityScore,
            compliance: pageResult.complianceScore,
            performance: pageResult.performanceScore
          },
          issuesCount: pageResult.issues.length
        });
        
        totalSeo += pageResult.seoScore;
        totalSecurity += pageResult.securityScore;
        totalCompliance += pageResult.complianceScore;
        totalPerformance += pageResult.performanceScore;
        allIssues.push(...pageResult.issues);
      }
      console.log(`🔗 Checking for broken links...`);
      const brokenLinkChecker = new BrokenLinkChecker();
      const allLinks = results.pages.map(p => p.url);
      const brokenLinkResults = await brokenLinkChecker.checkLinks(allLinks, url);

      if (brokenLinkResults.brokenCount > 0) {
        results.issues.push({
          type: 'Performance',
          severity: brokenLinkResults.brokenCount > 5 ? 'Critical' : 'Warning',
          message: `Found ${brokenLinkResults.brokenCount} broken links on your website`,
          details: brokenLinkResults.broken.map(l => `${l.url} (${l.type})`)
        });
        
        // Also add each broken link as a separate info issue
        brokenLinkResults.broken.forEach(link => {
          results.issues.push({
            type: 'Performance',
            severity: 'Info',
            message: `[${url}] Broken link: ${link.url} (${link.type})`
          });
        });
      }

      console.log(`📊 Broken links found: ${brokenLinkResults.brokenCount}/${brokenLinkResults.total}`);
      
      // Calculate averages
      const pageCount = internalLinks.length;
      results.seoScore = Math.round(totalSeo / pageCount);
      results.securityScore = Math.round(totalSecurity / pageCount);
      results.complianceScore = Math.round(totalCompliance / pageCount);
      results.performanceScore = Math.round(totalPerformance / pageCount);
      
      // Deduplicate issues
      const uniqueIssues = new Map();
      allIssues.forEach(issue => {
        const key = `${issue.type}-${issue.message}`;
        if (!uniqueIssues.has(key)) {
          uniqueIssues.set(key, issue);
        }
      });
      results.issues = Array.from(uniqueIssues.values());
      
      return results;
    } catch (error) {
      console.error('❌ Scan error:', error);
      return {
        pagesScanned: 0,
        totalPagesFound: 0,
        seoScore: 0,
        securityScore: 0,
        complianceScore: 0,
        performanceScore: 0,
        issues: [{ type: 'Error', severity: 'Critical', message: 'Unable to scan website. Please check if the URL is accessible.' }],
        pageDetails: []
      };
    }
  }

  async crawlWebsite(baseUrl, maxPages, maxDepth) {
    const visited = new Set();
    const toVisit = [{ url: baseUrl, depth: 0 }];
    const internalLinks = [];
    
    console.log(`🔍 Starting traditional crawl of ${baseUrl}`);
    
    while (toVisit.length > 0 && internalLinks.length < maxPages) {
      const { url, depth } = toVisit.shift();
      
      if (visited.has(url) || depth > maxDepth) continue;
      visited.add(url);
      
      try {
        const response = await axios.get(url, { 
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ComplyZoBot/1.0)'
          }
        });
        const $ = cheerio.load(response.data);
        
        internalLinks.push(url);
        
        // Find internal links
        const linksFound = this.extractInternalLinks($, baseUrl, url);
        
        for (const link of linksFound) {
          if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
            if (internalLinks.length + toVisit.length < maxPages) {
              toVisit.push({ url: link, depth: depth + 1 });
            }
          }
        }
        
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error.message);
      }
    }
    
    console.log(`✅ Traditional crawl complete. Found ${internalLinks.length} pages`);
    return internalLinks;
  }

  extractInternalLinks($, baseUrl, currentUrl) {
    const links = new Set();
    const baseHost = new URL(baseUrl).hostname;
    
    $('a').each((i, element) => {
      let href = $(element).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      try {
        let fullUrl;
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('/')) {
          const urlObj = new URL(baseUrl);
          fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
        } else {
          fullUrl = new URL(href, currentUrl).href;
        }
        
        const fullUrlHost = new URL(fullUrl).hostname;
        
        // Only include internal links
        if (fullUrlHost === baseHost && 
            !fullUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|mp4|mp3|css|js|json|xml)$/i)) {
          fullUrl = fullUrl.replace(/\/$/, '').split('#')[0];
          links.add(fullUrl);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
    
    return Array.from(links);
  }

  async scanSinglePage(url) {
    const startTime = Date.now();
    const results = {
      seoScore: 0,
      securityScore: 0,
      complianceScore: 0,
      performanceScore: 0,
      issues: [],
      loadTime: 0
    };

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ComplyZoBot/1.0)'
        }
      });
      
      results.loadTime = Date.now() - startTime;
      
      const html = response.data;
      const $ = cheerio.load(html);
      const headers = response.headers;

      // SEO Checks
      const seoResults = this.checkSEO($);
      results.seoScore = this.calculateSEOScore(seoResults);
      
      // Security Checks
      const securityResults = this.checkSecurity(url, headers);
      results.securityScore = this.calculateSecurityScore(securityResults);
      
      // Compliance Checks
      const complianceResults = this.checkCompliance($, html);
      results.complianceScore = this.calculateComplianceScore(complianceResults);
      
      // Performance Checks
      const performanceResults = this.checkPerformance(response, results.loadTime);
      results.performanceScore = this.calculatePerformanceScore(performanceResults);
      
      // Generate Issues
      results.issues = this.generateIssues(seoResults, securityResults, complianceResults, performanceResults, url);
      
      return results;
    } catch (error) {
      console.error(`Scan error for ${url}:`, error.message);
      return {
        seoScore: 0,
        securityScore: 0,
        complianceScore: 0,
        performanceScore: 0,
        issues: [{ type: 'Error', severity: 'Critical', message: `[${url}] Unable to scan: ${error.message}` }],
        loadTime: 0
      };
    }
  }

  checkSEO($) {
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Count = $('h1').length;
    const totalImages = $('img').length;
    const imagesWithAlt = $('img[alt]').length;
    const imagesMissingAlt = totalImages - imagesWithAlt;
    
    return {
      hasTitle: title.length > 0,
      titleLength: title.length,
      titleText: title,
      hasMetaDescription: metaDescription.length > 0,
      metaDescriptionLength: metaDescription.length,
      hasH1: h1Count > 0,
      h1Count: h1Count,
      totalImages: totalImages,
      imagesWithAlt: imagesWithAlt,
      imagesMissingAlt: imagesMissingAlt,
      altPercentage: totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100
    };
  }

  checkSecurity(url, headers) {
    return {
      hasHttps: url.startsWith('https'),
      hasHSTS: !!headers['strict-transport-security'],
      hasCSP: !!headers['content-security-policy'],
      hasXFrame: !!headers['x-frame-options'],
      hasXContentType: !!headers['x-content-type-options']
    };
  }

  checkCompliance($, html) {
    const bodyText = $('body').text().toLowerCase();
    const hasCookieBanner = /cookie|gdpr|consent|accept cookies/i.test(bodyText);
    const hasPrivacyPolicy = /privacy\s*policy|privacy\s*notice/i.test(bodyText) || $('a[href*="privacy"]').length > 0;
    const hasTermsPage = /terms\s*of\s*service|terms\s*and\s*conditions|terms of use/i.test(bodyText) || $('a[href*="terms"]').length > 0;
    
    return {
      hasCookieBanner: hasCookieBanner,
      hasPrivacyPolicy: hasPrivacyPolicy,
      hasTermsPage: hasTermsPage
    };
  }

  checkPerformance(response, loadTime) {
    const pageSize = JSON.stringify(response.data).length;
    return {
      loadTime: loadTime,
      pageSize: pageSize,
      sizeInMB: pageSize / (1024 * 1024),
      responseTime: parseInt(response.headers['x-response-time']) || loadTime
    };
  }

  calculateSEOScore(seo) {
    let score = 0;
    if (seo.hasTitle && seo.titleLength >= 30 && seo.titleLength <= 60) score += 30;
    else if (seo.hasTitle && (seo.titleLength > 20)) score += 20;
    else if (seo.hasTitle) score += 15;
    
    if (seo.hasMetaDescription && seo.metaDescriptionLength >= 120 && seo.metaDescriptionLength <= 160) score += 30;
    else if (seo.hasMetaDescription && (seo.metaDescriptionLength > 50)) score += 20;
    else if (seo.hasMetaDescription) score += 15;
    
    if (seo.hasH1 && seo.h1Count === 1) score += 20;
    else if (seo.hasH1) score += 10;
    
    if (seo.altPercentage >= 90) score += 20;
    else if (seo.altPercentage >= 70) score += 15;
    else if (seo.altPercentage >= 50) score += 10;
    else if (seo.altPercentage > 0) score += 5;
    
    return Math.min(100, score);
  }

  calculateSecurityScore(security) {
    let score = 0;
    if (security.hasHttps) score += 40;
    if (security.hasHSTS) score += 20;
    if (security.hasCSP) score += 20;
    if (security.hasXFrame) score += 10;
    if (security.hasXContentType) score += 10;
    return score;
  }

  calculateComplianceScore(compliance) {
    let score = 0;
    if (compliance.hasCookieBanner) score += 40;
    if (compliance.hasPrivacyPolicy) score += 35;
    if (compliance.hasTermsPage) score += 25;
    return score;
  }

  calculatePerformanceScore(performance) {
    let score = 100;
    if (performance.loadTime > 5000) score -= 40;
    else if (performance.loadTime > 3000) score -= 25;
    else if (performance.loadTime > 2000) score -= 15;
    else if (performance.loadTime > 1000) score -= 5;
    
    if (performance.sizeInMB > 10) score -= 30;
    else if (performance.sizeInMB > 5) score -= 20;
    else if (performance.sizeInMB > 2) score -= 10;
    else if (performance.sizeInMB > 1) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  generateIssues(seo, security, compliance, performance, url) {
    const issues = [];

    // SEO Issues
    if (!seo.hasTitle) {
      issues.push({ type: 'SEO', severity: 'Critical', message: `[${url}] Missing title tag` });
    } else if (seo.titleLength < 30) {
      issues.push({ type: 'SEO', severity: 'Warning', message: `[${url}] Title tag too short (${seo.titleLength} chars)` });
    } else if (seo.titleLength > 60) {
      issues.push({ type: 'SEO', severity: 'Warning', message: `[${url}] Title tag too long (${seo.titleLength} chars)` });
    }
    
    if (!seo.hasMetaDescription) {
      issues.push({ type: 'SEO', severity: 'Warning', message: `[${url}] Missing meta description` });
    }
    
    if (!seo.hasH1) {
      issues.push({ type: 'SEO', severity: 'Warning', message: `[${url}] Missing H1 tag` });
    } else if (seo.h1Count > 1) {
      issues.push({ type: 'SEO', severity: 'Warning', message: `[${url}] Multiple H1 tags (${seo.h1Count})` });
    }
    
    if (seo.imagesMissingAlt > 0) {
      issues.push({ type: 'SEO', severity: 'Info', message: `[${url}] ${seo.imagesMissingAlt} images missing alt text` });
    }

    // Security Issues
    if (!security.hasHttps) {
      issues.push({ type: 'Security', severity: 'Critical', message: `[${url}] HTTPS not enabled` });
    }

    // Compliance Issues
    if (!compliance.hasCookieBanner) {
      issues.push({ type: 'Compliance', severity: 'Warning', message: `[${url}] Cookie banner not detected` });
    }
    
    if (!compliance.hasPrivacyPolicy) {
      issues.push({ type: 'Compliance', severity: 'Warning', message: `[${url}] Privacy policy page not found` });
    }

    // Performance Issues
    if (performance.loadTime > 3000) {
      issues.push({ type: 'Performance', severity: 'Warning', message: `[${url}] Slow load time (${(performance.loadTime / 1000).toFixed(1)}s)` });
    }
    
    if (performance.sizeInMB > 5) {
      issues.push({ type: 'Performance', severity: 'Warning', message: `[${url}] Large page size (${performance.sizeInMB.toFixed(1)}MB)` });
    }

    return issues;
  }

  
}

module.exports = new WebsiteScanner();