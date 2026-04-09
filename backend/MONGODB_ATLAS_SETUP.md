# 🚀 MongoDB Atlas Integration Guide

## Overview

This guide walks you through setting up **MongoDB Atlas** (cloud-based MongoDB) and connecting it to your backend. MongoDB Atlas is the official cloud service from MongoDB and is the recommended way to run MongoDB in production.

---

## Table of Contents

1. [Why MongoDB Atlas?](#why-mongodb-atlas)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Connection String](#connection-string)
4. [Environment Configuration](#environment-configuration)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Security Best Practices](#security-best-practices)
8. [Advanced Configuration](#advanced-configuration)

---

## Why MongoDB Atlas?

✅ **Cloud-hosted** - No server management needed  
✅ **Scalable** - Automatically scales with your needs  
✅ **Secure** - Built-in security features and backups  
✅ **Free tier** - 512MB storage for development  
✅ **Easy monitoring** - Real-time metrics and alerts  
✅ **Global availability** - Multiple regions to choose from  

---

## Step-by-Step Setup

### Step 1: Create a MongoDB Atlas Account

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up using:
   - Email/Password, or
   - Google Account, or
   - GitHub Account

### Step 2: Create a New Project

1. After login, click **"Create Project"**
2. Give it a name (e.g., "AI Resume Builder")
3. Click **"Create Project"**

### Step 3: Create a Cluster

1. Click **"Build a Database"** or **"Create Deployment"**
2. Choose **"M0 Free"** (free tier, perfect for development)
3. Select your preferred cloud provider:
   - AWS (recommended)
   - Azure
   - Google Cloud
4. Select your region (closest to your users):
   - **us-east-1** (N. Virginia) - Recommended for US
   - **eu-west-1** (Ireland) - For Europe
5. Click **"Create Deployment"**

### Step 4: Set Up Authentication

1. Create a database user:
   - Click **"Security" → "Database Access"**
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Username: `mongouser` (or your preference)
   - Password: Generate a strong password (copy it - you'll need it!)
   - Database User Privileges: **"Read and write to any database"**
   - Click **"Add User"**

2. Configure network access:
   - Click **"Security" → "Network Access"**
   - Click **"Add IP Address"**
   - Choose **"Allow Access from Anywhere"** (for development)
     - Or add your specific IP for production
   - Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Deployments"** / **"Clusters"**
2. Click **"Connect"** on your cluster
3. Select **"Connect Your Application"**
4. Choose:
   - Driver: **"Node.js"**
   - Version: **"5.9 or later"** (or latest)
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Connection String

### Format

```
mongodb+srv://mongouser:password@cluster0.abcde.mongodb.net/ai_resume?retryWrites=true&w=majority
```

### Components

| Part | Meaning | Example |
|------|---------|---------|
| `mongodb+srv` | Protocol | Always `mongodb+srv` for Atlas |
| `mongouser` | Database username | Your created user |
| `password` | Database password | Your secure password |
| `cluster0.abcde` | Cluster name | From your Atlas dashboard |
| `mongodb.net` | Domain | Always `mongodb.net` |
| `ai_resume` | Database name | Your app's database |
| `?retryWrites=true` | Option | Automatic retry on failure |
| `&w=majority` | Option | Wait for majority of nodes |

### ⚠️ Important

- **NEVER** commit your connection string to Git
- **NEVER** share it publicly
- Always use environment variables (see below)

---

## Environment Configuration

### Step 1: Create `.env` File

In the backend directory, create a `.env` file (not in version control):

```bash
# Backend: backend/.env

# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://mongouser:YOUR_PASSWORD_HERE@cluster0.abcde.mongodb.net/ai_resume?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: AI and File Storage
OPENAI_API_KEY=sk-your-api-key-here
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_KEY=your-aws-key
S3_SECRET=your-aws-secret
```

### Step 2: Update `.env.example`

Keep this in version control (without real credentials):

```bash
# Backend: backend/.env.example

PORT=4000
NODE_ENV=development

# MongoDB Atlas URI (format: mongodb+srv://username:password@cluster.mongodb.net/database)
MONGO_URI=mongodb+srv://mongouser:password@cluster0.xxxxx.mongodb.net/ai_resume?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_here_change_in_production

OPENAI_API_KEY=
S3_BUCKET=
S3_REGION=
S3_KEY=
S3_SECRET=
```

### Step 3: Verify `.env` is Ignored

Check your `.gitignore`:

```bash
# backend/.gitignore

node_modules/
.env
.env.local
.env.*.local
.DS_Store
dist/
build/
*.log
```

---

## Verification & Testing

### Option 1: Using MongoDB Compass

1. Download **[MongoDB Compass](https://www.mongodb.com/products/compass)** (GUI)
2. Go to your cluster → **"Connect" → "Connect with MongoDB Compass"**
3. Copy the connection string
4. Open Compass and paste it
5. You should see your database and collections

### Option 2: Using Node.js Script

Create `test-db.js` in the backend directory:

```javascript
// backend/test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('\n📦 Available databases:');
    dbs.databases.forEach(db => console.log(`  - ${db.name}`));
    
    // List collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in current database:');
    if (collections.length === 0) {
      console.log('  (No collections yet - will be created when data is saved)');
    } else {
      collections.forEach(col => console.log(`  - ${col.name}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run it:

```bash
cd backend
node test-db.js
```

Expected output:

```
Connecting to MongoDB Atlas...
✅ Successfully connected to MongoDB!

📦 Available databases:
  - admin
  - ai_resume

📚 Collections in current database:
  (No collections yet - will be created when data is saved)
```

### Option 3: Test with the API

1. Start your server:
   ```bash
   npm run dev
   ```

2. Check the console output:
   ```
   Connected to MongoDB
   Server listening on port 4000
   ```

3. Test API endpoints:

   **Register a user:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@example.com","password":"password123"}'
   ```

   **Response:**
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "email": "john@example.com",
       "name": "John"
     }
   }
   ```

4. Check MongoDB Atlas:
   - Go to **"Browse Collections"**
   - You should see the new user in the `users` collection

---

## Troubleshooting

### ❌ "connect ENOENT"

**Problem:** Cannot connect to MongoDB

**Solutions:**
1. Check your `.env` file has correct `MONGO_URI`
2. Verify MongoDB Atlas cluster is running (not paused)
3. Check network access is allowed in Atlas (Security → Network Access)
4. Make sure your IP is whitelisted

### ❌ "MongoServerError: bad auth"

**Problem:** Authentication failed

**Solutions:**
1. Verify username and password in connection string
2. Check if database user exists (Security → Database Access)
3. Make sure password doesn't have special characters without URL encoding
4. If password has `@`, `:`, etc., it needs to be URL-encoded:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`

### ❌ "MongooseError: Model.findOne() requires a callback"

**Problem:** Using old callback-based syntax

**Solution:** Make sure you're using async/await or `.then()`:

```javascript
// ❌ Wrong
const user = User.findById(id);

// ✅ Correct - async/await
const user = await User.findById(id);

// ✅ Correct - .then()
User.findById(id).then(user => { ... });
```

### ❌ "MongooseError: Cannot connect to MongoDB"

**Problem:** Mongoose can't reach the database

**Solutions:**
1. Ensure `MONGO_URI` is set before app starts
2. Check if MongoDB Atlas is responding (check status page)
3. Try connecting manually to verify credentials
4. Check if your local firewall is blocking outbound connections

### ❌ "Cluster requires IP whitelist entry"

**Problem:** Your IP is not whitelisted

**Solution:**
- In Atlas → Security → Network Access → Add IP Address
- For development: Choose "Allow Access from Anywhere"
- For production: Add only your server's IP

### Data Not Persisting?

**Check:**
1. ✅ Are you using `await` when saving?
2. ✅ Are you seeing "Connected to MongoDB" in logs?
3. ✅ Check MongoDB Atlas → Browse Collections → see data there?
4. ✅ Is your route handler actually being called? (Add `console.log()`)

---

## Security Best Practices

### 1. Never Hardcode Credentials

❌ Bad:
```javascript
mongoose.connect('mongodb+srv://user:pass@cluster.mongodb.net/db');
```

✅ Good:
```javascript
mongoose.connect(process.env.MONGO_URI);
```

### 2. Use Strong Passwords

- At least 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `P@ssw0rd!Secure123Key`

### 3. Rotate Credentials Regularly

- Change database user passwords every 90 days
- Monitor access logs in Atlas

### 4. Limit Database Permissions

❌ Too broad:
```
Read and write to any database
```

✅ Better (when available):
```
Read and write to 'ai_resume' database only
Read specific collections only
```

### 5. Enable MongoDB Atlas Features

- **Enable Encryption at Rest** (enabled by default)
- **Enable TLS/SSL** (always use `mongodb+srv://`)
- **Enable Audit Logs** (for production)
- **Enable Backups** (restore point-in-time)

### 6. Production Deployment Checklist

Before going live:

- [ ] `.env` is in `.gitignore`
- [ ] `NODE_ENV=production` in production `.env`
- [ ] Use M10+ cluster (not M0 free tier)
- [ ] Enable IP whitelist (specific IPs only)
- [ ] Enable database user permissions for specific databases
- [ ] Use strong, unique JWT secret
- [ ] Enable backups and monitoring
- [ ] Set up alerts for errors and high load
- [ ] Document your connection procedure

---

## Advanced Configuration

### MongoDB URI Options

Add these to your connection string for advanced behavior:

```
mongodb+srv://user:pass@cluster.mongodb.net/db?
  retryWrites=true           # Retry writes on transient failures
  &w=majority                # Wait for majority node confirmation
  &journal=true              # Enable journaling
  &maxPoolSize=10            # Max connection pool size
  &minPoolSize=2             # Min connection pool size
  &maxIdleTimeMS=45000       # Close idle connections after 45s
```

### Connection Pooling

Mongoose automatically manages connection pooling. To customize:

```javascript
// server.js
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,           // Maximum connections
  minPoolSize: 2,            // Minimum connections
  maxIdleTimeMS: 45000,      // Close idle after 45 seconds
  retryWrites: true,         // Automatic retry
  w: 'majority',             // Wait for majority
});
```

### Read Preferences

For read-heavy applications, distribute reads across replicas:

```javascript
mongoose.connect(process.env.MONGO_URI, {
  readPreference: 'secondaryPreferred', // Read from secondary if available
});
```

Options:
- `primary` - Always read from primary (default)
- `secondary` - Always read from secondary
- `secondaryPreferred` - Secondary if available, otherwise primary
- `primaryPreferred` - Primary if available, otherwise secondary

### Transactions (Advanced)

For ACID transactions across multiple documents:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create([{ email: 'user@example.com' }], { session });
  await Resume.create([{ userId: user._id, title: 'Resume' }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

---

## Monitoring & Analytics

### In MongoDB Atlas Dashboard

1. **Deployments** - Cluster status and performance
2. **Metrics** - CPU, Memory, Network usage
3. **Logs** - Application and database logs
4. **Alerts** - Set up notifications for issues
5. **Backups** - Automatic daily backups included

### Recommended Alerts

- Database CPU > 80%
- Connection count > 100
- Replication lag > 10 seconds
- Read/write errors

---

## Next Steps

1. ✅ Set up MongoDB Atlas account and cluster
2. ✅ Create database user and get connection string
3. ✅ Add `MONGO_URI` to `.env` file
4. ✅ Test connection with provided test script
5. ✅ Start your backend server (`npm run dev`)
6. ✅ Test API endpoints to verify data persistence
7. ✅ (Optional) Set up MongoDB Compass for visual data exploration
8. ✅ (Optional) Set up alerts in MongoDB Atlas

---

## Support & Resources

- **MongoDB Atlas Documentation**: https://docs.mongodb.com/manual/
- **Mongoose Documentation**: https://mongoosejs.com/
- **MongoDB Atlas Status**: https://status.mongodb.com/
- **Common Errors**: https://docs.mongodb.com/manual/reference/error-messages/

---

## Quick Reference

### Connection String Template
```
mongodb+srv://mongouser:password@cluster0.xxxxx.mongodb.net/ai_resume?retryWrites=true&w=majority
```

### Test Connection
```bash
node test-db.js
```

### Start Server with DB
```bash
npm run dev
```

### View Data
- **Command Line**: `mongosh` with connection string
- **GUI**: MongoDB Compass
- **Web**: MongoDB Atlas → Browse Collections

---

**Status: ✅ Ready for Production**

Your application is now connected to MongoDB Atlas! All user and resume data will be persistently stored in the cloud.
