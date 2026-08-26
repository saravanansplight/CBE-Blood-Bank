// ============================================================
// CBE BloodConnect - Application Constants
// ============================================================

// The ONLY 15 supported Coimbatore locations (with approximate coordinates)
const CBE_LOCATIONS = [
  { locationName: 'Gandhipuram',   district: 'Coimbatore', latitude: 11.0230, longitude: 76.9660 },
  { locationName: 'Peelamedu',     district: 'Coimbatore', latitude: 11.0330, longitude: 77.0430 },
  { locationName: 'RS Puram',      district: 'Coimbatore', latitude: 11.0120, longitude: 76.9500 },
  { locationName: 'Saibaba Colony',district: 'Coimbatore', latitude: 11.0270, longitude: 76.9400 },
  { locationName: 'Singanallur',   district: 'Coimbatore', latitude: 11.0050, longitude: 77.0100 },
  { locationName: 'Ukkadam',       district: 'Coimbatore', latitude: 10.9880, longitude: 76.9550 },
  { locationName: 'Town Hall',     district: 'Coimbatore', latitude: 11.0000, longitude: 76.9630 },
  { locationName: 'Ramanathapuram',district: 'Coimbatore', latitude: 11.0180, longitude: 77.0000 },
  { locationName: 'Podanur',       district: 'Coimbatore', latitude: 10.9700, longitude: 76.9800 },
  { locationName: 'Kuniamuthur',   district: 'Coimbatore', latitude: 10.9550, longitude: 76.9500 },
  { locationName: 'Kovaipudur',    district: 'Coimbatore', latitude: 10.9800, longitude: 76.9200 },
  { locationName: 'Ganapathy',     district: 'Coimbatore', latitude: 11.0450, longitude: 76.9850 },
  { locationName: 'Saravanampatti',district: 'Coimbatore', latitude: 11.0550, longitude: 77.0400 },
  { locationName: 'Thudiyalur',    district: 'Coimbatore', latitude: 11.0600, longitude: 76.9450 },
  { locationName: 'Vadavalli',     district: 'Coimbatore', latitude: 11.0350, longitude: 76.9150 },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'];

const AVAILABILITY_STATUS = ['Available', 'Temporarily Unavailable', 'Not Available'];

const ROLES = {
  DONOR: 'donor',
  REQUESTER: 'requester',
  ADMIN: 'admin',
};

const REQUEST_STATUSES = [
  'CREATED',
  'MATCHING',
  'DONORS_NOTIFIED',
  'DONOR_RESPONDED',
  'FULFILLED',
  'CANCELLED',
  'EXPIRED',
  'NO_RESPONSE',
];

const ACTIVE_STATUSES = ['CREATED', 'MATCHING', 'DONORS_NOTIFIED', 'DONOR_RESPONDED'];

const RESPONSE_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

module.exports = {
  CBE_LOCATIONS,
  BLOOD_GROUPS,
  URGENCY_LEVELS,
  AVAILABILITY_STATUS,
  ROLES,
  REQUEST_STATUSES,
  ACTIVE_STATUSES,
  RESPONSE_STATUSES,
};
