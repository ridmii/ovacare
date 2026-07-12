const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'ovacare-dev-secret-change-in-production';
const JWT_EXPIRES = '7d';

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, agreedToTerms } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (!agreedToTerms) {
      return res.status(400).json({ error: 'You must agree to the terms and privacy policy.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, agreedToTerms, provider: 'local' });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('[auth/signup]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.provider === 'google') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/google  — verify Google ID token from frontend
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    // Verify the Google token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({ error: 'Invalid Google token.' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create the user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user via Google
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        provider: 'google',
        agreedToTerms: true,
      });
    } else if (!user.googleId) {
      // Existing local user — link Google account
      user.googleId = googleId;
      user.provider = 'google';
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('[auth/google]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/google-access-token — for implicit flow (access_token from @react-oauth/google)
router.post('/google-access-token', async (req, res) => {
  try {
    const { access_token, name, email, sub: googleId, picture } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ error: 'Google user info is required.' });
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        provider: 'google',
        agreedToTerms: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.provider = 'google';
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('[auth/google-access-token]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me — verify token and return user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
