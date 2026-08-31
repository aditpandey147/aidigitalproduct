// scripts/seedComplyzoPlans.js
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const complyzoPlans = [
  {
    planId: 1,
    name: 'Complyzo FE',
    slug: 'complyzo-fe',
    order: 1,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3203'
  },
  {
    planId: 2,
    name: 'Complyzo FE+TURBO',
    slug: 'complyzo-fe-turbo',
    order: 2,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3204'
  },
  {
    planId: 3,
    name: 'Complyzo Unlimited Silver',
    slug: 'complyzo-unlimited-silver',
    order: 3,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3205'
  },
  {
    planId: 4,
    name: 'Complyzo Unlimited Gold',
    slug: 'complyzo-unlimited-gold',
    order: 4,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3206'
  },
  {
    planId: 5,
    name: 'Complyzo Competitor Spy Elite',
    slug: 'complyzo-competitor-spy-elite',
    order: 5,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3207'
  },
  {
    planId: 6,
    name: 'Complyzo Competitor Spy Pro',
    slug: 'complyzo-competitor-spy-pro',
    order: 6,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3208'
  },
  {
    planId: 7,
    name: 'Complyzo AI Ranker',
    slug: 'complyzo-ai-ranker',
    order: 7,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3209'
  },
  {
    planId: 8,
    name: 'Complyzo DFY Silver',
    slug: 'complyzo-dfy-silver',
    order: 8,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3210'
  },
  {
    planId: 9,
    name: 'Complyzo DFY Gold',
    slug: 'complyzo-dfy-gold',
    order: 9,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3211'
  },
  {
    planId: 10,
    name: 'Complyzo AI Profit Machine',
    slug: 'complyzo-ai-profit-machine',
    order: 10,
    validity_days: 365,
    status: 'active',
    jvzoo_id: null,
    launchpad_id: '3212'
  }
];

async function seedComplyzoPlans() {
  console.log('🌱 Seeding Complyzo Plans...\n');
  console.log('=' .repeat(60));

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing plans
    const existingPlans = await Plan.find({});
    if (existingPlans.length > 0) {
      console.log(`📋 ${existingPlans.length} existing plans found.`);
      console.log('   Use --force to overwrite or delete manually');
      console.log('   Run: node scripts/seedComplyzoPlans.js --force');
      
      // Show existing plans
      console.log('\n📊 Existing Plans:');
      console.log('=' .repeat(60));
      existingPlans.forEach(plan => {
        console.log(`   ${plan.planId}. ${plan.name}`);
        console.log(`      LaunchPad ID: ${plan.launchpad_id || 'N/A'}`);
        console.log(`      Status: ${plan.status}`);
      });
      
      process.exit(0);
    }

    // Insert plans
    console.log('📥 Inserting Complyzo plans...');
    const result = await Plan.insertMany(complyzoPlans);
    
    console.log('\n✅ Seeded successfully!');
    console.log('=' .repeat(60));
    console.log('📊 Complyzo Plans:');
    console.log('=' .repeat(60));
    
    result.forEach(plan => {
      console.log(`   ${plan.planId}. ${plan.name}`);
      console.log(`      LaunchPad ID: ${plan.launchpad_id}`);
      console.log(`      Slug: ${plan.slug}`);
      console.log(`      Validity: ${plan.validity_days} days`);
      console.log(`      Status: ${plan.status}`);
      console.log('');
    });

    console.log('=' .repeat(60));
    console.log(`✅ Total: ${result.length} plans seeded`);
    console.log('📌 Platform: LaunchPad');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error. Make sure planId is unique.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// ✅ Force overwrite if --force flag is used
if (process.argv.includes('--force')) {
  console.log('⚠️ Force mode enabled - Deleting existing plans...\n');
  
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';
  mongoose.connect(MONGODB_URI).then(async () => {
    await Plan.deleteMany({});
    console.log('✅ Existing plans deleted\n');
    await mongoose.disconnect();
    
    // Run the seed again
    seedComplyzoPlans();
  });
} else {
  seedComplyzoPlans();
}