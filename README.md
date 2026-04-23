# ⚡ StockPulse — Real-Time Stock Intelligence Platform

A complete production-ready SaaS platform for live stock news covering Indian (NSE/BSE) and International (NYSE/NASDAQ) markets.
New update

---

## 🏗️ Project Structure

```
StockPulse/
├── frontend/          Next.js 14 app (landing + dashboard + admin)
├── backend/           Node.js + Express API
│   ├── prisma/        Database schema + seed
│   └── src/
│       ├── routes/    auth, news, user, payment, admin
│       ├── cron/      RSS fetcher (runs every 10 min)
│       ├── middleware/ auth, rate limiting
│       └── utils/     email, jwt, sentiment, stock tagger
└── .github/workflows/ CI/CD (Vercel + Render)
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd StockPulse/backend
npm install
cp .env.example .env
# Fill in your .env values

npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 2. Frontend Setup

```bash
cd StockPulse/frontend
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev
```

---

## 🔑 Default Admin Credentials

```
Email:    admin@stockpulse.in
Password: Admin@123456
URL:      http://localhost:3000/admin/login
```

---

## 🌐 Environment Variables

### Backend (.env)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase free tier) |
| `JWT_SECRET` | Random 64-char string |
| `JWT_REFRESH_SECRET` | Different random 64-char string |
| `CLIENT_URL` | Frontend URL (http://localhost:3000) |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password (not your real password) |
| `CLOUDINARY_*` | From cloudinary.com dashboard |
| `RAZORPAY_KEY_ID/SECRET` | From razorpay.com dashboard |
| `STRIPE_SECRET_KEY` | From stripe.com dashboard |
| `GOOGLE_CLIENT_ID/SECRET` | From Google Cloud Console |

### Frontend (.env.local)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key |

---

## 📡 RSS News Engine

The news engine runs automatically every 10 minutes via cron job:
- Fetches from 12 static RSS sources (Indian + International)
- Fetches Google News RSS for top 12 stocks
- Auto-tags: market, stock symbol, sentiment (bullish/bearish/neutral), sector
- Deduplicates articles by URL
- Cleans articles older than 7 days
- Emits Socket.io event when new articles arrive

---

## 💳 Payment Flow

**Razorpay (Indian users):**
1. `POST /api/payment/create-order` → get order_id
2. Open Razorpay checkout modal
3. `POST /api/payment/verify` → verify signature → activate plan

**Stripe (International users):**
1. `POST /api/payment/create-order?gateway=stripe` → get Stripe session URL
2. Redirect to Stripe checkout
3. Webhook at `POST /api/payment/webhook` → activate plan

---

## 🚀 Deployment

| Service | Platform | Cost |
|---|---|---|
| Frontend | Vercel | Free |
| Backend | Render.com | Free |
| Database | Supabase PostgreSQL | Free |
| Media | Cloudinary | Free |
| Email | Gmail SMTP | Free |

**Total monthly cost: ₹0**

---

## 📋 Subscription Plans

| Feature | Free | Pro (₹499) | Elite (₹999) |
|---|---|---|---|
| Articles/day | 5 | Unlimited | Unlimited |
| Indian markets | ✅ | ✅ | ✅ |
| International | ❌ | ✅ | ✅ |
| Custom alerts | ❌ | 10 | Unlimited |
| Sentiment tags | ❌ | ✅ | ✅ |
| AI summaries | ❌ | ❌ | ✅ |
| Export PDF/CSV | ❌ | ❌ | ✅ |

---

© 2025 StockPulse. All rights reserved.


New line after rebase