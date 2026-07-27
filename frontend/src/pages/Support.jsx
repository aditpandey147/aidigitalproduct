import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Support = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'fas fa-grid' },
    { id: 'account', name: 'Account & Billing', icon: 'fas fa-user-circle' },
    { id: 'scanning', name: 'Website Scanning', icon: 'fas fa-search' },
    { id: 'security', name: 'Security Issues', icon: 'fas fa-shield-alt' },
    { id: 'automation', name: 'Automation', icon: 'fas fa-clock' },
    { id: 'api', name: 'API & Integration', icon: 'fas fa-code' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple! Click the "Sign Up" button on the homepage, fill in your details, and verify your email address. You can start with our free plan and upgrade anytime.',
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I upgrade or downgrade my plan?',
      answer: 'Go to Settings > Subscription, click "Upgrade to Pro" or contact our sales team for enterprise plans. Changes are applied immediately and prorated accordingly.',
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime from Settings > Subscription. Your service will continue until the end of your billing period. No hidden fees or cancellation charges.',
    },
    {
      id: 4,
      category: 'scanning',
      question: 'How often should I scan my website?',
      answer: 'We recommend daily scans for active websites. Free users can run manual scans, while Pro users get automated daily scans. You can also schedule weekly or monthly scans.',
    },
    {
      id: 5,
      category: 'scanning',
      question: 'What does the website scanner check?',
      answer: 'Our scanner checks SEO elements (meta tags, titles, headings), security (SSL, headers, vulnerabilities), compliance (GDPR, cookie banners), and performance (speed, size, caching).',
    },
    {
      id: 6,
      category: 'scanning',
      question: 'How long does a scan take?',
      answer: 'A standard scan takes 30-60 seconds depending on your website size. Multi-page scanning may take 2-5 minutes for up to 100 pages.',
    },
    {
      id: 7,
      category: 'security',
      question: 'How do I fix SSL certificate issues?',
      answer: 'Install a valid SSL certificate from Let\'s Encrypt (free) or your hosting provider. Then force HTTPS redirect using .htaccess or server configuration. Our AI Fixer provides step-by-step guidance.',
    },
    {
      id: 8,
      category: 'security',
      question: 'What security headers should I add?',
      answer: 'Essential security headers include HSTS, CSP, X-Frame-Options, and X-Content-Type-Options. Check our Security Headers Guide in the documentation for implementation examples.',
    },
    {
      id: 9,
      category: 'automation',
      question: 'How do I set up automated scans?',
      answer: 'Go to Automation page, select your website, choose scan frequency (daily/weekly/monthly), enable notifications, and save settings. Scans will run automatically at scheduled times.',
    },
    {
      id: 10,
      category: 'automation',
      question: 'Will I receive alerts for all issues?',
      answer: 'You can customize alerts to receive only critical issues or all issues. Pro users get email and WhatsApp alerts. Free users receive in-dashboard notifications only.',
    },
    {
      id: 11,
      category: 'api',
      question: 'Do you have an API?',
      answer: 'Yes! Enterprise plans include full API access for integrating scan results into your own applications. Check our API documentation for endpoints and authentication.',
    },
    {
      id: 12,
      category: 'api',
      question: 'How do I get API access?',
      answer: 'API access is available for Enterprise plans. Contact our sales team to get started. You\'ll receive API keys and comprehensive documentation.',
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-28 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-6">
            <i className="fas fa-headset text-primary mr-2"></i>
            <span className="text-sm font-semibold text-primary">24/7 Support Available</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions or contact our support team.
          </p>
        </div>
      </section>

      {/* Email Support Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-envelope text-primary text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Support</h2>
            <p className="text-gray-600 mb-6">
              Have a specific issue? Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@complyzo.com" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-all duration-300 font-semibold"
            >
              <i className="fas fa-envelope"></i>
              support@complyzo.com
            </a>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <i className="fas fa-clock mr-1"></i>
                Response time: Usually within 2-4 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-question-circle text-green-600 text-3xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find quick answers to common questions
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`${category.icon} text-sm`}></i>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <details key={faq.id} className="group bg-gray-50 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 pr-4">{faq.question}</h3>
                  <div className="text-gray-400 group-open:rotate-180 transition-transform">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </summary>
                <div className="p-5 pt-0 text-gray-600 border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-400 mt-2">Try different keywords or contact support</p>
            </div>
          )}

          {/* Still Need Help */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
            <a 
              href="mailto:support@complyzo.com" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
            >
              <i className="fas fa-envelope"></i>
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;