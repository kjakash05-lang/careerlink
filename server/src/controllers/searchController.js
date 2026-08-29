const Profile = require('../models/Profile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Post = require('../models/Post');

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
      people = await Profile.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { headline: regex },
          { location: regex },
          { 'skills.name': regex },
        ],
      })
        .limit(10)
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
          populate: { path: 'profile', select: 'firstName lastName headline avatar' },
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
