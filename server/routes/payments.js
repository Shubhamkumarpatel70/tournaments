const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

// Get all payments (Accountant and Admin only)
router.get('/', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    // Get all users with earnings
    const users = await User.find({ 'stats.totalEarnings': { $gt: 0 } })
      .select('name email stats.tournaments stats.totalEarnings')
      .populate('tournaments.tournamentId', 'name prizePool date');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status (Accountant and Admin only)
router.put('/:userId/status', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    // Add payment status tracking logic here
    res.json({ message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

