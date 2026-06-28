const express = require('express');
const Booking = require('../models/Booking');
const doctorsRouter = require('./doctors');

const router = express.Router();
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://127.0.0.1:5001';

function formatAppointmentDateForEmail(dateInput) {
  const d = parseAppointmentDate(dateInput);
  if (!d) return String(dateInput || '');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function sendBookingConfirmationEmail(booking, doctor) {
  const payload = {
    patientEmail: booking.patientEmail,
    patientName: booking.patientName,
    doctorName: doctor?.name || 'Your doctor',
    appointmentDate: formatAppointmentDateForEmail(booking.appointmentDate),
    timeSlot: booking.timeSlot,
    hospital: doctor?.hospital || '',
    bookingId: String(booking._id),
  };

  try {
    const response = await fetch(`${FLASK_API_URL}/api/email/booking-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.warn('Booking confirmation email failed:', data.error || response.statusText);
      return { sent: false, error: data.error || response.statusText };
    }

    const data = await response.json().catch(() => ({}));
    console.log(`Booking confirmation email sent to ${booking.patientEmail}`);
    return { sent: true, delivered: Boolean(data.delivered), mode: data.mode || 'smtp' };
  } catch (err) {
    console.warn('Booking confirmation email request failed:', err.message);
    return { sent: false, error: err.message };
  }
}

function parseAppointmentDate(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return new Date(`${dateInput}T00:00:00.000Z`);
  }
  const d = new Date(dateInput);
  return Number.isNaN(d.getTime()) ? null : d;
}

router.post('/', async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      timeSlot,
      reasonForVisit,
    } = req.body || {};

    const missing = [];
    if (!doctorId) missing.push('doctorId');
    if (!patientName?.trim()) missing.push('patientName');
    if (!patientEmail?.trim()) missing.push('patientEmail');
    if (!patientPhone?.trim()) missing.push('patientPhone');
    if (!appointmentDate) missing.push('appointmentDate');
    if (!timeSlot?.trim()) missing.push('timeSlot');
    if (!reasonForVisit?.trim()) missing.push('reasonForVisit');

    if (missing.length) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const parsedDate = parseAppointmentDate(appointmentDate);
    if (!parsedDate) {
      return res.status(400).json({ error: 'Invalid appointmentDate format' });
    }

    const dateStr =
      typeof appointmentDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
        ? appointmentDate
        : parsedDate.toISOString().slice(0, 10);

    const slotCheck = await doctorsRouter.isSlotAvailable(doctorId, dateStr, timeSlot.trim());
    if (!slotCheck.ok) {
      return res.status(slotCheck.status).json({ error: slotCheck.error });
    }

    const booking = await Booking.create({
      doctorId,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      appointmentDate: parsedDate,
      timeSlot: timeSlot.trim(),
      reasonForVisit: reasonForVisit.trim(),
      status: 'confirmed',
    });

    await booking.populate('doctorId', 'name specialty hospital location');

    const doctor = booking.doctorId;
    const emailConfirmation = await sendBookingConfirmationEmail(booking, doctor);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      bookingId: booking._id,
      booking,
      emailConfirmation,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That time slot is already booked' });
    }
    console.error('POST /api/bookings error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'doctorId',
      'name specialty hospital location experience rating languages'
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      bookingId: booking._id,
      booking,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.error('GET /api/bookings/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;
