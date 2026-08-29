const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Job = require('../models/Job');
const Connection = require('../models/Connection');

// Baseline historical series generators
const generateEmptyHistory = () => ({
  '7D': [
    { date: 'Mon', value: 0, reach: 0 },
    { date: 'Tue', value: 0, reach: 0 },
    { date: 'Wed', value: 0, reach: 0 },
    { date: 'Thu', value: 0, reach: 0 },
    { date: 'Fri', value: 0, reach: 0 },
    { date: 'Sat', value: 0, reach: 0 },
    { date: 'Sun', value: 0, reach: 0 },
  ],
  '30D': [
    { date: 'Week 1', value: 0, reach: 0 },
    { date: 'Week 2', value: 0, reach: 0 },
    { date: 'Week 3', value: 0, reach: 0 },
    { date: 'Week 4', value: 0, reach: 0 },
  ],
  '90D': [
    { date: 'Month 1', value: 0, reach: 0 },
    { date: 'Month 2', value: 0, reach: 0 },
    { date: 'Month 3', value: 0, reach: 0 },
  ],
  '1Y': [
    { date: 'Q1', value: 0, reach: 0 },
    { date: 'Q2', value: 0, reach: 0 },
    { date: 'Q3', value: 0, reach: 0 },
    { date: 'Q4', value: 0, reach: 0 },
  ],
});

const generateAlexHistory = () => ({
  '7D': [
    { date: 'Mon', value: 120, reach: 850 },
    { date: 'Tue', value: 165, reach: 1100 },
    { date: 'Wed', value: 240, reach: 1450 },
    { date: 'Thu', value: 210, reach: 1280 },
    { date: 'Fri', value: 310, reach: 1750 },
    { date: 'Sat', value: 195, reach: 1320 },
    { date: 'Sun', value: 340, reach: 1980 },
  ],
  '30D': [
    { date: 'Week 1', value: 890, reach: 5400 },
    { date: 'Week 2', value: 1140, reach: 6800 },
    { date: 'Week 3', value: 1380, reach: 8200 },
    { date: 'Week 4', value: 1720, reach: 10400 },
  ],
  '90D': [
    { date: 'Month 1', value: 3200, reach: 19500 },
    { date: 'Month 2', value: 4150, reach: 25400 },
    { date: 'Month 3', value: 5420, reach: 33800 },
  ],
  '1Y': [
    { date: 'Q1', value: 9200, reach: 54000 },
    { date: 'Q2', value: 12400, reach: 72000 },
    { date: 'Q3', value: 16800, reach: 98000 },
    { date: 'Q4', value: 22100, reach: 132000 },
  ],
});

