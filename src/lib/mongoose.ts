import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

// Use global cache to survive Vercel hot-reloads between requests
const cached = (global as any).mongoose ?? { conn: null, promise: null };
(global as any).mongoose = cached;

async function connectToDatabase() {
  // Already have a cached connection
  if (cached.conn) return cached.conn;

  // Reuse existing connection only when fully established (readyState 1 = connected)
  // readyState 2 = connecting — do NOT short-circuit or Product.find() will race
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,             // max concurrent connections in pool
      minPoolSize: 2,              // keep 2 warm — reduces cold-start reconnect time
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,                   // skip IPv6 — Vercel is IPv4 only
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
