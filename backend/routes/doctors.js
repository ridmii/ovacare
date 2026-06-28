const express = require('express');
const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');

const {
  saveSpecialistMatchRequest,
  saveProviderApplication,
} = require('../services/doctorFormsStore');

const router = express.Router();

function startOfDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d;
}

function endOfDay(dateStr) {
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  return d;
}

async function getBookedSlotsByDate(doctorId) {
  const bookings = await Booking.find({
    doctorId,
    status: 'confirmed',
  }).select('appointmentDate timeSlot');

  const booked = {};
  for (const booking of bookings) {
    const dateKey = booking.appointmentDate.toISOString().slice(0, 10);
    if (!booked[dateKey]) booked[dateKey] = new Set();
    booked[dateKey].add(booking.timeSlot);
  }
  return booked;
}

function filterAvailableSlots(availableSlots, bookedByDate) {
  return availableSlots
    .map(({ date, slots }) => {
      const booked = bookedByDate[date] || new Set();
      const openSlots = slots.filter((slot) => !booked.has(slot));
      return { date, slots: openSlots };
    })
    .filter(({ slots }) => slots.length > 0);
}

async function enrichDoctorWithAvailability(doctor) {
  const doc = doctor.toObject ? doctor.toObject() : doctor;
  const bookedByDate = await getBookedSlotsByDate(doc._id);
  return {
    ...doc,
    availableSlots: filterAvailableSlots(doc.availableSlots || [], bookedByDate),
  };
}

router.post('/specialist-match', async (req, res) => {
  try {
    const result = await saveSpecialistMatchRequest(req.body || {});
    res.status(201).json(result);
  } catch (err) {
    console.error('POST /api/doctors/specialist-match error:', err);
    res.status(400).json({ error: err.message || 'Failed to submit specialist match request' });
  }
});

router.post('/provider-application', async (req, res) => {
  try {
    const result = await saveProviderApplication(req.body || {});
    res.status(201).json(result);
  } catch (err) {
    console.error('POST /api/doctors/provider-application error:', err);
    res.status(400).json({ error: err.message || 'Failed to submit provider application' });
  }
});

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    const enriched = await Promise.all(doctors.map((d) => enrichDoctorWithAvailability(d)));
    res.json({ count: enriched.length, doctors: enriched });
  } catch (err) {
    console.error('GET /api/doctors error:', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const enriched = await enrichDoctorWithAvailability(doctor);
    res.json(enriched);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    console.error('GET /api/doctors/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

router.isSlotAvailable = async function isSlotAvailable(doctorId, dateStr, timeSlot) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return { ok: false, error: 'Doctor not found', status: 404 };

  const dayEntry = (doctor.availableSlots || []).find((d) => d.date === dateStr);
  if (!dayEntry || !dayEntry.slots.includes(timeSlot)) {
    return { ok: false, error: 'Selected time slot is not available for this doctor', status: 400 };
  }

  const existing = await Booking.findOne({
    doctorId,
    appointmentDate: { $gte: startOfDay(dateStr), $lte: endOfDay(dateStr) },
    timeSlot,
    status: 'confirmed',
  });

  if (existing) {
    return { ok: false, error: 'That time slot is already booked', status: 409 };
  }

  return { ok: true, doctor };
};

module.exports = router;
