const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// ============================================================
// 🔑 MASTER PASSWORD CONFIGURATION
// ============================================================

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'ComplyzoMaster2024!';

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile.emails[0].value);
      
      let user = await User.findOne({ email: profile.emails[0].value });
      console.log('User found:', user ? 'Yes - updating' : 'No - creating new');
      
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), salt);
        
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword,
          planId: 1,
          planName: 'Free',
          isActive: true,
          role: 'user'
        });
        await user.save();
        console.log('New user created:', user._id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google strategy error:', error);
      return done(error);
    }
  }
));

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google Auth Route - initiates login
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// Google Auth Callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed` 
  }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { user: { id: req.user._id, role: req.user.role, planId: req.user.planId, planName: req.user.planName } },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }
);

// Existing routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);

// ✅ FIX: Master password check route - properly defined
router.post('/check-master', async (req, res) => {
  try {
    const { password } = req.body;
    const isValid = password === MASTER_PASSWORD;
    
    res.json({
      success: true,
      isValid: isValid
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ FIX: Master status route - properly defined
router.get('/master-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    res.json({
      success: true,
      masterPassword: process.env.MASTER_PASSWORD ? 'Set' : 'Not Set',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Welcome email route
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    await sendWelcomeEmail({ email, name });
    res.json({ message: 'Welcome email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send welcome email' });
  }
});

module.exports = router;