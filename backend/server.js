// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const jvzooRoutes = require('./routes/jvzoo');
const passwordResetRoutes = require('./routes/passwordReset');
const planRoutes = require('./routes/plans');
const aiProfitRoutes = require('./routes/aiProfit');
const aiRankerRoutes = require('./routes/aiRanker');
const productRoutes = require('./routes/productRoutes');
const platformRoutes = require('./routes/platformRoutes');
const coverRoutes = require('./routes/coverRoutes');
const aiSealsRoutes = require('./routes/aiSealsRoutes');
const templateRoutes = require('./routes/templateRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/admin');

const setStaticHeaders = (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition');
  next();
};


const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());


// ================================================================
// 📁 SERVE STATIC FILES
// ================================================================

// Serve temp directory for file downloads
app.use('/files', express.static(path.join(__dirname, 'temp')));
app.use('/uploads', setStaticHeaders, express.static(path.join(__dirname, 'uploads')));
app.use('/images', setStaticHeaders, express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

// ================================================================
// API ROUTES
// ================================================================
app.use('/api/auth', authRoutes);
app.use('/api/register', jvzooRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai-ranker', aiRankerRoutes);
app.use('/api/ai-profit', aiProfitRoutes);
app.use('/api/products', productRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/cover', coverRoutes);
app.use('/api/aiseals', aiSealsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Serve static template files
app.use('/templates', express.static(path.join(__dirname, 'public/templates')));
app.use('/templates/previews', express.static(path.join(__dirname, 'public/templates/previews')));


// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'AI Product Factory API is working!',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-factory';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.log('⚠️ MongoDB not connected:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🌐 Sales Pages: http://localhost:${PORT}/sales/:productId/index.html`);
  console.log(`💰 Payment IPN: http://localhost:${PORT}/api/register/ipn\n`);
});

module.exports = app;