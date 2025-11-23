const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'accountant', 'user'],
    default: 'user'
  },
  gameId: {
    type: String,
    default: ''
  },
  wallet: {
    balance: { type: Number, default: 0, min: 0 }
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  referredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    wins: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    kdRatio: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'rejected'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'paid', 'rejected'], required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }],
  tournaments: [{
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    position: Number,
    prize: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Note: Referral code is generated in the registration route to avoid circular dependency

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

