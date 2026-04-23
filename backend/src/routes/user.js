const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All routes require auth
router.use(authenticate);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, full_name: true, email: true, phone: true, country: true, avatar_url: true, role: true, verified: true, created_at: true, last_login: true },
  });
  res.json(user);
});

// PUT /api/user/profile
router.put('/profile', [
  body('full_name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { full_name, phone, country } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { full_name, phone, country },
    select: { id: true, full_name: true, email: true, phone: true, country: true, avatar_url: true },
  });
  res.json(updated);
});

// POST /api/user/avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'stockpulse/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
        (err, result) => err ? reject(err) : resolve(result)
      )(req.file.buffer);
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { avatar_url: result.secure_url } });
    res.json({ avatar_url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/user/change-password
router.post('/change-password', [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { current_password, new_password } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const password_hash = await bcrypt.hash(new_password, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password_hash } });
  res.json({ message: 'Password updated' });
});

// GET /api/user/subscription
router.get('/subscription', async (req, res) => {
  const sub = await prisma.subscription.findFirst({
    where: { user_id: req.user.id, status: 'active' },
    orderBy: { start_date: 'desc' },
  });
  res.json(sub || { plan: 'free', status: 'active' });
});

// GET /api/user/payments
router.get('/payments', async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { user_id: req.user.id },
    orderBy: { created_at: 'desc' },
  });
  res.json(payments);
});

// GET /api/user/watchlist
router.get('/watchlist', async (req, res) => {
  const watchlist = await prisma.watchlist.findMany({
    where: { user_id: req.user.id },
    orderBy: { added_at: 'desc' },
  });
  res.json(watchlist);
});

// POST /api/user/watchlist
router.post('/watchlist', [body('stock_symbol').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const item = await prisma.watchlist.upsert({
      where: { user_id_stock_symbol: { user_id: req.user.id, stock_symbol: req.body.stock_symbol.toUpperCase() } },
      update: {},
      create: { user_id: req.user.id, stock_symbol: req.body.stock_symbol.toUpperCase() },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/user/watchlist/:symbol
router.delete('/watchlist/:symbol', async (req, res) => {
  await prisma.watchlist.deleteMany({
    where: { user_id: req.user.id, stock_symbol: req.params.symbol.toUpperCase() },
  });
  res.json({ message: 'Removed from watchlist' });
});

// GET /api/user/alerts
router.get('/alerts', async (req, res) => {
  const alerts = await prisma.alert.findMany({
    where: { user_id: req.user.id },
    orderBy: { created_at: 'desc' },
  });
  res.json(alerts);
});

// POST /api/user/alerts
router.post('/alerts', [body('stock_symbol').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  if (req.plan === 'free') return res.status(403).json({ error: 'Upgrade to Pro to set alerts' });

  const count = await prisma.alert.count({ where: { user_id: req.user.id } });
  if (req.plan === 'pro' && count >= 10) return res.status(403).json({ error: 'Pro plan allows max 10 alerts' });

  const alert = await prisma.alert.create({
    data: { user_id: req.user.id, stock_symbol: req.body.stock_symbol.toUpperCase() },
  });
  res.json(alert);
});

// DELETE /api/user/alerts/:id
router.delete('/alerts/:id', async (req, res) => {
  await prisma.alert.deleteMany({ where: { id: req.params.id, user_id: req.user.id } });
  res.json({ message: 'Alert deleted' });
});

// PUT /api/user/alerts/:id/toggle
router.put('/alerts/:id/toggle', async (req, res) => {
  const alert = await prisma.alert.findFirst({ where: { id: req.params.id, user_id: req.user.id } });
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const updated = await prisma.alert.update({ where: { id: req.params.id }, data: { active: !alert.active } });
  res.json(updated);
});

// GET /api/user/sessions
router.get('/sessions', async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { user_id: req.user.id },
    select: { id: true, device_info: true, created_at: true, expires_at: true },
    orderBy: { created_at: 'desc' },
  });
  res.json(sessions);
});

module.exports = router;
