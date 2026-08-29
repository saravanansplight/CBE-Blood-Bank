// ============================================================
// CBE BloodConnect - Requester Routes
// Dashboard, create blood request (triggers matching engine),
// my requests, view responses, cancel / fulfil
// ============================================================
const express = require('express');
const router = express.Router();

const Requester = require('../models/Requester');
const BloodRequest = require('../models/BloodRequest');
const DonorMatch = require('../models/DonorMatch');
const RequestStatusHistory = require('../models/RequestStatusHistory');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { ACTIVE_STATUSES, BLOOD_GROUPS, URGENCY_LEVELS } = require('../config/constants');
const { generateRequestId } = require('../utils/requestId');
const { processNewRequest } = require('../utils/matching');
const { timeAgo } = require('../utils/helpers');

async function getRequester(req) {
  return Requester.findOne({ userId: req.user._id });
}

// ---------- REQUESTER DASHBOARD ----------
router.get('/dashboard', auth, authorize('requester'), async (req, res) => {
  try {
    const requester = await getRequester(req);
    if (!requester) return res.status(404).json({ message: 'Requester profile not found.' });

    const myRequests = await BloodRequest.find({ requesterId: requester._id }).lean();
    const totalRequests = myRequests.length;
    const myReqIds = myRequests.map((r) => r._id);

    const [notifiedRequestIds, respondedRequestIds] = await Promise.all([
      DonorMatch.distinct('bloodRequestId', { bloodRequestId: { $in: myReqIds } }),
      DonorMatch.distinct('bloodRequestId', { bloodRequestId: { $in: myReqIds }, responseStatus: { $ne: 'PENDING' } })
    ]);

    const donorsNotified = notifiedRequestIds.length;
    const donorsResponded = respondedRequestIds.length;

    const recent = myRequests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((r) => ({
        _id: r._id,
        requestId: r.requestId,
        bloodGroup: r.bloodGroup,
        unitsRequired: r.unitsRequired,
        locationName: r.locationName,
        urgency: r.urgency,
        status: r.status,
        createdAgo: timeAgo(r.createdAt),
      }));

    return res.json({
      requester: {
        fullName: requester.fullName,
        username: requester.username,
        mobile: requester.mobile,
      },
      stats: {
        totalRequests,
        donorsNotified,
        donorsResponded,
      },
      recent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- CREATE BLOOD REQUEST (triggers matching + notifications) ----------
router.post('/requests', auth, authorize('requester'), async (req, res) => {
  try {
    const requester = await getRequester(req);
    if (!requester) return res.status(404).json({ message: 'Requester profile not found.' });

    const {
      bloodGroup, unitsRequired, hospitalName, locationName,
      requiredDate, requiredTime, urgency, message,
    } = req.body;

    if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Please select a blood group.' });
    }
    if (!unitsRequired || parseInt(unitsRequired, 10) < 1) {
      return res.status(400).json({ message: 'Units required must be at least 1.' });
    }
    if (!hospitalName) {
      return res.status(400).json({ message: 'Please enter the hospital name.' });
    }
    if (!locationName) {
      return res.status(400).json({ message: 'Please select a Coimbatore location.' });
    }
    if (!requiredDate || !requiredTime) {
      return res.status(400).json({ message: 'Please provide required date and time.' });
    }

    const loc = await Location.findOne({ locationName, isActive: true });
    if (!loc) {
      return res.status(400).json({ message: 'Please select a valid Coimbatore location.' });
    }

    const urg = URGENCY_LEVELS.includes(urgency) ? urgency : 'Normal';
    const reqId = await generateRequestId();

    // Expiry window based on urgency
    const ttlHours = urg === 'Critical' ? 24 : urg === 'Urgent' ? 48 : 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const bloodRequest = await BloodRequest.create({
      requestId: reqId,
      requesterId: requester._id,
      requesterName: requester.fullName,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired, 10),
      hospitalName,
      locationId: loc._id,
      locationName: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      urgency: urg,
      requiredDate: new Date(requiredDate),
      requiredTime,
      message: message || '',
      status: 'CREATED',
      expiresAt,
    });

    await RequestStatusHistory.create({
      requestId: reqId,
      status: 'CREATED',
      note: `Request created by ${requester.fullName}.`,
      changedBy: requester.username,
    });

    // Run the matching engine: find donors, rank by distance, notify
    const result = await processNewRequest(bloodRequest);

    return res.status(201).json({
      message: `Blood request ${reqId} created successfully. ${result.matchedCount} matching donor(s) notified.`,
      request: bloodRequest,
      matchedDonors: result.matchedCount,
    });
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ---------- MY REQUESTS ----------
router.get('/requests', auth, authorize('requester'), async (req, res) => {
  try {
    const requester = await getRequester(req);
    if (!requester) return res.status(404).json({ message: 'Requester profile not found.' });

    const requests = await BloodRequest.find({ requesterId: requester._id })
      .sort({ createdAt: -1 })
      .lean();

    const myReqIds = requests.map((r) => r._id);

    // Get aggregated stats for pending, notified, and responded counts per request
    const stats = await DonorMatch.aggregate([
      { $match: { bloodRequestId: { $in: myReqIds } } },
      {
        $group: {
          _id: '$bloodRequestId',
          notifiedCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$responseStatus', 'PENDING'] }, 1, 0] }
          },
          respondedCount: {
            $sum: { $cond: [{ $ne: ['$responseStatus', 'PENDING'] }, 1, 0] }
          }
        }
      }
    ]);

    // Map aggregated counts to bloodRequestId
    const statsMap = stats.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr;
      return acc;
    }, {});

    const data = requests.map((r) => {
      const matchStats = statsMap[r._id.toString()] || { notifiedCount: 0, pendingCount: 0, respondedCount: 0 };
      return {
        _id: r._id,
        requestId: r.requestId,
        bloodGroup: r.bloodGroup,
        unitsRequired: r.unitsRequired,
        hospitalName: r.hospitalName,
        locationName: r.locationName,
        urgency: r.urgency,
        status: r.status,
        requiredDate: r.requiredDate,
        requiredTime: r.requiredTime,
        createdAt: r.createdAt,
        createdAgo: timeAgo(r.createdAt),
        expiresAt: r.expiresAt,
        pendingCount: matchStats.pendingCount,
        notifiedCount: matchStats.notifiedCount,
        respondedCount: matchStats.respondedCount,
      };
    });

    return res.json({ requests: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- REQUEST DETAILS + donor responses ----------
router.get('/requests/:id', auth, authorize('requester'), async (req, res) => {
  try {
    const requester = await getRequester(req);
    const r = await BloodRequest.findOne({ _id: req.params.id, requesterId: requester._id });
    if (!r) return res.status(404).json({ message: 'Request not found.' });

    const matches = await DonorMatch.find({ bloodRequestId: r._id })
      .populate('donorId', 'mobile email fullName locationName')
      .sort({ responseStatus: 1, distanceKm: 1 })
      .lean();
    const history = await RequestStatusHistory.find({ requestId: r.requestId })
      .sort({ createdAt: 1 })
      .lean();

    const responses = matches
      .filter((m) => m.responseStatus !== 'PENDING')
      .map((m) => ({
        donorName: m.donorName,
        bloodGroup: m.bloodGroup,
        distanceKm: m.distanceKm,
        responseStatus: m.responseStatus,
        respondedAgo: timeAgo(m.respondedAt),
        donorMobile: m.responseStatus === 'ACCEPTED' ? (m.donorId?.mobile || 'N/A') : null,
        donorEmail: m.responseStatus === 'ACCEPTED' ? (m.donorId?.email || null) : null,
        donorLocation: m.responseStatus === 'ACCEPTED' ? (m.donorId?.locationName || null) : null,
      }));

    return res.json({
      _id: r._id,
      requestId: r.requestId,
      bloodGroup: r.bloodGroup,
      unitsRequired: r.unitsRequired,
      hospitalName: r.hospitalName,
      locationName: r.locationName,
      urgency: r.urgency,
      status: r.status,
      requiredDate: r.requiredDate,
      requiredTime: r.requiredTime,
      message: r.message,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      createdAgo: timeAgo(r.createdAt),
      matchedDonorCount: matches.length,
      responses,
      history: history.map((h) => ({ status: h.status, note: h.note, changedBy: h.changedBy, when: timeAgo(h.createdAt) })),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- CANCEL ----------
router.patch('/requests/:id/cancel', auth, authorize('requester'), async (req, res) => {
  try {
    const requester = await getRequester(req);
    const r = await BloodRequest.findOne({ _id: req.params.id, requesterId: requester._id });
    if (!r) return res.status(404).json({ message: 'Request not found.' });
    if (!ACTIVE_STATUSES.includes(r.status) && r.status !== 'NO_RESPONSE') {
      return res.status(400).json({ message: `Cannot cancel a request that is ${r.status}.` });
    }
    r.status = 'CANCELLED';
    await r.save();
    await RequestStatusHistory.create({
      requestId: r.requestId, status: 'CANCELLED', note: 'Cancelled by requester.', changedBy: requester.username,
    });
    return res.json({ message: 'Request cancelled.', status: 'CANCELLED' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
