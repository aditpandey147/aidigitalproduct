const axios = require('axios');

class BrokenLinkChecker {
  constructor() {
    this.brokenLinks = [];
    this.workingLinks = [];
  }

  async checkLinks(urls, baseUrl) {
    this.brokenLinks = [];
    this.workingLinks = [];
    
    console.log(`🔗 Checking ${urls.length} links for broken links...`);
    
    const promises = urls.map(async (url) => {
      try {
        const response = await axios.head(url, {
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: (status) => true
        });
        
        if (response.status >= 400) {
          this.brokenLinks.push({
            url,
            statusCode: response.status,
            statusText: response.statusText,
            type: this.getBrokenType(response.status)
          });
        } else {
          this.workingLinks.push({ url, statusCode: response.status });
        }
      } catch (error) {
        this.brokenLinks.push({
          url,
          statusCode: 0,
          statusText: error.message,
          type: 'Connection Failed'
        });
      }
    });

    await Promise.all(promises);
    
    console.log(`✅ Found ${this.brokenLinks.length} broken links out of ${urls.length}`);
    
    return {
      total: urls.length,
      broken: this.brokenLinks,
      working: this.workingLinks.length,
      brokenCount: this.brokenLinks.length
    };
  }

  getBrokenType(statusCode) {
    if (statusCode === 404) return 'Not Found';
    if (statusCode === 500) return 'Server Error';
    if (statusCode === 403) return 'Forbidden';
    if (statusCode === 401) return 'Unauthorized';
    if (statusCode >= 400 && statusCode < 500) return 'Client Error';
    if (statusCode >= 500) return 'Server Error';
    return 'Unknown';
  }
}

module.exports = BrokenLinkChecker;