const express = require('express');
const router = express.Router();
const MatchSchedule = require('../models/MatchSchedule');
const Tournament = require('../models/Tournament');
const { auth, authorize } = require('../middleware/auth');

// Get all match schedules (Admin)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const schedules = await MatchSchedule.find()
      .populate('tournamentId', 'name game')
      .sort({ matchDate: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match schedules for a tournament
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const schedules = await MatchSchedule.find({
      tournamentId: req.params.tournamentId,
      isActive: true
    }).sort({ matchDate: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's match schedules (for registered tournaments)
router.get('/my-matches', auth, async (req, res) => {
  try {
    const TournamentRegistration = require('../models/TournamentRegistration');
    const registrations = await TournamentRegistration.find({
      registeredBy: req.user._id,
      status: 'approved'
    }).populate('tournamentId');

    const tournamentIds = registrations.map(r => r.tournamentId._id);
    const schedules = await MatchSchedule.find({
      tournamentId: { $in: tournamentIds },
      isActive: true
    })
      .populate('tournamentId', 'name game')
      .sort({ matchDate: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create match schedule (Admin)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { tournamentId, gameType, gameId, password, tournamentType, matchDate } = req.body;

    const schedule = new MatchSchedule({
      tournamentId,
      gameType,
      gameId,
      password,
      tournamentType,
      matchDate: new Date(matchDate)
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update match schedule (Admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const schedule = await MatchSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Match schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete match schedule (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const schedule = await MatchSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Match schedule not found' });
    }
    res.json({ message: 'Match schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

