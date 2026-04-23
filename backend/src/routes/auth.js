const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const {
  generateAccessToken, generateRefreshToken,
  saveRefreshToken, revokeRefreshToken, revokeAllUserTokens,
} = require('../utils/jwt');
const {
  sendWelcomeEmail, sendVerificationEmail,
  sendPasswordResetEmail, sendAdminAlert,
} = require('../utils/email');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/auth/signup
router.post('/signup', authLimiter, [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { full_name, email, password, phone, country } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const verify_token = uuidv4();

    const user = await prisma.user.create({
      data: {
        full_name, email, password_hash, phone, country, verify_token,
        subscriptions: { create: { plan: 'free', status: 'active' } },
      },
    });

    await sendVerificationEmail(user, verify_token);
    await sendWelcomeEmail(user);
    await sendAdminAlert('New User Signup', `${full_name} (${email}) just signed up.`);

    res.status(201).json({ message: 'Account created. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({ where: { verify_token: req.params.token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' });

    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verify_token: null },
    });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await prisma.user.update({ where: { id: user.id }, data: { last_login: new Date() } });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const deviceInfo = req.headers['user-agent'] || '';
    await saveRefreshToken(user.id, refreshToken, deviceInfo);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const session = await prisma.session.findUnique({ where: { refresh_token: token } });
    if (!session || session.expires_at < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) await revokeRefreshToken(token);
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    // Always return success to prevent email enumeration
    if (user) {
      const token = uuidv4();
      const expires = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { reset_token: token, reset_expires: expires },
      });
      await sendPasswordResetEmail(user, token);
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { reset_token: token, reset_expires: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const password_hash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash, reset_token: null, reset_expires: null },
    });
    await revokeAllUserTokens(user.id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout-all
router.post('/logout-all', authenticate, async (req, res) => {
  await revokeAllUserTokens(req.user.id);
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out from all devices' });
});

// POST /api/auth/google (Google OAuth — token exchange)
router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Google token required' });

  try {
    // Verify Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          full_name: payload.name,
          email: payload.email,
          avatar_url: payload.picture,
          verified: true,
          subscriptions: { create: { plan: 'free', status: 'active' } },
        },
      });
      await sendWelcomeEmail(user);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken, req.headers['user-agent'] || '');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, verified: user.verified, avatar_url: user.avatar_url },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

module.exports = router;
