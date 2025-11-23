const express = require('express');
const router = express.Router();
const HomeImage = require('../models/HomeImage');
const { auth, authorize } = require('../middleware/auth');

// Get active home image
router.get('/active', async (req, res) => {
  try {
    const homeImage = await HomeImage.findOne({ isActive: true }).sort({ updatedAt: -1 });
    res.json(homeImage || { imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all home images (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const homeImages = await HomeImage.find().sort({ updatedAt: -1 });
    res.json(homeImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create home image (Admin)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Deactivate all existing images
    await HomeImage.updateMany({}, { isActive: false });

    // Create new active image
    const homeImage = new HomeImage({
      imageUrl: imageUrl.trim(),
      isActive: true
    });

    await homeImage.save();
    res.status(201).json(homeImage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update home image (Admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { imageUrl, isActive } = req.body;
    const homeImage = await HomeImage.findById(req.params.id);

    if (!homeImage) {
      return res.status(404).json({ error: 'Home image not found' });
    }

    if (imageUrl) homeImage.imageUrl = imageUrl.trim();
    if (isActive !== undefined) {
      homeImage.isActive = isActive;
      // If activating this image, deactivate all others
      if (isActive) {
        await HomeImage.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
      }
    }

    homeImage.updatedAt = Date.now();
    await homeImage.save();

    res.json(homeImage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete home image (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const homeImage = await HomeImage.findByIdAndDelete(req.params.id);
    if (!homeImage) {
      return res.status(404).json({ error: 'Home image not found' });
    }
    res.json({ message: 'Home image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

