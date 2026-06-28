import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { api } from '../utils/api';
import { ArrowLeft, Calendar, Clock, Loader2, MapPin, Stethoscope } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import '../styles/pages/Booking.css';

interface AvailableSlotDay {
  date: string;
  slots: string[];
}

interface DoctorDetails {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  availableSlots: AvailableSlotDay[];
}

interface BookingForm {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reasonForVisit: string;
}

const initialForm: BookingForm = {
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  reasonForVisit: '',
};

export function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDoctor = async () => {
      if (!doctorId) return;
      setLoadingDoctor(true);
      setLoadError('');
      try {
        const { data } = await api.get<DoctorDetails>(`/api/doctors/${doctorId}`);
        if (cancelled) return;
        setDoctor(data);
        const firstDate = data.availableSlots?.[0]?.date || '';
        setSelectedDate(firstDate);
        setSelectedTime('');
      } catch {
        if (!cancelled) setLoadError(t('booking.errorGeneric'));
      } finally {
        if (!cancelled) setLoadingDoctor(false);
      }
    };

    loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [doctorId, t]);

  const availableDates = useMemo(
    () => (doctor?.availableSlots || []).map((d) => d.date),
    [doctor]
  );

  const minDate = availableDates[0] || '';
  const maxDate = availableDates[availableDates.length - 1] || '';

  const slotsForSelectedDate = useMemo(() => {
    if (!doctor || !selectedDate) return [];
    return doctor.availableSlots.find((d) => d.date === selectedDate)?.slots || [];
  }, [doctor, selectedDate]);

  const handleDateChange = (value: string) => {
    if (!availableDates.includes(value)) return;
    setSelectedDate(value);
    setSelectedTime('');
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!doctorId || !selectedDate || !selectedTime) {
      setSubmitError(t('booking.errorGeneric'));
      return;
    }

    if (!form.patientName.trim() || !form.patientEmail.trim() || !form.patientPhone.trim() || !form.reasonForVisit.trim()) {
      setSubmitError(t('booking.errorGeneric'));
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/bookings', {
        doctorId,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim(),
        patientPhone: form.patientPhone.trim(),
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
        reasonForVisit: form.reasonForVisit.trim(),
      });

      navigate(`/booking/confirmation/${data.bookingId}`, {
        state: {
          emailConfirmation: data.emailConfirmation,
          patientEmail: form.patientEmail.trim(),
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error;
        if (err.response?.status === 409 || (typeof message === 'string' && message.toLowerCase().includes('booked'))) {
          setSubmitError(t('booking.errorSlotTaken'));
        } else {
          setSubmitError(typeof message === 'string' ? message : t('booking.errorGeneric'));
        }
      } else {
        setSubmitError(t('booking.errorGeneric'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <Loader2 className="booking-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (loadError || !doctor) {
    return (
      <div className="booking-page">
        <GlassCard className="booking-error-card">
          <p>{loadError || t('booking.errorGeneric')}</p>
          <Link to="/doctors" className="booking-back-link">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <Link to="/doctors" className="booking-back-link">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        <div className="booking-header">
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.subtitle')}</p>
        </div>

        <div className="booking-layout">
          <GlassCard className="booking-doctor-card">
            <h2>{t('booking.doctorInfo')}</h2>
            <div className="booking-doctor-name">{doctor.name}</div>
            <div className="booking-doctor-specialty">{doctor.specialty}</div>
            <div className="booking-doctor-meta">
              <span><Stethoscope className="w-4 h-4" /> {doctor.hospital}</span>
              <span><MapPin className="w-4 h-4" /> {doctor.location}</span>
            </div>
          </GlassCard>

          <GlassCard className="booking-form-card">
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="booking-section">
                <label htmlFor="appointment-date">{t('booking.selectDate')}</label>
                <div className="booking-date-input-wrap">
                  <Calendar className="w-4 h-4" />
                  <input
                    id="appointment-date"
                    type="date"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="booking-section">
                <label>{t('booking.selectTime')}</label>
                <div className="booking-time-slots">
                  {slotsForSelectedDate.length === 0 ? (
                    <p className="booking-no-slots">{t('booking.errorGeneric')}</p>
                  ) : (
                    slotsForSelectedDate.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`booking-slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTime(slot);
                          setSubmitError('');
                        }}
                      >
                        <Clock className="w-4 h-4" />
                        {slot}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="booking-section">
                <label htmlFor="patient-name">{t('booking.patientName')}</label>
                <input
                  id="patient-name"
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  required
                />
              </div>

              <div className="booking-section">
                <label htmlFor="patient-email">{t('booking.patientEmail')}</label>
                <input
                  id="patient-email"
                  type="email"
                  value={form.patientEmail}
                  onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                  required
                />
              </div>

              <div className="booking-section">
                <label htmlFor="patient-phone">{t('booking.patientPhone')}</label>
                <input
                  id="patient-phone"
                  type="tel"
                  value={form.patientPhone}
                  onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                  required
                />
              </div>

              <div className="booking-section">
                <label htmlFor="reason">{t('booking.reasonLabel')}</label>
                <textarea
                  id="reason"
                  rows={4}
                  placeholder={t('booking.reasonPlaceholder')}
                  value={form.reasonForVisit}
                  onChange={(e) => setForm({ ...form, reasonForVisit: e.target.value })}
                  required
                />
              </div>

              {submitError && <div className="booking-error">{submitError}</div>}

              <GradientButton
                type="submit"
                size="lg"
                className="booking-submit-btn"
                disabled={submitting || !selectedTime}
              >
                {submitting ? (
                  <>
                    <Loader2 className="booking-spinner-inline" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('booking.confirmButton')
                )}
              </GradientButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
