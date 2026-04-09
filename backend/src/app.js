require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Basic middlewares
app.use(helmet());
// Enable CORS and explicitly allow Authorization header for JWT auth from the frontend
app.use(cors({ origin: true, allowedHeaders: ['Content-Type', 'Authorization'], methods: ['GET','POST','PUT','DELETE','OPTIONS'], credentials: true }));
// Note: older path patterns like '*' can cause path-to-regexp errors in some environments.
// The `cors` middleware above handles preflight responses when used globally, so an
// explicit `app.options('*', ...)` is unnecessary and has been removed to avoid the
// `PathError: Missing parameter name at index 1: *` crash.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Helper to mount route files if present, otherwise respond 501 so frontend won't crash
function tryMountRoute(routeFileRelative, mountPath) {
  const full = path.join(__dirname, routeFileRelative);
  if (fs.existsSync(full)) {
    app.use(mountPath, require(full));
  } else {
    app.use(mountPath, (req, res) => res.status(501).json({ message: `${mountPath} not implemented on server` }));
  }
}

tryMountRoute('routes/auth.js', '/api/auth');
tryMountRoute('routes/resumes.js', '/api/resumes');

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend static build (production)
// support either `frontend/dist` (Vite) or `frontend/build` (create-react-app)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
let frontendStaticDir = null;
if (fs.existsSync(frontendDist)) frontendStaticDir = frontendDist;
else if (fs.existsSync(frontendBuild)) frontendStaticDir = frontendBuild;

if (frontendStaticDir) {
  app.use(express.static(frontendStaticDir));

  // Serve index.html for non-API routes (avoid intercepting /api/*)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendStaticDir, 'index.html'));
  });
}

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
