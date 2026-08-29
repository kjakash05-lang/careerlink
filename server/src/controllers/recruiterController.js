const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateJobMatch } = require('../services/recommendationService');

// @desc    Get Recruiter Dashboard Metrics
// @route   GET /api/recruiter/dashboard
// @access  Private (Recruiter / Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    const totalJobs = await Job.countDocuments({ recruiter: recruiterId });
    const activeJobs = await Job.countDocuments({ recruiter: recruiterId, status: 'Active' });
    const closedJobs = await Job.countDocuments({ recruiter: recruiterId, status: 'Closed' });

    const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = recruiterJobs.map((j) => j._id);

    const totalApplications = await JobApplication.countDocuments({ job: { $in: jobIds } });
    const underReview = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'Under Review' });
    const shortlisted = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'Shortlisted' });
    const interview = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'Interview' });
    const selected = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'Selected' });
    const rejected = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'Rejected' });

    const recentApplications = await JobApplication.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({
        path: 'job',
        select: 'title location company',
        populate: { path: 'company', select: 'name logo' },
      })
      .populate({
        path: 'applicant',
        select: 'email',
        populate: { path: 'profile', select: 'firstName lastName headline avatar skills' },
      });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        pipeline: {
          underReview,
          shortlisted,
          interview,
          selected,
          rejected,
        },
      },
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs posted by current recruiter
// @route   GET /api/recruiter/jobs
// @access  Private (Recruiter / Admin)
exports.getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate('company', 'name logo location industry')
      .sort({ createdAt: -1 });

    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await JobApplication.countDocuments({ job: job._id });
        const shortlistedCount = await JobApplication.countDocuments({ job: job._id, status: 'Shortlisted' });
        const jobObj = job.toObject();
        jobObj.applicationsCount = applicationsCount;
        jobObj.shortlistedCount = shortlistedCount;
        return jobObj;
      })
    );

    res.status(200).json({ success: true, count: enrichedJobs.length, jobs: enrichedJobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new job posting
// @route   POST /api/recruiter/jobs
// @access  Private (Recruiter / Admin)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      currency,
      experienceRequired,
      skillsRequired,
      description,
      responsibilities,
      qualifications,
      deadline,
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title, company, location, and description.',
      });
    }

    const job = await Job.create({
      title,
      company,
      recruiter: req.user.id,
      location,
      jobType: jobType || 'Full-time',
      workMode: workMode || 'Hybrid',
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      currency: currency || 'USD',
      experienceRequired: experienceRequired || 0,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired || '').split(',').map((s) => s.trim()).filter(Boolean),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities || '').split('\n').map((r) => r.trim()).filter(Boolean),
      qualifications: Array.isArray(qualifications) ? qualifications : (qualifications || '').split('\n').map((q) => q.trim()).filter(Boolean),
      deadline: deadline || undefined,
      status: 'Active',
    });

    const populatedJob = await Job.findById(job._id).populate('company', 'name logo location');

    res.status(201).json({ success: true, message: 'Job created successfully.', job: populatedJob });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job posting
// @route   PUT /api/recruiter/jobs/:id
// @access  Private (Recruiter / Admin)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job.' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name logo location');

    res.status(200).json({ success: true, message: 'Job updated successfully.', job: updatedJob });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job
// @route   DELETE /api/recruiter/jobs/:id
// @access  Private (Recruiter / Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await JobApplication.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({ success: true, message: 'Job and associated applications deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applicants for a job or all recruiter jobs
// @route   GET /api/recruiter/applicants
// @access  Private (Recruiter / Admin)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    let query = {};

    if (jobId) {
      query.job = jobId;
    } else {
      const myJobs = await Job.find({ recruiter: req.user.id }).select('_id');
      query.job = { $in: myJobs.map((j) => j._id) };
    }

    if (status) {
      query.status = status;
    }

    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        select: 'title location skillsRequired experienceRequired company jobType workMode',
        populate: { path: 'company', select: 'name logo' },
      })
      .populate({
        path: 'applicant',
        select: 'email',
        populate: { path: 'profile' },
      });

    // Score each candidate against the specific job applied for
    const scoredApplications = applications.map((app) => {
      const appObj = app.toObject();
      if (app.applicant && app.applicant.profile && app.job) {
        const match = calculateJobMatch(app.applicant.profile, app.job);
        appObj.matchScore = match.matchScore;
        appObj.matchReasons = match.reasons;
      } else {
        appObj.matchScore = 70;
        appObj.matchReasons = [];
      }
      return appObj;
    });

    res.status(200).json({ success: true, count: scoredApplications.length, applications: scoredApplications });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Application Status in Recruitment Pipeline
// @route   PUT /api/recruiter/applications/:id/status
// @access  Private (Recruiter / Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes, interviewSchedule } = req.body;
    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await JobApplication.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    if (notes) {
      application.recruiterNotes = notes;
    }
    if (interviewSchedule) {
      application.interviewSchedule = interviewSchedule;
    }

    application.statusHistory.push({
      status,
      date: new Date(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user.id,
    });

    await application.save();

    // Send notification to Candidate
    await Notification.create({
      recipient: application.applicant,
      sender: req.user.id,
      type: 'application_status',
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.job.title}" is now marked as "${status}".`,
      data: {
        jobId: application.job._id,
        applicationId: application._id,
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Advanced Candidate Search for Recruiters
// @route   GET /api/recruiter/candidates
// @access  Private (Recruiter / Admin)
exports.searchCandidates = async (req, res, next) => {
  try {
    const { name, skill, location, education, experienceYears, targetRole } = req.query;
    let query = {};

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
      ];
    }

    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (education) {
      query.$or = [
        { 'education.school': { $regex: education, $options: 'i' } },
        { 'education.degree': { $regex: education, $options: 'i' } },
        { 'education.fieldOfStudy': { $regex: education, $options: 'i' } },
      ];
    }

    if (targetRole) {
      query.$or = [
        { headline: { $regex: targetRole, $options: 'i' } },
        { targetRoles: { $in: [new RegExp(targetRole, 'i')] } },
      ];
    }

    const profiles = await Profile.find(query)
      .populate('user', 'email role createdAt')
      .sort({ createdAt: -1 });

    // Filter by candidate role only (don't show recruiters as candidates)
    const candidateProfiles = profiles.filter((p) => p.user && p.user.role === 'candidate');

    // Experience filter if specified
    let filtered = candidateProfiles;
    if (experienceYears) {
      const minExp = parseInt(experienceYears, 10);
      filtered = candidateProfiles.filter((p) => (p.experience ? p.experience.length * 1.5 >= minExp : false));
    }

    res.status(200).json({ success: true, count: filtered.length, candidates: filtered });
  } catch (err) {
    next(err);
  }
};
