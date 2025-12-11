const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { auth, authorize } = require('../middleware/auth');

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { game, status, sortBy, featured } = req.query;
    let query = {};

    if (game && game !== 'all') {
      query.game = game;
    }

    if (status) {
      query.status = status;
    }

    let sort = {};
    if (sortBy === 'popular') {
      sort = { registeredTeams: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'prize') {
      sort = { prizePool: -1 };
    } else {
      sort = { matchDate: 1 }; // Default: sort by match date
    }

    let tournaments = await Tournament.find(query).sort(sort);

    // If featured, return only featured tournaments
    if (featured === 'true') {
      tournaments = tournaments.filter(t => {
        if (!t.featured) return false;
        if (t.status !== 'upcoming' && t.status !== 'ongoing') return false;
        const matchDate = new Date(t.matchDate || t.date);
        return matchDate > new Date();
      });
      tournaments.sort((a, b) => (b.prizePool || 0) - (a.prizePool || 0));
      tournaments = tournaments.slice(0, 6);
    }

    // Check if user has joined any tournaments (if authenticated)
    let joinedTournamentIds = [];
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          const TournamentRegistration = require('../models/TournamentRegistration');
          const userRegistrations = await TournamentRegistration.find({
            registeredBy: user._id,
            status: { $in: ['pending', 'approved'] }
          }).select('tournamentId');
          joinedTournamentIds = userRegistrations.map(reg => reg.tournamentId.toString());
        }
      }
    } catch (error) {
      // If token is invalid or user not found, just continue without joined status
    }

    // Add joined status to tournaments
    const tournamentsWithJoinedStatus = tournaments.map(tournament => {
      const tournamentObj = tournament.toObject();
      tournamentObj.isJoined = joinedTournamentIds.includes(tournament._id.toString());
      return tournamentObj;
    });

    res.json(tournamentsWithJoinedStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tournament
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    // Check if user has joined this tournament (if authenticated)
    let isJoined = false;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const TournamentRegistration = require('../models/TournamentRegistration');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          const userRegistration = await TournamentRegistration.findOne({
            tournamentId: tournament._id,
            registeredBy: user._id,
            status: { $in: ['pending', 'approved'] }
          });
          isJoined = !!userRegistration;
        }
      }
    } catch (error) {
      // If token is invalid or user not found, just continue without joined status
    }
    
    const tournamentObj = tournament.toObject();
    tournamentObj.isJoined = isJoined;
    res.json(tournamentObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to parse date from various formats
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // If it's already a Date object, return it
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Check if it's already in ISO format (YYYY-MM-DD or ISO string)
  if (typeof dateString === 'string') {
    // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateString);
    }
    
    // Parse DD-MM-YY format
    if (dateString.match(/^\d{2}-\d{2}-\d{2}$/)) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        let year = parseInt(parts[2], 10);
        // Handle 2-digit year
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }
        const date = new Date(year, month, day);
        // Validate the date
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${dateString}`);
        }
        return date;
      }
    }
    
    // Try parsing as standard date string
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  throw new Error(`Invalid date format: ${dateString}`);
};

// Create tournament (admin only)
router.post('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, game, tournamentType, mode, date, matchDate, registrationDeadline, entryFee, prizePool, playerSpots, maxTeams, description, rules } = req.body;

    if (!name || !game || !tournamentType || !mode || !date || !matchDate || !registrationDeadline || !entryFee || !prizePool || !playerSpots || !maxTeams) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const parsedMatchDate = parseDate(matchDate);
    const parsedRegistrationDeadline = parseDate(registrationDeadline);
    
    // Validate registration deadline is before match date (allowing same date but time must be before)
    if (parsedRegistrationDeadline >= parsedMatchDate) {
      return res.status(400).json({ error: 'Registration deadline must be before match start time' });
    }

    const tournament = new Tournament({
      name,
      game,
      tournamentType,
      mode,
      date: parseDate(date),
      matchDate: parsedMatchDate,
      registrationDeadline: parsedRegistrationDeadline,
      entryFee,
      prizePool,
      originalPrizePool: prizePool, // Store original prize pool set by admin
      playerSpots,
      maxTeams,
      description: description || '',
      rules: rules || [],
      featured: req.body.featured || false
    });
    
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete tournament (Admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tournament
router.put('/:id', async (req, res) => {
  try {
    const updateData = { updatedAt: Date.now() };
    
    // Only include fields that are actually being updated
    const allowedFields = ['name', 'game', 'tournamentType', 'mode', 'date', 'matchDate', 
                          'registrationDeadline', 'entryFee', 'prizePool', 'playerSpots', 
                          'maxTeams', 'description', 'rules', 'featured', 'status'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    });
    
    // Parse dates if they are provided
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = parseDate(updateData.date);
    }
    if (updateData.matchDate && typeof updateData.matchDate === 'string') {
      updateData.matchDate = parseDate(updateData.matchDate);
    }
    if (updateData.registrationDeadline && typeof updateData.registrationDeadline === 'string') {
      updateData.registrationDeadline = parseDate(updateData.registrationDeadline);
    }
    
    // Validate registration deadline is before match date
    // Get existing tournament to compare if only one date is being updated
    const existingTournament = await Tournament.findById(req.params.id);
    if (!existingTournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    // Set originalPrizePool if it doesn't exist (for existing tournaments)
    if (!existingTournament.originalPrizePool) {
      updateData.originalPrizePool = existingTournament.prizePool;
    }
    
    // If entryFee is being updated, we need to recalculate prize pool after update
    const entryFeeChanged = updateData.entryFee !== undefined && updateData.entryFee !== existingTournament.entryFee;
    
    // Don't allow manual prizePool updates - it's auto-calculated
    if (updateData.prizePool !== undefined) {
      delete updateData.prizePool;
    }
    
    const finalMatchDate = updateData.matchDate || existingTournament.matchDate;
    const finalRegistrationDeadline = updateData.registrationDeadline || existingTournament.registrationDeadline;
    
    if (finalRegistrationDeadline && finalMatchDate) {
      if (finalRegistrationDeadline >= finalMatchDate) {
        return res.status(400).json({ error: 'Registration deadline must be before match start time' });
      }
    }
    
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    // If entryFee changed, recalculate prize pool
    if (entryFeeChanged) {
      const TournamentRegistration = require('../models/TournamentRegistration');
      const approvedRegistrations = await TournamentRegistration.find({
        tournamentId: tournament._id,
        status: 'approved'
      });
      const totalPlayersJoined = approvedRegistrations.reduce((sum, reg) => sum + (reg.numberOfPlayers || 0), 0);
      const updatedPrizePool = tournament.entryFee * totalPlayersJoined;
      await Tournament.findByIdAndUpdate(tournament._id, { prizePool: updatedPrizePool });
      // Reload tournament to get updated prize pool
      const updatedTournament = await Tournament.findById(tournament._id);
      return res.json(updatedTournament);
    }
    
    res.json(tournament);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Register for tournament
router.post('/:id/register', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.registeredTeams >= tournament.maxTeams) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    tournament.registeredTeams += 1;
    await tournament.save();
    res.json({ message: 'Registration successful', tournament });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

