const express = require('express');
const router = express.Router();
const TournamentType = require('../models/TournamentType');
const { auth, authorize } = require('../middleware/auth');

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Tournament types route is working' });
});

// Get all tournament types
router.get('/', async (req, res) => {
  try {
    const { game } = req.query;
    const query = game ? { game, isActive: true } : { isActive: true };
    const tournamentTypes = await TournamentType.find(query).sort({ name: 1 });
    res.json(tournamentTypes || []);
  } catch (error) {
    console.error('Error fetching tournament types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tournament types (Admin - includes inactive)
router.get('/admin', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const tournamentTypes = await TournamentType.find().sort({ game: 1, name: 1 });
    res.json(tournamentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tournament type (Admin only)
router.post('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, game, description } = req.body;

    if (!name || !game) {
      return res.status(400).json({ error: 'Name and game are required' });
    }

    // Check if tournament type already exists
    const existing = await TournamentType.findOne({ name: name.trim(), game: game.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Tournament type already exists for this game' });
    }

    const tournamentType = new TournamentType({
      name: name.trim(),
      game: game.trim(),
      description: description || '',
      isActive: true
    });

    await tournamentType.save();
    res.status(201).json(tournamentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update tournament type (Admin only)
router.put('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, game, description, isActive } = req.body;
    const tournamentType = await TournamentType.findById(req.params.id);

    if (!tournamentType) {
      return res.status(404).json({ error: 'Tournament type not found' });
    }

    if (name) tournamentType.name = name.trim();
    if (game) tournamentType.game = game.trim();
    if (description !== undefined) tournamentType.description = description;
    if (isActive !== undefined) tournamentType.isActive = isActive;

    tournamentType.updatedAt = Date.now();
    await tournamentType.save();

    res.json(tournamentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete tournament type (Admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const tournamentType = await TournamentType.findByIdAndDelete(req.params.id);
    if (!tournamentType) {
      return res.status(404).json({ error: 'Tournament type not found' });
    }
    res.json({ message: 'Tournament type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

