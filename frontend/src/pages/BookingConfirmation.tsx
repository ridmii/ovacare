import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { api } from '../utils/api';
import { CheckCircle, Loader2, Printer } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import '../styles/pages/Booking.css';

interface PopulatedDoctor {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
}

interface BookingRecord {
  _id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  timeSlot: string;
  reasonForVisit: string;
  status: string;
  doctorId: PopulatedDoctor;
}

interface ConfirmationLocationState {
  emailConfirmation?: { sent?: boolean; delivered?: boolean };
  patientEmail?: string;
}

export function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const confirmationState = (location.state || {}) as ConfirmationLocationState;
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBooking = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const { data } = await api.get<{ booking: BookingRecord }>(`/api/bookings/${bookingId}`);
        if (!cancelled) setBooking(data.booking);
      } catch {
        if (!cancelled) setError(t('booking.errorGeneric'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBooking();
    return () => {
      cancelled = true;
    };
  }, [bookingId, t]);

  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <Loader2 className="booking-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-page">
        <GlassCard className="booking-error-card">
          <p>{error || t('booking.errorGeneric')}</p>
          <Link to="/doctors">{t('common.back')}</Link>
        </GlassCard>
      </div>
    );
  }

  const doctor = booking.doctorId;

  return (
    <div className="booking-page booking-confirmation-page">
      <div className="booking-container booking-confirmation-container">
        <GlassCard className="booking-confirmation-card">
          <div className="booking-confirmation-icon">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h1>{t('booking.bookingConfirmed')}</h1>
          <p className="booking-confirmation-message">{t('booking.confirmationMessage')}</p>
          {(confirmationState.patientEmail || booking.patientEmail) && (
            <p className="booking-confirmation-email-note">
              {confirmationState.emailConfirmation?.sent && confirmationState.emailConfirmation?.delivered
                ? t('booking.confirmationEmailSent', {
                    email: confirmationState.patientEmail || booking.patientEmail,
                  })
                : t('booking.confirmationEmailPending', {
                    email: confirmationState.patientEmail || booking.patientEmail,
                  })}
            </p>
          )}

          <div className="booking-confirmation-details">
            <div className="booking-detail-row">
              <span>{t('booking.bookingId')}</span>
              <strong>{booking._id}</strong>
            </div>
            <div className="booking-detail-row">
              <span>{t('booking.doctorInfo')}</span>
              <strong>{doctor?.name}</strong>
            </div>
            <div className="booking-detail-row">
              <span>{t('booking.selectDate')}</span>
              <strong>{formatDate(booking.appointmentDate)}</strong>
            </div>
            <div className="booking-detail-row">
              <span>{t('booking.selectTime')}</span>
              <strong>{booking.timeSlot}</strong>
            </div>
            <div className="booking-detail-row">
              <span>{t('booking.patientName')}</span>
              <strong>{booking.patientName}</strong>
            </div>
          </div>

          <div className="booking-payment-note">{t('booking.paymentNote')}</div>

          <div className="booking-confirmation-actions">
            <GradientButton size="lg" onClick={() => window.print()}>
              <Printer className="w-5 h-5 mr-2" />
              {t('common.download')}
            </GradientButton>
            <Link to="/doctors" className="booking-back-doctors">
              {t('doctors.pageTitle')}
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
