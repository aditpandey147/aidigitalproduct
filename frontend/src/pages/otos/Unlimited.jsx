// frontend/src/pages/Unlimited.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import {
  Search,
  Bell,
  Flame,
  Star,
  TrendingUp,
  Sparkles,
  Crown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Grid3x3,
  List,
  BookOpen,
  ShoppingBag,
  Store,
  ShoppingCart,
  LayoutGrid,
  Heart,
  Eye,
  Clock,
  Award,
  BadgeCheck,
  Plus,
  Menu,
  X,
  Infinity,
  TrendingDown,
  DollarSign,
  Star as StarIcon,
  Zap,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// PLATFORM CONFIG
// ================================================================

const platformConfig = {
  books: { label: "Books", icon: BookOpen, color: "#4a6cf7", bg: "bg-blue-50" },
  gumroad: {
    label: "Gumroad",
    icon: ShoppingCart,
    color: "#f78b2c",
    bg: "bg-orange-50",
  },
  payhip: {
    label: "Payhip",
    icon: Store,
    color: "#4a6cf7",
    bg: "bg-indigo-50",
  },
  etsy: { label: "Etsy", icon: ShoppingBag, color: "#f4581b", bg: "bg-red-50" },
  shopify: {
    label: "Shopify",
    icon: LayoutGrid,
    color: "#5e8e3e",
    bg: "bg-green-50",
  },
};

// ================================================================
// COVER THEMES
// ================================================================

const coverThemes = {
  fitness: "from-[#2a8e7e] via-[#47aa94] to-[#1e766d]",
  startup: "from-[#fff7e5] via-[#f1d98d] to-[#dfbb5b]",
  prompts: "from-[#24103f] via-[#582273] to-[#190b2f]",
  meal: "from-[#f5eee0] via-[#d8c6a6] to-[#f5eee8]",
  productivity: "from-[#0f4b8b] via-[#2c69a2] to-[#103b6e]",
  instagram: "from-[#f2eee7] via-[#f7f4ee] to-[#e6e2db]",
};

const getTheme = (productType) => {
  const themeMap = {
    guide: "startup",
    workbook: "meal",
    planner: "productivity",
    checklists: "fitness",
    "prompt-packs": "prompts",
    templates: "instagram",
    challenges: "fitness",
    ebook: "startup",
    worksheets: "productivity",
    spreadsheets: "productivity",
    "mini-courses": "prompts",
  };
  return themeMap[productType?.toLowerCase()] || "fitness";
};

// ================================================================
// PRODUCT COVER
// ================================================================

const ProductCover = ({
  coverImage = null,
  title = "",
  productType = "",
  small = false,
}) => {
  const size = small ? "h-[140px] w-[100px]" : "h-[180px] w-[130px]";
  const shadow = small ? "shadow-sm" : "shadow-md";

  if (coverImage) {
    const imageUrl = coverImage.startsWith("http")
      ? coverImage
      : `${SERVER_URL}${coverImage}`;
    return (
      <div
        className={`${size} relative shrink-0 overflow-hidden rounded-md ${shadow} bg-gray-100 transition-transform duration-300 hover:scale-105`}
      >
        <img
          src={imageUrl}
          alt={title || "Product"}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.style.display = "none";
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl bg-gray-100">📚</div>`;
            }
          }}
        />
      </div>
    );
  }

  const theme = getTheme(productType);
  const themeClass = coverThemes[theme] || coverThemes.fitness;
  const headline = {
    fitness: "FITNESS\nCHALLENGE",
    startup: "STARTUP\nGUIDE",
    prompts: "AI\nPROMPTS",
    meal: "MEAL PLAN\nWORKBOOK",
    productivity: "PRODUCTIVITY\nPLANNER",
    instagram: "INSTAGRAM\nGROWTH",
  }[theme];

  return (
    <div
      className={`${size} relative shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${themeClass} ${shadow} transition-transform duration-300 hover:scale-105`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-white/30" />
      <div
        className={`absolute whitespace-pre-line px-2 font-bold leading-[1.1] tracking-[-0.02em] ${
          small ? "top-2 text-[10px]" : "top-3 text-[14px]"
        } text-white`}
      >
        {headline}
      </div>
      {!small && (
        <div className="absolute bottom-2 left-2 h-1 w-6 rounded-full bg-white/40" />
      )}
    </div>
  );
};

