# 📚 MongoDB Database Setup & Testing Guide

## Overview

This guide covers:
- Setting up MongoDB connection in your backend
- Testing the database integration
- Verifying data persistence
- Common troubleshooting steps

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Connection Verification](#connection-verification)
3. [API Testing](#api-testing)
4. [Data Persistence Testing](#data-persistence-testing)
5. [Database Inspection](#database-inspection)
6. [Debugging](#debugging)

---

## Initial Setup

### 1. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# backend/.env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://mongouser:your_password@cluster0.xxxxx.mongodb.net/ai_resume?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Install Dependencies

Ensure all packages are installed:

```bash
cd backend
npm install
```

**Key packages for MongoDB:**
- `mongoose` (6.x+) - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

### 3. Start the Server

```bash
npm run dev
```

**Expected output:**

```
🐝 Starting server...
📡 Connecting to MongoDB...
✅ Successfully connected to MongoDB!
📊 Database: ai_resume
🖥️  Host: cluster0.xxxxx.mongodb.net:27017

Server listening on port 4000
```

---

## Connection Verification

### Quick Test Script

Create `backend/test-connection.js`:

```javascript
// backend/test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log('🔌 Testing MongoDB Connection...\n');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }

    console.log('📝 Connection String (hidden): mongodb+srv://***:***@*.mongodb.net/db');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected successfully!\n');

    // Get database info
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    
    console.log('📊 Server Information:');
    console.log(`   Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${serverStatus.uptime} seconds`);
    console.log(`   Connections: ${serverStatus.connections.current}\n`);

    // List databases
    const dbs = await admin.listDatabases();
    console.log('📦 Available Databases:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });

    // List collections
    console.log('\n📚 Collections in current database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   (No collections yet - will be created when data is saved)');
    } else {
      collections.forEach(col => console.log(`   - ${col.name}`));
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
```

Run it:

```bash
node test-connection.js
```

---

## API Testing

### 1. Register a New User

**Request:**

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### 2. Login

**Request:**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:** Same as register (returns JWT token)

### 3. Get Current User

**Request:**

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-04-08T10:30:00.000Z",
  "updatedAt": "2026-04-08T10:30:00.000Z"
}
```

### 4. Create a Resume

**Request:**

```bash
curl -X POST http://localhost:4000/api/resumes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Resume",
    "templateId": "modern-minimal",
    "data": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "summary": "Experienced software engineer"
    }
  }'
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "title": "My First Resume",
  "templateId": "modern-minimal",
  "data": { ... },
  "isPublic": false,
  "viewCount": 0,
  "createdAt": "2026-04-08T10:35:00.000Z",
  "updatedAt": "2026-04-08T10:35:00.000Z"
}
```

### 5. Get All Resumes

**Request:**

```bash
curl -X GET http://localhost:4000/api/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "My First Resume",
    "templateId": "modern-minimal",
    "createdAt": "2026-04-08T10:35:00.000Z"
  }
]
```

---

## Data Persistence Testing

### Test 1: Create and Retrieve

1. Create a resume (as shown above)
2. Copy the resume ID from response
3. Retrieve it with: `GET /api/resumes/{id}`
4. Verify all data is intact

### Test 2: Update Resume

**Request:**

```bash
curl -X PUT http://localhost:4000/api/resumes/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Resume Title",
    "data": {
      "fullName": "Jane Doe",
      "email": "jane@example.com"
    }
  }'
```

Verify the update is reflected in the database.

### Test 3: Restart and Verify

1. Create a resume and note its ID
2. Stop the server (Ctrl+C)
3. Restart the server (`npm run dev`)
4. Query the same resume: `GET /api/resumes/{id}`
5. **Verify the data still exists** - this proves persistence

### Test 4: Delete Resume

**Request:**

```bash
curl -X DELETE http://localhost:4000/api/resumes/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Verify it's removed from database.

---

## Database Inspection

### Option 1: MongoDB Compass (GUI)

Download from: https://www.mongodb.com/products/compass

1. Get connection string from MongoDB Atlas
2. Open Compass and paste connection string
3. Browse databases → collections → documents

### Option 2: MongoDB Atlas Web Interface

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Browse Collections"
4. View data in web interface

### Option 3: mongosh (CLI)

If installed locally:

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://user:password@cluster.mongodb.net/ai_resume"

# List databases
show databases

# Use ai_resume database
use ai_resume

# List collections
show collections

# View all users
db.users.find()

# View all resumes
db.resumes.find()

# View specific user
db.users.findOne({ email: "john@example.com" })

# Count documents
db.resumes.countDocuments()

