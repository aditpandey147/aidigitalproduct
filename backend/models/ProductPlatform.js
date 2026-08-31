// backend/models/ProductPlatform.js
const mongoose = require("mongoose");

const ProductPlatformSchema = new mongoose.Schema({
  // Reference to the product
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  
  // Basic product info
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  niche: {
    type: String,
    default: "",
  },
  
  // Product Type
  productType: {
    type: String,
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
    default: "guide",
  },
  
  // Cover image
  coverUrl: {
    type: String,
    default: "",
  },
  
  // Pricing
  price: {
    type: Number,
    default: 0,
  },
  
  // ✅ PLATFORM - Only these values are valid
  platform: {
    type: String,
    enum: ["gumroad", "payhip", "etsy", "shopify", "selz", "ko-fi", "paddle", "amazon", "apple", "google", "books"],
    default: "books",
  },
  
  // Ratings
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  
  // Sales
  salesCount: {
    type: Number,
    default: 0,
  },
  
  // Platform-specific ID
  platformId: {
    type: String,
    default: "",
  },
  platformUrl: {
    type: String,
    default: "",
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
ProductPlatformSchema.index({ platform: 1, salesCount: -1 });
ProductPlatformSchema.index({ platform: 1, rating: -1 });
ProductPlatformSchema.index({ productId: 1, platform: 1 }, { unique: true });
ProductPlatformSchema.index({ productType: 1 });

module.exports = mongoose.model("ProductPlatform", ProductPlatformSchema);