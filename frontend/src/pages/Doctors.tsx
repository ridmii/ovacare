import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import '../styles/pages/Doctors.css';

interface DoctorRecord {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  experience: number;
  rating: number;
  languages: string[];
  availableSlots?: { date: string; slots: string[] }[];
}

const Doctors: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/doctors');
        const list = Array.isArray(data?.doctors) ? data.doctors : [];
        if (!cancelled) {
          setDoctors(list);
          setFilteredDoctors(list);
        }
      } catch {
        if (!cancelled) {
          setDoctors([]);
          setFilteredDoctors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        location === '' ||
        doctor.hospital.toLowerCase().includes(location.toLowerCase()) ||
        doctor.location.toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesLocation;
    });
    setFilteredDoctors(filtered);
  }, [searchQuery, location, doctors]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  const tips = [
    { icon: '📝', title: 'Prepare Questions', description: 'Write down your symptoms and questions beforehand' },
    { icon: '📋', title: 'Bring Reports', description: 'Carry your ultrasound reports and medical history' },
    { icon: '🎯', title: 'Be Specific', description: 'Clearly describe your symptoms and concerns' },
    { icon: '🗓️', title: 'Follow Up', description: 'Schedule follow-up appointments as recommended' },
  ];

  return (
    <div className="doctors-page">
      <h1>{t('doctors.pageTitle')}</h1>
      <p className="page-subtitle">{t('doctors.pageSubtitle')}</p>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder={t('doctors.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder={t('doctors.filters.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">{t('common.search')}</button>
        </form>
        <div className="search-stats">
          <p>
            {loading ? t('common.loading') : `${filteredDoctors.length} specialists found`}
          </p>
        </div>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor._id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                <span className="avatar-icon">👩‍⚕️</span>
              </div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>
              </div>
            </div>

            <div className="doctor-details">
              <div className="detail-item">
                <span className="detail-label">Hospital</span>
                <span className="detail-value">{doctor.hospital}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('doctors.profile.location')}</span>
                <span className="detail-value">{doctor.location}</span>
              </div>
            </div>

            <div className="doctor-actions">
              <button className="btn btn-outline">{t('doctors.doctorCard.viewProfile')}</button>
              <Link to={`/booking/${doctor._id}`} className="btn btn-primary">
                {t('doctors.doctorCard.bookConsultation')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredDoctors.length === 0 && (
        <p className="page-subtitle">{t('doctors.noResultsFound')}</p>
      )}

      <div className="telemedicine-section">
        <div className="telemedicine-card">
          <div className="telemedicine-content">
            <h2>Virtual Consultations Available</h2>
            <p>Many specialists offer online consultations for PCOS management.</p>
            <button className="btn btn-primary">{t('doctors.doctorCard.bookConsultation')}</button>
          </div>
          <div className="telemedicine-image">
            <div className="video-icon">📹</div>
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h3>Tips for Your Doctor Visit</h3>
        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div key={index} className="tip">
              <div className="tip-icon">{tip.icon}</div>
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
