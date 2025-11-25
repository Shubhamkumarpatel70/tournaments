const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // For "About Us" page team members (admin only)
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: false, // Not required for tournament teams
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  socialLinks: [{
    platform: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  // For tournament teams (user-created)
  game: {
    type: String,
    required: false,
    trim: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  members: [{
    name: {
      type: String,
      required: false,
      trim: true
    },
    gameId: {
      type: String,
      required: false,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'disbanded'],
    default: 'active'
  },
  isTerminated: {
    type: Boolean,
    default: false
  },
  terminationReason: {
    type: String,
    default: null
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  matchResult: {
    type: String,
    enum: ['pending', 'win', 'loss'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Team', teamSchema);
