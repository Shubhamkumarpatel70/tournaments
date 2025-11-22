const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gameId: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [teamMemberSchema],
    required: true,
    validate: {
      validator: function(members) {
        return members.length >= 1 && members.length <= 4;
      },
      message: 'Team must have between 1 and 4 members'
    }
  },
  game: {
    type: String,
    enum: ['BGMI', 'Free Fire'],
    required: true
  },
  tournaments: [{
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    position: Number,
    prize: Number
  }],
  stats: {
    wins: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'disbanded'],
    default: 'active'
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

