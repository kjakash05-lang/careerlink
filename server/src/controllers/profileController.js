const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadFile, deleteFile } = require('../utils/cloudinary');

// @desc    Get profile by user ID, profile ID, or public username slug
// @route   GET /api/profile/:id
// @access  Public / Private
exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let profile = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await Profile.findById(id)
        .populate('user', 'email role createdAt')
        .populate('skills.endorsements.user', 'email profile');

      if (!profile) {
        profile = await Profile.findOne({ user: id })
          .populate('user', 'email role createdAt')
          .populate('skills.endorsements.user', 'email profile');
      }
    }

    if (!profile) {
      profile = await Profile.findOne({ username: id.toLowerCase() })
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

    if (firstName) profile.firstName = firstName.trim();
    if (lastName) profile.lastName = lastName.trim();
    if (headline !== undefined) profile.headline = headline.trim();
    if (about !== undefined) profile.about = about;
    if (location !== undefined) profile.location = location.trim();
    if (phone !== undefined) profile.phone = phone.trim();
    if (avatar !== undefined) profile.avatar = avatar;
    if (coverImage !== undefined) profile.coverImage = coverImage;
    if (preferredWorkMode) profile.preferredWorkMode = preferredWorkMode;
    if (targetRoles) profile.targetRoles = targetRoles;

    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      profile: populatedProfile,
      skills: populatedProfile.skills,
      education: populatedProfile.education,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Experience (Legacy Support)
// @route   POST /api/profile/experience
// @access  Private
exports.addExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.experience.unshift(req.body);
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Experience (Legacy Support)
// @route   DELETE /api/profile/experience/:expId
// @access  Private
exports.deleteExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.experience = profile.experience.filter((exp) => exp._id.toString() !== req.params.expId);
      await profile.save();
    }
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
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    profile.education.unshift({
      school: school?.trim(),
      degree: degree?.trim(),
      fieldOfStudy: fieldOfStudy?.trim() || '',
      startDate: startDate?.trim() || '',
      endDate: endDate?.trim() || '',
      description: description?.trim() || '',
    });

    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      profile: populatedProfile,
      education: populatedProfile.education,
    });
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
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.education = profile.education.filter((edu) => edu._id.toString() !== req.params.eduId);
    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      profile: populatedProfile,
      education: populatedProfile.education,
    });
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
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const cleanName = name.trim();
    const exists = profile.skills.some((s) => s.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Skill already exists on your profile.' });
    }

    profile.skills.push({ name: cleanName, endorsements: [] });
    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      profile: populatedProfile,
      skills: populatedProfile.skills,
    });
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
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.skills = profile.skills.filter((s) => s._id.toString() !== req.params.skillId);
    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      profile: populatedProfile,
      skills: populatedProfile.skills,
    });
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
      (e) => (e.user?._id || e.user || e.user?.id).toString() === req.user.id.toString()
    );

    if (alreadyEndorsed) {
      skill.endorsements = skill.endorsements.filter(
        (e) => (e.user?._id || e.user || e.user?.id).toString() !== req.user.id.toString()
      );
    } else {
      skill.endorsements.push({ user: req.user.id, endorsedAt: new Date() });

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

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      endorsed: !alreadyEndorsed,
      endorsementsCount: skill.endorsements.length,
      profile: populatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Certification (Legacy Support)
exports.addCertification = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.certifications.unshift(req.body);
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Certification (Legacy Support)
exports.deleteCertification = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.certifications = profile.certifications.filter((c) => c._id.toString() !== req.params.certId);
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Project (Legacy Support)
exports.addProject = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.projects.unshift(req.body);
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Project (Legacy Support)
exports.deleteProject = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.projects = profile.projects.filter((p) => p._id.toString() !== req.params.projectId);
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Replace Resume PDF (Legacy Support)
exports.uploadResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Resume (Legacy Support)
exports.deleteResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.status(200).json({ success: true, profile });
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

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      avatar: profile.avatar,
      profile: populatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove Profile Avatar (Reset to Initials)
// @route   DELETE /api/profile/avatar
// @access  Private
exports.removeAvatar = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    profile.avatar = '';
    await profile.save();

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      message: 'Avatar removed.',
      profile: populatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Replace Cover Banner Image
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

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      message: 'Cover banner uploaded successfully.',
      coverImage: profile.coverImage,
      profile: populatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove Cover Banner
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

    const populatedProfile = await Profile.findById(profile._id)
      .populate('user', 'email role createdAt')
      .populate('skills.endorsements.user', 'email profile');

    res.status(200).json({
      success: true,
      message: 'Cover banner removed.',
      profile: populatedProfile,
    });
  } catch (err) {
    next(err);
  }
};
