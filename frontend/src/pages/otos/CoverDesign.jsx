// frontend/src/pages/CoverDesign.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Check,
  Loader2,
  Eye,
  PenLine,
  Plus,
  Zap,
  Crown,
  Palette,
  Trash2,
  History,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ================================================================
// DELETE CONFIRMATION MODAL
// ================================================================

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, generation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#111111]">Delete Generation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F8F8F6] transition"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-sm text-[#6B7280]">
            Are you sure you want to delete this generation? This action cannot be undone.
          </p>
          {generation && (
            <div className="mt-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                {generation.imagePath && (
                  <div className="w-12 h-16 rounded overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                    <img
                      src={getImageUrlStatic(generation.imagePath)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#111111] truncate">
                    {generation.prompt || "No prompt"}
                  </p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    {generation.type || 'cover'} • {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                    generation.status === 'completed' ? 'bg-green-100 text-green-700' :
                    generation.status === 'failed' ? 'bg-red-100 text-red-700' :
                    generation.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {generation.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8F8F6] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for modal image preview
const getImageUrlStatic = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('images/')) {
    return `${SERVER_URL}/${imagePath}`;
  }
  if (imagePath.startsWith('uploads/')) {
    return `${SERVER_URL}/${imagePath}`;
  }
  if (imagePath.startsWith('/')) {
    return `${SERVER_URL}${imagePath}`;
  }
  return `${SERVER_URL}/images/generations/${imagePath}`;
};

// ================================================================
// COVER DESIGN PAGE
// ================================================================

export default function CoverDesign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [showPromptInput, setShowPromptInput] = useState(true);
  const [productType, setProductType] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productNiche, setProductNiche] = useState("");
  
  // History state
  const [generations, setGenerations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [generationToDelete, setGenerationToDelete] = useState(null);
  
  // Polling ref
  const pollingIntervalRef = useRef(null);

  // Sample prompts
  const samplePrompts = [
    "A mystical forest with glowing magical creatures and ancient trees",
    "Futuristic cityscape with neon lights and flying vehicles",
    "Minimalist abstract art with geometric shapes and pastel colors",
    "Vintage botanical illustration with detailed flowers and leaves",
    "Cosmic galaxy with vibrant nebula and twinkling stars",
    "Modern minimalist design with bold colors and clean lines",
    "Watercolor landscape with mountains and sunset",
    "Steampunk mechanical gears and clockwork design",
  ];

  // ================================================================
  // GET IMAGE URL
  // ================================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('images/')) {
      return `${SERVER_URL}/${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `${SERVER_URL}/${imagePath}`;
    }
    
    if (imagePath.startsWith('/')) {
      return `${SERVER_URL}${imagePath}`;
    }
    
    return `${SERVER_URL}/images/generations/${imagePath}`;
  };

  // ================================================================
  // FETCH GENERATIONS HISTORY
  // ================================================================

  const fetchGenerations = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await api.get(`/cover/generations?page=${page}&limit=${itemsPerPage}`);
      const data = response.data?.data || {};
      setGenerations(data.generations || []);
      setTotalPages(data.pagination?.pages || 1);
      setCurrentPage(data.pagination?.page || 1);
    } catch (error) {
      console.error("Error fetching generations:", error);
      toast.error("Failed to load generation history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ================================================================
  // DELETE GENERATION - Opens Modal
  // ================================================================

  const handleDeleteClick = (generation, e) => {
    if (e) {
      e.stopPropagation();
    }
    setGenerationToDelete(generation);
    setDeleteModalOpen(true);
  };

  // ================================================================
  // CONFIRM DELETE
  // ================================================================

  const handleConfirmDelete = async () => {
    if (!generationToDelete) return;

    try {
      await api.delete(`/cover/generations/${generationToDelete.generationId}`);
      toast.success("Generation deleted successfully");
      
      // Close modal
      setDeleteModalOpen(false);
      setGenerationToDelete(null);
      
      // Refresh list
      fetchGenerations(currentPage);
      
      // Clear selection if deleted
      if (selectedGeneration?.generationId === generationToDelete.generationId) {
        setSelectedGeneration(null);
      }
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast.error("Failed to delete generation");
    }
  };

  // ================================================================
  // VIEW GENERATION
  // ================================================================

  const handleViewGeneration = (generation) => {
    setSelectedGeneration(generation);
    if (generation.imagePath) {
      const imageUrl = getImageUrl(generation.imagePath);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      }
      setEnhancedPrompt(generation.prompt || "");
    }
  };

  // ================================================================
  // ENHANCE PROMPT WITH DEEPSEEK
  // ================================================================

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    try {
      setIsEnhancing(true);
      setStatus("enhancing");
      toast.loading("🧠 Enhancing prompt with AI...", { id: "enhance" });

      const response = await api.post("/cover/enhance", {
        prompt: prompt,
        productType: productType,
        title: productTitle,
        niche: productNiche,
      });

      const data = response.data?.data || {};
      setEnhancedPrompt(data.enhancedPrompt || prompt);
      
      toast.success("✅ Prompt enhanced successfully!", { id: "enhance" });
      setShowPromptInput(false);
      
    } catch (error) {
      console.error("Enhance error:", error);
      toast.error("Failed to enhance prompt: " + (error.response?.data?.message || error.message), { id: "enhance" });
    } finally {
      setIsEnhancing(false);
    }
  };

  // ================================================================
  // GENERATE IMAGE WITH REPLICATE
  // ================================================================

  const handleGenerateImage = async () => {
    const promptToUse = enhancedPrompt || prompt;
    
    if (!promptToUse.trim()) {
      toast.error("No prompt available");
      return;
    }

    try {
      setIsGenerating(true);
      setStatus("generating");
      setGeneratedImage(null);
      toast.loading("🎨 Generating cover image...", { id: "generate" });

      const response = await api.post("/cover/generate", {
        prompt: promptToUse,
        aspectRatio: "portrait",
      });

      const data = response.data?.data || {};
      setPredictionId(data.predictionId);
      
      startPolling(data.predictionId);
      
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("Failed to generate image: " + (error.response?.data?.message || error.message), { id: "generate" });
      setIsGenerating(false);
      setStatus("idle");
    }
  };

  // ================================================================
  // POLL FOR IMAGE STATUS
  // ================================================================

  const startPolling = (id) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 60;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      
      try {
        const response = await api.get(`/cover/status/${id}`);
        const data = response.data?.data || {};

        if (data.status === "succeeded") {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setGeneratedImage(imageUrl);
          setStatus("generated");
          setIsGenerating(false);
          
          toast.success("🎉 Cover image generated successfully!", { id: "generate" });
          
          setTimeout(() => fetchGenerations(1), 1000);
          
        } else if (data.status === "failed") {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsGenerating(false);
          setStatus("idle");
          
          toast.error("Image generation failed: " + (data.error || "Unknown error"), { id: "generate" });
          
        } else if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsGenerating(false);
          setStatus("idle");
          
          toast.error("Image generation timed out. Please try again.", { id: "generate" });
        }
        
      } catch (error) {
        console.error("Polling error:", error);
        if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsGenerating(false);
          setStatus("idle");
        }
      }
    }, 2000);
  };

  // ================================================================
  // SAVE IMAGE
  // ================================================================

  const handleSaveImage = async () => {
    if (!generatedImage) {
      toast.error("No image to save");
      return;
    }

    try {
      setStatus("saving");
      toast.loading("💾 Saving image...", { id: "save" });

      const response = await api.post("/cover/save", {
        imageUrl: generatedImage,
        productId: null,
      });

      toast.success("✅ Image saved successfully!", { id: "save" });
      setStatus("idle");
      
      setTimeout(() => fetchGenerations(1), 1000);
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save image: " + (error.response?.data?.message || error.message), { id: "save" });
      setStatus("idle");
    }
  };

  // ================================================================
  // DOWNLOAD IMAGE
  // ================================================================

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `cover_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================================================================
  // RESET
  // ================================================================

  const handleReset = () => {
    setPrompt("");
    setEnhancedPrompt("");
    setGeneratedImage(null);
    setPredictionId(null);
    setStatus("idle");
    setIsGenerating(false);
    setIsEnhancing(false);
    setShowPromptInput(true);
    setSelectedGeneration(null);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // ================================================================
  // USE SAMPLE PROMPT
  // ================================================================

  const useSamplePrompt = (sample) => {
    setPrompt(sample);
  };

  // ================================================================
  // LOAD GENERATIONS ON MOUNT
  // ================================================================

  useEffect(() => {
    fetchGenerations();
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
                <Palette size={28} className="text-[#FACC15]" />
                Cover Design Studio
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Create stunning book covers with AI. Describe your vision and let AI bring it to life.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {generatedImage && (
                <>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#222] transition flex items-center gap-2"
                  >
                    <Download size={16} /> Download
                  </button>
                  <button
                    onClick={handleSaveImage}
                    disabled={status === "saving"}
                    className="px-4 py-2 bg-[#FACC15] text-[#111820] rounded-lg text-sm font-medium hover:bg-[#e5b800] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {status === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save
                  </button>
                </>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F8F8F6] transition flex items-center gap-2"
              >
                <RefreshCw size={16} /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* ===== LEFT COLUMN - Preview ===== */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Preview</h2>
                  {status === "generating" && (
                    <span className="text-xs text-[#FACC15] font-medium animate-pulse">Generating...</span>
                  )}
                  {status === "enhancing" && (
                    <span className="text-xs text-[#8b5cf6] font-medium animate-pulse">Enhancing...</span>
                  )}
                </div>

                {/* Image Preview */}
                <div className="relative aspect-[2/3] max-w-[400px] mx-auto rounded-xl overflow-hidden bg-[#F8F9FA] border border-[#E5E7EB]">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated cover"
                      className="w-full h-full object-contain"
                    />
                  ) : isGenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-sm text-[#6B7280]">AI is creating your cover...</p>
                      <p className="text-xs text-[#9AA1AD] mt-1">This may take 10-30 seconds</p>
                    </div>
                  ) : isEnhancing ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-sm text-[#6B7280]">Enhancing your prompt...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#6B7280]">
                      <Palette size={48} className="opacity-20" />
                      <p className="mt-4 text-sm">Enter a prompt to generate</p>
                      <p className="text-xs text-[#9AA1AD]">or use one of the sample prompts below</p>
                    </div>
                  )}

                  {generatedImage && (
                    <div className="absolute top-3 right-3 bg-[#22c55e] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Ready
                    </div>
                  )}
                </div>

                {enhancedPrompt && (
                  <div className="mt-4 p-3 bg-[#f8f9fa] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Enhanced Prompt</p>
                    <p className="text-sm text-[#111111] mt-1 line-clamp-3">{enhancedPrompt}</p>
                  </div>
                )}
              </div>

              {/* ===== GENERATIONS HISTORY ===== */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-[#FACC15]" />
                    <h2 className="text-sm font-semibold text-[#111111]">Your Generations</h2>
                    <span className="text-xs text-[#6B7280]">({generations.length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded ${viewMode === "grid" ? "bg-[#FACC15]" : "hover:bg-[#F8F8F6]"}`}
                    >
                      <Grid size={14} className={viewMode === "grid" ? "text-[#111820]" : "text-[#6B7280]"} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded ${viewMode === "list" ? "bg-[#FACC15]" : "hover:bg-[#F8F8F6]"}`}
                    >
                      <List size={14} className={viewMode === "list" ? "text-[#111820]" : "text-[#6B7280]"} />
                    </button>
                    <button
                      onClick={() => fetchGenerations(1)}
                      className="p-1.5 rounded hover:bg-[#F8F8F6] transition"
                    >
                      <RefreshCw size={14} className="text-[#6B7280]" />
                    </button>
                  </div>
                </div>

                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : generations.length === 0 ? (
                  <div className="text-center py-8 text-[#6B7280]">
                    <ImageIcon size={32} className="mx-auto opacity-20 mb-2" />
                    <p className="text-sm">No generations yet</p>
                    <p className="text-xs">Generate your first cover above</p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {generations.map((gen) => {
                      const imageSrc = getImageUrl(gen.imagePath);
                      return (
                        <div
                          key={gen.generationId}
                          className={`group relative aspect-[2/3] rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                            selectedGeneration?.generationId === gen.generationId
                              ? "border-[#FACC15]"
                              : "border-transparent hover:border-[#FACC15]/50"
                          }`}
                          onClick={() => handleViewGeneration(gen)}
                        >
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={gen.prompt || "Generation"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-full h-full flex items-center justify-center bg-[#FACC15]/10 text-4xl';
                                  fallback.textContent = '📚';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F8F9FA] text-4xl">
                              📚
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye size={20} className="text-white" />
                          </div>
                          <div className="absolute top-1 right-1">
                            <button
                              onClick={(e) => handleDeleteClick(gen, e)}
                              className="p-1 bg-red-500/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                              gen.status === 'completed' ? 'bg-green-500' :
                              gen.status === 'failed' ? 'bg-red-500' :
                              gen.status === 'processing' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            } text-white`}>
                              {gen.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generations.map((gen) => {
                      const imageSrc = getImageUrl(gen.imagePath);
                      return (
                        <div
                          key={gen.generationId}
                          className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition ${
                            selectedGeneration?.generationId === gen.generationId
                              ? "border-[#FACC15] bg-[#FACC15]/5"
                              : "border-transparent hover:bg-[#F8F9FA]"
                          }`}
                          onClick={() => handleViewGeneration(gen)}
                        >
                          <div className="w-12 h-16 rounded overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={gen.prompt || "Generation"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full flex items-center justify-center text-2xl bg-[#F8F9FA]';
                                    fallback.textContent = '📚';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-[#F8F9FA]">
                                📚
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#111111] truncate">{gen.prompt || "No prompt"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#6B7280]">{gen.type || 'cover'}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                                gen.status === 'completed' ? 'bg-green-100 text-green-700' :
                                gen.status === 'failed' ? 'bg-red-100 text-red-700' :
                                gen.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {gen.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewGeneration(gen);
                              }}
                              className="p-1 hover:bg-[#F8F8F6] rounded-lg transition"
                            >
                              <Eye size={14} className="text-[#6B7280]" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(gen, e)}
                              className="p-1 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={14} className="text-[#6B7280] hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => fetchGenerations(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded border border-[#E5E7EB] hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={14} className="text-[#6B7280]" />
                    </button>
                    <span className="text-xs text-[#6B7280]">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchGenerations(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded border border-[#E5E7EB] hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={14} className="text-[#6B7280]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT COLUMN - Controls ===== */}
            <div className="space-y-4">
              {/* Prompt Input */}
              {showPromptInput ? (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-3">
                    <PenLine size={18} className="text-[#FACC15]" />
                    Describe Your Cover
                  </h3>
                  
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the cover you want to create..."
                    className="w-full h-28 p-3 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm text-[#111111] resize-none focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <input
                      type="text"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="Product title (optional)"
                      className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={productNiche}
                      onChange={(e) => setProductNiche(e.target.value)}
                      placeholder="Niche (optional)"
                      className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleEnhancePrompt}
                    disabled={!prompt.trim() || isEnhancing}
                    className="w-full mt-3 py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Enhance with AI
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerateImage}
                    disabled={(!prompt.trim() && !enhancedPrompt) || isGenerating}
                    className="w-full mt-2 py-2.5 bg-[#FACC15] text-[#111820] rounded-lg font-medium hover:bg-[#e5b800] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                      <Sparkles size={18} className="text-[#8b5cf6]" />
                      Enhanced Prompt
                    </h3>
                    <button
                      onClick={() => setShowPromptInput(true)}
                      className="text-xs text-[#6B7280] hover:text-[#111111] transition"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-[#111111] p-3 bg-[#f8f9fa] rounded-lg border border-[#E5E7EB]">
                    {enhancedPrompt}
                  </p>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="w-full mt-3 py-2.5 bg-[#FACC15] text-[#111820] rounded-lg font-medium hover:bg-[#e5b800] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sample Prompts */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-3">
                  <Zap size={18} className="text-[#FACC15]" />
                  Sample Prompts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => useSamplePrompt(sample)}
                      className="px-3 py-1.5 bg-[#F8F9FA] hover:bg-[#FACC15]/20 text-xs text-[#6B7280] hover:text-[#111111] rounded-full border border-[#E5E7EB] hover:border-[#FACC15] transition"
                    >
                      {sample.length > 30 ? sample.substring(0, 30) + "..." : sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-[#fefce8] to-white rounded-xl border border-[#FACC15]/20 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2 mb-2">
                  <Crown size={18} className="text-[#FACC15]" />
                  Tips for Better Results
                </h3>
                <ul className="space-y-1.5 text-xs text-[#6B7280]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FACC15] mt-0.5">•</span>
                    Be specific about colors, style, and mood
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FACC15] mt-0.5">•</span>
                    Mention composition and focal point
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FACC15] mt-0.5">•</span>
                    Include lighting and atmosphere details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FACC15] mt-0.5">•</span>
                    Specify if you want minimalist or detailed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGenerationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        generation={generationToDelete}
      />
    </div>
  );
}