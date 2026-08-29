const express = require('express');
const {
  getProfile,
  getMyProfile,
  updateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  addSkill,
  removeSkill,
  endorseSkill,
  addCertification,
  deleteCertification,
  addProject,
  deleteProject,
  uploadResume,
  deleteResume,
  uploadAvatar,
  removeAvatar,
  uploadCover,
  removeCover,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);

router.post('/cover', protect, upload.single('cover'), uploadCover);
router.delete('/cover', protect, removeCover);

router.post('/experience', protect, addExperience);
router.delete('/experience/:expId', protect, deleteExperience);

router.post('/education', protect, addEducation);
router.delete('/education/:eduId', protect, deleteEducation);

router.post('/skills', protect, addSkill);
router.delete('/skills/:skillId', protect, removeSkill);
router.post('/:profileId/skills/:skillId/endorse', protect, endorseSkill);

router.post('/certifications', protect, addCertification);
router.delete('/certifications/:certId', protect, deleteCertification);

router.post('/projects', protect, addProject);
router.delete('/projects/:projectId', protect, deleteProject);

router.post('/resume', protect, upload.single('resume'), uploadResume);
router.delete('/resume', protect, deleteResume);

router.get('/:id', getProfile);

module.exports = router;
