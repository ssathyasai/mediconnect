const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connectDB = require('../lib/db');
const User = require('../lib/models/User');
const { signToken } = require('../lib/auth');

// Signup
router.post('/signup', async (req, res) => {
  try {
    await connectDB();

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required.' });

    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hashed });

    const token = signToken({ id: user._id, email: user.email, name: user.firstName });

    return res.status(201).json({ token, name: user.firstName });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken({ id: user._id, email: user.email, name: user.firstName });

    return res.json({ token, name: user.firstName });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const { verifyToken } = require('../lib/auth');
    const user = verifyToken(req);
    
    if (!user)
      return res.status(401).json({ error: 'Not authenticated' });

    await connectDB();
    const userData = await User.findById(user.id).select('-password');
    
    if (!userData)
      return res.status(404).json({ error: 'User not found' });

    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
