// ============================================================
// CBE BloodConnect - Auth Routes
// Registration + login for donor / requester / admin (JWT)
// ============================================================
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const Donor = require('../models/Donor');
const Requester = require('../models/Requester');
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');
const { BLOOD_GROUPS, AVAILABILITY_STATUS } = require('../config/constants');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET || 'cbe_dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ---------- DONOR REGISTRATION ----------
router.post('/register/donor', async (req, res) => {
  try {
    const {
      fullName, username, email, mobile, password, confirmPassword,
      age, gender, bloodGroup, locationName,
      lastDonationDate, availabilityStatus,
    } = req.body;

    // Validation
    if (!fullName || !username || !email || !mobile || !password || !age || !gender || !bloodGroup || !locationName) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' });
    }
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Please select a valid blood group.' });
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      return res.status(400).json({ message: 'Donor age must be between 18 and 65.' });
    }
    const availability = AVAILABILITY_STATUS.includes(availabilityStatus) ? availabilityStatus : 'Available';

    // Validate location against the 15 supported locations
    const loc = await Location.findOne({ locationName, isActive: true });
    if (!loc) {
      return res.status(400).json({ message: 'Please select a valid Coimbatore location.' });
    }

    // Uniqueness checks
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'Username already taken. Please choose another.' });
    const existingEmail = await Donor.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.toLowerCase(), passwordHash, role: 'donor' });

    const donor = await Donor.create({
      userId: user._id,
      fullName,
      username: username.toLowerCase(),
      email,
      mobile,
      bloodGroup,
      age: ageNum,
      gender,
      locationId: loc._id,
      locationName: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      lastDonationDate: lastDonationDate || null,
      availabilityStatus: availability,
    });

    const token = signToken(user);
    return res.status(201).json({
      message: 'Donor registered successfully!',
      token,
      role: 'donor',
      donorId: donor._id,
      fullName: donor.fullName,
    });
  } catch (err) {
    console.error('Donor registration error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ---------- REQUESTER REGISTRATION ----------
router.post('/register/requester', async (req, res) => {
  try {
    const { fullName, username, mobile, email, password, confirmPassword } = req.body;
    if (!fullName || !username || !mobile || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' });
    }
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'Username already taken. Please choose another.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.toLowerCase(), passwordHash, role: 'requester' });
    const requester = await Requester.create({
      userId: user._id,
      fullName,
      username: username.toLowerCase(),
      email,
      mobile,
      passwordHash,
    });

    const token = signToken(user);
    return res.status(201).json({
      message: 'Requester registered successfully!',
      token,
      role: 'requester',
      requesterId: requester._id,
      fullName: requester.fullName,
    });
  } catch (err) {
    console.error('Requester registration error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ---------- LOGIN (all roles) ----------
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter username and password.' });
    }
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact the administrator.' });
    }

    // Enrich with profile name
    let profile = { fullName: user.username };
    if (user.role === 'donor') {
      profile = await Donor.findOne({ userId: user._id });
    } else if (user.role === 'requester') {
      profile = await Requester.findOne({ userId: user._id });
    }

    const token = signToken(user);
    return res.json({
      message: 'Login successful',
      token,
      role: user.role,
      userId: user._id,
      fullName: profile?.fullName || user.username,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// ---------- CURRENT USER ----------
router.get('/me', auth, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'donor') {
      profile = await Donor.findOne({ userId: req.user._id });
    } else if (req.user.role === 'requester') {
      profile = await Requester.findOne({ userId: req.user._id });
    }
    return res.json({
      userId: req.user._id,
      role: req.user.role,
      username: req.user.username,
      fullName: profile?.fullName || req.user.username,
      profile,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
