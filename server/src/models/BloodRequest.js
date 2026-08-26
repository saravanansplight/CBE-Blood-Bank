// ============================================================
// CBE BloodConnect - Blood Request Model
// ============================================================
const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true }, // REQ-CBE-2026-000001
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requester', required: true },
    requesterName: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsRequired: { type: Number, required: true, min: 1, max: 20 },
    hospitalName: { type: String, required: true, trim: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    urgency: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
    requiredDate: { type: Date, required: true },
    requiredTime: { type: String, required: true },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['CREATED', 'MATCHING', 'DONORS_NOTIFIED', 'DONOR_RESPONDED', 'FULFILLED', 'CANCELLED', 'EXPIRED', 'NO_RESPONSE'],
      default: 'CREATED',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ status: 1, bloodGroup: 1, createdAt: -1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
