const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const Appointment = require('../lib/models/Appointment');
const { requireAuth } = require('../lib/auth');

// Get all appointments for user
router.get('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const appointments = await Appointment
      .find({ userId: user.id })
      .sort({ createdAt: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: user.id });
    
    if (!appointment)
      return res.status(404).json({ error: 'Appointment not found' });

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const { doctorName, patientName, contactNumber, appointmentDate } = req.body;

    if (!doctorName || !patientName || !contactNumber || !appointmentDate)
      return res.status(400).json({ error: 'All fields are required.' });

    const appointment = await Appointment.create({
      userId: user.id,
      doctorName,
      patientName,
      contactNumber,
      appointmentDate
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
