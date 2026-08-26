// ============================================================
// CBE BloodConnect - Find Blood (public search)
// Searches donors by blood group + location + availability.
// Never exposes private addresses (only location + distance).
// ============================================================
const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { auth } = require('../middleware/auth');
const { haversineKm, formatDistance } = require('../utils/helpers');

router.get('/', auth, async (req, res) => {
  try {
    const { bloodGroup, locationName, availability } = req.query;
    const query = { isActive: true };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (locationName) query.locationName = locationName;
    if (availability === 'Available') query.availabilityStatus = 'Available';

    let donors = await Donor.find(query).sort({ availabilityStatus: 1, fullName: 1 }).lean();
    if (!donors.length) {
      return res.json({ donors: [], message: 'No matching donors found.' });
    }

    // Distance from the chosen location (or donor's own location)
    donors = donors.map((d) => ({
      _id: d._id,
      fullName: d.fullName,
      bloodGroup: d.bloodGroup,
      locationName: d.locationName,
      availabilityStatus: d.availabilityStatus,
      age: d.age,
      gender: d.gender,
      distance: formatDistance(
        locationName ? haversineKm(d.latitude, d.longitude, donors[0].latitude, donors[0].longitude) : 0
      ),
    }));

    return res.json({ donors });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
