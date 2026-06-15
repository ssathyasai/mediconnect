const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const HealthRecord = require('../lib/models/HealthRecord');
const { requireAuth } = require('../lib/auth');

// Get all health records for user
router.get('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const records = await HealthRecord
      .find({ userId: user.id })
      .sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get single health record
router.get('/:id', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
    const record = await HealthRecord.findOne({ _id: req.params.id, userId: user.id });
    
    if (!record)
      return res.status(404).json({ error: 'Record not found' });

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create new health record
router.post('/', async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    await connectDB();
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
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
