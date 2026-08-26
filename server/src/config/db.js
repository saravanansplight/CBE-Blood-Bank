// ============================================================
// CBE BloodConnect - Database Connection
// ============================================================
// Connects to MongoDB Atlas when MONGODB_URI is set & reachable.
// Falls back to an in-memory MongoDB (mongodb-memory-server) for
// local dev demos only when running outside production/Vercel.
// ============================================================

const dns = require('dns');
const mongoose = require('mongoose');

// Set reliable DNS servers for resolving MongoDB Atlas SRV records (fixes Windows querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if unable to override in sandboxed environments
}

let memoryServer = null;
let cachedConnection = null;

async function connectDB() {
  // Return cached active connection if available (for serverless environments)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')
    ? process.env.MONGODB_URI
    : null;

  // Try real Atlas / Mongo connection first
  if (uri) {
    try {
      mongoose.set('strictQuery', true);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 6000,
      });
      cachedConnection = conn;
      console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️  Could not reach MONGODB_URI (${err.message}).`);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        throw new Error(`MongoDB connection failed: ${err.message}. Ensure your MONGODB_URI is correct in Vercel environment variables.`);
      }
      console.warn('   Falling back to in-memory MongoDB for local dev...');
    }
  } else {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI is not configured in Vercel environment variables. Please set MONGODB_URI in your Vercel Project Settings.');
    }
    console.log('ℹ️  No MONGODB_URI configured. Using in-memory MongoDB (demo mode).');
    console.log('   Set MONGODB_URI in .env to use MongoDB Atlas.');
  }

  // Fallback: in-memory mongo for local development only
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memVersion = process.env.MONGOMS_VERSION || '8.0.8';
    console.log('   Preparing in-memory MongoDB (downloading/starting)...');
    memoryServer = await MongoMemoryServer.create({
      binary: { version: memVersion },
      instance: { launchTimeout: 300000 },
    });
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    cachedConnection = conn;
    console.log(`✅ In-memory MongoDB started (demo mode): ${memUri}`);
    return conn;
  } catch (err) {
    console.error('Failed to initialize in-memory MongoDB:', err);
    throw err;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (memoryServer) {
    await memoryServer.stop();
  }
  cachedConnection = null;
}

function getDBStatus() {
  const isConnected = mongoose.connection.readyState === 1;
  const isMemory = !!memoryServer;
  return {
    connected: isConnected,
    type: isConnected ? (isMemory ? 'in-memory' : 'atlas') : 'disconnected',
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'bloodconnect',
    isMemory,
  };
}

module.exports = { connectDB, disconnectDB, getDBStatus };
