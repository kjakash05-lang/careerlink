const Profile = require('../models/Profile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Post = require('../models/Post');

// Helper to construct multi-field person search query
const buildPersonQuery = (q) => {
  const cleanQ = q.trim();
  const tokens = cleanQ.split(/\s+/).filter(Boolean);
  const regex = new RegExp(cleanQ, 'i');

  const orConditions = [
    { firstName: regex },
    { lastName: regex },
    { headline: regex },
    { location: regex },
    { username: regex },
    { 'skills.name': regex },
  ];

  // If multi-word query (e.g. "Akash K J" or "Keerthana D")
  if (tokens.length >= 2) {
    const firstWordRegex = new RegExp(tokens[0], 'i');
    const restWordRegex = new RegExp(tokens.slice(1).join(' '), 'i');

    orConditions.push({
      $and: [
        { $or: [{ firstName: firstWordRegex }, { lastName: firstWordRegex }] },
        { $or: [{ firstName: restWordRegex }, { lastName: restWordRegex }] },
      ],
    });
  }

  return { $or: orConditions };
};

// @desc    Global search across People, Companies, Jobs, and Posts
// @route   GET /api/search
// @access  Public / Private
exports.searchGlobal = async (req, res, next) => {
  try {
    const { q, type } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        results: { people: [], companies: [], jobs: [], posts: [] },
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const searchType = type || 'all';

    let people = [];
    let companies = [];
    let jobs = [];
    let posts = [];

    if (searchType === 'all' || searchType === 'people') {
      const personQuery = buildPersonQuery(q);
      people = await Profile.find(personQuery)
        .limit(12)
        .populate('user', 'email role');
    }

    if (searchType === 'all' || searchType === 'companies') {
      companies = await Company.find({
        $or: [{ name: regex }, { industry: regex }, { location: regex }, { description: regex }],
      }).limit(10);
    }

    if (searchType === 'all' || searchType === 'jobs') {
      jobs = await Job.find({
        status: 'Active',
        $or: [{ title: regex }, { skillsRequired: { $in: [regex] } }, { location: regex }, { description: regex }],
      })
        .limit(10)
        .populate('company', 'name logo location industry');
    }

    if (searchType === 'all' || searchType === 'posts') {
      posts = await Post.find({
        content: regex,
      })
        .limit(10)
        .populate({
          path: 'author',
          select: 'email role',
          populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
        });
    }

    res.status(200).json({
      success: true,
      query: q,
      results: {
        people,
        companies,
        jobs,
        posts,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dedicated User / People search endpoint
// @route   GET /api/users/search or GET /api/search/users
// @access  Public / Private
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, count: 0, users: [] });
    }

    const personQuery = buildPersonQuery(q);
    const people = await Profile.find(personQuery)
      .limit(15)
      .populate('user', 'email role createdAt');

    res.status(200).json({
      success: true,
      query: q,
      count: people.length,
      users: people,
    });
  } catch (err) {
    next(err);
  }
};
