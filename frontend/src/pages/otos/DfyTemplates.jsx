// frontend/src/pages/DfyTemplates.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import templateBg from "../../assets/images/dfy-banner.png";
import toast from "react-hot-toast";
import {
  Search,
  Download,
  FolderOpen,
  X,
  CheckCircle,
  ArrowDownToLine,
  FileText,
  Rocket,
  PlayCircle,
  File,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Shield,
  Zap,
  Layers,
  CheckSquare,
  Clock,
  Star,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  Eye,
  Gift,
  Smartphone,
  Globe,
  Code,
  Palette,
  PenTool,
  Monitor,
  Layout,
  Edit3,
  Upload,
  Share2,
  ArrowRight,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// SVG Image for all cards
const TEMPLATE_IMAGE = "/images/template-preview.png";

// ================================================================
// DFY TEMPLATES PAGE
// ================================================================

export default function DfyTemplates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [downloadedTemplates, setDownloadedTemplates] = useState([]);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    const saved = localStorage.getItem("downloadedTemplates");
    if (saved) {
      try {
        setDownloadedTemplates(JSON.parse(saved));
      } catch (e) {
        setDownloadedTemplates([]);
      }
    }
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = [...templates];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search))),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (t) =>
          t.category &&
          t.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/templates");
      if (response.data?.success) {
        setTemplates(response.data.data || []);
        setFilteredTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/templates/categories");
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDownload = async (templateId, templateName) => {
    if (downloading) return;

    try {
      setDownloading(templateId);
      toast.loading(`Downloading ${templateName}...`, { id: "download" });

      const response = await api.get(`/templates/${templateId}/download`, {
        responseType: "blob",
      });

      if (!response.data || response.data.size === 0) {
        throw new Error("Download file is empty");
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" }),
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${templateName.replace(/\s+/g, "-").toLowerCase()}.zip`,
      );
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      const updated = [...downloadedTemplates, templateId];
      setDownloadedTemplates(updated);
      localStorage.setItem("downloadedTemplates", JSON.stringify(updated));

      toast.success(`${templateName} downloaded successfully!`, {
        id: "download",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error(error.message || "Failed to download template", {
        id: "download",
      });
    } finally {
      setDownloading(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const isDownloaded = (templateId) => {
    return downloadedTemplates.includes(templateId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f6f8]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6B7280] text-sm">Loading templates...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-full mx-auto">
            {/* ===== 2-COLUMN LAYOUT ===== */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* ===== LEFT COLUMN - Templates (70%) ===== */}
              <div className="flex-1 min-w-0">
                {/* ===== DFY TEMPLATES BANNER (Topic Finder Style) ===== */}
                <div className="relative overflow-hidden rounded-2xl mb-6 shadow-xl border border-gray-800/50 bg-[#111827]">
                  {/* Right-side image with gradient overlay */}
                  <div className="absolute inset-y-0 right-0 w-1/2 md:w-2/5">
                    <div
                      className="absolute inset-0 bg-cover bg-right"
                      style={{ backgroundImage: `url(${templateBg})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/70 to-transparent"></div>
                  </div>

                  {/* Glow accent */}
                  <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-[90px] pointer-events-none"></div>

                  {/* Content */}
                  <div className="relative z-10 max-w-[650px] p-6 md:p-8 lg:p-10">
                    {/* Badge */}
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ffd21f]/40 bg-[#ffd21f]/15 px-3 py-1 text-[11px] font-bold text-[#ffd21f]">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>{" "}
                      READY-TO-USE TEMPLATES
                    </div>

                    {/* Heading */}
                    <h1 className="text-[30px] font-black uppercase leading-[1.05] tracking-tight sm:text-[36px] text-white">
                      LAUNCH YOUR{" "}
                      <span className="block text-[#ffd21f]">
                        SALES PAGE IN MINUTES
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-3 max-w-[620px] text-[14px] leading-5 text-slate-300">
                      Download, customize, and launch high-converting sales page
                      templates. No design skills needed.
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        ["fa-file", "50+ Templates"],
                        ["fa-mobile-screen", "Fully Responsive"],
                        ["fa-download", "One-Click Download"],
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

                {/* Search & Filters */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition min-w-[140px]"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name} ({cat.count})
                          </option>
                        ))}
                      </select>
                      {(searchTerm || selectedCategory !== "all") && (
                        <button
                          onClick={clearFilters}
                          className="p-2 text-[#6B7280] hover:text-[#111111] hover:bg-[#F8F8F6] rounded-lg transition"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Templates Grid */}
                {filteredTemplates.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center shadow-sm">
                    <FolderOpen
                      size={48}
                      className="mx-auto text-[#6B7280] opacity-20 mb-4"
                    />
                    <h3 className="text-lg font-semibold text-[#111111]">
                      No templates found
                    </h3>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Try adjusting your search or filters
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-6 py-2 bg-[#FACC15] text-[#111820] rounded-lg font-medium hover:bg-[#e5b800] transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onDownload={handleDownload}
                        downloading={downloading}
                        isDownloaded={isDownloaded(template.id)}
                        image={TEMPLATE_IMAGE}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ===== RIGHT COLUMN - Sidebar (30%) ===== */}
              <div className="w-[280px] lg:w-[300px] flex-shrink-0 space-y-4">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2 mb-4">
                    <BarChart3 size={18} className="text-[#FACC15]" />
                    Template Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                      <p className="text-2xl font-bold text-[#FACC15]">
                        {filteredTemplates.length}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">Available</p>
                    </div>
                    <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                      <p className="text-2xl font-bold text-[#22c55e]">
                        {downloadedTemplates.length}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">Downloaded</p>
                    </div>
                    <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                      <p className="text-2xl font-bold text-[#8b5cf6]">50+</p>
                      <p className="text-[10px] text-[#6B7280]">Total</p>
                    </div>
                    <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                      <p className="text-2xl font-bold text-[#f59e0b]">⚡</p>
                      <p className="text-[10px] text-[#6B7280]">Ready to Use</p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center">
                      <PlayCircle size={18} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      How to Use
                    </h3>
                  </div>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F9FA] transition">
                      <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111820] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="text-[#6B7280]">
                        Download the template zip file
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F9FA] transition">
                      <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111820] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="text-[#6B7280]">
                        Extract the files to your computer
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F9FA] transition">
                      <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111820] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="text-[#6B7280]">
                        Edit the HTML/CSS as per your brand
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#F8F9FA] transition">
                      <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111820] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        4
                      </span>
                      <span className="text-[#6B7280]">
                        Upload to your website & start selling!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* What's Included */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center">
                      <Layers size={18} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      What's Included
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Fully responsive HTML page
                    </li>
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      CSS stylesheet included
                    </li>
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Optimized for conversions
                    </li>
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Ready-to-use sales copy
                    </li>
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Mobile-first design
                    </li>
                    <li className="flex items-center gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition">
                      <CheckCircle
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Easy to customize
                    </li>
                  </ul>
                </div>

                {/* Pro Tips */}
                <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-xl border border-[#FACC15]/30 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FACC15]/30 flex items-center justify-center">
                      <Lightbulb size={18} className="text-[#111820]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111820]">
                      Pro Tips
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-white/50 transition">
                      <span className="text-[#FACC15]">💡</span>
                      <span>Replace sample content with your own</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-white/50 transition">
                      <span className="text-[#FACC15]">🎨</span>
                      <span>Update colors to match your brand</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-white/50 transition">
                      <span className="text-[#FACC15]">📸</span>
                      <span>Add your product images & testimonials</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-white/50 transition">
                      <span className="text-[#FACC15]">🚀</span>
                      <span>Test with your audience before launch</span>
                    </li>
                    <li className="flex items-start gap-2 text-[#6B7280] p-1.5 rounded-lg hover:bg-white/50 transition">
                      <span className="text-[#FACC15]">📊</span>
                      <span>Track conversions and optimize</span>
                    </li>
                  </ul>
                </div>

                {/* Need Help */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center">
                      <Shield size={18} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      Need Help?
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3">
                    Having trouble with the templates? Our support team is here
                    to help.
                  </p>
                  <button className="w-full py-2 bg-[#FACC15] text-[#111820] rounded-lg text-xs font-semibold hover:bg-[#e5b800] transition flex items-center justify-center gap-2">
                    Contact Support <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// TEMPLATE CARD COMPONENT
// ================================================================

const TemplateCard = ({
  template,
  onDownload,
  downloading,
  isDownloaded,
  image,
}) => {
  const isDownloading = downloading === template.id;

  const handleDownloadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDownloading && !isDownloaded) {
      onDownload(template.id, template.name);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#FACC15]/50">
      {/* Template Image */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#FACC15]/10 to-[#F59E0B]/5 overflow-hidden">
        <img
          src={image}
          alt="Template Preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
            const parent = e.target.parentElement;
            if (parent) {
              const fallback = document.createElement("div");
              fallback.className =
                "w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#FACC15]/20 to-[#F59E0B]/10";
              fallback.textContent = "📄";
              parent.appendChild(fallback);
            }
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#111111] rounded-full shadow-sm border border-[#E5E7EB]">
            {template.category || "General"}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-[#FACC15] text-[10px] font-bold text-[#111820] rounded-full shadow-sm">
            {template.price || "Free"}
          </span>
        </div>

        {/* Downloaded Badge */}
        {isDownloaded && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-semibold rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle size={12} /> Downloaded
            </span>
          </div>
        )}

        {/* Hover Download Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading || isDownloaded}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-lg disabled:opacity-50 ${
              isDownloaded
                ? "bg-green-500 text-white cursor-default"
                : "bg-[#FACC15] text-[#111820] hover:bg-[#e5b800]"
            }`}
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#111820] border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : isDownloaded ? (
              <>
                <CheckCircle size={16} />
                Downloaded
              </>
            ) : (
              <>
                <ArrowDownToLine size={16} />
                Download Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#111111] line-clamp-1 group-hover:text-[#FACC15] transition">
          {template.name}
        </h3>
        <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-[8px] bg-[#F8F9FA] text-[#6B7280] px-2 py-0.5 rounded-full border border-[#E5E7EB]"
              >
                #{tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-[8px] bg-[#F8F9FA] text-[#6B7280] px-2 py-0.5 rounded-full border border-[#E5E7EB]">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Download Button */}
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading || isDownloaded}
          className={`w-full mt-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 ${
            isDownloaded
              ? "bg-green-100 text-green-700 cursor-default border border-green-200"
              : "bg-[#FACC15] text-[#111820] hover:bg-[#e5b800]"
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#111820] border-t-transparent rounded-full animate-spin" />
              Downloading...
            </>
          ) : isDownloaded ? (
            <>
              <CheckCircle size={14} />
              Downloaded
            </>
          ) : (
            <>
              <Download size={14} />
              Download Template
            </>
          )}
        </button>
      </div>
    </div>
  );
};
