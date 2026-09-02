const Profile = require('../models/Profile');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Connection = require('../models/Connection');

// Helper to construct multi-field person search query
const buildPersonQuery = async (q) => {
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
    { 'education.school': regex },
    { 'education.degree': regex },
    { 'education.fieldOfStudy': regex },
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

  // Also check if any user email matches the query
  const matchingUsers = await User.find({ email: regex }).select('_id');
  if (matchingUsers.length > 0) {
    orConditions.push({ user: { $in: matchingUsers.map((u) => u._id) } });
  }

  return { $or: orConditions };
};

// Helper to normalize user fields according to Phase 6 requirements
const normalizeUserProfile = (p, connectionStatus = 'NONE', connectionId = null) => {
  const doc = p.toObject ? p.toObject({ virtuals: true }) : p;
  const targetUid = (p.user?._id || p.user || p._id).toString();
  const fullName = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Member';
  const profileSlug = p.profileSlug || p.username || targetUid;

  return {
    ...doc,
    id: targetUid, // Real MongoDB user._id.toString()
    userId: targetUid,
    profileId: p._id.toString(),
    name: fullName,
    fullName,
    username: p.username || profileSlug,
    profileSlug,
    profilePicture: p.avatar || '',
    avatar: p.avatar || '',
    headline: p.headline || 'CareerLink Member',
    location: p.location || '',
    skills: p.skills || [],
    education: p.education || [],
    experience: p.experience || [],
    connectionStatus,
    connectionId,
  };
};

// Helper to attach live connection status to profiles
const attachConnectionStatuses = async (profiles, currentUserId) => {
  if (!profiles || profiles.length === 0) return [];
  if (!currentUserId) {
    return profiles.map((p) => normalizeUserProfile(p, 'NONE'));
  }

  const profileUserIds = profiles
    .map((p) => (p.user?._id || p.user || p._id).toString())
    .filter((uid) => uid !== currentUserId.toString());

  // Find all active/pending connections involving current user
  const connections = await Connection.find({
    $or: [
      { requester: currentUserId, recipient: { $in: profileUserIds } },
      { requester: { $in: profileUserIds }, recipient: currentUserId },
    ],
  });

  return profiles.map((p) => {
    const targetUid = (p.user?._id || p.user || p._id).toString();

    if (targetUid === currentUserId.toString()) {
      return normalizeUserProfile(p, 'SELF');
    }

    const match = connections.find(
      (c) =>
        (c.requester.toString() === currentUserId.toString() && c.recipient.toString() === targetUid) ||
        (c.requester.toString() === targetUid && c.recipient.toString() === currentUserId.toString())
    );

    if (!match) {
      return normalizeUserProfile(p, 'NONE');
    }

    if (match.status === 'accepted') {
      return normalizeUserProfile(p, 'CONNECTED', match._id);
    }

    if (match.status === 'pending') {
      if (match.requester.toString() === currentUserId.toString()) {
        return normalizeUserProfile(p, 'PENDING_SENT', match._id);
      } else {
        return normalizeUserProfile(p, 'PENDING_RECEIVED', match._id);
      }
    }

    return normalizeUserProfile(p, 'NONE');
  });
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
      const personQuery = await buildPersonQuery(q);
      const rawPeople = await Profile.find(personQuery)
        .limit(20)
        .populate('user', 'email role createdAt');

      people = await attachConnectionStatuses(rawPeople, req.user?._id);
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

    const personQuery = await buildPersonQuery(q);
    const rawPeople = await Profile.find(personQuery)
      .limit(25)
      .populate('user', 'email role createdAt');

    const users = await attachConnectionStatuses(rawPeople, req.user?._id);

    res.status(200).json({
      success: true,
      query: q,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};
