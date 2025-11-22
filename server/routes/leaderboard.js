const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const Team = require('../models/Team');
const { auth, authorize } = require('../middleware/auth');

// Get top teams leaderboard
router.get('/top-teams', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const teams = await Team.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'leaderboards',
          localField: '_id',
          foreignField: 'teamId',
          as: 'leaderboardData'
        }
      },
      {
        $addFields: {
          totalWins: { $sum: '$leaderboardData.wins' },
          totalEarnings: { $sum: '$leaderboardData.earnings' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          game: 1,
          totalWins: 1,
          totalEarnings: 1,
          members: 1
        }
      }
    ]);

    // Format response
    const formattedTeams = teams.map((team, index) => ({
      rank: index + 1,
      teamName: team.name,
      game: team.game,
      wins: team.totalWins || 0,
      earnings: team.totalEarnings || 0,
      members: team.members.length
    }));

    res.json(formattedTeams);
  } catch (error) {
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
      .populate('teamId', 'name game')
      .populate('tournamentId', 'name date')
      .sort({ updatedAt: -1 });
    res.json(leaderboards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create/Update leaderboard entry
router.post('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const { teamId, tournamentId, rank, wins, kills, earnings, kdRatio, game } = req.body;

    const leaderboard = await Leaderboard.findOneAndUpdate(
      { teamId, tournamentId },
      {
        rank,
        wins: wins || 0,
        kills: kills || 0,
        earnings: earnings || 0,
        kdRatio: kdRatio || 0,
        game,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

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
