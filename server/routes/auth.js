const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateUniqueReferralCode } = require('../utils/referralCodeGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if the existing user is terminated
      if (existingUser.isTerminated) {
        return res.status(400).json({ error: 'New email ID required to register because your account is terminated' });
      }
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate username from email if not provided
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    // Generate unique referral code for new user using utility function
    const userReferralCode = await generateUniqueReferralCode();

    // Handle referral code if provided (for referring user)
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create new user with default role 'user'
    const user = new User({ 
      name, 
      username, 
      email, 
      password,
      role: 'user', // Default role
      referralCode: userReferralCode,
      referredBy: referredBy
    });
    await user.save();

    // If user was referred, award points to referrer
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (referrer) {
        // Award 100 points per referral
        referrer.referralPoints = (referrer.referralPoints || 0) + 100;
        if (!referrer.referredUsers) {
          referrer.referredUsers = [];
        }
        referrer.referredUsers.push(user._id);
        await referrer.save();
      }
    }

    res.status(201).json({
      message: 'Registration successful. Please login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.', code: 'USER_NOT_FOUND' });
    }

    // Check if user is terminated
    if (user.isTerminated) {
      return res.status(403).json({ 
        error: 'Your account is terminated. Please contact customer support.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, you can now reset your password.' 
      });
    }

    // Check if user is terminated
    if (user.isTerminated) {
      return res.status(403).json({ 
        error: 'Your account is terminated. Please contact customer support.' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    
    // Save reset token and expiry (1 hour from now)
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Return success (in production, you would send an email with the reset link)
    res.status(200).json({ 
      message: 'You can now reset your password. Please proceed to the reset page.',
      email: user.email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is terminated
    if (user.isTerminated) {
      return res.status(403).json({ 
        error: 'Your account is terminated. Please contact customer support.' 
      });
    }

    // Check if reset token exists and is valid
    if (!user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ 
        error: 'No active password reset request. Please request a new password reset.' 
      });
    }

    // Check if token is expired
    if (new Date() > user.resetTokenExpiry) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return res.status(400).json({ 
        error: 'Password reset link has expired. Please request a new password reset.' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(user.resetToken, JWT_SECRET);
      if (decoded.userId.toString() !== user._id.toString() || decoded.email !== user.email) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
    } catch (tokenError) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successfully! Please login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;