// ================================================================
// BOOK CARD COMPONENT
// ================================================================

const BookCard = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = (coverImage) => {
    if (!coverImage) return null;
    if (coverImage.startsWith("http")) return coverImage;
    return `${SERVER_URL}${coverImage}`;
  };

  const theme = getTheme(product.productType);
  const themeClass = coverThemes[theme] || coverThemes.fitness;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* ===== INFINITY ICON ===== */}
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-[#FACC15]/90 rounded-full p-1.5 shadow-md hover:scale-110 transition-transform duration-200">
            <Infinity size={14} className="text-[#111820]" strokeWidth={2.5} />
          </div>
        </div>

        {/* ===== FULL SIZE COVER ===== */}
        <div className="relative aspect-[2/3] bg-[#F8F9FA] overflow-hidden">
          {getImageUrl(product.coverImage || product.coverUrl) ? (
            <img
              src={getImageUrl(product.coverImage || product.coverUrl)}
              alt={product.title || "Product"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.style.display = "none";
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${themeClass}">
                      <span class="text-6xl text-white/80">📚</span>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${themeClass}`}
            >
              <span className="text-6xl text-white/80">📚</span>
            </div>
          )}

          {/* ===== HOVER QUICK VIEW ===== */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-[#FACC15] text-[#111820] px-4 py-2 rounded-lg text-xs font-bold shadow-lg">
                Quick View
              </span>
            </div>
          )}
        </div>

        {/* ===== BOOK DETAILS ===== */}
        <div className="p-3">
          <h3 className="text-[13px] font-bold text-[#1c2431] leading-[1.2] line-clamp-2">
            {product.title}
          </h3>

          {product.authorName && (
            <p className="text-[11px] font-medium text-[#6B7280] truncate">
              {product.authorName}
            </p>
          )}

          {product.niche && (
            <p className="text-[10px] text-[#8B93A0] truncate">
              {product.niche}
            </p>
          )}

          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${
                    i < Math.floor(product.rating || 4.5)
                      ? "fill-[#FACC15] text-[#FACC15]"
                      : "fill-[#E5E7EB] text-[#E5E7EB]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-[#6B7280] ml-1">
              {product.rating || 4.5}
            </span>
            <span className="text-[10px] text-[#9AA1AD]">
              ({product.reviews || product.reviewCount || 0})
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0F2F5]">
            <span className="text-[16px] font-bold text-[#111827]">
              ${product.price?.toFixed(2) || "0.00"}
            </span>
            {product.platform && (
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${platformConfig[product.platform]?.bg || "bg-gray-100"} text-[#111820]`}
              >
                {platformConfig[product.platform]?.label || product.platform}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatSales = (sales) => {
  if (!sales) return "0";
  if (sales >= 1000) return (sales / 1000).toFixed(1) + "K";
  return sales.toString();
};

// ================================================================
// MAIN PAGE
// ================================================================

export default function Unlimited() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterAndPaginateProducts();
  }, [allProducts, selectedPlatform, searchQuery, sortBy, currentPage]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/platforms/trending/all");
      const data = response.data?.data || [];
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateProducts = () => {
    let filtered = [...allProducts];

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((p) => p.platform === selectedPlatform);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.niche?.toLowerCase().includes(query),
      );
    }

    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    setDisplayProducts({
      items: paginated,
      total: filtered.length,
      currentPage: currentPage,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= displayProducts.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ===== LEFT COLUMN (70-75%) ===== */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-6">
                {/* ===== BANNER ===== */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-10 shadow-lg">
                  {/* ===== BACKGROUND EFFECTS ===== */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15]/10 to-transparent"></div>
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-[#FACC15] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FACC15] rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#FACC15] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                  </div>

                  {/* ===== DECORATIVE ELEMENTS ===== */}
                  <div className="absolute top-4 right-8 opacity-10 text-white text-6xl hidden md:block">
                    ✦
                  </div>
                  <div className="absolute bottom-4 left-8 opacity-5 text-white text-8xl hidden md:block">
                    ✦
                  </div>

                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                    {/* ===== LEFT CONTENT ===== */}
                    <div className="flex-1">
                      {/* Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FACC15]/20 rounded-full border border-[#FACC15]/30">
                          <Crown size={18} className="text-[#FACC15]" />
                          <span className="text-[#FACC15] font-bold text-xs uppercase tracking-wider">
                            Unlimited Access
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#22c55e]/20 rounded-full border border-[#22c55e]/30">
                          <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></span>
                          <span className="text-[#22c55e] font-bold text-[10px] uppercase tracking-wider">
                            Live
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Discover Your Next <br className="sm:hidden" />
                        <span className="text-[#FACC15]">Favorite Product</span>
                      </h1>

                      {/* Description */}
                      <p className="text-gray-300 text-base md:text-lg mt-3 max-w-xl leading-relaxed">
                        Explore thousands of digital products across all
                        platforms. Find what you need to grow your business.
                      </p>
                    </div>
                  </div>

                  {/* ===== BOTTOM DECORATIVE LINE ===== */}
                  <div className="relative mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[10px] text-white/30">
                      <span>Updated daily</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>Curated collections</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>Expert picks</span>
                    </div>
                  </div>
                </div>

                {/* ===== FILTERS & SEARCH ===== */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedPlatform("all");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedPlatform === "all"
                          ? "bg-[#FACC15] text-[#111820]"
                          : "bg-white text-[#6B7280] hover:bg-[#F8F8F6] border border-[#E5E7EB]"
                      }`}
                    >
                      All
                    </button>
                    {Object.entries(platformConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedPlatform(key);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                          selectedPlatform === key
                            ? "bg-[#FACC15] text-[#111820]"
                            : "bg-white text-[#6B7280] hover:bg-[#F8F8F6] border border-[#E5E7EB]"
                        }`}
                      >
                        <config.icon size={12} />
                        {config.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-48 sm:w-56 pl-9 pr-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                      />
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Top Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                    <div className="flex border border-[#E5E7EB] rounded-full overflow-hidden bg-white">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 ${viewMode === "grid" ? "bg-[#FACC15]" : "hover:bg-[#F8F8F6]"}`}
                      >
                        <Grid3x3
                          size={16}
                          className={
                            viewMode === "grid"
                              ? "text-[#111820]"
                              : "text-[#6B7280]"
                          }
                        />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 ${viewMode === "list" ? "bg-[#FACC15]" : "hover:bg-[#F8F8F6]"}`}
                      >
                        <List
                          size={16}
                          className={
                            viewMode === "list"
                              ? "text-[#111820]"
                              : "text-[#6B7280]"
                          }
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== PRODUCTS GRID ===== */}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : displayProducts.items?.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-[#E5E7EB]">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-[#111111]">
                      No products found
                    </h3>
                    <p className="text-[#6B7280] text-sm mt-1">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlatform("all");
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="mt-4 px-4 py-2 bg-[#FACC15] text-[#111820] rounded-lg text-sm font-medium hover:bg-[#e5b800] transition"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {displayProducts.items.map((product) => (
                      <BookCard
                        key={product._id || product.id}
                        product={product}
                        onClick={() => {
                          navigate("/create-product", {
                            state: {
                              productData: {
                                title: product.title || "",
                                productType: product.productType || "guide",
                                niche: product.niche || "",
                                audience: product.audience || "",
                                problem: product.problem || "",
                                outcome: product.outcome || "",
                                tone: product.tone || "Professional",
                                language: product.language || "English",
                                coverImage:
                                  product.coverImage || product.coverUrl || "",
                                price: product.price || "",
                                description: product.description || "",
                                authorName: product.authorName || "",
                                brandName: product.brandName || "",
                              },
                            },
                          });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
                    {displayProducts.items.map((product) => (
                      <div
                        key={product._id || product.id}
                        onClick={() => {
                          navigate("/create-product", {
                            state: {
                              productData: {
                                title: product.title || "",
                                productType: product.productType || "guide",
                                niche: product.niche || "",
                                audience: product.audience || "",
                                problem: product.problem || "",
                                outcome: product.outcome || "",
                                tone: product.tone || "Professional",
                                language: product.language || "English",
                                coverImage:
                                  product.coverImage || product.coverUrl || "",
                                price: product.price || "",
                                description: product.description || "",
                                authorName: product.authorName || "",
                                brandName: product.brandName || "",
                              },
                            },
                          });
                        }}
                        className="flex items-center gap-4 p-4 hover:bg-[#F8F9FB] cursor-pointer transition"
                      >
                        <ProductCover
                          coverImage={product.coverImage || product.coverUrl}
                          title={product.title}
                          productType={product.productType}
                          small
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-[#1c2431]">
                            {product.title}
                          </h3>
                          <p className="text-[13px] text-[#6B7280] line-clamp-1">
                            {product.description || product.niche}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star
                                size={12}
                                className="fill-[#FACC15] text-[#FACC15]"
                              />
                              <span className="text-[12px] text-[#6B7280]">
                                {product.rating || 4.5}
                              </span>
                            </div>
                            <span className="text-[12px] text-[#6B7280]">
                              ({product.reviews || product.reviewCount || 0}{" "}
                              reviews)
                            </span>
                            <span className="text-[13px] font-bold text-[#111827]">
                              ${product.price?.toFixed(2) || "0.00"}
                            </span>
                            {product.platform && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${platformConfig[product.platform]?.bg || "bg-gray-100"}`}
                              >
                                {platformConfig[product.platform]?.label ||
                                  product.platform}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-semibold text-[#FACC15]">
                            🔥{" "}
                            {formatSales(product.sales || product.salesCount)}
                          </div>
                          <span className="text-[11px] text-[#6B7280]">
                            sold
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT SIDEBAR (25-30%) ===== */}
            <div className="w-[280px] lg:w-[300px] flex-shrink-0 space-y-4">
              {/* ===== CREATE PRODUCT CARD ===== */}
              <div className="bg-gradient-to-br from-[#FACC15] to-[#e5b800] rounded-xl p-5 text-[#111820] shadow-lg">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25">
                    <Plus size={24} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="mt-3 text-center text-base font-bold">
                  Create Your Own
                </h3>
                <p className="mt-1 text-center text-[11px] leading-[1.4] text-[#111820]/80">
                  Turn your idea into a digital product with AI
                </p>
                <button
                  onClick={() => navigate("/create-product")}
                  className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-white text-[12px] font-bold text-[#111820] hover:shadow-md transition"
                >
                  <Plus size={14} className="mr-1.5" /> Get Started
                </button>
              </div>

              {/* ===== TOP SELLING PRODUCTS (Not categories) ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-[14px] font-bold text-[#263043] flex items-center gap-2">
                  <Flame size={18} className="text-[#FACC15]" />
                  Top Selling This Week
                </h3>
                <div className="mt-3 space-y-2">
                  {allProducts
                    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
                    .slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={product._id || product.id}
                        onClick={() => {
                          navigate("/create-product", {
                            state: {
                              productData: {
                                title: product.title || "",
                                productType: product.productType || "guide",
                                niche: product.niche || "",
                                audience: product.audience || "",
                                problem: product.problem || "",
                                outcome: product.outcome || "",
                                tone: product.tone || "Professional",
                                language: product.language || "English",
                                coverImage:
                                  product.coverImage || product.coverUrl || "",
                                price: product.price || "",
                                description: product.description || "",
                                authorName: product.authorName || "",
                                brandName: product.brandName || "",
                              },
                            },
                          });
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F9FB] cursor-pointer transition group"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                            index === 0
                              ? "bg-[#FACC15] text-[#111820]"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-amber-600"
                                  : "bg-gray-300 text-[#6B7280]"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#263043] truncate group-hover:text-[#FACC15] transition-colors">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-[#6B7280]">
                              🔥{" "}
                              {formatSales(product.sales || product.salesCount)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[12px] font-bold text-[#111827]">
                          ${product.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* ===== HOT DEALS / DISCOUNTS ===== */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl p-4 text-white shadow-lg border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={18} className="text-[#FACC15]" />
                  <h3 className="text-[14px] font-bold">Hot Deals 🔥</h3>
                </div>
                <div className="space-y-3">
                  {allProducts
                    .filter((p) => p.price < 20)
                    .sort((a, b) => (a.price || 0) - (b.price || 0))
                    .slice(0, 3)
                    .map((product) => (
                      <div
                        key={product._id || product.id}
                        onClick={() => {
                          navigate("/create-product", {
                            state: {
                              productData: {
                                title: product.title || "",
                                productType: product.productType || "guide",
                                niche: product.niche || "",
                                audience: product.audience || "",
                                problem: product.problem || "",
                                outcome: product.outcome || "",
                                tone: product.tone || "Professional",
                                language: product.language || "English",
                                coverImage:
                                  product.coverImage || product.coverUrl || "",
                                price: product.price || "",
                                description: product.description || "",
                                authorName: product.authorName || "",
                                brandName: product.brandName || "",
                              },
                            },
                          });
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition group"
                      >
                        <div className="w-8 h-10 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                          {product.coverImage || product.coverUrl ? (
                            <img
                              src={product.coverImage || product.coverUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              📚
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate group-hover:text-[#FACC15] transition-colors">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] font-bold text-[#FACC15]">
                              ${product.price?.toFixed(2) || "0.00"}
                            </span>
                            <span className="text-[9px] line-through text-white/40">
                              ${(product.price * 1.4)?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#FACC15] bg-[#FACC15]/20 px-2 py-0.5 rounded-full">
                          -40%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* ===== POPULAR PLATFORMS ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-[14px] font-bold text-[#263043] flex items-center gap-2">
                  <Store size={18} className="text-[#FACC15]" />
                  Popular Platforms
                </h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const count = allProducts.filter(
                      (p) => p.platform === key,
                    ).length;
                    const percentage =
                      allProducts.length > 0
                        ? Math.round((count / allProducts.length) * 100)
                        : 0;
                    return (
                      <div
                        key={key}
                        className="p-2 rounded-lg hover:bg-[#F8F9FB] transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${config.bg}`}>
                              <config.icon
                                size={14}
                                className="text-[#111820]"
                              />
                            </div>
                            <span className="text-[12px] font-medium text-[#263043]">
                              {config.label}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#FACC15]">
                            {count}
                          </span>
                        </div>
                        <div className="mt-1 w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: config.color || "#FACC15",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== POPULAR SEARCHES ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-[14px] font-bold text-[#263043] flex items-center gap-2">
                  <Search size={18} className="text-[#FACC15]" />
                  Popular Searches
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Productivity",
                    "AI Templates",
                    "Fitness",
                    "Marketing",
                    "Design",
                    "Planner",
                    "Workbook",
                    "Ebook",
                    "Spreadsheet",
                    "Checklist",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#F8F9FA] hover:bg-[#FACC15]/20 text-[11px] font-medium text-[#6B7280] hover:text-[#111820] transition border border-[#E5E7EB] hover:border-[#FACC15]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== NEW RELEASES ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-[14px] font-bold text-[#263043] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#FACC15]" />
                  New Releases
                </h3>
                <div className="mt-3 space-y-2">
                  {allProducts
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .slice(0, 4)
                    .map((product) => (
                      <div
                        key={product._id || product.id}
                        onClick={() => {
                          navigate("/create-product", {
                            state: {
                              productData: {
                                title: product.title || "",
                                productType: product.productType || "guide",
                                niche: product.niche || "",
                                audience: product.audience || "",
                                problem: product.problem || "",
                                outcome: product.outcome || "",
                                tone: product.tone || "Professional",
                                language: product.language || "English",
                                coverImage:
                                  product.coverImage || product.coverUrl || "",
                                price: product.price || "",
                                description: product.description || "",
                                authorName: product.authorName || "",
                                brandName: product.brandName || "",
                              },
                            },
                          });
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F9FB] cursor-pointer transition group"
                      >
                        <div className="w-8 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.coverImage || product.coverUrl ? (
                            <img
                              src={product.coverImage || product.coverUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              📚
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate group-hover:text-[#FACC15] transition-colors">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-[#6B7280]">
                              ✨ New
                            </span>
                            <span className="text-[10px] font-bold text-[#111827]">
                              ${product.price?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* ===== PRICE RANGE FILTER ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <h3 className="text-[14px] font-bold text-[#263043] flex items-center gap-2">
                  <DollarSign size={18} className="text-[#FACC15]" />
                  Price Range
                </h3>
                <div className="mt-3 space-y-2">
                  {[
                    ["Under $10", 0, 10],
                    ["$10 - $20", 10, 20],
                    ["$20 - $40", 20, 40],
                    ["$40 - $60", 40, 60],
                    ["Over $60", 60, Infinity],
                  ].map(([label, min, max]) => {
                    const count = allProducts.filter(
                      (p) => p.price >= min && p.price < max,
                    ).length;
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          // Filter by price range (implement in your filter logic)
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#F8F9FB] transition"
                      >
                        <span className="text-[12px] text-[#6B7280]">
                          {label}
                        </span>
                        <span className="text-[11px] font-medium text-[#FACC15]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
