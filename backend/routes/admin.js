const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Website = require('../models/Website');
// const Scan = require('../models/Scan'); // Comment out or remove
const Payment = require('../models/Payment'); // ✅ Add this

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalWebsites = await Website.countDocuments();
    // const totalScans = await Scan.countDocuments();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: thisMonth },
      role: 'user'
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: sevenDaysAgo },
      role: 'user'
    });

    res.json({
      totalUsers,
      totalAdmins,
      totalWebsites,
      totalScans: 0, // Default when no Scan model
      newUsersThisMonth,
      activeUsers,
      scansToday: 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const websiteCount = await Website.countDocuments({ userId: user._id });
      // const scanCount = await Scan.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        websiteCount,
        scanCount: 0, // Default
        lastScanAt: null
      };
    }));

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single User Details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const websites = await Website.find({ userId: user._id });
    // const scans = await Scan.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({ user, websites, scans: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, plan, isActive, role } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (plan) updateData.plan = plan;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    // ✅ DELETE ALL PAYMENTS FIRST
    const paymentResult = await Payment.deleteMany({ userId: user._id });
    console.log(`✅ Deleted ${paymentResult.deletedCount} payments for user: ${user.email}`);

    // Delete websites
    await Website.deleteMany({ userId: user._id });
    
    // Delete the user
    await User.findByIdAndDelete(user._id);

    res.json({ 
      message: 'User and all associated data deleted',
      paymentsDeleted: paymentResult.deletedCount
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle User Active Status
router.patch('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// routes/admin.js - Add this route
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, plan, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      plan: plan || 'free',
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;