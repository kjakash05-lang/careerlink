const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerlink_super_secret_jwt_key_983724892374982374');
    const user = await User.findById(decoded.id).populate('profile');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists or is inactive.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid or expired token.',
    });
  }
};

// Optional auth: attaches req.user if valid token provided, but doesn't block unauthenticated requests
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerlink_super_secret_jwt_key_983724892374982374');
    const user = await User.findById(decoded.id).populate('profile');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token on optional routes
  }
  next();
};

// Grant access to specific roles strictly
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource. Required: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
