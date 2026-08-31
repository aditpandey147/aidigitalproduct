// frontend/src/pages/AISealsMachine.jsx - Updated Left Panel Section
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Package,
  FileText,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Zap,
  Crown,
  Star,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  FileCheck,
  Search,
  Check,
  X,
  Eye,
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// ================================================================
// AI SEALS MACHINE PAGE
// ================================================================

export default function AISealsMachine() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platform, setPlatform] = useState('amazon');
  const [language, setLanguage] = useState('en');
  const [generatedProductInfo, setGeneratedProductInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    bulletPoints: true,
    description: true,
    keywords: true,
    benefits: true,
    features: true,
    targetAudience: true,
    seo: true,
    specifications: true,
    pricing: true,
    upsell: true,
    testimonials: true,
    faq: true,
  });
  const [copiedField, setCopiedField] = useState(null);

  // Platforms
  const platforms = [
    { value: 'amazon', label: 'Amazon' },
    { value: 'ebay', label: 'eBay' },
    { value: 'etsy', label: 'Etsy' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'walmart', label: 'Walmart' },
    { value: 'general', label: 'General' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
  ];

  // ================================================================
  // FETCH PRODUCTS
  // ================================================================

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/products');
      const data = response.data?.data || [];
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // SELECT PRODUCT
  // ================================================================

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setMaterials(null);
    setGeneratedProductInfo(null);
    setIsDropdownOpen(false);
  };

  // ================================================================
  // GENERATE LISTING MATERIALS
  // ================================================================

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading('🧠 Generating listing materials with AI...', { id: 'generate' });

      const response = await api.post('/aiseals/generate', {
        productId: selectedProduct._id,
        platform: platform,
        language: language,
      });

      const data = response.data?.data || {};
      
      setMaterials(data.materials || {});
      setGeneratedProductInfo({
        productId: data.productId,
        productTitle: data.productTitle,
        productNiche: data.productNiche,
        productCategory: data.productCategory,
        coverImage: data.coverImage,
        platform: data.platform,
        language: data.language,
        generatedAt: data.generatedAt,
      });
      
      toast.success('✅ Listing materials generated successfully!', { id: 'generate' });

    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Failed to generate materials: ' + (error.response?.data?.message || error.message), { id: 'generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  // ================================================================
  // COPY TO CLIPBOARD
  // ================================================================

  const handleCopy = (text, field) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  // ================================================================
  // TOGGLE SECTION
  // ================================================================

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ================================================================
  // DOWNLOAD AS JSON
  // ================================================================

  const handleDownload = () => {
    if (!materials) return;
    
    const data = {
      product: generatedProductInfo || {
        productTitle: selectedProduct?.title,
        platform: platform,
        language: language,
      },
      generatedAt: new Date().toISOString(),
      materials: materials
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `listing_materials_${selectedProduct?.title?.replace(/\s/g, '_') || 'product'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  // ================================================================
  // FILTER PRODUCTS
  // ================================================================

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================================================================
  // GET SELECTED PRODUCT DISPLAY NAME
  // ================================================================

  const getSelectedProductDisplay = () => {
    if (!selectedProduct) return 'Select a product...';
    return `${selectedProduct.title || 'Untitled'} ${selectedProduct.niche ? `(${selectedProduct.niche})` : ''}`;
  };

  // ================================================================
  // LOAD PRODUCTS ON MOUNT
  // ================================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          
          {/* ===== HEADER ===== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111111] flex items-center gap-3">
                <Sparkles size={28} className="text-[#FACC15]" />
                AI Seals Machine
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Generate complete product listing materials with AI. Select a product and let AI create everything.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {materials && (
                <>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#222] transition flex items-center gap-2"
                  >
                    <Download size={16} /> Download JSON
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-[#FACC15] text-[#111820] rounded-lg text-sm font-medium hover:bg-[#e5b800] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Regenerate
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            
            {/* ===== LEFT COLUMN - Products Dropdown ===== */}
            <div className="space-y-4">
              {/* Product Selector - Dropdown */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-3">
                  <Package size={18} className="text-[#FACC15]" />
                  Select Product
                  <span className="text-xs text-[#6B7280]">({filteredProducts.length})</span>
                </h2>

                {/* Search Input */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                  />
                </div>

                {/* Dropdown Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-[#E5E7EB] bg-[#F8F9FA] hover:border-[#FACC15] transition"
                >
                  <span className={`text-sm ${selectedProduct ? 'text-[#111111]' : 'text-[#6B7280]'}`}>
                    {getSelectedProductDisplay()}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-[#6B7280] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-lg z-10">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-[#6B7280]">
                        <Package size={24} className="mx-auto opacity-20 mb-2" />
                        <p className="text-sm">No products found</p>
                        <p className="text-xs">Create a product first</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredProducts.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleSelectProduct(product)}
                            className={`w-full px-4 py-3 text-left hover:bg-[#F8F9FA] transition flex items-center gap-3 ${
                              selectedProduct?._id === product._id ? 'bg-[#FACC15]/10' : ''
                            }`}
                          >
                            {/* Product Thumbnail */}
                            <div className="w-10 h-12 rounded overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                              {product.coverImage ? (
                                <img
                                  src={product.coverImage.startsWith('http') ? product.coverImage : `${SERVER_URL}/${product.coverImage}`}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111111] truncate">
                                {product.title || 'Untitled'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#6B7280] truncate">
                                  {product.niche || 'No niche'}
                                </span>
                                {product.category && (
                                  <span className="text-[10px] bg-[#F8F9FA] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                                    {product.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Selected Check */}
                            {selectedProduct?._id === product._id && (
                              <Check size={16} className="text-[#FACC15] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Product Preview */}
                {selectedProduct && (
                  <div className="mt-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                        {selectedProduct.coverImage ? (
                          <img
                            src={selectedProduct.coverImage.startsWith('http') ? selectedProduct.coverImage : `${SERVER_URL}/${selectedProduct.coverImage}`}
                            alt={selectedProduct.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111111] truncate">
                          {selectedProduct.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {selectedProduct.niche || 'No niche'} • {selectedProduct.category || 'No category'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setMaterials(null);
                          setGeneratedProductInfo(null);
                        }}
                        className="p-1 hover:bg-[#E5E7EB] rounded-lg transition"
                      >
                        <X size={14} className="text-[#6B7280]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform & Language Settings */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[#111111] mb-3">Settings</h3>
                
                <label className="text-xs text-[#6B7280] block mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] mb-3"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>

                <label className="text-xs text-[#6B7280] block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                >
                  {languages.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>

                <button
                  onClick={handleGenerate}
                  disabled={!selectedProduct || isGenerating}
                  className="w-full mt-3 py-2.5 bg-gradient-to-r from-[#FACC15] to-[#f59e0b] text-[#111820] rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      {selectedProduct ? 'Generate Materials' : 'Select a Product First'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ===== RIGHT COLUMN - Materials ===== */}
            <div className="space-y-4">
              {!selectedProduct ? (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[#FACC15]/10 flex items-center justify-center mb-4">
                      <Sparkles size={40} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111111]">Select a Product</h3>
                    <p className="text-sm text-[#6B7280] max-w-sm mt-1">
                      Choose a product from the dropdown above to generate AI-powered listing materials.
                    </p>
                    <div className="flex items-center gap-6 mt-4 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">📝 <span>Product Info</span></span>
                      <span className="flex items-center gap-1">🤖 <span>AI Generation</span></span>
                      <span className="flex items-center gap-1">📋 <span>Ready Materials</span></span>
                    </div>
                  </div>
                </div>
              ) : !materials ? (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[#FACC15]/10 flex items-center justify-center mb-4 animate-pulse">
                      <FileText size={40} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111111]">Generate Listing Materials</h3>
                    <p className="text-sm text-[#6B7280] max-w-sm mt-1">
                      Click the <strong>"Generate Materials"</strong> button below to let AI create complete listing materials for <strong>{selectedProduct.title}</strong>.
                    </p>
                    <div className="mt-2 text-xs text-[#6B7280]">
                      <span className="bg-[#F8F9FA] px-2 py-1 rounded">Platform: {platform}</span>
                      <span className="bg-[#F8F9FA] px-2 py-1 rounded ml-2">Language: {language}</span>
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="mt-4 px-6 py-2.5 bg-[#FACC15] text-[#111820] rounded-lg font-medium hover:bg-[#e5b800] transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Generate Materials
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // ===== MATERIALS DISPLAY (same as before) =====
                <div className="space-y-4">
                  
                  {/* Product Preview */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                      {generatedProductInfo?.coverImage ? (
                        <img
                          src={generatedProductInfo.coverImage.startsWith('http') ? generatedProductInfo.coverImage : `${SERVER_URL}/${generatedProductInfo.coverImage}`}
                          alt={generatedProductInfo.productTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : selectedProduct?.coverImage ? (
                        <img
                          src={selectedProduct.coverImage.startsWith('http') ? selectedProduct.coverImage : `${SERVER_URL}/${selectedProduct.coverImage}`}
                          alt={selectedProduct.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#111111] truncate">
                        {generatedProductInfo?.productTitle || selectedProduct?.title}
                      </h3>
                      <p className="text-xs text-[#6B7280]">
                        {generatedProductInfo?.productNiche || selectedProduct?.niche || 'No niche'} • 
                        {generatedProductInfo?.productCategory || selectedProduct?.category || 'No category'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-[#FACC15]/20 text-[#111820] px-2 py-0.5 rounded-full">
                          {generatedProductInfo?.platform || platform}
                        </span>
                        <span className="text-[10px] bg-[#F8F9FA] text-[#6B7280] px-2 py-0.5 rounded-full">
                          {generatedProductInfo?.language || language}
                        </span>
                        <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          ✅ AI Generated
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMaterials(null);
                        setGeneratedProductInfo(null);
                      }}
                      className="p-1.5 hover:bg-[#F8F8F6] rounded-lg transition"
                    >
                      <X size={16} className="text-[#6B7280]" />
                    </button>
                  </div>

                  {/* ===== TITLE SECTION ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('title')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Title & Subtitle</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'title' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.title, 'Title');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.title ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.title && (
                      <div className="px-4 pb-4 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-[#6B7280]">Title</p>
                          <p className="text-sm text-[#111111] mt-1 p-3 bg-[#F8F9FA] rounded-lg">{materials.title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#6B7280]">Subtitle / Tagline</p>
                          <p className="text-sm text-[#111111] mt-1 p-3 bg-[#F8F9FA] rounded-lg">{materials.subtitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#6B7280]">SEO Title</p>
                          <p className="text-sm text-[#111111] mt-1 p-3 bg-[#F8F9FA] rounded-lg">{materials.seoTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#6B7280]">SEO Description</p>
                          <p className="text-sm text-[#111111] mt-1 p-3 bg-[#F8F9FA] rounded-lg">{materials.seoDescription || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== BULLET POINTS ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('bulletPoints')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Bullet Points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'bulletPoints' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.bulletPoints?.join('\n'), 'Bullet Points');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.bulletPoints ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.bulletPoints && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {materials.bulletPoints?.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#111111] p-2 bg-[#F8F9FA] rounded-lg">
                              <span className="text-[#FACC15] mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ===== DESCRIPTION ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('description')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Description</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'description' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.description, 'Description');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.description ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.description && (
                      <div className="px-4 pb-4">
                        <div className="p-3 bg-[#F8F9FA] rounded-lg whitespace-pre-wrap text-sm text-[#111111] max-h-96 overflow-y-auto">
                          {materials.description || 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== KEYWORDS ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('keywords')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Keywords</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'keywords' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.keywords?.join(', '), 'Keywords');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.keywords ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.keywords && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {materials.keywords?.map((keyword, index) => (
                            <span key={index} className="px-3 py-1.5 bg-[#FACC15]/10 text-[#111820] text-xs rounded-full border border-[#FACC15]/20">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== BENEFITS ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('benefits')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Benefits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'benefits' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.benefits?.join('\n'), 'Benefits');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.benefits ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.benefits && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {materials.benefits?.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#111111] p-2 bg-[#F8F9FA] rounded-lg">
                              <span className="text-green-500 mt-0.5">✅</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ===== FEATURES ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('features')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'features' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.features?.join('\n'), 'Features');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.features ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.features && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {materials.features?.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#111111] p-2 bg-[#F8F9FA] rounded-lg">
                              <span className="text-[#FACC15] mt-0.5">⚡</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ===== TARGET AUDIENCE ===== */}
                  <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('targetAudience')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                    >
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#FACC15]" />
                        <span className="text-sm font-semibold text-[#111111]">Target Audience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {copiedField === 'targetAudience' && <Check size={14} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(materials.targetAudience?.join('\n'), 'Target Audience');
                          }}
                          className="p-1 hover:bg-[#F8F8F6] rounded transition"
                        >
                          <Copy size={14} className="text-[#6B7280]" />
                        </button>
                        {expandedSections.targetAudience ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>
                    {expandedSections.targetAudience && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {materials.targetAudience?.map((audience, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-[#111111] p-2 bg-[#F8F9FA] rounded-lg">
                              <span className="text-[#FACC15] mt-0.5">👤</span>
                              <span>{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ===== PRODUCT SPECIFICATIONS ===== */}
                  {materials.productSpecs && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection('specifications')}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 size={18} className="text-[#FACC15]" />
                          <span className="text-sm font-semibold text-[#111111]">Specifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedSections.specifications ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </button>
                      {expandedSections.specifications && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(materials.productSpecs).map(([key, value]) => (
                              <div key={key} className="p-2 bg-[#F8F9FA] rounded-lg">
                                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{key}</p>
                                <p className="text-sm text-[#111111] font-medium">{value || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== PRICING ===== */}
                  {materials.pricing && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection('pricing')}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                      >
                        <div className="flex items-center gap-2">
                          <Crown size={18} className="text-[#FACC15]" />
                          <span className="text-sm font-semibold text-[#111111]">Pricing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedSections.pricing ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </button>
                      {expandedSections.pricing && (
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#F8F9FA] rounded-lg">
                              <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Regular Price</p>
                              <p className="text-lg font-bold text-[#111111]">{materials.pricing.regularPrice || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-[#FACC15]/10 rounded-lg border border-[#FACC15]/20">
                              <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Sale Price</p>
                              <p className="text-lg font-bold text-[#111820]">{materials.pricing.salePrice || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-[#F8F9FA] rounded-lg">
                              <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Currency</p>
                              <p className="text-lg font-bold text-[#111111]">{materials.pricing.currency || 'USD'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== UPSELLS ===== */}
                  {materials.upsell && materials.upsell.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection('upsell')}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                      >
                        <div className="flex items-center gap-2">
                          <Zap size={18} className="text-[#FACC15]" />
                          <span className="text-sm font-semibold text-[#111111]">Upsells</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {copiedField === 'upsell' && <Check size={14} className="text-green-500" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(materials.upsell?.join('\n'), 'Upsells');
                            }}
                            className="p-1 hover:bg-[#F8F8F6] rounded transition"
                          >
                            <Copy size={14} className="text-[#6B7280]" />
                          </button>
                          {expandedSections.upsell ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </button>
                      {expandedSections.upsell && (
                        <div className="px-4 pb-4">
                          <ul className="space-y-2">
                            {materials.upsell.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-[#111111] p-2 bg-[#F8F9FA] rounded-lg">
                                <span className="text-[#FACC15] mt-0.5">💰</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== TESTIMONIALS ===== */}
                  {materials.testimonials && materials.testimonials.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection('testimonials')}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                      >
                        <div className="flex items-center gap-2">
                          <Star size={18} className="text-[#FACC15]" />
                          <span className="text-sm font-semibold text-[#111111]">Testimonials</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedSections.testimonials ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </button>
                      {expandedSections.testimonials && (
                        <div className="px-4 pb-4 space-y-3">
                          {materials.testimonials.map((testimonial, index) => (
                            <div key={index} className="p-3 bg-[#F8F9FA] rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[#111111]">{testimonial.name}</span>
                                <span className="text-[#FACC15] text-sm">{"⭐".repeat(testimonial.rating || 5)}</span>
                              </div>
                              <p className="text-sm text-[#6B7280] mt-1 italic">"{testimonial.review}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== FAQ ===== */}
                  {materials.faq && materials.faq.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection('faq')}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck size={18} className="text-[#FACC15]" />
                          <span className="text-sm font-semibold text-[#111111]">FAQ</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedSections.faq ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </button>
                      {expandedSections.faq && (
                        <div className="px-4 pb-4 space-y-3">
                          {materials.faq.map((item, index) => (
                            <div key={index} className="p-3 bg-[#F8F9FA] rounded-lg">
                              <p className="text-sm font-semibold text-[#111111]">Q: {item.question}</p>
                              <p className="text-sm text-[#6B7280] mt-1">A: {item.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}