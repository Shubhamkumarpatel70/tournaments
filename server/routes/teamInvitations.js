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

    // Add user to team as a regular member (not team leader)
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

    // Add user to team as a regular member (not team leader)
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

    // Get team with populated captain
    const team = await Team.findById(invitation.teamId._id)
      .populate('captain', 'name email');
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

    // Return team details without creating a new invitation record
    // The invitation will be accepted when user clicks "Join Now"
    res.json({
      invitation: {
        _id: invitation._id,
        invitationCode: code,
        expiresAt: invitation.expiresAt,
        status: invitation.status
      },
      team: {
        _id: team._id,
        name: team.name,
        game: team.game,
        captain: team.captain,
        members: team.members
      },
      message: 'Invitation found. You can now accept or reject it.'
    });
  } catch (error) {
    console.error('Error joining team by code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create invitation link for a team
router.post('/create', auth, async (req, res) => {
  try {
    const { teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Find team and verify user is captain
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is the captain
    if (!team.captain || team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. Only the team captain can create invitations.' });
    }

    // Check if team is full
    if (team.members.length >= 4) {
      return res.status(400).json({ error: 'Team is full. Maximum 4 members allowed.' });
    }

    // Check if there's already a pending invitation for this team
    let invitation = await TeamInvitation.findOne({
      teamId: team._id,
      invitedBy: req.user._id,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    // If no valid invitation exists, create a new one
    if (!invitation) {
      let invitationCode;
      let isUnique = false;
      
      // Generate unique invitation code
      while (!isUnique) {
        invitationCode = generateInvitationCode();
        const existing = await TeamInvitation.findOne({ invitationCode });
        if (!existing) {
          isUnique = true;
        }
      }

      invitation = new TeamInvitation({
        teamId: team._id,
        invitedBy: req.user._id,
        invitationCode: invitationCode,
        status: 'pending'
      });

      await invitation.save();
    }

    // Get frontend URL
    const getFrontendUrl = (req) => {
      // Check for environment variable first
      if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL;
      }
      
      // Try to get from request origin
      const origin = req.get('origin');
      if (origin) {
        return origin;
      }
      
      // Fallback to localhost for development
      return 'http://localhost:3000';
    };

    const frontendUrl = getFrontendUrl(req);
    const invitationLink = `${frontendUrl}/join-team/${invitation.invitationCode}`;

    res.json({
      invitationId: invitation._id,
      invitationCode: invitation.invitationCode,
      invitationLink: invitationLink,
      expiresAt: invitation.expiresAt,
      team: {
        _id: team._id,
        name: team.name,
        game: team.game,
        members: team.members
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

