const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'DM Sans', Arial, sans-serif; background: #0a0f1e; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 24px; font-weight: 700; color: #00d4ff; margin-bottom: 30px; }
    .card { background: #0d1526; border: 1px solid #1e3a5f; border-radius: 12px; padding: 30px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #00d4ff, #0066ff); color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; }
    h2 { color: #00d4ff; margin-top: 0; }
    p { line-height: 1.6; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ StockPulse</div>
    <div class="card">${content}</div>
    <div class="footer">© 2025 StockPulse. All rights reserved.</div>
  </div>
</body>
</html>`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'StockPulse <noreply@stockpulse.in>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: 'Welcome to StockPulse ⚡',
  html: baseTemplate(`
    <h2>Welcome, ${user.full_name}!</h2>
    <p>You've successfully joined StockPulse — your real-time stock intelligence platform.</p>
    <p>Start exploring live news from Indian and International markets right now.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
    <p>If you have any questions, just reply to this email.</p>
  `),
});

const sendVerificationEmail = (user, token) => sendEmail({
  to: user.email,
  subject: 'Verify your StockPulse email',
  html: baseTemplate(`
    <h2>Verify Your Email</h2>
    <p>Hi ${user.full_name}, please verify your email address to activate your account.</p>
    <a href="${process.env.CLIENT_URL}/verify-email?token=${token}" class="btn">Verify Email</a>
    <p>This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
  `),
});

const sendPasswordResetEmail = (user, token) => sendEmail({
  to: user.email,
  subject: 'Reset your StockPulse password',
  html: baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hi ${user.full_name}, we received a request to reset your password.</p>
    <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" class="btn">Reset Password</a>
    <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
  `),
});

const sendPaymentConfirmationEmail = (user, payment) => sendEmail({
  to: user.email,
  subject: `Payment Confirmed — StockPulse ${payment.plan} Plan`,
  html: baseTemplate(`
    <h2>Payment Confirmed ✅</h2>
    <p>Hi ${user.full_name}, your payment was successful!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px;color:#64748b;">Plan</td><td style="padding:8px;color:#e2e8f0;text-transform:capitalize;">${payment.plan}</td></tr>
      <tr><td style="padding:8px;color:#64748b;">Amount</td><td style="padding:8px;color:#e2e8f0;">${payment.currency} ${payment.amount}</td></tr>
      <tr><td style="padding:8px;color:#64748b;">Transaction ID</td><td style="padding:8px;color:#e2e8f0;">${payment.transaction_id}</td></tr>
      <tr><td style="padding:8px;color:#64748b;">Date</td><td style="padding:8px;color:#e2e8f0;">${new Date().toLocaleDateString()}</td></tr>
    </table>
    <a href="${process.env.CLIENT_URL}/dashboard/settings?tab=billing" class="btn">View Billing</a>
  `),
});

const sendRenewalReminderEmail = (user, plan, renewalDate) => sendEmail({
  to: user.email,
  subject: 'Your StockPulse subscription renews in 3 days',
  html: baseTemplate(`
    <h2>Renewal Reminder</h2>
    <p>Hi ${user.full_name}, your <strong style="color:#00d4ff;">${plan}</strong> plan renews on <strong style="color:#00d4ff;">${renewalDate}</strong>.</p>
    <p>Make sure your payment method is up to date to avoid any interruption.</p>
    <a href="${process.env.CLIENT_URL}/dashboard/settings?tab=billing" class="btn">Manage Billing</a>
  `),
});

const sendAdminAlert = (subject, message) => sendEmail({
  to: process.env.SMTP_USER,
  subject: `[StockPulse Admin] ${subject}`,
  html: baseTemplate(`<h2>${subject}</h2><p>${message}</p>`),
});

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendRenewalReminderEmail,
  sendAdminAlert,
};
