const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth, authorize } = require('../middleware/auth');

// Get all team members (public)
router.get('/', async (req, res) => {
  try {
    const teamMembers = await Team.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all team members (admin only)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const teamMembers = await Team.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team member (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, position, description, socialLinks, image, order } = req.body;

    if (!name || !position) {
      return res.status(400).json({ error: 'Name and position are required' });
    }

    const teamMember = new Team({
      name,
      position,
      description: description || '',
      socialLinks: socialLinks || [],
      image: image || '',
      order: order || 0
    });

    await teamMember.save();
    res.status(201).json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update team member (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, position, description, socialLinks, image, isActive, order } = req.body;

    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    if (name) teamMember.name = name;
    if (position) teamMember.position = position;
    if (description !== undefined) teamMember.description = description;
    if (socialLinks !== undefined) teamMember.socialLinks = socialLinks;
    if (image !== undefined) teamMember.image = image;
    if (isActive !== undefined) teamMember.isActive = isActive;
    if (order !== undefined) teamMember.order = order;

    await teamMember.save();
    res.json(teamMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete team member (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const teamMember = await Team.findByIdAndDelete(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
