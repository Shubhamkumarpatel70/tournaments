const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, members, game, teamLeader } = req.body;

    // Validate members
    if (!members || !Array.isArray(members) || members.length < 1 || members.length > 4) {
      return res.status(400).json({ error: 'Team must have between 1 and 4 members' });
    }

    // Validate each member has required fields
    for (const member of members) {
      if (!member.name || !member.gameId) {
        return res.status(400).json({ error: 'All team members must have name and gameId' });
      }
    }
    
    // Validate team leader has phone number
    const leaderIndex = teamLeader !== undefined ? parseInt(teamLeader) : 0;
    if (leaderIndex < 0 || leaderIndex >= members.length) {
      return res.status(400).json({ error: 'Invalid team leader index' });
    }

    // Check if user already has an active team
    const existingTeam = await Team.findOne({ 
      captain: req.user._id, 
      status: 'active' 
    });
    
    if (existingTeam) {
      return res.status(400).json({ error: 'You already have an active team' });
    }

    // Create team with captain as first member
    const team = new Team({
      name,
      captain: req.user._id,
      teamLeader: leaderIndex,
      members,
      game
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all teams (for admin)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    const teams = await Team.find()
      .select('name game status')
      .sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's teams
router.get('/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({ captain: req.user._id })
      .populate('captain', 'name email')
      .populate('tournaments.tournamentId', 'name date prizePool')
      .sort({ createdAt: -1 });
    
    // Sort to show active teams first
    const sortedTeams = teams.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return 0;
    });
    
    res.json(sortedTeams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single team
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email')
      .populate('tournaments.tournamentId', 'name date prizePool');
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Only captain can update team
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only team captain can update the team' });
    }

    const { name, members, game, teamLeader } = req.body;

    if (members) {
      if (!Array.isArray(members) || members.length < 1 || members.length > 4) {
        return res.status(400).json({ error: 'Team must have between 1 and 4 members' });
      }

      for (const member of members) {
        if (!member.name || !member.gameId) {
          return res.status(400).json({ error: 'All team members must have name and gameId' });
        }
      }
      
      // Validate team leader has phone number if teamLeader is being updated
      if (teamLeader !== undefined) {
        const leaderIndex = parseInt(teamLeader);
        if (leaderIndex >= 0 && leaderIndex < members.length) {
          if (!members[leaderIndex].phoneNumber || !members[leaderIndex].phoneNumber.trim()) {
            return res.status(400).json({ error: 'Team leader must have a phone number' });
          }
        }
      } else {
        // If teamLeader not provided, check existing team leader
        const leaderIndex = team.teamLeader || 0;
        if (leaderIndex >= 0 && leaderIndex < members.length) {
          if (!members[leaderIndex].phoneNumber || !members[leaderIndex].phoneNumber.trim()) {
            return res.status(400).json({ error: 'Team leader must have a phone number' });
          }
        }
      }
    }

    if (name) team.name = name;
    if (members) team.members = members;
    if (game) team.game = game;
    if (teamLeader !== undefined) {
      const leaderIndex = parseInt(teamLeader);
      if (leaderIndex >= 0 && leaderIndex < (members?.length || team.members.length)) {
        team.teamLeader = leaderIndex;
      }
    }
    
    team.updatedAt = Date.now();
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Only captain can delete team
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only team captain can delete the team' });
    }

    // Actually delete the team from database
    await Team.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

