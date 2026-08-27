// ============================================================
// CBE BloodConnect - Database Connection
// ============================================================
// Connects to MongoDB Atlas when MONGODB_URI is set & reachable.
// Falls back to an in-memory MongoDB (mongodb-memory-server) for
// local dev demos only when running outside production/Vercel.
// ============================================================

const dns = require('dns');
const mongoose = require('mongoose');

// Set reliable DNS servers for resolving MongoDB Atlas SRV records on Windows local dev ONLY
// (Never run in Linux / AWS Lambda / Vercel serverless containers as it can break DNS resolution)
if (process.platform === 'win32' && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore if unable to override in sandboxed environments
  }
}

let memoryServer = null;

// Global cache for serverless environments (prevents connection leaks & race conditions across invocations)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return cached active connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is already in flight, await it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
    }
  }

  const rawUri = process.env.MONGODB_URI;
  const uri = rawUri && !rawUri.includes('<username>') && !rawUri.includes('<password>')
    ? rawUri.trim()
    : null;

  // Try real Atlas / Mongo connection first
  if (uri) {
    try {
      mongoose.set('strictQuery', true);
      cached.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
      }).then((m) => {
        console.log(`✅ MongoDB Atlas connected: ${m.connection.host}`);
        return m;
      });

      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.error(`❌ MongoDB Atlas connection error: ${err.message}`);
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        throw new Error(`MongoDB connection failed: ${err.message}. Please verify your MONGODB_URI in Vercel Project Settings.`);
      }
      console.warn('   Falling back to in-memory MongoDB for local dev...');
    }
  } else {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI is not configured in Vercel environment variables. Please add MONGODB_URI to your Vercel Project Settings under Environment Variables.');
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
    cached.conn = conn;
    console.log(`✅ In-memory MongoDB started (demo mode): ${memUri}`);
    return conn;
  } catch (err) {
    console.error('Failed to initialize in-memory MongoDB:', err.message);
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
  cached.conn = null;
  cached.promise = null;
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

