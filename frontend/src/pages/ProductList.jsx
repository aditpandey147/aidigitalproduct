// frontend/src/pages/ProductList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  Download,
  Eye,
  Trash2,
  FileText,
  Megaphone,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Calendar,
  FolderOpen,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";

const ProductList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [marketingData, setMarketingData] = useState({});
  const [loadingMarketing, setLoadingMarketing] = useState({});

  // ✅ Get server URL
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  // ✅ Helper: Get full cover image URL
  const getCoverImageUrl = (coverImagePath) => {
    if (!coverImagePath) return null;

    if (
      coverImagePath.startsWith("http://") ||
      coverImagePath.startsWith("https://")
    ) {
      return coverImagePath;
    }

    let cleanPath = coverImagePath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    if (cleanPath.startsWith("uploads/")) {
      return `${SERVER_URL}/${cleanPath}`;
    }

    if (cleanPath.startsWith("images/")) {
      return `${SERVER_URL}/${cleanPath}`;
    }

    return `${SERVER_URL}/${cleanPath}`;
  };

  // ✅ Helper: Get fallback emoji
  const getFallbackEmoji = (productType) => {
    const map = {
      ebook: "📚",
      guide: "📖",
      workbook: "📓",
      planner: "📅",
      checklists: "✅",
      templates: "📋",
      spreadsheets: "📊",
      "prompt-packs": "💬",
      "prompt packs": "💬",
      "mini-courses": "🎓",
      challenges: "🏆",
      worksheets: "📝",
      cover: "📄",
    };
    return map[productType?.toLowerCase()] || "📄";
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");

      let productsData = [];

      if (response.data?.data?.products) {
        productsData = response.data.data.products;
      } else if (response.data?.data) {
        productsData = response.data.data;
      } else if (response.data?.products) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        productsData = [];
      }

      if (!Array.isArray(productsData)) {
        if (productsData._id || productsData.id) {
          productsData = [productsData];
        } else {
          productsData = [];
        }
      }

      console.log(`📦 Total products: ${productsData.length}`);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketingContent = async (productId) => {
    if (marketingData[productId]) {
      setMarketingData((prev) => {
        const newData = { ...prev };
        delete newData[productId];
        return newData;
      });
      setExpandedProduct(null);
      return;
    }

    setLoadingMarketing((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await api.get(`/products/${productId}/marketing`);
      const data = response.data.data;

      setMarketingData((prev) => ({ ...prev, [productId]: data }));
      setExpandedProduct(productId);
      toast.success("Marketing content loaded");
    } catch (error) {
      console.error("Error fetching marketing:", error);
      toast.error("Failed to load marketing content");
    } finally {
      setLoadingMarketing((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      generating: "bg-purple-100 text-purple-700 border-purple-200",
      failed: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return map[status] || map["draft"];
  };

  const getStatusIcon = (status) => {
    const map = {
      completed: <CheckCircle size={14} className="text-emerald-600" />,
      "in-progress": <Clock size={14} className="text-amber-600" />,
      draft: <FileText size={14} className="text-slate-600" />,
      processing: <Sparkles size={14} className="text-blue-600" />,
      generating: (
        <Sparkles size={14} className="text-purple-600 animate-pulse" />
      ),
      failed: <AlertCircle size={14} className="text-rose-600" />,
    };
    return map[status] || <FileText size={14} className="text-slate-600" />;
  };

  const getStatusLabel = (status) => {
    const map = {
      completed: "Ready",
      "in-progress": "In Progress",
      draft: "Draft",
      processing: "Processing",
      generating: "Generating",
      failed: "Failed",
    };
    return map[status] || status;
  };

  const getTypeEmoji = (type) => {
    const map = {
      ebook: "📚",
      guide: "📖",
      workbook: "📓",
      planner: "📅",
      checklists: "✅",
      templates: "📋",
      spreadsheets: "📊",
      "prompt-packs": "💬",
      "prompt packs": "💬",
      "mini-courses": "🎓",
      challenges: "🏆",
      worksheets: "📝",
    };
    return map[type?.toLowerCase()] || "📄";
  };

  const getTypeColor = (type) => {
    const map = {
      ebook: "bg-violet-100 text-violet-700",
      guide: "bg-blue-100 text-blue-700",
      workbook: "bg-emerald-100 text-emerald-700",
      planner: "bg-orange-100 text-orange-700",
      checklists: "bg-teal-100 text-teal-700",
      templates: "bg-indigo-100 text-indigo-700",
      spreadsheets: "bg-emerald-100 text-emerald-700",
      "prompt-packs": "bg-pink-100 text-pink-700",
      "prompt packs": "bg-pink-100 text-pink-700",
      "mini-courses": "bg-cyan-100 text-cyan-700",
      challenges: "bg-rose-100 text-rose-700",
      worksheets: "bg-amber-100 text-amber-700",
    };
    return map[type?.toLowerCase()] || "bg-slate-100 text-slate-700";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ FIXED: Delete function - properly handles product ID
  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    // Get the product ID correctly
    const productId = selectedProduct._id || selectedProduct.id;
    
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      
      // Remove from state - check both _id and id
      setProducts(products.filter(p => (p._id || p.id) !== productId));
      
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  // ✅ Open delete modal
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDownloadPDF = async (product) => {
    const productId = product._id || product.id;
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }
    
    try {
      toast.loading("📥 Preparing download...", { duration: 2000 });
      const response = await api.get(`/products/${productId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${product.title || "product"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("✅ PDF downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.response?.data?.message || "Failed to download PDF");
    }
  };

  const handleViewProduct = (product) => {
    const productId = product._id || product.id;
    navigate(`/products/${productId}`);
  };

  const getFilteredProducts = () => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      const matchesFilter = filter === "all" || product.status === filter;
      const matchesSearch =
        (product.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (product.productType || product.type || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (product.niche || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getStats = () => {
    if (!Array.isArray(products)) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        draft: 0,
        generating: 0,
        failed: 0,
      };
    }
    return {
      total: products.length,
      completed: products.filter((p) => p.status === "completed").length,
      inProgress: products.filter(
        (p) => p.status === "in-progress" || p.status === "processing",
      ).length,
      draft: products.filter((p) => p.status === "draft").length,
      generating: products.filter((p) => p.status === "generating").length,
      failed: products.filter((p) => p.status === "failed").length,
    };
  };

  const filteredProducts = getFilteredProducts();
  const stats = getStats();

  // Marketing Content Preview Component
  const MarketingPreview = ({ productId, data, isLoading }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!data) return null;

    return (
      <div className="mt-4 pt-4 border-t border-emerald-200/50 space-y-4">
        {data.emails && data.emails.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-2">
              <span className="text-[#FACC15]">📧</span> Emails (
              {data.emails.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.emails.slice(0, 3).map((email, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl p-3 text-sm border border-slate-100"
                >
                  <div className="font-medium text-[#111111]">
                    {email.subject}
                  </div>
                  <div className="text-[#6B7280] text-xs line-clamp-2">
                    {email.body}
                  </div>
                </div>
              ))}
              {data.emails.length > 3 && (
                <div className="text-xs text-[#6B7280] text-center">
                  +{data.emails.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {data.social && data.social.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-2">
              <span className="text-[#FACC15]">📱</span> Social Posts (
              {data.social.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.social.slice(0, 2).map((post, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl p-3 text-sm border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize text-[#111111]">
                      {post.platform}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {post.hashtags?.join(" ") || ""}
                    </span>
                  </div>
                  <div className="text-[#6B7280] text-xs line-clamp-2">
                    {post.content}
                  </div>
                </div>
              ))}
              {data.social.length > 2 && (
                <div className="text-xs text-[#6B7280] text-center">
                  +{data.social.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {data.ads && data.ads.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-2">
              <span className="text-[#FACC15]">📢</span> Ad Copy (
              {data.ads.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.ads.slice(0, 2).map((ad, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl p-3 text-sm border border-slate-100"
                >
                  <div className="font-medium text-[#111111]">
                    {ad.headline}
                  </div>
                  <div className="text-[#6B7280] text-xs line-clamp-2">
                    {ad.body}
                  </div>
                  <div className="mt-1 inline-block bg-[#FACC15] px-2 py-0.5 rounded-full text-xs font-medium">
                    {ad.cta}
                  </div>
                </div>
              ))}
              {data.ads.length > 2 && (
                <div className="text-xs text-[#6B7280] text-center">
                  +{data.ads.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {data.seo && (data.seo.metaTitle || data.seo.metaDescription) && (
          <div>
            <h4 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-2">
              <span className="text-[#FACC15]">🔍</span> SEO
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 text-sm border border-slate-100">
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-medium">Meta Title:</span>{" "}
                  {data.seo.metaTitle}
                </div>
                <div>
                  <span className="font-medium">Meta Description:</span>{" "}
                  {data.seo.metaDescription}
                </div>
                {data.seo.keywords && data.seo.keywords.length > 0 && (
                  <div>
                    <span className="font-medium">Keywords:</span>{" "}
                    {data.seo.keywords.slice(0, 5).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F8F6]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex justify-center items-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B7280] text-sm font-medium">
              Loading your products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F8F8F6] via-white to-[#F8F8F6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="mx-auto relative z-10">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#FACC15]/20 rounded-2xl">
                    <FolderOpen size={28} className="text-[#FACC15]" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight">
                      My Products
                    </h1>
                    <p className="text-[#6B7280] text-sm mt-1 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      {stats.total} {stats.total === 1 ? "product" : "products"}{" "}
                      created
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/create")}
                className="group bg-[#FACC15] hover:bg-[#e5b800] text-[#111111] font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm md:text-base relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                Create New Product
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280] font-medium">
                    Total
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15]/20 to-[#FACC15]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">📦</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#111111] mt-2">
                  {stats.total}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">All products</div>
              </div>
              <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280] font-medium">
                    Ready
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">✅</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mt-2">
                  {stats.completed}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  Published & ready
                </div>
              </div>
              <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280] font-medium">
                    In Progress
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">⏳</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-600 mt-2">
                  {stats.inProgress + stats.generating}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">Being created</div>
              </div>
              <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280] font-medium">
                    Drafts
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500/20 to-slate-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">📝</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-600 mt-2">
                  {stats.draft}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  Not yet finished
                </div>
              </div>
              <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280] font-medium">
                    Failed
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500/20 to-rose-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">❌</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-rose-600 mt-2">
                  {stats.failed}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  Need attention
                </div>
              </div>
            </div>

            {/* ===== FILTERS & SEARCH ===== */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-[#E5E7EB] p-4 md:p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-[#6B7280]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by title, type, or niche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F8F8F6] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "all",
                    "completed",
                    "in-progress",
                    "draft",
                    "generating",
                    "failed",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition capitalize ${
                        filter === status
                          ? "bg-[#FACC15] text-[#111111] shadow-md"
                          : "bg-[#F8F8F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                      }`}
                    >
                      {status === "all" ? "All" : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== PRODUCT GRID ===== */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-[#E5E7EB] p-16 text-center">
                <div className="text-7xl mb-6">📭</div>
                <h3 className="text-2xl font-bold text-[#111111] mb-3">
                  No products found
                </h3>
                <p className="text-[#6B7280] text-sm max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search or clear the filters"
                    : "Create your first product to get started on your journey"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => navigate("/create")}
                    className="mt-6 bg-[#FACC15] text-[#111111] font-semibold px-8 py-3.5 rounded-2xl hover:bg-[#e5b800] transition shadow-lg hover:shadow-xl"
                  >
                    Create Product →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const productId = product._id || product.id;
                  const isExpanded = expandedProduct === productId;
                  const isMarketingLoading = loadingMarketing[productId];
                  const marketingDataItem = marketingData[productId];

                  const coverPath = 
                    product.coverImage || 
                    product.coverImageUrl || 
                    product.cover || 
                    product.image || 
                    null;
                  
                  const coverImageUrl = getCoverImageUrl(coverPath);
                  const hasCoverImage = !!coverImageUrl;

                  return (
                    <div
                      key={productId}
                      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FACC15] via-purple-400 to-[#FACC15] opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500"></div>

                      {/* ===== COVER SECTION ===== */}
                      <div className="relative h-52 bg-gradient-to-br from-[#FACC15]/10 via-white to-[#FACC15]/5 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWNjMTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

                        {hasCoverImage ? (
                          <img
                            src={coverImageUrl}
                            alt={product.title || "Product cover"}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              console.error(`❌ Failed to load image: ${coverImageUrl}`);
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <span className="text-7xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                              {getFallbackEmoji(
                                product.productType || product.type,
                              )}
                            </span>
                            <span className="text-xs text-[#6B7280] mt-2 font-medium bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm">
                              {product.productType || "Product"}
                            </span>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="absolute top-3 left-3 z-20">
                          <span
                            className={`px-3 py-1.5 rounded-full text-[10px] font-medium border flex items-center gap-1.5 backdrop-blur-sm bg-white/80 ${getStatusBadge(product.status)}`}
                          >
                            {getStatusIcon(product.status)}{" "}
                            {getStatusLabel(product.status)}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 z-20">
                          <span
                            className={`px-3 py-1.5 rounded-full text-[10px] font-medium backdrop-blur-sm ${getTypeColor(product.productType || product.type)}`}
                          >
                            {getTypeEmoji(product.productType || product.type)}{" "}
                            {product.productType || product.type || "Product"}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-base font-bold text-[#111111] line-clamp-1 group-hover:text-[#FACC15] transition-colors">
                              {product.title || "Untitled"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#6B7280]">
                                {product.niche || "General"}
                              </span>
                              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDate(product.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Indicators */}
                        {product.status === "completed" && (
                          <div className="flex items-center gap-1.5 mt-2 p-2 bg-emerald-50/50 rounded-xl">
                            <span
                              className="text-xs text-emerald-600"
                              title="Content"
                            >
                              📝
                            </span>
                            <span
                              className="text-xs text-emerald-600"
                              title="PDF"
                            >
                              📄
                            </span>
                            <span
                              className="text-xs text-emerald-600"
                              title="Marketing"
                            >
                              📣
                            </span>
                            <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Complete
                            </span>
                          </div>
                        )}

                        {product.status === "generating" && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-[#FACC15] rounded-full transition-all duration-500"
                                style={{ width: `${product.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-purple-600">
                              {product.progress || 0}%
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="flex-1 bg-[#F8F8F6] hover:bg-[#E5E7EB] text-[#111111] text-sm font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View
                          </button>

                          {product.status === "completed" && (
                            <button
                              onClick={() => handleDownloadPDF(product)}
                              className="flex-1 bg-[#FACC15] hover:bg-[#e5b800] text-[#111111] text-sm font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              PDF
                            </button>
                          )}

                          {/* ✅ FIXED: Delete button with proper handler */}
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="px-3 bg-[#F8F8F6] hover:bg-rose-50 text-[#6B7280] hover:text-rose-600 py-2.5 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Marketing Content Preview */}
                        {isExpanded && (
                          <MarketingPreview
                            productId={productId}
                            data={marketingDataItem}
                            isLoading={isMarketingLoading}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Trash2 size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Product</h3>
                  <p className="text-sm opacity-90">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[#111111] text-center mb-2">
                Are you sure you want to delete <br />
                <strong className="font-bold text-lg">
                  {selectedProduct.title || "this product"}
                </strong>
                ?
              </p>
              <p className="text-sm text-[#6B7280] text-center mb-6">
                This will permanently remove the product and all its associated
                files.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-4 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-xl hover:bg-[#F8F8F6] transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={16} />
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;