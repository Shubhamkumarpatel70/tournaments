const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');

// Submit contact form (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await contact.save();
    res.status(201).json({ message: 'Thank you for contacting us! We will get back to you soon.', contact });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all contact queries (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact status (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact query not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete contact query (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact query not found' });
    }

    res.json({ message: 'Contact query deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

