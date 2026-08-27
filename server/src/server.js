// ============================================================
// CBE BloodConnect - Server Entry Point
// Coimbatore Blood Donor & Emergency Blood Request Management
// ============================================================
const path = require('path');
const fs = require('fs');

// Multi-path environment variable resolution (supports root and /server execution)
require('dotenv').config();
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB, getDBStatus } = require('./config/db');
const { ensureSeedData } = require('./seed');

const app = express();

// ----- Security & core middleware -----
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ----- Rate limiting (skip in test or adjust for serverless) -----
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// ----- Vercel rewrite URL normalizer middleware -----
app.use((req, res, next) => {
  // If running on Vercel and req.url got rewritten to /api/index.js without subpath
  if (req.url.startsWith('/api/index.js')) {
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
    if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
      req.url = matchedPath;
    }
  }
  next();
});

// ----- Database connection middleware (runs for API routes) -----
let seedTriggered = false;
app.use(async (req, res, next) => {
  // Only connect to DB on API requests
  const isApiReq = req.path.startsWith('/api') || !fs.existsSync(path.join(__dirname, '../../client/dist'));
  if (isApiReq) {
    try {
      await connectDB();
      // Asynchronously trigger initial seed on first connection if needed (non-blocking)
      if (!seedTriggered) {
        seedTriggered = true;
        ensureSeedData().catch((seedErr) => {
          console.warn('⚠️ Initial seed warning:', seedErr.message);
        });
      }
      next();
    } catch (err) {
      console.error('❌ Database middleware connection error:', err.message);
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Database connection failed',
          message: err.message,
          hint: 'Please ensure MONGODB_URI is properly configured in your Vercel Project Settings (Environment Variables).'
        });
      }
    }
  } else {
    next();
  }
});

// ----- API Routes router -----
const apiRouter = express.Router();

apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/locations', require('./routes/location'));
apiRouter.use('/blood-requests', require('./routes/bloodRequest'));
apiRouter.use('/donors', require('./routes/donor'));
apiRouter.use('/notifications', require('./routes/notification'));
apiRouter.use('/requesters', require('./routes/requester'));
apiRouter.use('/search', require('./routes/search'));
apiRouter.use('/admin', require('./routes/admin'));

// Health & Database status
apiRouter.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'CBE BloodConnect',
  runtime: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
  time: new Date().toISOString()
}));
apiRouter.get('/db-status', (req, res) => res.json({ status: 'ok', ...getDBStatus() }));

// Mount apiRouter on both '/api' and '/' so requests match under any Vercel rewrite scheme
app.use('/api', apiRouter);
app.use('/', apiRouter);

// ----- Static frontend (React build in production / standalone server) -----
const clientBuild = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
}

// ----- SPA fallback: unknown non-API routes -> React index (if built) -----
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/api') return next();
  const clientIndex = path.join(__dirname, '../../client/dist/index.html');
  if (fs.existsSync(clientIndex)) return res.sendFile(clientIndex);
  res.status(404).json({ message: 'Not found. Frontend not built — run the React dev server (client/).' });
});

// ----- Error handler -----
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message || 'Something went wrong. Please try again.'
    });
  }
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

