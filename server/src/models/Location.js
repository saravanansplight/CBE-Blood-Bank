// ============================================================
// CBE BloodConnect - Location Model
// The 15 supported Coimbatore locations
// ============================================================
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true, unique: true, trim: true },
    district: { type: String, default: 'Coimbatore' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
