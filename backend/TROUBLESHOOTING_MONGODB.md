# 🔧 MongoDB Integration Troubleshooting & Verification Guide

## Quick Diagnostics

Before troubleshooting, run this diagnostic script to identify issues:

### Create `backend/diagnose.js`:

```javascript
// backend/diagnose.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function diagnose() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   MongoDB Integration Diagnostic${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // 1. Check .env file
  console.log(`${colors.blue}1️⃣  Checking .env file...${colors.reset}`);
  if (fs.existsSync('.env')) {
    console.log(`${colors.green}   ✅ .env file exists${colors.reset}`);
    if (process.env.MONGO_URI) {
      console.log(`${colors.green}   ✅ MONGO_URI is set${colors.reset}`);
      const uri = process.env.MONGO_URI;
      console.log(`${colors.yellow}   URI: ${uri.substring(0, 40)}...${colors.reset}`);
    } else {
      console.log(`${colors.red}   ❌ MONGO_URI is NOT set${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}   ❌ .env file not found${colors.reset}`);
  }

  // 2. Check Node environment
  console.log(`\n${colors.blue}2️⃣  Checking Node.js environment...${colors.reset}`);
  console.log(`${colors.yellow}   Node Version: ${process.version}${colors.reset}`);
  console.log(`${colors.yellow}   NODE_ENV: ${process.env.NODE_ENV || 'not set'}${colors.reset}`);

  // 3. Check dependencies
  console.log(`\n${colors.blue}3️⃣  Checking dependencies...${colors.reset}`);
  const packages = ['mongoose', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
  for (const pkg of packages) {
    try {
      require.resolve(pkg);
      console.log(`${colors.green}   ✅ ${pkg} is installed${colors.reset}`);
    } catch {
      console.log(`${colors.red}   ❌ ${pkg} is NOT installed${colors.reset}`);
    }
  }

  // 4. Test MongoDB connection
  console.log(`\n${colors.blue}4️⃣  Testing MongoDB connection...${colors.reset}`);
  try {
    console.log(`${colors.yellow}   Connecting...${colors.reset}`);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
    });
    console.log(`${colors.green}   ✅ Connected to MongoDB${colors.reset}`);

    // Get connection details
    const conn = mongoose.connection;
    console.log(`${colors.yellow}   Database: ${conn.name}${colors.reset}`);
    console.log(`${colors.yellow}   Host: ${conn.host}${colors.reset}`);
    console.log(`${colors.yellow}   Port: ${conn.port}${colors.reset}`);

    // Check collections
    const collections = await conn.db.listCollections().toArray();
    console.log(`${colors.yellow}   Collections: ${collections.length}${colors.reset}`);
    collections.forEach(c => console.log(`     - ${c.name}`));

    await mongoose.disconnect();
  } catch (error) {
    console.log(`${colors.red}   ❌ Connection failed${colors.reset}`);
    console.log(`${colors.red}   Error: ${error.message}${colors.reset}`);

    // Provide helpful hints
    if (error.message.includes('authentication failed')) {
      console.log(`${colors.yellow}\n   💡 Hint: Check username and password in MONGO_URI${colors.reset}`);
    } else if (error.message.includes('ENOTFOUND')) {
      console.log(`${colors.yellow}\n   💡 Hint: Check network connection or DNS resolution${colors.reset}`);
    } else if (error.message.includes('IP')) {
      console.log(`${colors.yellow}\n   💡 Hint: IP might not be whitelisted in MongoDB Atlas${colors.reset}`);
    }
  }

  // 5. Check models
  console.log(`\n${colors.blue}5️⃣  Checking models...${colors.reset}`);
  const modelFiles = ['User.js', 'Resume.js'];
  for (const file of modelFiles) {
    if (fs.existsSync(`src/models/${file}`)) {
      console.log(`${colors.green}   ✅ ${file} exists${colors.reset}`);
    } else {
      console.log(`${colors.red}   ❌ ${file} NOT found${colors.reset}`);
    }
  }

  console.log(
    `\n${colors.blue}═══════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.green}Diagnostic complete!${colors.reset}\n`);
}

diagnose().catch(console.error);
```

Run it:

```bash
cd backend
node diagnose.js
```

---

## Common Issues & Solutions

### ❌ Issue 1: "Cannot read property 'connect' of undefined"

**Error Message:**
```
Cannot read property 'connect' of undefined
```

**Cause:** Mongoose not imported or installed

**Solution:**

