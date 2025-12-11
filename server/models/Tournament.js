const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  tournamentType: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['Solo', 'Duo', 'Squad']
  },
  date: {
    type: Date,
    required: true
  },
  matchDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: false // Made optional to support existing tournaments without this field
  },
  entryFee: {
    type: Number,
    required: true
  },
  prizePool: {
    type: Number,
    required: true
  },
  originalPrizePool: {
    type: Number,
    required: false // Will be set to prizePool on creation
  },
  playerSpots: {
    type: Number,
    required: true
  },
  maxTeams: {
    type: Number,
    required: true
  },
  registeredTeams: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  rules: {
    type: [String],
    default: []
  },
  prizeDistribution: {
    type: [
      {
        position: Number,
        prize: Number,
        percentage: Number
      }
    ],
    default: []
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Tournament', tournamentSchema);

