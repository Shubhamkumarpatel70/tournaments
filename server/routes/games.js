const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { auth, authorize } = require('../middleware/auth');

// Get all active games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ name: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all games (Admin only)
router.get('/all', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const games = await Game.find().sort({ name: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create game (Admin only)
router.post('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, icon, isActive } = req.body;

    const game = new Game({
      name,
      icon: icon || '',
      isActive: isActive !== undefined ? isActive : true
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update game (Admin only)
router.put('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete game (Admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

