const mongoose = require('mongoose');

const specialistMatchRequestSchema = new mongoose.Schema(
  {
    submitterName: { type: String, default: '' },
    submitterEmail: { type: String, default: '' },
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    location: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpecialistMatchRequest', specialistMatchRequestSchema);
