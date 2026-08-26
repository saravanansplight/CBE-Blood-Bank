const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Donor = require('../models/Donor');
const Requester = require('../models/Requester');
const { auth } = require('../middleware/auth');
const { timeAgo } = require('../utils/helpers');

async function getEntityId(req) {
  if (req.user.role === 'donor') {
    const d = await Donor.findOne({ userId: req.user._id });
    return d ? { donorId: d._id } : null;
  }
  if (req.user.role === 'requester') {
    const r = await Requester.findOne({ userId: req.user._id });
    return r ? { requesterId: r._id } : null;
  }
  return null;
}

// All personal notifications for the logged-in donor or requester
router.get('/', auth, async (req, res) => {
  try {
    const filter = await getEntityId(req);
    if (!filter) return res.status(404).json({ message: 'Profile not found.' });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const data = notifications.map((n) => ({
      ...n,
      createdAgo: timeAgo(n.createdAt),
    }));
    return res.json({ notifications: data });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Unread personal notification count (for the bell badge)
router.get('/unread/count', auth, async (req, res) => {
  try {
    const filter = await getEntityId(req);
    if (!filter) return res.json({ count: 0 });
    const count = await Notification.countDocuments({ ...filter, isRead: false });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Mark a single notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const filter = await getEntityId(req);
    if (!filter) return res.status(404).json({ message: 'Profile not found.' });

    const notif = await Notification.findOne({ _id: req.params.id, ...filter });
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    notif.isRead = true;
    await notif.save();
    return res.json({ message: 'Marked as read.', notification: notif });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Mark all as read
router.patch('/read/all', auth, async (req, res) => {
  try {
    const filter = await getEntityId(req);
    if (!filter) return res.status(404).json({ message: 'Profile not found.' });

    await Notification.updateMany({ ...filter, isRead: false }, { isRead: true });
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;
