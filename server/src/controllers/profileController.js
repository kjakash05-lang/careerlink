const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadFile, deleteFile } = require('../utils/cloudinary');

// @desc    Get profile by user ID or profile ID
// @route   GET /api/profile/:id
// @access  Public / Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findById(req.params.id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    if (!profile) {
      // Try searching by user ObjectId
      profile = await Profile.findOne({ user: req.params.id })
        .populate('user', 'email role createdAt')
        .populate('skills.endorsements.user', 'email profile');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile basic info
// @route   PUT /api/profile/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      headline,
      about,
      location,
      phone,
      avatar,
      coverImage,
      preferredWorkMode,
      targetRoles,
    } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (headline !== undefined) profile.headline = headline;
    if (about !== undefined) profile.about = about;
    if (location !== undefined) profile.location = location;
    if (phone !== undefined) profile.phone = phone;
    if (avatar !== undefined) profile.avatar = avatar;
    if (coverImage !== undefined) profile.coverImage = coverImage;
    if (preferredWorkMode) profile.preferredWorkMode = preferredWorkMode;
    if (targetRoles) profile.targetRoles = targetRoles;

    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Experience
// @route   POST /api/profile/experience
// @access  Private
exports.addExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Experience
// @route   DELETE /api/profile/experience/:expId
// @access  Private
exports.deleteExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter((exp) => exp._id.toString() !== req.params.expId);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Education
// @route   POST /api/profile/education
// @access  Private
exports.addEducation = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Education
// @route   DELETE /api/profile/education/:eduId
// @access  Private
exports.deleteEducation = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter((edu) => edu._id.toString() !== req.params.eduId);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Skill
// @route   POST /api/profile/skills
// @access  Private
exports.addSkill = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    const exists = profile.skills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Skill already exists on your profile.' });
    }

    profile.skills.push({ name: name.trim(), endorsements: [] });
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove Skill
// @route   DELETE /api/profile/skills/:skillId
// @access  Private
exports.removeSkill = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.skills = profile.skills.filter((s) => s._id.toString() !== req.params.skillId);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Endorse a Skill on someone's profile
// @route   POST /api/profile/:profileId/skills/:skillId/endorse
// @access  Private
exports.endorseSkill = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // Cannot endorse yourself
    if (profile.user.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot endorse your own skills.' });
    }

    const skill = profile.skills.id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found on this profile.' });
    }

    // Check if user already endorsed
    const alreadyEndorsed = skill.endorsements.some(
      (e) => e.user.toString() === req.user.id.toString()
    );

    if (alreadyEndorsed) {
      // Toggle unendorse
      skill.endorsements = skill.endorsements.filter(
        (e) => e.user.toString() !== req.user.id.toString()
      );
    } else {
      skill.endorsements.push({
        user: req.user.id,
        endorsedAt: new Date(),
      });

      // Send notification to profile owner
      const endorserProfile = await Profile.findOne({ user: req.user.id });
      await Notification.create({
        recipient: profile.user,
        sender: req.user.id,
        type: 'skill_endorsement',
        title: 'New Skill Endorsement',
        message: `${endorserProfile ? endorserProfile.fullName : 'Someone'} endorsed your skill in ${skill.name}.`,
        data: { skillName: skill.name, profileId: profile._id },
      });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      endorsed: !alreadyEndorsed,
      endorsementsCount: skill.endorsements.length,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Certification
// @route   POST /api/profile/certifications
// @access  Private
exports.addCertification = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.certifications.unshift(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Certification
// @route   DELETE /api/profile/certifications/:certId
// @access  Private
exports.deleteCertification = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.certifications = profile.certifications.filter((c) => c._id.toString() !== req.params.certId);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Project
// @route   POST /api/profile/projects
// @access  Private
exports.addProject = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.projects.unshift(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Project
// @route   DELETE /api/profile/projects/:projectId
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.projects = profile.projects.filter((p) => p._id.toString() !== req.params.projectId);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Replace Resume PDF
// @route   POST /api/profile/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file.' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // Delete old resume file if existed in Cloudinary
    if (profile.resume && profile.resume.publicId) {
      await deleteFile(profile.resume.publicId, 'raw');
    }

    const uploadResult = await uploadFile(req.file.path, 'prolink/resumes', 'raw');

    profile.resume = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadDate: new Date(),
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume: profile.resume,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Resume
// @route   DELETE /api/profile/resume
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    if (profile.resume && profile.resume.publicId) {
      await deleteFile(profile.resume.publicId, 'raw');
    }

    profile.resume = undefined;
    await profile.save();

    res.status(200).json({ success: true, message: 'Resume deleted successfully.', profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Replace Profile Avatar Image
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file (JPG, PNG, WebP).' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const uploadResult = await uploadFile(req.file.path, 'careerlink/avatars', 'image');
    profile.avatar = uploadResult.url;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      avatar: profile.avatar,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove Profile Avatar Image (Reset to default)
// @route   DELETE /api/profile/avatar
// @access  Private
exports.removeAvatar = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // Default generated avatar using UI Avatars
    profile.avatar = '';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture removed.',
      avatar: '',
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Replace Profile Cover Image
// @route   POST /api/profile/cover
// @access  Private
exports.uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file (JPG, PNG, WebP).' });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const uploadResult = await uploadFile(req.file.path, 'careerlink/covers', 'image');
    profile.coverImage = uploadResult.url;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Cover banner updated successfully.',
      coverImage: profile.coverImage,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove Profile Cover Image
// @route   DELETE /api/profile/cover
// @access  Private
exports.removeCover = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.coverImage = '';
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Cover banner removed.',
      coverImage: '',
      profile,
    });
  } catch (err) {
    next(err);
  }
};
