import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/nav-logo.png'

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const footerSections = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'How it Works', path: '/how-it-works' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Affiliates', path: '/affiliates' },
        { name: 'Contact', path: '/contact' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Documentation', path: '/docs' },
        { name: 'Support', path: '/support' },
        { name: 'Refunds', path: '/refund' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Cookie Policy', path: '/cookies' },
      ]
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-36">
                <img src={logo} alt="complyzo logo" />
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              AI-powered website monitoring and fixing platform.
            </p>
          </div>

          {/* Link Columns */}
          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} ComplyzoAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/complyzo" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fa-brands fa-x-twitter text-sm"></i>
            </a>
            <a href="https://linkedin.com/company/complyzo" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fa-brands fa-linkedin-in text-sm"></i>
            </a>
            <a href="https://github.com/complyzo" className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fa-brands fa-github text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;