const express = require('express');
const {
  createCompany,
  getCompanies,
  getCompanyById,
  followCompany,
  getCompanyJobs,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCompanies)
  .post(protect, authorize('recruiter', 'admin'), createCompany);

router.get('/:id', getCompanyById);
router.get('/:id/jobs', getCompanyJobs);
router.put('/:id/follow', protect, followCompany);

module.exports = router;
