const bcrypt    = require('bcryptjs');
const connectDB = require('../../lib/db');
const User      = require('../../lib/models/User');
const { signToken } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

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
  const user   = await User.create({ firstName, lastName, email, password: hashed });

  const token = signToken({ id: user._id, email: user.email, name: user.firstName });

  return res.status(201).json({ token, name: user.firstName });
};


