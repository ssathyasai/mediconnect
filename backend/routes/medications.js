const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const Medication = require('../lib/models/Medication');
const { requireAuth } = require('../lib/auth');

// Get all medications for user
router.get('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const meds = await Medication
      .find({ userId: user.id })
      .sort({ createdAt: -1 });
    return res.json(meds);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get single medication
router.get('/:id', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const med = await Medication.findOne({ _id: req.params.id, userId: user.id });
    
    if (!med)
      return res.status(404).json({ error: 'Medication not found' });

    return res.json(med);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Add new medication
router.post('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
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
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Log or update dose log
router.post('/:id', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const { slotIndex, taken, logDate } = req.body;

    if (slotIndex === undefined || taken === undefined || !logDate) {
      return res.status(400).json({ error: 'slotIndex, taken, and logDate are required.' });
    }

    const med = await Medication.findOne({ _id: req.params.id, userId: user.id });
    if (!med) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // Find if a log entry with slotIndex and logDate already exists
    const logIndex = med.logs.findIndex(
      l => l.slotIndex === slotIndex && l.logDate === logDate
    );

    if (logIndex > -1) {
      med.logs[logIndex].taken = taken;
    } else {
      med.logs.push({ slotIndex, taken, logDate });
    }

    med.markModified('logs');
    await med.save();
    return res.json(med);
  } catch (error) {
    console.error('Error logging dose:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete medication
router.delete('/:id', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const med = await Medication.findOneAndDelete({ _id: req.params.id, userId: user.id });
    if (!med) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    return res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