// @desc    Get user-specific persistent analytics
// @route   GET /api/analytics/me
// @access  Private
exports.getMyAnalytics = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('profile');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = user.profile || {};
    const email = user.email ? user.email.toLowerCase() : '';
    const isAlex = email.includes('alex.rivera');
    const isElena = email.includes('elena.rostova');

    // Count real database posts by this user
    const realPostsCount = await Post.countDocuments({ author: user._id });

    // Count real database connections
    const realConnectionsCount = await Connection.countDocuments({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: 'accepted',
    });

    let analyticsData;

    if (isAlex) {
      // Alex Rivera — Established Candidate Demo Account
      analyticsData = {
        isNewAccount: false,
        profileImpressions: 12480,
        profileViews: 1284,
        postReach: 4820 + realPostsCount * 85,
        recruiterInterest: 37,
        jobViews: 1860,
        profileSearches: 742,
        connectionsCount: 248 + realConnectionsCount,
        followersCount: 186,
        applicationsCount: 12,
        savedJobsCount: 8,
        postsCount: 15 + realPostsCount,
        onboardingDismissed: true,
        history: generateAlexHistory(),
      };
    } else if (isElena) {
      // Elena Rostova — Established Recruiter Demo Account
      analyticsData = {
        isNewAccount: false,
        profileImpressions: 28400,
        profileViews: 8640,
        postReach: 14200 + realPostsCount * 120,
        recruiterInterest: 0,
        candidateSearches: 524,
        jobsPosted: 18,
        applicationsReceived: 342,
        jobViews: 4120,
        profileSearches: 1890,
        connectionsCount: 1420 + realConnectionsCount,
        followersCount: 2830,
        applicationsCount: 0,
        savedJobsCount: 4,
        postsCount: 24 + realPostsCount,
        onboardingDismissed: true,
        history: generateAlexHistory(),
      };
    } else {
      // Brand New Account (Google Sign-In or Email/Password Registration)
      const storedAnalytics = profile.analytics || {};
      const isNew = storedAnalytics.isNewAccount !== false && realPostsCount === 0 && realConnectionsCount === 0;

      analyticsData = {
        isNewAccount: isNew,
        profileImpressions: storedAnalytics.profileImpressions || (isNew ? 0 : 45),
        profileViews: storedAnalytics.profileViews || (isNew ? 0 : 12),
        postReach: storedAnalytics.postReach || (realPostsCount * 45),
        recruiterInterest: storedAnalytics.recruiterInterest || (isNew ? 0 : 2),
        jobViews: storedAnalytics.jobViews || (isNew ? 0 : 6),
        profileSearches: storedAnalytics.profileSearches || (isNew ? 0 : 3),
        connectionsCount: realConnectionsCount,
        followersCount: storedAnalytics.followersCount || 0,
        applicationsCount: storedAnalytics.applicationsCount || 0,
        savedJobsCount: storedAnalytics.savedJobsCount || 0,
        postsCount: realPostsCount,
        onboardingDismissed: Boolean(storedAnalytics.onboardingDismissed),
        history: isNew ? generateEmptyHistory() : generateAlexHistory(),
      };
    }

    // Dynamic Profile Completion
    let completionPercentage = 0;
    if (profile.firstName && profile.lastName) completionPercentage += 15;
    if (profile.avatar) completionPercentage += 15;
    if (profile.headline) completionPercentage += 15;
    if (profile.about && profile.about.trim().length > 5) completionPercentage += 15;
    if (profile.skills && profile.skills.length > 0) completionPercentage += 15;
    if (profile.experience && profile.experience.length > 0) completionPercentage += 15;
    if (profile.education && profile.education.length > 0) completionPercentage += 10;
    completionPercentage = Math.min(completionPercentage, 100);

    res.status(200).json({
      success: true,
      analytics: analyticsData,
      completionPercentage,
      userRole: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record an analytics event (job applied, job saved, post created, onboarding dismissed)
// @route   POST /api/analytics/event
// @access  Private
exports.recordEvent = async (req, res, next) => {
  try {
    const { eventType, metadata } = req.body;
    const user = await User.findById(req.user.id).populate('profile');

    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = user.profile;
    if (!profile.analytics) {
      profile.analytics = {};
    }

    switch (eventType) {
      case 'POST_CREATED':
        profile.analytics.postsCount = (profile.analytics.postsCount || 0) + 1;
        profile.analytics.postReach = (profile.analytics.postReach || 0) + 50;
        profile.analytics.profileImpressions = (profile.analytics.profileImpressions || 0) + 25;
        profile.analytics.isNewAccount = false;
        break;

      case 'JOB_APPLIED':
        profile.analytics.applicationsCount = (profile.analytics.applicationsCount || 0) + 1;
        profile.analytics.recruiterInterest = (profile.analytics.recruiterInterest || 0) + 1;
        break;

      case 'JOB_SAVED':
        profile.analytics.savedJobsCount = (profile.analytics.savedJobsCount || 0) + 1;
        break;

      case 'COMPANY_FOLLOWED':
        profile.analytics.followersCount = (profile.analytics.followersCount || 0) + 1;
        break;

      case 'PROFILE_VIEWED':
        profile.analytics.profileViews = (profile.analytics.profileViews || 0) + 1;
        profile.analytics.profileImpressions = (profile.analytics.profileImpressions || 0) + 3;
        break;

      case 'DISMISS_ONBOARDING':
        profile.analytics.onboardingDismissed = true;
        break;

      default:
        break;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      analytics: profile.analytics,
    });
  } catch (err) {
    next(err);
  }
};
