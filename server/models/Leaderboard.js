const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false // Made optional to support placeholder teams
  },
  teamName: {
    type: String,
    required: false // Store team name for entries without valid teamId
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  wins: {
    type: Number,
    default: 0
  },
  kills: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  kdRatio: {
    type: Number,
    default: 0
  },
  game: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

leaderboardSchema.index({ tournamentId: 1, rank: 1 });
leaderboardSchema.index({ teamId: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

