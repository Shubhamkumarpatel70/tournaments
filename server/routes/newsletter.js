const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const { auth, authorize } = require('../middleware/auth');

// Subscribe to newsletter (public)
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.subscribedAt = Date.now();
        await existing.save();
        return res.json({ message: 'Successfully resubscribed to newsletter!', subscriber: existing });
      }
    }

    const subscriber = new Newsletter({
      email,
      isActive: true
    });

    await subscriber.save();
    res.status(201).json({ message: 'Successfully subscribed to newsletter!', subscriber });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Unsubscribe from newsletter (public)
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found in newsletter' });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check subscription status (public)
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    res.json({ isSubscribed: subscriber?.isActive || false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all newsletter subscribers (Admin only)
router.get('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    
    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscriber (Admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

