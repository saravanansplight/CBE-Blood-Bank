// ============================================================
// CBE BloodConnect - Auth & Authorization Middleware
// ============================================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cbe_dev_secret');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Your account is no longer active.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

// Role-based guard: authorize('donor'), authorize('requester','admin')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to access this resource.' });
    }
    next();
  };
}

// Optional JWT verification (attaches user if valid token, does not block if not)
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cbe_dev_secret');
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (_) {}
  next();
}

module.exports = { auth, authorize, optionalAuth };
