/**
 * Database Connection Module
 * 
 * Handles MongoDB connection with Mongoose
 * Features:
 * - Automatic connection management
 * - Error handling and logging
 * - Connection pooling configuration
 * - Graceful shutdown
 * - Environment-based configuration
 */

const mongoose = require('mongoose');
const config = require('./index');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Initialize MongoDB connection
 * @async
 * @returns {Promise<void>}
 */
async function connectDB() {
  // Skip if no URI configured
  if (!config.mongoUri) {
    console.warn(
      `${colors.yellow}⚠️  WARNING: MONGO_URI not set in environment variables${colors.reset}`
    );
    console.warn(
      `${colors.yellow}    Running in memory-only mode. Data will NOT persist after restart.${colors.reset}`
    );
    console.warn(
      `${colors.yellow}    Set up MongoDB Atlas and add MONGO_URI to .env file.${colors.reset}\n`
    );
    return;
  }

  try {
    console.log(`${colors.blue}📡 Connecting to MongoDB...${colors.reset}`);

    // Connect to MongoDB with optimized settings
    await mongoose.connect(config.mongoUri, {
      // Connection pooling
      maxPoolSize: 10,      // Maximum connections in pool
      minPoolSize: 2,       // Minimum connections to maintain
      maxIdleTimeMS: 45000, // Close idle connections after 45 seconds

      // Retry settings
      retryWrites: true,    // Automatically retry on transient failures
      w: 'majority',        // Wait for majority node confirmation

      // Socket settings
      socketTimeoutMS: 45000,    // 45 second timeout for socket operations
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection

      // Journal and durability
      journal: true,        // Enable journaling for durability
    });

    console.log(`${colors.green}✅ Successfully connected to MongoDB!${colors.reset}`);
    
    // Log connection details
    const client = mongoose.connection.getClient();
    const uri = config.mongoUri || 'Unknown';
    const db = mongoose.connection.name || 'ai_resume';
    
    console.log(`${colors.blue}📊 Database: ${db}${colors.reset}`);
    console.log(`${colors.blue}🖥️  Connection: Active${colors.reset}\n`);

    // Set up event listeners
    setupConnectionListeners();

  } catch (error) {
    console.error(
      `${colors.red}❌ MongoDB Connection Failed!${colors.reset}`
    );
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);

    if (error.message.includes('authentication failed')) {
      console.error(`${colors.red}   Possible causes:${colors.reset}`);
      console.error(`${colors.red}   - Invalid username or password${colors.reset}`);
      console.error(`${colors.red}   - User does not have access to this database${colors.reset}`);
      console.error(`${colors.red}   - Special characters not URL-encoded in password${colors.reset}`);
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('EHOSTUNREACH')) {
      console.error(`${colors.red}   Possible causes:${colors.reset}`);
      console.error(`${colors.red}   - Network connectivity issue${colors.reset}`);
      console.error(`${colors.red}   - MongoDB server is down${colors.reset}`);
      console.error(`${colors.red}   - DNS resolution failed${colors.reset}`);
    } else if (error.message.includes('IP')) {
      console.error(`${colors.red}   Possible causes:${colors.reset}`);
      console.error(`${colors.red}   - Your IP is not whitelisted in MongoDB Atlas${colors.reset}`);
      console.error(`${colors.red}   - Check Network Access in MongoDB Atlas security settings${colors.reset}`);
    }

    console.error(`\n${colors.yellow}ℹ️  Visit: ${colors.reset}https://docs.mongodb.com/manual/reference/error-messages/\n`);

    // Continue running without DB for local development
    console.warn(
      `${colors.yellow}⚠️  Continuing without database connection (local mode)${colors.reset}\n`
    );
  }
}

/**
 * Set up MongoDB connection event listeners
 */
function setupConnectionListeners() {
  const conn = mongoose.connection;

  conn.on('error', (err) => {
    console.error(`${colors.red}❌ MongoDB Error: ${err.message}${colors.reset}`);
  });

  conn.on('disconnected', () => {
    console.warn(`${colors.yellow}⚠️  Disconnected from MongoDB${colors.reset}`);
  });

  conn.on('reconnected', () => {
    console.log(`${colors.green}✅ Reconnected to MongoDB${colors.reset}`);
  });

  conn.on('close', () => {
    console.log(`${colors.blue}🔒 MongoDB connection closed${colors.reset}`);
  });

  conn.on('open', () => {
    console.log(`${colors.green}✅ MongoDB connection opened${colors.reset}`);
  });
}

/**
 * Gracefully close database connection
 * @async
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      console.log(`${colors.blue}🔌 Closing MongoDB connection...${colors.reset}`);
      await mongoose.disconnect();
      console.log(`${colors.green}✅ MongoDB connection closed${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error closing MongoDB: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Get current connection status
 * @returns {Object} Connection status details
 */
function getConnectionStatus() {
  const conn = mongoose.connection;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  return {
    ready: conn.readyState === 1,
    state: states[conn.readyState],
    readyState: conn.readyState,
    host: conn.host,
    port: conn.port,
    name: conn.name,
  };
}

/**
 * Drop all collections (WARNING: Development only!)
 * @async
 * @returns {Promise<void>}
 */
async function dropAllCollections() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot drop collections in production mode!');
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany({});
      console.log(`${colors.green}✅ Cleared ${key} collection${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Error clearing ${key}: ${error.message}${colors.reset}`);
    }
  }
}

/**
 * Seed database with initial data
 * @async
 * @param {Array} seedData - Data to seed
 * @returns {Promise<void>}
 */
async function seedDatabase(seedData) {
  if (!Array.isArray(seedData) || seedData.length === 0) {
    console.warn(`${colors.yellow}⚠️  No seed data provided${colors.reset}`);
    return;
  }

  try {
    console.log(`${colors.blue}🌱 Seeding database...${colors.reset}`);
    
    for (const item of seedData) {
      if (item.model && item.data) {
        await item.model.insertMany(item.data, { ordered: false });
        console.log(`${colors.green}✅ Seeded ${item.model.collection.name}${colors.reset}`);
      }
    }

    console.log(`${colors.green}✅ Database seeding complete${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Seeding failed: ${error.message}${colors.reset}`);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  dropAllCollections,
  seedDatabase,
};
