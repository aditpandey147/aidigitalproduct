// backend/seeds/seedNewProducts.js
const mongoose = require("mongoose");
const ProductPlatform = require("../models/ProductPlatform");
const Product = require("../models/Product");
const User = require("../models/User");
require("dotenv").config();

// ================================================================
// YOUR 10 PRODUCTS TO SEED
// ================================================================

const newProducts = [
  {
    title: "Ultimate Daily Planner",
    description: "Plan your day, manage your time and get more done.",
    productType: "planner",
    niche: "Productivity & Organization",
    price: 12.0,
    rating: 4.8,
    reviews: 642,
    sales: "15.2K",
    image: "/images/products/ultimate_daily_planner.jpg",
    platform: "shopify",
  },

  {
    title: "Weekly Productivity Planner",
    description: "Organize your week, priorities, goals and to-do lists.",
    productType: "planner",
    niche: "Productivity & Time Management",
    price: 14.0,
    rating: 4.8,
    reviews: 518,
    sales: "12.8K",
    image: "/images/products/weekly_productivity_planner.jpg",
    platform: "shopify",
  },

  {
    title: "Student Study Planner",
    description:
      "Plan your study schedule, assignments, exams and academic goals.",
    productType: "planner",
    niche: "Education & Student Productivity",
    price: 13.0,
    rating: 4.9,
    reviews: 734,
    sales: "17.4K",
    image: "/images/products/student_study_planner.jpg",
    platform: "shopify",
  },

  {
    title: "30-Day Habit Tracker",
    description:
      "Build better habits, stay consistent and track your progress.",
    productType: "planner",
    niche: "Personal Development & Wellness",
    price: 9.99,
    rating: 4.8,
    reviews: 621,
    sales: "14.9K",
    image: "/images/products/30_day_habit_tracker.jpg",
    platform: "shopify",
  },

  {
    title: "Budget & Expense Tracker",
    description:
      "Track your money, control your spending and reach your savings goals.",
    productType: "spreadsheets",
    niche: "Personal Finance & Budgeting",
    price: 15.0,
    rating: 4.9,
    reviews: 489,
    sales: "11.7K",
    image: "/images/products/budget_expense_tracker.jpg",
    platform: "shopify",
  },

  {
    title: "Grocery & Meal Planner",
    description: "Plan weekly meals, organize grocery lists and save time.",
    productType: "planner",
    niche: "Meal Planning & Healthy Lifestyle",
    price: 11.0,
    rating: 4.7,
    reviews: 397,
    sales: "9.4K",
    image: "/images/products/grocery_meal_planner.jpg",
    platform: "shopify",
  },

  {
    title: "Work-Life Balance Planner",
    description:
      "Organize work, family, wellness and personal time without the stress.",
    productType: "planner",
    niche: "Lifestyle & Wellness",
    price: 16.0,
    rating: 4.8,
    reviews: 342,
    sales: "8.1K",
    image: "/images/products/work_life_balance_planner.jpg",
    platform: "shopify",
  },

  {
    title: "Small Business Content Planner",
    description: "Plan 90 days of social media content for your business.",
    productType: "planner",
    niche: "Small Business & Social Media Marketing",
    price: 19.0,
    rating: 4.9,
    reviews: 426,
    sales: "10.6K",
    image: "/images/products/small_business_content_planner.jpg",
    platform: "gumroad",
  },

  {
    title: "Resume & Interview Kit",
    description:
      "Professional resume templates, cover letters and interview preparation.",
    productType: "templates",
    niche: "Career & Job Search",
    price: 18.0,
    rating: 4.9,
    reviews: 583,
    sales: "13.2K",
    image: "/images/products/resume_interview_kit.jpg",
    platform: "shopify",
  },

  {
    title: "Canva Business Template Kit",
    description:
      "50+ editable templates for small businesses, brands and entrepreneurs.",
    productType: "templates",
    niche: "Business & Branding",
    price: 24.0,
    rating: 4.9,
    reviews: 697,
    sales: "16.8K",
    image: "/images/products/canva_business_template_kit.jpg",
    platform: "shopify",
  },
];

// ================================================================
// SEED FUNCTION
// ================================================================

async function seedNewProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get first user
    let user = await User.findOne();
    if (!user) {
      console.log("⚠️ No user found. Creating default user...");
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      user = new User({
        name: "Admin",
        email: "admin@aiproduct.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      await user.save();
      console.log("✅ Created default user");
    }

    let productCount = 0;
    let platformCount = 0;

    for (const productData of newProducts) {
      // Check if product already exists
      let product = await Product.findOne({ title: productData.title });

      if (!product) {
        // Create new product
        product = new Product({
          userId: user._id,
          title: productData.title,
          productType: productData.productType,
          niche: productData.niche || "General",
          audience: "General",
          problem: `Learn about ${productData.niche || "digital products"}`,
          outcome: `Master ${productData.niche || "digital products"}`,
          status: "completed",
          progress: 100,
          coverImage: productData.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await product.save();
        productCount++;
        console.log(`  ✅ Created product: ${productData.title}`);
      } else {
        console.log(`  ⏭️ Product already exists: ${productData.title}`);
      }

      // Check if platform entry already exists
      const existingPlatform = await ProductPlatform.findOne({
        productId: product._id,
        platform: productData.platform,
      });

      if (!existingPlatform) {
        // Create platform entry
        const platformData = new ProductPlatform({
          productId: product._id,
          title: productData.title,
          description:
            productData.description || `${productData.title} - Digital Product`,
          niche: productData.niche || "General",
          productType: productData.productType,
          coverUrl: productData.image,
          price: productData.price || 0,
          platform: productData.platform,
          rating: productData.rating || 4.5,
          reviewCount: productData.reviews || 0,
          salesCount:
            parseFloat(productData.sales?.replace("K", "")) * 1000 || 0,
          isPublished: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await platformData.save();
        platformCount++;
        console.log(
          `  ✅ Added to ${productData.platform}: ${productData.title} ($${productData.price})`,
        );
      } else {
        console.log(
          `  ⏭️ Platform entry already exists: ${productData.title} on ${productData.platform}`,
        );
      }
    }

    console.log("\n🎉 Seed Complete!");
    console.log(`📦 Created ${productCount} new products`);
    console.log(`📚 Created ${platformCount} new platform entries`);
    console.log("\n📊 Product Summary:");

    // Group by platform
    const platformGroups = {};
    for (const p of newProducts) {
      if (!platformGroups[p.platform]) platformGroups[p.platform] = 0;
      platformGroups[p.platform]++;
    }

    for (const [platform, count] of Object.entries(platformGroups)) {
      console.log(`   - ${platform}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedNewProducts();
