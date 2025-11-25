const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');
const { ensureUserHasReferralCode } = require('../utils/referralCodeGenerator');

// Helper function to get frontend URL from request
const getFrontendUrl = (req) => {
  // 1. Try to get from request origin (most reliable in production)
  const origin = req.get('origin') || req.get('referer');
  if (origin) {
    try {
      const url = new URL(origin);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      // Invalid URL, continue to next option
    }
  }
  
  // 2. Try environment variable
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // 3. Fallback to localhost only in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // 4. In production without origin, try to construct from request
  // This handles cases where the app is served from the same domain
  const protocol = req.protocol || 'https';
  const host = req.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Last resort: return empty string (shouldn't happen in production)
  return 'http://localhost:3000';
};

// Get user's referral code and stats
router.get('/my-code', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name referralCode referralPoints referredUsers');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user has a referral code (generate if missing)
    const referralCode = await ensureUserHasReferralCode(user);

    // Count referred users
    const referredCount = user.referredUsers?.length || 0;

    // Get user's name for the share message
    const userName = user.name || 'Your friend';
    
    // Get frontend URL dynamically from request
    const frontendUrl = getFrontendUrl(req);
    
    // Log in production for debugging (remove in production if not needed)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔗 Referral link generated:', {
        frontendUrl,
        origin: req.get('origin'),
        referer: req.get('referer'),
        host: req.get('host'),
        protocol: req.protocol
      });
    }
    
    // Create share message
    const shareMessage = `${userName} shared a new and exciting opportunity! Click on the link below to know more and join:`;
    const referralLink = `${frontendUrl}/register?ref=${referralCode}`;
    // Format for better clickability - put link on separate line with proper spacing (no emoji for cleaner sharing)
    const fullShareText = `${shareMessage}\n\n${referralLink}`;

    res.json({
      referralCode: referralCode,
      referralPoints: user.referralPoints || 0,
      referredCount,
      referralLink: referralLink,
      shareMessage: shareMessage,
      fullShareText: fullShareText
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get referral stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referredUsers', 'name email createdAt')
      .select('referralCode referralPoints referredUsers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user has a referral code (generate if missing)
    const referralCode = await ensureUserHasReferralCode(user);

    const referredUsers = user.referredUsers || [];
    const totalPoints = user.referralPoints || 0;
    const totalEarnings = totalPoints / 10; // 10 points = 1 rupee

    res.json({
      referralCode: referralCode,
      referralPoints: totalPoints,
      referredCount: referredUsers.length,
      totalEarnings,
      referredUsers: referredUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        joinedAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's referred users with masked data (for regular users)
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('referredUsers', 'name email createdAt')
      .select('referralCode referredUsers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user has a referral code (generate if missing)
    await ensureUserHasReferralCode(user);

    // Helper function to mask name
    const maskName = (name) => {
      if (!name || name.length <= 2) return name || '***';
      return name.substring(0, 2) + '*'.repeat(Math.min(name.length - 2, 10));
    };

    // Helper function to mask email
    const maskEmail = (email) => {
      if (!email) return '***@***.***';
      const [localPart, domain] = email.split('@');
      if (!localPart || !domain) return '***@***.***';
      
      // Show first 2 characters of local part
      const maskedLocal = localPart.length > 2 
        ? localPart.substring(0, 2) + '*'.repeat(Math.min(localPart.length - 2, 5))
        : '*'.repeat(localPart.length);
      
      // Mask domain
      const [domainName, domainExt] = domain.split('.');
      const maskedDomain = domainName.length > 2
        ? domainName.substring(0, 2) + '*'.repeat(Math.min(domainName.length - 2, 3))
        : '*'.repeat(domainName.length);
      
      return `${maskedLocal}@${maskedDomain}.${domainExt || '***'}`;
    };

    const referredUsers = (user.referredUsers || []).map(u => ({
      id: u._id,
      name: maskName(u.name),
      email: maskEmail(u.email),
      joinedAt: u.createdAt
    }));

    res.json({
      referralCode: user.referralCode,
      referredCount: referredUsers.length,
      referredUsers: referredUsers.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert referral points to wallet balance
router.post('/convert-points', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pointsToConvert = user.referralPoints || 0;
    if (pointsToConvert <= 0) {
      return res.status(400).json({ error: 'No points available to convert' });
    }

    // Convert points to wallet (10 points = 1 rupee)
    const rupeesToAdd = pointsToConvert / 10;
    user.wallet.balance = (user.wallet.balance || 0) + rupeesToAdd;

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'credit',
      amount: pointsToConvert,
      description: `Converted ${pointsToConvert} referral points to wallet`,
      status: 'completed'
    });
    await transaction.save();

    // Reset referral points
    user.referralPoints = 0;
    await user.save();

    res.json({
      message: `Successfully converted ${pointsToConvert} points to ₹${rupeesToAdd.toFixed(2)} in wallet`,
      newBalance: user.wallet.balance,
      pointsConverted: pointsToConvert,
      rupeesAdded: rupeesToAdd
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all referral data for admin
router.get('/all', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    // Additional verification - check role directly from database
    const currentUser = await User.findById(req.user._id).select('role email');
    
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'co-admin')) {
      console.error('❌ Admin/Co-admin check failed in route handler:', {
        userId: req.user._id?.toString(),
        email: currentUser?.email,
        roleFromDB: currentUser?.role,
        roleFromReq: req.user?.role
      });
      return res.status(403).json({ 
        error: 'Access denied. Admin or Co-admin role required.',
        debug: { 
          userId: req.user._id?.toString(),
          roleFromDB: currentUser?.role || 'not found',
          roleFromReq: req.user?.role
        }
      });
    }
    
    console.log('✅ Admin verified, fetching referral data...');
    const users = await User.find({})
      .populate('referredBy', 'name email')
      .populate('referredUsers', 'name email createdAt')
      .select('name email referralCode referralPoints referredUsers referredBy createdAt')
      .sort({ createdAt: -1 });

    const referralData = users.map(user => {
      const referredCount = user.referredUsers?.length || 0;
      const earnedPoints = referredCount * 100; // 100 points per referral
      const currentPoints = user.referralPoints || 0;
      const redeemedPoints = earnedPoints - currentPoints; // Points that have been converted
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralPoints: currentPoints,
        earnedPoints: earnedPoints,
        redeemedPoints: redeemedPoints > 0 ? redeemedPoints : 0,
        referredCount: referredCount,
        referredBy: user.referredBy ? {
          id: user.referredBy._id,
          name: user.referredBy.name,
          email: user.referredBy.email
        } : null,
        referredUsers: (user.referredUsers || []).map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          joinedAt: u.createdAt
        })),
        joinedAt: user.createdAt
      };
    });

    res.json(referralData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign referral codes to all users who don't have one (admin only)
router.post('/assign-codes', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const usersWithoutCodes = await User.find({ 
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: '' }
      ]
    });

    let assigned = 0;
    let errors = [];

    for (const user of usersWithoutCodes) {
      try {
        await ensureUserHasReferralCode(user);
        assigned++;
      } catch (error) {
        errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
      }
    }

    res.json({
      message: `Successfully assigned referral codes to ${assigned} users`,
      assigned,
      totalUsersWithoutCodes: usersWithoutCodes.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

