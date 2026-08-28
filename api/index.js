// ============================================================
// CBE BloodConnect - Vercel Serverless Function Handler
// Exports the Express app for @vercel/node runtime
// ============================================================

// Signal to server code that we are running on Vercel
process.env.VERCEL = '1';

let app;
try {
  app = require('../server/src/server');
} catch (err) {
  console.error('❌ Failed to load server module:', err);
  // Return a minimal handler that reports the error
  app = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: err.message,
      hint: 'Check Vercel build logs for missing dependencies or configuration issues.'
    });
  };
}

module.exports = app;
