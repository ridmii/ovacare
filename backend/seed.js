require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const SLOT_PATTERNS = {
  colomboMorning: ['08:00', '09:30', '11:00', '14:00', '16:00'],
  colomboMidday: ['09:00', '10:00', '11:30', '15:00'],
  colomboAfternoon: ['08:30', '10:30', '13:30', '15:30'],
  fertility: ['09:00', '11:00', '14:00', '16:30'],
  colomboEarly: ['07:30', '09:00', '12:00', '14:30'],
  colomboExtended: ['10:00', '11:00', '14:00', '15:00', '16:00'],
  colomboProfessor: ['08:00', '09:00', '10:00', '11:00', '14:00'],
  kandyScan: ['08:00', '09:30', '11:00', '14:30', '16:00'],
  kandyStandard: ['09:00', '10:30', '13:00', '15:00'],
  kandyProfessor: ['08:30', '10:00', '11:30', '14:00', '15:30'],
  kandyAfternoon: ['09:00', '11:00', '14:00', '16:00'],
  kandyMorning: ['08:00', '10:00', '12:00', '15:00'],
  kandyShort: ['09:30', '11:30', '14:30'],
  kandyFull: ['08:00', '09:00', '10:30', '13:30', '15:30', '17:00'],
  chilawMorning: ['09:00', '10:30', '13:00', '15:00'],
  chilawAfternoon: ['10:00', '11:30', '14:00'],
};

function buildAvailability(slots, days = 7) {
  const availability = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const daySlots = i % 6 === 0 ? slots.slice(0, Math.max(2, slots.length - 1)) : [...slots];
    availability.push({ date, slots: daySlots });
  }
  return availability;
}

const doctors = [
  // Colombo
  {
    name: 'Dr. Suranga Hettipathirana',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Lanka Hospitals, Colombo',
    location: 'Colombo 07, Sri Lanka',
    experience: 20,
    rating: 4.9,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboMorning),
  },
  {
    name: 'Dr. Nalinda Rodrigo',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Nawaloka Hospital, Colombo',
    location: 'Colombo 05, Sri Lanka',
    experience: 18,
    rating: 4.8,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboMidday),
  },
  {
    name: 'Dr. Dharshana Somirathne',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Asiri Central Hospital, Colombo',
    location: 'Colombo 03, Sri Lanka',
    experience: 16,
    rating: 4.7,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboAfternoon),
  },
  {
    name: 'Dr. D Maruthini',
    specialty: 'Fertility & IVF Specialist (VOG)',
    hospital: 'Durdans Hospital, Colombo',
    location: 'Colombo 07, Sri Lanka',
    experience: 19,
    rating: 4.9,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.fertility),
  },
  {
    name: 'Dr. Ajitha Wijesundara',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Hemas Hospital, Colombo',
    location: 'Colombo 05, Sri Lanka',
    experience: 15,
    rating: 4.7,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboEarly),
  },
  {
    name: 'Dr. Kamani Mayadunna',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Park Hospital, Colombo',
    location: 'Colombo 04, Sri Lanka',
    experience: 17,
    rating: 4.8,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboExtended),
  },
  {
    name: 'Prof. A.K. Probhodana Ranaweera',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'National Hospital, Colombo',
    location: 'Colombo 07, Sri Lanka',
    experience: 25,
    rating: 4.9,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.colomboProfessor),
  },
  // Kandy
  {
    name: 'Dr. A.C. Mohammed Musthaq',
    specialty: 'Obstetrics & Gynaecology with Scanning (VOG)',
    hospital: 'Teaching Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 16,
    rating: 4.7,
    languages: ['Sinhala', 'English', 'Tamil'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyScan),
  },
  {
    name: 'Dr. Harindra Ranaweera',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Asiri Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 14,
    rating: 4.6,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyStandard),
  },
  {
    name: 'Prof. M Champika Gihan',
    specialty: 'Obstetrics & Gynaecology with Scanning (VOG)',
    hospital: 'Teaching Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 22,
    rating: 4.8,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyProfessor),
  },
  {
    name: 'Dr. Sampath Gnanarathne',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Lanka Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 15,
    rating: 4.7,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyAfternoon),
  },
  {
    name: 'Prof. Asoka Karunananda',
    specialty: 'Obstetrics & Gynaecology with Scanning (VOG)',
    hospital: 'Teaching Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 23,
    rating: 4.8,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyMorning),
  },
  {
    name: 'Dr. Lasantha Rajapaksha',
    specialty: 'Obstetrics & Gynaecology with Scanning (VOG)',
    hospital: 'Kandy General Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 13,
    rating: 4.6,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyShort),
  },
  {
    name: 'Dr. P.G. Yohan Sachintha Silva',
    specialty: 'Consultant Obstetrics & Gynaecology with Scanning (VOG)',
    hospital: 'Asiri Hospital, Kandy',
    location: 'Kandy, Sri Lanka',
    experience: 17,
    rating: 4.7,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.kandyFull),
  },
  // Chilaw
  {
    name: 'Dr. Nayanan Ganesh',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'District Hospital, Chilaw',
    location: 'Chilaw, Sri Lanka',
    experience: 12,
    rating: 4.6,
    languages: ['Sinhala', 'Tamil', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.chilawMorning),
  },
  {
    name: 'Dr. W.M.A.P.B. Walisundara',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    hospital: 'Base Hospital, Chilaw',
    location: 'Chilaw, Sri Lanka',
    experience: 11,
    rating: 4.5,
    languages: ['Sinhala', 'English'],
    availableSlots: buildAvailability(SLOT_PATTERNS.chilawAfternoon),
  },
];

async function seed() {
  const uri =
    process.env.BOOKING_MONGODB_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/ovacare';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB');

  const count = await Doctor.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} doctors. Skipping seed (use --force to reseed).`);
    if (!process.argv.includes('--force')) {
      await mongoose.disconnect();
      return;
    }
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors.');
  }

  await Doctor.insertMany(doctors);
  console.log(`Seeded ${doctors.length} doctors with 7-day availability.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
