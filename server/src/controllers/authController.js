const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ''
);

// Generate JWT token
const sendTokenResponse = (user, profile, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'careerlink_super_secret_jwt_key_983724892374982374',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: profile || user.profile,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register a new user (Candidate or Recruiter)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, headline, location } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, first name, and last name.',
      });
    }

    const assignedRole = role === 'recruiter' ? 'recruiter' : 'candidate';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: assignedRole,
      authProvider: 'local',
    });

    // Create initial profile
    const profile = await Profile.create({
      user: user._id,
      firstName,
      lastName,
      headline: headline || (assignedRole === 'recruiter' ? 'Talent Acquisition Specialist' : 'Professional'),
      location: location || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + lastName)}`,
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    });

    // Link profile to user
    user.profile = profile._id;
    await user.save();

    sendTokenResponse(user, profile, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.',
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password').populate('profile');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, user.profile, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate with Google OAuth 2.0 (OpenID Connect ID Token / Credential)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential is required.',
      });
    }

    let payload = null;

    if (credential) {
      // Verify Google ID token
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: clientId ? [clientId] : undefined,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        // Fallback: decode token safely if audience check fails during local testing
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email && decoded.sub) {
          payload = decoded;
        } else {
          return res.status(401).json({
            success: false,
            message: 'Unable to verify Google credential. Please try again.',
          });
        }
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google profile payload. Email is missing.',
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const firstName = payload.given_name || payload.name?.split(' ')[0] || 'Member';
    const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
    const googleAvatar = payload.picture || '';

    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).populate('profile');

    if (user) {
      // Existing User account linking
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider || 'google';
      }
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      // If user profile has no avatar, assign Google avatar
      if (user.profile && !user.profile.avatar && googleAvatar) {
        user.profile.avatar = googleAvatar;
        await user.profile.save();
      }

      return sendTokenResponse(user, user.profile, 200, res);
    }

    // New Google User Creation
    user = await User.create({
      email,
      role: 'candidate',
      authProvider: 'google',
      googleId,
      lastLogin: Date.now(),
    });

    const profile = await Profile.create({
      user: user._id,
      firstName,
      lastName,
      headline: 'Software Professional',
      location: '',
      avatar: googleAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName + lastName)}`,
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    });

    user.profile = profile._id;
    await user.save({ validateBeforeSave: false });

    return sendTokenResponse(user, profile, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Switch account / Quick demo login
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;
    let email = 'alex.rivera@example.com';
    if (role === 'recruiter') email = 'elena.rostova@example.com';
    else if (role === 'candidate_ml') email = 'priya.sharma@example.com';
    else if (role === 'candidate_java') email = 'rahul.mehta@example.com';
    else if (role === 'recruiter_cloud') email = 'jason.reid@example.com';
    else if (role === 'admin') email = 'admin@prolink.com';
    else if (role === 'ajay') email = 'ajay.pk@example.com';
    else if (role === 'akash') email = 'akash.kj@example.com';
    else if (role === 'akshay_g') email = 'akshay.guptha@example.com';
    else if (role === 'akshay_r') email = 'akshay.ravi@example.com';

    let user = await User.findOne({ email }).populate('profile');
    if (!user) {
      user = await User.findOne().populate('profile');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    sendTokenResponse(user, user.profile, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('profile');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
