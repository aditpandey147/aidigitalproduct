// scripts/dropProducts.js
const mongoose = require('mongoose');
require('dotenv').config();

async function dropProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop the products collection
    await mongoose.connection.db.collection('products').drop();
    console.log('✅ Products collection dropped successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropProducts();