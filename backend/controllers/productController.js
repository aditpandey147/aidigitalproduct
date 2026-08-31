// backend/controllers/productController.js
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const ProductGenerationService = require("../services/generation/generationService");
const CoverImageGenerator = require("../services/generation/coverImageGenerator");
const PdfCoverReplacer = require("../services/generation/pdfCoverReplacer");

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
// START GENERATION
// ================================================================

exports.startGeneration = async (req, res) => {
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

// backend/controllers/productController.js

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

    // ✅ FIX: Use the progress from the database
    let progress = product.progress || 0;
    let status = product.status || "generating";

    // If status is completed, set progress to 100
    if (status === "completed") {
      progress = 100;
    }

    // Step labels
    const stepLabels = [
      "Understanding your idea",
      "Creating outline",
      "Writing content",
      "Generating cover image",
      "Creating files",
      "Building sales page",
      "Marketing kit",
    ];

    // Determine current step based on progress
    let currentStepIndex = 0;
    if (progress >= 100) currentStepIndex = 6;
    else if (progress >= 85) currentStepIndex = 5;
    else if (progress >= 70) currentStepIndex = 4;
    else if (progress >= 50) currentStepIndex = 3;
    else if (progress >= 30) currentStepIndex = 2;
    else if (progress >= 15) currentStepIndex = 1;
    else currentStepIndex = 0;

    // Build steps with correct status
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

    res.json({
      success: true,
      data: {
        status,
        progress: Math.min(progress, 100), // Ensure progress doesn't exceed 100
        currentStep: currentStepIndex,
        currentStepLabel: stepLabels[currentStepIndex] || "Processing...",
        steps,
        error: product.error || null,
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
    


    // Validate product ID
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Check ownership
    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this product",
      });
    }

    // Get project root path
    const projectRoot = path.join(__dirname, '..');

    // ================================================================
    // ✅ DELETE ALL FILES FROM FOLDERS
    // ================================================================

    // 1. Delete PDF file
    if (product.pdfPath) {
      const fullPath = path.join(projectRoot, product.pdfPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
      }
    }

    // 2. Delete cover image
    if (product.coverImage) {
      const fullPath = path.join(projectRoot, product.coverImage);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
      }
    }

    // 3. Delete temp cover image if exists
    if (product.tempCoverImage) {
      const fullPath = path.join(projectRoot, product.tempCoverImage);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // 4. Delete mockups if they exist
    if (product.mockups && Array.isArray(product.mockups)) {
      for (const mockup of product.mockups) {
        if (mockup.path) {
          const fullPath = path.join(projectRoot, mockup.path);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    // 5. Delete posters if they exist
    if (product.posters && Array.isArray(product.posters)) {
      for (const poster of product.posters) {
        if (poster.path) {
          const fullPath = path.join(projectRoot, poster.path);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    // ================================================================
    // ✅ DELETE FROM DATABASE - USING findByIdAndDelete
    // ================================================================

    // ✅ Method 1: Using findByIdAndDelete (recommended)
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete product from database",
      });
    }

    res.json({
      success: true,
      message: "Product and all associated files deleted successfully",
      data: {
        id: productId,
        title: product.title,
        deleted: true,
      },
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
// REGENERATE PRODUCT
// ================================================================

exports.regenerateProduct = async (req, res) => {
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
// ✅ GENERATE COVER IMAGE
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

    // Store temporary image URL
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

// backend/controllers/productController.js

// ================================================================
// MERGE COVER WITH PDF - Updated
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


    // ✅ Replace cover with proper error handling
    const replacer = new PdfCoverReplacer(productId, product.toObject());
    const newPdfPath = await replacer.replaceCover(product.pdfPath, coverUrl);

    // ✅ Verify the new PDF exists and has content
    if (!fs.existsSync(newPdfPath)) {
      throw new Error("New PDF file was not created");
    }

    const stats = fs.statSync(newPdfPath);
    if (stats.size === 0) {
      throw new Error("New PDF file is empty");
    }

    // ✅ Update product with new PDF path
    await Product.findByIdAndUpdate(productId, {
      pdfPath: newPdfPath,
      coverImage: coverUrl,
      tempCoverImage: null,
      updatedAt: new Date(),
    });

    // ✅ Delete old PDF
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
