// ✅ Add dotenv at the top
require('dotenv').config();
const mongoose = require('mongoose');
const { runAutoScans } = require('../jobs/autoScan');

async function forceAutoScan() {
  console.log('🧪 Forcing automated scan...\n');
  console.log('='.repeat(60));
  
  try {
    // ✅ Check environment variables
    console.log('📋 Environment Check:');
    console.log(`   ZEPTOMAIL_API_KEY: ${process.env.ZEPTOMAIL_API_KEY ? '✅ Set' : '❌ Not Set'}`);
    console.log(`   WELCOME_EMAIL: ${process.env.WELCOME_EMAIL || '❌ Not Set'}`);
    console.log(`   ALERTS_EMAIL: ${process.env.ALERTS_EMAIL || '❌ Not Set'}`);
    console.log('');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update nextScanAt to now for all active automations
    const AutomationSetting = require('../models/AutomationSetting');
    const result = await AutomationSetting.updateMany(
      { isActive: true, scanFrequency: { $ne: 'manual' } },
      { nextScanAt: new Date() }
    );
    
    console.log(`📋 Updated ${result.modifiedCount} automation settings to run now\n`);

    // Run the scans
    console.log('🔍 Running automation scans...\n');
    await runAutoScans();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Automation test completed!');
    console.log('📧 Check your email for notifications');
    console.log('📊 Check the automation logs in the dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

forceAutoScan();