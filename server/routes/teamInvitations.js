const express = require('express');
const router = express.Router();
const TeamInvitation = require('../models/TeamInvitation');
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

// Generate unique invitation code
const generateInvitationCode = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

// Get my invitations
router.get('/my-invitations', auth, async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      $or: [
        { invitedUser: req.user._id, status: 'pending' },
        { invitationCode: { $exists: true }, status: 'pending', expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('teamId', 'name game members')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation by code
router.post('/:invitationId/accept', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find invitation
    const invitation = await TeamInvitation.findById(invitationId)
      .populate('teamId');

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if invitation is valid
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is no longer valid' });
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      'members.userId': req.user._id,
      status: 'active'
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You are already in an active team' });
    }

    // Get team
    const team = await Team.findById(invitation.teamId._id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team has space
    if (team.members.length >= 4) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      member => member.userId && member.userId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Validate gameId is provided
    if (!req.user.gameId || req.user.gameId.trim() === '') {
      return res.status(400).json({ 
        error: 'Game ID is required. Please set your Game ID in your Dashboard before joining a team.',
        needsGameId: true
      });
    }

    // Add user to team
    team.members.push({
      name: req.user.name,
      gameId: req.user.gameId.trim(),
      email: req.user.email,
      userId: req.user._id
    });

    await team.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.invitedUser = req.user._id;
    await invitation.save();

    res.json({ message: 'Successfully joined the team', team });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject invitation
router.post('/:invitationId/reject', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await TeamInvitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is no longer valid' });
    }

    invitation.status = 'rejected';
    invitation.invitedUser = req.user._id;
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation by code (simpler endpoint)
router.post('/accept-code/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;

    // Find invitation by code
    let invitation = await TeamInvitation.findOne({
      invitationCode: code,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('teamId');

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation code' });
    }

    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      'members.userId': req.user._id,
      status: 'active'
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You are already in an active team' });
    }

    // Get team
    const team = await Team.findById(invitation.teamId._id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team has space
    if (team.members.length >= 4) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      member => member.userId && member.userId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Validate gameId is provided
    if (!req.user.gameId || req.user.gameId.trim() === '') {
      return res.status(400).json({ 
        error: 'Game ID is required. Please set your Game ID in your Dashboard before joining a team.',
        needsGameId: true
      });
    }

    // Create user-specific invitation if it doesn't exist
    if (!invitation.invitedUser) {
      invitation.invitedUser = req.user._id;
    }

    // Add user to team
    team.members.push({
      name: req.user.name,
      gameId: req.user.gameId.trim(),
      email: req.user.email,
      userId: req.user._id
    });

    await team.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'Successfully joined the team', team });
  } catch (error) {
    console.error('Error accepting invitation by code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Join team by invitation code (public endpoint)
router.post('/join/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;

    // Find invitation by code
    const invitation = await TeamInvitation.findOne({
      invitationCode: code,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('teamId');

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation code' });
    }

    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      'members.userId': req.user._id,
      status: 'active'
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You are already in an active team' });
    }

    // Get team
    const team = await Team.findById(invitation.teamId._id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team has space
    if (team.members.length >= 4) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      member => member.userId && member.userId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Create a new invitation record for this user
    const userInvitation = new TeamInvitation({
      teamId: team._id,
      invitedBy: invitation.invitedBy,
      invitedUser: req.user._id,
      invitationCode: code,
      status: 'pending'
    });

    res.json({
      invitation: {
        ...userInvitation.toObject(),
        expiresAt: invitation.expiresAt // Include expiration from original invitation
      },
      team: {
        _id: team._id,
        name: team.name,
        game: team.game,
        members: team.members
      },
      message: 'Invitation found. You can now accept or reject it.'
    });
  } catch (error) {
    console.error('Error joining team by code:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

