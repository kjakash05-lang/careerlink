const express = require('express');
const {
  getDashboardStats,
  getRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
  updateApplicationStatus,
  searchCandidates,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Strict security: all recruiter endpoints require recruiter or admin role
router.use(protect, authorize('recruiter', 'admin'));

router.get('/dashboard', getDashboardStats);
router.get('/candidates', searchCandidates);
router.get('/applicants', getJobApplicants);
router.put('/applications/:id/status', updateApplicationStatus);

router.route('/jobs')
  .get(getRecruiterJobs)
  .post(createJob);

router.route('/jobs/:id')
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;
