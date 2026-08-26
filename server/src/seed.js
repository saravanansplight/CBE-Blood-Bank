// ============================================================
// CBE BloodConnect - Seed Data
// Idempotent: creates the 15 Coimbatore locations, a default
// admin, fictional sample donors for all 8 blood groups, a
// sample requester, and 1 sample active blood request so the
// matching/notification engine can be demonstrated immediately.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./models/User');
const Donor = require('./models/Donor');
const Requester = require('./models/Requester');
const BloodRequest = require('./models/BloodRequest');
const Location = require('./models/Location');
const RequestStatusHistory = require('./models/RequestStatusHistory');

const { CBE_LOCATIONS } = require('./config/constants');
const { generateRequestId } = require('./utils/requestId');
const { processNewRequest } = require('./utils/matching');

// Fictional sample donors for ALL 8 blood groups (Coimbatore locations only)
// password for every sample donor: donor123
const SAMPLE_DONORS = [
  // A+
  { fullName: 'Arun Kumar',   username: 'arun.a',     bloodGroup: 'A+',  age: 28, gender: 'Male',   locationName: 'Peelamedu',     mobile: '9843010001' },
  { fullName: 'Suresh',       username: 'suresh.a',   bloodGroup: 'A+',  age: 34, gender: 'Male',   locationName: 'Gandhipuram',   mobile: '9843010002' },
  { fullName: 'Karthik',      username: 'karthik.a',  bloodGroup: 'A+',  age: 26, gender: 'Male',   locationName: 'Singanallur',   mobile: '9843010003' },
  // A-
  { fullName: 'Naveen',       username: 'naveen.a',   bloodGroup: 'A-',  age: 31, gender: 'Male',   locationName: 'RS Puram',      mobile: '9843010004' },
  { fullName: 'Vijay',        username: 'vijay.a',    bloodGroup: 'A-',  age: 29, gender: 'Male',   locationName: 'Saibaba Colony',mobile: '9843010005' },
  { fullName: 'Hari',         username: 'hari.a',     bloodGroup: 'A-',  age: 33, gender: 'Male',   locationName: 'Ukkadam',       mobile: '9843010006' },
  // B+
  { fullName: 'Rahul',        username: 'rahul.b',    bloodGroup: 'B+',  age: 27, gender: 'Male',   locationName: 'Peelamedu',     mobile: '9843010007' },
  { fullName: 'Santhosh',     username: 'santhosh.b', bloodGroup: 'B+',  age: 35, gender: 'Male',   locationName: 'Gandhipuram',   mobile: '9843010008' },
  { fullName: 'Manoj',        username: 'manoj.b',    bloodGroup: 'B+',  age: 24, gender: 'Male',   locationName: 'Ukkadam',       mobile: '9843010009' },
  // B-
  { fullName: 'Bala',         username: 'bala.b',     bloodGroup: 'B-',  age: 30, gender: 'Male',   locationName: 'RS Puram',      mobile: '9843010010' },
  { fullName: 'Dinesh',       username: 'dinesh.b',   bloodGroup: 'B-',  age: 32, gender: 'Male',   locationName: 'Ganapathy',     mobile: '9843010011' },
  { fullName: 'Ajay',         username: 'ajay.b',     bloodGroup: 'B-',  age: 28, gender: 'Male',   locationName: 'Thudiyalur',    mobile: '9843010012' },
  // AB+
  { fullName: 'Prakash',      username: 'prakash.ab', bloodGroup: 'AB+', age: 36, gender: 'Male',   locationName: 'Saibaba Colony',mobile: '9843010013' },
  { fullName: 'Naveen Kumar', username: 'naveenk.ab', bloodGroup: 'AB+', age: 29, gender: 'Male',   locationName: 'Peelamedu',     mobile: '9843010014' },
  { fullName: 'Vignesh',      username: 'vignesh.ab', bloodGroup: 'AB+', age: 25, gender: 'Male',   locationName: 'Saravanampatti',mobile: '9843010015' },
  // AB-
  { fullName: 'Surya',        username: 'surya.ab',   bloodGroup: 'AB-', age: 31, gender: 'Male',   locationName: 'Gandhipuram',   mobile: '9843010016' },
  { fullName: 'Kiran',        username: 'kiran.ab',   bloodGroup: 'AB-', age: 27, gender: 'Male',   locationName: 'Singanallur',   mobile: '9843010017' },
  { fullName: 'Rohit',        username: 'rohit.ab',   bloodGroup: 'AB-', age: 33, gender: 'Male',   locationName: 'Ramanathapuram',mobile: '9843010018' },
  // O+
  { fullName: 'Arun',         username: 'arun.o',     bloodGroup: 'O+',  age: 26, gender: 'Male',   locationName: 'Peelamedu',     mobile: '9843010019' },
  { fullName: 'Karthik',      username: 'karthik.o',  bloodGroup: 'O+',  age: 30, gender: 'Male',   locationName: 'Gandhipuram',   mobile: '9843010020' },
  { fullName: 'Vijay',        username: 'vijay.o',    bloodGroup: 'O+',  age: 28, gender: 'Male',   locationName: 'RS Puram',      mobile: '9843010021' },
  { fullName: 'Manoj',        username: 'manoj.o',    bloodGroup: 'O+',  age: 32, gender: 'Male',   locationName: 'Saravanampatti',mobile: '9843010022' },
  { fullName: 'Pradeep',      username: 'pradeep.o',  bloodGroup: 'O+',  age: 29, gender: 'Male',   locationName: 'Podanur',       mobile: '9843010023' },
  // O-
  { fullName: 'Siva',         username: 'siva.o',     bloodGroup: 'O-',  age: 34, gender: 'Male',   locationName: 'Saibaba Colony',mobile: '9843010024' },
  { fullName: 'Hari',         username: 'hari.o',     bloodGroup: 'O-',  age: 26, gender: 'Male',   locationName: 'Singanallur',   mobile: '9843010025' },
  { fullName: 'Naveen',       username: 'naveen.o',   bloodGroup: 'O-',  age: 31, gender: 'Male',   locationName: 'Thudiyalur',    mobile: '9843010026' },
];

