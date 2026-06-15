const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName:      { type: String, required: true },
  patientName:     { type: String, required: true },
  contactNumber:   { type: String, required: true },
  appointmentDate: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
