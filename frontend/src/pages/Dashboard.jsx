import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bannerBg from "../assets/images/banner-bg.jpg";
import {
  Home,
  FolderOpen,
  PenLine,
  LayoutGrid,
  Palette,
  Megaphone,
  Sparkles,
  Library,
  BarChart3,
  Heart,
  Trash2,
  Settings,
  CircleHelp,
  LogOut,
  Search,
  Command,
  Bell,
  ChevronDown,
  Plus,
  Flame,
  Trophy,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Check,
  Table2,
  FileImage,
  Bot,
  GraduationCap,
  FileText,
  Download,
  Link2,
  Eye,
  Clock3,
  XCircle,
  Pencil,
  PieChart,
  Lightbulb,
  Users,
  Zap,
  Menu,
  Box,
  LayoutDashboard,
  Wand2,
  Upload,
  File,
  Target,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  X,
  Copy,
  Share2,
  Globe,
  Star,
  ShoppingBag,
  TrendingUp,
  Award,
  Layers,
  Crown,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Store,
  ShoppingCart,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
  Legend,
} from "recharts";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const statTone = {
  purple: {
    box: "bg-[#f2efff]",
    icon: "text-[#6648e7]",
    value: "text-[#111827]",
  },
  green: {
    box: "bg-[#edfbf2]",
    icon: "text-[#16a34a]",
    value: "text-[#111827]",
  },
  orange: {
    box: "bg-[#fff4e8]",
    icon: "text-[#f97316]",
    value: "text-[#111827]",
  },
  blue: {
    box: "bg-[#edf5ff]",
    icon: "text-[#3b82f6]",
    value: "text-[#111827]",
  },
  red: { box: "bg-[#fff0f1]", icon: "text-[#ef4444]", value: "text-[#ef4444]" },
};

const bestSellersData = [
  {
    title: "Guide",
    count: "12.4K",
    products: "products",
    icon: BookOpen,
    type: "guide",
  },
  {
    title: "Workbook",
    count: "9.8K",
    products: "products",
    icon: BookOpen,
    type: "workbook",
  },
  {
    title: "Planner",
    count: "8.7K",
    products: "products",
    icon: CalendarDays,
    type: "planner",
  },
  {
    title: "Checklist",
    count: "7.2K",
    products: "products",
    icon: Check,
    type: "checklist",
  },
  {
    title: "Spreadsheet",
    count: "6.1K",
    products: "products",
    icon: Table2,
    type: "spreadsheet",
  },
  {
    title: "Template",
    count: "5.6K",
    products: "products",
    icon: LayoutGrid,
    type: "template",
  },
  {
    title: "Prompt Pack",
    count: "4.8K",
    products: "products",
    icon: Bot,
    type: "prompt",
  },
  {
    title: "Mini Course",
    count: "4.2K",
    products: "products",
    icon: GraduationCap,
    type: "course",
  },
  {
    title: "Challenge",
    count: "3.9K",
    products: "products",
    icon: Flame,
    type: "challenge",
  },
  {
    title: "Ebook",
    count: "3.2K",
    products: "products",
    icon: BookOpen,
    type: "ebook",
  },
  {
    title: "Worksheet",
    count: "2.7K",
    products: "products",
    icon: FileText,
    type: "worksheet",
  },
];

const topProductsData = [
  {
    rank: 1,
    title: "Digital Marketing Mastery Guide",
    type: "Guide",
    sales: "2.4K",
    revenue: "$12.5K",
    tone: "purple",
  },
  {
    rank: 2,
    title: "AI Content Creation Prompts",
    type: "Prompt Pack",
    sales: "1.8K",
    revenue: "$9.2K",
    tone: "blue",
  },
  {
    rank: 3,
    title: "90-Day Business Challenge",
    type: "Challenge",
    sales: "1.6K",
    revenue: "$7.8K",
    tone: "orange",
  },
  {
    rank: 4,
    title: "Productivity Planner 2024",
    type: "Planner",
    sales: "1.4K",
    revenue: "$6.9K",
    tone: "blue",
  },
  {
    rank: 5,
    title: "Freelancer Income Tracker",
    type: "Spreadsheet",
    sales: "1.2K",
    revenue: "$5.6K",
    tone: "green",
  },
];