async function seedLocations() {
  for (const loc of CBE_LOCATIONS) {
    await Location.findOneAndUpdate(
      { locationName: loc.locationName },
      { $setOnInsert: loc, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`✅ Locations seeded (${CBE_LOCATIONS.length} Coimbatore locations).`);
}

async function seedAdmin() {
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await User.findOne({ username });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash, role: 'admin' });
    console.log(`✅ Admin created → username: ${username}  password: ${password}`);
  } else {
    console.log(`ℹ️  Admin already exists (${username}).`);
  }
}

async function seedSampleDonors() {
  const count = await Donor.countDocuments({});
  if (count > 0) {
    console.log(`ℹ️  Donors already present (${count}). Skipping donor seed.`);
    return;
  }
  const passwordHash = await bcrypt.hash('donor123', 10);
  for (const d of SAMPLE_DONORS) {
    const loc = await Location.findOne({ locationName: d.locationName });
    const user = await User.create({
      username: d.username, passwordHash, role: 'donor',
    });
    await Donor.create({
      userId: user._id,
      fullName: d.fullName,
      username: d.username,
      email: `${d.username}@example.com`,
      mobile: d.mobile,
      bloodGroup: d.bloodGroup,
      age: d.age,
      gender: d.gender,
      locationId: loc._id,
      locationName: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      availabilityStatus: 'Available',
      isVerified: true,
      isActive: true,
    });
  }
  console.log(`✅ Sample donors seeded (${SAMPLE_DONORS.length} fictional donors across all 8 blood groups).`);
}

async function seedSampleRequester() {
  const existing = await Requester.findOne({ username: 'requester1' });
  if (existing) { console.log('ℹ️  Sample requester already exists.'); return; }
  const passwordHash = await bcrypt.hash('requester123', 10);
  const user = await User.create({ username: 'requester1', passwordHash, role: 'requester' });
  await Requester.create({
    userId: user._id, fullName: 'Priya Subramanian', username: 'requester1',
    email: 'requester1@example.com', mobile: '9843099999', passwordHash,
  });
  console.log('✅ Sample requester created → username: requester1  password: requester123');
}

async function seedSampleRequest() {
  const reqCount = await BloodRequest.countDocuments({});
  if (reqCount > 0) { console.log('ℹ️  Blood requests already present.'); return; }
  const requester = await Requester.findOne({ username: 'requester1' });
  
  const sampleList = [
    { bloodGroup: 'O+', units: 2, hospital: 'KG Hospital, Peelamedu', loc: 'Peelamedu', urgency: 'Critical', msg: 'Emergency cardiac surgery. Need O+ blood urgently.' },
    { bloodGroup: 'A+', units: 3, hospital: 'PSG Hospitals, Peelamedu', loc: 'Peelamedu', urgency: 'Urgent', msg: 'Accident trauma patient. 3 units A+ required.' },
    { bloodGroup: 'B+', units: 1, hospital: 'Ganga Hospital, Gandhipuram', loc: 'Gandhipuram', urgency: 'Normal', msg: 'Scheduled orthopedic surgery.' },
    { bloodGroup: 'AB+', units: 2, hospital: 'Sri Ramakrishna Hospital, RS Puram', loc: 'RS Puram', urgency: 'Urgent', msg: 'Emergency maternity requirement.' },
    { bloodGroup: 'O-', units: 1, hospital: 'Royal Care Hospital, Neelambur', loc: 'Peelamedu', urgency: 'Critical', msg: 'Rare group emergency O- required.' },
  ];

  for (const s of sampleList) {
    const loc = await Location.findOne({ locationName: s.loc }) || await Location.findOne({});
    const reqId = await generateRequestId();
    const bloodRequest = await BloodRequest.create({
      requestId: reqId,
      requesterId: requester._id,
      requesterName: requester.fullName,
      bloodGroup: s.bloodGroup,
      unitsRequired: s.units,
      hospitalName: s.hospital,
      locationId: loc._id,
      locationName: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      urgency: s.urgency,
      requiredDate: new Date(Date.now() + 86400000),
      requiredTime: '18:00',
      message: s.msg,
      status: 'CREATED',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    await RequestStatusHistory.create({
      requestId: reqId, status: 'CREATED', note: `Sample request created by ${requester.fullName}.`, changedBy: 'requester1',
    });
    await processNewRequest(bloodRequest);
  }
  console.log(`✅ Sample blood requests seeded (${sampleList.length} requests across Coimbatore).`);
}

// Runs on every startup (idempotent)
async function ensureSeedData() {
  await seedLocations();
  await seedAdmin();
  await seedSampleDonors();
  await seedSampleRequester();
  await seedSampleRequest();
}

// Standalone: `npm run seed`
async function runStandalone() {
  const { connectDB, disconnectDB } = require('./config/db');
  await connectDB();
  await ensureSeedData();
  await disconnectDB();
  console.log('\n✅ Seed complete.');
  process.exit(0);
}

if (require.main === module) {
  runStandalone().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { ensureSeedData };
