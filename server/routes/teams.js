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
router.get('/all', auth, authorize('admin'), async (req, res) => {
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
      const teamMembers = members.map((member, index) => ({
        name: member.name.trim(),
        gameId: member.gameId.trim().toUpperCase(),
        phoneNumber: index === teamLeaderIndex ? (member.phoneNumber || '').trim() : '',
        userId: index === teamLeaderIndex ? req.user._id : null
      }));

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

// Delete team member or tournament team (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: team.position ? 'Team member deleted successfully' : 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Terminate tournament team (admin only)
router.put('/:id/terminate', auth, authorize('admin'), async (req, res) => {
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
router.put('/:id/unterminate', auth, authorize('admin'), async (req, res) => {
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

module.exports = router;
