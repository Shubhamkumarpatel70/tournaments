const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get user wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ balance: user.wallet?.balance || 0 });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('processedBy', 'name email')
      .limit(50);
    
    // Debug: Log transaction types
    console.log(`Fetched ${transactions.length} transactions for user ${req.user._id}`);
    const creditCount = transactions.filter(t => t.type === 'credit').length;
    const debitCount = transactions.filter(t => t.type === 'debit').length;
    console.log(`Credit: ${creditCount}, Debit: ${debitCount}`);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add money to wallet (Admin/Accountant only)
router.post('/add-money', auth, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid userId or amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update wallet balance
    user.wallet = user.wallet || { balance: 0 };
    user.wallet.balance += parseFloat(amount);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'credit',
      amount: parseFloat(amount),
      description: description || `Money added by ${req.user.name}`,
      status: 'completed',
      processedBy: req.user._id
      // withdrawalType and withdrawalDetails are not set for credit transactions
    });
    
    // Debug: Log transaction creation
    console.log('Creating credit transaction:', {
      userId: user._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description
    });
    
    await transaction.save();
    
    // Verify transaction was saved correctly
    const savedTransaction = await Transaction.findById(transaction._id);
    if (savedTransaction) {
      console.log('Credit transaction saved successfully:', {
        id: savedTransaction._id.toString(),
        type: savedTransaction.type,
        amount: savedTransaction.amount,
        userId: savedTransaction.userId.toString()
      });
    } else {
      console.error('ERROR: Credit transaction was not saved!');
    }

    res.json({ 
      message: 'Money added successfully',
      balance: user.wallet.balance,
      transaction
    });
  } catch (error) {
    console.error('Error adding money:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, withdrawalType, withdrawalDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    if (!withdrawalType || !['upi', 'bank_account'].includes(withdrawalType)) {
      return res.status(400).json({ message: 'Invalid withdrawal type' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wallet = user.wallet || { balance: 0 };

    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Validate withdrawal details based on type
    if (withdrawalType === 'upi') {
      if (!withdrawalDetails?.upiId) {
        return res.status(400).json({ message: 'UPI ID is required' });
      }
      if (!withdrawalDetails?.upiName) {
        return res.status(400).json({ message: 'Name related to UPI is required' });
      }
    }

    if (withdrawalType === 'bank_account') {
      const required = ['bankAccountNumber', 'bankName', 'ifscCode', 'accountHolderName'];
      for (const field of required) {
        if (!withdrawalDetails?.[field]) {
          return res.status(400).json({ message: `${field} is required` });
        }
      }
    }

    // Deduct from wallet
    user.wallet.balance -= amount;
    await user.save();

    // Create pending withdrawal transaction
    const transaction = new Transaction({
      userId: user._id,
      type: 'debit',
      amount: amount,
      description: `Withdrawal request - ${withdrawalType === 'upi' ? 'UPI' : 'Bank Account'}`,
      status: 'pending',
      withdrawalType: withdrawalType,
      withdrawalDetails: withdrawalDetails
    });
    await transaction.save();

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      balance: user.wallet.balance,
      transaction
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all withdrawal requests (Admin/Accountant only)
router.get('/withdrawal-requests', auth, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { 
      type: 'debit',
      status: status || 'pending'
    };
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject withdrawal request (Admin/Accountant only)
router.put('/withdrawal/:transactionId', auth, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const transaction = await Transaction.findById(transactionId).populate('userId');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type !== 'debit' || transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid transaction status' });
    }

    if (action === 'approve') {
      const { utrNumber } = req.body;
      
      if (!utrNumber || utrNumber.trim() === '') {
        return res.status(400).json({ message: 'UTR number is required for approval' });
      }

      transaction.status = 'completed';
      transaction.processedBy = req.user._id;
      transaction.utrNumber = utrNumber.trim();
      if (notes) {
        transaction.description += ` - ${notes}`;
      }
      await transaction.save();
      res.json({ message: 'Withdrawal approved successfully', transaction });
    } else {
      // Reject - refund the amount back to wallet
      const { rejectionReason } = req.body;
      
      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      const user = await User.findById(transaction.userId._id);
      if (user) {
        user.wallet = user.wallet || { balance: 0 };
        user.wallet.balance += transaction.amount;
        await user.save();
      }

      transaction.status = 'rejected';
      transaction.processedBy = req.user._id;
      transaction.rejectionReason = rejectionReason.trim();
      if (notes) {
        transaction.description += ` - Rejected: ${notes}`;
      }
      await transaction.save();

      res.json({ message: 'Withdrawal rejected and amount refunded', transaction });
    }
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with wallet balances (Admin/Accountant only)
router.get('/users', auth, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email wallet')
      .sort({ 'wallet.balance': -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users with wallets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions (Admin/Accountant only)
router.get('/all-transactions', auth, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { userId, type, status, limit = 100 } = req.query;
    const query = {};
    
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Calculate totals
    const totals = {
      totalCredited: 0,
      totalDebited: 0,
      totalAmount: 0
    };
    
    transactions.forEach(t => {
      if (t.type === 'credit' && t.status === 'completed') {
        totals.totalCredited += t.amount;
      } else if (t.type === 'debit' && t.status === 'completed') {
        totals.totalDebited += t.amount;
      }
      totals.totalAmount += t.type === 'credit' ? t.amount : -t.amount;
    });
    
    res.json({
      transactions,
      totals
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate UPI ID and get account holder name
router.post('/validate-upi', auth, async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ message: 'Invalid UPI ID format' });
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: 'Invalid UPI ID format' });
    }

    // Try to validate using Razorpay if configured
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Use Razorpay's UPI validation (if available)
        // Note: Razorpay doesn't have a direct UPI validation endpoint
        // This is a placeholder for future integration
        // For now, we'll use a mock response or return formatted name
      } catch (razorpayError) {
        console.log('Razorpay not configured, using fallback');
      }
    }

    // Fallback: Extract and format name from UPI ID
    // This is a temporary solution until payment gateway integration
    const parts = upiId.split('@');
    const namePart = parts[0];
    
    // Format the name (capitalize first letter of each word)
    // Remove numbers and special characters, keep only letters
    const cleanName = namePart.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, ' ');
    const formattedName = cleanName
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();

    // If no valid name extracted, use the first part of UPI ID
    const displayName = formattedName || namePart.split(/[.\-_]/)[0].charAt(0).toUpperCase() + namePart.split(/[.\-_]/)[0].slice(1).toLowerCase();

    res.json({
      success: true,
      upiId: upiId,
      accountHolderName: displayName,
      isFormatted: true, // Indicates this is a formatted name, not from API
      message: 'UPI ID validated (formatted name - integrate payment gateway for real account holder name)'
    });

  } catch (error) {
    console.error('Error validating UPI ID:', error);
    res.status(500).json({ message: 'Error validating UPI ID' });
  }
});

module.exports = router;

