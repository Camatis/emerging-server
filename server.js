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

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

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
