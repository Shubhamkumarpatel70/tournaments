const express = require('express');
const router = express.Router();
const TournamentRegistration = require('../models/TournamentRegistration');
const Tournament = require('../models/Tournament');
const { auth, authorize } = require('../middleware/auth');

// Register for tournament
router.post('/', auth, async (req, res) => {
  try {
    const { tournamentId, teamId, teamName, numberOfPlayers, paymentType, paymentOption, paymentProof } = req.body;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if already registered
    const existing = await TournamentRegistration.findOne({
      tournamentId,
      teamId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return res.status(400).json({ error: 'Team already registered for this tournament' });
    }

    const registration = new TournamentRegistration({
      tournamentId,
      teamId,
      teamName,
      numberOfPlayers,
      paymentType,
      paymentOption,
      paymentProof: paymentProof || '',
      registeredBy: req.user._id,
      status: 'pending'
    });

    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get registrations for a tournament (Admin)
router.get('/tournament/:tournamentId', auth, authorize('admin'), async (req, res) => {
  try {
    const registrations = await TournamentRegistration.find({ tournamentId: req.params.tournamentId })
      .populate({
        path: 'teamId',
        select: 'name members game',
        populate: {
          path: 'members.userId',
          select: 'name email'
        }
      })
      .populate('registeredBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's registrations
router.get('/my-registrations', auth, async (req, res) => {
  try {
    const registrations = await TournamentRegistration.find({ registeredBy: req.user._id })
      .populate('tournamentId', 'name game matchDate prizePool')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve registration (Admin)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const registration = await TournamentRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'approved';
    await registration.save();

    // Update tournament registered teams count
    await Tournament.findByIdAndUpdate(registration.tournamentId, {
      $inc: { registeredTeams: 1 }
    });

    res.json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reject registration (Admin)
router.put('/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const registration = await TournamentRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'rejected';
    registration.rejectionReason = rejectionReason || '';
    await registration.save();

    res.json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

