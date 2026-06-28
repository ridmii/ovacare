const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    slots: [{ type: String }],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    hospital: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true },
    languages: [{ type: String }],
    availableSlots: [availableSlotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
