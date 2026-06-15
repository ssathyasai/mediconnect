const connectDB      = require('../../lib/db');
const Appointment    = require('../../lib/models/Appointment');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed.' });

  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  const { id } = req.query;
  const appt = await Appointment.findOne({ _id: id, userId: user.id });

  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  await appt.deleteOne();
  return res.json({ message: 'Appointment cancelled.' });
};
