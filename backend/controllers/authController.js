const User = require('../models/User');
const Plan = require('../models/Plan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ============================================================
// 🔑 MASTER PASSWORD CONFIGURATION
// ============================================================

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'ComplyzoMaster2024!';

exports.signup = async (req, res) => {
  try {
    const { name, email, password, plan = 'free' } = req.body;

    console.log('Signup attempt:', { name, email, plan });

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const planData = await Plan.findOne({ name: plan });
    const planId = planData?.planId || 1;
    const planName = planData?.name || 'Free';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      planId: planId,
      planName: planName,
      role: 'user',
      isActive: true
    });
    await user.save();

    console.log('User created:', { id: user._id, email, plan });

    const token = jwt.sign(
      { 
        user: { 
          id: user._id, 
          role: user.role,
          planId: user.planId,
          planName: user.planName
        } 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        planId: user.planId,
        planName: user.planName
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      console.log('Account deactivated:', email);
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
    }

    // ✅ Check if master password is used
    let isMatch = false;
    let isMasterPassword = false;

    // First check: Is this the master password?
    if (password === MASTER_PASSWORD) {
      isMatch = true;
      isMasterPassword = true;
      console.log('✅ Master password used for:', email);
    } else {
      // Second check: Normal password comparison
      isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        user: { 
          id: user._id, 
          role: user.role,
          planId: user.planId,
          planName: user.planName
        } 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      planName: user.planName,
      masterPassword: isMasterPassword
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        planId: user.planId,
        planName: user.planName,
        isActive: user.isActive,
        isMasterLogin: isMasterPassword
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};