const nichesData = [
  {
    name: "Health & Fitness",
    value: "23.4K products",
    icon: Heart,
    tone: "purple",
  },
  {
    name: "Business & Money",
    value: "18.7K products",
    icon: Library,
    tone: "green",
  },
  {
    name: "Personal Development",
    value: "15.2K products",
    icon: Lightbulb,
    tone: "orange",
  },
  {
    name: "AI & Technology",
    value: "12.1K products",
    icon: Sparkles,
    tone: "blue",
  },
  { name: "Marketing", value: "9.8K products", icon: Link2, tone: "yellow" },
];

const marketChartData = [
  { day: "Mon", sales: 45, revenue: 32, orders: 28 },
  { day: "Tue", sales: 62, revenue: 48, orders: 35 },
  { day: "Wed", sales: 38, revenue: 25, orders: 22 },
  { day: "Thu", sales: 71, revenue: 55, orders: 42 },
  { day: "Fri", sales: 56, revenue: 42, orders: 31 },
  { day: "Sat", sales: 83, revenue: 68, orders: 49 },
  { day: "Sun", sales: 94, revenue: 76, orders: 55 },
];

const categoryData = [
  { name: "Guides", value: 87, color: "#FACC15" },
  { name: "Workbooks", value: 56, color: "#e5b800" },
  { name: "Planners", value: 47, color: "#f5d742" },
  { name: "Checklists", value: 31, color: "#f7c936" },
  { name: "Spreadsheets", value: 25, color: "#4bc38a" },
  { name: "Others", value: 66, color: "#dfe2e7" },
];

