const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

const plans = [
  {
    planId: 1,
    name: 'Healtrics FE',
    slug: 'healtrics-fe',
    order: 1,
    validity_days: 365,
    status: 'active',
    jvzoo_id: '444615',
    launchpad_id: '3203' // LaunchPad product ID
  },
  {
    planId: 2,
    name: 'Healtrics Pro',
    slug: 'healtrics-pro',
    order: 2,
    validity_days: 365,
    status: 'active',
    jvzoo_id: '445725',
    launchpad_id: '3204' // LaunchPad product ID
  },
  {
    planId: 3,
    name: 'Healtrics Unlimited',
    slug: 'healtrics-unlimited',
    order: 3,
    validity_days: 365,
    status: 'active',
    jvzoo_id: '445753',
    launchpad_id: '3205' // LaunchPad product ID
  }
];

async function seedPlans() {
  console.log('🌱 Seeding Plans...\n');
  console.log('=' .repeat(60));

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing plans
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      console.log(`📋 ${existingPlans.length} existing plans found. Clearing...`);
      await Plan.deleteMany({});
      console.log('✅ Cleared\n');
    }

    // Insert plans
    console.log('📥 Inserting plans...');
    const result = await Plan.insertMany(plans);
    
    console.log('\n✅ Seeded successfully!');
    console.log('=' .repeat(60));
    console.log('📊 Plans:');
    console.log('=' .repeat(60));
    
    result.forEach(plan => {
      console.log(`   ${plan.planId}. ${plan.name}`);
      console.log(`      JVZoo ID: ${plan.jvzoo_id || 'N/A'}`);
      console.log(`      LaunchPad ID: ${plan.launchpad_id || 'N/A'}`);
      console.log(`      Validity: ${plan.validity_days} days`);
      console.log(`      Status: ${plan.status}`);
      console.log('');
    });

    console.log('=' .repeat(60));
    console.log(`✅ Total: ${result.length} plans seeded`);

    // Show platform info
    const platform = process.env.PAYMENT_PLATFORM || 'jvzoo';
    console.log(`\n📌 Current Payment Platform: ${platform.toUpperCase()}`);
    console.log('   To switch platform, set PAYMENT_PLATFORM in .env');
    console.log('   Options: jvzoo | launchpad');

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

seedPlans();