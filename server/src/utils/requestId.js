// ============================================================
// CBE BloodConnect - Request ID Generator
// Generates sequential IDs: REQ-CBE-2026-000001
// ============================================================
const BloodRequest = require('../models/BloodRequest');

async function generateRequestId() {
  const year = new Date().getFullYear(); // 2026
  const prefix = `REQ-CBE-${year}-`;

  // Find the highest sequence for this year
  const last = await BloodRequest.findOne(
    { requestId: { $regex: `^${prefix}\\d+$` } },
    { requestId: 1 }
  ).sort({ requestId: -1 });

  let nextSeq = 1;
  if (last && last.requestId) {
    const num = parseInt(last.requestId.replace(prefix, ''), 10);
    if (!isNaN(num)) nextSeq = num + 1;
  }
  return prefix + String(nextSeq).padStart(6, '0');
}

module.exports = { generateRequestId };
