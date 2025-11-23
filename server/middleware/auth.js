const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    // Ensure role is set (default to 'user' if not present)
    if (!user.role) {
      user.role = 'user';
      await user.save();
    }

    // Log user role for debugging (remove in production if needed)
    console.log('🔐 Auth middleware - User authenticated:', {
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
      roleType: typeof user.role,
      roleValue: user.role,
      isAdmin: user.role === 'admin'
    });

    // Ensure req.user is the Mongoose document with all properties
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Directly access role from Mongoose document
    // Mongoose documents expose properties directly, so req.user.role should work
    const userRole = req.user.role;
    
    console.log('Authorize middleware - Checking access:', {
      userId: req.user._id?.toString(),
      userRole: userRole,
      userRoleType: typeof userRole,
      requiredRoles: roles,
      userEmail: req.user.email
    });
    
    if (!userRole) {
      console.error('User role not found:', { 
        userId: req.user._id?.toString(),
        userEmail: req.user.email,
        userType: typeof req.user,
        isMongooseDoc: req.user.constructor?.name === 'model' || req.user._doc !== undefined
      });
      return res.status(403).json({ 
        error: 'Access denied. User role not found.',
        debug: { userId: req.user._id?.toString() }
      });
    }
    
    // Convert both to strings and compare (case-insensitive)
    const userRoleStr = String(userRole).trim().toLowerCase();
    const hasAccess = roles.some(requiredRole => {
      const requiredRoleStr = String(requiredRole).trim().toLowerCase();
      const matches = requiredRoleStr === userRoleStr;
      console.log(`Comparing: "${requiredRoleStr}" === "${userRoleStr}" = ${matches}`);
      return matches;
    });
    
    if (!hasAccess) {
      console.error('Access denied - Role mismatch:', {
        requiredRoles: roles,
        userRole: userRole,
        userRoleStr: userRoleStr,
        userId: req.user._id?.toString(),
        userEmail: req.user.email
      });
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        debug: { 
          requiredRoles: roles, 
          userRole: userRole,
          userId: req.user._id?.toString() 
        }
      });
    }
    
    console.log('✅ Access granted:', { 
      userId: req.user._id?.toString(), 
      role: userRole,
      email: req.user.email 
    });
    
    next();
  };
};

module.exports = { auth, authorize };

