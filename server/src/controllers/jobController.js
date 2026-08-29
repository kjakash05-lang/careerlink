const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const SavedJob = require('../models/SavedJob');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const { calculateJobMatch } = require('../services/recommendationService');

// @desc    Get all active jobs with search & filters
// @route   GET /api/jobs
// @access  Public / Private
exports.getJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, workMode, experience, sort } = req.query;
    let query = { status: 'Active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (experience) {
      query.experienceRequired = { $lte: parseInt(experience, 10) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'salary') {
      sortOption = { salaryMax: -1 };
    } else if (sort === 'experience') {
      sortOption = { experienceRequired: 1 };
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry tagline companySize')
      .populate('recruiter', 'email')
      .sort(sortOption);

    // If user is authenticated, compute match score and check if applied/saved
    let userProfile = null;
    let appliedJobIds = new Set();
    let savedJobIds = new Set();

    if (req.user) {
      userProfile = await Profile.findOne({ user: req.user.id });
      const applications = await JobApplication.find({ applicant: req.user.id }).select('job');
      applications.forEach((a) => appliedJobIds.add(a.job.toString()));

      const saved = await SavedJob.find({ user: req.user.id }).select('job');
      saved.forEach((s) => savedJobIds.add(s.job.toString()));
    }

    const enrichedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      jobObj.hasApplied = appliedJobIds.has(job._id.toString());
      jobObj.isSaved = savedJobIds.has(job._id.toString());

      if (userProfile) {
        const matchResult = calculateJobMatch(userProfile, job);
        jobObj.matchScore = matchResult.matchScore;
        jobObj.matchReasons = matchResult.reasons;
      }

      return jobObj;
    });

    res.status(200).json({ success: true, count: enrichedJobs.length, jobs: enrichedJobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public / Private
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo location industry tagline companySize website description')
      .populate({
        path: 'recruiter',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const jobObj = job.toObject();

    if (req.user) {
      const application = await JobApplication.findOne({ job: job._id, applicant: req.user.id });
      jobObj.hasApplied = Boolean(application);
      jobObj.myApplication = application;

      const saved = await SavedJob.findOne({ job: job._id, user: req.user.id });
      jobObj.isSaved = Boolean(saved);

      const userProfile = await Profile.findOne({ user: req.user.id });
      if (userProfile) {
        const match = calculateJobMatch(userProfile, job);
        jobObj.matchScore = match.matchScore;
        jobObj.matchReasons = match.reasons;
        jobObj.matchBreakdown = match.breakdown;
      }
    }

    res.status(200).json({ success: true, job: jobObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidate only)
exports.applyForJob = async (req, res, next) => {
  try {
    const { coverNote, resumeUrl, resumeFileName } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate('recruiter');
    if (!job || job.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
    }

    const existingApplication = await JobApplication.findOne({ job: jobId, applicant: req.user.id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application for this job.' });
    }

    // Use provided resume or profile resume
    let finalResume = { url: resumeUrl, fileName: resumeFileName || 'Resume.pdf' };
    if (!finalResume.url) {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile && profile.resume && profile.resume.url) {
        finalResume = {
          url: profile.resume.url,
          fileName: profile.resume.fileName || 'Resume.pdf',
          fileSize: profile.resume.fileSize,
        };
      } else {
        return res.status(400).json({ success: false, message: 'Please upload a resume or add a resume to your profile before applying.' });
      }
    }

    const application = await JobApplication.create({
      job: jobId,
      applicant: req.user.id,
      resume: finalResume,
      coverNote: coverNote || '',
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          date: new Date(),
          notes: 'Application received and submitted successfully.',
        },
      ],
    });

    // Notify recruiter
    const candidateProfile = await Profile.findOne({ user: req.user.id });
    await Notification.create({
      recipient: job.recruiter._id,
      sender: req.user.id,
      type: 'job_application',
      title: 'New Job Application Received',
      message: `${candidateProfile ? candidateProfile.fullName : 'A candidate'} applied for ${job.title}.`,
      data: { jobId: job._id, applicationId: application._id },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save a job
// @route   POST /api/jobs/:id/save
// @access  Private
exports.saveJob = async (req, res, next) => {
  try {
    const existing = await SavedJob.findOne({ user: req.user.id, job: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Job is already saved.' });
    }

    const saved = await SavedJob.create({ user: req.user.id, job: req.params.id });
    res.status(201).json({ success: true, message: 'Job saved.', saved });
  } catch (err) {
    next(err);
  }
};

// @desc    Unsave a job
// @route   DELETE /api/jobs/:id/save
// @access  Private
exports.unsaveJob = async (req, res, next) => {
  try {
    await SavedJob.findOneAndDelete({ user: req.user.id, job: req.params.id });
    res.status(200).json({ success: true, message: 'Job removed from saved.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/jobs/saved
// @access  Private
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location industry' },
      })
      .sort({ createdAt: -1 });

    const userProfile = await Profile.findOne({ user: req.user.id });

    const jobs = savedJobs
      .filter((s) => s.job != null)
      .map((s) => {
        const jobObj = s.job.toObject();
        jobObj.isSaved = true;
        if (userProfile) {
          const match = calculateJobMatch(userProfile, s.job);
          jobObj.matchScore = match.matchScore;
          jobObj.matchReasons = match.reasons;
        }
        return jobObj;
      });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Algorithmic Recommended Jobs for Candidate
// @route   GET /api/jobs/recommendations
// @access  Private
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const activeJobs = await Job.find({ status: 'Active' })
      .populate('company', 'name logo location industry tagline companySize')
      .sort({ createdAt: -1 });

    // Applications & Saved check
    const applications = await JobApplication.find({ applicant: req.user.id }).select('job');
    const appliedSet = new Set(applications.map((a) => a.job.toString()));

    const saved = await SavedJob.find({ user: req.user.id }).select('job');
    const savedSet = new Set(saved.map((s) => s.job.toString()));

    const scoredJobs = activeJobs.map((job) => {
      const matchResult = calculateJobMatch(profile, job);
      const jobObj = job.toObject();
      jobObj.matchScore = matchResult.matchScore;
      jobObj.matchReasons = matchResult.reasons;
      jobObj.matchBreakdown = matchResult.breakdown;
      jobObj.hasApplied = appliedSet.has(job._id.toString());
      jobObj.isSaved = savedSet.has(job._id.toString());
      return jobObj;
    });

    // Sort descending by match score
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: scoredJobs.length,
      recommendations: scoredJobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's submitted applications
// @route   GET /api/jobs/my-applications
// @access  Private
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location industry' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};
