const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all notifications (Admin only)
router.get('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active notifications for home page
router.get('/active', async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { showOnHome: true },
        { isHomeNotification: true }
      ],
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    }).sort({ createdAt: -1 }).limit(5);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user notifications (authenticated users)
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      $and: [
        {
          $or: [
            { target: 'all' },
            { target: 'specific', targetUserId: req.user._id },
            { target: 'user', targetUserId: req.user._id }
          ]
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification (Admin only)
router.post('/', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const { title, message, type, target, targetUserId, showOnHome, isHomeNotification, expiresAt } = req.body;

    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      target,
      targetUserId: target === 'specific' ? targetUserId : null,
      showOnHome: showOnHome || false,
      isHomeNotification: isHomeNotification || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update notification (Admin only)
router.put('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete notification (Admin only)
router.delete('/:id', auth, authorize('admin', 'co-admin'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
