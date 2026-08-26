// ============================================================
// CBE BloodConnect - User Model (shared auth account)
// ============================================================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['donor', 'requester', 'admin'],
      default: 'requester',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
