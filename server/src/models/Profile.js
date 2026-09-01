const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time',
  },
  description: { type: String },
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  endorsements: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      endorsedAt: { type: Date, default: Date.now },
    },
  ],
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: String },
  expirationDate: { type: String },
  credentialId: { type: String },
  credentialUrl: { type: String },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  skills: [{ type: String }],
});

const LanguageSchema = new mongoose.Schema({
  language: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ['Elementary', 'Limited Working', 'Professional Working', 'Full Professional', 'Native or Bilingual'],
    default: 'Professional Working',
  },
});

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
});

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    profileSlug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
    },
    about: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    preferredWorkMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Any'],
      default: 'Any',
    },
    targetRoles: [{ type: String, trim: true }],
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [SkillSchema],
    certifications: [CertificationSchema],
    projects: [ProjectSchema],
    languages: [LanguageSchema],
    achievements: [AchievementSchema],
    resume: {
      url: { type: String },
      publicId: { type: String },
      fileName: { type: String },
      fileSize: { type: Number },
      uploadDate: { type: Date },
    },
    // User-specific persistent analytics
    analytics: {
      profileImpressions: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      postReach: { type: Number, default: 0 },
      recruiterInterest: { type: Number, default: 0 },
      jobViews: { type: Number, default: 0 },
      profileSearches: { type: Number, default: 0 },
      connectionsCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      applicationsCount: { type: Number, default: 0 },
      savedJobsCount: { type: Number, default: 0 },
      postsCount: { type: Number, default: 0 },
      isNewAccount: { type: Boolean, default: true },
      onboardingDismissed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
ProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Computed total years of experience
ProfileSchema.virtual('totalYearsExperience').get(function () {
  if (!this.experience || this.experience.length === 0) return 0;
  return this.experience.length * 1.5;
});

// Dynamic Profile Completion Percentage Calculation
ProfileSchema.virtual('completionPercentage').get(function () {
  let score = 0;
  if (this.firstName && this.lastName) score += 15;
  if (this.avatar) score += 15;
  if (this.headline) score += 15;
  if (this.about && this.about.trim().length > 10) score += 15;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  return Math.min(score, 100);
});

// Auto-generate username slug and profileSlug if not defined
ProfileSchema.pre('save', function (next) {
  if (this.firstName && this.lastName) {
    const baseSlug = `${this.firstName}-${this.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!this.username) {
      this.username = baseSlug;
    }
    if (!this.profileSlug) {
      this.profileSlug = this.username || baseSlug;
    }
  }
  next();
});

// Virtual for clean slug URL
ProfileSchema.virtual('slug').get(function () {
  return this.profileSlug || this.username || this._id.toString();
});

// Text index for search
ProfileSchema.index({
  username: 1,
  firstName: 'text',
  lastName: 'text',
  headline: 'text',
  location: 'text',
  'skills.name': 'text',
});

module.exports = mongoose.model('Profile', ProfileSchema);
