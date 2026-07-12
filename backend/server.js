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
    await runLocalDataMigration();

    app.listen(PORT, () => {
      console.log(`OvaCare Booking API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
