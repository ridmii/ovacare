const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.BOOKING_MONGODB_URI || 'mongodb://127.0.0.1:27017/ovacare';

const doctors = [
  {
    name: 'Dr. Suranga Hettipathirana',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    rating: 4.9,
    reviews: 324,
    experience: '20 years',
    location: 'Colombo 07, Sri Lanka',
    distance: '2.1 km',
    image: '👨‍⚕️',
    verified: true,
    acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
    consultationFee: 4500,
    about: 'Highly experienced Consultant Obstetrician & Gynaecologist. Expert in PCOS management, hormonal disorders, and gynaecological health in Sri Lankan women.',
    credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK', 'Fellowship - Reproductive Medicine'],
    languages: ['Sinhala', 'Tamil', 'English'],
    officeHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
    categories: ['gynecology'],
    availableSlots: [
      { date: new Date().toISOString().split('T')[0], slots: ['09:00 AM', '10:00 AM', '02:30 PM', '03:00 PM'] },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['10:00 AM', '11:00 AM', '04:00 PM'] }
    ]
  },
  {
    name: 'Dr. Nalinda Rodrigo',
    specialty: 'Obstetrics & Gynaecology',
    rating: 4.8,
    reviews: 289,
    experience: '18 years',
    location: 'Colombo 05, Sri Lanka',
    distance: '2.8 km',
    image: '👩‍⚕️',
    verified: true,
    acceptsInsurance: ['Janashakthi Insurance', 'Ceylinco General', 'AIA Insurance'],
    consultationFee: 4000,
    about: 'Consultant Obstetrician & Gynaecologist specializing in PCOS, reproductive health, and women\'s wellness. Known for patient-centered approach.',
    credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK'],
    languages: ['Sinhala', 'Tamil', 'English'],
    officeHours: 'Tue-Sat: 9AM-5PM',
    categories: ['gynecology'],
    availableSlots: [
      { date: new Date().toISOString().split('T')[0], slots: ['09:00 AM', '03:00 PM', '04:30 PM'] },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['11:00 AM', '01:00 PM', '02:00 PM'] }
    ]
  },
  {
    name: 'Dr. D Maruthini',
    specialty: 'Fertility & IVF Specialist',
    rating: 4.9,
    reviews: 312,
    experience: '19 years',
    location: 'Colombo 07, Sri Lanka',
    distance: '2.3 km',
    image: '👩‍⚕️',
    verified: true,
    acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
    consultationFee: 5500,
    about: 'Consultant Gynaecologist, Fertility Specialist, and IVF Expert. Specializes in PCOS management, subfertility, and assisted reproductive techniques.',
    credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'Fellowship - Reproductive Medicine & IVF', 'MRCOG - UK'],
    languages: ['Sinhala', 'Tamil', 'English'],
    officeHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-12PM',
    categories: ['gynecology', 'fertility'],
    availableSlots: [
      { date: new Date().toISOString().split('T')[0], slots: ['04:00 PM', '05:00 PM'] },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['09:00 AM', '10:30 AM', '01:00 PM'] }
    ]
  },
  {
    name: 'Prof. M Champika Gihan',
    specialty: 'Obstetrics & Gynaecology with Scanning',
    rating: 4.8,
    reviews: 312,
    experience: '22 years',
    location: 'Kandy, Sri Lanka',
    distance: '3.0 km',
    image: '👩‍⚕️',
    verified: true,
    acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
    consultationFee: 4500,
    about: 'Professor and Senior Consultant Obstetrician & Gynaecologist. Specialist in gynaecological ultrasound and PCOS diagnosis.',
    credentials: ['MBBS - University of Peradeniya', 'MD - Obstetrics & Gynaecology', 'Diploma - Advanced Ultrasound', 'Fellowship - Reproductive Medicine'],
    languages: ['Sinhala', 'English'],
    officeHours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-12PM',
    categories: ['gynecology'],
    availableSlots: [
      { date: new Date().toISOString().split('T')[0], slots: ['03:30 PM', '04:00 PM'] },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['08:00 AM', '09:00 AM'] }
    ]
  },
  {
    name: 'Prof. A.K. Probhodana Ranaweera',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    rating: 4.9,
    reviews: 401,
    experience: '25 years',
    location: 'Colombo 07, Sri Lanka',
    distance: '2.0 km',
    image: '👨‍⚕️',
    verified: true,
    acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
    consultationFee: 6000,
    about: 'Professor and Senior Consultant Obstetrician & Gynaecologist. Leading expert in PCOS, reproductive medicine, and women\'s endocrine health.',
    credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK', 'Fellowship - Reproductive Endocrinology'],
    languages: ['Sinhala', 'Tamil', 'English'],
    officeHours: 'Mon-Fri: 8AM-6PM',
    categories: ['gynecology'],
    availableSlots: [
      { date: new Date().toISOString().split('T')[0], slots: ['05:00 PM', '05:30 PM'] },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], slots: ['10:00 AM', '11:00 AM'] }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB. Seeding...');
    
    for (const doc of doctors) {
      const existing = await Doctor.findOne({ name: doc.name });
      if (!existing) {
        await Doctor.create(doc);
        console.log(`Created ${doc.name}`);
      } else {
        console.log(`Skipped ${doc.name}, already exists`);
      }
    }
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
