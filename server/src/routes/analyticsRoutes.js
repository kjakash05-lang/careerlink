const express = require('express');
const { getMyAnalytics, recordEvent } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMyAnalytics);
router.post('/event', protect, recordEvent);

module.exports = router;
