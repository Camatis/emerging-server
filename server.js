require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dbConfig = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const seedAdmin = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const app = express();

const origins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);


// Configure CORS more explicitly so preflight (OPTIONS) requests
// always receive the required Access-Control-Allow-* headers.
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true)
    // if no origins configured, allow all
    if (!origins.length) return callback(null, true)
    if (origins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS policy: origin not allowed'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions));
// ensure OPTIONS preflight is handled for all routes
app.options('*', cors(corsOptions));
app.use(express.json());

// Fallback header setter to ensure a response header is present even if
// some layer in the hosting stack strips CORS headers. This sets the
// header dynamically to the request origin when permitted.
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin
  if (!reqOrigin) return next()
  if (!origins.length || origins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  }
  // if it's an OPTIONS preflight, end the request here
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// mount auth routes under /api/auth to match frontend expectations
app.use('/api/auth', authRoutes);

mongoose
  .connect(dbConfig.url)
  .then(async () => {
    console.log('Connected to MongoDB');
    // seed admin user if env vars provided
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
