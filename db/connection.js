const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'console_games';

let client = null;
let db = null;
let connectPromise = null;

/**
 * Establishes connection to MongoDB with timeout and retry logic
 * @returns {Promise<Db>} MongoDB database instance
 */
async function connect() {
  // Return existing connection
  if (db) {
    return db;
  }

  // Return in-progress connection to prevent race condition
  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    try {
      // Connection options with timeout and security settings
      const options = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true
      };

      client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      db = client.db(DB_NAME);
      console.log(`✓ Connected to MongoDB: ${DB_NAME}`);
      return db;
    } catch (error) {
      // Reset promise on failure to allow retry
      connectPromise = null;
      console.error('✗ MongoDB connection failed:', error.message);
      throw error;
    }
  })();

  return connectPromise;
}

/**
 * Closes MongoDB connection
 */
async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✓ Disconnected from MongoDB');
  }
}

/**
 * Gets the database instance (must call connect first)
 * @returns {Db} MongoDB database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

/**
 * Gets a collection from the database
 * @param {string} collectionName - Name of the collection
 * @returns {Collection} MongoDB collection instance
 */
function getCollection(collectionName) {
  const database = getDb();
  return database.collection(collectionName);
}

module.exports = {
  connect,
  disconnect,
  getDb,
  getCollection
};
