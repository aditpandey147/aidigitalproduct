// frontend/src/pages/CreateProduct.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  BookOpen,
  Check,
  Download,
  FileText,
  Lightbulb,
  ListChecks,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

// ================================================================
// ICON COMPONENTS
// ================================================================

function CalendarIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="M8 13h2M14 13h2M8 17h2" />
    </svg>
  );
}

function SpreadsheetIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M4 8h16M9 8v13M15 8v13M4 14h16" />
    </svg>
  );
}

function TemplateIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v18M3 12h18" />
      <path d="M7 7h4M13 7h4M7 17h4M13 17h4" />
    </svg>
  );
}

function BotIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="7" width="14" height="12" rx="3" />
      <path d="M12 3v4M9 12h.01M15 12h.01M9 16h6" />
      <path d="M2.5 11v4M21.5 11v4" />
    </svg>
  );
}

function GraduationIcon({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 11.5V16c3 2 7 2 10 0v-4.5M21 10v6" />
    </svg>
  );
}

function FlameIcon({ size = 28, className = "" }) {
  return (
    <span style={{ fontSize: size - 1, lineHeight: 1 }} className={className}>
      🔥
    </span>
  );
}

// ================================================================
// ✅ PRODUCT TYPES - DEFINED BEFORE COMPONENT
// ================================================================

const productTypes = [
  {
    id: "guide",
    title: "Guide",
    icon: BookOpen,
    desc: "Step-by-step guide\nor how-to content",
  },
  {
    id: "workbook",
    title: "Workbook",
    icon: FileText,
    desc: "Interactive workbook\nwith exercises",
  },
  {
    id: "planner",
    title: "Planner",
    icon: CalendarIcon,
    desc: "Plan, organize and\nachieve goals",
  },
  {
    id: "checklists",
    title: "Checklist",
    icon: ListChecks,
    desc: "Actionable checklist\nor task list",
  },
  {
    id: "spreadsheets",
    title: "Spreadsheet",
    icon: SpreadsheetIcon,
    desc: "Excel sheets with\ncalculations",
  },
  {
    id: "templates",
    title: "Template",
    icon: TemplateIcon,
    desc: "Ready-to-use\ntemplates",
  },
  {
    id: "prompt-packs",
    title: "Prompt Pack",
    icon: BotIcon,
    desc: "Collection of AI\nprompts",
  },
  {
    id: "mini-courses",
    title: "Mini Course",
    icon: GraduationIcon,
    desc: "Short course with\nlessons",
  },
  {
    id: "challenges",
    title: "Challenge",
    icon: FlameIcon,
    desc: "Step-by-step\nchallenge program",
  },
  {
    id: "ebook",
    title: "Ebook",
    icon: BookOpen,
    desc: "Full-length digital\nbooks with chapters",
  },
  {
    id: "worksheets",
    title: "Worksheet",
    icon: FileText,
    desc: "Practical worksheets\nand exercises",
  },
];

const tones = [
  "Professional",
  "Casual",
  "Inspirational",
  "Educational",
  "Conversational",
  "Authoritative",
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Japanese",
  "Chinese",
];

const lengths = [
  "Short (20-30 pages)",
  "Medium (50-80 pages)",
  "Long (100-150 pages)",
  "Comprehensive (200+ pages)",
];

