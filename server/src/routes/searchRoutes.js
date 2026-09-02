const express = require('express');
const { searchGlobal, searchUsers } = require('../controllers/searchController');
const { getProfile } = require('../controllers/profileController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

router.get('/', searchGlobal);
router.get('/users', searchUsers);
router.get('/search', searchUsers);
router.get('/public/:identifier', getProfile);
router.get('/profile/:identifier', getProfile);
router.get('/public/:id', getProfile);
router.get('/profile/:id', getProfile);
router.get('/:id', (req, res, next) => {
  if (req.params.id === 'search' || req.params.id === 'users') {
    return next();
  }
  return getProfile(req, res, next);
});

module.exports = router;
