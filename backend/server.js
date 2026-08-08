require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const doctorsRouter = require('./routes/doctors');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.BOOKING_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/ovacare';

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');

app.use(
  cors({
    origin: corsOrigins.map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'OvaCare Booking API',
    version: '1.0.0',
    endpoints: {
      'GET /api/doctors': 'List all doctors with availability',
      'GET /api/doctors/:id': 'Get doctor by ID',
      'POST /api/doctors/specialist-match': 'Submit a specialist suggestion',
      'POST /api/doctors/provider-application': 'Submit a provider network application',
      'POST /api/bookings': 'Create a booking',
      'GET /api/bookings/:id': 'Get booking confirmation details',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OvaCare Booking API',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/bookings', bookingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function runLocalDataMigration() {
  try {
    const { execSync } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    const venvPython =
      process.platform === 'win32'
        ? path.join(__dirname, 'venv', 'Scripts', 'python.exe')
        : path.join(__dirname, 'venv', 'bin', 'python');
    const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python';
    execSync(`"${pythonCmd}" scripts/run_migration.py`, {
      cwd: __dirname,
      stdio: 'inherit',
    });
  } catch (err) {
    console.warn('Local data migration skipped:', err.message);
  }
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('Failed to connect to primary MongoDB, attempting to start memory server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Memory Server connected at ${mongoUri}`);
    } catch (memErr) {
      console.error('Failed to start memory server:', memErr);
      process.exit(1);
    }
  }

  try {
    await runLocalDataMigration();
    
    // Fallback: if database is empty, seed it
    const Doctor = require('./models/Doctor');
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log('Database empty. Seeding fallback doctors...');
      const generateSlots = (baseSlots) => {
        const slots = [];
        for (let i = 0; i < 14; i++) {
          const date = new Date(Date.now() + i * 86400000);
          if (date.getDay() !== 0) { // Skip Sundays
            slots.push({
              date: date.toISOString().split('T')[0],
              slots: baseSlots
            });
          }
        }
        return slots;
      };
      const fallbackDoctors = [
        {
          name: 'Dr. Suranga Hettipathirana',
          specialty: 'Obstetrics & Gynaecology (VOG)',
          rating: 4.9,
          reviews: 324,
          experience: 20,
          hospital: 'Asiri Central Hospital',
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
          availableSlots: generateSlots(['09:00 AM', '10:00 AM', '02:30 PM', '03:00 PM'])
        },
        {
          name: 'Dr. Nalinda Rodrigo',
          specialty: 'Obstetrics & Gynaecology',
          rating: 4.8,
          reviews: 289,
          experience: 18,
          hospital: 'Lanka Hospitals',
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
          availableSlots: generateSlots(['09:00 AM', '03:00 PM', '04:30 PM'])
        },
        {
          name: 'Dr. D Maruthini',
          specialty: 'Fertility & IVF Specialist',
          rating: 4.9,
          reviews: 312,
          experience: 19,
          hospital: 'Nawaloka Hospital',
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
          availableSlots: generateSlots(['04:00 PM', '05:00 PM'])
        },
        {
          name: 'Prof. M Champika Gihan',
          specialty: 'Obstetrics & Gynaecology with Scanning',
          rating: 4.8,
          reviews: 312,
          experience: 22,
          hospital: 'Kandy General Hospital',
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
          availableSlots: generateSlots(['03:30 PM', '04:00 PM'])
        },
        {
          name: 'Prof. A.K. Probhodana Ranaweera',
          specialty: 'Obstetrics & Gynaecology (VOG)',
          rating: 4.9,
          reviews: 401,
          experience: 25,
          hospital: 'Durdans Hospital',
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
          availableSlots: generateSlots(['05:00 PM', '05:30 PM'])
        }
      ];
      await Doctor.insertMany(fallbackDoctors);
    }

    app.listen(PORT, () => {
      console.log(`OvaCare Booking API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
