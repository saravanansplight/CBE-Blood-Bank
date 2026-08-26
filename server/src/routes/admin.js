// ============================================================
// CBE BloodConnect - Admin Routes
// ============================================================
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Donor = require('../models/Donor');
const Requester = require('../models/Requester');
const BloodRequest = require('../models/BloodRequest');
const DonorMatch = require('../models/DonorMatch');
const RequestStatusHistory = require('../models/RequestStatusHistory');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { ACTIVE_STATUSES, BLOOD_GROUPS } = require('../config/constants');
const { timeAgo } = require('../utils/helpers');

// ---------- ADMIN DASHBOARD ----------
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalDonors, availableDonors, totalActiveRequests,
      criticalRequests, fulfilledRequests, totalResponses,
      totalRequesters,
    ] = await Promise.all([
      Donor.countDocuments({}),
      Donor.countDocuments({ isActive: true, availabilityStatus: 'Available' }),
      BloodRequest.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      BloodRequest.countDocuments({ status: { $in: ACTIVE_STATUSES }, urgency: 'Critical' }),
      BloodRequest.countDocuments({ status: 'FULFILLED' }),
      DonorMatch.countDocuments({ responseStatus: { $in: ['ACCEPTED', 'REJECTED'] } }),
      Requester.countDocuments({}),
    ]);

    return res.json({
      stats: {
        totalDonors, availableDonors, totalActiveRequests,
        criticalRequests, fulfilledRequests, totalResponses, totalRequesters,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- DONOR MANAGEMENT ----------
router.get('/donors', auth, authorize('admin'), async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 }).lean();
    const data = donors.map((d) => ({
      _id: d._id,
      fullName: d.fullName, // reflects latest name change immediately
      username: d.username,
      bloodGroup: d.bloodGroup,
      locationName: d.locationName,
      availabilityStatus: d.availabilityStatus,
      isVerified: d.isVerified,
      isActive: d.isActive,
      email: d.email,
      mobile: d.mobile,
      age: d.age,
      gender: d.gender,
      createdAt: d.createdAt,
    }));
    return res.json({ donors: data });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.patch('/donors/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    const d = await Donor.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Donor not found.' });
    d.isVerified = !d.isVerified;
    await d.save();
    return res.json({ message: `Donor ${d.isVerified ? 'verified' : 'unverified'}.`, donor: d });
  } catch (err) { return res.status(500).json({ message: 'Something went wrong.' }); }
});

router.patch('/donors/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const d = await Donor.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Donor not found.' });
    d.isActive = !d.isActive;
    await d.save();
    await User.updateOne({ _id: d.userId }, { isActive: d.isActive });
    return res.json({ message: `Donor ${d.isActive ? 'activated' : 'deactivated'}.`, donor: d });
  } catch (err) { return res.status(500).json({ message: 'Something went wrong.' }); }
});

// ---------- REQUEST MANAGEMENT ----------
router.get('/requests', auth, authorize('admin'), async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 }).lean();
    const data = requests.map((r) => ({
      _id: r._id,
      requestId: r.requestId,
      requesterName: r.requesterName,
      bloodGroup: r.bloodGroup,
      unitsRequired: r.unitsRequired,
      hospitalName: r.hospitalName,
      locationName: r.locationName,
      urgency: r.urgency,
      status: r.status,
      createdAt: r.createdAt,
      createdAgo: timeAgo(r.createdAt),
    }));
    return res.json({ requests: data });
  } catch (err) { return res.status(500).json({ message: 'Something went wrong.' }); }
});

router.get('/requests/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const r = await BloodRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found.' });
    const matches = await DonorMatch.find({ bloodRequestId: r._id }).sort({ distanceKm: 1 }).lean();
    const history = await RequestStatusHistory.find({ requestId: r.requestId }).sort({ createdAt: 1 }).lean();
    return res.json({
      request: {
        ...r.toObject(),
        createdAgo: timeAgo(r.createdAt),
      },
      matches: matches.map((m) => ({
        donorName: m.donorName,
        bloodGroup: m.bloodGroup,
        distanceKm: m.distanceKm,
        matchScore: m.matchScore,
        responseStatus: m.responseStatus,
        respondedAgo: timeAgo(m.respondedAt),
      })),
      history: history.map((h) => ({ status: h.status, note: h.note, changedBy: h.changedBy, when: timeAgo(h.createdAt) })),
    });
  } catch (err) { return res.status(500).json({ message: 'Something went wrong.' }); }
});

router.patch('/requests/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['MATCHING', 'DONORS_NOTIFIED', 'DONOR_RESPONDED', 'FULFILLED', 'CANCELLED', 'EXPIRED', 'NO_RESPONSE'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const r = await BloodRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found.' });
    const old = r.status;
    r.status = status;
    await r.save();
    await RequestStatusHistory.create({
      requestId: r.requestId, status, note: `Status changed ${old} → ${status} by admin.`, changedBy: req.user.username,
    });
    return res.json({ message: `Request status updated to ${status}.`, status });
  } catch (err) { return res.status(500).json({ message: 'Something went wrong.' }); }
});

// ---------- ANALYTICS ----------
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments({});
    const availableDonors = await Donor.countDocuments({ isActive: true, availabilityStatus: 'Available' });

    const byBloodGroup = {};
    const byLocation = {};
    BLOOD_GROUPS.forEach((g) => (byBloodGroup[g] = { donors: 0, requests: 0 }));

    // Donors by blood group
    const donorAgg = await Donor.aggregate([{ $group: { _id: '$bloodGroup', count: { $sum: 1 } } }]);
    donorAgg.forEach((d) => (byBloodGroup[d._id].donors = d.count));

    // Requests by blood group + location
    const reqBloodAgg = await BloodRequest.aggregate([{ $group: { _id: '$bloodGroup', count: { $sum: 1 } } }]);
    reqBloodAgg.forEach((d) => { if (byBloodGroup[d._id]) byBloodGroup[d._id].requests = d.count; });

    const reqLocAgg = await BloodRequest.aggregate([{ $group: { _id: '$locationName', count: { $sum: 1 } } }]);
    reqLocAgg.forEach((d) => (byLocation[d._id] = d.count));

    const statusCounts = {};
    const statusAgg = await BloodRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    statusAgg.forEach((d) => (statusCounts[d._id] = d.count));

    const accepted = await DonorMatch.countDocuments({ responseStatus: 'ACCEPTED' });
    const rejected = await DonorMatch.countDocuments({ responseStatus: 'REJECTED' });
    const notified = await Notification.countDocuments({});

    return res.json({
      totalDonors,
      availableDonors,
      byBloodGroup,
      byLocation,
      statusCounts,
      donorResponses: { accepted, rejected, total: accepted + rejected },
      notificationsSent: notified,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
