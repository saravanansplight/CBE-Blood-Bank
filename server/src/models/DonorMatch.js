// ============================================================
// CBE BloodConnect - Donor Match Model
// Links a blood request to each matching donor + their response
// ============================================================
const mongoose = require('mongoose');

const donorMatchSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, index: true },
    bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    donorName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    distanceKm: { type: Number, default: null },
    matchScore: { type: Number, default: 0 },
    responseStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
    notificationStatus: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

donorMatchSchema.index({ bloodRequestId: 1, donorId: 1 }, { unique: true });

module.exports = mongoose.model('DonorMatch', donorMatchSchema);
