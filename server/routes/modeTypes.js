const express = require('express');
const router = express.Router();
const ModeType = require('../models/ModeType');
const { auth, authorize } = require('../middleware/auth');

// Get all mode types
router.get('/', async (req, res) => {
  try {
    const { game } = req.query;
    const query = game ? { game, isActive: true } : { isActive: true };
    const modeTypes = await ModeType.find(query).sort({ name: 1 });
    res.json(modeTypes || []);
  } catch (error) {
    console.error('Error fetching mode types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all mode types (Admin - includes inactive)
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const modeTypes = await ModeType.find().sort({ game: 1, name: 1 });
    res.json(modeTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create mode type (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, game, description } = req.body;

    if (!name || !game) {
      return res.status(400).json({ error: 'Name and game are required' });
    }

    // Check if mode type already exists
    const existing = await ModeType.findOne({ name: name.trim(), game: game.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Mode type already exists for this game' });
    }

    const modeType = new ModeType({
      name: name.trim(),
      game: game.trim(),
      description: description || '',
      isActive: true
    });

    await modeType.save();
    res.status(201).json(modeType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update mode type (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, game, description, isActive } = req.body;
    const modeType = await ModeType.findById(req.params.id);

    if (!modeType) {
      return res.status(404).json({ error: 'Mode type not found' });
    }

    if (name) modeType.name = name.trim();
    if (game) modeType.game = game.trim();
    if (description !== undefined) modeType.description = description;
    if (isActive !== undefined) modeType.isActive = isActive;

    modeType.updatedAt = Date.now();
    await modeType.save();

    res.json(modeType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete mode type (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const modeType = await ModeType.findByIdAndDelete(req.params.id);
    if (!modeType) {
      return res.status(404).json({ error: 'Mode type not found' });
    }
    res.json({ message: 'Mode type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

