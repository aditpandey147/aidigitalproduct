// scripts/seedProfitAgents.js
const mongoose = require('mongoose');
const AIAgent = require('../models/AIAgent');
require('dotenv').config();

const profitAgents = [
  {
    name: 'Digital Marketing Pro',
    slug: 'digital-marketing-pro',
    role: 'Digital Marketing Strategist',
    thinking_pattern: 'Strategic analysis of digital marketing channels focusing on ROI, audience targeting, and conversion optimization.',
    description: 'Expert in digital marketing strategies. Grow your business with proven marketing techniques.',
    agentType: 'profit',
    type: 'digital_marketing',
    icon: 'fa-bullhorn',
    color: '#3b82f6',
    category: 'marketing',
    featured: true,
    welcomeMessage: "Hello! I'm your Digital Marketing Strategist. Let's grow your business with powerful marketing strategies. What's your business type?"
  },
  {
    name: 'Ecommerce Expert',
    slug: 'ecommerce-expert',
    role: 'E-commerce Specialist',
    thinking_pattern: 'Data-driven optimization of e-commerce stores focusing on conversion rate, product listings, and customer experience.',
    description: 'Optimize your online store for maximum sales. Increase conversions and revenue.',
    agentType: 'profit',
    type: 'ecommerce',
    icon: 'fa-shopping-cart',
    color: '#f59e0b',
    category: 'ecommerce',
    featured: true,
    welcomeMessage: "Let's boost your e-commerce sales! Share your store URL and I'll help you optimize for more conversions."
  },
  {
    name: 'Content Creator',
    slug: 'content-creator',
    role: 'Content Marketing Expert',
    thinking_pattern: 'Creative content strategy focusing on audience engagement, brand storytelling, and content distribution.',
    description: 'Create compelling content that drives traffic and converts visitors into customers.',
    agentType: 'profit',
    type: 'content_creation',
    icon: 'fa-pen-fancy',
    color: '#ec4899',
    category: 'content',
    featured: true,
    welcomeMessage: "Ready to create amazing content! I'll help you develop a content strategy that attracts and converts your target audience."
  },
  {
    name: 'Email Marketing Pro',
    slug: 'email-marketing-pro',
    role: 'Email Marketing Specialist',
    thinking_pattern: 'Strategic email marketing focusing on segmentation, automation, and conversion optimization.',
    description: 'Build powerful email campaigns that generate sales and build customer relationships.',
    agentType: 'profit',
    type: 'email_marketing',
    icon: 'fa-envelope',
    color: '#8b5cf6',
    category: 'marketing',
    featured: false,
    welcomeMessage: "Let's build your email marketing strategy! I'll help you create campaigns that convert subscribers into customers."
  },
  {
    name: 'Ads Expert',
    slug: 'ads-expert',
    role: 'Paid Advertising Specialist',
    thinking_pattern: 'Data-driven advertising optimization focusing on ROI, audience targeting, and creative testing.',
    description: 'Maximize your ad spend with targeted campaigns. Get more leads and sales from your ads.',
    agentType: 'profit',
    type: 'advertising',
    icon: 'fa-ad',
    color: '#ef4444',
    category: 'growth',
    featured: false,
    welcomeMessage: "Ready to scale with paid ads! I'll help you create and optimize campaigns that deliver real ROI."
  },
  {
    name: 'Affiliate Marketer',
    slug: 'affiliate-marketer',
    role: 'Affiliate Marketing Expert',
    thinking_pattern: 'Strategic affiliate marketing focusing on partnerships, promotion channels, and commission optimization.',
    description: 'Build a profitable affiliate marketing business. Find the best products and promote them effectively.',
    agentType: 'profit',
    type: 'affiliate_marketing',
    icon: 'fa-link',
    color: '#06b6d4',
    category: 'sales',
    featured: false,
    welcomeMessage: "Let's build your affiliate marketing empire! I'll help you find profitable products and promotion strategies."
  },
  {
    name: 'Sales Pro',
    slug: 'sales-pro',
    role: 'Sales Strategy Expert',
    thinking_pattern: 'Strategic sales optimization focusing on pipeline management, closing techniques, and revenue growth.',
    description: 'Close more deals and grow your revenue with proven sales strategies and techniques.',
    agentType: 'profit',
    type: 'sales',
    icon: 'fa-handshake',
    color: '#10b981',
    category: 'sales',
    featured: false,
    welcomeMessage: "Ready to boost your sales! I'll help you develop strategies to close more deals and grow your revenue."
  },
  {
    name: 'Lead Generation Pro',
    slug: 'lead-generation-pro',
    role: 'Lead Generation Specialist',
    thinking_pattern: 'Strategic lead generation focusing on channels, conversion optimization, and qualification.',
    description: 'Generate high-quality leads for your business. Build a pipeline of potential customers.',
    agentType: 'profit',
    type: 'lead_generation',
    icon: 'fa-users',
    color: '#f97316',
    category: 'growth',
    featured: false,
    welcomeMessage: "Let's generate more leads! I'll help you build systems to attract and capture quality leads for your business."
  }
];

async function seedProfitAgents() {
  console.log('🌱 Seeding AI Profit Agents...\n');
  console.log('=' .repeat(60));

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing profit agents
    const existing = await AIAgent.find({ agentType: 'profit' });
    if (existing.length > 0) {
      console.log(`📋 ${existing.length} existing profit agents found. Clearing...`);
      await AIAgent.deleteMany({ agentType: 'profit' });
      console.log('✅ Cleared\n');
    }

    // Insert profit agents
    console.log('📥 Inserting profit agents...');
    const result = await AIAgent.insertMany(profitAgents);
    
    console.log('\n✅ Seeded successfully!');
    console.log('=' .repeat(60));
    console.log('📊 AI Profit Agents:');
    console.log('=' .repeat(60));
    
    result.forEach(agent => {
      console.log(`   ${agent.name}`);
      console.log(`      Slug: ${agent.slug}`);
      console.log(`      Role: ${agent.role}`);
      console.log(`      Type: ${agent.type}`);
      console.log(`      Category: ${agent.category}`);
      console.log(`      Featured: ${agent.featured ? '⭐ Yes' : 'No'}`);
      console.log('');
    });

    console.log('=' .repeat(60));
    console.log(`✅ Total: ${result.length} profit agents seeded`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error. Make sure slugs are unique.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedProfitAgents();