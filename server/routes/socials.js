const express = require('express');
const router = express.Router();
const Social = require('../models/Social');
const { auth, authorize } = require('../middleware/auth');

// Get all social links (public)
router.get('/', async (req, res) => {
  try {
    const socials = await Social.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all social links (admin only)
router.get('/all', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const socials = await Social.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single social link
router.get('/:id', async (req, res) => {
  try {
    const social = await Social.findById(req.params.id);
    if (!social) {
      return res.status(404).json({ error: 'Social link not found' });
    }
    res.json(social);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create social link (admin only)
router.post('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, icon, link, order } = req.body;

    if (!name || !icon || !link) {
      return res.status(400).json({ error: 'Name, icon, and link are required' });
    }

    const social = new Social({
      name,
      icon,
      link,
      order: order || 0
    });

    await social.save();
    res.status(201).json(social);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Social media name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update social link (admin only)
router.put('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { name, icon, link, isActive, order } = req.body;

    const social = await Social.findById(req.params.id);
    if (!social) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    if (name) social.name = name;
    if (icon) social.icon = icon;
    if (link) social.link = link;
    if (isActive !== undefined) social.isActive = isActive;
    if (order !== undefined) social.order = order;

    await social.save();
    res.json(social);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Social media name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete social link (admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const social = await Social.findByIdAndDelete(req.params.id);
    if (!social) {
      return res.status(404).json({ error: 'Social link not found' });
    }
    res.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

