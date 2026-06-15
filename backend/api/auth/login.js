const bcrypt    = require('bcryptjs');
const connectDB = require('../../lib/db');
const User      = require('../../lib/models/User');
const { signToken } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

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
};


