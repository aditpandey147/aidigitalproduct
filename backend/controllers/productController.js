// backend/controllers/productController.js
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const ProductGenerationService = require("../services/generation/generationService");
const CoverImageGenerator = require("../services/generation/coverImageGenerator");
const PdfCoverReplacer = require("../services/generation/pdfCoverReplacer");

// ================================================================
// ✅ COOLDOWN CONFIGURATION
// ================================================================

const GENERATION_COOLDOWN_MINUTES = 10;
const GENERATION_COOLDOWN_MS = GENERATION_COOLDOWN_MINUTES * 60 * 1000;

// ================================================================
// ✅ HELPER: Check if user can generate (using updatedAt)
// ================================================================

const checkGenerationCooldown = async (userId) => {
  try {
    // Find the most recently updated product for this user
    const lastProduct = await Product.findOne({
      userId: userId,
      status: { $in: ["completed", "generating"] }
    }).sort({ updatedAt: -1 });

    if (!lastProduct || !lastProduct.updatedAt) {
      return { canGenerate: true, remainingMinutes: 0 };
    }

    const now = Date.now();
    const lastUpdated = new Date(lastProduct.updatedAt).getTime();
    const elapsed = now - lastUpdated;
    const remaining = GENERATION_COOLDOWN_MS - elapsed;

    if (remaining > 0) {
      const remainingMinutes = Math.ceil(remaining / 60000);
      return {
        canGenerate: false,
        remainingMinutes,
        remainingMs: remaining,
        lastGeneratedAt: lastProduct.updatedAt,
      };
    }

    return { canGenerate: true, remainingMinutes: 0 };
  } catch (error) {
    console.error("❌ Cooldown check error:", error);
    return { canGenerate: true, remainingMinutes: 0 };
  }
};

// ================================================================
// ✅ CHECK COOLDOWN STATUS
// ================================================================