# View with formatting
db.resumes.find().pretty()
```

---

## Debugging

### Issue: "Cannot connect to MongoDB"

**Checklist:**

- ✅ Is `.env` file created with correct `MONGO_URI`?
- ✅ Is MongoDB Atlas cluster running (not paused)?
- ✅ Is your IP whitelisted (Security → Network Access)?
- ✅ Are credentials correct (Security → Database Access)?
- ✅ Is the connection string properly formatted?
- ✅ Can you connect with MongoDB Compass?

### Issue: "Authentication failed"

**Checklist:**

- ✅ Is database user created (Security → Database Access)?
- ✅ Are username and password correct?
- ✅ If password has special characters, are they URL-encoded?
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
- ✅ Does user have correct permissions?

### Issue: "Data not saving"

**Checklist:**

- ✅ Are you using `await` when saving?
- ✅ Is MongoDB connection established (check logs)?
- ✅ Are required fields present in schema?
- ✅ Check for validation errors in response
- ✅ Use `console.log()` to verify code execution

### Issue: "Cannot find resume after server restart"

**This is expected if:**

- You were using local MongoDB (not Atlas)
- MongoDB server wasn't persisting data
- Database was cleared

**Solution:**

- Set up MongoDB Atlas (cloud) for persistence
- Or run local MongoDB as a service (persists data)

### Add Debug Logging

In your controllers, add logging:

```javascript
// backend/src/controllers/resumeController.js

async function create(req, res) {
  try {
    console.log('📝 Creating resume...');
    console.log('   User ID:', req.userId);
    console.log('   Data:', req.body);
    
    const r = await Resume.create({ 
      userId: req.userId, 
      ...req.body 
    });
    
    console.log('✅ Resume created:', r._id);
    res.status(201).json(r);
  } catch (error) {
    console.error('❌ Error creating resume:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
}
```

### Enable Mongoose Debug Mode

```javascript
// server.js - Add after mongoose import
mongoose.set('debug', true);

// This logs all MongoDB operations:
// Mongoose: users.insertOne({ name: 'John', ... }, ...)
```

---

## Performance Optimization

### Create Indexes

Indexes speed up queries:

```bash
# From mongosh
use ai_resume

# Create index on email (for login)
db.users.createIndex({ email: 1 })

# Create index on userId (for user's resumes)
db.resumes.createIndex({ userId: 1 })

# Create compound index
db.resumes.createIndex({ userId: 1, createdAt: -1 })

# View all indexes
db.users.getIndexes()
```

### Monitor Queries

View slow queries:

```bash
# In MongoDB Atlas Web UI
→ Deployments → Performance Advisor
→ Shows slow queries and suggestions
```

---

## Testing Checklist

After setting up MongoDB Atlas:

- [ ] `.env` file created with `MONGO_URI`
- [ ] Server connects to MongoDB on startup
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can create a resume
- [ ] Can update a resume
- [ ] Can delete a resume
- [ ] Data persists after server restart
- [ ] Can view data in MongoDB Atlas
- [ ] Can view data with MongoDB Compass
- [ ] No authentication errors in logs
- [ ] All API endpoints working

---

## Next Steps

1. ✅ Complete the testing checklist above
2. ✅ Set up MongoDB Compass for data exploration
3. ✅ Monitor MongoDB Atlas dashboard
4. ✅ Set up alerts for errors
5. ✅ Implement backups strategy
6. ✅ Plan for production deployment

---

## Common Patterns

### Find User's Resumes

```javascript
const User = require('../models/User');
const Resume = require('../models/Resume');

// With populate (join)
const resumes = await Resume.find({ userId: req.userId })
  .populate('userId', 'name email')
  .sort({ createdAt: -1 });
```

### Update Multiple Resumes

```javascript
// Change all resumes for a user
await Resume.updateMany(
  { userId: req.userId },
  { $set: { templateId: 'new-template' } }
);
```

### Search Resumes by Title

```javascript
const results = await Resume.find({
  userId: req.userId,
  title: { $regex: searchQuery, $options: 'i' } // Case-insensitive
});
```

### Count User's Resumes

```javascript
const count = await Resume.countDocuments({ userId: req.userId });
```

---

## Additional Resources

- **MongoDB Manual**: https://docs.mongodb.com/manual/
- **Mongoose Documentation**: https://mongoosejs.com/
- **MongoDB Atlas FAQ**: https://docs.atlas.mongodb.com/faq/
- **Troubleshooting Guide**: https://docs.mongodb.com/manual/reference/error-messages/

---

**Status: Ready for Testing** ✅

Your MongoDB integration is complete! Follow the testing checklist to verify everything is working.