```bash
# Check if mongoose is installed
npm list mongoose

# If not, install it
npm install mongoose
```

---

### ❌ Issue 2: "MONGO_URI is not defined"

**Error Message:**
```
Error: MONGO_URI is not set in environment variables
```

**Cause:** `.env` file not created or MONGO_URI not set

**Solution:**

1. Check if `.env` exists:
   ```bash
   ls -la | grep .env
   ```

2. If not, create it:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your MongoDB Atlas URI:
   ```bash
   # backend/.env
   MONGO_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/ai_resume?retryWrites=true&w=majority
   ```

4. Verify it's loaded:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
   ```

---

### ❌ Issue 3: "MongoServerError: bad auth"

**Error Message:**
```
MongoServerError: bad auth Authentication failed
```

**Cause:** Invalid username or password

**Solution:**

1. Verify credentials in MongoDB Atlas:
   - Go to: Security → Database Access
   - Check if user exists
   - Reset password if needed

2. Check for special characters in password:
   ```
   ✅ Correct: mongodb+srv://user:p%40ssword@cluster.mongodb.net
   ❌ Wrong:   mongodb+srv://user:p@ssword@cluster.mongodb.net
   ```

3. URL-encode special characters:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`

---

### ❌ Issue 4: "MongoNetworkError: connect ECONNREFUSED"

**Error Message:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** Connecting to local MongoDB that's not running

**Solution:**

For **MongoDB Atlas** (cloud):
- This shouldn't happen with proper URI
- Check connection string starts with `mongodb+srv://`

For **local MongoDB**:
- Start MongoDB service:
  ```bash
  # macOS with Homebrew
  brew services start mongodb-community

  # Windows
  net start MongoDB

  # Linux
  sudo systemctl start mongod
  ```

---

### ❌ Issue 5: "MongoNetworkError: IP is not whitelisted"

**Error Message:**
```
MongoNetworkError: connect ETIMEDOUT
(Usually happens when IP not whitelisted)
```

**Cause:** Your IP is not whitelisted in MongoDB Atlas

**Solution:**

1. Go to MongoDB Atlas Dashboard
2. Navigate to: **Security → Network Access**
3. Click: **"Add IP Address"**
4. Choose one:
   - **"Allow Access from Anywhere"** (development)
   - **"Add current IP"** (recommended for production)
5. Click: **"Confirm"**
6. Wait 5-10 minutes for changes to propagate

---

### ❌ Issue 6: "MongooseError: Cannot connect to MongoDB"

**Error Message:**
```
MongooseError: Cannot connect to MongoDB
```

**Cause:** Multiple possible causes

**Solution:**

Check in order:

1. **Is MongoDB Atlas cluster running?**
   - Go to Deployments
   - Look for green "Running" status
   - If grayed out, click to resume

2. **Is network connectivity working?**
   ```bash
   # Test network
   ping 8.8.8.8
   
   # Test DNS
   nslookup cluster0.xxxxx.mongodb.net
   ```

3. **Is connection string correct?**
   - Verify format: `mongodb+srv://user:pass@cluster.host/db`
   - No typos in host name
   - Password is URL-encoded

4. **Is firewall blocking outbound?**
   - Check if port 27017 is open (or 443 for SRV)
   - Try from different network (mobile hotspot)

---

### ❌ Issue 7: "Collection not found" when starting app

**This is normal!** Collections are created automatically when:
- First document is inserted
- Or you explicitly create them in MongoDB

**Expected:**
```
📡 Connecting to MongoDB...
✅ Successfully connected to MongoDB!
📊 Database: ai_resume
(No collections yet - will be created when data is saved)
```

---

### ❌ Issue 8: "Data not persisting after restart"

**Checklist:**

1. **Are you using MongoDB Atlas or local?**
   - Atlas = persists (unless cluster paused)
   - Local = persists (if MongoDB service running)
   - In-memory = does NOT persist

2. **Is data actually saved?**
   ```bash
   # Check MongoDB directly
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/db"
   use ai_resume
   db.resumes.find()
   ```

3. **Is MongoDB cluster paused?**
   - Check MongoDB Atlas dashboard
   - M0 free clusters pause after 1 week of inactivity
   - Click "Resume" if needed

---

### ❌ Issue 9: "MongooseError: Model.create() failed"

**Error Message:**
```
MongooseError: Model.create() failed: validation error
```

**Cause:** Required fields missing or invalid data

**Solution:**

Check User model example:

