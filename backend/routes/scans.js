// routes/scans.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { performScan, getScanResults, getLatestScan } = require('../controllers/scanController');

router.post('/', auth, performScan);
router.get('/:websiteId', auth, getScanResults);
router.get('/latest/:websiteId', auth, getLatestScan);

module.exports = router;