// ============================================================
// CBE BloodConnect - Request Status History Model
// ============================================================
const mongoose = require('mongoose');

const requestStatusHistorySchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, index: true },
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedBy: { type: String, default: 'System' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RequestStatusHistory', requestStatusHistorySchema);
