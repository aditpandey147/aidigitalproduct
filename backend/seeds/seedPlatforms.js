// backend/seeds/seedPlatforms.js
const mongoose = require('mongoose');
const ProductPlatform = require('../models/ProductPlatform');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// ================================================================
// SEED DATA WITH 10 PRODUCTS
// ================================================================

const trendingData = {
  // ============================================================
  // BOOKS PLATFORM
  // ============================================================
  books: [
    {
      title: "The AI Revolution",
      description: "How artificial intelligence is transforming our world and what it means for your future.",
      productType: "ebook",
      niche: "Technology & AI",
      price: 24.99,
      rating: 4.9,
      reviews: 1234,
      sales: "45.2K",
      image: "/images/products/the_ai_revolution.jpg",
    },
    {
      title: "Mindful Living",
      description: "A practical guide to finding peace and purpose in a chaotic world.",
      productType: "ebook",
      niche: "Self-Help & Mindfulness",
      price: 19.99,
      rating: 4.8,
      reviews: 987,
      sales: "38.7K",
      image: "/images/products/mindful_living.jpg",
    },
    {
      title: "Financial Freedom",
      description: "The proven path to financial independence and early retirement.",
      productType: "ebook",
      niche: "Finance & Investing",
      price: 27.99,
      rating: 4.7,
      reviews: 876,
      sales: "32.1K",
      image: "/images/products/financial_freedom.jpg",
    },
    {
      title: "Healthy Habits",
      description: "Transform your health with small, sustainable daily habits.",
      productType: "ebook",
      niche: "Health & Wellness",
      price: 21.99,
      rating: 4.6,
      reviews: 654,
      sales: "28.5K",
      image: "/images/products/healthy_habits.jpg",
    },
    {
      title: "Digital Marketing 2024",
      description: "The latest strategies for social media, SEO, and online advertising.",
      productType: "ebook",
      niche: "Marketing & Business",
      price: 29.99,
      rating: 4.5,
      reviews: 543,
      sales: "24.3K",
      image: "/images/products/digital_marketing_2024.jpg",
    },
    {
      title: "Leadership Principles",
      description: "Timeless leadership lessons from the world's most successful leaders.",
      productType: "ebook",
      niche: "Leadership & Management",
      price: 31.99,
      rating: 4.8,
      reviews: 432,
      sales: "21.8K",
      image: "/images/products/leadership_principles.jpg",
    },
    {
      title: "Declutter Your Digital Life",
      description: "Organize digital clutter easily and boost your productivity.",
      productType: "guide",
      niche: "Self-Help & Productivity",
      price: 10.00,
      rating: 4.5,
      reviews: 92,
      sales: "19.2K",
      image: "/images/products/declutter_your_digital_life.jpg",
    },
  ],

  // ============================================================
  // GUMROAD PLATFORM
  // ============================================================
  gumroad: [
    {
      title: "30-Day Fitness Challenge",
      description: "Transform your body in 30 days with this comprehensive fitness program.",
      productType: "challenges",
      niche: "Health & Fitness",
      price: 47.00,
      rating: 4.8,
      reviews: 342,
      sales: "12.4K",
      image: "/images/products/30_day_fitness_challenge.jpg",
    },
    {
      title: "Side Hustle Startup Guide",
      description: "Launch a profitable side business with minimal investment.",
      productType: "guide",
      niche: "Business & Entrepreneurship",
      price: 39.00,
      rating: 4.7,
      reviews: 256,
      sales: "9.8K",
      image: "/images/products/side_hustle_startup_guide.jpg",
    },
    {
      title: "AI Prompts Mega Pack",
      description: "500+ proven AI prompts for ChatGPT, Midjourney, and more.",
      productType: "prompt-packs",
      niche: "AI & Technology",
      price: 29.00,
      rating: 4.9,
      reviews: 421,
      sales: "8.7K",
      image: "/images/products/ai_prompts_mega_pack.jpg",
    },
  ],
};

// ================================================================
// SEED FUNCTION
// ================================================================

async function seedPlatforms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await ProductPlatform.deleteMany({});
    console.log('🗑️ Cleared existing platform data');

    let user = await User.findOne();
    if (!user) {
      console.log('⚠️ No user found. Creating default user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      user = new User({
        name: 'Admin',
        email: 'admin@aiproduct.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      await user.save();
      console.log('✅ Created default user');
    }

    let productCount = 0;
    let platformCount = 0;

    for (const [platformKey, products] of Object.entries(trendingData)) {
      console.log(`\n📚 Seeding ${platformKey} platform...`);

      for (const productData of products) {
        // Check if product already exists
        let product = await Product.findOne({ title: productData.title });

        if (!product) {
          product = new Product({
            userId: user._id,
            title: productData.title,
            productType: productData.productType,
            niche: productData.niche || "General",
            audience: "General",
            problem: `Learn about ${productData.niche || 'digital products'}`,
            outcome: `Master ${productData.niche || 'digital products'}`,
            status: "completed",
            progress: 100,
            coverImage: productData.image,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await product.save();
          productCount++;
          console.log(`  ✅ Created product: ${productData.title} (${productData.productType})`);
        } else {
          console.log(`  ⏭️ Product already exists: ${productData.title}`);
        }

        // Create platform entry
        const platformData = new ProductPlatform({
          productId: product._id,
          title: productData.title,
          description: productData.description || `${productData.title} - Digital Product`,
          niche: productData.niche || "General",
          productType: productData.productType,
          coverUrl: productData.image,
          price: productData.price || 0,
          platform: platformKey,
          rating: productData.rating || 4.5,
          reviewCount: productData.reviews || 0,
          salesCount: parseFloat(productData.sales?.replace('K', '')) * 1000 || 0,
          isPublished: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await platformData.save();
        platformCount++;
        console.log(`  ✅ Added to ${platformKey}: ${productData.title} ($${productData.price})`);
      }
    }

    console.log('\n🎉 Seed Complete!');
    console.log(`📦 Created ${productCount} new products`);
    console.log(`📚 Created ${platformCount} platform entries`);
    console.log('\n📊 Platform Summary:');
    console.log(`   - books: ${trendingData.books?.length || 0} products`);
    console.log(`   - gumroad: ${trendingData.gumroad?.length || 0} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedPlatforms();