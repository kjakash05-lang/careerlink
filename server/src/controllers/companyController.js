const Company = require('../models/Company');
const Job = require('../models/Job');

// @desc    Create a new company page
// @route   POST /api/companies
// @access  Private (Recruiter / Admin only)
exports.createCompany = async (req, res, next) => {
  try {
    const { name, tagline, description, industry, companySize, location, website, foundedYear, logo, coverImage } = req.body;

    if (!name || !description || !industry || !location) {
      return res.status(400).json({ success: false, message: 'Please provide company name, description, industry, and location.' });
    }

    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A company with this name already exists.' });
    }

    const company = await Company.create({
      name,
      tagline: tagline || '',
      description,
      industry,
      companySize: companySize || '51-200',
      location,
      website: website || '',
      foundedYear: foundedYear || new Date().getFullYear(),
      logo: logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      createdBy: req.user.id,
      followers: [req.user.id], // Creator follows by default
    });

    res.status(201).json({ success: true, company });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all companies with search & filters
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res, next) => {
  try {
    const { search, industry } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email');

    // Add jobs count for each company
    const enrichedCompanies = await Promise.all(
      companies.map(async (comp) => {
        const jobsCount = await Job.countDocuments({ company: comp._id, status: 'Active' });
        const compObj = comp.toObject();
        compObj.jobsCount = jobsCount;
        compObj.followerCount = comp.followers ? comp.followers.length : 0;
        compObj.isFollowing = req.user ? comp.followers.some((id) => id.toString() === req.user.id.toString()) : false;
        return compObj;
      })
    );

    res.status(200).json({ success: true, count: enrichedCompanies.length, companies: enrichedCompanies });
  } catch (err) {
    next(err);
  }
};

// @desc    Get company by ID or Slug
// @route   GET /api/companies/:id
// @access  Public / Private
exports.getCompanyById = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      company = await Company.findOne({ slug: req.params.id });
    }

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const jobs = await Job.find({ company: company._id, status: 'Active' }).sort({ createdAt: -1 });

    const compObj = company.toObject();
    compObj.jobs = jobs;
    compObj.jobsCount = jobs.length;
    compObj.followerCount = company.followers ? company.followers.length : 0;
    compObj.isFollowing = req.user ? company.followers.some((id) => id.toString() === req.user.id.toString()) : false;

    res.status(200).json({ success: true, company: compObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow or Unfollow Company
// @route   PUT /api/companies/:id/follow
// @access  Private
exports.followCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const isFollowing = company.followers.some((id) => id.toString() === req.user.id.toString());

    if (isFollowing) {
      company.followers = company.followers.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      company.followers.push(req.user.id);
    }

    await company.save();

    res.status(200).json({
      success: true,
      following: !isFollowing,
      followerCount: company.followers.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get jobs by company
// @route   GET /api/companies/:id/jobs
// @access  Public
exports.getCompanyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ company: req.params.id, status: 'Active' })
      .populate('company', 'name logo location industry')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};
