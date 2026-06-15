const mongoose = require('mongoose');

const MedicationLogSchema = new mongoose.Schema({
  slotIndex: { type: Number, required: true },
  taken:     { type: Boolean, default: false },
  logDate:   { type: String, required: true }, // YYYY-MM-DD
});

const MedicationSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:            { type: String, required: true, trim: true },
  dosage:          { type: String, required: true, trim: true },
  frequencyPerDay: { type: Number, required: true, min: 1 },
  startDate:       { type: String, required: true },
  endDate:         { type: String, required: true },
  logs:            [MedicationLogSchema],
}, { timestamps: true });

module.exports = mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
