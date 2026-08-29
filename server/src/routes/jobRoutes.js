const express = require('express');
const {
  getJobs,
  getJobById,
  applyForJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getRecommendedJobs,
  getMyApplications,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getJobs);
router.get('/recommendations', protect, getRecommendedJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', getJobById);

router.post('/:id/apply', protect, applyForJob);
router.post('/:id/save', protect, saveJob);
router.delete('/:id/save', protect, unsaveJob);

module.exports = router;
