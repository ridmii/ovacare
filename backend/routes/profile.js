const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Booking = require('../models/Booking');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ovacare-dev-secret-change-in-production';

// ─── Auth middleware ────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Multer setup for avatar uploads ───────────────────────────────────────
const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.userId}_${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ─── GET /api/profile/me ────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/profile/me — update name, email, password ──────────────────
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, email, currentPassword, newPassword } = req.body;

    if (name && name.trim()) user.name = name.trim();

    if (email && email.trim() && email.trim() !== user.email) {
      const exists = await User.findOne({ email: email.trim().toLowerCase() });
      if (exists) return res.status(409).json({ error: 'Email is already in use.' });
      user.email = email.trim().toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new one.' });
      }
      const match = await user.comparePassword(currentPassword);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters.' });
      }
      user.password = newPassword; // hashed by pre-save hook
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error('[profile/me PATCH]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/profile/avatar ────────────────────────────────────────────────
router.post('/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete old uploaded avatar (not Google avatar URLs)
    if (user.profileImage) {
      const oldPath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const relativePath = `uploads/avatars/${req.file.filename}`;
    user.profileImage = relativePath;
    await user.save();

    res.json({ user, avatarUrl: `/${relativePath}` });
  } catch (err) {
    console.error('[profile/avatar]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /api/profile/avatar ──────────────────────────────────────────────
router.delete('/avatar', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove file from disk if it exists
    if (user.profileImage) {
      const filePath = path.join(__dirname, '..', user.profileImage);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fileErr) {
        console.error('[profile/avatar DELETE file error]', fileErr);
      }
      user.profileImage = undefined;
    }

    // Also clear the default/Google avatar if present
    user.avatar = undefined;
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error('[profile/avatar DELETE]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/profile/ultrasound-consent ──────────────────────────────────
router.patch('/ultrasound-consent', requireAuth, async (req, res) => {
  try {
    const { saveUltrasoundImages } = req.body;
    if (typeof saveUltrasoundImages !== 'boolean') {
      return res.status(400).json({ error: 'saveUltrasoundImages must be a boolean.' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { saveUltrasoundImages },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/profile/appointments ──────────────────────────────────────────
router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    let query;
    if (user && user.email) {
      const escapedEmail = user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexEmail = new RegExp('^' + escapedEmail + '$', 'i');
      query = { $or: [{ userId: req.userId }, { patientEmail: regexEmail }] };
    } else {
      query = { userId: req.userId };
    }

    const bookings = await Booking.find(query)
      .populate('doctorId', 'name specialty hospital location avatar availableSlots')
      .sort({ appointmentDate: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error('[profile/appointments]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
