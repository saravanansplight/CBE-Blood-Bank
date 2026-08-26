// ============================================================
// CBE BloodConnect - Notification Model
// PERSONAL notifications only sent to matching donors.
// ============================================================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', default: null, index: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requester', default: null, index: true },
    recipientRole: { type: String, enum: ['donor', 'requester'], default: 'donor' },
    requestId: { type: String, required: true, index: true },
    bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    notificationType: {
      type: String,
      enum: ['NEW_MATCH', 'DONOR_ACCEPTED', 'DONOR_REJECTED', 'REMINDER', 'STATUS_UPDATE'],
      default: 'NEW_MATCH',
    },
    urgency: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ donorId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ requesterId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
