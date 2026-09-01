const express = require('express');
const { searchGlobal, searchUsers } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchGlobal);
router.get('/users', searchUsers);

module.exports = router;
