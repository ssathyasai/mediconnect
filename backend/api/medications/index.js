const connectDB      = require('../../lib/db');
const Medication     = require('../../lib/models/Medication');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  // GET â€” list all medications for this user
  if (req.method === 'GET') {
    const meds = await Medication
      .find({ userId: user.id })
      .sort({ createdAt: -1 });
    return res.json(meds);
  }

  // POST â€” add a new medication
  if (req.method === 'POST') {
    const { name, dosage, frequencyPerDay, startDate, endDate } = req.body;

    if (!name || !dosage || !frequencyPerDay || !startDate || !endDate)
      return res.status(400).json({ error: 'All medication fields are required.' });

    const med = await Medication.create({
      userId: user.id,
      name,
      dosage,
      frequencyPerDay,
      startDate,
      endDate,
      logs: [],
    });

    return res.status(201).json(med);
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};


