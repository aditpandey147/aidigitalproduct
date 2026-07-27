const mongoose = require('mongoose');
const AutomationSetting = require('../models/AutomationSetting');
const AutomationLog = require('../models/AutomationLog');
const User = require('../models/User');
require('dotenv').config();

async function checkAutomationStatus() {
  console.log('\n🩺 AUTOMATION STATUS CHECK');
  console.log('='.repeat(60));
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check Settings
    console.log('📋 1. Automation Settings:');
    const settings = await AutomationSetting.find({ isActive: true });
    
    if (settings.length === 0) {
      console.log('   ⚠️ No active automation settings found\n');
    } else {
      for (const s of settings) {
        const user = await User.findById(s.userId);
        const nextScan = s.nextScanAt ? new Date(s.nextScanAt).toLocaleString() : 'Not scheduled';
        const lastScan = s.lastScanAt ? new Date(s.lastScanAt).toLocaleString() : 'Never';
        
        console.log(`   ✅ ${user?.email || 'Unknown User'}`);
        console.log(`      Website: ${s.websiteId}`);
        console.log(`      Frequency: ${s.scanFrequency}`);
        console.log(`      Next Scan: ${nextScan}`);
        console.log(`      Last Scan: ${lastScan}`);
        console.log(`      Active: ${s.isActive ? '✅ Yes' : '❌ No'}`);
        console.log('');
      }
    }

    // 2. Check Recent Logs
    console.log('📊 2. Recent Scan Logs (Last 7 days):');
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await AutomationLog.find({
      startedAt: { $gte: last7Days }
    }).sort({ startedAt: -1 }).limit(10);

    if (logs.length === 0) {
      console.log('   ⚠️ No scans in the last 7 days');
    } else {
      logs.forEach((log, i) => {
        console.log(`   ${i+1}. ${log.status.toUpperCase()} - ${new Date(log.startedAt).toLocaleString()}`);
        console.log(`      Issues: ${log.issuesFound}, Critical: ${log.criticalIssues}`);
        if (log.errorMessage) {
          console.log(`      Error: ${log.errorMessage}`);
        }
        console.log('');
      });
    }

    // 3. Summary Statistics
    console.log('📋 3. Summary:');
    const totalLogs = await AutomationLog.countDocuments();
    const successLogs = await AutomationLog.countDocuments({ status: 'success' });
    const failedLogs = await AutomationLog.countDocuments({ status: 'failed' });
    const runningLogs = await AutomationLog.countDocuments({ status: 'running' });
    
    console.log(`   Total Scans: ${totalLogs}`);
    console.log(`   Successful: ${successLogs}`);
    console.log(`   Failed: ${failedLogs}`);
    console.log(`   Running: ${runningLogs}`);
    console.log(`   Success Rate: ${totalLogs > 0 ? Math.round((successLogs/totalLogs)*100) : 0}%`);

    // 4. Final Status
    console.log('\n' + '='.repeat(60));
    const latestLog = await AutomationLog.findOne().sort({ startedAt: -1 });
    
    if (latestLog) {
      if (latestLog.status === 'success') {
        console.log('✅ Automation is WORKING!');
        console.log(`   Last successful scan: ${new Date(latestLog.startedAt).toLocaleString()}`);
        console.log(`   Issues found: ${latestLog.issuesFound}`);
      } else if (latestLog.status === 'running') {
        console.log('🔄 Automation is RUNNING...');
        console.log(`   Started: ${new Date(latestLog.startedAt).toLocaleString()}`);
      } else {
        console.log('❌ Automation has FAILED!');
        console.log(`   Last failed scan: ${new Date(latestLog.startedAt).toLocaleString()}`);
        console.log(`   Error: ${latestLog.errorMessage || 'Unknown error'}`);
      }
    } else {
      console.log('⏳ Waiting for first scan...');
      if (settings.length > 0) {
        console.log(`   Next scheduled: ${new Date(settings[0].nextScanAt).toLocaleString()}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAutomationStatus();