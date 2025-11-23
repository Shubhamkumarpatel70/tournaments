const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');
const Team = require('../models/Team');
const { auth, authorize } = require('../middleware/auth');

// Get available games from leaderboard
router.get('/games', async (req, res) => {
  try {
    const games = await Leaderboard.distinct('game');
    res.json(games.filter(game => game && game.trim() !== ''));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top teams leaderboard
router.get('/top-teams', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get all leaderboard entries with populated team data
    const leaderboardEntries = await Leaderboard.find()
      .populate({
        path: 'teamId',
        select: 'name game members status',
        model: 'Team'
      })
      .populate({
        path: 'tournamentId',
        select: 'name game',
        model: 'Tournament'
      })
      .sort({ earnings: -1, rank: 1 });

    // Group by team and aggregate stats across all tournaments
    const teamStats = {};
    const Team = require('../models/Team');
    
    for (const entry of leaderboardEntries) {
      // Skip if entry has no valid data
      if (!entry) continue;
      
      // Handle entries with or without populated teamId
      let teamId, teamName, teamGame, teamMembers;
      
      if (entry.teamId && typeof entry.teamId === 'object' && entry.teamId._id) {
        // Team is populated as object
        // Only skip if team status is explicitly inactive or disbanded (not undefined/null)
        const teamStatus = entry.teamId.status;
        if (teamStatus && teamStatus !== 'active' && (teamStatus === 'inactive' || teamStatus === 'disbanded')) {
          continue; // Skip inactive/disbanded teams
        }
        
        teamId = entry.teamId._id.toString();
        teamName = entry.teamId.name || entry.teamName || 'Unknown Team';
        teamGame = entry.teamId.game || entry.game || entry.tournamentId?.game || 'N/A';
        teamMembers = entry.teamId.members?.length || 0;
      } else if (entry.teamId && typeof entry.teamId === 'string') {
        // TeamId is just a string (not populated) - try to populate it
        teamId = entry.teamId;
        // Try to find the team to get its name
        const team = await Team.findById(entry.teamId).select('name game members status').lean();
        if (team) {
          if (team.status && team.status !== 'active' && (team.status === 'inactive' || team.status === 'disbanded')) {
            continue; // Skip inactive/disbanded teams
          }
          teamName = team.name || entry.teamName || 'Unknown Team';
          teamGame = team.game || entry.game || entry.tournamentId?.game || 'N/A';
          teamMembers = team.members?.length || 0;
        } else {
          teamName = 'Unknown Team';
          teamGame = entry.game || entry.tournamentId?.game || 'N/A';
          teamMembers = 0;
        }
      } else {
        // No teamId - this might be a placeholder team entry
        // Check if entry has teamName stored directly
        if (entry.teamName && entry.teamName.trim() !== '') {
          // Use teamName from entry and create a unique ID based on teamName
          teamId = `team_${entry.teamName.trim().toLowerCase().replace(/\s+/g, '_')}`;
          teamName = entry.teamName.trim();
          teamGame = entry.game || entry.tournamentId?.game || 'N/A';
          teamMembers = 0;
        } else if (entry._id) {
          // Use entry ID as teamId for placeholder teams
          teamId = entry._id.toString();
          teamName = 'Unknown Team';
          teamGame = entry.game || entry.tournamentId?.game || 'N/A';
          teamMembers = 0;
        } else {
          continue; // Skip if no valid identifier
        }
      }
      
      // Initialize team stats if not exists
      if (!teamStats[teamId]) {
        teamStats[teamId] = {
          _id: entry.teamId?._id || entry.teamId || teamId,
          teamName: teamName,
          game: teamGame,
          earnings: 0,
          members: teamMembers,
          tournaments: [] // Store tournament info
        };
      }
      
      // Aggregate earnings (ensure they're numbers)
      const earnings = typeof entry.earnings === 'number' ? entry.earnings : (parseInt(entry.earnings) || 0);
      
      teamStats[teamId].earnings += earnings;
      
      // Store tournament info (keep track of all tournaments for this team)
      let tournamentName = 'Unknown Tournament';
      if (entry.tournamentId) {
        if (typeof entry.tournamentId === 'object' && entry.tournamentId.name) {
          tournamentName = entry.tournamentId.name;
        } else if (typeof entry.tournamentId === 'string') {
          // Tournament ID is a string, try to populate it
          const Tournament = require('../models/Tournament');
          const tournament = await Tournament.findById(entry.tournamentId).select('name').lean();
          if (tournament && tournament.name) {
            tournamentName = tournament.name;
          }
        }
      }
      
      // Add tournament if not already in the list
      const existingTournament = teamStats[teamId].tournaments.find(t => t.name === tournamentName);
      if (existingTournament) {
        // Update earnings for this tournament
        existingTournament.earnings += earnings;
      } else {
        teamStats[teamId].tournaments.push({
          name: tournamentName,
          earnings: earnings
        });
      }
    }

    // Convert to array and sort by earnings
    const teams = Object.values(teamStats)
      .filter(team => team.teamName && team.teamName.trim() !== '' && team.teamName !== 'Unknown Team') // Filter out completely invalid entries
      .sort((a, b) => {
        // Sort by earnings
        return b.earnings - a.earnings;
      })
      .map((team, index) => {
        // Get the tournament with highest earnings, or first one if multiple
        let tournamentName = 'N/A';
        if (team.tournaments && team.tournaments.length > 0) {
          // Get tournament with highest earnings
          const topTournament = team.tournaments.reduce((prev, current) => 
            (current.earnings > prev.earnings) ? current : prev
          );
          tournamentName = topTournament.name;
          
          // If multiple tournaments, show count
          if (team.tournaments.length > 1) {
            tournamentName += ` (+${team.tournaments.length - 1} more)`;
          }
        }
        
        return {
          rank: index + 1,
          teamName: team.teamName,
          game: team.game,
          earnings: team.earnings || 0,
          tournamentName: tournamentName,
          allTournaments: team.tournaments || [],
          members: team.members,
          _id: team._id
        };
      })
      .slice(0, limit);

    res.json(teams);
  } catch (error) {
    console.error('Error in /top-teams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard for specific tournament
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ tournamentId: req.params.tournamentId })
      .populate('teamId', 'name members game')
      .sort({ rank: 1 });
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Manage leaderboard
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const leaderboards = await Leaderboard.find()
      .populate({
        path: 'teamId',
        select: 'name game status members',
        model: 'Team'
      })
      .populate({
        path: 'tournamentId',
        select: 'name date game',
        model: 'Tournament'
      })
      .sort({ updatedAt: -1 });
    
    // Ensure team names and tournament names are properly populated
    const leaderboardsWithNames = leaderboards.map(entry => {
      const entryObj = entry.toObject();
      
      // If teamId is not populated or name is missing, try to find the team
      if (!entryObj.teamId || (entryObj.teamId && !entryObj.teamId.name)) {
        // Team might not exist or be deleted, keep the reference but mark as missing
        if (entryObj.teamId && typeof entryObj.teamId === 'object' && entryObj.teamId._id) {
          // Team exists but name is missing - this shouldn't happen, but handle it
          entryObj.teamId = {
            _id: entryObj.teamId._id,
            name: entryObj.teamName || 'Unknown Team',
            game: entryObj.game || entryObj.tournamentId?.game || 'N/A'
          };
        } else if (entryObj.teamId && typeof entryObj.teamId === 'string') {
          // TeamId is just a string (not populated) - try to find it
          entryObj.teamId = {
            _id: entryObj.teamId,
            name: entryObj.teamName || 'Unknown Team',
            game: entryObj.game || entryObj.tournamentId?.game || 'N/A'
          };
        }
      }
      
      // Ensure tournamentId is properly populated with name
      if (entryObj.tournamentId) {
        if (typeof entryObj.tournamentId === 'string') {
          // TournamentId is just a string (not populated) - need to populate it
          const Tournament = require('../models/Tournament');
          // Note: We can't await here in map, so we'll handle this on the frontend
          // But we should ensure the populate worked correctly
        } else if (typeof entryObj.tournamentId === 'object') {
          // Ensure tournament has a name field
          if (!entryObj.tournamentId.name && entryObj.tournamentId._id) {
            // Tournament exists but name is missing - shouldn't happen if populate worked
            entryObj.tournamentId.name = 'Unknown Tournament';
          }
        }
      }
      
      return entryObj;
    });
    
    res.json(leaderboardsWithNames);
  } catch (error) {
    console.error('Error fetching admin leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create/Update leaderboard entry
router.post('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const { teamId, teamName, tournamentId, rank, wins, kills, earnings, kdRatio, game } = req.body;

    // Validate required fields
    if (!tournamentId) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    let finalTeamId = null;

    // If teamId is provided and valid (not empty string), use it
    if (teamId && typeof teamId === 'string' && teamId.trim() !== '' && mongoose.Types.ObjectId.isValid(teamId.trim())) {
      finalTeamId = teamId.trim();
    } else {
      // If teamName is provided, try to find the team from tournament registrations first
      const TournamentRegistration = require('../models/TournamentRegistration');
      const registration = await TournamentRegistration.findOne({
        tournamentId: tournamentId,
        teamName: teamName.trim(),
        status: 'approved'
      }).populate('teamId');

      if (registration && registration.teamId) {
        finalTeamId = registration.teamId._id || registration.teamId;
      } else {
        // Try to find team by name
        let team = await Team.findOne({ name: teamName.trim() });
        
        // If team not found, create a placeholder team
        if (!team) {
          team = new Team({
            name: teamName.trim(),
            captain: req.user._id,
            members: [{ name: 'Placeholder', gameId: 'N/A' }],
            game: game || 'BGMI',
            status: 'active'
          });
          await team.save();
        }
        finalTeamId = team._id;
      }
    }

    // Validate finalTeamId
    if (!finalTeamId) {
      return res.status(400).json({ error: 'Could not find or create team' });
    }

    if (!mongoose.Types.ObjectId.isValid(finalTeamId)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    const leaderboard = await Leaderboard.findOneAndUpdate(
      { teamId: finalTeamId, tournamentId },
      {
        teamId: finalTeamId,
        teamName: teamName.trim(), // Store team name for reference
        rank,
        wins: wins || 0,
        kills: kills || 0,
        earnings: earnings || 0,
        kdRatio: kdRatio || 0,
        game,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    )
    .populate({
      path: 'teamId',
      select: 'name game',
      model: 'Team'
    })
    .populate({
      path: 'tournamentId',
      select: 'name date game',
      model: 'Tournament'
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Delete leaderboard entry
router.delete('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const leaderboard = await Leaderboard.findByIdAndDelete(req.params.id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard entry not found' });
    }
    res.json({ message: 'Leaderboard entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