exports.checkCooldown = async (req, res) => {
  try {
    const cooldownStatus = await checkGenerationCooldown(req.user.id);

    res.json({
      success: true,
      data: {
        canGenerate: cooldownStatus.canGenerate,
        remainingMinutes: cooldownStatus.remainingMinutes,
        cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        lastGeneratedAt: cooldownStatus.lastGeneratedAt || null,
      },
    });
  } catch (error) {
    console.error("❌ Cooldown check failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// ✅ START GENERATION (With Cooldown)
// ================================================================

exports.startGeneration = async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Check cooldown first
    const cooldownStatus = await checkGenerationCooldown(req.user.id);

    if (!cooldownStatus.canGenerate) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldownStatus.remainingMinutes} more minute${cooldownStatus.remainingMinutes > 1 ? 's' : ''} before generating another product.`,
        data: {
          cooldownRemaining: cooldownStatus.remainingMs,
          remainingMinutes: cooldownStatus.remainingMinutes,
          cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to generate this product",
      });
    }

    if (product.status === "generating") {
      return res.status(400).json({
        success: false,
        message: "Product is already being generated",
      });
    }

    if (product.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Product is already completed",
      });
    }

    product.status = "generating";
    product.progress = 0;
    // ✅ updatedAt will be automatically updated by mongoose timestamps
    await product.save();

    const generationService = new ProductGenerationService(
      productId,
      product.toObject(),
    );

    generationService.generate().catch(async (error) => {
      console.error("❌ Generation failed:", error);
      await Product.findByIdAndUpdate(productId, {
        status: "failed",
        error: error.message,
      });
    });

    res.json({
      success: true,
      message: "Generation started successfully",
      data: {
        productId,
        status: "generating",
        cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        canGenerateAfter: new Date(Date.now() + GENERATION_COOLDOWN_MS),
      },
    });
  } catch (error) {
    console.error("❌ Generate failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// ✅ REGENERATE PRODUCT (With Cooldown)
// ================================================================

exports.regenerateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Check cooldown first
    const cooldownStatus = await checkGenerationCooldown(req.user.id);

    if (!cooldownStatus.canGenerate) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldownStatus.remainingMinutes} more minute${cooldownStatus.remainingMinutes > 1 ? 's' : ''} before regenerating.`,
        data: {
          cooldownRemaining: cooldownStatus.remainingMs,
          remainingMinutes: cooldownStatus.remainingMinutes,
          cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to regenerate this product",
      });
    }

    if (product.pdfPath && fs.existsSync(product.pdfPath)) {
      fs.unlinkSync(product.pdfPath);
    }

    product.status = "draft";
    product.progress = 0;
    product.outline = null;
    product.content = null;
    product.pdfPath = null;
    product.error = null;
    // ✅ updatedAt will be automatically updated
    await product.save();

    const generationService = new ProductGenerationService(
      productId,
      product.toObject(),
    );

    generationService.generate().catch(async (error) => {
      console.error("❌ Regeneration failed:", error);
      await Product.findByIdAndUpdate(productId, {
        status: "failed",
        error: error.message,
      });
    });

    res.json({
      success: true,
      message: "Regeneration started",
      data: {
        productId,
        status: "generating",
        cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        canGenerateAfter: new Date(Date.now() + GENERATION_COOLDOWN_MS),
      },
    });
  } catch (error) {
    console.error("❌ Regenerate failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// GET PROGRESS (With Cooldown Info)
// ================================================================

exports.getProgress = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this product",
      });
    }

    let progress = product.progress || 0;
    let status = product.status || "generating";

    if (status === "completed") {
      progress = 100;
    }

    const stepLabels = [
      "Understanding your idea",
      "Creating outline",
      "Writing content",
      "Generating cover image",
      "Creating files",
      "Building sales page",
      "Marketing kit",
    ];

    let currentStepIndex = 0;
    if (progress >= 100) currentStepIndex = 6;
    else if (progress >= 85) currentStepIndex = 5;
    else if (progress >= 70) currentStepIndex = 4;
    else if (progress >= 50) currentStepIndex = 3;
    else if (progress >= 30) currentStepIndex = 2;
    else if (progress >= 15) currentStepIndex = 1;
    else currentStepIndex = 0;

    const steps = stepLabels.map((label, index) => ({
      id: index + 1,
      label,
      status:
        status === "completed"
          ? "completed"
          : index < currentStepIndex
            ? "completed"
            : index === currentStepIndex && status === "generating"
              ? "in-progress"
              : "pending",
    }));

    // ✅ Include cooldown info
    const cooldownStatus = await checkGenerationCooldown(req.user.id);

    res.json({
      success: true,
      data: {
        status,
        progress: Math.min(progress, 100),
        currentStep: currentStepIndex,
        currentStepLabel: stepLabels[currentStepIndex] || "Processing...",
        steps,
        error: product.error || null,
        // ✅ Cooldown info
        canGenerate: cooldownStatus.canGenerate,
        cooldownRemainingMinutes: cooldownStatus.remainingMinutes,
        cooldownMinutes: GENERATION_COOLDOWN_MINUTES,
        lastGeneratedAt: product.updatedAt || null,
      },
    });
  } catch (error) {
    console.error("❌ Progress check failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// CREATE PRODUCT
// ================================================================

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    const required = [
      "productType",
      "title",
      "niche",
      "audience",
      "problem",
      "outcome",
    ];
    const missing = required.filter((field) => !productData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const product = new Product({
      ...productData,
      userId: req.user.id,
      status: "draft",
      progress: 0,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Product creation failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// GET PRODUCT BY ID
// ================================================================

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this product",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Get product failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// GET USER'S PRODUCTS
// ================================================================

exports.getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("title productType status progress createdAt coverImage pdfPath updatedAt");

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("❌ Get products failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// DELETE PRODUCT
// ================================================================

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this product",
      });
    }

    const projectRoot = path.join(__dirname, '..');

    if (product.pdfPath) {
      const fullPath = path.join(projectRoot, product.pdfPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    if (product.coverImage) {
      const fullPath = path.join(projectRoot, product.coverImage);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    if (product.tempCoverImage) {
      const fullPath = path.join(projectRoot, product.tempCoverImage);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    if (product.mockups && Array.isArray(product.mockups)) {
      for (const mockup of product.mockups) {
        if (mockup.path) {
          const fullPath = path.join(projectRoot, mockup.path);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      }
    }

    if (product.posters && Array.isArray(product.posters)) {
      for (const poster of product.posters) {
        if (poster.path) {
          const fullPath = path.join(projectRoot, poster.path);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      }
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: "Product and all associated files deleted successfully",
      data: { id: productId, title: product.title, deleted: true },
    });

  } catch (error) {
    console.error("❌ Delete failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// DOWNLOAD PDF
// ================================================================

exports.downloadPDF = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!product.pdfPath || !fs.existsSync(product.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: "PDF not found. Please generate the product first.",
      });
    }

    const pdfBuffer = fs.readFileSync(product.pdfPath);
    const fileName = `${product.title || "product"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");

    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Download failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// GET MARKETING CONTENT
// ================================================================

exports.getMarketingContent = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const marketingData = product.marketing || {
      emails: [],
      social: [],
      ads: [],
      seo: {},
    };

    res.json({
      success: true,
      data: marketingData,
    });
  } catch (error) {
    console.error("❌ Get marketing content failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// GENERATE COVER IMAGE
// ================================================================

exports.generateCoverImage = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const coverGenerator = new CoverImageGenerator(product.toObject());
    const imageUrl = await coverGenerator.generateCoverImage();

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate cover image",
      });
    }

    await Product.findByIdAndUpdate(productId, {
      tempCoverImage: imageUrl,
    });

    res.json({
      success: true,
      data: {
        imageUrl,
        message: "Cover image generated successfully",
      },
    });
  } catch (error) {
    console.error("❌ Generate cover failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================================================
// MERGE COVER WITH PDF
// ================================================================

exports.mergeCoverWithPdf = async (req, res) => {
  try {
    const productId = req.params.id;
    const { imageUrl } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!product.pdfPath || !fs.existsSync(product.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: "PDF not found. Please generate the product first.",
      });
    }

    const coverUrl = imageUrl || product.tempCoverImage;

    if (!coverUrl) {
      return res.status(400).json({
        success: false,
        message: "No cover image provided. Please generate a cover first.",
      });
    }

    const replacer = new PdfCoverReplacer(productId, product.toObject());
    const newPdfPath = await replacer.replaceCover(product.pdfPath, coverUrl);

    if (!fs.existsSync(newPdfPath)) {
      throw new Error("New PDF file was not created");
    }

    const stats = fs.statSync(newPdfPath);
    if (stats.size === 0) {
      throw new Error("New PDF file is empty");
    }

    await Product.findByIdAndUpdate(productId, {
      pdfPath: newPdfPath,
      coverImage: coverUrl,
      tempCoverImage: null,
      updatedAt: new Date(),
    });

    try {
      if (fs.existsSync(product.pdfPath) && product.pdfPath !== newPdfPath) {
        fs.unlinkSync(product.pdfPath);
      }
    } catch (deleteError) {
      console.warn("  ⚠️ Could not delete old PDF:", deleteError.message);
    }

    res.json({
      success: true,
      data: {
        pdfPath: newPdfPath,
        coverImage: coverUrl,
        message: "Cover page merged successfully",
      },
    });
  } catch (error) {
    console.error("❌ Merge failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
