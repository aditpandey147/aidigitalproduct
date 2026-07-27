const axios = require('axios');

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// ============================================================
// 🧪 TEST DATA
// ============================================================

const testCases = [
  {
    name: '✅ V2 Sale - Healtrics FE (planId: 1)',
    data: {
      paykey: 'TEST_PAYKEY_001',
      transaction_id: 'TXN_001',
      transaction_type: 'SALE',
      total: '29.00',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      product_id: '444615',
      product_name: 'Healtrics FE',
      customer_email: `aditpandey697@gmail.com`,
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      cverify: 'ABC12345'
    }
  },
];

// ============================================================
// 🚀 RUN TESTS
// ============================================================

async function runTests() {
  console.log('🧪 JVZoo IPN Test Suite\n');
  console.log('📡 Server URL:', baseUrl);
  console.log('=' .repeat(60));

  // Check if server is running
  try {
    await axios.get(`${baseUrl}/api/test`, { timeout: 3000 });
    console.log('✅ Server is reachable\n');
  } catch (error) {
    console.error('❌ Server is not reachable!');
    console.error('   Make sure the server is running on', baseUrl);
    console.error('   Run: node server.js');
    process.exit(1);
  }

  for (const test of testCases) {
    try {
      console.log(`\n${test.name}`);
      console.log('-'.repeat(40));
      console.log('📤 Sending:', JSON.stringify(test.data, null, 2));

      const response = await axios.post(`${baseUrl}/api/jvzoo/ipn`, test.data, {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('📊 Status:', response.status);
      console.log('📥 Response:', JSON.stringify(response.data, null, 2));
      
      // Check response details
      if (response.data.success) {
        console.log('✅ IPN processed successfully');
        
        if (response.data.user) {
          console.log(`👤 User: ${response.data.user.email}`);
          console.log(`📦 Plan: ${response.data.user.planName} (planId: ${response.data.user.planId})`);
          console.log(`📊 Subscription: ${response.data.user.subscriptionStatus}`);
          console.log(`⏳ End Date: ${response.data.user.subscriptionEndDate}`);
        }
        
        if (response.data.isNewUser) {
          console.log(`🔑 Default Password: ${response.data.defaultPassword}`);
        }
        
        if (response.data.purchasedProduct) {
          console.log(`💰 Product: ${response.data.purchasedProduct.planName}`);
          console.log(`📦 JVZoo ID: ${response.data.purchasedProduct.jvzooId}`);
          console.log(`⏳ Validity: ${response.data.purchasedProduct.validityDays} days`);
        }
      } else {
        console.log('❌ IPN failed:', response.data.message);
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('   ❌ Connection refused. Make sure the server is running.');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('   ❌ Request timed out. The server might be too slow.');
      } else if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📊 Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('='.repeat(60));
  }

  console.log('\n✅ Test suite completed!');
  console.log('📊 Check your database for new users and payments.');
}

// ============================================================
// 🏃‍♂️ RUN
// ============================================================

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});