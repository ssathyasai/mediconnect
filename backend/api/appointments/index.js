const connectDB      = require('../../lib/db');
const Appointment    = require('../../lib/models/Appointment');
const { requireAuth } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  await connectDB();

  // GET â€” list all appointments
  if (req.method === 'GET') {
    const appts = await Appointment
      .find({ userId: user.id })
      .sort({ appointmentDate: 1 });
    return res.json(appts);
  }

  // POST â€” book an appointment
  if (req.method === 'POST') {
    const { doctorName, patientName, contactNumber, appointmentDate } = req.body;

    if (!doctorName || !patientName || !contactNumber || !appointmentDate)
      return res.status(400).json({ error: 'All appointment fields are required.' });

    const appt = await Appointment.create({
      userId: user.id,
      doctorName,
      patientName,
      contactNumber,
      appointmentDate,
    });

    return res.status(201).json(appt);
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};


