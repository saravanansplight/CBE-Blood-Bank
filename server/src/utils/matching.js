// ============================================================
// CBE BloodConnect - Donor Matching Engine
// When a request is created: find matching donors (exact blood
// group), verify availability + supported location, compute
// Haversine distance, rank by proximity, create matches and
// PERSONAL notifications.
// ============================================================
const Donor = require('../models/Donor');
const DonorMatch = require('../models/DonorMatch');
const Notification = require('../models/Notification');
const RequestStatusHistory = require('../models/RequestStatusHistory');
const { haversineKm } = require('./helpers');

async function processNewRequest(bloodRequest) {
  // 1. Find donors with EXACT matching blood group, active & available
  const matchingDonors = await Donor.find({
    bloodGroup: bloodRequest.bloodGroup,
    isActive: true,
    availabilityStatus: 'Available',
  }).populate('locationId');

  // 2 & 3. Calculate distance + rank by proximity
  const ranked = matchingDonors
    .map((d) => {
      const distance = haversineKm(
        bloodRequest.latitude,
        bloodRequest.longitude,
        d.latitude,
        d.longitude
      );
      return { donor: d, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  // 4. Create donor match records + personal notifications
  const createdMatches = [];
  for (const { donor, distance } of ranked) {
    // matchScore: closer = higher (0-100)
    const matchScore = Math.max(0, Math.round(100 - distance * 3));

    const match = await DonorMatch.findOneAndUpdate(
      { bloodRequestId: bloodRequest._id, donorId: donor._id },
      {
        requestId: bloodRequest.requestId,
        bloodRequestId: bloodRequest._id,
        donorId: donor._id,
        donorName: donor.fullName,
        bloodGroup: donor.bloodGroup,
        distanceKm: parseFloat(distance.toFixed(2)),
        matchScore,
        responseStatus: 'PENDING',
        notificationStatus: 'SENT',
        respondedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdMatches.push(match);

    await Notification.create({
      donorId: donor._id,
      requestId: bloodRequest.requestId,
      title: '🔔 New Matching Blood Request',
      message: `${donor.bloodGroup} Blood Required at ${bloodRequest.locationName}. ${bloodRequest.unitsRequired} unit(s). Urgency: ${bloodRequest.urgency}.`,
      notificationType: 'NEW_MATCH',
      urgency: bloodRequest.urgency,
      isRead: false,
    });
  }

  // 5. Update request status + history
  const newStatus = createdMatches.length > 0 ? 'DONORS_NOTIFIED' : 'NO_RESPONSE';
  bloodRequest.status = newStatus;
  await bloodRequest.save();
  await RequestStatusHistory.create({
    requestId: bloodRequest.requestId,
    status: newStatus,
    note: `Matched ${createdMatches.length} donor(s) and notified.`,
    changedBy: 'System',
  });

  return { matchedCount: createdMatches.length, matches: createdMatches };
}

module.exports = { processNewRequest };
