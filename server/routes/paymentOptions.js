const express = require('express');
const router = express.Router();
const PaymentOption = require('../models/PaymentOption');
const { auth, authorize } = require('../middleware/auth');

// Get all payment options
router.get('/', async (req, res) => {
  try {
    const paymentOptions = await PaymentOption.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(paymentOptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payment options (Admin only)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const paymentOptions = await PaymentOption.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(paymentOptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment option (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, type, details, qrCode, isActive } = req.body;

    const paymentOption = new PaymentOption({
      name,
      type,
      details,
      qrCode: qrCode || '',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    await paymentOption.save();
    res.status(201).json(paymentOption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update payment option (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!paymentOption) {
      return res.status(404).json({ error: 'Payment option not found' });
    }
    res.json(paymentOption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment option (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findByIdAndDelete(req.params.id);
    if (!paymentOption) {
      return res.status(404).json({ error: 'Payment option not found' });
    }
    res.json({ message: 'Payment option deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
