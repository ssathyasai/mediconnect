const connectDB      = require('../../lib/db');
const Medication     = require('../../lib/models/Medication');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  const { id } = req.query;
  const med = await Medication.findOne({ _id: id, userId: user.id });
  if (!med) return res.status(404).json({ error: 'Medication not found.' });

  // DELETE /api/medications/:id
  if (req.method === 'DELETE') {
    await med.deleteOne();
    return res.json({ message: 'Medication deleted.' });
  }

  // POST /api/medications/:id  — update a dose log slot
  if (req.method === 'POST') {
    const { slotIndex, taken, logDate } = req.body;

    if (slotIndex === undefined || taken === undefined || !logDate)
      return res.status(400).json({ error: 'slotIndex, taken, and logDate are required.' });

    // Find existing log entry or create a new one
    const existing = med.logs.find(
      l => l.slotIndex === slotIndex && l.logDate === logDate
    );

    if (existing) {
      existing.taken = taken;
    } else {
      med.logs.push({ slotIndex, taken, logDate });
    }

    med.markModified('logs');
    await med.save();
    return res.json({ message: 'Log updated.', logs: med.logs });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
