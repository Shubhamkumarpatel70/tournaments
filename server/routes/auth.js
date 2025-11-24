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

module.exports = router;

