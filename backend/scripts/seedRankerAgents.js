// scripts/seedRankerAgents.js
const mongoose = require('mongoose');
const AIAgent = require('../models/AIAgent');
require('dotenv').config();

const rankerAgents = [
  {
    name: 'SEO Audit Pro',
    slug: 'seo-audit-pro',
    role: 'Technical SEO Specialist',
    thinking_pattern: 'Systematic analysis of website technical issues, prioritizing by impact on search rankings. Focus on crawlability, indexability, site structure, page speed, and mobile optimization.',
    description: 'Comprehensive technical SEO audits. Find and fix issues that hurt your rankings.',
    agentType: 'ranker',
    type: 'seo_audit',
    icon: 'fa-search',
    color: '#10b981',
    category: 'seo',
    featured: true,
    welcomeMessage: "Hello! I'm your Technical SEO Specialist. Let me analyze your website and find opportunities to improve your search rankings. Share your website URL and I'll get started!"
  },
  {
    name: 'Keyword Genius',
    slug: 'keyword-genius',
    role: 'Keyword Research Expert',
    thinking_pattern: 'Data-driven keyword discovery focusing on search intent, competition level, and conversion potential. Use tools and competitor analysis to find hidden opportunities.',
    description: 'Find the perfect keywords for your content. High-volume, low-competition keywords that drive traffic.',
    agentType: 'ranker',
    type: 'keyword_research',
    icon: 'fa-key',
    color: '#8b5cf6',
    category: 'research',
    featured: true,
    welcomeMessage: "Ready to find your golden keywords! I'll help you discover high-value keywords that your competitors are missing. Tell me your niche!"
  },
  {
    name: 'Content Optimizer',
    slug: 'content-optimizer',
    role: 'Content SEO Specialist',
    thinking_pattern: 'Strategic content optimization balancing readability, keyword density, and user engagement. Focus on structure, headings, and semantic SEO.',
    description: 'Optimize your content for both search engines and readers. Get higher rankings and engagement.',
    agentType: 'ranker',
    type: 'content_optimization',
    icon: 'fa-pen-fancy',
    color: '#f59e0b',
    category: 'optimization',
    featured: true,
    welcomeMessage: "I'll help you create content that ranks! Share your article or topic, and I'll optimize it for search engines while keeping it engaging for readers."
  },
  {
    name: 'Link Builder Pro',
    slug: 'link-builder-pro',
    role: 'Link Building Strategist',
    thinking_pattern: 'Strategic relationship building focusing on high-authority, relevant backlink acquisition. Focus on quality over quantity, natural link profiles, and white-hat techniques.',
    description: 'Build powerful backlinks that boost your domain authority and search rankings.',
    agentType: 'ranker',
    type: 'link_building',
    icon: 'fa-link',
    color: '#3b82f6',
    category: 'ranking',
    featured: false,
    welcomeMessage: "Let's build your authority! I'll help you develop a link building strategy that attracts high-quality backlinks. What's your niche?"
  },
  {
    name: 'Local SEO Master',
    slug: 'local-seo-master',
    role: 'Local SEO Expert',
    thinking_pattern: 'Hyperlocal optimization focusing on Google Business Profile, local citations, and review management. Prioritize mobile optimization and local relevance.',
    description: 'Dominate local search results. Get more customers from your local area.',
    agentType: 'ranker',
    type: 'local_seo',
    icon: 'fa-map-marker-alt',
    color: '#ef4444',
    category: 'seo',
    featured: false,
    welcomeMessage: "Ready to dominate your local market! I'll help you optimize your Google Business Profile and local presence. Tell me your business type and location."
  },
  {
    name: 'Rank Tracker',
    slug: 'rank-tracker',
    role: 'Rank Tracking & Analytics Expert',
    thinking_pattern: 'Data analysis focusing on keyword position tracking, competitor monitoring, and performance insights. Provide actionable recommendations based on data.',
    description: 'Monitor your rankings, track competitors, and get actionable insights to improve performance.',
    agentType: 'ranker',
    type: 'rank_tracking',
    icon: 'fa-chart-line',
    color: '#06b6d4',
    category: 'research',
    featured: false,
    welcomeMessage: "I'll help you track your rankings and understand your SEO performance. Share your keywords and I'll provide insights!"
  },
  {
    name: 'Competitor Spy',
    slug: 'competitor-spy',
    role: 'Competitor Analysis Specialist',
    thinking_pattern: 'Strategic competitor analysis identifying gaps, opportunities, and winning strategies. Focus on understanding what works for competitors and how to outperform them.',
    description: 'Analyze your competitors\' SEO strategies and find opportunities to outperform them.',
    agentType: 'ranker',
    type: 'competitor_analysis',
    icon: 'fa-eye',
    color: '#ec4899',
    category: 'research',
    featured: false,
    welcomeMessage: "Let's analyze your competition! I'll help you understand what's working for your competitors and how you can outperform them. Share your competitors' websites."
  },
  {
    name: 'E-commerce SEO Pro',
    slug: 'ecommerce-seo-pro',
    role: 'E-commerce SEO Specialist',
    thinking_pattern: 'Product-focused optimization balancing category structure, product pages, and conversion optimization. Focus on schema markup, product descriptions, and category optimization.',
    description: 'Optimize your online store for search engines. Increase product visibility and sales.',
    agentType: 'ranker',
    type: 'ecommerce_seo',
    icon: 'fa-shopping-cart',
    color: '#f97316',
    category: 'optimization',
    featured: false,
    welcomeMessage: "I'll help your e-commerce store rank higher! Share your store URL and I'll find optimization opportunities to increase sales."
  }
];

async function seedRankerAgents() {
  console.log('🌱 Seeding AI Ranker Agents...\n');
  console.log('=' .repeat(60));

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing ranker agents
    const existing = await AIAgent.find({ agentType: 'ranker' });
    if (existing.length > 0) {
      console.log(`📋 ${existing.length} existing ranker agents found. Clearing...`);
      await AIAgent.deleteMany({ agentType: 'ranker' });
      console.log('✅ Cleared\n');
    }

    // Insert ranker agents
    console.log('📥 Inserting ranker agents...');
    const result = await AIAgent.insertMany(rankerAgents);
    
    console.log('\n✅ Seeded successfully!');
    console.log('=' .repeat(60));
    console.log('📊 AI Ranker Agents:');
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
    console.log(`✅ Total: ${result.length} ranker agents seeded`);

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

seedRankerAgents();