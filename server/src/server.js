// ============================================================
// CBE BloodConnect - Server Entry Point
// Coimbatore Blood Donor & Emergency Blood Request Management
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { connectDB, getDBStatus } = require('./config/db');
const { ensureSeedData } = require('./seed');

const app = express();

// ----- Security & core middleware -----
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ----- Rate limiting -----
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// ----- Static frontend (React build in production) -----
const clientBuild = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

// ----- API routes -----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/location'));
app.use('/api/blood-requests', require('./routes/bloodRequest'));
app.use('/api/donors', require('./routes/donor'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/requesters', require('./routes/requester'));
app.use('/api/search', require('./routes/search'));
app.use('/api/admin', require('./routes/admin'));

// ----- Health & Database status -----
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CBE BloodConnect', time: new Date().toISOString() }));
app.get('/api/db-status', (req, res) => res.json({ status: 'ok', ...getDBStatus() }));

// ----- SPA fallback: unknown non-API routes -> React index (if built) -----
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const clientIndex = path.join(__dirname, '../../client/dist/index.html');
  if (fs.existsSync(clientIndex)) return res.sendFile(clientIndex);
  res.status(404).json({ message: 'Not found. Frontend not built — run the React dev server (client/).' });
});

// ----- Error handler -----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await ensureSeedData(); // locations + sample donors + admin (idempotent)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🩸 CBE BloodConnect server running on http://localhost:${PORT}`);
    console.log(`   API base: http://localhost:${PORT}/api`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => { console.log('SIGTERM received, shutting down.'); process.exit(0); });
process.on('SIGINT', async () => { console.log('SIGINT received, shutting down.'); process.exit(0); });

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
