// frontend/src/pages/ProductEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileText,
  Layout,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Palette,
  Plus,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Trash2,
  BookOpen,
  List,
  CheckCircle,
  Clock,
  AlertCircle,
  Share2,
  Globe,
  Copy,
  Calendar,
  Target,
  Check,
  X,
  Image as ImageIcon,
  FolderOpen,
  File
} from 'lucide-react';

const ProductEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('product');
  const [marketingData, setMarketingData] = useState(null);
  const [loadingMarketing, setLoadingMarketing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // ================================================================
  // FETCH PRODUCT
  // ================================================================

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      let productData = response.data?.data || response.data;
      
      try {
        const marketingResponse = await api.get(`/products/${productId}/marketing`);
        setMarketingData(marketingResponse.data.data);
      } catch (error) {
        console.log('No marketing data available');
      }
      
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // PDF PREVIEW
  // ================================================================

  const handlePdfPreview = async () => {
    if (!productId) return;
    
    try {
      setLoadingPdf(true);
      const response = await api.get(`/products/${productId}/download`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPdfPreview(true);
    } catch (error) {
      console.error('PDF preview error:', error);
      toast.error('Failed to load PDF preview');
    } finally {
      setLoadingPdf(false);
    }
  };

  // ================================================================
  // DOWNLOAD PDF
  // ================================================================

  const downloadPDF = async () => {
    if (!productId) return;
    
    try {
      const response = await api.get(`/products/${productId}/download`, {
        responseType: 'blob',
      });
      
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${product.title || 'product'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  // ================================================================
  // COPY TO CLIPBOARD
  // ================================================================

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // ================================================================
  // GET IMAGE URL
  // ================================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${SERVER_URL}/${imagePath}`;
  };

  // ================================================================
  // HELPERS
  // ================================================================

  const getStatusConfig = (status) => {
    const map = {
      'completed': { 
        icon: CheckCircle, 
        label: 'Ready', 
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      'in-progress': { 
        icon: Clock, 
        label: 'In Progress', 
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      'draft': { 
        icon: FileText, 
        label: 'Draft', 
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      },
      'processing': { 
        icon: RefreshCw, 
        label: 'Processing', 
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      'generating': { 
        icon: Sparkles, 
        label: 'Generating', 
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      },
      'failed': { 
        icon: AlertCircle, 
        label: 'Failed', 
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return map[status] || map['draft'];
  };

  const getTypeColor = (type) => {
    const map = {
      'guide': 'bg-blue-50 text-blue-700 border-blue-200',
      'ebook': 'bg-purple-50 text-purple-700 border-purple-200',
      'workbook': 'bg-green-50 text-green-700 border-green-200',
      'planner': 'bg-orange-50 text-orange-700 border-orange-200',
      'checklists': 'bg-teal-50 text-teal-700 border-teal-200',
      'templates': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'spreadsheets': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'prompt-packs': 'bg-pink-50 text-pink-700 border-pink-200',
      'mini-courses': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'challenges': 'bg-red-50 text-red-700 border-red-200',
      'worksheets': 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return map[type?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTypeEmoji = (type) => {
    const map = {
      'guide': '📖',
      'ebook': '📚',
      'workbook': '📓',
      'planner': '📅',
      'checklists': '✅',
      'templates': '📋',
      'spreadsheets': '📊',
      'prompt-packs': '💬',
      'mini-courses': '🎓',
      'challenges': '🏆',
      'worksheets': '📝'
    };
    return map[type?.toLowerCase()] || '📄';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    if (!product) return { chapters: 0, pages: 0, downloads: 0 };
    return {
      chapters: product.chapters?.length || product.outline?.length || 0,
      pages: Math.floor((product.chapters?.length || 0) * 8) + 20,
      downloads: product.downloads || 0
    };
  };

  const stats = getStats();
  const statusConfig = getStatusConfig(product?.status);
  const coverImageUrl = getImageUrl(product?.coverImage);

  // ================================================================
  // COPY BUTTON COMPONENT
  // ================================================================

  const CopyButton = ({ text, field, className = '' }) => {
    const isCopied = copiedField === field;
    return (
      <button
        onClick={() => copyToClipboard(text, field)}
        className={`p-1.5 rounded-lg transition ${isCopied ? 'bg-green-100 text-green-600' : 'hover:bg-[#F8F8F6] text-[#6B7280]'} ${className}`}
        title="Copy to clipboard"
      >
        {isCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    );
  };

  // ================================================================
  // IMAGE GALLERY MODAL
  // ================================================================

  const ImageGalleryModal = ({ isOpen, onClose, image, title }) => {
    if (!isOpen || !image) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="relative max-w-4xl w-full max-h-[90vh]">
          <button 
            onClick={onClose} 
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition p-2"
          >
            <X size={24} />
          </button>
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-semibold text-[#111111]">{title || 'Image Preview'}</h3>
              <button onClick={onClose} className="p-1 hover:bg-[#F8F8F6] rounded-lg transition">
                <X size={20} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="p-4 flex justify-center items-center bg-[#F8F8F6]">
              <img 
                src={image} 
                alt={title || 'Image'} 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ================================================================
  // MARKETING KIT MODAL
  // ================================================================

  const MarketingKitModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <Megaphone size={24} className="text-[#FACC15]" />
                Marketing Kit
              </h2>
              <p className="text-sm text-[#6B7280]">All marketing assets for your product</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8F8F6] rounded-xl transition">
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            {/* Emails */}
            {data.emails?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Mail size={16} className="text-[#FACC15]" />
                  Emails ({data.emails.length})
                </h3>
                <div className="space-y-3">
                  {data.emails.map((email, i) => (
                    <div key={i} className="bg-[#F8F8F6] rounded-xl p-4 hover:shadow-sm transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#FACC15] uppercase">{email.type}</span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs text-[#6B7280]">Subject: {email.subject}</span>
                          </div>
                          <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{email.body}</p>
                        </div>
                        <CopyButton text={email.body} field={`email-${i}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Posts */}
            {data.social?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Share2 size={16} className="text-[#FACC15]" />
                  Social Posts ({data.social.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.social.map((post, i) => (
                    <div key={i} className="bg-[#F8F8F6] rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-medium capitalize text-[#FACC15]">{post.platform}</span>
                            {post.hashtags?.length > 0 && (
                              <span className="text-xs text-[#6B7280]">{post.hashtags.join(' ')}</span>
                            )}
                          </div>
                          <p className="text-sm text-[#6B7280]">{post.content}</p>
                        </div>
                        <CopyButton text={post.content} field={`social-${i}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ads */}
            {data.ads?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={16} className="text-[#FACC15]" />
                  Ad Copy ({data.ads.length})
                </h3>
                <div className="space-y-3">
                  {data.ads.map((ad, i) => (
                    <div key={i} className="bg-[#F8F8F6] rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#FACC15] uppercase">{ad.type}</span>
                          </div>
                          <p className="text-sm font-medium text-[#111111]">{ad.headline}</p>
                          <p className="text-sm text-[#6B7280] mt-1">{ad.body}</p>
                          <div className="mt-2 inline-block bg-[#FACC15] px-3 py-1 rounded-lg text-xs font-bold text-[#111111]">
                            {ad.cta}
                          </div>
                        </div>
                        <CopyButton text={`${ad.headline}\n${ad.body}`} field={`ad-${i}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO */}
            {data.seo && (
              <div>
                <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-[#FACC15]" />
                  SEO Content
                </h3>
                <div className="bg-[#F8F8F6] rounded-xl p-4 space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-[#6B7280]">Meta Title</div>
                        <div className="text-sm text-[#111111]">{data.seo.metaTitle}</div>
                      </div>
                      <CopyButton text={data.seo.metaTitle} field="seo-title" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-[#6B7280]">Meta Description</div>
                        <div className="text-sm text-[#111111]">{data.seo.metaDescription}</div>
                      </div>
                      <CopyButton text={data.seo.metaDescription} field="seo-description" />
                    </div>
                  </div>
                  {data.seo.keywords?.length > 0 && (
                    <div>
                      <div className="text-xs text-[#6B7280]">Keywords</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.seo.keywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#FACC15]/20 rounded-full text-xs text-[#111111]">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.seo.blogIdeas?.length > 0 && (
                    <div>
                      <div className="text-xs text-[#6B7280]">Blog Ideas</div>
                      <ul className="space-y-1 mt-1">
                        {data.seo.blogIdeas.map((idea, i) => (
                          <li key={i} className="text-sm text-[#6B7280] flex items-start gap-2">
                            <span className="text-[#FACC15]">•</span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const allText = JSON.stringify(data, null, 2);
                copyToClipboard(allText, 'all');
              }}
              className="w-full py-3 bg-[#FACC15] text-[#111111] rounded-xl font-semibold hover:bg-[#e5b800] transition flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copy All Marketing Content
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ================================================================
  // PDF PREVIEW MODAL
  // ================================================================

  const PdfPreviewModal = ({ isOpen, onClose, pdfUrl, title }) => {
    if (!isOpen || !pdfUrl) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <FileText size={20} className="text-[#FACC15]" />
                {title || 'PDF Preview'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={downloadPDF} className="px-4 py-2 bg-[#FACC15] text-[#111111] rounded-xl hover:bg-[#e5b800] transition font-medium text-sm flex items-center gap-2">
                <Download size={16} />
                Download
              </button>
              <button onClick={onClose} className="p-2 hover:bg-[#F8F8F6] rounded-xl transition">
                <X size={20} className="text-[#6B7280]" />
              </button>
            </div>
          </div>

          <div className="p-4 h-[75vh]">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-xl border border-[#E5E7EB]"
              title="PDF Preview"
            />
          </div>
        </div>
      </div>
    );
  };

  // ================================================================
  // LOADING STATE
  // ================================================================

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F8F6]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B7280] text-sm">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-[#F8F8F6]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-[#111111]">Product Not Found</h2>
            <p className="text-[#6B7280]">The product you're looking for doesn't exist</p>
            <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2.5 bg-[#FACC15] text-[#111111] rounded-xl hover:bg-[#e5b800] transition">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // MAIN RENDER
  // ================================================================

  return (
    <div className="flex h-screen bg-[#F8F8F6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            
            {/* ===== HEADER ===== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/products')} className="p-2 hover:bg-white rounded-xl transition border border-[#E5E7EB]">
                  <ArrowLeft size={20} className="text-[#6B7280]" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Cover" className="w-12 h-16 object-cover rounded-lg border border-[#E5E7EB]" />
                    ) : (
                      <span className="text-3xl">{getTypeEmoji(product.productType)}</span>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-[#111111]">{product.title || 'Untitled'}</h1>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getTypeColor(product.productType)}`}>
                      {product.productType || 'Product'}
                    </span>
                    <span className="text-sm text-[#6B7280]">{product.niche || 'General'}</span>
                    <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                    <span className={`flex items-center gap-1.5 text-sm ${statusConfig.color}`}>
                      <statusConfig.icon size={16} />
                      {statusConfig.label}
                    </span>
                    {product.progress !== undefined && product.status !== 'completed' && (
                      <span className="text-xs text-[#6B7280]">{product.progress}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.status === 'completed' && (
                  <>
                    <button onClick={handlePdfPreview} className="px-4 py-2 bg-[#111111] hover:bg-[#222] text-white rounded-xl transition font-medium text-sm flex items-center gap-2">
                      <Eye size={16} /> Preview PDF
                    </button>
                    <button onClick={downloadPDF} className="px-4 py-2 bg-[#FACC15] hover:bg-[#e5b800] text-[#111111] rounded-xl transition font-medium text-sm flex items-center gap-2">
                      <Download size={16} /> Download PDF
                    </button>
                    <button onClick={() => setShowMarketingModal(true)} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition font-medium text-sm flex items-center gap-2">
                      <Megaphone size={16} /> Marketing Kit
                    </button>
                  </>
                )}
                <button onClick={() => toast.success('Regenerating product...')} className="px-4 py-2 bg-[#111111] hover:bg-[#222] text-white rounded-xl transition font-medium text-sm flex items-center gap-2">
                  <RefreshCw size={16} /> Regenerate
                </button>
              </div>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><BookOpen size={20} className="text-blue-600" /></div>
                  <div><div className="text-xl font-bold text-[#111111]">{stats.chapters}</div><div className="text-xs text-[#6B7280]">Chapters</div></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><FileText size={20} className="text-green-600" /></div>
                  <div><div className="text-xl font-bold text-[#111111]">{stats.pages}</div><div className="text-xs text-[#6B7280]">Pages</div></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Download size={20} className="text-yellow-600" /></div>
                  <div><div className="text-xl font-bold text-[#111111]">{stats.downloads}</div><div className="text-xs text-[#6B7280]">Downloads</div></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-purple-600" /></div>
                  <div><div className="text-xs font-medium text-[#6B7280]">Created</div><div className="text-xs text-[#111111]">{formatDate(product.createdAt)}</div></div>
                </div>
              </div>
            </div>

            {/* ===== TABS - ONLY 3 ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="border-b border-[#E5E7EB] flex overflow-x-auto bg-[#F8F8F6]">
                {[
                  { id: 'product', label: 'Product', icon: FileText },
                  { id: 'images', label: 'Images', icon: ImageIcon },
                  { id: 'marketing', label: 'Marketing', icon: Megaphone }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3.5 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                        isActive ? 'text-[#111111] border-b-2 border-[#FACC15] bg-white' : 'text-[#6B7280] hover:text-[#111111] hover:bg-white/50'
                      }`}
                    >
                      <Icon size={18} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ===== TAB CONTENT ===== */}
              <div className="p-6">
                
                {/* ============================================================ */}
                {/* TAB 1: PRODUCT */}
                {/* ============================================================ */}
                {activeTab === 'product' && (
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => toast.success('Edit content coming soon!')} className="p-4 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-xl hover:bg-[#FACC15]/20 transition text-sm font-medium flex items-center gap-2 justify-center">
                          <Edit size={18} /> Edit Content
                        </button>
                        <button onClick={handlePdfPreview} className="p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition text-sm font-medium flex items-center gap-2 justify-center">
                          <Eye size={18} /> Preview PDF
                        </button>
                        <button onClick={downloadPDF} className="p-4 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-xl hover:bg-[#FACC15]/20 transition text-sm font-medium flex items-center gap-2 justify-center">
                          <Download size={18} /> Download PDF
                        </button>
                        <button onClick={() => setShowMarketingModal(true)} className="p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition text-sm font-medium flex items-center gap-2 justify-center">
                          <Megaphone size={18} /> Marketing Kit
                        </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Product Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Title</div><div className="font-medium text-[#111111]">{product.title}</div></div>
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Type</div><div className="font-medium text-[#111111] capitalize">{product.productType}</div></div>
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Niche</div><div className="font-medium text-[#111111] capitalize">{product.niche}</div></div>
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Status</div><div className={`flex items-center gap-2 font-medium ${statusConfig.color}`}><statusConfig.icon size={16} /> {statusConfig.label}</div></div>
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Audience</div><div className="font-medium text-[#111111]">{product.audience || 'N/A'}</div></div>
                        <div className="bg-[#F8F8F6] rounded-xl p-4"><div className="text-xs text-[#6B7280] mb-1">Language</div><div className="font-medium text-[#111111]">{product.language || 'English'}</div></div>
                      </div>
                    </div>

                    {/* Outline */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <List size={16} className="text-[#FACC15]" /> Outline
                      </h3>
                      {(product.outline || product.chapters)?.length > 0 ? (
                        <div className="space-y-3">
                          {(product.outline || product.chapters).map((item, index) => (
                            <div key={index} className="bg-[#F8F8F6] rounded-xl p-4 flex items-start gap-4 hover:bg-[#F0F0F0] transition">
                              <div className="w-8 h-8 bg-[#FACC15]/20 rounded-lg flex items-center justify-center text-xs font-bold text-[#FACC15] flex-shrink-0">{index + 1}</div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-[#111111]">{item.title}</h4>
                                {item.description && <p className="text-xs text-[#6B7280] mt-0.5">{item.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-[#F8F8F6] rounded-xl">
                          <p className="text-[#6B7280] text-sm">No outline available</p>
                        </div>
                      )}
                    </div>

                    {/* Generating Status */}
                    {product.status === 'generating' && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700">Generating Product</span>
                          <span className="text-sm font-bold text-purple-700">{product.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${product.progress || 0}%` }}></div>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">Please wait while your product is being created...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 2: IMAGES */}
                {/* ============================================================ */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    {/* Cover Image */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FolderOpen size={16} className="text-[#FACC15]" /> Cover Image
                      </h3>
                      {product.coverImage ? (
                        <div className="relative w-48 h-64 rounded-xl overflow-hidden border border-[#E5E7EB] group cursor-pointer"
                          onClick={() => setSelectedImage(getImageUrl(product.coverImage))}
                        >
                          <img 
                            src={getImageUrl(product.coverImage)} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Click to enlarge</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#F8F8F6] rounded-xl p-8 text-center border-2 border-dashed border-[#E5E7EB]">
                          <div className="text-5xl mb-3">🖼️</div>
                          <p className="text-[#6B7280]">No cover image available</p>
                        </div>
                      )}
                    </div>

                    {/* Mockups */}
                    {product.mockups?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <ImageIcon size={16} className="text-[#FACC15]" /> Mockups ({product.mockups.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.mockups.map((mockup, index) => (
                            <div key={index} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden group cursor-pointer hover:shadow-lg transition"
                              onClick={() => setSelectedImage(getImageUrl(mockup.path))}
                            >
                              <div className="relative h-48 bg-[#F8F8F6]">
                                <img 
                                  src={getImageUrl(mockup.path)} 
                                  alt={`Mockup ${index + 1}`} 
                                  className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">Click to enlarge</span>
                                </div>
                              </div>
                              <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-medium text-[#6B7280] capitalize">{mockup.type || 'Mockup'}</span>
                                  <span className="text-xs text-[#6B7280] ml-2">• Mockup {index + 1}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(mockup.prompt || '', `mockup-prompt-${index}`);
                                  }}
                                  className="text-xs text-[#FACC15] hover:text-[#e5b800] font-medium"
                                >
                                  Copy Prompt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Posters */}
                    {product.posters?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Megaphone size={16} className="text-[#FACC15]" /> Posters ({product.posters.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.posters.map((poster, index) => (
                            <div key={index} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden group cursor-pointer hover:shadow-lg transition"
                              onClick={() => setSelectedImage(getImageUrl(poster.path))}
                            >
                              <div className="relative h-48 bg-[#F8F8F6]">
                                <img 
                                  src={getImageUrl(poster.path)} 
                                  alt={`Poster ${index + 1}`} 
                                  className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">Click to enlarge</span>
                                </div>
                              </div>
                              <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-medium text-[#6B7280] capitalize">{poster.type || 'Poster'}</span>
                                  <span className="text-xs text-[#6B7280] ml-2">• Poster {index + 1}</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(poster.prompt || '', `poster-prompt-${index}`);
                                  }}
                                  className="text-xs text-[#FACC15] hover:text-[#e5b800] font-medium"
                                >
                                  Copy Prompt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!product.coverImage && product.mockups?.length === 0 && product.posters?.length === 0 && (
                      <div className="text-center py-12 bg-[#F8F8F6] rounded-xl border-2 border-dashed border-[#E5E7EB]">
                        <div className="text-6xl mb-4">📷</div>
                        <p className="text-[#6B7280]">No images available for this product</p>
                        <p className="text-sm text-[#6B7280] mt-1">Images will appear here once generation is complete</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 3: MARKETING */}
                {/* ============================================================ */}
                {activeTab === 'marketing' && (
                  <div className="space-y-4">
                    {marketingData ? (
                      <div className="space-y-6">
                        {/* Emails */}
                        {marketingData.emails?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Mail size={16} className="text-[#FACC15]" /> Emails ({marketingData.emails.length})
                            </h3>
                            <div className="space-y-3">
                              {marketingData.emails.map((email, i) => (
                                <div key={i} className="bg-[#F8F8F6] rounded-xl p-4 hover:shadow-sm transition">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-[#FACC15] uppercase">{email.type}</span>
                                        <span className="text-xs text-[#6B7280]">•</span>
                                        <span className="text-xs text-[#6B7280]">Subject: {email.subject}</span>
                                      </div>
                                      <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{email.body}</p>
                                    </div>
                                    <CopyButton text={email.body} field={`email-${i}`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Social Posts */}
                        {marketingData.social?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Share2 size={16} className="text-[#FACC15]" /> Social Posts ({marketingData.social.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {marketingData.social.map((post, i) => (
                                <div key={i} className="bg-[#F8F8F6] rounded-xl p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-medium capitalize text-[#FACC15]">{post.platform}</span>
                                        {post.hashtags?.length > 0 && <span className="text-xs text-[#6B7280]">{post.hashtags.join(' ')}</span>}
                                      </div>
                                      <p className="text-sm text-[#6B7280]">{post.content}</p>
                                    </div>
                                    <CopyButton text={post.content} field={`social-${i}`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ads */}
                        {marketingData.ads?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Target size={16} className="text-[#FACC15]" /> Ad Copy ({marketingData.ads.length})
                            </h3>
                            <div className="space-y-3">
                              {marketingData.ads.map((ad, i) => (
                                <div key={i} className="bg-[#F8F8F6] rounded-xl p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-[#FACC15] uppercase">{ad.type}</span></div>
                                      <p className="text-sm font-medium text-[#111111]">{ad.headline}</p>
                                      <p className="text-sm text-[#6B7280] mt-1">{ad.body}</p>
                                      <div className="mt-2 inline-block bg-[#FACC15] px-3 py-1 rounded-lg text-xs font-bold text-[#111111]">{ad.cta}</div>
                                    </div>
                                    <CopyButton text={`${ad.headline}\n${ad.body}`} field={`ad-${i}`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SEO */}
                        {marketingData.seo && (
                          <div>
                            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Globe size={16} className="text-[#FACC15]" /> SEO Content
                            </h3>
                            <div className="bg-[#F8F8F6] rounded-xl p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div><div className="text-xs text-[#6B7280]">Meta Title</div><div className="text-sm text-[#111111]">{marketingData.seo.metaTitle}</div></div>
                                <CopyButton text={marketingData.seo.metaTitle} field="seo-title" />
                              </div>
                              <div className="flex items-start justify-between">
                                <div><div className="text-xs text-[#6B7280]">Meta Description</div><div className="text-sm text-[#111111]">{marketingData.seo.metaDescription}</div></div>
                                <CopyButton text={marketingData.seo.metaDescription} field="seo-description" />
                              </div>
                              {marketingData.seo.keywords?.length > 0 && (
                                <div><div className="text-xs text-[#6B7280]">Keywords</div><div className="flex flex-wrap gap-1 mt-1">{marketingData.seo.keywords.map((keyword, i) => <span key={i} className="px-2 py-0.5 bg-[#FACC15]/20 rounded-full text-xs text-[#111111]">{keyword}</span>)}</div></div>
                              )}
                              {marketingData.seo.blogIdeas?.length > 0 && (
                                <div><div className="text-xs text-[#6B7280]">Blog Ideas</div><ul className="space-y-1 mt-1">{marketingData.seo.blogIdeas.map((idea, i) => <li key={i} className="text-sm text-[#6B7280] flex items-start gap-2"><span className="text-[#FACC15]">•</span> {idea}</li>)}</ul></div>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const allText = JSON.stringify(marketingData, null, 2);
                            copyToClipboard(allText, 'all-marketing');
                          }}
                          className="w-full py-3 bg-[#FACC15] text-[#111111] rounded-xl font-semibold hover:bg-[#e5b800] transition flex items-center justify-center gap-2"
                        >
                          <Copy size={18} />
                          Copy All Marketing Content
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">📣</div>
                        <p className="text-[#6B7280]">No marketing content available</p>
                        <button onClick={() => toast.success('Marketing generation coming soon!')} className="mt-3 px-4 py-2 bg-[#FACC15] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#e5b800] transition">
                          Generate Marketing Kit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== PDF PREVIEW MODAL ===== */}
      <PdfPreviewModal 
        isOpen={showPdfPreview} 
        onClose={() => { 
          setShowPdfPreview(false); 
          if (pdfUrl) { 
            URL.revokeObjectURL(pdfUrl); 
            setPdfUrl(null); 
          } 
        }} 
        pdfUrl={pdfUrl} 
        title={product?.title} 
      />

      {/* ===== MARKETING KIT MODAL ===== */}
      <MarketingKitModal 
        isOpen={showMarketingModal} 
        onClose={() => setShowMarketingModal(false)} 
        data={marketingData} 
      />

      {/* ===== IMAGE GALLERY MODAL ===== */}
      <ImageGalleryModal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        image={selectedImage} 
        title="Image Preview"
      />
    </div>
  );
};

export default ProductEditor;