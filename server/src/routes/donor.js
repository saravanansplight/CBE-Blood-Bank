// ============================================================
// CBE BloodConnect - Donor Routes
// Dashboard, editable profile, matching requests, accept/reject
// ============================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const DonorMatch = require('../models/DonorMatch');
const Notification = require('../models/Notification');
const RequestStatusHistory = require('../models/RequestStatusHistory');
const Location = require('../models/Location');
const { auth, authorize } = require('../middleware/auth');
const { ACTIVE_STATUSES, AVAILABILITY_STATUS } = require('../config/constants');
const { haversineKm, formatDistance, timeAgo } = require('../utils/helpers');

// Helper to get the logged-in donor document
async function getDonor(req) {
  return Donor.findOne({ userId: req.user._id });
}

// ---------- DONOR DASHBOARD ----------
router.get('/dashboard', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = await getDonor(req);
    if (!donor) return res.status(404).json({ message: 'Donor profile not found.' });

    const [activeRequests, matchingRequests, unreadCount, acceptedCount] = await Promise.all([
      BloodRequest.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      BloodRequest.countDocuments({
        bloodGroup: donor.bloodGroup,
        status: { $in: ACTIVE_STATUSES },
      }),
      Notification.countDocuments({ donorId: donor._id, isRead: false }),
      DonorMatch.countDocuments({ donorId: donor._id, responseStatus: 'ACCEPTED' }),
    ]);

    return res.json({
      donor: {
        _id: donor._id,
        fullName: donor.fullName,
        username: donor.username,
        email: donor.email,
        mobile: donor.mobile,
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        locationName: donor.locationName,
        availabilityStatus: donor.availabilityStatus,
        lastDonationDate: donor.lastDonationDate,
        isVerified: donor.isVerified,
        createdAt: donor.createdAt,
      },
      stats: { activeRequests, matchingRequests, unreadCount, acceptedCount },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- EDIT PROFILE (dynamic name reflected everywhere) ----------
router.put('/profile', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = await getDonor(req);
    if (!donor) return res.status(404).json({ message: 'Donor profile not found.' });

    const {
      fullName, username, email, mobile, age, gender, locationName,
      availabilityStatus, lastDonationDate,
    } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Display name must be at least 2 characters.' });
    }
    if (!email || !mobile) {
      return res.status(400).json({ message: 'Email and mobile are required.' });
    }

    const ageNum = age != null ? parseInt(age, 10) : donor.age;
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      return res.status(400).json({ message: 'Age must be between 18 and 65.' });
    }

    let locationChanged = false;
    if (locationName && locationName !== donor.locationName) {
      const loc = await Location.findOne({ locationName, isActive: true });
      if (!loc) return res.status(400).json({ message: 'Please select a valid Coimbatore location.' });
      donor.locationId = loc._id;
      donor.locationName = loc.locationName;
      donor.latitude = loc.latitude;
      donor.longitude = loc.longitude;
      locationChanged = true;
    }

    // Username change (where permitted, must remain unique)
    if (username && username.toLowerCase() !== donor.username) {
      const User = require('../models/User');
      const taken = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
      if (taken) return res.status(409).json({ message: 'That username is already taken.' });
      await User.updateOne({ _id: req.user._id }, { username: username.toLowerCase() });
      donor.username = username.toLowerCase();
    }

    donor.fullName = fullName.trim();
    donor.email = email.toLowerCase();
    donor.mobile = mobile;
    donor.age = ageNum;
    if (gender) donor.gender = gender;
    if (AVAILABILITY_STATUS.includes(availabilityStatus)) donor.availabilityStatus = availabilityStatus;
    donor.lastDonationDate = lastDonationDate || null;

    await donor.save();

    // Keep the donor's name in sync across match records so requester/admin see the new name
    await DonorMatch.updateMany({ donorId: donor._id }, { donorName: donor.fullName });

    return res.json({
      message: 'Profile updated successfully!',
      donor: {
        _id: donor._id,
        fullName: donor.fullName,
        username: donor.username,
        email: donor.email,
        mobile: donor.mobile,
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        locationName: donor.locationName,
        availabilityStatus: donor.availabilityStatus,
        lastDonationDate: donor.lastDonationDate,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Change password
router.put('/password', auth, authorize('donor'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
    const match = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
    req.user.passwordHash = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- MY MATCHING REQUESTS (exact blood group + active) ----------
router.get('/matching', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = await getDonor(req);
    if (!donor) return res.status(404).json({ message: 'Donor profile not found.' });

    const requests = await BloodRequest.find({
      bloodGroup: donor.bloodGroup,
      status: { $in: ACTIVE_STATUSES },
    }).sort({ urgency: -1, createdAt: -1 }).lean();

    const myMatches = await DonorMatch.find({ donorId: donor._id });
    const matchMap = {};
    myMatches.forEach((m) => (matchMap[m.bloodRequestId?.toString()] = m));

    const data = requests.map((r) => {
      const m = matchMap[r._id.toString()];
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
        distance: formatDistance(haversineKm(donor.latitude, donor.longitude, r.latitude, r.longitude)),
        myResponse: m ? m.responseStatus : 'PENDING',
      };
    });

    return res.json({ total: data.length, requests: data, bloodGroup: donor.bloodGroup });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- ACCEPT a matching request ----------
router.post('/:id/accept', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = await getDonor(req);
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) return res.status(404).json({ message: 'Request not found.' });

    if (!ACTIVE_STATUSES.includes(bloodRequest.status)) {
      return res.status(400).json({ message: 'This request is no longer active.' });
    }
    if (donor.bloodGroup !== bloodRequest.bloodGroup) {
      return res.status(403).json({ message: 'This request does not match your blood group.' });
    }

    const match = await DonorMatch.findOneAndUpdate(
      { bloodRequestId: bloodRequest._id, donorId: donor._id },
      { responseStatus: 'ACCEPTED', respondedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    match.requestId = bloodRequest.requestId;
    match.bloodGroup = donor.bloodGroup;
    match.donorName = donor.fullName;
    await match.save();

    // Update request status to DONOR_RESPONDED + history
    if (!['DONOR_RESPONDED', 'FULFILLED'].includes(bloodRequest.status)) {
      bloodRequest.status = 'DONOR_RESPONDED';
      await bloodRequest.save();
      await RequestStatusHistory.create({
        requestId: bloodRequest.requestId,
        status: 'DONOR_RESPONDED',
        note: `Donor ${donor.fullName} accepted this request.`,
        changedBy: donor.username,
      });
    }

    // Remove personal notifications for this request for this donor
    await Notification.deleteMany({ donorId: donor._id, requestId: bloodRequest.requestId });

    // Send immediate personal notification to the Requester
    if (bloodRequest.requesterId) {
      await Notification.create({
        requesterId: bloodRequest.requesterId,
        recipientRole: 'requester',
        requestId: bloodRequest.requestId,
        bloodRequestId: bloodRequest._id,
        title: `🩸 Donor ${donor.fullName} Accepted!`,
        message: `${donor.fullName} (${donor.bloodGroup}) has accepted your blood request for ${bloodRequest.hospitalName}. Contact: ${donor.mobile}`,
        notificationType: 'DONOR_ACCEPTED',
        urgency: bloodRequest.urgency,
      });
    }

    return res.json({ message: 'You have accepted this request. The requester will be notified.', match });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// ---------- REJECT a matching request ----------
router.post('/:id/reject', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = await getDonor(req);
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) return res.status(404).json({ message: 'Request not found.' });

    if (donor.bloodGroup !== bloodRequest.bloodGroup) {
      return res.status(403).json({ message: 'This request does not match your blood group.' });
    }

    await DonorMatch.findOneAndUpdate(
      { bloodRequestId: bloodRequest._id, donorId: donor._id },
      { responseStatus: 'REJECTED', respondedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Donor should no longer receive duplicate notifications for this request
    await Notification.deleteMany({ donorId: donor._id, requestId: bloodRequest.requestId });

    return res.json({ message: 'You have declined this request. You will not be notified about it again.' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
