const connectDB      = require('../../lib/db');
const HealthRecord   = require('../../lib/models/HealthRecord');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed.' });

  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  const { id } = req.query;
  const record = await HealthRecord.findOne({ _id: id, userId: user.id });

  if (!record) return res.status(404).json({ error: 'Record not found.' });

  await record.deleteOne();
  return res.json({ message: 'Record deleted.' });
};
