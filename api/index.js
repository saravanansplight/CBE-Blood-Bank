const app = require('../server/src/server');
const { connectDB } = require('../server/src/config/db');
const { ensureSeedData } = require('../server/src/seed');

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!isInitialized) {
      try {
        await ensureSeedData();
      } catch (seedErr) {
        console.warn('Seed data warning:', seedErr.message);
      }
      isInitialized = true;
    }
  } catch (error) {
    console.error('Serverless function error connecting DB:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Database connection failed',
        message: error.message,
        hint: 'Please ensure MONGODB_URI is properly configured in your Vercel Project Environment Variables.'
      });
    }
  }
  return app(req, res);
};
