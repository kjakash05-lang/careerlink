const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      const timeoutMs = process.env.NODE_ENV === 'production' ? 15000 : 3000;
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
      console.log(`[MongoDB] Connected to Primary Database: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Primary connection attempt (${uri}) timed out or failed (${err.message}). Falling back to in-memory instance for development/testing...`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to In-Memory Database (Development/Test Mode): ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[MongoDB] Critical Database Connection Error:`, memErr);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
