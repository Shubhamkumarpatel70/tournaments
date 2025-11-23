const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for open invitations via link
  },
  invitationCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expires in 5 hours
      return new Date(Date.now() + 5 * 60 * 60 * 1000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
teamInvitationSchema.index({ invitationCode: 1 });
teamInvitationSchema.index({ invitedUser: 1, status: 1 });
teamInvitationSchema.index({ teamId: 1, status: 1 });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);

