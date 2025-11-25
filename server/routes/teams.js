const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth, authorize } = require('../middleware/auth');

// Get all team members (public) - only "About Us" page team members
router.get('/', async (req, res) => {
  try {
    // Only return teams with position field (About Us page team members)
    const teamMembers = await Team.find({ 
      isActive: true,
      position: { $exists: true, $ne: null }
    })
      .sort({ order: 1, createdAt: -1 });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tournament teams
router.get('/my-teams', auth, async (req, res) => {
  try {
    // Find teams where user is captain OR user is a member
    // Tournament teams: have game field OR have members array, but no position field
    const teams = await Team.find({
      $or: [
        { captain: req.user._id },
        { 'members.userId': req.user._id }
      ],
      position: { $exists: false } // No position field (not "About Us" member)
    })
      .populate('captain', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${teams.length} teams for user ${req.user._id}`);
    if (teams.length > 0) {
      console.log('Team names:', teams.map(t => ({ name: t.name, game: t.game, captain: t.captain, hasMembers: !!t.members?.length })));
    } else {
      // Debug: Check if any teams exist for this user without position filter
      const allUserTeams = await Team.find({
        $or: [
          { captain: req.user._id },
          { 'members.userId': req.user._id }
        ]
      });
      console.log(`Total teams for user (including "About Us"): ${allUserTeams.length}`);
    }
    res.json(teams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all team members (admin only)
router.get('/all', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const teamMembers = await Team.find()
      .populate('captain', 'name email')
      .sort({ order: 1, createdAt: -1 });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team member (admin only) - for "About Us" page
router.post('/', auth, async (req, res) => {
  try {
    const { name, position, description, socialLinks, image, order, game, members, teamLeader } = req.body;

    // Check if this is a tournament team (has game and members) or admin team member (has position)
    if (game && members) {
      // Tournament team creation (user-accessible)
      if (!name || !game) {
        return res.status(400).json({ error: 'Team name and game are required' });
      }

      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'At least one team member is required' });
      }

      // Check for duplicate gameIds in team members
      const gameIds = members
        .map(m => m.gameId?.trim().toUpperCase())
        .filter(id => id && id !== '');
      
      const uniqueGameIds = new Set(gameIds);
      if (gameIds.length !== uniqueGameIds.size) {
        return res.status(400).json({ error: 'Duplicate game IDs are not allowed in a team. Each player must have a unique game ID.' });
      }

      // Validate all members have required fields
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (!member.name || !member.name.trim()) {
          return res.status(400).json({ error: `Member ${i + 1}: Name is required` });
        }
        if (!member.gameId || !member.gameId.trim()) {
          return res.status(400).json({ error: `Member ${i + 1}: Game ID is required` });
        }
      }

      // Check if user already has an active team
      const existingTeam = await Team.findOne({
        captain: req.user._id,
        status: 'active'
      });

      if (existingTeam) {
        return res.status(400).json({ error: 'You already have an active team. Please delete or deactivate your existing team before creating a new one.' });
      }

      // Create tournament team
      const teamLeaderIndex = teamLeader || 0;
      const teamMembers = members.map((member, index) => ({
        name: member.name.trim(),
        gameId: member.gameId.trim().toUpperCase(),
        phoneNumber: index === teamLeaderIndex ? (member.phoneNumber || '').trim() : '',
        userId: index === teamLeaderIndex ? req.user._id : null
      }));

      const team = new Team({
        name: name.trim(),
        game: game,
        captain: req.user._id,
        members: teamMembers,
        status: 'active'
      });

      await team.save();
      res.status(201).json(team);
    } else {
      // Admin team member creation (for "About Us" page) - requires admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      if (!name || !position) {
        return res.status(400).json({ error: 'Name and position are required' });
      }

      const teamMember = new Team({
        name,
        position,
        description: description || '',
        socialLinks: socialLinks || [],
        image: image || '',
        order: order || 0
      });

      await teamMember.save();
      res.status(201).json(teamMember);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update team member or tournament team
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, position, description, socialLinks, image, isActive, order, game, members, teamLeader } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if this is a tournament team (has game/members) or "About Us" team member (has position)
    if (game && members) {
      // Tournament team update
      // Check if user is the captain of this team
      if (team.captain.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only edit your own team.' });
      }

      if (!name || !game) {
        return res.status(400).json({ error: 'Team name and game are required' });
      }

      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'At least one team member is required' });
      }

      // Check for duplicate gameIds in team members
      const gameIds = members
        .map(m => m.gameId?.trim().toUpperCase())
        .filter(id => id && id !== '');
      
      const uniqueGameIds = new Set(gameIds);
      if (gameIds.length !== uniqueGameIds.size) {
        return res.status(400).json({ error: 'Duplicate game IDs are not allowed in a team. Each player must have a unique game ID.' });
      }

      // Validate all members have required fields
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (!member.name || !member.name.trim()) {
          return res.status(400).json({ error: `Member ${i + 1}: Name is required` });
        }
        if (!member.gameId || !member.gameId.trim()) {
          return res.status(400).json({ error: `Member ${i + 1}: Game ID is required` });
        }
      }

      // Update tournament team
      const teamLeaderIndex = teamLeader || 0;
      
      // Create maps to preserve userIds for invited users
      // Map 1: by gameId (primary matching)
      const existingMembersByGameId = new Map();
      // Map 2: by userId (to track all invited users)
      const existingMembersByUserId = new Map();
      // Map 3: by name + gameId combination (fallback matching)
      const existingMembersByNameGameId = new Map();
      
      team.members.forEach(member => {
        if (member.gameId) {
          const gameIdUpper = member.gameId.toUpperCase();
          existingMembersByGameId.set(gameIdUpper, member);
          
          // Track by userId for invited users (not captain)
          if (member.userId && member.userId.toString() !== req.user._id.toString()) {
            existingMembersByUserId.set(member.userId.toString(), member);
          }
          
          // Track by name+gameId combination for better matching
          const nameGameIdKey = `${(member.name || '').trim().toUpperCase()}_${gameIdUpper}`;
          existingMembersByNameGameId.set(nameGameIdKey, member);
        }
      });

      // Track which userIds we've already assigned to preserve uniqueness
      const usedUserIds = new Set();
      
      // Pre-fetch User data for gameId lookups (for Strategy 3)
      const User = require('../models/User');
      const gameIdToUserMap = new Map();
      const newMemberGameIds = [...new Set(members.map(m => m.gameId?.trim().toUpperCase()).filter(Boolean))];
      try {
        const usersWithGameIds = await User.find({ 
          gameId: { $in: newMemberGameIds },
          _id: { $ne: req.user._id } // Exclude captain
        });
        usersWithGameIds.forEach(user => {
          if (user.gameId) {
            gameIdToUserMap.set(user.gameId.toUpperCase(), user);
          }
        });
      } catch (err) {
        console.error('Error fetching users by gameId:', err);
      }
      
      // Build new members array, preserving userIds from existing members
      const teamMembers = members.map((member, index) => {
        const gameIdUpper = member.gameId.trim().toUpperCase();
        const memberNameUpper = member.name.trim().toUpperCase();
        
        // Team leader always gets the captain's userId
        if (index === teamLeaderIndex) {
          return {
            name: member.name.trim(),
            gameId: gameIdUpper,
            phoneNumber: (member.phoneNumber || '').trim(),
            email: team.members[0]?.email || '',
            userId: req.user._id
          };
        }
        
        // For non-leader members, try to preserve userId
        let userId = null;
        let email = '';
        
        // Strategy 1: Match by gameId (most reliable)
        const existingByGameId = existingMembersByGameId.get(gameIdUpper);
        if (existingByGameId && existingByGameId.userId) {
          const existingUserIdStr = existingByGameId.userId.toString();
          // Only use if not already assigned and not the captain
          if (!usedUserIds.has(existingUserIdStr) && existingUserIdStr !== req.user._id.toString()) {
            userId = existingByGameId.userId;
            email = existingByGameId.email || '';
            usedUserIds.add(existingUserIdStr);
          }
        }
        
        // Strategy 2: If gameId match didn't work, try matching by name+gameId combination
        if (!userId) {
          const nameGameIdKey = `${memberNameUpper}_${gameIdUpper}`;
          const existingByNameGameId = existingMembersByNameGameId.get(nameGameIdKey);
          if (existingByNameGameId && existingByNameGameId.userId) {
            const existingUserIdStr = existingByNameGameId.userId.toString();
            if (!usedUserIds.has(existingUserIdStr) && existingUserIdStr !== req.user._id.toString()) {
              userId = existingByNameGameId.userId;
              email = existingByNameGameId.email || '';
              usedUserIds.add(existingUserIdStr);
            }
          }
        }
        
        // Strategy 3: If still no match, try to find by gameId in User collection
        // This handles cases where gameId was changed but user still exists
        if (!userId) {
          const userWithGameId = gameIdToUserMap.get(gameIdUpper);
          if (userWithGameId) {
            const userWithGameIdStr = userWithGameId._id.toString();
            // Check if this user is an existing invited member
            if (existingMembersByUserId.has(userWithGameIdStr) && !usedUserIds.has(userWithGameIdStr)) {
              const existingMember = existingMembersByUserId.get(userWithGameIdStr);
              userId = userWithGameId._id;
              email = existingMember.email || userWithGameId.email || '';
              usedUserIds.add(userWithGameIdStr);
            }
          }
        }
        
        return {
          name: member.name.trim(),
          gameId: gameIdUpper,
          phoneNumber: '',
          email: email,
          userId: userId
        };
      });

      // Find all invited users (members with userId who are not the captain) from current team
      const currentInvitedUserIds = team.members
        .filter(member => {
          const memberUserId = member.userId?.toString();
          return memberUserId && memberUserId !== req.user._id.toString();
        })
        .map(member => member.userId?.toString())
        .filter(id => id);

      // Get user IDs from new members (excluding captain)
      const newMemberUserIds = teamMembers
        .map((m, idx) => idx === teamLeaderIndex ? null : m.userId)
        .filter(id => id !== null)
        .map(id => id?.toString());

      // Find invited users who are being removed (not in new members list)
      const removedInvitedUserIds = currentInvitedUserIds.filter(
        userId => !newMemberUserIds.includes(userId)
      );

      // Cancel/expire pending invitations for removed invited users
      if (removedInvitedUserIds.length > 0) {
        const TeamInvitation = require('../models/TeamInvitation');
        await TeamInvitation.updateMany(
          {
            teamId: team._id,
            invitedUser: { $in: removedInvitedUserIds },
            status: { $in: ['pending', 'accepted'] }
          },
          {
            status: 'expired'
          }
        );
      }

      team.name = name.trim();
      team.game = game;
      team.members = teamMembers;

      await team.save();
      res.json(team);
    } else {
      // "About Us" team member update - requires admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      if (name) team.name = name;
      if (position) team.position = position;
      if (description !== undefined) team.description = description;
      if (socialLinks !== undefined) team.socialLinks = socialLinks;
      if (image !== undefined) team.image = image;
      if (isActive !== undefined) team.isActive = isActive;
      if (order !== undefined) team.order = order;

      await team.save();
      res.json(team);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete team member or tournament team
// Admin/co-admin can delete any team, users can delete their own teams
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is admin/co-admin OR if user is the captain of this team
    const isAdmin = req.user.role === 'admin' || req.user.role === 'co-admin';
    const isCaptain = team.captain && team.captain.toString() === req.user._id.toString();
    
    // For "About Us" team members (have position field), only admin can delete
    if (team.position) {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Access denied. Only admins can delete team members.' });
      }
    } else {
      // For tournament teams, allow deletion if user is admin or captain
      if (!isAdmin && !isCaptain) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own team.' });
      }
    }
    
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: team.position ? 'Team member deleted successfully' : 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite/Add member to tournament team by name and game ID
router.post('/:id/invite-member', auth, async (req, res) => {
  try {
    const { name, gameId } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if this is a tournament team
    if (!team.game || team.position) {
      return res.status(400).json({ error: 'This endpoint is only for tournament teams' });
    }

    // Check if user is the captain
    if (!team.captain || team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. Only the team captain can invite members.' });
    }

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!gameId || !gameId.trim()) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Check if team is full
    if (team.members.length >= 4) {
      return res.status(400).json({ error: 'Team is full. Maximum 4 members allowed.' });
    }

    // Check for duplicate game ID (case-insensitive)
    const gameIdUpper = gameId.trim().toUpperCase();
    const duplicateGameId = team.members.some(
      member => member.gameId && member.gameId.toUpperCase() === gameIdUpper
    );
    if (duplicateGameId) {
      return res.status(400).json({ error: 'A member with this Game ID already exists in the team.' });
    }

    // Try to find user by game ID
    const User = require('../models/User');
    const invitedUser = await User.findOne({ gameId: gameIdUpper });

    // Add member to team
    const newMember = {
      name: name.trim(),
      gameId: gameIdUpper,
      email: invitedUser ? invitedUser.email : '',
      userId: invitedUser ? invitedUser._id : null
    };

    team.members.push(newMember);
    await team.save();

    // Populate the team before returning
    await team.populate('captain', 'name email');

    res.json({ 
      message: 'Member added to team successfully', 
      team 
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Terminate tournament team (admin only)
router.put('/:id/terminate', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { terminationReason } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if it's a tournament team
    if (team.position) {
      return res.status(400).json({ error: 'Cannot terminate "About Us" team members. Use delete instead.' });
    }

    if (!terminationReason || !terminationReason.trim()) {
      return res.status(400).json({ error: 'Termination reason is required' });
    }

    team.isTerminated = true;
    team.terminationReason = terminationReason.trim();
    team.status = 'inactive';
    await team.save();

    res.json({ message: 'Team terminated successfully', team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unt terminate tournament team (admin only)
router.put('/:id/unterminate', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if it's a tournament team
    if (team.position) {
      return res.status(400).json({ error: 'Cannot unterminate "About Us" team members.' });
    }

    team.isTerminated = false;
    team.terminationReason = null;
    team.status = 'active'; // Reactivate the team
    await team.save();

    res.json({ message: 'Team termination removed successfully. Team is now active.', team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave team (remove user from team)
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if it's a tournament team
    if (team.position) {
      return res.status(400).json({ error: 'This endpoint is only for tournament teams' });
    }

    // Check if user is the captain
    if (team.captain && team.captain.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Team leader cannot leave the team. Please delete the team or transfer leadership first.' });
    }

    // Find the member with the user's ID
    const memberIndex = team.members.findIndex(
      member => member.userId && member.userId.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'You are not a member of this team' });
    }

    // Remove the member from the team
    team.members.splice(memberIndex, 1);
    await team.save();

    // Update team invitation status if exists
    const TeamInvitation = require('../models/TeamInvitation');
    await TeamInvitation.updateMany(
      { 
        team: team._id, 
        invitedUser: req.user._id,
        status: { $in: ['pending', 'accepted'] }
      },
      { status: 'expired' }
    );

    res.json({ message: 'You have successfully left the team', team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match result (Admin only)
router.put('/:id/match-result', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { matchResult } = req.body;
    
    if (!matchResult || !['pending', 'win', 'loss'].includes(matchResult)) {
      return res.status(400).json({ error: 'Valid match result is required (pending, win, or loss)' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if it's a tournament team
    if (team.position) {
      return res.status(400).json({ error: 'This endpoint is only for tournament teams' });
    }

    // Update match result
    team.matchResult = matchResult;
    await team.save();

    // If team won, send congratulations notification to all team members
    if (matchResult === 'win') {
      const Notification = require('../models/Notification');
      const teamMemberUserIds = team.members
        .filter(member => member.userId)
        .map(member => member.userId.toString());

      // Also include captain if not already in members
      if (team.captain) {
        const captainId = team.captain.toString();
        if (!teamMemberUserIds.includes(captainId)) {
          teamMemberUserIds.push(captainId);
        }
      }

      // Create notifications for each team member
      const notificationPromises = teamMemberUserIds.map(userId => {
        return Notification.create({
          title: '🎉 Congratulations! You Won the Match!',
          message: `Congratulations! Your team "${team.name}" has won the match. Great job and keep up the excellent performance!`,
          type: 'success',
          target: 'user',
          targetUserId: userId,
          isActive: true,
          createdBy: req.user._id
        });
      });

      await Promise.all(notificationPromises);
    }

    res.json({ message: 'Match result updated successfully', team });
  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
