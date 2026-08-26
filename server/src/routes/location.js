// ============================================================
// CBE BloodConnect - Location Routes
// ============================================================
const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { auth, authorize } = require('../middleware/auth');

// List all active supported locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ locationName: 1 });
    return res.json(locations);
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Admin: list all (including inactive)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const locations = await Location.find().sort({ locationName: 1 });
    return res.json(locations);
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Admin: toggle active
router.patch('/:id/toggle', auth, authorize('admin'), async (req, res) => {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) return res.status(404).json({ message: 'Location not found.' });
    loc.isActive = !loc.isActive;
    await loc.save();
    return res.json({ message: `Location ${loc.isActive ? 'activated' : 'deactivated'}.`, location: loc });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
