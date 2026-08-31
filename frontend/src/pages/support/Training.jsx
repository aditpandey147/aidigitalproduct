// pages/Training.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import videoThumbnail from '../../assets/video-thumbnail.jpg';
import {
  Play,
  Clock,
  BookOpen,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Video,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Calendar,
  BarChart3,
  FileText,
  Globe,
  Lock,
  Database,
  Mail,
  Phone,
  Headphones,
  Settings,
  Rocket,
  Crown,
  Gift,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Info,
  ThumbsUp,
  PlayCircle,
} from 'lucide-react';

const Training = () => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const faqContainerRef = useRef(null);

  // Demo Video Configuration
  const VIDEO_ID = 'YOUR_VIDEO_ID'; // Replace with your YouTube video ID
  const videoUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;

  // Enhanced FAQ Data
  const faqs = [
    // Getting Started (5 FAQs)
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is AI Digital Product Factory and how does it work?',
      answer: 'AI Digital Product Factory is an AI-powered platform that helps you create, design, and launch digital products instantly. Simply enter your product idea, and our AI generates covers, listings, marketing materials, and more. You can create guides, workbooks, planners, checklists, prompt packs, mini-courses, challenges, worksheets, and templates.',
      icon: '🤖'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I create my first product?',
      answer: 'To create your first product, login to your dashboard, click on "Create Product" in the sidebar, fill in the product details (title, niche, audience, problem, outcome), select your product type, and click "Generate". Our AI will create your product and you can download it as a PDF.',
      icon: '➕'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'How long does it take to generate a product?',
      answer: 'A typical product generation takes 2-5 minutes depending on the product type and length. You can continue using the platform while the generation runs in the background. You will see a progress bar showing the status.',
      icon: '⏱️'
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'What product types are available?',
      answer: 'We support multiple product types including: Guides, Workbooks, Planners, Checklists, Prompt Packs, Mini-Courses, Challenges, Worksheets, Templates, and Spreadsheets. Each type has a different structure and format optimized for its purpose.',
      icon: '📊'
    },
    {
      id: 5,
      category: 'Getting Started',
      question: 'Can I edit my product after generation?',
      answer: 'Yes! You can edit your product by going to "My Products", selecting the product, and clicking "Edit". You can modify the title, description, content, and regenerate the product with updated information.',
      icon: '🔄'
    },

    // Product Creation (6 FAQs)
    {
      id: 6,
      category: 'Product Creation',
      question: 'What information do I need to create a product?',
      answer: 'To create a product, you need: Product Title, Niche, Target Audience, Problem your product solves, Desired Outcome, Product Type, Tone (Professional, Casual, Inspiring), and Language. The more detailed your inputs, the better the AI-generated content will be.',
      icon: '📝'
    },
    {
      id: 7,
      category: 'Product Creation',
      question: 'Can I generate a cover image for my product?',
      answer: 'Yes! During product generation, our AI automatically creates a professional cover image for your product. You can also generate custom covers in the Cover Design section. The cover is included in your final PDF download.',
      icon: '🎨'
    },
    {
      id: 8,
      category: 'Product Creation',
      question: 'How do I download my product?',
      answer: 'Once your product is generated and marked as "Completed", go to "My Products", find your product, and click the "PDF" download button. Your product will be downloaded as a beautifully formatted PDF with cover image.',
      icon: '📥'
    },
    {
      id: 9,
      category: 'Product Creation',
      question: 'Can I create multiple products at once?',
      answer: 'Yes! You can create multiple products simultaneously. Each product generation runs independently, and you can track the progress of each product from your dashboard.',
      icon: '📚'
    },
    {
      id: 10,
      category: 'Product Creation',
      question: 'What file formats are supported for download?',
      answer: 'Currently, products are available for download as PDF files. The PDF includes the cover page, table of contents, and all content formatted professionally. We plan to add EPUB and other formats in the future.',
      icon: '📄'
    },
    {
      id: 11,
      category: 'Product Creation',
      question: 'Can I add my own branding to products?',
      answer: 'Yes! You can add your author name and brand name when creating products. These will appear on the cover page and throughout the PDF. In the future, we will offer white-label options for agencies.',
      icon: '🏷️'
    },

    // Cover Design (4 FAQs)
    {
      id: 12,
      category: 'Cover Design',
      question: 'What is the Cover Design Studio?',
      answer: 'The Cover Design Studio is a dedicated tool for creating professional book covers. You can describe your cover vision, and AI will generate stunning cover images. You can also browse and download ready-to-use cover templates.',
      icon: '🎨'
    },
    {
      id: 13,
      category: 'Cover Design',
      question: 'How do I create a cover design?',
      answer: 'Go to Cover Design in the sidebar, enter a prompt describing your cover, click "Enhance with AI" to get an optimized prompt, then click "Generate Image". The AI will create a unique cover based on your description.',
      icon: '🖌️'
    },
    {
      id: 14,
      category: 'Cover Design',
      question: 'Can I use the generated covers for commercial use?',
      answer: 'Yes! All covers generated by our AI are royalty-free and can be used for commercial purposes. You can use them for your products, websites, marketing materials, and more.',
      icon: '💼'
    },
    {
      id: 15,
      category: 'Cover Design',
      question: 'What image formats are supported?',
      answer: 'Cover images are generated in PNG format with high resolution. You can download them directly and use them in your projects. The images are optimized for both web and print use.',
      icon: '🖼️'
    },

    // AI Seals Machine (3 FAQs)
    {
      id: 16,
      category: 'AI Seals Machine',
      question: 'What is the AI Seals Machine?',
      answer: 'The AI Seals Machine generates complete product listing materials with AI. Select a product and AI creates everything: title, description, bullet points, keywords, benefits, features, target audience, SEO meta data, pricing, upsells, testimonials, and FAQ sections.',
      icon: '🔮'
    },
    {
      id: 17,
      category: 'AI Seals Machine',
      question: 'What platforms are supported?',
      answer: 'The AI Seals Machine supports multiple platforms including Amazon, eBay, Etsy, Shopify, Walmart, and General. Each platform gets tailored listing content optimized for that marketplace.',
      icon: '🌐'
    },
    {
      id: 18,
      category: 'AI Seals Machine',
      question: 'Can I customize the generated listings?',
      answer: 'Yes! The generated materials are fully customizable. You can edit the content, add your own touches, and modify it to match your brand voice before publishing to your platform.',
      icon: '✏️'
    },

    // DFY Templates (3 FAQs)
    {
      id: 19,
      category: 'DFY Templates',
      question: 'What are DFY Templates?',
      answer: 'DFY (Done For You) Templates are ready-to-use sales page templates. We provide 50+ professionally designed templates that you can download, customize, and launch in minutes. No design skills needed.',
      icon: '📋'
    },
    {
      id: 20,
      category: 'DFY Templates',
      question: 'What\'s included in a template?',
      answer: 'Each template includes a fully responsive HTML page, CSS stylesheet, optimized for conversions, ready-to-use sales copy, and mobile-first design. Everything you need to create a high-converting sales page.',
      icon: '📦'
    },
    {
      id: 21,
      category: 'DFY Templates',
      question: 'Can I customize the templates?',
      answer: 'Absolutely! All templates are fully customizable. You can edit the HTML/CSS, replace content with your own, update colors to match your brand, add product images and testimonials, and customize it to your needs.',
      icon: '🎨'
    },

    // Plans & Pricing (4 FAQs)
    {
      id: 22,
      category: 'Plans & Pricing',
      question: 'What plans are available?',
      answer: 'We offer multiple plans: Free (basic features, limited products), FE (unlimited access), FE+TURBO (all features), Unlimited Silver (advanced features), Unlimited Gold (premium features), and AI Profit Machine (complete suite). Each plan offers different features and capabilities.',
      icon: '💎'
    },
    {
      id: 23,
      category: 'Plans & Pricing',
      question: 'Can I upgrade my plan later?',
      answer: 'Yes! You can upgrade to a higher plan at any time. The upgrade is instant and you get immediate access to all new features. Your existing products and data are preserved.',
      icon: '⬆️'
    },
    {
      id: 24,
      category: 'Plans & Pricing',
      question: 'Do you offer refunds?',
      answer: 'Yes! We offer a 30-day money-back guarantee. If you are not satisfied with our service for any reason, we will refund your purchase within the first 30 days, no questions asked.',
      icon: '✅'
    },
    {
      id: 25,
      category: 'Plans & Pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers through our payment partners JVZoo and LaunchPad.',
      icon: '💳'
    },

    // General (4 FAQs)
    {
      id: 26,
      category: 'General',
      question: 'How do I contact support?',
      answer: 'You can contact our support team through the Support page in your dashboard, or use the live chat feature available on our website. Our team responds within 24 hours. For urgent issues, live chat is the fastest way to get help.',
      icon: '📧'
    },
    {
      id: 27,
      category: 'General',
      question: 'Can I use AI Digital Product Factory for multiple products?',
      answer: 'Yes! With our Unlimited plans, you can create unlimited products. The Free plan allows you to create a limited number of products. Upgrade to any paid plan for unlimited product creation.',
      icon: '🌐'
    },
    {
      id: 28,
      category: 'General',
      question: 'Do you offer API access?',
      answer: 'API access is available with our premium plans. This allows you to integrate AI Digital Product Factory with your own applications, automate product creation, and retrieve generated content programmatically.',
      icon: '🔌'
    },
    {
      id: 29,
      category: 'General',
      question: 'How do I change my password?',
      answer: 'You can change your password by going to Settings → Security → Change Password. Enter your current password and your new password, then click Save. Make sure to save your new password in a safe place.',
      icon: '🔐'
    }
  ];

  // Get unique categories
  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Get category counts
  const categoryCounts = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {});

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCategory = (category) => {
    const element = document.getElementById(`faq-${category.replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto custom-scroll" ref={faqContainerRef}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            
            {/* ===== HEADER ===== */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#111111] flex items-center gap-3">
                <BookOpen size={28} className="text-[#FACC15]" />
                Training Center
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">Watch our demo video and find answers to common questions</p>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ===== LEFT COLUMN - Main Content (2/3) ===== */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Video Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Video size={20} className="text-[#111820]" />
                      <h2 className="text-lg font-bold text-[#111820]">Demo Video</h2>
                    </div>
                    <p className="text-[#111820]/70 text-sm">Watch this quick demo to get started</p>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg group">
                      {!isVideoPlaying ? (
                        <>
                          {!thumbnailError && (
                            <img
                              src={videoThumbnail}
                              alt="Demo Video Thumbnail"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={() => setThumbnailError(true)}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          
                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                          >
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-[#FACC15]/30 animate-ping"></div>
                              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xl border-2 border-white/30">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FACC15] flex items-center justify-center shadow-lg group-hover:bg-[#F59E0B] transition">
                                  <Play size={28} className="text-[#111820] ml-1" />
                                </div>
                              </div>
                            </div>
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <p className="text-white font-semibold text-sm flex items-center gap-2">
                              <PlayCircle size={16} className="text-[#FACC15]" />
                              Watch Demo Video
                            </p>
                            <p className="text-gray-300 text-xs">Click play to watch the demo • ~5 minutes</p>
                          </div>

                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2 border border-white/10">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            HD
                          </div>
                        </>
                      ) : (
                        <iframe
                          src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                          title="Demo Video"
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={20} className="text-[#111820]" />
                      <h2 className="text-lg font-bold text-[#111820]">Frequently Asked Questions</h2>
                    </div>
                    <p className="text-[#111820]/70 text-sm">Find answers to common questions</p>
                  </div>

                  <div className="p-4 md:p-6">
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B7280]" />
                      <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-[#F8F9FA]"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6B7280] hover:text-[#111111] transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#6B7280] mb-4">
                      Showing {filteredFaqs.length} of {faqs.length} FAQs
                    </p>

                    {Object.keys(groupedFaqs).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-[#111111]">No FAQs Found</h3>
                        <p className="text-[#6B7280] text-sm">Try adjusting your search or filter</p>
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                          className="mt-4 text-sm text-[#FACC15] hover:text-[#F59E0B] font-medium"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                        <div key={category} className="mb-6 last:mb-0">
                          <h3 
                            id={`faq-${category.replace(/\s+/g, '-')}`}
                            className="text-sm font-semibold text-[#111111] bg-[#F8F9FA] px-4 py-2 rounded-lg mb-3 flex items-center gap-2"
                          >
                            <FolderOpen size={16} className="text-[#FACC15]" />
                            {category} ({categoryFaqs.length})
                          </h3>
                          
                          <div className="space-y-2">
                            {categoryFaqs.map((faq) => (
                              <div 
                                key={faq.id}
                                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                                  expandedFaq === faq.id
                                    ? 'border-[#FACC15] shadow-md bg-[#FACC15]/5'
                                    : 'border-[#E5E7EB] hover:border-[#FACC15]/50'
                                }`}
                              >
                                <button
                                  onClick={() => toggleFaq(faq.id)}
                                  className="w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-[#F8F9FA]/50 transition"
                                >
                                  <span className="text-xl mt-0.5">{faq.icon}</span>
                                  <span className="text-sm font-medium text-[#111111] pr-4 flex-1">
                                    {faq.question}
                                  </span>
                                  <span className={`text-[#6B7280] transition-transform duration-300 flex-shrink-0 mt-1 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={18} />
                                  </span>
                                </button>
                                
                                {expandedFaq === faq.id && (
                                  <div className="px-4 pb-3 pt-0 border-t border-[#E5E7EB]">
                                    <p className="text-sm text-[#6B7280] leading-relaxed">
                                      {faq.answer}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN - Sidebar (1/3) ===== */}
              <div className="lg:col-span-1 space-y-4 overflow-hidden sticky top-4">
                
                {/* Categories */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-4 py-3">
                    <h3 className="text-sm font-bold text-[#111820] flex items-center gap-2">
                      <FolderOpen size={16} />
                      Categories
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1 ${
                        selectedCategory === 'all'
                          ? 'bg-[#FACC15]/20 text-[#111820]'
                          : 'text-[#6B7280] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>📋 All Questions</span>
                        <span className="text-xs bg-[#F8F9FA] text-[#6B7280] px-2 py-0.5 rounded-full">
                          {faqs.length}
                        </span>
                      </div>
                    </button>

                    {categories.filter(c => c !== 'all').map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          scrollToCategory(category);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1 ${
                          selectedCategory === category
                            ? 'bg-[#FACC15]/20 text-[#111820]'
                            : 'text-[#6B7280] hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="text-xs bg-[#F8F9FA] text-[#6B7280] px-2 py-0.5 rounded-full">
                            {categoryCounts[category] || 0}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Need Help */}
                <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-2xl border border-[#FACC15]/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones size={18} className="text-[#FACC15]" />
                    <h3 className="text-sm font-bold text-[#111820]">Need Help?</h3>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3">
                    Still have questions? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="/support"
                      className="w-full flex items-center justify-center gap-2 bg-[#FACC15] text-[#111820] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F59E0B] transition"
                    >
                      <MessageCircle size={16} />
                      Contact Support
                      <ArrowRight size={14} />
                    </a>
                    <a
                      href="/dashboard"
                      className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-[#6B7280] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#F8F9FA] transition"
                    >
                      <Rocket size={16} />
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#FACC15] text-[#111820] p-3 rounded-full shadow-lg hover:bg-[#F59E0B] transition z-50"
        >
          <ChevronUp size={20} />
        </button>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scroll {
          scroll-behavior: smooth;
        }
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Training;