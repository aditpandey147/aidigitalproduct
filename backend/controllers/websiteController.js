const Website = require('../models/Website');
const User = require('../models/User');
const ScanResult = require('../models/ScanResult');
const Alert = require('../models/Alert');
const Plan = require('../models/Plan');

exports.addWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const existingWebsite = await Website.findOne({ userId, url });
    if (existingWebsite) {
      return res.status(400).json({ message: 'Website already added' });
    }

    const user = await User.findById(userId);
    const websiteCount = await Website.countDocuments({ userId });

    // Get limit from Plan model
    const planData = await Plan.findOne({ name: user.plan });
    const maxAllowed = planData?.maxWebsites || 15;

    if (websiteCount >= maxAllowed && maxAllowed !== 999999) {
      return res.status(403).json({ 
        message: `Your ${user.plan} plan allows max ${maxAllowed} website(s). You have ${websiteCount}. Upgrade to add more.`
      });
    }

    const website = new Website({ userId, url });
    await website.save();

    console.log(`✅ Website added: ${url} for user ${userId}`);
    res.status(201).json(website);
  } catch (error) {
    console.error('Add website error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log(`✅ Found ${websites.length} websites for user ${req.user.id}`);
    res.json(websites);
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteWebsite = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user.id;

    // Find the website
    const website = await Website.findById(websiteId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Check if website belongs to user
    if (website.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete the website
    await Website.findByIdAndDelete(websiteId);
    
    // Also delete associated scan results
    await ScanResult.deleteMany({ websiteId });
    
    // Delete associated alerts
    await Alert.deleteMany({ websiteId });

    console.log(`✅ Website deleted: ${website.url} by user ${userId}`);
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};