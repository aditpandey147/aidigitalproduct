const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addWebsite, getWebsites, deleteWebsite } = require('../controllers/websiteController');

// Routes
router.post('/', auth, addWebsite);
router.get('/', auth, getWebsites);
router.delete('/:websiteId', auth, deleteWebsite);

module.exports = router;