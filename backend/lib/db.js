/**
 * lib/db.js
 * Reuses a single Mongoose connection across all serverless function invocations.
 * Vercel keeps the Node.js process warm between requests, so this avoids
 * opening a new connection on every call.
 */
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to resolve querySrv ECONNREFUSED issues on some networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please set the MONGODB_URI environment variable.');
}

// Cache the connection on the global object so it survives hot-reloads
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
