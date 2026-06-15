const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weightKg:       { type: Number, required: true },
  bloodPressure:  { type: String, required: true },
  heartRateBpm:   { type: Number, required: true },
  sleepHours:     { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
