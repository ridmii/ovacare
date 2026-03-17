import React, { useState, useEffect } from 'react';
import '../styles/pages/Doctors.css';
import { Doctor } from '../types';

const Doctors: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: "Dr. Sarah Perera",
        specialty: "Gynecologist",
        hospital: "Asiri Hospitals, Colombo",
        experienceYears: 15,
        experience: "15 years",
        rating: 4.8,
        available: true,
        image: "👩‍⚕️",
        telemedicine: true
      },
      {
        id: 2,
        name: "Dr. Rajiv Fernando",
        specialty: "Endocrinologist",
        hospital: "Nawaloka Hospital, Colombo",
        experienceYears: 12,
        experience: "12 years",
        rating: 4.7,
        available: true,
        image: "👨‍⚕️",
        telemedicine: true
      },
      {
        id: 3,
        name: "Dr. Maya Silva",
        specialty: "Reproductive Specialist",
        hospital: "Durdans Hospital, Colombo",
        experienceYears: 18,
        experience: "18 years",
        rating: 4.9,
        available: false,
        image: "👩‍⚕️",
        telemedicine: false
      },
      {
        id: 4,
        name: "Dr. Anil Jayasinghe",
        specialty: "Gynecologist",
        hospital: "Lanka Hospitals, Colombo",
        experienceYears: 10,
        experience: "10 years",
        rating: 4.6,
        available: true,
        image: "👨‍⚕️",
        telemedicine: true
      },
      {
        id: 5,
        name: "Dr. Priya Kumar",
        specialty: "Endocrinologist",
        hospital: "Kandy Teaching Hospital",
        experienceYears: 14,
        experience: "14 years",
        rating: 4.8,
        available: true,
        image: "👩‍⚕️",
        telemedicine: false
      },
      {
        id: 6,
        name: "Dr. Sanjay Rajapaksa",
        specialty: "Fertility Specialist",
        hospital: "Central Hospital, Colombo",
        experienceYears: 20,
        experience: "20 years",
        rating: 4.9,
        available: true,
        image: "👨‍⚕️",
        telemedicine: true
      }
    ];

    setDoctors(mockDoctors);
    setFilteredDoctors(mockDoctors);
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = location === '' || doctor.hospital.toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesLocation;
    });
    setFilteredDoctors(filtered);
  }, [searchQuery, location, doctors]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const tips = [
    { icon: '📝', title: 'Prepare Questions', description: 'Write down your symptoms and questions beforehand' },
    { icon: '📋', title: 'Bring Reports', description: 'Carry your ultrasound reports and medical history' },
    { icon: '🎯', title: 'Be Specific', description: 'Clearly describe your symptoms and concerns' },
    { icon: '🗓️', title: 'Follow Up', description: 'Schedule follow-up appointments as recommended' }
  ];

  return (
    <div className="doctors-page">
      <h1>Find PCOS Specialists</h1>
      <p className="page-subtitle">Connect with experienced doctors specializing in PCOS treatment</p>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Location or hospital..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div className="search-stats">
          <p>Found {filteredDoctors.length} specialists in your area</p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="doctors-grid">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                <span className="avatar-icon">{doctor.image}</span>
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
                <span className="detail-label">Experience</span>
                <span className="detail-value">{doctor.experience}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rating</span>
                <span className="detail-value rating">
                  ⭐ {doctor.rating}/5.0
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Next Available</span>
                <span className="detail-value available">{doctor.available}</span>
              </div>
            </div>

            <div className="doctor-actions">
              <button className="btn btn-outline">View Profile</button>
              <button className="btn btn-primary">Book Appointment</button>
            </div>
          </div>
        ))}
      </div>

      {/* Telemedicine Section */}
      <div className="telemedicine-section">
        <div className="telemedicine-card">
          <div className="telemedicine-content">
            <h2>Virtual Consultations Available</h2>
            <p>Can't visit in person? Many specialists offer online consultations for PCOS management.</p>
            <ul className="telemedicine-features">
              <li>✓ Video consultations from home</li>
              <li>✓ Digital prescription services</li>
              <li>✓ Follow-up appointments online</li>
              <li>✓ Secure medical record sharing</li>
            </ul>
            <button className="btn btn-primary">Book Virtual Consultation</button>
          </div>
          <div className="telemedicine-image">
            <div className="video-icon">📹</div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
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