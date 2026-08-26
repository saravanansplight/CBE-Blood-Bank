// ============================================================
// CBE BloodConnect - Blood Request Routes
// Common ACTIVE requests (visible to every donor), blood-group
// summary, active count, find blood search.
// ============================================================
const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { auth, optionalAuth } = require('../middleware/auth');
const { ACTIVE_STATUSES, BLOOD_GROUPS } = require('../config/constants');
const { haversineKm, formatDistance, timeAgo } = require('../utils/helpers');

const ACTIVE_QUERY = { status: { $in: ACTIVE_STATUSES } };

// Public & Logged-in: total count of requests + blood group breakdown
router.get('/active/summary', optionalAuth, async (req, res) => {
  try {
    const all = await BloodRequest.find({}).lean();
    const active = all.filter((r) => ACTIVE_STATUSES.includes(r.status));
    const fulfilled = all.filter((r) => r.status === 'FULFILLED' || r.status === 'DONOR_RESPONDED');

    const byGroup = {};
    const allByGroup = {};
    BLOOD_GROUPS.forEach((g) => {
      byGroup[g] = 0;
      allByGroup[g] = 0;
    });

    active.forEach((r) => (byGroup[r.bloodGroup] = (byGroup[r.bloodGroup] || 0) + 1));
    all.forEach((r) => (allByGroup[r.bloodGroup] = (allByGroup[r.bloodGroup] || 0) + 1));

    return res.json({
      totalActive: active.length,
      totalRequests: all.length,
      fulfilledCount: fulfilled.length,
      byBloodGroup: byGroup,
      allByGroup,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// All requests list (active + completed/fulfilled)
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const allRequests = await BloodRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    let donor = null;
    if (req.user && req.user.role === 'donor') {
      donor = await Donor.findOne({ userId: req.user._id });
    }

    const data = allRequests.map((r) => ({
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
      isMatching: donor ? donor.bloodGroup === r.bloodGroup : false,
      distance: donor && r.latitude != null
        ? formatDistance(haversineKm(donor.latitude, donor.longitude, r.latitude, r.longitude))
        : null,
    }));

    return res.json({ total: data.length, requests: data });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Common ACTIVE request list
router.get('/active', optionalAuth, async (req, res) => {
  try {
    const active = await BloodRequest.find(ACTIVE_QUERY)
      .sort({ urgency: -1, createdAt: -1 })
      .lean();

    let donor = null;
    if (req.user && req.user.role === 'donor') {
      donor = await Donor.findOne({ userId: req.user._id });
    }

    const data = active.map((r) => ({
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
      isMatching: donor ? donor.bloodGroup === r.bloodGroup : false,
      distance: donor && r.latitude != null
        ? formatDistance(haversineKm(donor.latitude, donor.longitude, r.latitude, r.longitude))
        : null,
    }));

    return res.json({ total: data.length, requests: data });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Get a single request by _id (donor view details)
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await BloodRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found.' });

    let donor = null;
    let match = null;
    if (req.user.role === 'donor') {
      donor = await Donor.findOne({ userId: req.user._id });
      if (donor) {
        const DonorMatch = require('../models/DonorMatch');
        match = await DonorMatch.findOne({ bloodRequestId: r._id, donorId: donor._id });
      }
    }

    let requesterMobile = null;
    let requesterEmail = null;
    if (donor && match && match.responseStatus === 'ACCEPTED' && r.requesterId) {
      const Requester = require('../models/Requester');
      const reqDoc = await Requester.findById(r.requesterId).lean();
      if (reqDoc) {
        requesterMobile = reqDoc.mobile;
        requesterEmail = reqDoc.email;
      }
    }

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
      requesterName: r.requesterName,
      requesterMobile,
      requesterEmail,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      createdAgo: timeAgo(r.createdAt),
      isMatching: donor ? donor.bloodGroup === r.bloodGroup : false,
      myResponse: match ? match.responseStatus : null,
      distance: donor
        ? formatDistance(haversineKm(donor.latitude, donor.longitude, r.latitude, r.longitude))
        : null,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
