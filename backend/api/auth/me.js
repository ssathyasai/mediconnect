const connectDB = require('../../lib/db');
const User      = require('../../lib/models/User');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const decoded = requireAuth(req, res);
  if (!decoded) return; // requireAuth already sent 401

  await connectDB();

  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found.' });

  return res.json(user);
};