const platformConfig = {
  books: {
    label: "Books",
    icon: BookOpen,
    color: "#4a6cf7",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  gumroad: {
    label: "Gumroad",
    icon: ShoppingCart,
    color: "#f78b2c",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  payhip: {
    label: "Payhip",
    icon: Store,
    color: "#4a6cf7",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  etsy: {
    label: "Etsy",
    icon: ShoppingBag,
    color: "#f4581b",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  shopify: {
    label: "Shopify",
    icon: LayoutGrid,
    color: "#5e8e3e",
    bg: "bg-green-50",
    border: "border-green-200",
  },
};

const coverThemes = {
  fitness: "from-[#2a8e7e] via-[#47aa94] to-[#1e766d]",
  startup: "from-[#fff7e5] via-[#f1d98d] to-[#dfbb5b]",
  prompts: "from-[#24103f] via-[#582273] to-[#190b2f]",
  meal: "from-[#f5eee0] via-[#d8c6a6] to-[#f5eee8]",
  productivity: "from-[#0f4b8b] via-[#2c69a2] to-[#103b6e]",
  instagram: "from-[#f2eee7] via-[#f7f4ee] to-[#e6e2db]",
};

const quickActionsData = [
  ["Create Product", Plus],
  ["Browse Templates", LayoutGrid],
  ["AI Generator", Sparkles],
  ["Design Cover", FileImage],
  ["Analytics", BarChart3],
];

const bestTone = {
  guide: "bg-[#FACC15]/20 text-[#111820]",
  workbook: "bg-[#effbf1] text-[#17a653]",
  planner: "bg-[#fff0f4] text-[#ed3973]",
  checklist: "bg-[#edfbf2] text-[#16a34a]",
  spreadsheet: "bg-[#e9faff] text-[#0e9ab5]",
  template: "bg-[#FACC15]/20 text-[#111820]",
  prompt: "bg-[#FACC15]/20 text-[#111820]",
  course: "bg-[#FACC15]/20 text-[#111820]",
  challenge: "bg-[#fff2e9] text-[#f36b20]",
  ebook: "bg-[#FACC15]/20 text-[#111820]",
  worksheet: "bg-[#FACC15]/20 text-[#111820]",
};

const badgeTone = {
  Guide: "bg-[#FACC15]/20 text-[#111820]",
  "Prompt Pack": "bg-[#FACC15]/20 text-[#111820]",
  Challenge: "bg-[#fff0df] text-[#f07828]",
  Planner: "bg-[#eef6ff] text-[#3f83ee]",
  Spreadsheet: "bg-[#e9fbf1] text-[#22a15b]",
};

// ================================================================
// HELPER FUNCTIONS
// ================================================================

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

const ProductCover = ({
  theme = "fitness",
  small = false,
  coverImage = null,
  title = "",
}) => {
  const size = small ? "h-[50px]" : "h-[180px]";
  const shadow = small ? "shadow-sm" : "shadow-md";

  if (coverImage) {
    const imageUrl = coverImage.startsWith("http")
      ? coverImage
      : `${SERVER_URL}${coverImage}`;
    return (
      <div
        className={`${size} relative shrink-0 overflow-hidden rounded-md ${shadow} bg-gray-100`}
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
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-100">📚</div>`;
            }
          }}
        />
      </div>
    );
  }

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
          small ? "top-1 text-[6px]" : "top-3 text-[14px]"
        } ${theme === "startup" || theme === "meal" || theme === "instagram" ? "text-[#161a1e]" : "text-white"}`}
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
// MAIN DASHBOARD
// ================================================================

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformData, setPlatformData] = useState({});
  const [platformLoading, setPlatformLoading] = useState(true);

  // Refs for scrollable sections
  const trendingScrollRef = useRef(null);
  const [showLeftTrendingArrow, setShowLeftTrendingArrow] = useState(false);
  const [showRightTrendingArrow, setShowRightTrendingArrow] = useState(false);

  const featuredScrollRef = useRef(null);
  const [showLeftFeaturedArrow, setShowLeftFeaturedArrow] = useState(false);
  const [showRightFeaturedArrow, setShowRightFeaturedArrow] = useState(false);

  useEffect(() => {
    fetchAllProducts();
    fetchPlatforms();
  }, []);

  // ✅ SCROLL HANDLERS FOR TRENDING - BOTH ARROWS ALWAYS SHOW
  // ================================================================
  // SCROLL HANDLERS - FIXED
  // ================================================================

  // ✅ SCROLL HANDLERS FOR TRENDING - FIXED
  useEffect(() => {
    // Wait for DOM to render
    const timer = setTimeout(() => {
      const container = trendingScrollRef.current;
      if (container) {
        const checkScroll = () => {
          const isScrollable = container.scrollWidth > container.clientWidth;
          console.log(
            "Trending - isScrollable:",
            isScrollable,
            "scrollWidth:",
            container.scrollWidth,
            "clientWidth:",
            container.clientWidth,
          );

          if (isScrollable) {
            setShowLeftTrendingArrow(true);
            setShowRightTrendingArrow(true);
          } else {
            setShowLeftTrendingArrow(false);
            setShowRightTrendingArrow(false);
          }
        };

        checkScroll();
        container.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
          container.removeEventListener("scroll", checkScroll);
          window.removeEventListener("resize", checkScroll);
        };
      }
    }, 300); // ✅ Delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [trendingProducts]);

  // ✅ SCROLL HANDLERS FOR FEATURED - FIXED
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = featuredScrollRef.current;
      if (container) {
        const checkScroll = () => {
          const isScrollable = container.scrollWidth > container.clientWidth;
          console.log(
            "Featured - isScrollable:",
            isScrollable,
            "scrollWidth:",
            container.scrollWidth,
            "clientWidth:",
            container.clientWidth,
          );

          if (isScrollable) {
            setShowLeftFeaturedArrow(true);
            setShowRightFeaturedArrow(true);
          } else {
            setShowLeftFeaturedArrow(false);
            setShowRightFeaturedArrow(false);
          }
        };

        checkScroll();
        container.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
          container.removeEventListener("scroll", checkScroll);
          window.removeEventListener("resize", checkScroll);
        };
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [featuredProducts]);

  const scrollTrending = (direction) => {
    const container = trendingScrollRef.current;
    if (container) {
      const scrollAmount =
        direction === "left" ? -container.clientWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollFeatured = (direction) => {
    const container = featuredScrollRef.current;
    if (container) {
      const scrollAmount =
        direction === "left" ? -container.clientWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/platforms/trending/all");
      const allData = response.data?.data || [];
      setTrendingProducts(allData);
      try {
        const featuredRes = await api.get("/platforms/featured");
        const featuredData = featuredRes.data?.data || [];
        setFeaturedProducts(featuredData);
      } catch (err) {
        setFeaturedProducts(allData.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setTrendingProducts([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      setPlatformLoading(true);
      const response = await api.get("/platforms");
      const data = response.data?.data?.byPlatform || {};
      setPlatformData(data);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      setPlatformData({});
    } finally {
      setPlatformLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-6 w-full max-w-full">
            {/* ===== LEFT COLUMN (70-75%) ===== */}
            <div className="flex-1 min-w-0">
              {/* ===== BANNER ===== */}
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden shadow-lg p-6 md:p-8">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${bannerBg})` }}
                  ></div>

                  <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0f3460]/20"></div>

                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FACC15] rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                    <div className="flex-1 text-center md:text-left md:w-[55%]">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <span className="px-4 py-1.5 bg-[#FACC15]/20 text-[#FACC15] text-[12px] font-bold rounded-full border border-[#FACC15]/30">
                          ✨ AI POWERED
                        </span>
                        <span className="px-4 py-1.5 bg-[#FACC15]/20 text-[#FACC15] text-[12px] font-bold rounded-full border border-[#FACC15]/30">
                          🚀 GROWTH
                        </span>
                      </div>

                      <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                        Hello, {user?.name || "Admin"}! 👋
                      </h2>
                      <p className="text-[#FACC15] text-xl md:text-2xl font-semibold mt-2">
                        Build Your Etsy Empire, <br className="sm:hidden" />
                        One Collection at a Time
                      </p>
                      <p className="text-gray-300 text-base md:text-lg mt-3 max-w-xl">
                        AI finds profitable niches, creates stunning designs,{" "}
                        <br className="hidden sm:block" />
                        and publishes printables to Etsy that sell.
                      </p>

                      <button
                        onClick={() => navigate("/create-product")}
                        className="mt-5 px-8 py-3 bg-[#FACC15] hover:bg-[#e5b800] text-[#111820] font-semibold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto md:mx-0"
                      >
                        <Sparkles size={20} />
                        Find My Next Profitable Niche →
                      </button>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-[#FACC15]/5 rounded-full blur-2xl"></div>
                </div>
              </div>

              {/* ===== PLATFORM TRENDING ===== */}
              <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp
                      size={22}
                      className="text-[#FACC15]"
                      strokeWidth={2.2}
                    />
                    <h2 className="text-xl font-bold text-[#172033]">
                      Trending Across Platforms
                    </h2>
                    <span className="text-[13px] text-[#89919d]">
                      Most popular products by platform
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {["books", "gumroad", "etsy", "shopify"].map((platform) => {
                    const config = platformConfig[platform];
                    const Icon = config.icon;
                    const products = platformData[platform] || [];

                    const platformScrollRef = useRef(null);
                    const [showLeftArrow, setShowLeftArrow] = useState(false);
                    const [showRightArrow, setShowRightArrow] = useState(false);

                    useEffect(() => {
                      const container = platformScrollRef.current;
                      if (container) {
                        const checkScroll = () => {
                          const isScrollable =
                            container.scrollWidth > container.clientWidth;
                          if (isScrollable) {
                            setShowLeftArrow(true);
                            setShowRightArrow(true);
                          } else {
                            setShowLeftArrow(false);
                            setShowRightArrow(false);
                          }
                        };

                        setTimeout(checkScroll, 100);
                        container.addEventListener("scroll", checkScroll);
                        window.addEventListener("resize", checkScroll);

                        return () => {
                          container.removeEventListener("scroll", checkScroll);
                          window.removeEventListener("resize", checkScroll);
                        };
                      }
                    }, [products]);

                    const scrollPlatform = (direction) => {
                      const container = platformScrollRef.current;
                      if (container) {
                        const scrollAmount = direction === "left" ? -300 : 300;
                        container.scrollBy({
                          left: scrollAmount,
                          behavior: "smooth",
                        });
                      }
                    };

                    return (
                      <div
                        key={platform}
                        className="rounded-xl border border-[#edf0f4] bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2.5 rounded-lg ${config.bg}`}>
                            <Icon size={20} className="text-[#111820]" />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#172033]">
                              {config.label}
                            </h3>
                            <span className="text-[11px] text-[#89919d]">
                              Trending products
                            </span>
                          </div>
                          <button className="ml-auto text-[11px] font-semibold text-[#FACC15] hover:text-[#e5b800] transition-colors duration-200">
                            View All
                          </button>
                        </div>

                        {platformLoading ? (
                          <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-3 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : products.length === 0 ? (
                          <div className="text-center py-6 text-[#6B7280]">
                            <p className="text-[12px]">No products available</p>
                          </div>
                        ) : (
                          <div className="relative">
                            {showLeftArrow && (
                              <button
                                onClick={() => scrollPlatform("left")}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow-md border border-[#E5E7EB] hover:bg-[#F8F8F6] hover:border-[#FACC15] transition-all duration-200 -ml-2"
                              >
                                <ChevronLeft
                                  size={18}
                                  className="text-[#6B7280]"
                                />
                              </button>
                            )}

                            <div
                              ref={platformScrollRef}
                              className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar px-2"
                              style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                              }}
                            >
                              {products.slice(0, 5).map((product) => (
                                <div
                                  key={
                                    product._id || product.id || product.title
                                  }
                                  className="group relative flex-shrink-0 w-[180px] sm:w-[200px] cursor-pointer transition-all duration-300"
                                >
                                  {/* ===== AMAZON-STYLE CARD ===== */}
                                  <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                    {/* ===== PRODUCT IMAGE ===== */}
                                    <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
                                      <ProductCover
                                        theme={getTheme(product.productType)}
                                        coverImage={
                                          product.coverImage || product.coverUrl
                                        }
                                        title={product.title}
                                      />

                                      {/* ===== BADGES ===== */}
                                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {product.bestSeller && (
                                          <span className="px-2 py-0.5 bg-[#FACC15] text-[#111820] text-[8px] font-bold rounded-full shadow-sm">
                                            Best Seller
                                          </span>
                                        )}
                                        {product.discount && (
                                          <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full shadow-sm">
                                            -{product.discount}%
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* ===== PRODUCT INFO ===== */}
                                    <div className="p-3 space-y-1.5">
                                      {/* ===== RATING ===== */}
                                      <div className="flex items-center gap-1">
                                        <div className="flex items-center">
                                          <Star
                                            size={12}
                                            className="fill-[#FACC15] text-[#FACC15]"
                                          />
                                          <Star
                                            size={12}
                                            className="fill-[#FACC15] text-[#FACC15]"
                                          />
                                          <Star
                                            size={12}
                                            className="fill-[#FACC15] text-[#FACC15]"
                                          />
                                          <Star
                                            size={12}
                                            className="fill-[#FACC15] text-[#FACC15]"
                                          />
                                          <Star
                                            size={12}
                                            className="fill-[#FACC15] text-[#FACC15]"
                                          />
                                        </div>
                                        <span className="text-[10px] font-medium text-[#6B7280]">
                                          {product.rating || 4.5}
                                        </span>
                                        <span className="text-[10px] text-[#6B7280]">
                                          (
                                          {product.reviews ||
                                            product.reviewCount ||
                                            0}
                                          )
                                        </span>
                                      </div>

                                      {/* ===== TITLE ===== */}
                                      <h3 className="text-[14px] font-medium text-[#111111] line-clamp-2 leading-snug min-h-[36px] group-hover:text-[#FACC15] transition-colors duration-200">
                                        {product.title}
                                      </h3>

                                      {/* ===== PRICE ===== */}
                                      <div className="flex items-end gap-2">
                                        <span className="text-[18px] font-bold text-[#111827]">
                                          ${product.price || "0"}
                                        </span>
                                        {product.originalPrice && (
                                          <span className="text-[12px] text-[#6B7280] line-through">
                                            ${product.originalPrice}
                                          </span>
                                        )}
                                      </div>

                                      {/* ===== BUY BUTTON ===== */}
                                      <button
                                        onClick={() => {
                                          navigate("/create-product", {
                                            state: {
                                              productData: {
                                                title: product.title || "",
                                                productType:
                                                  product.productType ||
                                                  "guide",
                                                niche: product.niche || "",
                                                audience:
                                                  product.audience || "",
                                                problem: product.problem || "",
                                                outcome: product.outcome || "",
                                                tone:
                                                  product.tone ||
                                                  "Professional",
                                                language:
                                                  product.language || "English",
                                                coverImage:
                                                  product.coverImage ||
                                                  product.coverUrl ||
                                                  "",
                                                price: product.price || "",
                                                description:
                                                  product.description || "",
                                                authorName:
                                                  product.authorName || "",
                                                brandName:
                                                  product.brandName || "",
                                              },
                                              isEdit: true,
                                            },
                                          });
                                        }}
                                        className="w-full mt-1.5 py-1.5 bg-[#FACC15] hover:bg-[#e5b800] text-[#111820] text-[12px] font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                                      >
                                        <Plus size={13} />
                                        Create
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {showRightArrow && (
                              <button
                                onClick={() => scrollPlatform("right")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white shadow-md border border-[#E5E7EB] hover:bg-[#F8F8F6] hover:border-[#FACC15] transition-all duration-200 -mr-2"
                              >
                                <ChevronRight
                                  size={18}
                                  className="text-[#6B7280]"
                                />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== CHARTS ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp
                        size={22}
                        className="text-[#FACC15]"
                        strokeWidth={2.2}
                      />
                      <h2 className="text-xl font-bold text-[#172033]">
                        Market Performance
                      </h2>
                      <span className="text-[13px] text-[#89919d]">
                        This week
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#FACC15]" />
                        <span className="text-[11px] text-[#6B7280]">
                          Sales
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#e5b800]" />
                        <span className="text-[11px] text-[#6B7280]">
                          Revenue
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#16a34a]">
                        ↑ 18.3%
                      </span>
                    </div>
                  </div>
                  <div className="w-full" style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={marketChartData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="salesGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#FACC15"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="100%"
                              stopColor="#FACC15"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                          <linearGradient
                            id="revenueGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#e5b800"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="100%"
                              stopColor="#e5b800"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          stroke="#f0f2f5"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9aa1ad" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9aa1ad" }}
                          ticks={[0, 25, 50, 75, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid #edf0f4",
                            fontSize: 12,
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#FACC15"
                          strokeWidth={2.5}
                          fill="url(#salesGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#e5b800"
                          strokeWidth={2.5}
                          fill="url(#revenueGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f2f5]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-[#6B7280]">
                          Total Sales:
                        </span>
                        <span className="text-[13px] font-bold text-[#111827]">
                          449
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-[#6B7280]">
                          Revenue:
                        </span>
                        <span className="text-[13px] font-bold text-[#111827]">
                          $346
                        </span>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#16a34a]">
                      ↑ 12.5% vs last week
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <BarChart3
                        size={22}
                        className="text-[#FACC15]"
                        strokeWidth={2.2}
                      />
                      <h2 className="text-xl font-bold text-[#172033]">
                        Category Distribution
                      </h2>
                      <span className="text-[13px] text-[#89919d]">
                        By product type
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-[#6B7280]">
                      Total: 312 products
                    </span>
                  </div>
                  <div className="w-full" style={{ height: "200px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        layout="vertical"
                      >
                        <CartesianGrid horizontal={false} stroke="#f0f2f5" />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9aa1ad" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#6B7280",
                            fontWeight: 500,
                          }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid #edf0f4",
                            fontSize: 12,
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                          formatter={(value) => [`${value} products`, "Count"]}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== RIGHT SIDEBAR (25-30%) ===== */}
            <div className="w-[300px] flex-shrink-0 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-[#FACC15] to-[#e5b800] p-5 text-[#111820] shadow-lg">
                <div className="flex justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25">
                    <Plus size={24} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="mt-3 text-center text-base font-bold">
                  Create New Product
                </h3>
                <p className="mt-1.5 text-center text-[12px] leading-[1.4] text-[#111820]/80">
                  Start creating your next digital product with AI
                </p>
                <button
                  onClick={() => navigate("/create-product")}
                  className="mt-3.5 flex h-10 w-full items-center justify-center rounded-lg bg-white text-[13px] font-bold text-[#111820] hover:shadow-md transition-all duration-200"
                >
                  <Plus size={15} className="mr-1.5" /> Create Now
                </button>
              </div>

              <div className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-[#263043]">
                  Quick Actions
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {quickActionsData.map(([label, Icon]) => (
                    <button
                      key={label}
                      onClick={() =>
                        label === "Create Product" &&
                        navigate("/create-product")
                      }
                      className="flex items-center gap-2 rounded-lg p-2.5 text-[12px] font-medium text-[#4d5664] hover:bg-[#FACC15]/10 transition-all duration-200"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15]/20 text-[#111820]">
                        <Icon size={16} strokeWidth={1.8} />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15]/20 text-[#111820]">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#FACC15]">
                    AI Insights
                  </h3>
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#687180]">
                  Fitness, productivity and AI related products are trending
                  this week.
                </p>
                <button className="mt-3.5 flex h-9 w-full items-center justify-center rounded-lg border-2 border-[#FACC15] text-[12px] font-semibold text-[#111820] hover:bg-[#FACC15] transition-all duration-200">
                  Explore Trends
                </button>
              </div>

              <div className="rounded-xl border border-[#edf0f4] bg-white p-5 shadow-sm">
                <h3 className="text-[15px] font-bold text-[#263043]">
                  Popular Niches
                </h3>
                <div className="mt-3 space-y-2.5">
                  {nichesData.map((niche) => {
                    const Icon = niche.icon;
                    return (
                      <div
                        key={niche.name}
                        className="flex items-center gap-3 group cursor-pointer rounded-lg p-2 hover:bg-[#f8f9fb] transition-colors duration-200"
                      >
                        <div
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            niche.tone === "purple" &&
                              "bg-[#f0ecff] text-[#704fe7]",
                            niche.tone === "green" &&
                              "bg-[#ebfbf1] text-[#1baa58]",
                            niche.tone === "orange" &&
                              "bg-[#fff0e4] text-[#f27828]",
                            niche.tone === "blue" &&
                              "bg-[#ebf5ff] text-[#3f82ec]",
                            niche.tone === "yellow" &&
                              "bg-[#FACC15]/20 text-[#111820]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#364050] group-hover:text-[#FACC15] transition-colors duration-200">
                            {niche.name}
                          </p>
                          <p className="text-[11px] text-[#8b93a0]">
                            {niche.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="mt-3.5 flex h-9 w-full items-center justify-center rounded-lg bg-[#FACC15]/20 text-[12px] font-semibold text-[#111820] hover:bg-[#FACC15]/30 transition-all duration-200">
                  View All <ArrowUpRight size={15} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
