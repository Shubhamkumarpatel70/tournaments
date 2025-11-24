const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'rejected'],
    default: 'completed'
  },
  // For withdrawals
  withdrawalType: {
    type: String,
    enum: {
      values: ['upi', 'bank_account'],
      message: '{VALUE} is not a valid withdrawal type'
    },
    required: false
  },
  withdrawalDetails: {
    upiId: { type: String, default: null },
    upiName: { type: String, default: null },
    bankAccountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null },
    accountHolderName: { type: String, default: null }
  },
  // Admin/Accountant who processed the transaction
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // UTR number for approved withdrawals
  utrNumber: {
    type: String,
    default: null
  },
  // Rejection reason for rejected withdrawals
  rejectionReason: {
    type: String,
    default: null
  },
  // Link to related transaction (e.g., reversal transaction)
  relatedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