const examples = [
  {
    title: "30-Day Fitness Challenge",
    description:
      "A complete 30-day fitness challenge with workouts, meal plans and trackers.",
    type: "Challenge",
    cover: "fitness",
  },
  {
    title: "Instagram Growth Guide",
    description:
      "Step-by-step guide to grow your Instagram followers organically.",
    type: "Guide",
    cover: "instagram",
  },
  {
    title: "Budget Planner 2024",
    description: "Monthly budget planner with expense tracker and reports.",
    type: "Planner",
    cover: "budget",
  },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

const CreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get product data from navigation state
  const productDataFromNav = location.state?.productData || null;

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [productId, setProductId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);

  // Track if generation is in progress (prevents multiple generations)
  const isGeneratingRef = useRef(false);

  // Track progress for live updates
  const [liveProgress, setLiveProgress] = useState({
    percentage: 0,
    currentStepLabel: "Starting...",
    steps: [
      { id: 1, label: "Understanding your idea", status: "pending" },
      { id: 2, label: "Creating outline", status: "pending" },
      { id: 3, label: "Writing content", status: "pending" },
      { id: 4, label: "Generating cover image", status: "pending" },
      { id: 5, label: "Creating files", status: "pending" },
      { id: 6, label: "Building sales page", status: "pending" },
      { id: 7, label: "Marketing kit", status: "pending" },
    ],
  });

  // Show/hide progress box
  const [showProgressBox, setShowProgressBox] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // ✅ Initialize form data with product data from navigation
  const [formData, setFormData] = useState({
    productType: productDataFromNav?.productType || "",
    title: productDataFromNav?.title || "",
    niche: productDataFromNav?.niche || "",
    audience: productDataFromNav?.audience || "",
    problem: productDataFromNav?.problem || "",
    outcome: productDataFromNav?.outcome || "",
    language: productDataFromNav?.language || "English",
    tone: productDataFromNav?.tone || "Professional",
    authorName: productDataFromNav?.authorName || "",
    brandName: productDataFromNav?.brandName || "",
    length: "Medium (50-80 pages)",
    outline: null,
    content: null,
    design: null,
    files: null,
    salesPage: null,
    marketing: null,
    coverImage: productDataFromNav?.coverImage || null,
    pdfPath: null,
  });

  const [progress, setProgress] = useState({
    currentStep: 0,
    totalSteps: 7,
    steps: [
      { id: 1, label: "Understanding your idea", status: "pending" },
      { id: 2, label: "Creating outline", status: "pending" },
      { id: 3, label: "Writing content", status: "pending" },
      { id: 4, label: "Generating cover image", status: "pending" },
      { id: 5, label: "Creating files", status: "pending" },
      { id: 6, label: "Building sales page", status: "pending" },
      { id: 7, label: "Marketing kit", status: "pending" },
    ],
    percentage: 0,
    currentStepLabel: "",
  });

  // ✅ productTypes is now defined, so this works
  const selectedType = productTypes.find((t) => t.id === formData.productType);

  // ✅ Show toast when data is auto-filled
  useEffect(() => {
    if (productDataFromNav) {
      toast.success(`📋 "${productDataFromNav.title}" loaded! Edit and generate.`);
      console.log("📦 Auto-filled from product:", productDataFromNav);
    }
  }, [productDataFromNav]);

  useEffect(() => {
    // Check if there's a generation in progress from localStorage
    const storedProductId = localStorage.getItem("generatingProductId");
    const storedProgress = localStorage.getItem("generationProgress");

    if (storedProductId && storedProgress) {
      try {
        const progressData = JSON.parse(storedProgress);
        setProductId(storedProductId);
        setLiveProgress(progressData);
        setShowProgressBox(true);
        setGenerating(true);
        setGenerationComplete(false);
        isGeneratingRef.current = true;

        // Resume polling
        pollGenerationProgress(storedProductId);
      } catch (e) {
        console.error("Failed to restore progress:", e);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (productId && showProgressBox) {
      localStorage.setItem("generatingProductId", productId);
      localStorage.setItem("generationProgress", JSON.stringify(liveProgress));
    }
  }, [productId, liveProgress, showProgressBox]);

  // Loader animation steps
  const loaderSteps = [
    "🔄 Initializing AI Engine...",
    "📋 Gathering product details...",
    "🧠 Understanding your idea...",
    "📚 Generating content structure...",
    "✍️ Writing your product content...",
    "🎨 Creating designs...",
    "📄 Generating files...",
    "🌐 Building sales page...",
    "📣 Creating marketing kit...",
    "🎉 Almost done! Packaging...",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductTypeSelect = (typeId) => {
    setFormData({ ...formData, productType: typeId });
  };

  const runLoaderAnimation = () => {
    return new Promise((resolve) => {
      let step = 0;
      setShowLoader(true);
      setLoaderStep(0);

      const interval = setInterval(() => {
        step++;
        setLoaderStep(step);
        if (step >= loaderSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setShowLoader(false);
            resolve();
          }, 500);
        }
      }, 500);
    });
  };

  const pollGenerationProgress = (productId) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    console.log("🔄 Starting progress polling...");
    setShowProgressBox(true);
    setGenerationComplete(false);

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/products/${productId}/progress`);
        const data = response.data?.data || response.data;

        console.log("📊 Progress data:", data);
        console.log(
          `📊 Progress: ${data.progress}% - ${data.currentStepLabel}`,
        );

        if (data.status === "completed") {
          clearInterval(interval);
          setPollingInterval(null);
          setGenerationComplete(true);
          isGeneratingRef.current = false;
          setGenerating(false);

          // Update all progress states to 100%
          setProgress({
            currentStep: 6,
            totalSteps: 7,
            steps: [
              { id: 1, label: "Understanding your idea", status: "completed" },
              { id: 2, label: "Creating outline", status: "completed" },
              { id: 3, label: "Writing content", status: "completed" },
              { id: 4, label: "Generating cover image", status: "completed" },
              { id: 5, label: "Creating files", status: "completed" },
              { id: 6, label: "Building sales page", status: "completed" },
              { id: 7, label: "Marketing kit", status: "completed" },
            ],
            percentage: 100,
            currentStepLabel: "Complete!",
          });

          setLiveProgress({
            percentage: 100,
            currentStepLabel: "✅ Complete!",
            steps: [
              { id: 1, label: "Understanding your idea", status: "completed" },
              { id: 2, label: "Creating outline", status: "completed" },
              { id: 3, label: "Writing content", status: "completed" },
              { id: 4, label: "Generating cover image", status: "completed" },
              { id: 5, label: "Creating files", status: "completed" },
              { id: 6, label: "Building sales page", status: "completed" },
              { id: 7, label: "Marketing kit", status: "completed" },
            ],
          });

          // Fetch full product data
          const productRes = await api.get(`/products/${productId}`);
          const productData = productRes.data?.data || productRes.data;
          setFormData((prev) => ({
            ...prev,
            outline: productData.outline,
            content: productData.content,
            coverImage: productData.coverImage,
            pdfPath: productData.pdfPath,
            salesPage: productData.salesPage,
            marketing: productData.marketing,
          }));

          toast.success("🎉 Your product is ready!");

          localStorage.removeItem("generatingProductId");
          localStorage.removeItem("generationProgress");

          setTimeout(() => {
            setShowProgressBox(false);
          }, 5000);

          setCurrentStep(3);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setPollingInterval(null);
          isGeneratingRef.current = false;
          setGenerating(false);
          toast.error(`Generation failed: ${data.error || "Unknown error"}`);
          setCurrentStep(1);
          setShowProgressBox(false);
          localStorage.removeItem("generatingProductId");
          localStorage.removeItem("generationProgress");
        } else {
          // Update progress based on data from backend
          const progressVal = data.progress || 0;
          const stepLabels = [
            "Understanding your idea",
            "Creating outline",
            "Writing content",
            "Generating cover image",
            "Creating files",
            "Building sales page",
            "Marketing kit",
          ];

          const currentStepIndex = Math.min(
            Math.floor((progressVal / 100) * stepLabels.length),
            stepLabels.length - 1,
          );

          // Update progress state
          setProgress((prev) => {
            const updatedSteps = prev.steps.map((s, i) => ({
              ...s,
              status:
                i < currentStepIndex
                  ? "completed"
                  : i === currentStepIndex
                    ? "in-progress"
                    : "pending",
            }));
            return {
              ...prev,
              currentStep: currentStepIndex,
              steps: updatedSteps,
              percentage: progressVal,
              currentStepLabel: stepLabels[currentStepIndex] || "Processing...",
            };
          });

          // Update live progress for the box
          const updatedSteps = liveProgress.steps.map((s, i) => ({
            ...s,
            status:
              i < currentStepIndex
                ? "completed"
                : i === currentStepIndex && progressVal < 100
                  ? "in-progress"
                  : "pending",
          }));

          setLiveProgress({
            percentage: progressVal,
            currentStepLabel: stepLabels[currentStepIndex] || "Processing...",
            steps: updatedSteps,
          });

          console.log(
            `📊 Progress updated: ${progressVal}% - ${stepLabels[currentStepIndex]}`,
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  // Handle generate with live progress
  const handleGenerateAll = async () => {
    if (isGeneratingRef.current) {
      toast.error("⏳ Generation already in progress. Please wait.");
      return;
    }

    console.log("🔵 GENERATE BUTTON CLICKED");

    const required = [
      "productType",
      "title",
      "niche",
      "audience",
      "problem",
      "outcome",
    ];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Show loader animation
    await runLoaderAnimation();

    isGeneratingRef.current = true;
    setGenerating(true);
    setShowProgressBox(true);
    setGenerationComplete(false);

    setLiveProgress({
      percentage: 0,
      currentStepLabel: "Starting generation...",
      steps: liveProgress.steps.map((s) => ({ ...s, status: "pending" })),
    });

    toast.loading("🚀 Generation started! AI is working...", {
      duration: 3000,
    });

    try {
      const productPayload = {
        title: formData.title,
        type: formData.productType,
        productType: formData.productType,
        niche: formData.niche,
        audience: formData.audience,
        problem: formData.problem,
        outcome: formData.outcome,
        language: formData.language,
        tone: formData.tone,
        authorName: formData.authorName,
        brandName: formData.brandName,
        length: formData.length,
      };

      const productResponse = await api.post("/products", productPayload);
      console.log("✅ Product created:", productResponse.data);

      const newProductId =
        productResponse.data?.data?.id ||
        productResponse.data?.data?._id ||
        productResponse.data?.id ||
        productResponse.data?._id;

      if (!newProductId) {
        throw new Error("Failed to get product ID from response");
      }

      setProductId(newProductId);
      console.log("✅ Product ID:", newProductId);

      await api.post(`/products/${newProductId}/generate`);
      console.log("✅ Generation started");

      toast.success("⏳ AI is working on your product...", { duration: 2000 });

      pollGenerationProgress(newProductId);
      setCurrentStep(2);
    } catch (error) {
      console.error("❌ Error:", error);
      isGeneratingRef.current = false;
      setGenerating(false);
      setShowProgressBox(false);
      localStorage.removeItem("generatingProductId");
      localStorage.removeItem("generationProgress");

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(`Failed: ${errorMessage}`);
      setCurrentStep(1);
    }
  };

  // Download PDF function
  const downloadPDF = async () => {
    if (!productId) {
      toast.error("No product found to download");
      return;
    }

    try {
      setLoading(true);
      toast.loading("📥 Preparing download...", { duration: 2000 });

      const response = await api.get(`/products/${productId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${formData.title || "product"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("✅ PDF downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // FULL SCREEN LOADER
  // ================================================================

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-xl">
        {/* ===== CONTENT ===== */}
        <div className="relative flex flex-col items-center gap-8">
          {/* ===== AI BADGE ===== */}
          <div className="bg-gradient-to-r from-[#FACC15] to-[#e5b800] text-[#111111] px-6 py-2 rounded-full text-sm font-bold tracking-wider shadow-lg flex items-center gap-3 border border-white/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#111111] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#111111]"></span>
            </span>
            AI GENERATING
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#111111] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#111111]"></span>
            </span>
          </div>

          {/* ===== LOADER ===== */}
          <div className="relative">
            <div className="absolute inset-0 border-4 border-[#FACC15]/20 rounded-full animate-ping"></div>
            <div className="w-16 h-16 border-4 border-t-[#FACC15] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // COMPLETION SCREEN
  // ================================================================

  if (currentStep === 3) {
    return (
      <div className="flex h-screen bg-[#F8F8F6]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[264px] flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] p-12 text-center max-w-md mx-auto">
              {/* ✅ Animated Success Icon in Green Circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                <div className="relative z-10 w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#111111] mb-2">
                Success!
              </h2>
              <p className="text-[#6B7280]">
                Your product has been generated successfully.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ================================================================
  // MAIN FORM
  // ================================================================

  return (
    <div className="min-h-screen bg-[#F8F8F6] font-sans text-[#11151a]">
      <Sidebar />

      <div className="ml-0 md:ml-[18rem] min-h-screen">
        <Navbar />

        <main className="p-4 md:p-6">
          <div className="">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[28px] font-bold tracking-[-.025em] text-[#111111]">
                  Create New Product
                </h1>
                <p className="mt-1 text-[15px] text-[#6B7280]">
                  {productDataFromNav 
                    ? `Editing "${productDataFromNav.title}" - Modify and generate`
                    : "Describe your idea and let AI create a complete digital product for you."}
                </p>
              </div>
              {productDataFromNav && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[#FACC15]/20 text-[#111820] text-xs font-semibold rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse"></span>
                    Auto-filled from template
                  </span>
                </div>
              )}
            </div>

            {/* Main Content - Grid Layout with Left and Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_388px] gap-[14px]">
              {/* Left Column */}
              <div className="min-w-0">
                {/* Step 1: Choose Product Type */}
                <section className="rounded-[11px] border border-[#E5E7EB] bg-white px-[9px] py-[15px] shadow-sm">
                  <div className="px-[8px]">
                    <h2 className="text-[16px] font-bold text-[#111111]">
                      1. Choose Product Type
                    </h2>
                    <p className="mt-[5px] text-[12px] text-[#6B7280]">
                      Select the type of digital product you want to create.
                    </p>
                  </div>

                  <div className="mt-[16px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[9px]">
                    {productTypes.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedType?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleProductTypeSelect(item.id)}
                          disabled={generating}
                          className={`relative flex h-[105px] flex-col items-center justify-center rounded-[9px] border text-center transition ${
                            isSelected
                              ? "border-[#FACC15] bg-[#FACC15]/5 shadow-[0_0_0_1px_rgba(250,204,21,.2)]"
                              : "border-[#E5E7EB] bg-white hover:border-[#FACC15]/50"
                          } ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isSelected && (
                            <span className="absolute right-[6px] top-[6px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#FACC15]">
                              <Check
                                size={9}
                                strokeWidth={3}
                                className="text-white"
                              />
                            </span>
                          )}
                          <Icon
                            size={28}
                            className={`mb-[8px] ${
                              isSelected ? "text-[#FACC15]" : "text-[#6B7280]"
                            }`}
                          />
                          <span
                            className={`text-[15px] font-semibold leading-none ${
                              isSelected ? "text-[#111111]" : "text-[#111111]"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="mt-[9px] whitespace-pre-line text-[11px] leading-[1.35] text-[#6B7280]">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Step 2: Describe Your Product */}
                <section className="mt-[10px] rounded-[11px] border border-[#E5E7EB] bg-white px-[21px] py-[16px] shadow-sm">
                  <h2 className="text-[16px] font-bold text-[#111111]">
                    2. Describe Your Product
                  </h2>
                  <p className="mt-[5px] text-[12px] text-[#6B7280]">
                    Provide details about your product. The more details, the
                    better the result.
                  </p>

                  <div className="mt-[17px] grid grid-cols-1 md:grid-cols-2 gap-x-[21px] gap-y-[13px]">
                    {/* Product Title */}
                    <div className="md:col-span-2">
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Product Title / Idea{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="e.g., The Ultimate Freelancing Guide"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Niche */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Niche / Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="niche"
                        value={formData.niche}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="e.g., Fitness, Marketing"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Target Audience <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="audience"
                        value={formData.audience}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="e.g., Beginners, students, entrepreneurs..."
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Main Problem */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Main Problem <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="problem"
                        value={formData.problem}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="What problem will this solve?"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Desired Outcome */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Desired Outcome <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="outcome"
                        value={formData.outcome}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="What will your customers achieve?"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Language
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        disabled={generating}
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      >
                        {languages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* Tone */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Tone
                      </label>
                      <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        disabled={generating}
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      >
                        {tones.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Author Name */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Author Name
                      </label>
                      <input
                        type="text"
                        name="authorName"
                        value={formData.authorName}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="Your name or pen name"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Brand Name */}
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleInputChange}
                        disabled={generating}
                        placeholder="Your brand name"
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>

                    {/* Approximate Length
                    <div>
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Approximate Length
                      </label>
                      <select
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        disabled={generating}
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      >
                        {lengths.map((len) => (
                          <option key={len} value={len}>
                            {len}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* Additional Notes
                    <div className="md:col-span-2">
                      <label className="mb-[6px] block text-[12px] font-medium text-[#111111]">
                        Additional Notes (Optional)
                      </label>
                      <input
                        type="text"
                        disabled={generating}
                        placeholder="Any specific instructions for the AI..."
                        className="h-[36px] w-full rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-[10px] text-[12px] text-[#111111] outline-none placeholder:text-[#6B7280] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] disabled:opacity-50"
                      />
                    </div>*/}
                  </div>

                  {/* Generate Button */}
                  <div className="mt-[9px] flex justify-end border-t border-[#E5E7EB] pt-[15px]">
                    <button
                      onClick={handleGenerateAll}
                      disabled={
                        generating ||
                        !formData.productType ||
                        !formData.title ||
                        isGeneratingRef.current
                      }
                      className="flex h-[40px] items-center rounded-[7px] bg-[#FACC15] px-[24px] text-[13px] font-semibold text-[#111111] shadow-sm hover:bg-[#e5b800] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles size={16} className="mr-[8px]" />
                      {generating || isGeneratingRef.current
                        ? "Generating..."
                        : "Generate Product"}
                    </button>
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-[13px]">
                {/* Tips Card */}
                <section className="rounded-[11px] border border-[#E5E7EB] bg-white px-[20px] py-[17px] shadow-sm">
                  <h2 className="flex items-center text-[15px] font-bold text-[#111111]">
                    <Lightbulb size={18} className="mr-[7px] text-[#FACC15]" />
                    Tips for Better Results
                  </h2>
                  <div className="mt-[17px] space-y-[11px]">
                    {[
                      "Be specific about your audience",
                      "Describe the main problem clearly",
                      "Explain the transformation or outcome",
                      "Add any special requirements",
                      "Upload reference materials if you have any",
                    ].map((tip) => (
                      <div
                        key={tip}
                        className="flex items-center text-[12px] text-[#111111]"
                      >
                        <span className="mr-[10px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#FACC15]">
                          <Check
                            size={9}
                            strokeWidth={3}
                            className="text-white"
                          />
                        </span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Examples Card */}
                <section className="rounded-[11px] border border-[#E5E7EB] bg-white px-[18px] py-[17px] shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center text-[15px] font-bold text-[#111111]">
                      <span className="mr-[8px]">📚</span>
                      Example Ideas
                    </h2>
                    <button className="text-[12px] font-medium text-[#FACC15] hover:text-[#e5b800]">
                      View all
                    </button>
                  </div>

                  <div className="mt-[17px] space-y-[14px]">
                    {examples.map((item) => (
                      <div key={item.title} className="flex">
                        <div className="relative h-[62px] w-[54px] shrink-0 overflow-hidden rounded-[5px] bg-[#161616] border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,.1)]">
                          <div className="absolute left-1/2 top-[8px] w-[48px] -translate-x-1/2 whitespace-pre-line text-center text-[6px] font-black leading-[1.05] text-white">
                            {item.cover === "fitness" &&
                              "30-DAY\nFITNESS\nCHALLENGE"}
                            {item.cover === "instagram" &&
                              "INSTAGRAM\nGROWTH\nGUIDE"}
                            {item.cover === "budget" && "BUDGET\nPLANNER"}
                          </div>
                          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 text-[16px] text-[#FACC15]">
                            {item.cover === "fitness" && "⚡"}
                            {item.cover === "instagram" && "◎"}
                            {item.cover === "budget" && "▤"}
                          </div>
                        </div>
                        <div className="ml-[12px] min-w-0 flex-1">
                          <div className="flex items-start">
                            <div className="pr-[6px] text-[13px] font-semibold text-[#111111]">
                              {item.title}
                            </div>
                            <span
                              className={`ml-auto shrink-0 rounded-[5px] px-[8px] py-[3px] text-[10px] font-medium ${
                                item.type === "Challenge"
                                  ? "bg-[#FACC15]/20 text-[#111111]"
                                  : item.type === "Guide"
                                    ? "bg-[#FACC15]/20 text-[#111111]"
                                    : "bg-[#FACC15]/20 text-[#111111]"
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="mt-[6px] text-[11px] leading-[1.4] text-[#6B7280]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-[11px] flex h-[54px] items-center rounded-[7px] bg-[#FACC15]/10 px-[12px]">
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#FACC15]">
                      <Lightbulb size={18} className="text-white" />
                    </span>
                    <div className="ml-[10px]">
                      <div className="text-[12px] font-semibold text-[#111111]">
                        Need more inspiration?
                      </div>
                      <div className="mt-[2px] text-[11px] text-[#6B7280]">
                        Browse 100+ example ideas
                      </div>
                    </div>
                    <span className="ml-auto text-[21px] text-[#FACC15]">
                      ›
                    </span>
                  </div>
                </section>

                {/* What Happens Next */}
                <section className="rounded-[11px] border border-[#E5E7EB] bg-white px-[25px] py-[17px] shadow-sm">
                  <h2 className="text-[15px] font-bold text-[#111111]">
                    What Happens Next?
                  </h2>
                  <div className="mt-[17px]">
                    {[
                      "AI will generate a structured outline for your product",
                      "You can review and edit the outline",
                      "AI will create the full content section by section",
                      "You'll get files, images, sales page and marketing kit",
                    ].map((item, index) => (
                      <div key={item} className="relative flex min-h-[38px]">
                        {index < 3 && (
                          <div className="absolute left-[8px] top-[17px] h-[28px] border-l border-dashed border-[#E5E7EB]" />
                        )}
                        <span className="relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#FACC15] text-[10px] text-white">
                          {index + 1}
                        </span>
                        <span className="ml-[14px] pt-[1px] text-[11px] leading-[1.35] text-[#6B7280]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* ✅ LIVE PROGRESS BOX - Bottom Right Corner */}
      {showProgressBox && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-5 w-80 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${generationComplete ? "bg-green-500" : "bg-[#FACC15] animate-pulse"}`}
              ></div>
              <span className="text-sm font-semibold text-[#111111]">
                {generationComplete ? "✅ Complete!" : "Generating..."}
              </span>
            </div>
            <span className="text-sm font-bold text-[#FACC15]">
              {Math.round(liveProgress.percentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#F8F8F6] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                generationComplete
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-[#FACC15] to-[#e5b800]"
              }`}
              style={{ width: `${Math.min(liveProgress.percentage, 100)}%` }}
            />
          </div>

          {/* Current Step Label */}
          <p className="text-xs text-[#6B7280] mt-2.5 text-center truncate">
            {generationComplete
              ? "✅ Product ready! Download now."
              : liveProgress.currentStepLabel || "⏳ AI is working..."}
          </p>

          {/* Steps Summary */}
          <div className="mt-3 space-y-1">
            {liveProgress.steps.slice(0, 4).map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                    step.status === "completed"
                      ? "bg-green-500 text-white"
                      : step.status === "in-progress"
                        ? "bg-[#FACC15] text-black animate-pulse"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.status === "completed"
                    ? "✓"
                    : step.status === "in-progress"
                      ? "..."
                      : ""}
                </span>
                <span
                  className={`${step.status === "completed" ? "text-gray-600" : step.status === "in-progress" ? "text-[#FACC15] font-medium" : "text-gray-400"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Cancel Button - Only show if not complete */}
          {!generationComplete && (
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to cancel generation?")
                ) {
                  setGenerating(false);
                  setCurrentStep(1);
                  setShowProgressBox(false);
                  isGeneratingRef.current = false;
                  if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                  }
                  localStorage.removeItem("generatingProductId");
                  localStorage.removeItem("generationProgress");
                  toast.info("Generation cancelled");
                }
              }}
              className="mt-3 w-full text-center text-xs text-[#6B7280] hover:text-red-600 transition"
            >
              Cancel Generation
            </button>
          )}
        </div>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateProduct;