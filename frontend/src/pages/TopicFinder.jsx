// frontend/src/pages/TopicFinder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import topicFinderBg from "../assets/images/topic-finder-bg.png";
import {
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  Lightbulb,
  RefreshCw,
  Target,
  Rocket,
  Users,
  Eye,
  BarChart3,
  Loader2,
  Send,
  CheckCircle,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  List,
  LayoutGrid,
  Trash2,
  Clock,
  Save,
} from "lucide-react";

const TopicFinder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [productType, setProductType] = useState("ebook");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [copied, setCopied] = useState(null);
  const [usingTopic, setUsingTopic] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [lastGeneratedTopic, setLastGeneratedTopic] = useState("");
  const [lastGeneratedProductType, setLastGeneratedProductType] = useState("");

  // ✅ Load saved topics from localStorage on mount
  useEffect(() => {
    const savedTopics = localStorage.getItem("topicFinder_topics");
    const savedTopic = localStorage.getItem("topicFinder_lastTopic");
    const savedProductType = localStorage.getItem("topicFinder_lastProductType");

    if (savedTopics) {
      try {
        const parsed = JSON.parse(savedTopics);
        if (parsed.length > 0) {
          setTopics(parsed);
          toast.success(`📂 Loaded ${parsed.length} saved topics from your session`, {
            duration: 3000,
          });
        }
      } catch (e) {
        console.error("Failed to load saved topics:", e);
      }
    }

    if (savedTopic) {
      setTopic(savedTopic);
      setLastGeneratedTopic(savedTopic);
    }

    if (savedProductType) {
      setProductType(savedProductType);
      setLastGeneratedProductType(savedProductType);
    }
  }, []);

  // ✅ Save topics to localStorage whenever they change
  useEffect(() => {
    if (topics.length > 0) {
      localStorage.setItem("topicFinder_topics", JSON.stringify(topics));
      localStorage.setItem("topicFinder_lastTopic", topic);
      localStorage.setItem("topicFinder_lastProductType", productType);
    }
  }, [topics, topic, productType]);

  // Product Types
  const productTypes = [
    { value: "ebook", label: "📚 E-Book" },
    { value: "guide", label: "📖 Guide" },
    { value: "course", label: "🎓 Online Course" },
    { value: "template", label: "📊 Template" },
    { value: "planner", label: "📅 Planner" },
    { value: "checklist", label: "✅ Checklist" },
    { value: "workbook", label: "📝 Workbook" },
    { value: "prompt-pack", label: "🤖 AI Prompt Pack" },
    { value: "spreadsheet", label: "📈 Spreadsheet" },
    { value: "challenge", label: "🏆 Challenge" },
  ];

  // Generate Topics
  const generateTopics = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or niche");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/topics/generate", {
        topic: topic.trim(),
        productType: productType,
      });

      if (response.data.success) {
        setTopics(response.data.topics);
        setLastGeneratedTopic(topic.trim());
        setLastGeneratedProductType(productType);
        toast.success(`Generated ${response.data.topics.length} topics! Saved to your session.`);
      }
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear all saved topics
  const clearAllTopics = () => {
    if (topics.length === 0) return;
    
    if (window.confirm("Are you sure you want to clear all saved topics?")) {
      setTopics([]);
      setSelectedTopics([]);
      localStorage.removeItem("topicFinder_topics");
      localStorage.removeItem("topicFinder_lastTopic");
      localStorage.removeItem("topicFinder_lastProductType");
      toast.success("All topics cleared");
    }
  };

  // USE TOPIC - Navigate to Create page with topic data
  const handleUseTopic = (topicItem) => {
    setUsingTopic(topicItem.id);

    const productData = {
      title: topicItem.title,
      niche: topicItem.niche || topic,
      description: topicItem.description || "",
      audience: topicItem.targetAudience || "",
      productType: productType,
      keywords: topicItem.keywords || [],
      estimatedSales: topicItem.estimatedSales || "",
      difficulty: topicItem.difficulty || "Medium",
      platform: topicItem.platform || "",
      trending: topicItem.trending || 0,
      demand: topicItem.demand || 0,
      competition: topicItem.competition || 0,
    };

    navigate("/create", {
      state: {
        fromTopicFinder: true,
        topicData: productData,
        productType: productType,
      },
    });

    toast.success(`Using "${topicItem.title}"`);
    setTimeout(() => setUsingTopic(null), 1000);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSelectTopic = (topicItem) => {
    setSelectedTopics((prev) =>
      prev.find((t) => t.id === topicItem.id)
        ? prev.filter((t) => t.id !== topicItem.id)
        : [...prev, topicItem]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics([...topics]);
    }
  };

  const exportTopics = () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic to export");
      return;
    }

    const exportData = selectedTopics.map((t) => ({
      title: t.title,
      niche: t.niche,
      description: t.description,
      keywords: t.keywords?.join(", "),
      estimatedSales: t.estimatedSales,
      difficulty: t.difficulty,
      platform: t.platform,
      trending: t.trending,
      demand: t.demand,
    }));

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topics_${topic.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Topics exported successfully!");
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      Low: "bg-green-100 text-green-700",
      Medium: "bg-yellow-100 text-yellow-700",
      High: "bg-red-100 text-red-700",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-700";
  };

  const getTrendingColor = (score) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    return "text-gray-500";
  };

  // Right Section Data
  const statsData = [
    {
      label: "Total Topics Found",
      value: topics.length || 0,
      icon: TrendingIcon,
      color: "text-[#FACC15]",
    },
    {
      label: "Topics Selected",
      value: selectedTopics.length || 0,
      icon: StarIcon,
      color: "text-purple-500",
    },
    {
      label: "Avg. Trending Score",
      value:
        topics.length > 0
          ? Math.round(
              topics.reduce((acc, t) => acc + (t.trending || 0), 0) /
                topics.length
            )
          : 0,
      icon: BarChart3,
      color: "text-emerald-500",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Get trending topic ideas powered by advanced AI algorithms",
    },
    {
      icon: Target,
      title: "Smart Topic Selection",
      description:
        "Choose the best topics based on trending, demand, and competition scores",
    },
    {
      icon: Rocket,
      title: "One-Click Product Creation",
      description:
        "Use any topic directly to start creating your digital product",
    },
    {
      icon: Download,
      title: "Export & Save",
      description: "Export your favorite topics as JSON for later use",
    },
  ];

  const benefits = [
    "Discover trending topics in your niche",
    "AI-generated with high conversion potential",
    "Multiple product type suggestions",
    "Save and export your favorite topics",
    "One-click product creation",
    "💾 Topics are saved automatically - come back anytime!",
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto">
            {/* 2-COLUMN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT COLUMN - Search & Results (70%) */}
              <div className="flex-1 min-w-0">
                {/* ===== HERO BANNER ===== */}
                <div className="relative overflow-hidden rounded-2xl mb-6 shadow-xl border border-gray-800/50 bg-[#111827]">
                  <div className="absolute inset-y-0 right-0 w-1/2 md:w-2/5">
                    <div
                      className="absolute inset-0 bg-cover bg-right"
                      style={{ backgroundImage: `url(${topicFinderBg})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/70 to-transparent"></div>
                  </div>
                  <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-[90px] pointer-events-none"></div>

                  <div className="relative z-10 max-w-[650px] p-6 md:p-8 lg:p-10">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ffd21f]/40 bg-[#ffd21f]/15 px-3 py-1 text-[11px] font-bold text-[#ffd21f]">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>{" "}
                      AI-POWERED RESEARCH
                    </div>
                    <h1 className="text-[30px] font-black uppercase leading-[1.05] tracking-tight sm:text-[36px] text-white">
                      FIND YOUR NEXT{" "}
                      <span className="block text-[#ffd21f]">
                        WINNING PRODUCT IDEA
                      </span>
                    </h1>
                    <p className="mt-3 max-w-[620px] text-[14px] leading-5 text-slate-300">
                      Discover profitable digital product topics, analyze
                      demand, and find opportunities before you start creating.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        ["fa-arrow-trend-up", "Trendy Topics"],
                        ["fa-bullseye", "Profitable Niches"],
                        ["fa-bolt", "Instant Ideas"],
                      ].map(([icon, text]) => (
                        <span
                          key={text}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[10px] font-bold text-white"
                        >
                          <i className={`fa-solid ${icon} text-[#ffd21f]`}></i>{" "}
                          {text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ===== Search Section ===== */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter Topic or Niche
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., Digital Marketing, Health & Wellness, AI Tools..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition"
                          onKeyDown={(e) =>
                            e.key === "Enter" && generateTopics()
                          }
                        />
                      </div>
                    </div>

                    <div className="md:w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Type
                      </label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition bg-white"
                      >
                        {productTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={generateTopics}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-[#FACC15] text-[#111827] rounded-xl font-semibold hover:bg-[#F59E0B] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FACC15]/25"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Find Topics
                          </>
                        )}
                      </button>
                      {topics.length > 0 && (
                        <button
                          onClick={clearAllTopics}
                          className="px-3 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                          title="Clear all saved topics"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Trending niches:
                    </span>
                    {[
                      "AI Marketing",
                      "Digital Wellness",
                      "Productivity",
                      "Sustainable Living",
                      "Remote Work",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setTopic(suggestion)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-[#FACC15]/20 rounded-full transition text-gray-700 hover:text-[#111827]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ===== Results ===== */}
                {topics.length > 0 && (
                  <>
                    {/* Results Header with View Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          <span className="text-[#FACC15]">
                            {topics.length}
                          </span>{" "}
                          Topic Ideas Found
                        </h2>
                        <p className="text-sm text-gray-500">
                          Click "Use Topic" to start creating your product
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-md transition ${
                              viewMode === "table"
                                ? "bg-white shadow-sm text-[#111827]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            title="Table View"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md transition ${
                              viewMode === "grid"
                                ? "bg-white shadow-sm text-[#111827]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            title="Grid View"
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => setSelectedTopics([])}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={exportTopics}
                          disabled={selectedTopics.length === 0}
                          className="px-4 py-2 bg-[#FACC15] text-[#111827] text-sm font-medium rounded-lg hover:bg-[#F59E0B] transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export ({selectedTopics.length})
                        </button>
                      </div>
                    </div>

                    {/* TABLE VIEW */}
                    {viewMode === "table" ? (
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-4 py-3 text-left">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedTopics.length === topics.length &&
                                      topics.length > 0
                                    }
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
                                  />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  #
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Topic Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Trending
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Demand
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Competition
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Difficulty
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Est. Sales
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {topics.map((topicItem) => {
                                const isSelected = selectedTopics.some(
                                  (t) => t.id === topicItem.id
                                );
                                return (
                                  <tr
                                    key={topicItem.id}
                                    className={`hover:bg-gray-50/50 transition ${
                                      isSelected ? "bg-[#FFFBEB]" : ""
                                    }`}
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleSelectTopic(topicItem)
                                        }
                                        className="w-4 h-4 rounded border-gray-300 text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-gray-400">
                                      #{topicItem.id}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="max-w-[200px]">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {topicItem.title}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                          {topicItem.description?.slice(0, 60) ||
                                            "Trending topic"}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`font-semibold ${getTrendingColor(
                                          topicItem.trending || 85
                                        )}`}
                                      >
                                        {topicItem.trending || 85}%
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                                        <div
                                          className="bg-blue-500 h-1.5 rounded-full"
                                          style={{
                                            width: `${
                                              topicItem.demand || 80
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {topicItem.demand || 80}%
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                                        <div
                                          className="bg-orange-500 h-1.5 rounded-full"
                                          style={{
                                            width: `${
                                              topicItem.competition || 50
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {topicItem.competition || 50}%
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(
                                          topicItem.difficulty || "Medium"
                                        )}`}
                                      >
                                        {topicItem.difficulty || "Medium"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                      {topicItem.estimatedSales || "2,000+"}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          onClick={() =>
                                            handleCopy(
                                              topicItem.title,
                                              topicItem.id
                                            )
                                          }
                                          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                          title="Copy title"
                                        >
                                          {copied === topicItem.id ? (
                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleUseTopic(topicItem)
                                          }
                                          disabled={
                                            usingTopic === topicItem.id
                                          }
                                          className="px-3 py-1 bg-[#FACC15] text-[#111827] text-xs font-medium rounded-lg hover:bg-[#F59E0B] transition flex items-center gap-1 disabled:opacity-50"
                                        >
                                          {usingTopic === topicItem.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <Send className="w-3 h-3" />
                                          )}
                                          Use
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* GRID VIEW */
                      <div className="grid grid-cols-1 gap-4">
                        {topics.map((topicItem) => {
                          const isSelected = selectedTopics.some(
                            (t) => t.id === topicItem.id
                          );
                          return (
                            <div
                              key={topicItem.id}
                              className={`bg-white rounded-2xl border p-5 transition-all duration-300 ${
                                isSelected
                                  ? "border-[#FACC15] shadow-md ring-1 ring-[#FACC15]/20"
                                  : "border-gray-100 hover:border-[#FACC15]/50 hover:shadow-lg hover:-translate-y-0.5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm font-bold text-[#FACC15]">
                                      #{topicItem.id}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(
                                        topicItem.difficulty || "Medium"
                                      )}`}
                                    >
                                      {topicItem.difficulty || "Medium"}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-semibold text-gray-900 leading-relaxed">
                                    {topicItem.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {topicItem.description ||
                                      "Trending topic for your product"}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <BarChart3 className="w-3 h-3" />
                                      {topicItem.trending || 85}% Trending
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {topicItem.demand || 80}% Demand
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      {topicItem.competition || 50}% Competition
                                    </span>
                                  </div>
                                  {topicItem.keywords && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {topicItem.keywords
                                        .slice(0, 3)
                                        .map((keyword, idx) => (
                                          <span
                                            key={idx}
                                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                          >
                                            #{keyword}
                                          </span>
                                        ))}
                                      {topicItem.keywords.length > 3 && (
                                        <span className="text-[10px] text-gray-400">
                                          +
                                          {topicItem.keywords.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition flex items-center justify-center ${
                                      isSelected
                                        ? "bg-[#FACC15] border-[#FACC15]"
                                        : "border-gray-300 hover:border-[#FACC15]"
                                    }`}
                                    onClick={() =>
                                      toggleSelectTopic(topicItem)
                                    }
                                  >
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-[#111827]" />
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleUseTopic(topicItem)}
                                    disabled={usingTopic === topicItem.id}
                                    className="px-4 py-1.5 bg-[#FACC15] text-[#111827] text-xs font-medium rounded-lg hover:bg-[#F59E0B] active:scale-[0.97] transition flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {usingTopic === topicItem.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    Use Topic
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCopy(topicItem.title, topicItem.id)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded-lg transition"
                                  >
                                    {copied === topicItem.id ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {topics.length === 0 && !loading && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-[#FACC15] opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Find Trending Topics
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Enter a topic or niche above and select a product type to
                      discover AI-generated trending ideas for your next digital
                      product.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {[
                        "AI",
                        "Marketing",
                        "Health",
                        "Finance",
                        "Productivity",
                      ].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setTopic(tag)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-[#FACC15]/20 rounded-full text-sm text-gray-600 hover:text-[#111827] transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ RIGHT COLUMN - Information & Stats (30%) */}
              <div className="w-[300px] flex-shrink-0 space-y-4">
                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-[#FACC15]" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    {statsData.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          <span className="text-sm text-gray-600">
                            {stat.label}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gradient-to-br from-[#111827] to-[#1a1a2e] rounded-2xl p-5 border border-gray-800/50">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#FACC15]" />
                    How It Works
                  </h3>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                      >
                        <div className="p-1.5 bg-[#FACC15]/20 rounded-lg">
                          <feature.icon className="w-4 h-4 text-[#FACC15]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">
                            {feature.title}
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Benefits
                  </h3>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Tip */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        💡 Pro Tip
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Topics with high trending (80%+) and medium competition
                        (40-60%) are ideal for quick wins.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Info Card */}
                {topics.length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Save className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          💾 Topics Saved
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {topics.length} topics saved in your session. They'll
                          stay here when you come back!
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Last search: "{lastGeneratedTopic || topic}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TopicFinder;
