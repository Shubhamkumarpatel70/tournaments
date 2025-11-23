const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

// Get all payments (Accountant and Admin only)
router.get('/', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Build query
    let query = { 'stats.totalEarnings': { $gt: 0 } };
    
    // Filter by payment status
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get all users with earnings
    const users = await User.find(query)
      .select('name email stats.tournaments stats.totalEarnings stats.paidEarnings stats.pendingEarnings paymentStatus paymentHistory')
      .populate('tournaments.tournamentId', 'name prizePool date')
      .populate('paymentHistory.processedBy', 'name')
      .sort({ 'stats.totalEarnings': -1 });
    
    // Calculate pending earnings for each user and update if needed
    const usersWithPending = await Promise.all(users.map(async (user) => {
      const pendingEarnings = user.stats.totalEarnings - (user.stats.paidEarnings || 0);
      
      // Update pendingEarnings in stats if it doesn't match
      if (user.stats.pendingEarnings !== pendingEarnings) {
        user.stats.pendingEarnings = pendingEarnings > 0 ? pendingEarnings : 0;
        await user.save();
      }
      
      return {
        ...user.toObject(),
        stats: {
          ...user.stats.toObject(),
          pendingEarnings: pendingEarnings > 0 ? pendingEarnings : 0
        }
      };
    }));
    
    res.json(usersWithPending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status (Accountant and Admin only)
router.put('/:userId/status', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const { status, amount, notes } = req.body;
    const userId = req.params.userId;
    const processedBy = req.user._id;
    
    if (!status || !['pending', 'processing', 'paid', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate payment amount
    const paymentAmount = amount || (user.stats.totalEarnings - (user.stats.paidEarnings || 0));
    
    if (paymentAmount <= 0) {
      return res.status(400).json({ error: 'No pending earnings to process' });
    }
    
    // Update payment status
    user.paymentStatus = status;
    
    // Update earnings based on status
    if (status === 'paid') {
      user.stats.paidEarnings = (user.stats.paidEarnings || 0) + paymentAmount;
      user.stats.pendingEarnings = Math.max(0, (user.stats.pendingEarnings || 0) - paymentAmount);
    }
    
    // Add to payment history
    user.paymentHistory.push({
      amount: paymentAmount,
      status: status,
      processedBy: processedBy,
      processedAt: new Date(),
      notes: notes || ''
    });
    
    await user.save();
    
    // Populate processedBy for response
    await user.populate('paymentHistory.processedBy', 'name');
    
    res.json({ 
      message: 'Payment status updated successfully',
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics (Accountant and Admin only)
router.get('/stats', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all users with earnings
    const users = await User.find({ 'stats.totalEarnings': { $gt: 0 } })
      .select('paymentHistory stats');
    
    // Calculate statistics
    let totalPending = 0;
    let totalPaid = 0;
    let thisMonthProcessed = 0;
    
    users.forEach(user => {
      const pendingEarnings = user.stats.totalEarnings - (user.stats.paidEarnings || 0);
      totalPending += pendingEarnings > 0 ? pendingEarnings : 0;
      totalPaid += user.stats.paidEarnings || 0;
      
      // Calculate this month's processed payments
      if (user.paymentHistory && user.paymentHistory.length > 0) {
        user.paymentHistory.forEach(payment => {
          if (payment.status === 'paid' && payment.processedAt >= startOfMonth) {
            thisMonthProcessed += payment.amount;
          }
        });
      }
    });
    
    res.json({
      totalPending,
      totalPaid,
      thisMonthProcessed,
      totalUsers: users.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

