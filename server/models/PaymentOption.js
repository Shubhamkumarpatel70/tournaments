const mongoose = require('mongoose');

const paymentOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Wallet', 'Card', 'QR Code'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentOption', paymentOptionSchema);
