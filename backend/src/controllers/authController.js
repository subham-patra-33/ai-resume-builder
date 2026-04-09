const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

console.log('User model:', typeof User, User ? 'loaded' : 'undefined');

async function register(req, res) {
  const { name, username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

  const normalizedUsername = username.toLowerCase().trim();
  const existing = await User.findOne({ username: normalizedUsername });
  if (existing) return res.status(400).json({ message: 'Username already in use' });

  const user = new User({ name, username: normalizedUsername, passwordHash: password });
  await user.save();

  const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name } });
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  
  const normalizedUsername = username.toLowerCase().trim();
  const user = await User.findOne({ username: normalizedUsername }).select('+passwordHash');
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
}

async function me(req, res) {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

module.exports = { register, login, me };
