const mongoose = require('mongoose');

const matchScheduleSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  gameId: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tournamentType: {
    type: String,
    required: true,
    trim: true
  },
  matchDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MatchSchedule', matchScheduleSchema);

