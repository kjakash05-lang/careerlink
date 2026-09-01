const express = require('express');
const { searchGlobal, searchUsers } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.get('/', searchGlobal);
router.get('/users', searchUsers);
router.get('/search', searchUsers);

module.exports = router;
