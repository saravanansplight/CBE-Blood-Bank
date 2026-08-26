// ============================================================
// CBE BloodConnect - Donor Model
// ============================================================
const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true }, // EDITABLE display name
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    age: { type: Number, required: true, min: 18, max: 65 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    lastDonationDate: { type: Date, default: null },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Temporarily Unavailable', 'Not Available'],
      default: 'Available',
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index to support basic search
donorSchema.index({ fullName: 'text', bloodGroup: 1, locationName: 1 });

module.exports = mongoose.model('Donor', donorSchema);