```javascript
// ✅ Correct
await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  passwordHash: 'hashed_password_here'
});

// ❌ Wrong - missing required field
await User.create({
  name: 'John Doe',
  email: 'john@example.com'
  // Missing passwordHash!
});
```

---

### ❌ Issue 10: "Cannot find module 'mongoose'"

**Error Message:**
```
Error: Cannot find module 'mongoose'
```

**Cause:** Mongoose not installed

**Solution:**

```bash
# Navigate to backend
cd backend

# Install mongoose
npm install mongoose

# Verify
npm list mongoose
```

---

## Performance Issues

### Issue: Queries are slow

**Symptoms:**
- Endpoints taking 2+ seconds
- "Slow query" warnings in MongoDB

**Solution:**

1. **Add indexes:**
   ```javascript
   // In model file
   userSchema.index({ email: 1 });
   resumeSchema.index({ userId: 1, createdAt: -1 });
   ```

2. **Limit query results:**
   ```javascript
   // Bad
   const allResumes = await Resume.find({ userId });
   
   // Good
   const resumes = await Resume.find({ userId })
     .limit(10)
     .sort({ createdAt: -1 });
   ```

3. **Use projections:**
   ```javascript
   // Bad - gets all fields
   const users = await User.find();
   
   // Good - only needed fields
   const users = await User.find().select('name email');
   ```

---

## Connection Pool Issues

### Issue: "Too many connections" error

**Error Message:**
```
MongoNetworkError: Too many connections to database
```

**Solution:**

Adjust connection pooling:

```javascript
// server.js
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

---

## Monitoring & Health Checks

### Add health check endpoint

```javascript
// backend/src/routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: dbConnected ? 'connected' : 'disconnected',
    memoryUsage: process.memoryUsage(),
  });
});

module.exports = router;
```

Call it:
```bash
curl http://localhost:4000/health
```

---

## Verify Everything is Working

### Verification Checklist

Run through these steps:

```bash
# 1. Check environment
npm --version
node --version

# 2. Check dependencies
npm list mongoose bcryptjs jsonwebtoken

# 3. Run diagnostic
node diagnose.js

# 4. Start server
npm run dev

# 5. In another terminal, register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 6. Check in MongoDB Atlas
# Go to Browse Collections - should see user

# 7. Restart server and verify data still there
# (Ctrl+C to stop, npm run dev to restart)

# 8. Fetch user to verify
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Debugging Tips

### Enable verbose logging

```javascript
// server.js
mongoose.set('debug', true);

// This will log all MongoDB operations
```

### Add console logging to controllers

```javascript
// Before operation
console.log('📝 Creating resume...', req.body);

// After operation
console.log('✅ Resume created:', result._id);

// On error
console.error('❌ Error:', error.message);
```

### Check MongoDB Atlas logs

1. Go to MongoDB Atlas Dashboard
2. Deployments → Click your cluster
3. "Logs" tab → View logs

### Use MongoDB Compass

Visual debugging:

1. Download: https://www.mongodb.com/products/compass
2. Connect with your Atlas URI
3. Browse collections and documents
4. Manually query and test

---

## Reset Everything

If you want to start fresh:

### Option 1: Clear all data

```bash
# Create src/scripts/reset.js
require('dotenv').config();
const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
    console.log(`✅ Cleared ${key}`);
  }

  process.exit(0);
}

reset().catch(console.error);
```

Run: `node src/scripts/reset.js`

### Option 2: Delete and recreate database

In MongoDB Atlas:

1. Go to Deployments
2. Cluster Settings
3. Delete Database

---

## Support Resources

| Resource | URL |
|----------|-----|
| MongoDB Docs | https://docs.mongodb.com |
| Mongoose Guide | https://mongoosejs.com |
| Atlas Troubleshooting | https://docs.atlas.mongodb.com/troubleshoot-connection |
| Error Reference | https://docs.mongodb.com/manual/reference/error-messages |

---

## Summary

### Most Common Fixes (in order)

1. **Create `.env` with `MONGO_URI`** (50% of issues)
2. **Whitelist IP in MongoDB Atlas** (30% of issues)
3. **Fix password special characters** (10% of issues)
4. **Restart server** (5% of issues)
5. **Install dependencies** (5% of issues)

### Next Steps

- ✅ Run diagnostic script
- ✅ Fix any issues found
- ✅ Test with provided curl commands
- ✅ Verify data persistence
- ✅ Monitor in MongoDB Atlas

**Your MongoDB integration is now production-ready!** 🚀
