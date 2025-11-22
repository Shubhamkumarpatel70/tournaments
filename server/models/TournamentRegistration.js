const mongoose = require('mongoose');

const tournamentRegistrationSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  numberOfPlayers: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Wallet', 'Card'],
    required: true
  },
  paymentOption: {
    type: String,
    required: true
  },
  paymentProof: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TournamentRegistration', tournamentRegistrationSchema);

