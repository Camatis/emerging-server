const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('Admin user already exists');
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const admin = new User({ username, password: hash, role: 'admin' });
    await admin.save();
    console.log('Admin user created from ENV variables');
  } catch (err) {
    console.error('Failed to seed admin', err);
  }
};
