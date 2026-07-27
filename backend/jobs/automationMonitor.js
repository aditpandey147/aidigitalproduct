const cron = require('node-cron');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');

/**
 * Check automation health
 */
async function checkAutomationHealth() {
  console.log('\n🩺 Running Automation Health Check...');
  console.log(`📅 Time: ${new Date().toLocaleString()}`);

  try {
    const activeSettings = await AutomationSetting.find({
      isActive: true,
      scanFrequency: { $ne: 'manual' }
    });

    console.log(`📋 Found ${activeSettings.length} active automations`);

    for (const setting of activeSettings) {
      const nextScanDate = new Date(setting.nextScanAt);
      const now = new Date();
      const hoursUntilNextScan = Math.round((nextScanDate - now) / (1000 * 60 * 60));
      
      console.log(`   📅 Next scan: ${nextScanDate.toLocaleString()} (${hoursUntilNextScan} hours)`);
      
      // Check if scan is overdue (more than 2 hours)
      if (hoursUntilNextScan < -2) {
        console.log(`   ⚠️ Scan is overdue!`);
      }
    }

    console.log('✅ Automation Health Check Completed\n');

  } catch (error) {
    console.error('❌ Health Check Error:', error);
  }
}

/**
 * Initialize automation monitor
 */
function initializeAutomationMonitor() {
  console.log('🔄 Initializing Automation Monitor...');

  // ✅ Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('\n⏰ Running hourly automation check...');
    await checkAutomationHealth();
  });

  console.log('✅ Automation Monitor initialized');
  console.log('   📅 Hourly health checks at minute 0');
}

module.exports = {
  checkAutomationHealth,
  initializeAutomationMonitor
};