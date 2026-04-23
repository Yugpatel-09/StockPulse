const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { sendPaymentConfirmationEmail, sendAdminAlert } = require('../utils/email');

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  pro: { inr: 49900, usd: 999, name: 'Pro' },
  elite: { inr: 99900, usd: 1999, name: 'Elite' },
};

// POST /api/payment/create-order (Razorpay)
router.post('/create-order', authenticate, async (req, res) => {
  const { plan, gateway = 'razorpay' } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  try {
    if (gateway === 'razorpay') {
      const order = await razorpay.orders.create({
        amount: PLANS[plan].inr,
        currency: 'INR',
        receipt: `sp_${req.user.id}_${Date.now()}`,
        notes: { user_id: req.user.id, plan },
      });
      res.json({ order_id: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
    } else {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `StockPulse ${PLANS[plan].name} Plan` },
            unit_amount: PLANS[plan].usd,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
        metadata: { user_id: req.user.id, plan },
      });
      res.json({ session_id: session.id, url: session.url });
    }
  } catch (err) {
    console.error('Payment create error:', err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// POST /api/payment/verify (Razorpay)
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  try {
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        amount: PLANS[plan].inr / 100,
        currency: 'INR',
        gateway: 'razorpay',
        transaction_id: razorpay_payment_id,
        status: 'success',
      },
    });

    await prisma.subscription.updateMany({
      where: { user_id: req.user.id },
      data: { status: 'expired' },
    });

    await prisma.subscription.create({
      data: { user_id: req.user.id, plan, status: 'active', end_date: endDate, payment_id: payment.id },
    });

    await sendPaymentConfirmationEmail(req.user, { plan, currency: 'INR', amount: PLANS[plan].inr / 100, transaction_id: razorpay_payment_id });
    await sendAdminAlert('New Payment', `${req.user.email} paid for ${plan} plan — ₹${PLANS[plan].inr / 100}`);

    res.json({ message: 'Payment verified. Plan activated!', plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/payment/webhook (Stripe)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, plan } = session.metadata;

    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const payment = await prisma.payment.create({
      data: {
        user_id,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        gateway: 'stripe',
        transaction_id: session.payment_intent,
        status: 'success',
      },
    });

    await prisma.subscription.updateMany({ where: { user_id }, data: { status: 'expired' } });
    await prisma.subscription.create({
      data: { user_id, plan, status: 'active', end_date: endDate, payment_id: payment.id },
    });

    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (user) await sendPaymentConfirmationEmail(user, { plan, currency: session.currency.toUpperCase(), amount: session.amount_total / 100, transaction_id: session.payment_intent });
  }

  res.json({ received: true });
});

// GET /api/payment/invoice/:id
router.get('/invoice/:id', authenticate, async (req, res) => {
  const payment = await prisma.payment.findFirst({
    where: { id: req.params.id, user_id: req.user.id },
  });
  if (!payment) return res.status(404).json({ error: 'Invoice not found' });

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(24).fillColor('#00d4ff').text('StockPulse', 50, 50);
  doc.fontSize(10).fillColor('#666').text('Real-Time Stock Intelligence', 50, 80);
  doc.moveTo(50, 100).lineTo(550, 100).stroke('#333');

  doc.fontSize(18).fillColor('#333').text('INVOICE', 50, 120);
  doc.fontSize(10).fillColor('#666');
  doc.text(`Invoice ID: ${payment.id}`, 50, 150);
  doc.text(`Date: ${payment.created_at.toLocaleDateString()}`, 50, 165);
  doc.text(`Customer: ${req.user.full_name}`, 50, 180);
  doc.text(`Email: ${req.user.email}`, 50, 195);

  doc.moveTo(50, 220).lineTo(550, 220).stroke('#eee');
  doc.fontSize(12).fillColor('#333').text('Description', 50, 235);
  doc.text('Amount', 450, 235);
  doc.moveTo(50, 255).lineTo(550, 255).stroke('#eee');

  doc.fontSize(11).fillColor('#555');
  doc.text(`StockPulse ${payment.gateway} Plan`, 50, 270);
  doc.text(`${payment.currency} ${payment.amount}`, 450, 270);

  doc.moveTo(50, 295).lineTo(550, 295).stroke('#333');
  doc.fontSize(12).fillColor('#333').text('Total', 50, 310);
  doc.text(`${payment.currency} ${payment.amount}`, 450, 310);

  doc.fontSize(9).fillColor('#999').text('Thank you for subscribing to StockPulse!', 50, 400, { align: 'center' });
  doc.end();
});

module.exports = router;
