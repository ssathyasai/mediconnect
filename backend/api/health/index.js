const connectDB      = require('../../lib/db');
const HealthRecord   = require('../../lib/models/HealthRecord');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  // GET /api/health â€” fetch all records for this user
  if (req.method === 'GET') {
    const records = await HealthRecord
      .find({ userId: user.id })
      .sort({ createdAt: -1 });
    return res.json(records);
  }

  // POST /api/health â€” save a new record
  if (req.method === 'POST') {
    const { weightKg, bloodPressure, heartRateBpm, sleepHours } = req.body;

    if (!weightKg || !bloodPressure || !heartRateBpm || !sleepHours)
      return res.status(400).json({ error: 'All health fields are required.' });

    const record = await HealthRecord.create({
      userId: user.id,
      weightKg,
      bloodPressure,
      heartRateBpm,
      sleepHours,
    });

    return res.status(201).json(record);
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};


