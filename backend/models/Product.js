// backend/models/Product.js
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const ProductSchema = new mongoose.Schema({
  // Basic Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productType: {
    type: String,
    required: true,
    enum: [
      "guide",
      "workbook",
      "planner",
      "checklists",
      "spreadsheets",
      "templates",
      "prompt-packs",
      "mini-courses",
      "challenges",
      "ebook",
      "worksheets",
    ],
  },
  title: {
    type: String,
    required: true,
  },
  niche: String,
  audience: String,
  problem: String,
  outcome: String,
  language: String,
  tone: String,
  authorName: String,
  brandName: String,
  length: String,
  coverImage: String,
  tempCoverImage: String,

  // Files
  pdfPath: String,
  excelPath: String,

  // ✅ FIX: Mockups as array of objects (NOT strings)
  mockups: [{
    path: { type: String, default: '' },
    type: { type: String, default: '' },
    prompt: { type: String, default: '' }
  }],
  
  // ✅ FIX: Posters as array of objects (NOT strings)
  posters: [{
    path: { type: String, default: '' },
    type: { type: String, default: '' },
    prompt: { type: String, default: '' }
  }],

  // Marketing Kit
  marketing: {
    emails: [
      {
        type: {
          type: String,
          enum: ["launch", "promotion", "followup"],
        },
        subject: String,
        body: String,
      },
    ],
    social: [
      {
        platform: {
          type: String,
          enum: ["instagram", "facebook", "x", "pinterest"],
        },
        content: String,
        hashtags: [String],
      },
    ],
    ads: [
      {
        type: {
          type: String,
          enum: ["headline", "problem-solution", "social-proof"],
        },
        headline: String,
        body: String,
        cta: String,
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      blogIdeas: [String],
    },
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "generating", "completed", "failed"],
    default: "draft",
  },
  progress: {
    type: Number,
    default: 0,
  },
  error: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ ONLY ADDED THIS: Cascade delete - Delete files when product is deleted
ProductSchema.pre("remove", async function (next) {
  try {
    const product = this;
    const projectRoot = path.resolve(__dirname, "../..");
    
    const filesToDelete = [];
    
    if (product.pdfPath) filesToDelete.push(product.pdfPath);
    if (product.excelPath) filesToDelete.push(product.excelPath);
    if (product.coverImage) filesToDelete.push(product.coverImage);
    if (product.tempCoverImage) filesToDelete.push(product.tempCoverImage);
    
    if (product.mockups && Array.isArray(product.mockups)) {
      for (const mockup of product.mockups) {
        if (mockup.path) filesToDelete.push(mockup.path);
      }
    }
    
    if (product.posters && Array.isArray(product.posters)) {
      for (const poster of product.posters) {
        if (poster.path) filesToDelete.push(poster.path);
      }
    }
    
    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(projectRoot, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`  🗑️ Deleted: ${filePath}`);
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ ALSO ADDED: Handle deleteOne
ProductSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
  try {
    const filter = this.getFilter();
    const productId = filter._id;
    
    if (productId) {
      const ProductModel = mongoose.model("Product");
      const product = await ProductModel.findById(productId);
      if (product) {
        await product.deleteOne();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", ProductSchema);